import React, { useState, useEffect } from 'react';

export default function ExpenseForm({ onSubmit, onCancel, initialData }) {
  const [form, setForm] = useState({ 
    amount: '', category: 'طعام', description: '', date: new Date().toISOString().split('T')[0] 
  });

  // إذا تم تمرير بيانات (في حالة التعديل)، قم بتعبئة الفورم بها
  useEffect(() => {
    if (initialData) {
      setForm({
        amount: initialData.amount,
        category: initialData.category,
        description: initialData.description,
        date: new Date(initialData.date).toISOString().split('T')[0]
      });
    }
  }, [initialData]);

  const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:bg-white focus:border-red-400";

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="bg-white border border-red-200 p-3 rounded-xl shadow-sm grid grid-cols-2 md:grid-cols-5 gap-2 animate-in fade-in slide-in-from-top-2">
      <input type="number" placeholder="المبلغ" value={form.amount} className={inputClass} onChange={e => setForm({...form, amount: e.target.value})} required />
      <select className={inputClass} value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
        <option>طعام</option><option>سكن</option><option>مواصلات</option><option>ترفيه</option><option>مكتب</option><option>أخرى</option>
      </select>
      <input type="date" className={inputClass} value={form.date} onChange={e => setForm({...form, date: e.target.value})} required />
      <input type="text" placeholder="الوصف..." value={form.description} className={inputClass} onChange={e => setForm({...form, description: e.target.value})} required />
      
      <div className="flex gap-1">
        <button type="submit" className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg text-xs py-1.5 transition-colors">
          {initialData ? 'تحديث' : 'حفظ'}
        </button>
        <button type="button" onClick={onCancel} className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-lg px-2 text-xs transition-colors">
          إلغاء
        </button>
      </div>
    </form>
  );
}