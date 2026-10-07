const { z } = require("zod");
const ApiError = require("../utils/ApiError");
const ttlCache = require("../utils/ttlCache");
const { getProvider, extractJson } = require("./ai");
const { parseText, classify } = require("./ai/ruleBasedParser");
const { getCategoryNames } = require("./categoryService");
const { gatherFacts, ruleInsights, ruleSuggestions } = require("./insightsService");
const { PAYMENT_METHODS } = require("../constants");
const { round2 } = require("../utils/money");

const DISCLAIMER =
  "General budgeting guidance based on your own transaction data. It is not professional financial advice.";
const CACHE_TTL_MS = 5 * 60 * 1000;
const NO_AMOUNT_MESSAGE =
  'I couldn\'t find an amount in that text. Try something like "Spent 500 on dinner yesterday".';

const todayISO = () => new Date().toISOString().slice(0, 10);

const aiTransactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.coerce.number().positive(),
  category: z.string().min(1),
  description: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  paymentMethod: z.string().nullable().optional(),
});
const aiListSchema = z
  .array(
    z.object({
      title: z.string().min(1).max(80),
      text: z.string().min(1).max(320),
      tone: z.enum(["positive", "neutral", "warning"]).default("neutral"),
    })
  )
  .min(1)
  .max(6);

function matchCategory(names, type, candidate) {
  const list = names[type] || [];
  return (
    list.find((n) => n.toLowerCase() === String(candidate).toLowerCase()) ||
    list.find((n) => n.toLowerCase() === "other") ||
    list[0] ||
    "Other"
  );
}

const matchPayment = (value) =>
  PAYMENT_METHODS.find((p) => p.toLowerCase() === String(value || "").toLowerCase()) || null;

function safeDate(value) {
  const d = new Date(`${value}T00:00:00Z`);
  const fiveYears = 5 * 365 * 24 * 60 * 60 * 1000;
  return Number.isNaN(d.getTime()) || Math.abs(d.getTime() - Date.now()) > fiveYears ? todayISO() : value;
}

// ---------- 1. natural language -> transaction ----------
async function parseTransaction(user, text) {
  const names = await getCategoryNames(user._id);
  const provider = getProvider();

  if (provider) {
    try {
      const system = [
        "You extract ONE financial transaction from the user's text.",
        "Respond with ONLY a JSON object, no prose and no code fences:",
        '{"type":"income"|"expense","amount":number,"category":string,"description":string,"date":"YYYY-MM-DD","paymentMethod":string|null}',
        `Today's date is ${todayISO()}. Resolve relative dates such as "yesterday" or "2 days ago" to an absolute date.`,
        `Allowed expense categories: ${names.expense.join(", ")}.`,
        `Allowed income categories: ${names.income.join(", ")}.`,
        "category must be exactly one of the allowed categories for the chosen type.",
        `paymentMethod must be one of ${PAYMENT_METHODS.join(", ")} or null if not mentioned.`,
        "description is a short title-cased label such as \"Dinner\" (max 6 words), without the amount.",
        'If the text contains no amount, respond with {"error":"no_amount"}.',
      ].join("\n");
      const raw = await provider.complete({ system, prompt: `Text: """${text}"""`, maxTokens: 300 });
      const json = extractJson(raw);
      if (json && json.error === "no_amount") throw new ApiError(422, NO_AMOUNT_MESSAGE);

      const p = aiTransactionSchema.parse(json);
      return {
        source: "ai",
        transaction: {
          type: p.type,
          amount: round2(p.amount),
          category: matchCategory(names, p.type, p.category),
          description: p.description.trim().slice(0, 200),
          date: safeDate(p.date),
          paymentMethod: matchPayment(p.paymentMethod),
        },
      };
    } catch (err) {
      if (err instanceof ApiError) throw err;
      console.warn("AI parse failed, using rule-based parser:", err.message);
    }
  }

  const parsed = parseText(text, names);
  if (!parsed) throw new ApiError(422, NO_AMOUNT_MESSAGE);
  return { source: "rules", transaction: { ...parsed, amount: round2(parsed.amount) } };
}

// ---------- 2. automatic categorization ----------
async function categorizeText(user, text) {
  const names = await getCategoryNames(user._id);
  const provider = getProvider();

  if (provider) {
    try {
      const system = [
        "Classify the user's expense or income description.",
        'Respond with ONLY JSON: {"type":"income"|"expense","category":string}',
        `Allowed expense categories: ${names.expense.join(", ")}.`,
        `Allowed income categories: ${names.income.join(", ")}.`,
        "category must be exactly one of the allowed categories for the chosen type.",
      ].join("\n");
      const raw = await provider.complete({ system, prompt: `Description: """${text}"""`, maxTokens: 60 });
      const json = z
        .object({ type: z.enum(["income", "expense"]), category: z.string().min(1) })
        .parse(extractJson(raw));
      return { source: "ai", type: json.type, category: matchCategory(names, json.type, json.category) };
    } catch (err) {
      console.warn("AI categorize failed, using rules:", err.message);
    }
  }
  return { source: "rules", ...classify(text, names) };
}

// ---------- 3 & 4. insights and saving suggestions ----------
async function generateList(user, { kind, refresh }) {
  const cacheKey = `ai:${kind}:${user._id}`;
  if (!refresh) {
    const cached = ttlCache.get(cacheKey);
    if (cached) return cached;
  }

  const facts = await gatherFacts(user);
  const fallback = () => (kind === "insights" ? ruleInsights(facts) : ruleSuggestions(facts));
  let items = null;
  let generatedBy = "rules";

  if (!facts.hasEnoughData) {
    items = [
      {
        title: "Not enough data yet",
        text: "Add a few more transactions and your personalised insights will appear here.",
        tone: "neutral",
      },
    ];
  } else {
    const provider = getProvider();
    if (provider) {
      try {
        const task =
          kind === "insights"
            ? "Write at most 5 short insights about the user's spending (highest category, changes, unusual spending, savings rate)."
            : "Write at most 4 practical budgeting suggestions to reduce spending or improve savings. Tie each one to a specific fact.";
        const system = [
          "You are a careful personal-finance assistant inside an expense tracker.",
          "You receive FACTS as JSON, computed from the user's own transactions.",
          task,
          "Use ONLY names and numbers that appear in FACTS. Never invent or recalculate figures.",
          "Do not give investment, tax, legal or credit advice and do not recommend financial products.",
          "Never suggest skipping essential bills, borrowing money or other risky actions.",
          `Amounts are in ${facts.currency}.`,
          'Respond with ONLY a JSON array: [{"title": string (max 6 words), "text": string (max 30 words), "tone": "positive"|"neutral"|"warning"}]',
        ].join("\n");
        const raw = await provider.complete({ system, prompt: `FACTS:\n${JSON.stringify(facts)}`, maxTokens: 700 });
        items = aiListSchema.parse(extractJson(raw));
        generatedBy = "ai";
      } catch (err) {
        console.warn(`AI ${kind} failed, using rules:`, err.message);
      }
    }
    if (!items) items = fallback();
  }

  const result = {
    items,
    generatedBy,
    aiGenerated: generatedBy === "ai",
    month: facts.month,
    disclaimer: DISCLAIMER,
  };
  ttlCache.set(cacheKey, result, CACHE_TTL_MS);
  return result;
}

const insights = (user, refresh = false) => generateList(user, { kind: "insights", refresh });
const suggestions = (user, refresh = false) => generateList(user, { kind: "suggestions", refresh });

module.exports = { parseTransaction, categorizeText, insights, suggestions };
