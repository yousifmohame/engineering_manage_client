const BASE_URL = `${import.meta.env.VITE_API_URL}/ai`;

export const aiService = {
  // دالة لجلب الأرصدة الحقيقية من الخادم
  getFinancialSummary: async () => {
    const response = await fetch(`${BASE_URL}/financial-summary`);
    if (!response.ok) throw new Error('فشل جلب البيانات المالية');
    return response.json();
  },

  // دالة لإرسال السؤال والبيانات المالية للذكاء الاصطناعي
  askAi: async (prompt, financialData) => {
    const response = await fetch(`${BASE_URL}/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, financialData }),
    });
    
    if (!response.ok) throw new Error('فشل التحدث مع الذكاء الاصطناعي');
    return response.json();
  },
  // أضف هذه الدالة داخل كائن aiService
  getAnalyticsHistory: async () => {
    const response = await fetch(`${BASE_URL}/history`);
    if (!response.ok) throw new Error('فشل جلب سجل التحليلات');
    return response.json();
  },
};
