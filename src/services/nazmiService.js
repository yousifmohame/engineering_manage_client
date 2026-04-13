const API_URL = `${import.meta.env.VITE_API_URL}/nazmi`;

export const nazmiService = {
  async getData() {
    return (await fetch(API_URL)).json();
  },

  // حفظ وتحديث الإعدادات الأساسية
  async updateSettings(data) {
    return (
      await fetch(`${API_URL}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
    ).json();
  },

  // إضافة حركة (إيراد/مصروف/توزيع)
  async addTransaction(data) {
    return (
      await fetch(`${API_URL}/transaction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
    ).json();
  },

  // تعديل حركة (الجديد ✨)
  async updateTransaction(id, data) {
    return (
      await fetch(`${API_URL}/transaction/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
    ).json();
  },

  // حذف حركة
  async deleteTransaction(id) {
    return (
      await fetch(`${API_URL}/transaction/${id}`, { method: "DELETE" })
    ).json();
  },

  // توليد تقرير الذكاء الاصطناعي (الجديد ✨)
  async generateAIReport() {
    return (
      await fetch(`${API_URL}/ai-report`)
    ).json();
  }
};