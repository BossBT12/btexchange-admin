import axios from "axios";
import Cookies from "js-cookie";

const networkApi = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL2}/api`,
  timeout: 2800000,
  headers: {
    "Content-Type": "application/json",
  },
});

networkApi.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token2");
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

networkApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config;
    const status = error?.response?.status || 500;

    const exaptRoute = ['/network/login'];

    if (status === 401 && !originalRequest._retry && !exaptRoute.includes(location.pathname)) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return networkApi(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        Cookies.remove("token2");
        // Note: Second game may not have refresh token endpoint, handle accordingly
        // For now, redirect to login2 if refresh fails
        const refreshToken = Cookies.get("refreshToken2");
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }
        // If second game has refresh endpoint, implement it here
        // For now, redirect to login2
        throw new Error("Token refresh not implemented for second game");
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        window.location.replace("/network/login");
        Cookies.remove("token2");
        Cookies.remove("refreshToken2");
        return Promise.reject(refreshError);
      }
    }

    if ([403, 500, 502].includes(status)) { }

    return Promise.reject(error?.response?.data || error);
  }
);

export default networkApi;
