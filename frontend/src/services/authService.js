import axiosInstance from './axiosInstance';

export const authService = {
  async register(data) {
    const response = await axiosInstance.post('/auth/register-member', data);
    return response.data.data;
  },

  async login(identifier, password) {
    const response = await axiosInstance.post('/auth/login', { identifier, password });
    return response.data.data;
  },

  async logout(refreshToken) {
    await axiosInstance.post('/auth/logout', { refreshToken });
  },

  async refreshToken(refreshToken) {
    const response = await axiosInstance.post('/auth/refresh', { refreshToken });
    return response.data.data;
  },

  async getMe() {
    const response = await axiosInstance.get('/auth/me');
    return response.data.data;
  },
};
