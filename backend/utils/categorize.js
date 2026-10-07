const CATEGORIES = ["Food", "Travel", "Bills", "Shopping", "Health", "Entertainment", "Other"];

// Simple fallback used when there is no API key or the AI call fails
function keywordCategorize(text) {
  const t = text.toLowerCase();
  const rules = {
    Food: ["pizza", "lunch", "dinner", "coffee", "restaurant", "grocery", "snack", "food"],
    Travel: ["uber", "ola", "taxi", "bus", "train", "flight", "petrol", "fuel", "metro"],
    Bills: ["electricity", "water", "rent", "wifi", "recharge", "bill", "internet"],
    Shopping: ["shirt", "shoes", "amazon", "flipkart", "mall", "clothes"],
    Health: ["doctor", "medicine", "pharmacy", "hospital", "gym"],
    Entertainment: ["movie", "netflix", "game", "concert", "spotify"],
  };
  for (const [category, words] of Object.entries(rules)) {
    if (words.some((w) => t.includes(w))) return category;
  }
  return "Other";
}

async function categorize(description) {
  if (!process.env.ANTHROPIC_API_KEY) return keywordCategorize(description);

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 20,
        messages: [
          {
            role: "user",
            content: `Categorize this expense into exactly one of: ${CATEGORIES.join(
              ", "
            )}. Reply with only the category name.\n\nExpense: ${description}`,
          },
        ],
      }),
    });

    const data = await res.json();
    const answer = data?.content?.[0]?.text?.trim();
    return CATEGORIES.includes(answer) ? answer : keywordCategorize(description);
  } catch (err) {
    console.error("AI categorize failed:", err.message);
    return keywordCategorize(description);
  }
}

module.exports = categorize;
