import React, { useState, useEffect } from "react";
import { 
  History, Search, Calendar, BrainCircuit, X, ChevronLeft, Loader2
} from "lucide-react";
import { aiService } from "../../services/aiService"; // 🌟 استيراد الخدمة

export default function AnalyticsHistoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  
  // 🌟 حالة لحفظ البيانات الحقيقية وحالة التحميل
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🌟 جلب البيانات من الخادم عند تحميل الصفحة
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await aiService.getAnalyticsHistory();
        // تنسيق البيانات لتناسب تصميم البطاقات الخاص بك
        const formattedData = data.map(item => ({
          id: item.id,
          date: new Date(item.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }),
          title: item.prompt, // نستخدم السؤال كعنوان
          summary: item.response.substring(0, 100) + "...", // نأخذ أول 100 حرف كملخص
          fullText: item.response // النص الكامل
        }));
        setHistoryData(formattedData);
      } catch (error) {
        console.error("فشل جلب السجل:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // دالة لتصفية البيانات بناءً على البحث
  const filteredHistory = historyData.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 font-cairo bg-slate-50 min-h-screen" dir="rtl">
      <div className="max-w-6xl mx-auto">
        
        {/* --- رأس الصفحة --- */}
        <div className="mb-8 flex items-center gap-3 animate-in fade-in duration-500">
          <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 text-purple-600">
            <History size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">سجل التحليلات</h1>
            <p className="text-slate-500 mt-1 text-sm font-bold">استعرض وراجع جميع التوصيات والتقارير الذكية السابقة</p>
          </div>
        </div>

        {/* --- شريط البحث --- */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6 flex items-center gap-3">
          <div className="relative flex-1">
            <input 
              type="text" 
              placeholder="ابحث في سجل التحليلات (السؤال أو المحتوى)..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pr-10 pl-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
            <Search className="absolute right-3 top-3.5 text-slate-400" size={18} />
          </div>
        </div>

        {/* --- شبكة البطاقات (عرض التحليلات) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-purple-600">
              <Loader2 size={40} className="animate-spin mb-4" />
              <p className="font-bold text-slate-500">جاري تحميل السجل...</p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="col-span-full text-center py-20 text-slate-400 font-bold">
              لا توجد تحليلات محفوظة حتى الآن. اذهب لشاشة الرؤى الذكية واسأل المساعد!
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div 
                key={item.id} 
                onClick={() => setSelectedAnalysis(item)}
                className="bg-white border border-slate-100 hover:border-purple-200 shadow-sm hover:shadow-md rounded-2xl p-5 cursor-pointer transition-all group flex flex-col"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-purple-50 text-purple-600 rounded-lg group-hover:scale-110 transition-transform">
                    <BrainCircuit size={20} />
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                    <Calendar size={12} />
                    {item.date}
                  </div>
                </div>
                
                {/* استخدام السؤال كعنوان، مع تقييم طوله */}
                <h3 className="font-black text-slate-800 text-base mb-2 group-hover:text-purple-700 transition-colors line-clamp-1">
                  {item.title}
                </h3>
                
                <p className="text-xs text-slate-500 font-medium line-clamp-3 mb-4 flex-1 leading-relaxed">
                  {item.summary}
                </p>
                
                <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-end text-sm font-bold text-purple-600">
                  <span className="flex items-center gap-1">
                    عرض التفاصيل <ChevronLeft size={16} />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* --- النافذة المنبثقة (Modal) لعرض التفاصيل الكاملة --- */}
        {selectedAnalysis && (
          <div 
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={() => setSelectedAnalysis(null)} 
          >
            <div 
              className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()} 
            >
              <div className="bg-slate-50 border-b border-slate-100 p-5 flex justify-between items-center sticky top-0">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 text-purple-600 p-2 rounded-lg">
                    <BrainCircuit size={20} />
                  </div>
                  <h2 className="font-black text-slate-800 text-lg line-clamp-1 flex-1 pl-4">{selectedAnalysis.title}</h2>
                </div>
                <button 
                  onClick={() => setSelectedAnalysis(null)}
                  className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors shrink-0"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto custom-scrollbar">
                <div className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg mb-6">
                  <Calendar size={14} />
                  تاريخ التحليل: {selectedAnalysis.date}
                </div>
                
                <div className="whitespace-pre-wrap font-medium leading-loose text-slate-700 bg-purple-50/30 p-6 rounded-xl border border-purple-100/50 text-sm">
                  {selectedAnalysis.fullText}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}