import React, { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard, ChevronDown, Plus, FileText, House, Vault,
  Coins, Briefcase, Wallet, TrendingUp, ChartColumn, CircleAlert, Sparkles, LoaderCircle, Info,
} from "lucide-react";
import {
  PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
} from "recharts";

import { dashboardService } from "../../services/dashboardService";
import { aiService } from "../../services/aiService"; // 🌟 استيراد خدمة الذكاء الاصطناعي

export default function DashboardPage() {
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stats: null,
    assetDistribution: [],
    trendData: [] // 🌟 أضفنا مسار الرسم البياني
  });

  // 🌟 حالات الذكاء الاصطناعي
  const [aiInsight, setAiInsight] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  // إغلاق القائمة المنسدلة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsQuickActionsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // جلب بيانات لوحة التحكم
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await dashboardService.getStats();
        setDashboardData(data);
      } catch (error) {
        console.error("فشل تحميل اللوحة:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // 🌟 تشغيل الذكاء الاصطناعي تلقائياً بعد تحميل البيانات
  useEffect(() => {
    const fetchAiInsight = async () => {
      if (dashboardData.stats) {
        setIsAiLoading(true);
        try {
          // نطلب من الذكاء الاصطناعي تحليل الأرقام باختصار
          const prompt = "بصفتك مستشاري المالي، قم بتحليل سريع لهذه الأرقام وأعطني نصيحة واحدة أو ملاحظة هامة في سطرين كحد أقصى لتعرض في لوحة التحكم الخاصة بي.";
          const response = await aiService.askAi(prompt, dashboardData.stats);
          
          if (response.error) {
             setAiInsight("الخوادم مشغولة حالياً، لم نتمكن من توليد نصيحة ذكية.");
          } else {
             setAiInsight(response.reply);
          }
        } catch (error) {
          setAiInsight("تعذر الاتصال بالمساعد الذكي.");
        } finally {
          setIsAiLoading(false);
        }
      }
    };

    fetchAiInsight();
  }, [dashboardData.stats]); // تعمل هذه الدالة فقط عندما تتغير الإحصائيات (تتحمل)

  const formatNum = (num) => Number(num).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (loading || !dashboardData.stats) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center h-screen bg-slate-50/50">
        <LoaderCircle size={40} className="animate-spin text-indigo-600 mb-4" />
        <p className="font-bold text-slate-500">جاري تجميع بيانات المحفظة الحقيقية...</p>
      </div>
    );
  }

  // استخدام البيانات الحقيقية بالكامل
  const { stats, assetDistribution, trendData } = dashboardData;

  // تنبيهات وهمية مؤقتة (لأن نظام التنبيهات يتطلب جدولاً خاصاً للإشعارات)
  const alerts = [
    { id: 1, title: "شقة التجمع", message: `${formatNum(stats.liabilities.sar)} SAR`, type: "المبلغ المتبقي الكلي" },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 font-cairo bg-slate-50/50 min-h-screen" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* --- رأس الصفحة --- */}
        <div className="mb-8 flex items-center gap-3 animate-in fade-in">
          <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 text-slate-700">
            <LayoutDashboard size={24} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">لوحة التحكم</h1>
        </div>

        {/* --- الترحيب والإجراءات السريعة --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">أهلاً بك مجدداً، مصطفي!</h1>
            <p className="text-slate-500 mt-1 font-medium">"الاستثمار في المعرفة يدفع أفضل فائدة." - بنجامين فرانكلين</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="relative" ref={dropdownRef}>
              <button onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)} className="justify-center whitespace-nowrap text-sm font-medium h-10 px-4 py-2 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition-all hover:shadow-lg active:scale-95">
                إجراءات سريعة <ChevronDown size={16} className={`transition-transform ${isQuickActionsOpen ? "rotate-180" : ""}`} />
              </button>
              {isQuickActionsOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-50 p-1 animate-in fade-in slide-in-from-top-2">
                  <button className="flex items-center text-sm font-bold hover:bg-slate-50 hover:text-indigo-600 text-slate-700 h-10 px-4 py-2 w-full justify-start gap-2 rounded-lg transition-colors"><Plus size={16} /> إضافة مصروف</button>
                  <button className="flex items-center text-sm font-bold hover:bg-slate-50 hover:text-indigo-600 text-slate-700 h-10 px-4 py-2 w-full justify-start gap-2 rounded-lg transition-colors"><Plus size={16} /> إضافة عقار</button>
                  <div className="h-px bg-slate-100 my-1 mx-2"></div>
                  <button className="flex items-center text-sm font-bold hover:bg-slate-50 hover:text-indigo-600 text-slate-700 h-10 px-4 py-2 w-full justify-start gap-2 rounded-lg transition-colors"><FileText size={16} /> عرض كل المعاملات</button>
                </div>
              )}
            </div>
            <button className="justify-center whitespace-nowrap text-sm font-bold h-10 px-4 py-2 flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-md transition-all hover:shadow-lg active:scale-95">تصدير الملخص (Excel)</button>
            <button className="justify-center whitespace-nowrap text-sm font-bold h-10 px-4 py-2 flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl shadow-md transition-all hover:shadow-lg active:scale-95">تصدير (PDF)</button>
          </div>
        </div>

        {/* --- البطاقات الإحصائية (الحقيقية) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
          {/* الالتزامات */}
          <div className="border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-red-50/30 overflow-hidden group rounded-2xl relative">
            <div className="absolute top-0 right-0 w-1.5 h-full bg-red-500"></div>
            <div className="p-5 flex flex-row items-center justify-between pb-2">
              <h3 className="tracking-tight text-sm font-bold text-slate-600">إجمالي الالتزامات</h3>
              <div className="p-2.5 bg-red-100 text-red-600 rounded-xl group-hover:scale-110 transition-transform"><House size={20} /></div>
            </div>
            <div className="p-5 pt-2">
              <div className="flex flex-col gap-1 font-cairo">
                <div className="flex items-center gap-2">
                  <span className="font-black text-xl md:text-2xl text-slate-900">SAR {formatNum(stats.liabilities.sar)}</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-1">
                  <div className="flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 font-bold"><span className="text-[10px] opacity-70">USD</span><span className="text-xs">${formatNum(stats.liabilities.usd)}</span></div>
                  <div className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 font-bold"><span className="text-[10px] opacity-70">EGP</span><span className="text-xs">{formatNum(stats.liabilities.egp)}</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* السيولة */}
          <div className="border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-emerald-50/30 overflow-hidden group rounded-2xl relative">
            <div className="absolute top-0 right-0 w-1.5 h-full bg-emerald-500"></div>
            <div className="p-5 flex flex-row items-center justify-between pb-2">
              <h3 className="tracking-tight text-sm font-bold text-slate-600">إجمالي السيولة</h3>
              <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform"><Vault size={20} /></div>
            </div>
            <div className="p-5 pt-2">
              <div className="flex flex-col gap-1 font-cairo">
                <div className="flex items-center gap-2">
                  <span className="font-black text-xl md:text-2xl text-slate-900">SAR {formatNum(stats.liquidity.sar)}</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-1">
                  <div className="flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 font-bold"><span className="text-[10px] opacity-70">USD</span><span className="text-xs">${formatNum(stats.liquidity.usd)}</span></div>
                  <div className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 font-bold"><span className="text-[10px] opacity-70">EGP</span><span className="text-xs">{formatNum(stats.liquidity.egp)}</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* الذهب */}
          <div className="border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-amber-50/30 overflow-hidden group rounded-2xl relative">
            <div className="absolute top-0 right-0 w-1.5 h-full bg-amber-500"></div>
            <div className="p-5 flex flex-row items-center justify-between pb-2">
              <h3 className="tracking-tight text-sm font-bold text-slate-600">قيمة الذهب</h3>
              <div className="p-2.5 bg-amber-100 text-amber-600 rounded-xl group-hover:scale-110 transition-transform"><Coins size={20} /></div>
            </div>
            <div className="p-5 pt-2">
              <div className="flex flex-col gap-1 font-cairo">
                <div className="flex items-center gap-2">
                  <span className="font-black text-xl md:text-2xl text-slate-900">SAR {formatNum(stats.gold.sar)}</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-1">
                  <div className="flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 font-bold"><span className="text-[10px] opacity-70">USD</span><span className="text-xs">${formatNum(stats.gold.usd)}</span></div>
                  <div className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 font-bold"><span className="text-[10px] opacity-70">EGP</span><span className="text-xs">{formatNum(stats.gold.egp)}</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* الأرباح */}
          <div className="border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-blue-50/30 overflow-hidden group rounded-2xl relative">
            <div className="absolute top-0 right-0 w-1.5 h-full bg-blue-500"></div>
            <div className="p-5 flex flex-row items-center justify-between pb-2">
              <h3 className="tracking-tight text-sm font-bold text-slate-600">صافي الأرباح</h3>
              <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl group-hover:scale-110 transition-transform"><Briefcase size={20} /></div>
            </div>
            <div className="p-5 pt-2">
              <div className="flex flex-col gap-1 font-cairo">
                <div className="flex items-center gap-2">
                  <span className={`font-black text-xl md:text-2xl ${stats.profits.sar < 0 ? 'text-red-600' : 'text-slate-900'}`}>
                    SAR {formatNum(stats.profits.sar)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* الميزانية (المصروفات) */}
          <div className="border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-emerald-50/30 overflow-hidden group rounded-2xl relative lg:col-span-1 md:col-span-2">
            <div className="absolute top-0 right-0 w-1.5 h-full bg-emerald-500"></div>
            <div className="p-5 flex flex-row items-center justify-between pb-2">
              <h3 className="tracking-tight text-sm font-bold text-slate-600">المصروفات من الميزانية</h3>
              <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform"><Wallet size={20} /></div>
            </div>
            <div className="p-5 pt-2">
              <div className="flex flex-col gap-1 font-cairo">
                <div className="flex items-center gap-2">
                  <span className="font-black text-xl md:text-2xl text-slate-900">SAR {formatNum(stats.budget.current)}</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2 font-bold">المصروف الفعلي حتى الآن</p>
            </div>
          </div>
        </div>

        {/* --- الرسوم البيانية --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* الرسم الدائري */}
          <div className="border-slate-200 bg-white shadow-sm rounded-2xl overflow-hidden border-0">
            <div className="border-b border-slate-100 bg-slate-50/50 p-6 flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><TrendingUp size={20} /></div>
              <h3 className="text-xl font-black text-slate-800">توزيع الأصول المالية</h3>
            </div>
            <div className="p-6 h-[350px]">
              {assetDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={assetDistribution} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                      {assetDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <RechartsTooltip formatter={(value) => [`SAR ${formatNum(value)}`, "القيمة"]} contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", fontFamily: 'Cairo', fontWeight: 'bold' }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 font-bold">لا توجد بيانات كافية للرسم البياني</div>
              )}
            </div>
          </div>

          {/* الرسم المساحي للمصروفات والدخل (الحقيقي) */}
          <div className="border-slate-200 bg-white shadow-sm rounded-2xl overflow-hidden border-0">
            <div className="border-b border-slate-100 bg-slate-50/50 p-6 flex items-center gap-3">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><ChartColumn size={20} /></div>
              <h3 className="text-xl font-black text-slate-800">حركة الدخل والمصروفات (آخر 6 أشهر)</h3>
            </div>
            <div className="p-6 h-[350px]">
              {trendData && trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} /></linearGradient>
                      <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} /><stop offset="95%" stopColor="#ef4444" stopOpacity={0} /></linearGradient>
                    </defs>
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val / 1000}k`} />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <RechartsTooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", fontFamily: 'Cairo', fontWeight: 'bold' }} formatter={(value, name) => [formatNum(value), name === "income" ? "الدخل" : "المصروفات"]} />
                    <Legend verticalAlign="top" height={36} iconType="circle" />
                    <Area type="monotone" dataKey="income" name="الدخل" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                    <Area type="monotone" dataKey="expense" name="المصروفات" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 font-bold">لا توجد معاملات مالية مسجلة بعد.</div>
              )}
            </div>
          </div>
        </div>

        {/* --- التنبيهات والرؤى الذكية --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="border-slate-200 bg-white shadow-sm rounded-2xl overflow-hidden border-0">
            <div className="border-b border-slate-100 bg-slate-50/50 p-6 flex items-center gap-3">
              <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><CircleAlert size={20} /></div>
              <h3 className="text-xl font-black text-slate-800">تنبيهات العقارات</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div key={alert.id} className="group flex items-start gap-4 p-4 bg-white hover:bg-amber-50/50 text-slate-800 rounded-xl border border-slate-100 hover:border-amber-200 transition-all shadow-sm">
                    <div className="p-2 bg-amber-100 text-amber-600 rounded-lg shrink-0 mt-0.5"><CircleAlert size={20} /></div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-900">{alert.title}</p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-sm text-slate-500 font-medium">{alert.type}:</p>
                        <p className="text-sm font-black px-2 py-1 rounded-md text-amber-700 bg-amber-100">{alert.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 🌟 الرؤى الذكية الفعّالة */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-100 shadow-sm h-fit">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-purple-900 flex items-center gap-2 text-lg">
                <Sparkles size={20} className="text-purple-600" /> رؤى ذكية - لوحة التحكم
              </h3>
            </div>
            {isAiLoading ? (
              <div className="flex items-center gap-2 text-purple-600 text-sm py-2 font-bold bg-white/50 p-4 rounded-xl">
                <LoaderCircle size={18} className="animate-spin" /> جاري تحليل الأرقام واستخراج النصيحة...
              </div>
            ) : (
              <div className="text-purple-800 text-sm font-bold bg-white/60 p-4 rounded-xl border border-purple-100 leading-relaxed shadow-inner">
                {aiInsight || "لا توجد نصائح حالياً."}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}