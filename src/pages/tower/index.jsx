import React, { useState, useEffect } from "react";
import {
  Building2,
  Download,
  Plus,
  Sparkles,
  Cpu,
  Calculator,
  History,
  Trash2,
  Pen,
  X,
  Save
} from "lucide-react";
import { partnershipService } from "../../services/partnershipService";

export default function TaibaPartnershipPage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // التحكم في النافذة المنبثقة
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const initialFormState = {
    type: "أرض",
    amount: "",
    currency: "SAR",
    paidBy: "أنا",
    date: new Date().toISOString().split("T")[0],
    description: "",
  };
  const [formData, setFormData] = useState(initialFormState);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await partnershipService.getExpenses();
      setExpenses(data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await partnershipService.updateExpense(editingId, formData);
    } else {
      await partnershipService.addExpense(formData);
    }
    closeModal();
    loadData();
  };

  const handleEdit = (item) => {
    setFormData({
      ...item,
      date: new Date(item.date).toISOString().split("T")[0],
    });
    setEditingId(item.id);
    setShowModal(true); // فتح النافذة المنبثقة
  };

  const handleDelete = async (id) => {
    if (window.confirm("هل أنت متأكد من حذف هذا المصروف؟")) {
      await partnershipService.deleteExpense(id);
      loadData();
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData(initialFormState);
  };

  // الحسابات
  const totalLand = expenses
    .filter((e) => e.type === "أرض")
    .reduce((sum, e) => sum + e.amount, 0);
  const totalBuilding = expenses
    .filter((e) => e.type === "بناء")
    .reduce((sum, e) => sum + e.amount, 0);
  const grandTotal = totalLand + totalBuilding;

  const myPayments = expenses
    .filter((e) => e.paidBy === "أنا")
    .reduce((sum, e) => sum + e.amount, 0);
  const brotherPayments = expenses
    .filter((e) => e.paidBy === "أخي")
    .reduce((sum, e) => sum + e.amount, 0);
  const difference = Math.abs(myPayments - brotherPayments);
  const inFavorOf =
    myPayments > brotherPayments
      ? "لصالحي"
      : myPayments < brotherPayments
        ? "لصالح أخي"
        : "متعادل";

  return (
    <div
      className="flex-1 overflow-y-auto p-3 md:p-6 pb-20 font-cairo relative"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="p-3 md:p-4 bg-gradient-to-br from-indigo-100 to-blue-200 text-indigo-700 rounded-xl shadow-inner">
              <Building2 size={24} className="md:w-7 md:h-7" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-800">
                شراكة عمارة طيبة
              </h1>
              <p className="text-slate-500 mt-1 text-xs md:text-sm font-medium">
                إدارة تكاليف الأرض والبناء والتسويات
              </p>
            </div>
          </div>
          <div className="flex flex-row items-center gap-2 md:gap-3 w-full md:w-auto">
            <button className="flex-1 md:flex-none whitespace-nowrap px-4 py-2 flex items-center justify-center gap-2 h-11 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-bold text-slate-700 transition-colors text-xs md:text-sm">
              <Download size={16} /> تصدير
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex-[2] md:flex-none whitespace-nowrap px-4 py-2 flex items-center justify-center gap-2 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md transition-all text-xs md:text-sm"
            >
              <Plus size={16} /> تسجيل مصروف
            </button>
          </div>
        </div>

        {/* AI Insight Header */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 md:p-5 border border-purple-100 shadow-sm">
          <div className="flex items-center justify-between mb-2 md:mb-3">
            <div className="flex flex-col">
              <h3 className="font-bold text-purple-900 flex items-center gap-2 text-sm md:text-base">
                <Sparkles size={16} className="text-purple-600" /> رؤى ذكية -
                عمارة طيبة
              </h3>
              <div className="flex items-center gap-1 mt-1 opacity-60">
                <Cpu size={10} className="text-blue-500" />{" "}
                <span className="text-[9px] font-bold text-slate-500 uppercase">
                  Gemini AI
                </span>
              </div>
            </div>
          </div>
          <div className="text-slate-700 text-xs md:text-sm leading-relaxed whitespace-pre-wrap font-medium">
            1. **توثيق الملكية:** مساهمتك تمثل حالياً **
            {grandTotal > 0 ? ((myPayments / grandTotal) * 100).toFixed(1) : 0}
            %** من الإجمالي.
            <br />
            2. **تسوية الفجوة:** يوجد فرق قدره **{difference.toLocaleString()}{" "}
            ريال** {inFavorOf}.
          </div>
        </div>

        {/* 3 Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-6">
          <SummaryCard
            title="إجمالي تكلفة الأرض"
            amount={totalLand}
            color="from-amber-400 to-amber-600"
            iconColor="text-amber-500"
          />
          <SummaryCard
            title="إجمالي تكلفة البناء"
            amount={totalBuilding}
            color="from-blue-400 to-blue-600"
            iconColor="text-blue-500"
          />

          <div className="shadow-lg rounded-2xl overflow-hidden relative bg-gradient-to-br from-slate-900 to-slate-800 text-white">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Calculator size={80} />
            </div>
            <div className="p-4 md:p-6 pb-2 relative z-10">
              <h3 className="text-xs md:text-sm text-slate-300 font-bold flex items-center gap-2">
                <Calculator size={14} /> إجمالي التكلفة
              </h3>
            </div>
            <div className="p-4 md:p-6 pt-0 relative z-10">
              <CurrencyDisplay amount={grandTotal} textColor="text-white" />
            </div>
          </div>
        </div>

        {/* Settlements & AI Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* موقف الشركاء */}
          <div className="bg-white shadow-lg rounded-2xl overflow-hidden relative border border-slate-200 flex flex-col h-full">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
            <div className="p-4 md:p-6 border-b border-slate-100 bg-slate-50/50 pb-3 md:pb-4">
              <h3 className="flex items-center gap-2 text-slate-800 font-black text-base md:text-lg">
                <Calculator size={18} className="text-blue-600" /> موقف الشركاء
                والتسويات
              </h3>
            </div>
            <div className="p-4 md:p-6 space-y-3 md:space-y-4 flex-1">
              <div className="flex justify-between items-center p-3 md:p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                <span className="font-bold text-slate-700 flex items-center gap-2 text-xs md:text-sm">
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>ما
                  دفعته أنا:
                </span>
                <CurrencyDisplay
                  amount={myPayments}
                  align="items-end"
                  textColor="text-slate-800"
                />
              </div>
              <div className="flex justify-between items-center p-3 md:p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                <span className="font-bold text-slate-700 flex items-center gap-2 text-xs md:text-sm">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>ما
                  دفعه أخي:
                </span>
                <CurrencyDisplay
                  amount={brotherPayments}
                  align="items-end"
                  textColor="text-slate-800"
                />
              </div>
              <div className="pt-3 md:pt-4 border-t border-slate-100 mt-4 md:mt-6">
                <div className="flex justify-between items-center p-4 md:p-5 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100 shadow-sm">
                  <span className="font-black text-amber-900 text-sm md:text-lg">
                    الفرق (للتسوية):
                  </span>
                  <div className="text-right">
                    <CurrencyDisplay
                      amount={difference}
                      align="items-end"
                      textColor="text-amber-700"
                    />
                    <span className="text-[10px] md:text-xs font-bold text-amber-600 mt-1 bg-amber-100/50 px-2 py-0.5 rounded-md inline-block">
                      ({inFavorOf})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Strategy */}
          <div className="bg-white shadow-lg rounded-2xl overflow-hidden relative border border-slate-200 flex flex-col h-full">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-400 to-purple-500"></div>
            <div className="p-4 md:p-6 border-b border-slate-100 bg-slate-50/50 pb-3 md:pb-4 flex justify-between items-center">
              <h3 className="flex items-center gap-2 text-slate-800 font-black text-base md:text-lg">
                <Sparkles size={18} className="text-indigo-600" /> تحليل
                استراتيجي
              </h3>
            </div>
            <div className="p-4 md:p-6 flex-1 flex flex-col justify-center">
              <div className="text-center py-10 md:py-16 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 shadow-sm border border-slate-100">
                  <Sparkles size={24} className="text-indigo-300 md:w-8 md:h-8" />
                </div>
                <p className="text-xs md:text-sm font-bold text-slate-600 px-4">
                  هذا القسم متصل بمحرك Gemini لتحليل فجوات الدفع آلياً.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* History Table */}
        <div className="bg-white shadow-lg rounded-2xl overflow-hidden relative border border-slate-200">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-400 to-slate-600"></div>
          <div className="p-4 md:p-6 border-b border-slate-100 bg-slate-50/50 pb-3 md:pb-4">
            <h3 className="flex items-center gap-2 text-slate-800 font-black text-base md:text-lg">
              <History size={18} className="text-slate-500" /> سجل المصروفات
              التفصيلي
            </h3>
          </div>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-right whitespace-nowrap md:whitespace-normal">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-100 text-[10px] md:text-xs uppercase">
                <tr>
                  <th className="px-4 md:px-6 py-3 md:py-4 font-bold">التاريخ</th>
                  <th className="px-4 md:px-6 py-3 md:py-4 font-bold">الوصف</th>
                  <th className="px-4 md:px-6 py-3 md:py-4 font-bold">النوع</th>
                  <th className="px-4 md:px-6 py-3 md:py-4 font-bold">بواسطة</th>
                  <th className="px-4 md:px-6 py-3 md:py-4 font-bold">القيمة</th>
                  <th className="px-4 md:px-6 py-3 md:py-4 font-bold text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs md:text-sm">
                {expenses.map((exp) => (
                  <tr
                    key={exp.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="px-4 md:px-6 py-3 md:py-4 font-medium text-slate-500">
                      {new Date(exp.date).toLocaleDateString("ar-EG")}
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4 font-bold text-slate-900 max-w-[150px] truncate">
                      {exp.description}
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4">
                      <span
                        className={`inline-flex px-2 py-1 md:px-3 md:py-1.5 rounded-lg md:rounded-xl text-[9px] md:text-xs font-bold border ${
                          exp.type === "أرض"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        }`}
                      >
                        {exp.type}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4 font-bold text-slate-700">
                      <span className="bg-slate-100 px-2 py-1 md:px-3 md:py-1.5 rounded-md md:rounded-lg border border-slate-200 text-[10px] md:text-xs">
                        {exp.paidBy}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4">
                      <div className="flex flex-col items-end gap-1">
                        <span className="font-black text-slate-900 text-sm md:text-base">
                          {exp.amount.toLocaleString()} SAR
                        </span>
                        <div className="flex gap-1.5 text-[8px] md:text-[10px] font-bold">
                          <span className="bg-blue-50 text-blue-700 px-1 py-0.5 rounded border border-blue-100">
                            USD $
                            {(exp.amount * 0.2667).toLocaleString(undefined, {
                              maximumFractionDigits: 0,
                            })}
                          </span>
                          <span className="bg-emerald-50 text-emerald-700 px-1 py-0.5 rounded border border-emerald-100">
                            EGP{" "}
                            {(exp.amount * 12.8).toLocaleString(undefined, {
                              maximumFractionDigits: 0,
                            })}
                          </span>
                        </div>
                      </div>
                    </td>
                    {/* في الموبايل الأزرار ظاهرة دائماً، في الكمبيوتر تظهر عند الـ hover */}
                    <td className="px-4 md:px-6 py-3 md:py-4 flex gap-2 justify-center opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(exp)}
                        className="px-2 py-1.5 md:px-3 md:py-1.5 rounded-lg hover:bg-indigo-50 text-indigo-600 font-bold text-[10px] md:text-xs flex items-center gap-1 bg-slate-50 md:bg-transparent border border-slate-200 md:border-transparent"
                      >
                        <Pen size={12} /> <span className="hidden sm:inline">تعديل</span>
                      </button>
                      <button
                        onClick={() => handleDelete(exp.id)}
                        className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 bg-red-50/50 md:bg-transparent border border-red-100 md:border-transparent"
                      >
                        <Trash2 size={14} className="md:w-4 md:h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {expenses.length === 0 && (
                  <tr>
                    <td
                      colSpan="6"
                      className="text-center py-10 text-slate-400 font-bold text-xs md:text-sm"
                    >
                      لا توجد مصروفات مسجلة بعد
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- POPUP MODAL (نافذة منبثقة متجاوبة) --- */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-2xl rounded-t-3xl sm:rounded-3xl shadow-2xl animate-in slide-in-from-bottom-10 overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-4 md:p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-black text-slate-800 text-sm md:text-base flex items-center gap-2">
                <Plus size={18} className="text-indigo-600"/>
                {editingId ? "تعديل المصروف" : "تسجيل مصروف جديد"}
              </h3>
              <button
                onClick={closeModal}
                className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 md:p-6 overflow-y-auto custom-scrollbar">
              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                  
                  <div className="space-y-1.5">
                    <label className="text-[11px] md:text-xs font-black text-slate-500 uppercase">
                      نوع المصروف
                    </label>
                    <select
                      className="w-full h-11 md:h-12 px-3 md:px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white transition-colors text-xs md:text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                      <option value="أرض">شراء أرض</option>
                      <option value="بناء">تكاليف بناء</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] md:text-xs font-black text-slate-500 uppercase">
                      المبلغ (القيمة)
                    </label>
                    <input
                      className="w-full h-11 md:h-12 px-3 md:px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs md:text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                      type="number"
                      required
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] md:text-xs font-black text-slate-500 uppercase">
                      العملة
                    </label>
                    <select
                      className="w-full h-11 md:h-12 px-3 md:px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white transition-colors text-xs md:text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    >
                      <option value="SAR">SAR - ريال سعودي</option>
                      <option value="USD">USD - دولار أمريكي</option>
                      <option value="EGP">EGP - جنيه مصري</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] md:text-xs font-black text-slate-500 uppercase">
                      من قام بالدفع؟
                    </label>
                    <div className="flex gap-2">
                       <button 
                         type="button"
                         onClick={() => setFormData({...formData, paidBy: 'أنا'})}
                         className={`flex-1 h-11 md:h-12 rounded-xl text-xs md:text-sm font-black border transition-all ${formData.paidBy === 'أنا' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}
                       >أنا (مصطفى)</button>
                       <button 
                         type="button"
                         onClick={() => setFormData({...formData, paidBy: 'أخي'})}
                         className={`flex-1 h-11 md:h-12 rounded-xl text-xs md:text-sm font-black border transition-all ${formData.paidBy === 'أخي' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}
                       >أخي (الشريك)</button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] md:text-xs font-black text-slate-500 uppercase">
                      تاريخ المصروف
                    </label>
                    <input
                      className="w-full h-11 md:h-12 px-3 md:px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs md:text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[11px] md:text-xs font-black text-slate-500 uppercase">
                      وصف دقيق للمصروف
                    </label>
                    <input
                      className="w-full h-11 md:h-12 px-3 md:px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs md:text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                      placeholder="مثال: دفعة أولى للأرض، حفر، حديد تسليح..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-slate-100 mt-4 md:mt-6">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 py-3 md:py-3.5 rounded-xl font-black text-slate-600 bg-slate-100 hover:bg-slate-200 text-xs md:text-sm transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white py-3 md:py-3.5 rounded-xl font-black shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 transition-all text-xs md:text-sm"
                  >
                    <Save size={16} /> حفظ البيانات
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// مكونات مساعدة
function SummaryCard({ title, amount, color, iconColor }) {
  return (
    <div className="bg-white border-slate-200 border-0 shadow-md rounded-2xl overflow-hidden relative">
      <div
        className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${color}`}
      ></div>
      <div className="p-4 md:p-6 pb-2">
        <h3 className="text-xs md:text-sm text-slate-500 font-bold flex items-center gap-2">
          <Building2 size={14} className={`${iconColor} md:w-4 md:h-4`} /> {title}
        </h3>
      </div>
      <div className="p-4 md:p-6 pt-0">
        <CurrencyDisplay amount={amount} />
      </div>
    </div>
  );
}

function CurrencyDisplay({
  amount,
  align = "items-start",
  textColor = "text-slate-900",
}) {
  return (
    <div className={`flex flex-col gap-1 font-cairo ${align}`}>
      <div className="flex items-center gap-2">
        <span className={`font-black text-lg md:text-xl ${textColor}`}>
          SAR {amount.toLocaleString()}
        </span>
      </div>
      <div className="flex flex-wrap gap-x-2 md:gap-x-4 gap-y-1 text-[10px] md:text-xs font-bold mt-1">
        <div className="flex items-center gap-1 text-blue-700 bg-blue-50 px-1.5 md:px-2 py-0.5 rounded-md border border-blue-100">
          <span className="text-[8px] md:text-[10px] opacity-70">USD</span> $
          {(amount * 0.2667).toLocaleString(undefined, {
            maximumFractionDigits: 0,
          })}
        </div>
        <div className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-1.5 md:px-2 py-0.5 rounded-md border border-emerald-100">
          <span className="text-[8px] md:text-[10px] opacity-70">EGP</span> EGP{" "}
          {(amount * 12.8).toLocaleString(undefined, {
            maximumFractionDigits: 0,
          })}
        </div>
      </div>
    </div>
  );
}