import axios from "axios";
import Cookies from "js-cookie";
import authService from "../services/authService";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`,
  timeout: 2800000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token");
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return error;
  }
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config;
    const status = error?.response?.status || 500;

    if (status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        Cookies.remove("token");
        const data = await authService.refreshToken();
        const { token: newToken, refreshToken } = data?.data || {};
        processQueue(null, newToken);
        if (newToken) {
          Cookies.set('token', newToken);
        }
        if (refreshToken) {
          Cookies.set('refreshToken', refreshToken);
        }
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        isRefreshing = false;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        window.location.replace("/trade/login");
        localStorage.clear();
        Cookies.remove("token");
        Cookies.remove("refreshToken");
        return Promise.reject(refreshError);
      }
    }

    if ([403, 500, 502].includes(status)) { }

    return Promise.reject(error?.response?.data || error);
  }
);

export default api;
