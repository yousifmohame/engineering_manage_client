import React from 'react';
import { Trash2, Edit } from 'lucide-react';

export default function ExpenseTable({ expenses, loading, onDelete, onEdit }) {
  if (loading) return <div className="text-center p-4 text-xs text-slate-500">جاري التحميل...</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="overflow-x-auto max-h-[60vh] custom-scrollbar">
        <table className="w-full text-right">
          <thead className="bg-slate-50 sticky top-0 z-10">
            <tr className="text-[10px] text-slate-400 font-black uppercase border-b">
              <th className="p-3">التاريخ</th>
              <th className="p-3">الفئة</th>
              <th className="p-3">الوصف</th>
              <th className="p-3">المبلغ</th>
              <th className="p-3 text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y text-xs">
            {expenses.map((exp) => (
              <tr key={exp.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-3 text-slate-500">{new Date(exp.date).toLocaleDateString('ar-EG')}</td>
                <td className="p-3"><span className="bg-slate-100 px-2 py-0.5 rounded-md font-bold">{exp.category}</span></td>
                <td className="p-3 text-slate-800 font-medium">{exp.description}</td>
                <td className="p-3 font-black text-red-600">{exp.amount.toLocaleString()} SAR</td>
                
                <td className="p-3 flex items-center justify-center gap-2">
                  <button onClick={() => onEdit(exp)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit size={14} />
                  </button>
                  <button onClick={() => onDelete(exp.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}