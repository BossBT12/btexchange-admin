import api from "../utils/axios";

const BASE_URL = '/trade/admin';

const tradeService = {
  getDashboard: async () => {
    const response = await api.get(`${BASE_URL}/dashboard`);
    return response.data;
  },
  // User Management
  getUsers: async (params = {}) => {
    const response = await api.get(`${BASE_URL}/users`, { params });
    return response.data;
  },

  getUserDetails: async (params) => {
    const response = await api.get(`${BASE_URL}/users/details`, { params });
    return response.data;
  },

  updateUserStatus: async (userId, status) => {
    const response = await api.patch(`${BASE_URL}/users/${userId}/status`, status);
    return response.data;
  },

  // History & Logs Management
  getTradesHistory: async (params = {}) => {
    const response = await api.get(`${BASE_URL}/trades`, { params });
    return response.data;
  },

  getIncomeHistory: async (params = {}) => {
    const response = await api.get(`${BASE_URL}/income/history`, { params });
    return response.data;
  },

  getDepositsHistory: async (params = {}) => {
    const response = await api.get(`${BASE_URL}/deposits/history`, { params });
    return response.data;
  },

  getWithdrawalsHistory: async (params = {}) => {
    const response = await api.get(`${BASE_URL}/withdrawals/history`, { params });
    return response.data;
  },
  getAddressBalance: async (address, chain) => {
    const response = await api.get(`${BASE_URL}/address/balance`, {
      params: { address, chain }
    });
    return response.data;
  },

  // Get all deposit balances for a specific chain
  getChainBalances: async (chain) => {
    const response = await api.get(`${BASE_URL}/funds/chain/balances`, {
      params: { chain }
    });
    return response.data;
  },

  // Sweep funds from a single address
  sweepAddress: async (address, chain, toAddress) => {
    const response = await api.post(`${BASE_URL}/sweep/address`, {
      address,
      chain,
      toAddress
    });
    return response.data;
  },

  // Sweep all funds from a chain
  sweepAllFunds: async (chain, toAddress) => {
    const response = await api.post(`${BASE_URL}/sweep/all`, {
      chain,
      toAddress
    });
    return response.data;
  },

  // Check if an address can be swept
  checkSweepEligibility: async (address, chain) => {
    const response = await api.get(`${BASE_URL}/check/sweep`, {
      params: { address, chain }
    });
    return response.data;
  },
  createTradeData: async (payload) => {
    const response = await api.post(`${BASE_URL}/trade-data`, payload);
    return response.data;
  },
  getTradeData: async (params = {}) => {
    const response = await api.get(`${BASE_URL}/get-trade-data`, { params });
    return response.data;
  },

  // Bet profit config
  getBetConfig: async () => {
    const response = await api.get(`${BASE_URL}/bet-config`);
    return response.data;
  },
  setBetProfit: async (body) => {
    const response = await api.put(`${BASE_URL}/setProfit`, body);
    return response.data;
  },

  // Notifications
  getNotifications: async (params = {}) => {
    const response = await api.get(`${BASE_URL}/notifications`, { params });
    return response.data;
  },
  createNotification: async (body) => {
    const response = await api.post(`${BASE_URL}/notifications`, body);
    return response.data;
  },
  deleteNotification: async (id) => {
    const response = await api.delete(`${BASE_URL}/notifications/${id}`);
    return response.data;
  },

  // Social config (Telegram, Twitter, Instagram, Facebook)
  getSocialConfig: async () => {
    const response = await api.get(`${BASE_URL}/social-config`);
    return response.data;
  },
  updateSocialConfig: async (body) => {
    const response = await api.put(`${BASE_URL}/social-config`, body);
    return response.data;
  },
  dummyDeposit: async (body) => {
    const response = await api.post(`${BASE_URL}/users/dummy-deposit`, body);
    return response.data;
  },
  updateUserState: async (body) => {
    const response = await api.post(`${BASE_URL}/stats/users`, body);
    return response.data;
  },
  getUserStats: async () => {
    const response = await api.get(`/trade/getUserStats`);
    return response.data;
  },
};

export default tradeService;
