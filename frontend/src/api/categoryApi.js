import client from "./client";

export const list = () => client.get("/categories");
export const create = (data) => client.post("/categories", data);
export const update = (id, data) => client.put(`/categories/${id}`, data);
export const remove = (id) => client.delete(`/categories/${id}`);
