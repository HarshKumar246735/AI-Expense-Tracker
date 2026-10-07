const config = require("../../config/env");
const claudeProvider = require("./claudeProvider");

// Returns the active AI provider, or null when no API key is configured
// (the app then falls back to built-in rule-based logic).
function getProvider() {
  if (!config.aiApiKey) return null;
  return claudeProvider;
}

// Pulls a JSON object/array out of a model reply (handles ```json fences and extra prose)
function extractJson(raw) {
  if (!raw) return null;
  const text = String(raw).replace(/```json|```/gi, "").trim();
  try {
    return JSON.parse(text);
  } catch {
    const firstObj = text.indexOf("{");
    const firstArr = text.indexOf("[");
    const candidates = [firstObj, firstArr].filter((i) => i >= 0);
    if (!candidates.length) return null;
    const startIdx = Math.min(...candidates);
    const close = text[startIdx] === "[" ? "]" : "}";
    const endIdx = text.lastIndexOf(close);
    if (endIdx <= startIdx) return null;
    try {
      return JSON.parse(text.slice(startIdx, endIdx + 1));
    } catch {
      return null;
    }
  }
}

module.exports = { getProvider, extractJson };
