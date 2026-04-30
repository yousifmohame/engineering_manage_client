import React, { useState, useEffect } from "react";
import {
  BrainCircuit,
  Sparkles,
  Wallet,
  Send,
  Loader2,
  Bot,
  User,
} from "lucide-react";
// استيراد الخدمة الحقيقية التي أنشأناها
import { aiService } from "../../services/aiService";

export default function AiInsightsPage() {
  // حالة البيانات المالية الحقيقية
  const [financialData, setFinancialData] = useState({
    totalBanks: 0,
    totalSafe: 0,
    totalGold: 0,
    totalAssets: 0,
  });

  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // جلب البيانات المالية الحقيقية عند تحميل الصفحة
  useEffect(() => {
    const loadFinancials = async () => {
      try {
        const data = await aiService.getFinancialSummary();
        setFinancialData(data);
      } catch (error) {
        console.error("خطأ في تحميل الأرصدة:", error);
      } finally {
        setLoadingInitial(false);
      }
    };
    loadFinancials();
  }, []);

  // دالة إرسال السؤال للذكاء الاصطناعي بشكل حقيقي
  const handleAskAi = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    const userQuestion = prompt;
    setPrompt(""); // تفريغ الحقل فوراً لتجربة استخدام أسرع

    // إضافة سؤال المستخدم لشاشة المحادثة
    setChatHistory((prev) => [
      ...prev,
      { role: "user", content: userQuestion },
    ]);
    setIsGenerating(true);

    try {
      // إرسال الطلب الفعلي للخادم للحصول على الإجابة
      const response = await aiService.askAi(userQuestion, financialData);

      // إضافة رد الذكاء الاصطناعي للمحادثة
      setChatHistory((prev) => [
        ...prev,
        { role: "ai", content: response.reply },
      ]);
    } catch (error) {
      setChatHistory((prev) => [
        ...prev,
        {
          role: "ai",
          content:
            "عذراً، حدث خطأ أثناء الاتصال بالخادم. تأكد من أن السيرفر يعمل بشكل سليم.",
        },
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSuggestionClick = (suggestionText) => {
    setPrompt(suggestionText);
  };

  if (loadingInitial) {
    return (
      <div className="flex-1 flex justify-center items-center h-screen">
        <Loader2 className="animate-spin text-purple-600" size={40} />
      </div>
    );
  }

  return (
    <div
      className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 font-cairo bg-slate-50/50 min-h-screen"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto">
        

        <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-500">
          {/* عنوان القسم */}
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
              <Sparkles size={24} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                الرؤى الذكية
              </h1>
              <p className="text-slate-500 mt-1 text-sm md:text-base">
                احصل على تحليلات ونصائح مالية مخصصة باستخدام الذكاء الاصطناعي
              </p>
            </div>
          </div>

          {/* 🌟 نظرة عامة على الأصول المالية */}
          <div className="rounded-xl border border-slate-100 bg-white shadow-lg overflow-hidden">
            <div className="flex flex-col space-y-1.5 p-5 md:p-6 bg-slate-50/50 border-b border-slate-100">
              <h3 className="font-bold tracking-tight text-lg flex items-center gap-2 text-slate-800">
                <Wallet size={20} className="text-blue-600" />
                نظرة عامة على الأصول المالية
              </h3>
            </div>
            <div className="p-5 md:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 shadow-sm">
                  <p className="text-xs md:text-sm text-blue-800 font-bold mb-1">
                    إجمالي الحسابات البنكية
                  </p>
                  <div className="text-lg md:text-xl font-black text-blue-900">
                    {financialData.totalBanks.toLocaleString()} SAR
                  </div>
                </div>
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 shadow-sm">
                  <p className="text-xs md:text-sm text-emerald-800 font-bold mb-1">
                    إجمالي الكاش في الخزنة
                  </p>
                  <div className="text-lg md:text-xl font-black text-emerald-900">
                    {financialData.totalSafe.toLocaleString()} SAR
                  </div>
                </div>
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 shadow-sm">
                  <p className="text-xs md:text-sm text-amber-800 font-bold mb-1">
                    إجمالي قيمة الذهب
                  </p>
                  <div className="text-lg md:text-xl font-black text-amber-900">
                    {financialData.totalGold.toLocaleString()} SAR
                  </div>
                </div>
                <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 shadow-md">
                  <p className="text-xs md:text-sm text-slate-300 font-bold mb-1">
                    إجمالي الأصول
                  </p>
                  <div className="text-lg md:text-xl font-black text-white">
                    {financialData.totalAssets.toLocaleString()} SAR
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 🌟 منطقة عرض المحادثة (تظهر فقط إذا كان هناك أسئلة) */}
          {chatHistory.length > 0 && (
            <div className="rounded-xl border border-slate-100 bg-white shadow-lg p-5 md:p-6 space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
              {chatHistory.map((chat, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${chat.role === "user" ? "justify-start" : "justify-end flex-row-reverse"}`}
                >
                  <div
                    className={`p-2 rounded-full h-10 w-10 flex items-center justify-center shrink-0 ${chat.role === "user" ? "bg-slate-100 text-slate-600" : "bg-purple-100 text-purple-600"}`}
                  >
                    {chat.role === "user" ? (
                      <User size={20} />
                    ) : (
                      <Bot size={20} />
                    )}
                  </div>
                  <div
                    className={`p-4 rounded-2xl max-w-[85%] text-sm font-medium leading-relaxed ${
                      chat.role === "user"
                        ? "bg-slate-100 text-slate-800 rounded-tr-none"
                        : "bg-purple-600 text-white rounded-tl-none shadow-md"
                    }`}
                  >
                    {chat.content}
                  </div>
                </div>
              ))}
              {isGenerating && (
                <div className="flex gap-3 flex-row-reverse">
                  <div className="p-2 rounded-full h-10 w-10 flex items-center justify-center shrink-0 bg-purple-100 text-purple-600">
                    <Loader2 size={20} className="animate-spin" />
                  </div>
                  <div className="p-4 rounded-2xl bg-purple-100 text-purple-800 rounded-tl-none font-bold text-sm flex items-center gap-2">
                    جاري تحليل البيانات...
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 🌟 حقل الإدخال (السؤال) */}
          <div className="rounded-xl border border-slate-100 bg-white shadow-lg overflow-hidden transition-all focus-within:ring-2 focus-within:ring-purple-200">
            <div className="p-5 md:p-6">
              <form onSubmit={handleAskAi} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">
                    اسأل المساعد المالي الذكي
                  </label>
                  <div className="flex gap-2">
                    <div className="w-full">
                      <input
                        className="flex h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
                        placeholder="مثال: كيف يمكنني تقليل مصروفاتي الشهرية؟ أو ما هو أفضل استثمار للمبلغ المتبقي؟"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        disabled={isGenerating}
                      />
                    </div>
                    <button
                      className="inline-flex items-center justify-center rounded-xl text-white h-12 px-5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all active:scale-95"
                      type="submit"
                      disabled={!prompt.trim() || isGenerating}
                    >
                      {isGenerating ? (
                        <Loader2 size={20} className="animate-spin" />
                      ) : (
                        <Send size={20} className="rotate-180" />
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* 🌟 البطاقات المقترحة السفلية */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div
              onClick={() =>
                handleSuggestionClick(
                  "قم بتحليل مصروفاتي في الشهر الأخير وأعطني نصائح للتوفير.",
                )
              }
              className="rounded-xl border border-slate-100 bg-white shadow-sm cursor-pointer hover:shadow-md hover:border-purple-200 hover:bg-purple-50 transition-all group"
            >
              <div className="p-4 text-center text-sm text-slate-600 group-hover:text-purple-800 font-bold">
                تحليل المصروفات والتوفير
              </div>
            </div>
            <div
              onClick={() =>
                handleSuggestionClick(
                  "لدي التزامات مالية، ما هي أفضل استراتيجية لسداد الأقساط بأمان؟",
                )
              }
              className="rounded-xl border border-slate-100 bg-white shadow-sm cursor-pointer hover:shadow-md hover:border-blue-200 hover:bg-blue-50 transition-all group"
            >
              <div className="p-4 text-center text-sm text-slate-600 group-hover:text-blue-800 font-bold">
                استراتيجية سداد الأقساط
              </div>
            </div>
            <div
              onClick={() =>
                handleSuggestionClick(
                  "متى يكون الوقت المناسب لشراء المزيد من الذهب أو بيعه؟",
                )
              }
              className="rounded-xl border border-slate-100 bg-white shadow-sm cursor-pointer hover:shadow-md hover:border-emerald-200 hover:bg-emerald-50 transition-all group"
            >
              <div className="p-4 text-center text-sm text-slate-600 group-hover:text-emerald-800 font-bold">
                نصائح استثمار الذهب
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
