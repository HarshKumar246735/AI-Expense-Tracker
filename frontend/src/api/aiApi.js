import client from "./client";

export const parseExpense = (text) => client.post("/ai/parse-expense", { text });
export const categorize = (text) => client.post("/ai/categorize", { text });
export const insights = (refresh = false) => client.post("/ai/insights", { refresh });
export const suggestions = (refresh = false) => client.post("/ai/suggestions", { refresh });
