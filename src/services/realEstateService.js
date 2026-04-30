const BASE_URL = `${import.meta.env.VITE_API_URL}/real-estate`;

export const realEstateService = {
  // جلب العقارات
  getAll: async () => {
    const response = await fetch(BASE_URL);
    if (!response.ok) throw new Error('فشل جلب العقارات');
    return response.json();
  },

  // إضافة عقار
  create: async (data) => {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('فشل إضافة العقار');
    return response.json();
  },

  // حذف عقار
  delete: async (id) => {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('فشل الحذف');
    return response.json();
  },

  // تعديل عقار موجود
  update: async (id, data) => {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'PUT', // نستخدم PUT للتعديل
      // ملاحظة: لا نضيف Content-Type هنا لأننا نرسل FormData (ملفات + نصوص)
      // المتصفح سيقوم بوضع Content-Type المناسب مع الـ Boundary تلقائياً
      body: data,
    });
    
    if (!response.ok) throw new Error('فشل تعديل العقار');
    return response.json();
  },
};