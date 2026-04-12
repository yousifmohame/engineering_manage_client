import React, { useState, useEffect } from 'react';
import { expenseService } from '../../services/expenseService';
import ExpenseSummary from './components/ExpenseSummary';
import ExpenseForm from './components/ExpenseForm';
import ExpenseTable from './components/ExpenseTable';
import { Receipt, Plus, RefreshCw } from 'lucide-react';

export default function ExpensesPage() {
  const [data, setData] = useState({ expenses: [], summary: {} });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // حفظ العنصر المراد تعديله
  const [editingExpense, setEditingExpense] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await expenseService.getExpenses();
      setData(result);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  // إضافة أو تعديل
  const handleSave = async (formData) => {
    if (editingExpense) {
      await expenseService.updateExpense(editingExpense.id, formData);
    } else {
      await expenseService.addExpense(formData);
    }
    setShowForm(false);
    setEditingExpense(null);
    loadData();
  };

  // معالج الحذف
  const handleDelete = async (id) => {
    if (window.confirm("هل أنت متأكد من حذف هذا المصروف؟")) {
      await expenseService.deleteExpense(id);
      loadData();
    }
  };

  // معالج الضغط على التعديل
  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setShowForm(true);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-3 font-cairo" dir="rtl">
      <div className="flex items-center justify-between bg-white p-2.5 rounded-xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-2">
          <div className="bg-red-500 p-1.5 rounded-lg shadow-sm">
            <Receipt className="text-white" size={18} />
          </div>
          <h1 className="text-lg font-black text-slate-900">المصروفات</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={loadData} className="p-1.5 border rounded-lg hover:bg-slate-50"><RefreshCw size={14} /></button>
          <button onClick={() => { setEditingExpense(null); setShowForm(!showForm); }} className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1">
            <Plus size={14} /> إضافة مصروف
          </button>
        </div>
      </div>

      <ExpenseSummary summary={data.summary} />

      {/* نمرر الـ editingExpense للفورم لكي يعرف أنه في وضع التعديل */}
      {showForm && (
        <ExpenseForm 
          initialData={editingExpense} 
          onSubmit={handleSave} 
          onCancel={() => { setShowForm(false); setEditingExpense(null); }} 
        />
      )}

      {/* نمرر دوال الحذف والتعديل للجدول */}
      <ExpenseTable 
        expenses={data.expenses} 
        loading={loading} 
        onDelete={handleDelete}
        onEdit={handleEdit}
      />
    </div>
  );
}