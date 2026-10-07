const config = require("../../config/env");

// Provider contract: { name, complete({ system, prompt, maxTokens }) => Promise<string> }
// To use another AI vendor, add a file with the same shape and return it from ./index.js
const claudeProvider = {
  name: "claude",
  async complete({ system, prompt, maxTokens = 600 }) {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": config.aiApiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: config.aiModel,
        max_tokens: maxTokens,
        system,
        messages: [{ role: "user", content: prompt }],
      }),
      signal: AbortSignal.timeout(20000),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`AI provider returned ${res.status} ${body.slice(0, 200)}`);
    }
    const data = await res.json();
    return (data.content || [])
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("");
  },
};

module.exports = claudeProvider;
