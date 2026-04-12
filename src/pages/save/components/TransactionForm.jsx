import React, { useState, useEffect } from "react";
import { Save, X } from "lucide-react";

export default function TransactionForm({ onSubmit, onCancel, initialData }) {
  const [form, setForm] = useState({
    type: "إيداع",
    amount: "",
    currency: "SAR",
    reason: "",
    assetType: "كاش",
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    if (initialData)
      setForm({
        ...initialData,
        date: new Date(initialData.date).toISOString().split("T")[0],
      });
  }, [initialData]);

  const inputClass =
    "w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all";

  return (
    <div className="bg-white border border-emerald-100 rounded-2xl shadow-lg p-4 animate-in fade-in slide-in-from-top-2">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(form);
        }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
      >
        <select
          className={inputClass}
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
        >
          <option value="إيداع">إيداع (+)</option>
          <option value="سحب">سحب (-)</option>
        </select>
        <input
          type="number"
          placeholder="المبلغ"
          className={inputClass}
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="السبب..."
          className={inputClass}
          value={form.reason}
          onChange={(e) => setForm({ ...form, reason: e.target.value })}
          required
        />
        <input
          type="date"
          className={inputClass}
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
        />
        <select
          className={inputClass}
          value={form.currency}
          onChange={(e) => setForm({ ...form, currency: e.target.value })}
        >
          <option value="SAR">SAR</option>
          <option value="USD">USD</option>
          <option value="EGP">EGP</option>
        </select>
        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 bg-emerald-600 text-white font-bold rounded-xl py-2.5 shadow-md flex justify-center items-center gap-2"
          >
            <Save size={16} /> {initialData ? "تحديث" : "حفظ"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="p-2.5 bg-slate-100 text-slate-500 rounded-xl"
          >
            <X size={20} />
          </button>
        </div>
      </form>
    </div>
  );
}
