export default function ExpenseSummary({ summary }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      <div className="bg-slate-900 text-white p-3 rounded-xl">
        <p className="text-[10px] opacity-60">إجمالي المصروفات</p>
        <p className="text-lg font-black">{summary.total?.toLocaleString()} <span className="text-[9px]">SAR</span></p>
      </div>
      <div className="bg-white border p-3 rounded-xl border-b-4 border-b-red-500">
        <p className="text-[10px] text-slate-500 font-bold">عدد العمليات</p>
        <p className="text-lg font-black text-slate-800">{summary.count || 0}</p>
      </div>
      {/* يمكن إضافة فئات أخرى هنا تلقائياً من statsByCategory */}
    </div>
  );
}