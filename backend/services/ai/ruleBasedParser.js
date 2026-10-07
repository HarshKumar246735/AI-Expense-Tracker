// Simple, dependency-free parser used when no AI key is configured (or the AI call fails).
const KEYWORDS = {
  Food: ["pizza", "burger", "lunch", "dinner", "breakfast", "coffee", "tea", "restaurant", "cafe", "grocery", "groceries", "supermarket", "snack", "snacks", "swiggy", "zomato", "food", "biryani", "meal", "juice", "bakery", "milk", "vegetables", "fruits"],
  Shopping: ["shirt", "shoes", "amazon", "flipkart", "mall", "clothes", "jeans", "dress", "shopping", "myntra", "watch", "bag", "gadget", "headphones"],
  Transport: ["uber", "ola", "taxi", "cab", "bus", "train", "metro", "petrol", "diesel", "fuel", "auto", "rickshaw", "parking", "toll", "rapido"],
  Rent: ["rent", "landlord"],
  Bills: ["electricity", "water bill", "wifi", "internet", "recharge", "bill", "broadband", "gas", "insurance", "emi", "postpaid"],
  Health: ["doctor", "medicine", "medicines", "pharmacy", "hospital", "gym", "dentist", "clinic", "checkup"],
  Education: ["course", "tuition", "books", "book", "school", "college", "fees", "exam", "udemy", "coaching"],
  Entertainment: ["movie", "netflix", "spotify", "game", "concert", "prime", "hotstar", "party", "cinema", "youtube", "outing"],
  Travel: ["flight", "hotel", "trip", "vacation", "holiday", "airbnb", "resort", "visa", "booking"],
  Salary: ["salary", "paycheck", "payroll"],
  Freelance: ["freelance", "client", "gig"],
  Business: ["business", "sales", "customer"],
  Investment: ["dividend", "interest", "stocks", "mutual fund", "investment", "returns"],
  Gift: ["gift", "gifted"],
};

const RULES = Object.entries(KEYWORDS).map(([category, words]) => ({
  category,
  regex: new RegExp(`\\b(?:${words.join("|")})\\b`, "i"),
}));

const INCOME_RE = /\b(salary|received|earned|got paid|paid me|credited|bonus|refund|dividend|freelance|income|payout|deposited|cashback)\b/i;
const SPEND_RE = /\b(spent|bought|purchased|ordered)\b/i;

function classify(text, names) {
  const type = INCOME_RE.test(text) && !SPEND_RE.test(text) ? "income" : "expense";
  const available = names[type] || [];
  let category = null;
  for (const rule of RULES) {
    if (rule.regex.test(text)) {
      const match = available.find((n) => n.toLowerCase() === rule.category.toLowerCase());
      if (match) {
        category = match;
        break;
      }
    }
  }
  if (!category) category = available.find((n) => n.toLowerCase() === "other") || available[0] || "Other";
  return { type, category };
}

function extractDate(text, now) {
  const base = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const iso = (offsetDays) => new Date(base - offsetDays * 86400000).toISOString().slice(0, 10);
  const patterns = [
    [/\b(\d{4}-\d{2}-\d{2})\b/, (m) => m[1]],
    [/\bday before yesterday\b/i, () => iso(2)],
    [/\byesterday\b/i, () => iso(1)],
    [/\b(\d{1,3})\s+days?\s+ago\b/i, (m) => iso(Number(m[1]))],
    [/\blast week\b/i, () => iso(7)],
    [/\b(today|tonight|this morning|this evening)\b/i, () => iso(0)],
  ];
  for (const [regex, resolve] of patterns) {
    const m = text.match(regex);
    if (m) return { date: resolve(m), rest: text.replace(m[0], " ") };
  }
  return { date: iso(0), rest: text };
}

function extractAmount(text) {
  const withCurrency = text.match(/(?:₹|rs\.?|inr|\$|usd|€|£)\s*(\d[\d,]*(?:\.\d+)?)\s*(k|lakhs?)?/i);
  const plain = text.match(/(\d[\d,]*(?:\.\d+)?)\s*(k|lakhs?)?(?![\d\w])/i);
  const m = withCurrency || plain;
  if (!m) return null;
  let value = Number(m[1].replace(/,/g, ""));
  const unit = (m[2] || "").toLowerCase();
  if (unit === "k") value *= 1000;
  if (unit.startsWith("lakh")) value *= 100000;
  return Number.isFinite(value) && value > 0 ? { value, raw: m[0] } : null;
}

function detectPaymentMethod(text) {
  if (/\b(upi|gpay|google pay|phonepe|paytm)\b/i.test(text)) return "UPI";
  if (/\bcredit card\b/i.test(text)) return "Credit Card";
  if (/\bdebit card\b/i.test(text)) return "Debit Card";
  if (/\bnet ?banking\b/i.test(text)) return "Net Banking";
  if (/\b(bank transfer|neft|imps|rtgs)\b/i.test(text)) return "Bank Transfer";
  if (/\bcash\b/i.test(text)) return "Cash";
  return null;
}

function cleanDescription(text, fallback) {
  let d = text
    .replace(/₹|\$|€|£|\brs\.?(?=\s|$)|\binr\b|\brupees?\b/gi, " ")
    .replace(/\b(i|we)\s+(have\s+)?(spent|paid|bought|got|received|earned|purchased|ordered)\b/gi, " ")
    .replace(/^\s*(spent|paid|bought|got|received|earned|purchased|ordered)\b/i, " ")
    .replace(/[.,!?]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  for (let i = 0; i < 2; i += 1) {
    d = d.replace(/^(on|for|at|from|of|to|in|a|an|the)\b\s*/i, "").replace(/\s*\b(on|for|at|from|of|to|in)$/i, "").trim();
  }
  if (!d) d = fallback;
  return (d.charAt(0).toUpperCase() + d.slice(1)).slice(0, 200);
}

// Returns { type, amount, category, description, date, paymentMethod } or null when no amount is found
function parseText(text, names, now = new Date()) {
  const { date, rest } = extractDate(text, now);
  const amount = extractAmount(rest);
  if (!amount) return null;

  const withoutAmount = rest.replace(amount.raw, " ");
  const { type, category } = classify(text, names);
  return {
    type,
    amount: amount.value,
    category,
    description: cleanDescription(withoutAmount, category),
    date,
    paymentMethod: detectPaymentMethod(text),
  };
}

module.exports = { parseText, classify };
