const API_URL = `${import.meta.env.VITE_API_URL}/banks`;

export const bankService = {
  async getAccounts() {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("فشل جلب الحسابات");
    return res.json();
  },

  async createAccount(data) {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteAccount(id) {
    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    return res.json();
  },

  // ✅ إضافة حركة (FormData بسبب المرفق)
  async addTransaction(formData) {
    const res = await fetch(`${API_URL}/transaction`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error("فشل الإضافة");
    return res.json();
  },

  // ✅ تعديل حركة
  async updateTransaction(id, formData) {
    const res = await fetch(`${API_URL}/transaction/${id}`, {
      method: "PUT",
      body: formData,
    });
    if (!res.ok) throw new Error("فشل التعديل");
    return res.json();
  },

  // ✅ حذف حركة
  async deleteTransaction(id) {
    const res = await fetch(`${API_URL}/transaction/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("فشل الحذف");
    return res.json();
  },

  // الذكاء الاصطناعي
  async analyzeStatement(bankAccountId, file) {
    const formData = new FormData();
    formData.append("bankAccountId", bankAccountId);
    formData.append("statement", file);

    const response = await fetch(`${API_URL}/analyze-statement`, {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || "حدث خطأ في السيرفر");
    }
    return await response.json();
  },
};
