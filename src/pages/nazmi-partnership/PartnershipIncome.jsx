import React, { useState } from 'react';
import { TrendingUp, Landmark, Banknote, History, Plus, X, Save, Pen, Trash2, ChevronDown } from 'lucide-react';
import { nazmiService } from '../../services/nazmiService';

export default function PartnershipIncome({ settings, transactions, reload }) {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc');

  const initialForm = { 
    date: new Date().toISOString().split('T')[0], 
    category: 'بنك', 
    amount: '', 
    currency: 'SAR', 
    description: '', 
    reference: '' 
  };
  const [form, setForm] = useState(initialForm);

  const allIncomes = transactions.filter(t => t.type === 'إيراد');
  
  // فلترة + فرز
  const filteredIncomes = allIncomes.filter(inc => 
    filterCategory === 'all' ? true : inc.category === filterCategory
  ).sort((a, b) => 
    sortOrder === 'desc' ? new Date(b.date) - new Date(a.date) : new Date(a.date) - new Date(b.date)
  );
  
  const totalBank = allIncomes.filter(i => i.category === 'بنك').reduce((s, i) => s + i.amount, 0);
  const totalCash = allIncomes.filter(i => i.category === 'كاش').reduce((s, i) => s + i.amount, 0);

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
        await nazmiService.updateTransaction(editingId, { ...form, type: 'إيراد', partnershipId: settings.id });
      } else {
        await nazmiService.addTransaction({ ...form, type: 'إيراد', partnershipId: settings.id });
      }
      closeModal();
      reload();
    } catch (error) { alert("حدث خطأ أثناء الحفظ"); }
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm("حذف هذا الإيراد نهائياً؟")) {
      await nazmiService.deleteTransaction(id);
      reload();
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4 animate-in fade-in duration-300 px-1">
      
      {/* ✅ Summary Cards - Compact Mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
        <SummaryCard 
          title="إجمالي الإيرادات" 
          amount={totalBank + totalCash} 
          color="from-blue-600 to-blue-800" 
          icon={<TrendingUp size={16}/>} 
        />
        <SummaryCard 
          title="إيرادات بنكية" 
          amount={totalBank} 
          color="from-indigo-500 to-indigo-700" 
          icon={<Landmark size={16}/>} 
        />
        <SummaryCard 
          title="إيرادات كاش" 
          amount={totalCash} 
          color="from-emerald-500 to-emerald-700" 
          icon={<Banknote size={16}/>} 
        />
      </div>

      {/* ✅ Header & Actions - Compact */}
      <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-sm border border-slate-200">
        <div className="flex flex-col gap-3">
          <h3 className="text-base font-black text-slate-800 flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg sm:rounded-xl">
              <History size={18} />
            </div>
            سجل الإيرادات
          </h3>
          
          <div className="flex flex-wrap gap-2">
            {/* 📱 Mobile: Filter & Sort */}
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full sm:w-24 h-9 px-2.5 pr-7 rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-bold appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">الكل</option>
                  <option value="بنك">بنك</option>
                  <option value="كاش">كاش</option>
                </select>
                <ChevronDown size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

              <div className="relative flex-1 sm:flex-none">
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full sm:w-24 h-9 px-2.5 pr-7 rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-bold appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="desc">الأحدث</option>
                  <option value="asc">الأقدم</option>
                </select>
                <ChevronDown size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Add Button */}
            <button 
              onClick={() => openModal()} 
              className="flex-1 sm:flex-none h-9 px-4 flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-sm font-bold text-[11px] transition-all min-w-[40px]"
            >
              <Plus size={14}/> إضافة
            </button>
          </div>
        </div>
      </div>

      {/* ✅ Income List - Mobile Cards + Desktop Table */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* 📱 Mobile: Card View */}
        <div className="sm:hidden divide-y divide-slate-100">
          {filteredIncomes.length === 0 ? (
            <div className="text-center py-10 text-slate-400 font-bold text-sm">لا توجد إيرادات مسجلة</div>
          ) : (
            filteredIncomes.map((inc) => (
              <IncomeCard 
                key={inc.id} 
                item={inc} 
                onEdit={() => openModal(inc)}
                onDelete={() => handleDelete(inc.id)}
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
              {filteredIncomes.map((inc) => (
                <tr key={inc.id} className="hover:bg-blue-50/40 transition-colors group">
                  <td className="px-4 py-3 font-medium text-slate-500">{new Date(inc.date).toLocaleDateString('ar-EG')}</td>
                  <td className="px-4 py-3 font-black text-slate-800 max-w-[150px] truncate">{inc.description}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-black border shadow-sm ${
                      inc.category === 'بنك' 
                        ? 'bg-blue-50 text-blue-700 border-blue-200' 
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {inc.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <CurrencyDisplay amount={inc.amount} compact />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5 justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => openModal(inc)} 
                        className="px-2.5 py-1.5 rounded-md hover:bg-blue-100 text-blue-600 font-bold text-[10px] flex items-center gap-1 transition-all min-h-[32px]"
                      >
                        <Pen size={12}/> تعديل
                      </button>
                      <button 
                        onClick={() => handleDelete(inc.id)} 
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
              <h3 className="font-black text-slate-800 text-sm flex items-center gap-2 text-blue-700">
                <Plus size={16} /> {editingId ? "تعديل" : "إضافة إيراد"}
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
                      className="w-full h-9 px-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-[11px] font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                      value={form.category} 
                      onChange={e => setForm({...form, category: e.target.value})}
                    >
                      <option value="بنك">بنك</option>
                      <option value="كاش">كاش</option>
                    </select>
                  </div>
                </div>

                {/* Amount & Reference */}
                <div className="grid grid-cols-2 gap-3">
                  <InputCompact 
                    label="القيمة (SAR)" 
                    type="number" 
                    inputMode="numeric"
                    value={form.amount} 
                    onChange={v => setForm({...form, amount: v})} 
                  />
                  <InputCompact 
                    label="المرجع" 
                    value={form.reference} 
                    onChange={v => setForm({...form, reference: v})}
                    required={false}
                    placeholder="رقم التحويل"
                  />
                </div>

                {/* Description */}
                <div>
                  <InputCompact 
                    label="الوصف" 
                    value={form.description} 
                    onChange={v => setForm({...form, description: v})}
                    placeholder="مثال: دفعة عميل أحمد"
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
                    className="flex-[2] bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white h-9 rounded-lg font-black shadow-sm flex items-center justify-center gap-1.5 transition-all text-xs disabled:opacity-50"
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
  );
}

// ✅ Mobile Income Card Component
function IncomeCard({ item, onEdit, onDelete }) {
  return (
    <div className="p-3 space-y-2.5">
      {/* Header */}
      <div className="flex justify-between items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold text-slate-500">
            {new Date(item.date).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })}
          </p>
          <p className="font-black text-slate-800 text-sm mt-0.5 truncate">{item.description}</p>
          {item.reference && (
            <p className="text-[10px] text-slate-400 mt-0.5 truncate">Ref: {item.reference}</p>
          )}
        </div>
        <div className="flex gap-1 shrink-0">
          <button 
            onClick={onEdit}
            className="p-1.5 rounded-md hover:bg-blue-100 text-blue-600 transition-all min-w-[32px] min-h-[32px] flex items-center justify-center"
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
        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black border ${
          item.category === 'بنك' 
            ? 'bg-blue-50 text-blue-700 border-blue-200' 
            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
        }`}>
          {item.category}
        </span>
        <span className="font-black text-blue-700 text-base">
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
        className="w-full h-9 px-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-[11px] font-bold outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-slate-400" 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        required={required}
        placeholder={placeholder}
      />
    </div>
  );
}

// ✅ Currency Display - Compact
function CurrencyDisplay({ amount, compact = false }) {
  return (
    <div className={`flex flex-col items-end font-cairo ${compact ? 'gap-0' : 'gap-0.5'}`}>
      <span className={`font-black ${compact ? 'text-base' : 'text-lg'} text-blue-700`}>
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