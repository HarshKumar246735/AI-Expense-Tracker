const PDFDocument = require("pdfkit");
const Transaction = require("../models/Transaction");
const analytics = require("./analyticsService");
const { monthRange, rangeFromQuery, MONTH_NAMES, toISODate } = require("../utils/dates");
const { formatPlain, round1, round2 } = require("../utils/money");

const MAX_ROWS = 5000;

function range(q, fallback) {
  return rangeFromQuery({ startDate: q.startDate, endDate: q.endDate }, fallback);
}

const periodLabel = (r) => {
  const end = new Date(Math.min(r.end.getTime() - 1, Date.now() + 86400000));
  return `${toISODate(r.start)} to ${toISODate(end)}`;
};

async function transactionReport(user, r, { title, type }) {
  const match = { userId: user._id, date: { $gte: r.start, $lt: r.end } };
  if (type) match.type = type;
  const txs = await Transaction.find(match).sort({ date: 1, createdAt: 1 }).limit(MAX_ROWS).lean();

  const income = round2(txs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0));
  const expenses = round2(txs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0));

  const summary = [];
  if (type !== "expense") summary.push({ label: "Total income", value: income, format: "money" });
  if (type !== "income") summary.push({ label: "Total expenses", value: expenses, format: "money" });
  if (!type) summary.push({ label: "Net savings", value: round2(income - expenses), format: "money" });
  summary.push({ label: "Transactions", value: txs.length, format: "number" });

  return {
    title,
    subtitle: periodLabel(r),
    summary,
    columns: [
      { key: "date", label: "Date", format: "date", weight: 1.1 },
      { key: "description", label: "Description", format: "text", weight: 2.2 },
      { key: "category", label: "Category", format: "text", weight: 1.3 },
      { key: "type", label: "Type", format: "text", weight: 0.9 },
      { key: "paymentMethod", label: "Payment", format: "text", weight: 1.3 },
      { key: "amount", label: "Amount", format: "money", weight: 1.4, align: "right" },
    ],
    rows: txs.map((t) => ({
      date: toISODate(t.date),
      description: t.description,
      category: t.category,
      type: t.type,
      paymentMethod: t.paymentMethod,
      amount: t.amount,
    })),
    truncated: txs.length >= MAX_ROWS,
  };
}

async function buildReport(user, q) {
  const now = new Date();
  const year = q.year || now.getUTCFullYear();

  switch (q.type) {
    case "monthly": {
      const month = q.month || now.getUTCMonth() + 1;
      return transactionReport(user, monthRange(year, month), {
        title: `Monthly Report - ${MONTH_NAMES[month - 1]} ${year}`,
      });
    }
    case "yearly": {
      const r = { start: new Date(Date.UTC(year, 0, 1)), end: new Date(Date.UTC(year + 1, 0, 1)) };
      const months = await analytics.monthlyTotals(user._id, r);
      const income = round2(months.reduce((s, m) => s + m.income, 0));
      const expenses = round2(months.reduce((s, m) => s + m.expenses, 0));
      return {
        title: `Yearly Report - ${year}`,
        subtitle: periodLabel(r),
        summary: [
          { label: "Total income", value: income, format: "money" },
          { label: "Total expenses", value: expenses, format: "money" },
          { label: "Net savings", value: round2(income - expenses), format: "money" },
        ],
        columns: [
          { key: "month", label: "Month", format: "text", weight: 1.5 },
          { key: "income", label: "Income", format: "money", weight: 1.5, align: "right" },
          { key: "expenses", label: "Expenses", format: "money", weight: 1.5, align: "right" },
          { key: "savings", label: "Savings", format: "money", weight: 1.5, align: "right" },
        ],
        rows: months.map((m) => ({
          month: `${MONTH_NAMES[Number(m.month.slice(5)) - 1]} ${m.month.slice(0, 4)}`,
          income: m.income,
          expenses: m.expenses,
          savings: m.savings,
        })),
      };
    }
    case "category": {
      const r = range(q, { start: new Date(Date.UTC(year, 0, 1)), end: new Date(Date.UTC(year + 1, 0, 1)) });
      const [expense, income] = await Promise.all([
        analytics.byCategory(user._id, r, "expense"),
        analytics.byCategory(user._id, r, "income"),
      ]);
      const rows = [
        ...expense.map((c) => ({ category: c.category, type: "expense", count: c.count, total: c.total, percent: c.percent })),
        ...income.map((c) => ({ category: c.category, type: "income", count: c.count, total: c.total, percent: c.percent })),
      ];
      return {
        title: "Category Report",
        subtitle: periodLabel(r),
        summary: [
          { label: "Expense categories", value: expense.length, format: "number" },
          { label: "Income categories", value: income.length, format: "number" },
        ],
        columns: [
          { key: "category", label: "Category", format: "text", weight: 2 },
          { key: "type", label: "Type", format: "text", weight: 1 },
          { key: "count", label: "Transactions", format: "number", weight: 1.2, align: "right" },
          { key: "total", label: "Total", format: "money", weight: 1.5, align: "right" },
          { key: "percent", label: "% of type", format: "percent", weight: 1.1, align: "right" },
        ],
        rows,
      };
    }
    case "income":
    case "expense": {
      const r = range(q, { start: new Date(Date.UTC(year, 0, 1)), end: new Date(Date.UTC(year + 1, 0, 1)) });
      return transactionReport(user, r, {
        title: q.type === "income" ? "Income Report" : "Expense Report",
        type: q.type,
      });
    }
    default:
      throw new Error("Unknown report type");
  }
}

// ---------- CSV ----------
function csvCell(v) {
  if (v === null || v === undefined) return "";
  let s = String(v);
  // guard against spreadsheet formula injection (text only, numbers are safe)
  if (typeof v === "string" && /^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function toCsv(report) {
  const header = report.columns.map((c) => csvCell(c.label)).join(",");
  const lines = report.rows.map((row) => report.columns.map((c) => csvCell(row[c.key])).join(","));
  return `\uFEFF${[header, ...lines].join("\r\n")}\r\n`;
}

// ---------- PDF ----------
function displayValue(value, format, currency) {
  if (value === null || value === undefined) return "";
  if (format === "money") return formatPlain(value, currency);
  if (format === "percent") return `${round1(value)}%`;
  if (format === "number") return String(value);
  return String(value);
}

function writePdf(report, currency, res) {
  const doc = new PDFDocument({ margin: 40, size: "A4" });
  doc.pipe(res);

  const left = 40;
  const width = doc.page.width - 80;
  const totalWeight = report.columns.reduce((s, c) => s + c.weight, 0);
  const cols = [];
  let x = left;
  report.columns.forEach((c) => {
    const w = (c.weight / totalWeight) * width;
    cols.push({ ...c, x, w });
    x += w;
  });

  const drawHeader = (y) => {
    doc.rect(left, y, width, 20).fill("#3b5bdb");
    doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(9);
    cols.forEach((c) =>
      doc.text(c.label, c.x + 4, y + 6, { width: c.w - 8, align: c.align || "left", lineBreak: false })
    );
    doc.fillColor("#000000");
    return y + 24;
  };

  doc.font("Helvetica-Bold").fontSize(20).fillColor("#1c2333").text(report.title);
  doc.font("Helvetica").fontSize(10).fillColor("#6b7385").text(report.subtitle).moveDown(0.8);

  doc.fontSize(11).fillColor("#1c2333");
  report.summary.forEach((s) => {
    doc.font("Helvetica-Bold").text(`${s.label}: `, { continued: true });
    doc.font("Helvetica").text(displayValue(s.value, s.format, currency));
  });
  doc.moveDown(0.8);

  let y = drawHeader(doc.y);
  doc.font("Helvetica").fontSize(9);

  report.rows.forEach((row, i) => {
    if (y > doc.page.height - 70) {
      doc.addPage();
      y = drawHeader(40);
      doc.font("Helvetica").fontSize(9);
    }
    if (i % 2 === 0) doc.rect(left, y - 3, width, 18).fill("#f4f6fb");
    doc.fillColor("#1c2333");
    cols.forEach((c) =>
      doc.text(displayValue(row[c.key], c.format, currency), c.x + 4, y, {
        width: c.w - 8,
        height: 12,
        ellipsis: true,
        lineBreak: false,
        align: c.align || "left",
      })
    );
    y += 18;
  });

  if (!report.rows.length) doc.fillColor("#6b7385").text("No data for this period.", left, y + 6);
  doc.fontSize(8).fillColor("#868e96").text(`Generated on ${new Date().toISOString().slice(0, 10)}`, left, doc.page.height - 50, {
    lineBreak: false,
  });
  doc.end();
}

const fileSlug = (title) => title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

module.exports = { buildReport, toCsv, writePdf, fileSlug };
