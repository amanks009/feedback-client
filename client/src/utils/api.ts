import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;


export const getToken = () => typeof window !== "undefined" ? localStorage.getItem("token") : null;
export const setToken = (token: string) => localStorage.setItem("token", token);
export const clearToken = () => localStorage.removeItem("token");

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      clearToken();
      if (typeof window !== "undefined" && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;