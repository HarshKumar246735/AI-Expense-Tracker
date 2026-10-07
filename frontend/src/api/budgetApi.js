import client from "./client";

export const list = (params) => client.get("/budgets", { params });
export const create = (data) => client.post("/budgets", data);
export const update = (id, data) => client.put(`/budgets/${id}`, data);
export const remove = (id) => client.delete(`/budgets/${id}`);
