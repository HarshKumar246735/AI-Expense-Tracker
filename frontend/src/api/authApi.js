import client from "./client";

export const register = (data) => client.post("/auth/register", data);
export const login = (data) => client.post("/auth/login", data);
export const logout = () => client.post("/auth/logout");
export const me = () => client.get("/auth/me");
