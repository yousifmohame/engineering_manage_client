import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/nazmi`;

export const nazmiService = {
  async getData() {
    const res = await axios.get(API_URL);
    return res.data;
  },

  async updateSettings(data) {
    const res = await axios.put(`${API_URL}/settings`, data);
    return res.data;
  },

  // ✅ التعديل هنا: الدالة تستقبل formData مبنية وجاهزة من الشاشة
  async addTransaction(formData) {
    const res = await axios.post(`${API_URL}/transactions`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  // ✅ التعديل هنا أيضاً
  async updateTransaction(id, formData) {
    const res = await axios.put(`${API_URL}/transactions/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  async deleteTransaction(id) {
    const res = await axios.delete(`${API_URL}/transactions/${id}`);
    return res.data;
  },

  async generateAIReport() {
    const res = await axios.get(`${API_URL}/ai-report`);
    return res.data;
  },
};
