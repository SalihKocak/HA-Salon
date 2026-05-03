import axiosInstance from './axiosInstance';

export const developerService = {
  async getActivityLogs(filters = {}) {
    const response = await axiosInstance.get('/developer/activity-logs', { params: filters });
    return response.data.data;
  },

  async getErrorLogs(filters = {}) {
    const response = await axiosInstance.get('/developer/error-logs', { params: filters });
    return response.data.data;
  },

  async getMemberActivity(filters = {}) {
    const response = await axiosInstance.get('/developer/member-activity', { params: filters });
    return response.data.data;
  },
};
