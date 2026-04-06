import axios from "axios";
import Cookies from "js-cookie";
// import authService from "../services/authService";

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
  },
);
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status || 500;

    if ([401, 403, 500, 502].includes(status)) {
      window.location.replace("/login");
      localStorage.clear();
      Cookies.remove("token");
    }
    return Promise.reject(error?.response?.data || error);
  },
);

export default api;
