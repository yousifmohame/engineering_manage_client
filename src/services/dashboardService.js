const BASE_URL = `${import.meta.env.VITE_API_URL}/dashboard`;

export const dashboardService = {
  // دالة لجلب الإحصائيات من الخادم
  getStats: async () => {
    const response = await fetch(`${BASE_URL}/stats`);
    if (!response.ok) throw new Error('فشل جلب بيانات لوحة التحكم');
    return response.json();
  }
};