import client from "./client";

export const list = (params) => client.get("/transactions", { params });
export const get = (id) => client.get(`/transactions/${id}`);
export const create = (data) => client.post("/transactions", data);
export const update = (id, data) => client.put(`/transactions/${id}`, data);
export const remove = (id) => client.delete(`/transactions/${id}`);
