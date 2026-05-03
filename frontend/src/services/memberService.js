import axiosInstance from './axiosInstance';

export const memberService = {
  async getProfile() {
    const response = await axiosInstance.get('/member/profile');
    return response.data.data;
  },

  async updateProfile(data) {
    const response = await axiosInstance.put('/member/profile', data);
    return response.data;
  },

  async updateAccountSettings(data) {
    const response = await axiosInstance.put('/member/account-settings', data);
    return response.data;
  },

  async getProgress() {
    const response = await axiosInstance.get('/member/progress');
    return response.data.data;
  },

  async getSessions() {
    const response = await axiosInstance.get('/member/sessions');
    return response.data.data;
  },
};
