const API_URL = `${import.meta.env.VITE_API_URL}/banks`;

export const bankService = {
  // جلب الحسابات والحركات
  async getAccounts() {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('فشل جلب الحسابات');
    return res.json();
  },

  // إنشاء حساب جديد
  async createAccount(data) {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // إضافة حركة (إيداع/سحب)
  async addTransaction(data) {
    const res = await fetch(`${API_URL}/transaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // حذف حساب
  async deleteAccount(id) {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  }
};