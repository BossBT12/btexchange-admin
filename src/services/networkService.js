import networkApi from '../utils/axios2';

const BASE_URL = '/admin';

const networkService = {
  signin: async (credentials) => {
    const response = await networkApi.post(`${BASE_URL}/signin`, credentials);
    return response.data;
  },

  // Dashboard
  getDashboard: async () => {
    const response = await networkApi.get(`${BASE_URL}/dashboard`);
    return response.data;
  },

  // User Management
  getUsers: async (params = {}) => {
    const response = await networkApi.get(`${BASE_URL}/users`, { params });
    return response.data;
  },

  getUserDetails: async (userId) => {
    const response = await networkApi.get(`${BASE_URL}/user/${userId}`);
    return response.data;
  },

  blockUnblockUser: async (userId, data) => {
    const response = await networkApi.put(`${BASE_URL}/user/${userId}/block-unblock`, data);
    return response.data;
  },

  // Financial Management
  getIncomeHistory: async (params = {}) => {
    const response = await networkApi.get(`${BASE_URL}/income-history`, { params });
    return response.data;
  },

  getDepositHistory: async (params = {}) => {
    const response = await networkApi.get(`${BASE_URL}/deposit-history`, { params });
    return response.data;
  },

  getWithdrawalHistory: async (params = {}) => {
    const response = await networkApi.get(`${BASE_URL}/withdrawal-history`, { params });
    return response.data;
  },

  // Fund Management
  getAllFunds: async (params = {}) => {
    const response = await networkApi.get(`${BASE_URL}/funds/all`, { params });
    return response.data;
  },

  sweepAddress: async (data) => {
    const response = await networkApi.post(`${BASE_URL}/funds/sweep-address`, data);
    return response.data;
  },

  sweepAll: async (data) => {
    const response = await networkApi.post(`${BASE_URL}/funds/sweep-all`, data);
    return response.data;
  },

  // ROI Settings (admin default rate for new investments)
  getRoiSettings: async () => {
    const response = await networkApi.get(`${BASE_URL}/settings/roi`);
    return response.data;
  },

  setRoiSettings: async (data) => {
    const response = await networkApi.put(`${BASE_URL}/settings/roi`, data);
    return response.data;
  },
  dummyDeposit: async (body) => {
    const response = await networkApi.post(`${BASE_URL}/deposit/user`, body);
    return response.data;
  },
  createTradeHistory: async (body) => {
    const response = await networkApi.post(`${BASE_URL}/trade-data`, body);
    return response.data;
  },
  getTradeHistory: async (params = {}) => {
    const response = await networkApi.get(`${BASE_URL}/trade-data`, { params });
    return response.data;
  }
};

export default networkService;
