import api from "../utils/axios";
import networkApi from "../utils/axios2";

const authService = {
  loginTrade: async (credentials) => {
    const response = await api.post(`/trade/admin/signIn`, credentials);
    return response?.data;
  },
  loginNetwork: async (credentials) => {
    const response = await networkApi.post(`/admin/signin`, credentials);
    return response?.data;
  },
};

export default authService;
