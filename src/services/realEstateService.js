const BASE_URL = `${import.meta.env.VITE_API_URL}/real-estate`;

export const realEstateService = {
  // 1. جلب العقارات
  getAll: async () => {
    const response = await fetch(BASE_URL);
    if (!response.ok) throw new Error('فشل جلب العقارات');
    return response.json();
  },

  // 2. إضافة عقار (تم التحديث ليدعم الملفات FormData)
  create: async (formData) => {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      // ⚠️ ملاحظة هامة: لا نضع headers: {'Content-Type': 'application/json'} هنا أبداً!
      // المتصفح سيتعرف تلقائياً على FormData ويضع الـ Boundary المناسب للملفات.
      body: formData, // نرسل الـ FormData مباشرة بدون JSON.stringify
    });
    if (!response.ok) throw new Error('فشل إضافة العقار');
    return response.json();
  },

  // 3. تعديل عقار (تم التحديث ليدعم الملفات FormData)
  update: async (id, formData) => {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'PUT',
      body: formData, // نرسل الـ FormData مباشرة
    });
    if (!response.ok) throw new Error('فشل تعديل العقار');
    return response.json();
  },

  // 4. حذف عقار
  delete: async (id) => {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('فشل الحذف');
    return response.json();
  }
};