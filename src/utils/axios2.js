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
  },
);

networkApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status || 500;

    const exceptRoute = ["/login"];

    if (
      [401, 403, 500, 502].includes(status) &&
      !exceptRoute.includes(location.pathname)
    ) {
      window.location.replace("/login");
      localStorage.clear();
      Cookies.remove("token2");
    }
    return Promise.reject(error?.response?.data || error);
  },
);

export default networkApi;
