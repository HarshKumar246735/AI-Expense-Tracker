import client from "./client";

export const list = (params) => client.get("/recurring", { params });
export const create = (data) => client.post("/recurring", data);
export const update = (id, data) => client.put(`/recurring/${id}`, data);
export const remove = (id) => client.delete(`/recurring/${id}`);
