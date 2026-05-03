import axiosInstance from './axiosInstance';

export const adminService = {
  async getDashboard() {
    const response = await axiosInstance.get('/admin/dashboard');
    return response.data.data;
  },

  async getMembers(params = {}) {
    const response = await axiosInstance.get('/admin/members', { params });
    return response.data.data;
  },

  async getPendingMembers() {
    const response = await axiosInstance.get('/admin/members/pending');
    return response.data.data;
  },

  async getMember(id) {
    const response = await axiosInstance.get(`/admin/members/${id}`);
    return response.data.data;
  },

  async createMember(data) {
    const response = await axiosInstance.post('/admin/members', data);
    return response.data.data;
  },

  async approveMember(id) {
    const response = await axiosInstance.put(`/admin/members/${id}/approve`);
    return response.data;
  },

  async rejectMember(id) {
    const response = await axiosInstance.put(`/admin/members/${id}/reject`);
    return response.data;
  },

  async assignPackage(memberId, data) {
    const response = await axiosInstance.post(`/admin/members/${memberId}/assign-package`, data);
    return response.data;
  },

  async assignSessionPlan(memberId, data) {
    const response = await axiosInstance.post(`/admin/members/${memberId}/session-plan`, data);
    return response.data;
  },

  async suspendMember(id) {
    const response = await axiosInstance.put(`/admin/members/${id}/suspend`);
    return response.data;
  },

  async activateMember(id) {
    const response = await axiosInstance.put(`/admin/members/${id}/activate`);
    return response.data;
  },

  async deleteMember(id) {
    const response = await axiosInstance.delete(`/admin/members/${id}`);
    return response.data;
  },

  async updateMemberMeasurements(id, data) {
    const response = await axiosInstance.put(`/admin/members/${id}/measurements`, data);
    return response.data;
  },

  async addMemberProgress(id, data) {
    const response = await axiosInstance.post(`/admin/members/${id}/progress`, data);
    return response.data.data;
  },

  async resetMemberPassword(id, data) {
    const response = await axiosInstance.put(`/admin/members/${id}/password`, data);
    return response.data;
  },

  async getMemberProgress(memberId) {
    const response = await axiosInstance.get(`/progress/member/${memberId}`);
    return response.data.data;
  },
};

export const packageService = {
  async getAll(activeOnly = false) {
    const response = await axiosInstance.get('/packages', { params: { activeOnly } });
    return response.data.data;
  },

  async create(data) {
    const response = await axiosInstance.post('/packages', data);
    return response.data.data;
  },

  async update(id, data) {
    const response = await axiosInstance.put(`/packages/${id}`, data);
    return response.data.data;
  },

  async delete(id) {
    const response = await axiosInstance.delete(`/packages/${id}`);
    return response.data;
  },
};

export const paymentService = {
  async getAll(params = {}) {
    const response = await axiosInstance.get('/payments', { params });
    return response.data.data;
  },

  async getByMember(memberId) {
    const response = await axiosInstance.get(`/payments/member/${memberId}`);
    return response.data.data;
  },

  async create(data) {
    const response = await axiosInstance.post('/payments', data);
    return response.data.data;
  },

  async update(id, data) {
    const response = await axiosInstance.put(`/payments/${id}`, data);
    return response.data.data;
  },
};

export const productService = {
  async getAll(params = {}) {
    const response = await axiosInstance.get('/products', { params });
    return response.data.data;
  },

  async getSales(params = {}) {
    const response = await axiosInstance.get('/products/sales', { params });
    return response.data.data;
  },

  async create(data) {
    const response = await axiosInstance.post('/products', data);
    return response.data.data;
  },

  async createSale(data) {
    const response = await axiosInstance.post('/products/sales', data);
    return response.data.data;
  },

  async updateSale(id, data) {
    const response = await axiosInstance.put(`/products/sales/${id}`, data);
    return response.data.data;
  },

  async deleteSale(id) {
    const response = await axiosInstance.delete(`/products/sales/${id}`);
    return response.data;
  },

  async update(id, data) {
    const response = await axiosInstance.put(`/products/${id}`, data);
    return response.data.data;
  },

  async delete(id) {
    const response = await axiosInstance.delete(`/products/${id}`);
    return response.data;
  },
};

export const expenseService = {
  async getAll(params = {}) {
    const response = await axiosInstance.get('/expenses', { params });
    return response.data.data;
  },

  async create(data) {
    const response = await axiosInstance.post('/expenses', data);
    return response.data.data;
  },

  async update(id, data) {
    const response = await axiosInstance.put(`/expenses/${id}`, data);
    return response.data.data;
  },

  async delete(id) {
    const response = await axiosInstance.delete(`/expenses/${id}`);
    return response.data;
  },
};

export const sessionService = {
  async getAll(params = {}) {
    const response = await axiosInstance.get('/sessions', { params });
    return response.data.data;
  },

  async getDailyBoard(date) {
    const response = await axiosInstance.get('/sessions/daily-board', { params: { date } });
    return response.data.data;
  },

  async markAttendance({ memberId, calendarDate, sessionTime }) {
    const response = await axiosInstance.post('/sessions/attendance', {
      memberId,
      calendarDate,
      sessionTime,
    });
    return response.data.data;
  },

  async getAttendanceSlots() {
    const response = await axiosInstance.get('/sessions/attendance-slots');
    return response.data.data;
  },

  async updateAttendanceSlots(data) {
    const response = await axiosInstance.put('/sessions/attendance-slots', data);
    return response.data.data;
  },

  async getAttendanceHistory({ dateFrom, dateTo, search, page = 1, pageSize = 20 } = {}) {
    const params = { page, pageSize };
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;
    if (search) params.search = search;
    const response = await axiosInstance.get('/sessions/attendance-history', { params });
    return response.data.data;
  },

  async create(data) {
    const response = await axiosInstance.post('/sessions', data);
    return response.data.data;
  },

  async update(id, data) {
    const response = await axiosInstance.put(`/sessions/${id}`, data);
    return response.data.data;
  },

  async delete(id) {
    const response = await axiosInstance.delete(`/sessions/${id}`);
    return response.data;
  },
};

export const whatsappService = {
  async getSettings() {
    const response = await axiosInstance.get('/whatsapp/settings');
    return response.data.data;
  },

  async updateSettings(data) {
    const response = await axiosInstance.put('/whatsapp/settings', data);
    return response.data;
  },

  async getTemplates() {
    const response = await axiosInstance.get('/whatsapp/templates');
    return response.data.data;
  },

  async createTemplate(data) {
    const response = await axiosInstance.post('/whatsapp/templates', data);
    return response.data.data;
  },

  async updateTemplate(id, data) {
    const response = await axiosInstance.put(`/whatsapp/templates/${id}`, data);
    return response.data.data;
  },

  async deleteTemplate(id) {
    const response = await axiosInstance.delete(`/whatsapp/templates/${id}`);
    return response.data;
  },

  async getLogs(params = {}) {
    const response = await axiosInstance.get('/whatsapp/logs', { params });
    return response.data.data;
  },
};
