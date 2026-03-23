import api from '../utils/axios';
const BASE_URL = '/trade/admin';

const authService = {
    loginTrade: async (credentials) => {
        const response = await api.post(`${BASE_URL}/signIn`, credentials);
        return response.data;
    },
    loginNetwork: async (credentials) => {
        const response = await api.post(`${BASE_URL}/signIn`, credentials);
        return response.data;
    }
};

export default authService;