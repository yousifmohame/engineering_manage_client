const API_URL = `${import.meta.env.VITE_API_URL}/safe`;

export const safeService = {
  async getTransactions() {
    const res = await fetch(`${API_URL}/transactions`);
    return res.json();
  },
  async addTransaction(data) {
    const res = await fetch(`${API_URL}/transaction`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  // دالة التعديل
  async updateTransaction(id, data) {
    const res = await fetch(`${API_URL}/transaction/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  // دالة الحذف
  async deleteTransaction(id) {
    const res = await fetch(`${API_URL}/transaction/${id}`, {
      method: "DELETE",
    });
    return res.json();
  },
};
