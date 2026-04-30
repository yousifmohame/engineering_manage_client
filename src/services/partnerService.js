const BASE_URL = `${import.meta.env.VITE_API_URL}/partners`;

export const partnerService = {
  getAll: async () => {
    const response = await fetch(BASE_URL);
    if (!response.ok) throw new Error("فشل جلب الشركاء");
    return response.json();
  },

  create: async (data) => {
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("فشل إضافة الشريك");
    return response.json();
  },

  update: async (id, data) => {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("فشل تعديل الشريك");
    return response.json();
  },

  delete: async (id) => {
    const response = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
    if (!response.ok) throw new Error("فشل حذف الشريك");
    return response.json();
  },
};
