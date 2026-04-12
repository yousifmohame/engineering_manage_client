import React from "react";
import { Loader2, Trash2, Edit, Calendar, Tag } from "lucide-react";

export default function TransactionTable({
  transactions,
  loading,
  onDelete,
  onEdit,
}) {
  if (loading)
    return (
      <div className="p-10 text-center">
        <Loader2 className="animate-spin inline text-emerald-600" />
      </div>
    );

  return (
    <div className="w-full">
      {/* عرض الموبايل (Cards) - يظهر فقط في الشاشات الصغيرة */}
      <div className="md:hidden space-y-3">
        {transactions.map((t) => (
          <div
            key={t.id}
            className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-3"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] text-slate-400 font-bold mb-1 flex items-center gap-1">
                  <Calendar size={10} />{" "}
                  {new Date(t.date).toLocaleDateString("ar-EG")}
                </p>
                <h4 className="font-black text-slate-800 text-sm">
                  {t.reason}
                </h4>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-black ${
                  t.type === "إيداع"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {t.type}
              </span>
            </div>

            <div className="flex justify-between items-center border-t border-slate-50 pt-3 mt-1">
              <p
                className={`text-lg font-black ${t.type === "إيداع" ? "text-emerald-600" : "text-red-600"}`}
              >
                {t.type === "إيداع" ? "+" : "-"}
                {t.amount?.toLocaleString()}{" "}
                <span className="text-xs opacity-50">{t.currency}</span>
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(t)}
                  className="p-2 bg-blue-50 text-blue-600 rounded-xl"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => onDelete(t.id)}
                  className="p-2 bg-red-50 text-red-600 rounded-xl"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* عرض الكمبيوتر (Table) - يختفي في الموبايل */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase border-b">
            <tr>
              <th className="px-6 py-3">التاريخ</th>
              <th className="px-6 py-3">البيان</th>
              <th className="px-6 py-3">النوع</th>
              <th className="px-6 py-3">المبلغ</th>
              <th className="px-6 py-3 text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-xs">
            {transactions.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-3 text-slate-500">
                  {new Date(t.date).toLocaleDateString("ar-EG")}
                </td>
                <td className="px-6 py-3 font-bold text-slate-800">
                  {t.reason}
                </td>
                <td className="px-6 py-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-black ${t.type === "إيداع" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}
                  >
                    {t.type}
                  </span>
                </td>
                <td
                  className={`px-6 py-3 font-black text-sm ${t.type === "إيداع" ? "text-emerald-600" : "text-red-600"}`}
                >
                  {t.type === "إيداع" ? "+" : "-"}
                  {t.amount?.toLocaleString()}{" "}
                  <span className="opacity-50 text-[10px] mr-1">
                    {t.currency}
                  </span>
                </td>
                <td className="px-6 py-3 flex items-center justify-center gap-2">
                  <button
                    onClick={() => onEdit(t)}
                    className="p-1 text-blue-500 hover:bg-blue-50 rounded"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => onDelete(t.id)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {transactions.length === 0 && !loading && (
        <div className="p-10 text-center text-slate-400 italic text-sm">
          لا توجد بيانات مسجلة
        </div>
      )}
    </div>
  );
}
