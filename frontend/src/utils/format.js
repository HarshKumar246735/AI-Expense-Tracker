export function formatCurrency(amount, currency = "INR") {
  try {
    return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(Number(amount) || 0);
  } catch {
    return `${currency} ${Number(amount || 0).toFixed(2)}`;
  }
}

export function formatCompact(amount, currency = "INR") {
  try {
    return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
      style: "currency",
      currency,
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(Number(amount) || 0);
  } catch {
    return String(amount);
  }
}

// Dates are stored as UTC midnight, so they are always displayed in UTC to avoid off-by-one days
export const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" })
    : "-";

export const toInputDate = (value) => (value ? new Date(value).toISOString().slice(0, 10) : "");

const pad = (n) => String(n).padStart(2, "0");
export const ymd = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`; // m is 1-12

export const todayInput = () => {
  const n = new Date();
  return ymd(n.getFullYear(), n.getMonth() + 1, n.getDate());
};

export const currentMonthInput = () => todayInput().slice(0, 7);

// "2026-10" -> { startDate: "2026-10-01", endDate: "2026-10-31" }
export function monthRange(monthValue) {
  const [y, m] = monthValue.split("-").map(Number);
  const last = new Date(y, m, 0).getDate();
  return { startDate: ymd(y, m, 1), endDate: ymd(y, m, last) };
}

export const yearRange = (year) => ({ startDate: ymd(year, 1, 1), endDate: ymd(year, 12, 31) });

// first day of the month, `n` months before this one
export function monthsAgoStart(n) {
  const d = new Date();
  const t = new Date(d.getFullYear(), d.getMonth() - n, 1);
  return ymd(t.getFullYear(), t.getMonth() + 1, 1);
}

export const monthLabel = (yyyyMm, long = false) => {
  const [y, m] = yyyyMm.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-IN", {
    month: long ? "long" : "short",
    year: long ? "numeric" : "2-digit",
    timeZone: "UTC",
  });
};

export const timeAgo = (value) => {
  const diff = Date.now() - new Date(value).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min} min ago`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.floor(hours / 24);
  return days < 30 ? `${days} d ago` : formatDate(value);
};

export const percentChange = (value) =>
  value === null || value === undefined ? null : `${value >= 0 ? "+" : ""}${value}%`;
