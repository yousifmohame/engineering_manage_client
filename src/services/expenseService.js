const API_URL = `${import.meta.env.VITE_API_URL}/expenses`;

export const expenseService = {
  async getExpenses() {
    const response = await fetch(API_URL);
    return response.json();
  },
  async addExpense(data) {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  // دالة التعديل الجديدة
  async updateExpense(id, data) {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  // دالة الحذف الجديدة
  async deleteExpense(id) {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  }
};