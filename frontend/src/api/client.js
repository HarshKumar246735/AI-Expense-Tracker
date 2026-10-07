import axios from "axios";

const client = axios.create({
  baseURL: "/api",
  withCredentials: true,
  timeout: 30000,
});

let unauthorizedHandler = null;
export const setUnauthorizedHandler = (fn) => {
  unauthorizedHandler = fn;
};

// Success: return the API envelope ({ success, message, data }). Blob downloads pass through untouched.
client.interceptors.response.use(
  (res) => (res.config.responseType === "blob" ? res : res.data),
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";
    const isAuthCall = /\/auth\/(login|register|me)/.test(url);
    if (status === 401 && !isAuthCall && unauthorizedHandler) unauthorizedHandler();
    return Promise.reject(error);
  }
);

export default client;
