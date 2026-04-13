import React, { useState } from 'react';
import { BarChart3, PieChart, TrendingUp, Sparkles, BrainCircuit, Download, CheckCircle2 } from 'lucide-react';
import { nazmiService } from '../../services/nazmiService';

export default function PartnershipReports({ settings, transactions }) {
  const [aiReport, setAiReport] = useState(null);
  const [generatingAi, setGeneratingAi] = useState(false);

  // حساب البيانات للرسوم البيانية
  const incomes = transactions.filter(t => t.type === 'إيراد');
  const expenses = transactions.filter(t => t.type === 'مصروف');

  const totalBank = incomes.filter(i => i.category === 'بنك').reduce((s, i) => s + i.amount, 0);
  const totalCash = incomes.filter(i => i.category === 'كاش').reduce((s, i) => s + i.amount, 0);
  const totalIncome = totalBank + totalCash;

  // تجهيز بيانات مصادر الدخل
  const bankPercent = totalIncome > 0 ? (totalBank / totalIncome) * 100 : 0;
  const cashPercent = totalIncome > 0 ? (totalCash / totalIncome) * 100 : 0;

  // تجهيز بيانات المصاريف وترتيبها تنازلياً
  const expCategories = {};
  expenses.forEach(e => {
    expCategories[e.category] = (expCategories[e.category] || 0) + e.amount;
  });
  
  const expenseData = Object.entries(expCategories)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const maxExpense = expenseData.length > 0 ? Math.max(...expenseData.map(e => e.value)) : 1; 

  const generateAiReport = async () => {
    setGeneratingAi(true);
    setAiReport(null);
    try {
      const res = await nazmiService.generateAIReport();
      setAiReport(res.report);
    } catch (error) {
      console.error("Error generating AI report:", error);
      setAiReport("حدث خطأ أثناء الاتصال بمحرك الذكاء الاصطناعي. يرجى المحاولة لاحقاً.");
    } finally {
      setGeneratingAi(false);
    }
  };

  const exportFullReport = () => {
    const rows = [
      ['النوع', 'التاريخ', 'الوصف', 'التصنيف', 'المبلغ (SAR)'],
      ...transactions.map(t => [
        t.type,
        new Date(t.date).toLocaleDateString('ar-EG'),
        t.description,
        t.category,
        t.amount.toFixed(2)
      ])
    ];

    const csvContent = "data:text/csv;charset=utf-8," + "\uFEFF" + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `تقرير_الشراكة_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 md:space-y-6 font-cairo animate-in fade-in duration-300">
      
      {/* Header and Export Button (Mobile Optimized) */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-slate-100 gap-4">
        <h2 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-3 w-full md:w-auto">
          <div className="p-2.5 md:p-3 bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 rounded-xl shadow-inner border border-blue-200/50 shrink-0">
            <BarChart3 size={24} />
          </div>
          التقارير والإحصائيات
        </h2>
        <button 
          onClick={exportFullReport} 
          className="w-full md:w-auto bg-slate-800 hover:bg-slate-900 text-white flex items-center justify-center gap-2 rounded-xl shadow-md transition-all hover:shadow-lg font-bold px-4 py-3.5 md:px-6 md:py-5 text-sm md:text-base"
        >
          <Download size={18} />
          تصدير التقرير الشامل
        </button>
      </div>

      {/* Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
        
        {/* 1. Income Analysis (Mobile Optimized Horizontal Bars) */}
        <div className="border border-slate-200 shadow-lg bg-white rounded-2xl md:rounded-3xl overflow-hidden relative flex flex-col h-full">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
          <div className="flex flex-col space-y-1.5 p-4 md:p-6 border-b border-slate-100 bg-slate-50/80 pb-4 pt-5">
            <h3 className="tracking-tight text-lg md:text-xl font-black flex items-center gap-2 md:gap-3 text-slate-800">
              <div className="p-2 md:p-2.5 bg-blue-100 text-blue-600 rounded-lg md:rounded-xl shadow-inner shrink-0">
                <PieChart size={20} className="md:w-[22px] md:h-[22px]" />
              </div>
              تحليل مصادر الدخل
            </h3>
          </div>
          <div className="p-5 md:p-8 flex-1 flex flex-col justify-center gap-6">
            {totalIncome > 0 ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm md:text-base font-bold text-slate-700">
                    <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500 shrink-0"></span>بنكي</span>
                    <span>{bankPercent.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 md:h-4 overflow-hidden shadow-inner">
                    <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-full rounded-full transition-all duration-1000" style={{ width: `${bankPercent}%` }}></div>
                  </div>
                  <p className="text-left text-xs md:text-sm font-black text-blue-600">{totalBank.toLocaleString()} SAR</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm md:text-base font-bold text-slate-700">
                    <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0"></span>كاش</span>
                    <span>{cashPercent.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 md:h-4 overflow-hidden shadow-inner">
                    <div className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-full rounded-full transition-all duration-1000" style={{ width: `${cashPercent}%` }}></div>
                  </div>
                  <p className="text-left text-xs md:text-sm font-black text-emerald-600">{totalCash.toLocaleString()} SAR</p>
                </div>

                <div className="pt-4 md:pt-6 border-t border-slate-100 text-center">
                    <p className="text-xs md:text-sm font-bold text-slate-500 mb-1">إجمالي الدخل المسجل</p>
                    <p className="text-2xl md:text-3xl font-black text-slate-800">{totalIncome.toLocaleString()} SAR</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-slate-400 font-bold text-sm">لا توجد إيرادات مسجلة للتحليل</div>
            )}
          </div>
        </div>

        {/* 2. Expense Analysis (Mobile Optimized Horizontal Bars) */}
        <div className="border border-slate-200 shadow-lg bg-white rounded-2xl md:rounded-3xl overflow-hidden relative flex flex-col h-full">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-rose-500 to-orange-500"></div>
          <div className="flex flex-col space-y-1.5 p-4 md:p-6 border-b border-slate-100 bg-slate-50/80 pb-4 pt-5">
            <h3 className="tracking-tight text-lg md:text-xl font-black flex items-center gap-2 md:gap-3 text-slate-800">
              <div className="p-2 md:p-2.5 bg-rose-100 text-rose-600 rounded-lg md:rounded-xl shadow-inner shrink-0">
                <TrendingUp size={20} className="md:w-[22px] md:h-[22px]" />
              </div>
              تحليل المصاريف حسب التصنيف
            </h3>
          </div>
          <div className="p-5 md:p-8 flex-1 flex flex-col justify-center">
            {expenseData.length > 0 ? (
              <div className="space-y-5">
                {expenseData.map((item, index) => (
                  <div key={index} className="space-y-1.5 group">
                    <div className="flex justify-between items-center text-xs md:text-sm font-bold text-slate-700">
                      <span>{item.name}</span>
                      <span className="text-rose-600">{item.value.toLocaleString()} SAR</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 md:h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-rose-400 to-red-600 h-full rounded-full transition-all duration-1000 group-hover:from-rose-500 group-hover:to-red-700" 
                        style={{ width: `${(item.value / maxExpense) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
               <div className="text-center py-10 text-slate-400 font-bold text-sm">لا توجد مصاريف مسجلة للتحليل</div>
            )}
          </div>
        </div>

      </div>

      {/* AI Report Module (Mobile Optimized) */}
      <div className="border border-slate-200 shadow-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl md:rounded-3xl overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-48 md:w-64 h-48 md:h-64 bg-blue-500/10 rounded-full blur-3xl -mr-10 md:-mr-20 -mt-10 md:-mt-20 group-hover:bg-blue-500/20 transition-all duration-1000 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 md:w-64 h-48 md:h-64 bg-purple-500/10 rounded-full blur-3xl -ml-10 md:-ml-20 -mb-10 md:-mb-20 group-hover:bg-purple-500/20 transition-all duration-1000 pointer-events-none"></div>
        
        <div className="border-b border-white/10 pb-4 md:pb-6 pt-6 md:pt-8 px-5 md:px-8 relative z-10">
          <h3 className="flex items-center gap-2 md:gap-3 text-lg md:text-2xl font-black">
            <div className="p-2 md:p-3 bg-blue-500/20 text-blue-400 rounded-xl backdrop-blur-md border border-blue-500/30 shrink-0">
              <BrainCircuit size={24} className="md:w-7 md:h-7" />
            </div>
            تقرير الذكاء الاصطناعي
          </h3>
        </div>
        
        <div className="p-5 md:p-10 relative z-10">
          {!aiReport ? (
            <div className="text-center py-8 md:py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 md:w-24 md:h-24 rounded-full bg-blue-500/10 mb-6 md:mb-8 border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                <Sparkles className="h-8 w-8 md:h-12 md:w-12 text-blue-400" />
              </div>
              <p className="text-slate-300 mb-8 md:mb-10 text-sm md:text-xl max-w-2xl mx-auto leading-relaxed font-medium px-2">
                احصل على رؤية عميقة وتحليل استراتيجي لموقف الشراكة المالي باستخدام الذكاء الاصطناعي
              </p>
              
              <button 
                onClick={generateAiReport} 
                disabled={generatingAi} 
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-6 py-4 md:px-10 md:py-6 text-base md:text-xl font-black rounded-xl md:rounded-2xl shadow-lg shadow-blue-900/30 transition-all hover:scale-105 hover:shadow-blue-900/50 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-3"
              >
                {generatingAi ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    جاري إعداد التقرير...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} className="md:w-6 md:h-6" />
                    توليد التقرير
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="bg-white/5 backdrop-blur-xl p-5 md:p-10 rounded-2xl md:rounded-3xl border border-white/10 shadow-2xl animate-in slide-in-from-bottom-4">
              <div className="flex items-center gap-2 mb-4 md:mb-6 text-blue-400 font-bold border-b border-white/10 pb-4 text-sm md:text-base">
                 <CheckCircle2 size={18} className="md:w-5 md:h-5 shrink-0"/> تم التوليد بنجاح عبر Gemini AI
              </div>
              <div className="whitespace-pre-wrap text-slate-200 leading-relaxed text-sm md:text-lg font-medium">
                 {aiReport}
              </div>
              <div className="mt-6 md:mt-8 pt-5 md:pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs md:text-sm text-slate-400">
                <span className="font-bold bg-black/20 px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl border border-white/5 w-full sm:w-auto text-center">⚠️ يرجى المراجعة البشرية</span>
                <button 
                  onClick={() => setAiReport(null)} 
                  className="text-blue-400 w-full sm:w-auto hover:text-blue-300 hover:bg-blue-500/10 rounded-lg md:rounded-xl font-bold px-5 py-2.5 transition-colors border border-blue-500/30 text-center"
                >
                  إعادة التوليد
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}