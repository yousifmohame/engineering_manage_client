import React, { useState } from 'react';
import { TrendingDown, Calendar, BrainCircuit, Receipt, History, Plus, X, Save, Pen, Trash2, ChevronDown, Paperclip, ExternalLink } from 'lucide-react';
import { nazmiService } from '../../services/nazmiService';

const BASE_SERVER_URL = `${import.meta.env.VITE_API_URL}`;
const CATEGORIES_LIST = ['مكتب', 'رواتب', 'فواتير', 'أدوات', 'ايجار المقر', 'تاسيس وتشطيب', 'أخرى'];

export default function PartnershipExpenses({ settings, transactions, reload }) {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showRecurringOnly, setShowRecurringOnly] = useState(false);
  const [sortOrder, setSortOrder] = useState('desc');

  const initialForm = { 
    date: new Date().toISOString().split('T')[0], 
    categories: ['مكتب'], // تم التعديل ليكون مصفوفة لدعم التحديد المتعدد
    amount: '', 
    currency: 'SAR', 
    description: '', 
    isRecurring: false,
    recurrenceRate: 'شهرياً', // معدل التكرار الافتراضي
    attachmentFile: null,
    attachmentUrl: null
  };
  const [form, setForm] = useState(initialForm);

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
      setForm({ 
        ...itemToEdit, 
        date: new Date(itemToEdit.date).toISOString().split('T')[0],
        categories: itemToEdit.category ? itemToEdit.category.split(',') : ['مكتب'],
        attachmentUrl: itemToEdit.attachment || null,
        attachmentFile: null,
        recurrenceRate: itemToEdit.recurrenceRate || 'شهرياً'
      });
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

  // دالة لاختيار أو إلغاء اختيار التصنيف
  const toggleCategory = (cat) => {
    setForm(prev => {
      if (prev.categories.includes(cat)) {
        const newCats = prev.categories.filter(c => c !== cat);
        return { ...prev, categories: newCats.length ? newCats : ['أخرى'] };
      } else {
        return { ...prev, categories: [...prev.categories, cat] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // ✅ تجهيز FormData لإرسال الملفات والبيانات معاً
      const formData = new FormData();
      formData.append('date', form.date);
      formData.append('category', form.categories.join(',')); // إرسال التصنيفات كنص مفصول بفاصلة
      formData.append('amount', form.amount);
      formData.append('currency', form.currency);
      formData.append('description', form.description);
      formData.append('isRecurring', form.isRecurring);
      
      if (form.isRecurring) {
        formData.append('recurrenceRate', form.recurrenceRate);
      }
      
      formData.append('type', 'مصروف');
      formData.append('partnershipId', settings.id);

      // إرفاق الملف إن وجد
      if (form.attachmentFile) {
        formData.append('attachment', form.attachmentFile);
      }

      if (editingId) {
        await nazmiService.updateTransaction(editingId, formData);
      } else {
        await nazmiService.addTransaction(formData);
      }
      closeModal();
      reload();
    } catch (error) { 
      alert("حدث خطأ أثناء الحفظ"); 
    }
    setSubmitting(false);
  };

  const getFullUrl = (url) => {
    if (!url) return "";
    const fullPath = url.startsWith("http") ? url : `${BASE_SERVER_URL}${url}`;
    return encodeURI(fullPath);
  };

  const handleDelete = async (id) => {
    if (window.confirm("حذف هذا المصروف نهائياً؟")) {
      await nazmiService.deleteTransaction(id);
      reload();
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4 animate-in fade-in duration-300 px-1">
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
        <SummaryCard title="إجمالي المصاريف" amount={totalExp} color="from-red-600 to-red-800" icon={<TrendingDown size={16}/>} />
        <SummaryCard title="مصاريف هذا الشهر" amount={monthlyExp} color="from-amber-500 to-amber-700" icon={<Calendar size={16}/>} />
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

      {/* Header & Actions */}
      <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-sm border border-slate-200">
        <div className="flex flex-col gap-3">
          <h3 className="text-base font-black text-slate-800 flex items-center gap-2.5">
            <div className="p-2 bg-red-100 text-red-600 rounded-lg sm:rounded-xl">
              <History size={18} />
            </div>
            سجل المصاريف
          </h3>
          
          <div className="flex flex-wrap gap-2">
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
                  showRecurringOnly ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Calendar size={14}/> {showRecurringOnly ? 'الكل' : 'متكرر'}
              </button>
            </div>

            <button 
              onClick={() => openModal()} 
              className="flex-1 sm:flex-none h-9 px-4 flex items-center justify-center gap-1.5 rounded-lg bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-sm font-bold text-[11px] transition-all min-w-[40px]"
            >
              <Plus size={14}/> إضافة
            </button>
          </div>
        </div>
      </div>

      {/* Expenses List */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Mobile View */}
        <div className="sm:hidden divide-y divide-slate-100">
          {displayExpenses.length === 0 ? (
            <div className="text-center py-10 text-slate-400 font-bold text-sm">لا توجد مصاريف مسجلة</div>
          ) : (
            displayExpenses.map((exp) => (
              <ExpenseCard key={exp.id} item={exp} onEdit={() => openModal(exp)} onDelete={() => handleDelete(exp.id)} />
            ))
          )}
        </div>

        {/* Desktop View */}
        <div className="hidden sm:block overflow-x-auto custom-scrollbar">
          <table className="w-full text-right">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-100 text-[10px] uppercase">
              <tr>
                <th className="px-4 py-3 font-bold">التاريخ</th>
                <th className="px-4 py-3 font-bold">الوصف</th>
                <th className="px-4 py-3 font-bold">التصنيف</th>
                <th className="px-4 py-3 font-bold text-center">المرفقات</th>
                <th className="px-4 py-3 font-bold">القيمة</th>
                <th className="px-4 py-3 font-bold text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-[11px]">
              {displayExpenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-red-50/40 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-500">{new Date(exp.date).toLocaleDateString('ar-EG')}</td>
                  <td className="px-4 py-3 font-black text-slate-800 max-w-[150px] truncate">{exp.description}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {exp.category?.split(',').map((cat, i) => (
                         <span key={i} className={`inline-flex px-2 py-0.5 rounded text-[9px] font-black border bg-slate-100 text-slate-700 border-slate-200`}>
                           {cat}
                         </span>
                      ))}
                    </div>
                    {exp.isRecurring && (
                      <span className="mt-1 inline-block px-1.5 py-0.5 bg-amber-50 text-amber-700 text-[9px] font-bold rounded border border-amber-200">
                         <Calendar size={9} className="ml-0.5 inline"/> {exp.recurrenceRate || 'متكرر'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {exp.attachment ? (
                       <a href={getFullUrl(exp.attachment)} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center justify-center gap-1 font-bold">
                         <Paperclip size={12}/> عرض
                       </a>
                    ) : (
                       <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <CurrencyDisplay amount={exp.amount} color="text-red-700" compact />
                  </td>
                  <td className="px-4 py-3">
                    {/* ✅ الأزرار الآن ظاهرة دائماً */}
                    <div className="flex gap-1.5 justify-center">
                      <button 
                        onClick={() => openModal(exp)} 
                        className="px-2.5 py-1.5 rounded-md hover:bg-red-100 text-red-600 font-bold text-[10px] flex items-center gap-1 transition-all min-h-[32px]"
                      >
                        <Pen size={12}/> تعديل
                      </button>
                      <button 
                        onClick={() => handleDelete(exp.id)} 
                        className="p-1.5 rounded-md hover:bg-red-100 text-slate-400 hover:text-red-600 transition-all min-h-[32px] min-w-[32px] flex items-center justify-center"
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

      {/* Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-0 sm:p-3"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="bg-white w-full max-w-lg sm:max-w-2xl rounded-t-2xl sm:rounded-2xl shadow-2xl animate-in slide-in-from-bottom-10 overflow-hidden flex flex-col max-h-[92vh]">
            
            <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0 sticky top-0 z-10">
              <h3 className="font-black text-slate-800 text-sm flex items-center gap-2 text-red-700">
                <Plus size={16} /> {editingId ? "تعديل مصروف" : "إضافة مصروف"}
              </h3>
              <button onClick={closeModal} className="p-1.5 hover:bg-slate-200 text-slate-500 rounded-lg transition-all min-w-[36px] min-h-[36px] flex items-center justify-center">
                <X size={18} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto custom-scrollbar flex-1">
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Date & Amount */}
                <div className="grid grid-cols-2 gap-3">
                  <InputCompact label="التاريخ" type="date" value={form.date} onChange={v => setForm({...form, date: v})} />
                  <InputCompact label="القيمة (SAR)" type="number" inputMode="numeric" value={form.amount} onChange={v => setForm({...form, amount: v})} />
                </div>

                {/* Categories Multi-Select */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase">التصنيف (يمكنك اختيار أكثر من واحد)</label>
                  <div className="flex flex-wrap gap-1.5">
                    {CATEGORIES_LIST.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border ${
                          form.categories.includes(cat)
                            ? 'bg-red-600 text-white border-red-600 shadow-sm'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <InputCompact 
                    label="الوصف" 
                    value={form.description} 
                    onChange={v => setForm({...form, description: v})}
                    placeholder="مثال: دفعة مقاولات، شراء أثاث للمكتب..."
                  />
                </div>

                {/* Attachment & Recurring Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  
                  {/* Attachment */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-1"><Paperclip size={12}/> المرفقات (إيصال/فاتورة)</label>
                    <input 
                      type="file" 
                      accept="image/*,.pdf"
                      onChange={e => setForm({...form, attachmentFile: e.target.files[0]})}
                      className="w-full text-[11px] file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-red-100 file:text-red-700 hover:file:bg-red-200 outline-none"
                    />
                    {form.attachmentUrl && !form.attachmentFile && (
                      <a href={getFullUrl(form.attachmentUrl)} target="_blank" rel="noreferrer" className="text-[10px] text-blue-600 font-bold flex items-center gap-1 mt-1">
                        <ExternalLink size={10}/> المرفق الحالي
                      </a>
                    )}
                  </div>

                  {/* Recurring Controls */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 cursor-pointer w-fit">
                      <input 
                        type="checkbox" 
                        className="rounded w-3.5 h-3.5 text-red-600 focus:ring-red-500" 
                        checked={form.isRecurring} 
                        onChange={e => setForm({...form, isRecurring: e.target.checked})} 
                      />
                      هذا المصروف يتكرر باستمرار؟
                    </label>
                    
                    {form.isRecurring && (
                      <div className="animate-in fade-in slide-in-from-top-1">
                         <select 
                           className="w-full h-9 px-2.5 rounded-lg border border-slate-200 bg-white focus:bg-white text-[11px] font-bold outline-none focus:ring-2 focus:ring-red-500" 
                           value={form.recurrenceRate} 
                           onChange={e => setForm({...form, recurrenceRate: e.target.value})}
                         >
                           <option value="يومياً">يومياً</option>
                           <option value="أسبوعياً">أسبوعياً</option>
                           <option value="شهرياً">شهرياً (في نفس اليوم)</option>
                           <option value="كل 3 شهور">ربع سنوي (كل 3 شهور)</option>
                           <option value="سنوياً">سنوياً</option>
                         </select>
                      </div>
                    )}
                  </div>

                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-3 border-t border-slate-100">
                  <button type="button" onClick={closeModal} className="flex-1 h-9 rounded-lg font-black text-slate-600 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-xs transition-colors">
                    إلغاء
                  </button>
                  <button type="submit" disabled={submitting} className="flex-[2] bg-red-600 hover:bg-red-700 active:bg-red-800 text-white h-9 rounded-lg font-black shadow-sm flex items-center justify-center gap-1.5 transition-all text-xs disabled:opacity-50">
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

function ExpenseCard({ item, onEdit, onDelete }) {
  return (
    <div className="p-3 space-y-2.5">
      <div className="flex justify-between items-start gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-[10px] font-bold text-slate-500">
              {new Date(item.date).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })}
            </p>
            {item.isRecurring && (
              <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[9px] font-black rounded border border-amber-200">
                🔄 {item.recurrenceRate || 'متكرر'}
              </span>
            )}
            {item.attachment && (
              <a href={getFullUrl(item.attachment)} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-700">
                <Paperclip size={12}/>
              </a>
            )}
          </div>
          <p className="font-black text-slate-800 text-sm mt-0.5 truncate">{item.description}</p>
        </div>
        <div className="flex gap-1 shrink-0">
          <button onClick={onEdit} className="p-1.5 rounded-md hover:bg-red-100 text-red-600 transition-all min-w-[32px] min-h-[32px] flex items-center justify-center">
            <Pen size={14} />
          </button>
          <button onClick={onDelete} className="p-1.5 rounded-md hover:bg-red-100 text-slate-400 hover:text-red-600 transition-all min-w-[32px] min-h-[32px] flex items-center justify-center">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between pt-1.5 border-t border-slate-100">
        <div className="flex flex-wrap gap-1">
          {item.category?.split(',').map((cat, i) => (
             <span key={i} className={`inline-flex px-2 py-0.5 rounded text-[9px] font-black border bg-slate-100 text-slate-700 border-slate-200`}>
               {cat}
             </span>
          ))}
        </div>
        <span className="font-black text-red-700 text-base">
          {item.amount.toLocaleString()} <span className="text-[10px] font-normal opacity-70">SAR</span>
        </span>
      </div>
    </div>
  );
}

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