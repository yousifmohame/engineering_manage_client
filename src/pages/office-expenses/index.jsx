import React, { useState, useEffect } from 'react';
import { TrendingDown, Calendar, BrainCircuit, Receipt, History, Plus, X, Save, Pen, Trash2, ChevronDown } from 'lucide-react';
import { nazmiService } from '../../services/nazmiService';

export default function PartnershipExpensesPage() {
  // 1. إضافة الـ States الخاصة بالبيانات والتحميل
  const [transactions, setTransactions] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  // States الخاصة بالواجهة
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showRecurringOnly, setShowRecurringOnly] = useState(false);
  const [sortOrder, setSortOrder] = useState('desc');

  const initialForm = { 
    date: new Date().toISOString().split('T')[0], 
    category: 'مكتب', 
    amount: '', 
    currency: 'SAR', 
    description: '', 
    isRecurring: false 
  };
  const [form, setForm] = useState(initialForm);

  // 2. دالة جلب البيانات من الباك-أند مباشرة
  const loadData = async () => {
    setLoading(true);
    try {
      const data = await nazmiService.getData();
      setTransactions(data.transactions || []);
      setSettings(data); // نحتفظ بالبيانات للحصول على settings.id لاحقاً
    } catch (error) {
      console.error("Error loading expenses data:", error);
    }
    setLoading(false);
  };

  // 3. جلب البيانات عند فتح الشاشة
  useEffect(() => {
    loadData();
  }, []);

  // الحسابات
  const allExpenses = transactions.filter(t => t.type === 'مصروف');
  
  // فرز + فلترة
  const filteredExpenses = showRecurringOnly ? allExpenses.filter(e => e.isRecurring) : allExpenses;
  const displayExpenses = filteredExpenses.sort((a, b) => 
    sortOrder === 'desc' ? new Date(b.date) - new Date(a.date) : new Date(a.date) - new Date(b.date)
  );
  
  const totalExp = allExpenses.reduce((s, i) => s + i.amount, 0);
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyExp = allExpenses.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).reduce((s, i) => s + i.amount, 0);

  const openModal = (itemToEdit = null) => {
    if (itemToEdit) {
      setForm({ ...itemToEdit, date: new Date(itemToEdit.date).toISOString().split('T')[0] });
      setEditingId(itemToEdit.id);
    } else {
      setForm(initialForm);
      setEditingId(null);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm(initialForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await nazmiService.updateTransaction(editingId, { ...form, type: 'مصروف', partnershipId: settings?.id });
      } else {
        await nazmiService.addTransaction({ ...form, type: 'مصروف', partnershipId: settings?.id });
      }
      closeModal();
      loadData(); // تحديث البيانات من السيرفر بعد الحفظ
    } catch (error) { alert("حدث خطأ أثناء الحفظ"); }
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm("حذف هذا المصروف نهائياً؟")) {
      await nazmiService.deleteTransaction(id);
      loadData(); // تحديث البيانات من السيرفر بعد الحذف
    }
  };

  // شاشة تحميل مبدئية أثناء الاتصال بالـ API
  if (loading) {
    return <div className="p-10 text-center text-slate-500 font-bold animate-pulse">جاري تحميل المصروفات...</div>;
  }

  return (
    // 4. تغليف المكون بحاوية صفحة كاملة (Page Container)
    <div className="flex-1 overflow-x-hidden overflow-y-auto p-3 md:p-6 pb-24 font-cairo bg-slate-50/50 min-h-screen" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        
        {/* Header للصفحة المستقلة */}
        <div className="bg-white p-4 md:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="p-3 bg-red-100 text-red-600 rounded-xl">
              <Receipt size={24} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-800">سجل المصروفات المستقل</h1>
              <p className="text-xs md:text-sm font-bold text-slate-500 mt-1">إدارة جميع مصاريف الشراكة بشكل مستقل</p>
            </div>
          </div>
        </div>

        {/* ✅ Summary Cards - Compact Mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
          <SummaryCard 
            title="إجمالي المصاريف" 
            amount={totalExp} 
            color="from-red-600 to-red-800" 
            icon={<TrendingDown size={16}/>} 
          />
          <SummaryCard 
            title="مصاريف هذا الشهر" 
            amount={monthlyExp} 
            color="from-amber-500 to-amber-700" 
            icon={<Calendar size={16}/>} 
          />
          <div 
            className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg relative overflow-hidden active:scale-[0.98] transition-transform cursor-pointer"
            onClick={() => alert('ميزة قادمة قريباً! 🤖')}
          >
             <div className="absolute -right-3 -top-3 w-16 h-16 bg-white opacity-10 rounded-full blur-xl"></div>
             <div className="relative z-10 space-y-1.5">
                <h3 className="text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 opacity-90">
                  <BrainCircuit size={14}/> توقعات الذكاء
                </h3>
                <p className="text-[11px] sm:text-xs font-black drop-shadow-sm">توقع مصاريفك المستقبلية</p>
             </div>
          </div>
        </div>

        {/* ✅ Header & Actions - Compact */}
        <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-sm border border-slate-200">
          <div className="flex flex-col gap-3">
            <h3 className="text-base font-black text-slate-800 flex items-center gap-2.5">
              <div className="p-2 bg-red-100 text-red-600 rounded-lg sm:rounded-xl">
                <History size={18} />
              </div>
              سجل المصاريف التفصيلي
            </h3>
            
            <div className="flex flex-wrap gap-2">
              {/* 📱 Mobile: Sort & Filter Dropdowns */}
              <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="w-full sm:w-28 h-9 px-2.5 pr-7 rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-bold appearance-none focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="desc">الأحدث</option>
                    <option value="asc">الأقدم</option>
                  </select>
                  <ChevronDown size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>

                <button 
                  onClick={() => setShowRecurringOnly(!showRecurringOnly)} 
                  className={`flex-1 sm:flex-none h-9 px-3 flex items-center justify-center gap-1.5 rounded-lg border font-bold text-[11px] transition-all min-w-[40px] ${
                    showRecurringOnly 
                      ? 'bg-amber-100 text-amber-800 border-amber-200' 
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Calendar size={14}/> {showRecurringOnly ? 'الكل' : 'متكرر'}
                </button>
              </div>

              {/* Add Button */}
              <button 
                onClick={() => openModal()} 
                className="flex-1 sm:flex-none h-9 px-4 flex items-center justify-center gap-1.5 rounded-lg bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-sm font-bold text-[11px] transition-all min-w-[40px]"
              >
                <Plus size={14}/> إضافة
              </button>
            </div>
          </div>
        </div>

        {/* ✅ Expenses List - Mobile Cards + Desktop Table */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          
          {/* 📱 Mobile: Card View */}
          <div className="sm:hidden divide-y divide-slate-100">
            {displayExpenses.length === 0 ? (
              <div className="text-center py-10 text-slate-400 font-bold text-sm">لا توجد مصاريف مسجلة</div>
            ) : (
              displayExpenses.map((exp) => (
                <ExpenseCard 
                  key={exp.id} 
                  item={exp} 
                  onEdit={() => openModal(exp)}
                  onDelete={() => handleDelete(exp.id)}
                />
              ))
            )}
          </div>

          {/* 💻 Desktop: Table View */}
          <div className="hidden sm:block overflow-x-auto custom-scrollbar">
            <table className="w-full text-right">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-100 text-[10px] uppercase">
                <tr>
                  <th className="px-4 py-3 font-bold">التاريخ</th>
                  <th className="px-4 py-3 font-bold">الوصف</th>
                  <th className="px-4 py-3 font-bold">التصنيف</th>
                  <th className="px-4 py-3 font-bold">القيمة</th>
                  <th className="px-4 py-3 font-bold text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-[11px]">
                {displayExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-red-50/40 transition-colors group">
                    <td className="px-4 py-3 font-medium text-slate-500">{new Date(exp.date).toLocaleDateString('ar-EG')}</td>
                    <td className="px-4 py-3 font-black text-slate-800 max-w-[150px] truncate">{exp.description}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-black border shadow-sm transition-all ${
                        exp.isRecurring 
                          ? 'bg-amber-50 text-amber-700 border-amber-200' 
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {exp.category} {exp.isRecurring && <Calendar size={9} className="mr-0.5 inline"/>}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <CurrencyDisplay amount={exp.amount} color="text-red-700" compact />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5 justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openModal(exp)} 
                          className="px-2.5 py-1.5 rounded-md hover:bg-red-100 text-red-600 font-bold text-[10px] flex items-center gap-1 transition-all min-h-[32px]"
                        >
                          <Pen size={12}/> تعديل
                        </button>
                        <button 
                          onClick={() => handleDelete(exp.id)} 
                          className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center"
                          aria-label="حذف"
                        >
                          <Trash2 size={14}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ✅ Modal - Compact Bottom Sheet */}
        {showModal && (
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-0 sm:p-3"
            onClick={(e) => e.target === e.currentTarget && closeModal()}
          >
            <div className="bg-white w-full max-w-lg sm:max-w-2xl rounded-t-2xl sm:rounded-2xl shadow-2xl animate-in slide-in-from-bottom-10 overflow-hidden flex flex-col max-h-[92vh]">
              
              {/* Modal Header */}
              <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0 sticky top-0 z-10">
                <h3 className="font-black text-slate-800 text-sm flex items-center gap-2 text-red-700">
                  <Plus size={16} /> {editingId ? "تعديل" : "إضافة مصروف"}
                </h3>
                <button 
                  onClick={closeModal} 
                  className="p-1.5 hover:bg-slate-200 text-slate-500 rounded-lg transition-all min-w-[36px] min-h-[36px] flex items-center justify-center"
                  aria-label="إغلاق"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-3 overflow-y-auto custom-scrollbar flex-1">
                <form onSubmit={handleSubmit} className="space-y-4">
                  
                  {/* Date & Category */}
                  <div className="grid grid-cols-2 gap-3">
                    <InputCompact 
                      label="التاريخ" 
                      type="date" 
                      value={form.date} 
                      onChange={v => setForm({...form, date: v})} 
                    />
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase">التصنيف</label>
                      <select 
                        className="w-full h-9 px-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-[11px] font-bold outline-none focus:ring-2 focus:ring-red-500 transition-all" 
                        value={form.category} 
                        onChange={e => setForm({...form, category: e.target.value})}
                      >
                        <option value="مكتب">مكتب</option>
                        <option value="رواتب">رواتب</option>
                        <option value="فواتير">فواتير</option>
                        <option value="أدوات">أدوات</option>
                        <option value="أخرى">أخرى</option>
                      </select>
                    </div>
                  </div>

                  {/* Amount & Recurring */}
                  <div className="grid grid-cols-2 gap-3">
                    <InputCompact 
                      label="القيمة (SAR)" 
                      type="number" 
                      inputMode="numeric"
                      value={form.amount} 
                      onChange={v => setForm({...form, amount: v})} 
                    />
                    <div className="space-y-1.5 flex items-end">
                      <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 cursor-pointer bg-slate-50 px-2.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors h-9">
                        <input 
                          type="checkbox" 
                          className="rounded w-3.5 h-3.5 text-red-600 focus:ring-red-500" 
                          checked={form.isRecurring} 
                          onChange={e => setForm({...form, isRecurring: e.target.checked})} 
                        />
                        متكرر
                      </label>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <InputCompact 
                      label="الوصف" 
                      value={form.description} 
                      onChange={v => setForm({...form, description: v})}
                      placeholder="مثال: فاتورة كهرباء يناير"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-3 border-t border-slate-100">
                    <button 
                      type="button" 
                      onClick={closeModal} 
                      className="flex-1 h-9 rounded-lg font-black text-slate-600 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-xs transition-colors"
                    >
                      إلغاء
                    </button>
                    <button 
                      type="submit" 
                      disabled={submitting} 
                      className="flex-[2] bg-red-600 hover:bg-red-700 active:bg-red-800 text-white h-9 rounded-lg font-black shadow-sm flex items-center justify-center gap-1.5 transition-all text-xs disabled:opacity-50"
                    >
                      <Save size={14} /> {submitting ? 'جاري...' : 'حفظ'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ✅ Mobile Expense Card Component
function ExpenseCard({ item, onEdit, onDelete }) {
  const categoryColors = {
    'مكتب': 'bg-slate-100 text-slate-700 border-slate-200',
    'رواتب': 'bg-blue-50 text-blue-700 border-blue-200',
    'فواتير': 'bg-amber-50 text-amber-700 border-amber-200',
    'أدوات': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'أخرى': 'bg-purple-50 text-purple-700 border-purple-200',
  };

  return (
    <div className="p-3 space-y-2.5">
      {/* Header */}
      <div className="flex justify-between items-start gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-[10px] font-bold text-slate-500">
              {new Date(item.date).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })}
            </p>
            {item.isRecurring && (
              <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[9px] font-black rounded border border-amber-200">
                🔄 شهري
              </span>
            )}
          </div>
          <p className="font-black text-slate-800 text-sm mt-0.5 truncate">{item.description}</p>
        </div>
        <div className="flex gap-1 shrink-0">
          <button 
            onClick={onEdit}
            className="p-1.5 rounded-md hover:bg-red-100 text-red-600 transition-all min-w-[32px] min-h-[32px] flex items-center justify-center"
            aria-label="تعديل"
          >
            <Pen size={14} />
          </button>
          <button 
            onClick={onDelete}
            className="p-1.5 rounded-md hover:bg-red-100 text-slate-400 hover:text-red-600 transition-all min-w-[32px] min-h-[32px] flex items-center justify-center"
            aria-label="حذف"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Info Row */}
      <div className="flex items-center justify-between pt-1.5 border-t border-slate-100">
        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black border ${categoryColors[item.category] || categoryColors['أخرى']}`}>
          {item.category}
        </span>
        <span className="font-black text-red-700 text-base">
          {item.amount.toLocaleString()} <span className="text-[10px] font-normal opacity-70">SAR</span>
        </span>
      </div>
    </div>
  );
}

// ✅ Summary Card - Compact
function SummaryCard({ title, amount, color, icon }) {
  return (
    <div className={`bg-gradient-to-br ${color} text-white p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg relative overflow-hidden active:scale-[0.98] transition-transform`}>
       <div className="absolute -right-3 -top-3 w-16 h-16 bg-white opacity-10 rounded-full blur-xl"></div>
       <div className="relative z-10 space-y-1.5">
          <h3 className="text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 opacity-90">
            {icon} {title}
          </h3>
          <p className="text-lg sm:text-xl font-black drop-shadow-sm">
            {amount.toLocaleString()} <span className="text-[10px] font-normal opacity-75">SAR</span>
          </p>
          <div className="flex gap-1 pt-1 border-t border-white/10">
             <span className="bg-white/10 px-1.5 py-0.5 rounded text-[9px] font-bold">
               ${(amount*0.2667).toLocaleString(undefined,{maximumFractionDigits:0})}
             </span>
          </div>
       </div>
    </div>
  );
}

// ✅ Input Component - Compact Mobile
function InputCompact({ label, value, onChange, type = "text", inputMode, required = true, placeholder }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">
        {label}
      </label>
      <input 
        type={type} 
        inputMode={inputMode}
        className="w-full h-9 px-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-[11px] font-bold outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all placeholder:text-slate-400" 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        required={required}
        placeholder={placeholder}
      />
    </div>
  );
}

// ✅ Currency Display - Compact
function CurrencyDisplay({ amount, color = "text-slate-900", compact = false }) {
  return (
    <div className={`flex flex-col items-end font-cairo ${compact ? 'gap-0' : 'gap-0.5'}`}>
      <span className={`font-black ${compact ? 'text-base' : 'text-lg'} ${color}`}>
        {amount.toLocaleString()} <span className="text-[10px] font-normal opacity-70">SAR</span>
      </span>
      {!compact && (
        <div className="flex gap-1 text-[9px] font-bold opacity-70">
          <span className="bg-blue-50 text-blue-700 px-1 py-0.5 rounded border border-blue-100">
            ${(amount * 0.2667).toLocaleString(undefined, {maximumFractionDigits: 0})}
          </span>
        </div>
      )}
    </div>
  );
}