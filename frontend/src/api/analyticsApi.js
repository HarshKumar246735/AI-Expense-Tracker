import client from "./client";

export const summary = (params) => client.get("/analytics/summary", { params });
export const monthly = (params) => client.get("/analytics/monthly", { params });
export const categories = (params) => client.get("/analytics/categories", { params });
export const daily = (params) => client.get("/analytics/daily", { params });
export const paymentMethods = (params) => client.get("/analytics/payment-methods", { params });
