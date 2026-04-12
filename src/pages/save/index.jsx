import React, { useState, useEffect } from "react";
import { safeService } from "../../services/safeService";
import SafeSummary from "./components/SafeSummary";
import TransactionTable from "./components/TransactionTable";
import TransactionForm from "./components/TransactionForm";
import { Vault, Plus, RefreshCw } from "lucide-react";

export default function SafePage() {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    totalBalance: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await safeService.getTransactions();
      setTransactions(data.transactions || []);
      setSummary(
        data.summary || {
          totalBalance: 0,
          totalDeposits: 0,
          totalWithdrawals: 0,
        },
      );
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (formData) => {
    editingItem
      ? await safeService.updateTransaction(editingItem.id, formData)
      : await safeService.addTransaction(formData);
    setShowForm(false);
    setEditingItem(null);
    loadData();
  };

  const handleDelete = async (id) => {
    if (window.confirm("حذف هذه الحركة؟")) {
      await safeService.deleteTransaction(id);
      loadData();
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-3 pb-20 md:pb-5">
      {/* Header - متجاوب تماماً */}
      <div className="flex items-center justify-between bg-white p-3 rounded-2xl shadow-sm border border-slate-100 sticky top-0 z-10 md:relative">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-600 p-2 rounded-xl text-white">
            <Vault size={18} />
          </div>
          <h1 className="text-base md:text-xl font-black text-slate-900">
            الخزنة
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadData}
            className="p-2 border rounded-xl active:bg-slate-100 transition-colors"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => {
              setEditingItem(null);
              setShowForm(!showForm);
            }}
            className="bg-emerald-600 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 shadow-md active:scale-95 transition-all"
          >
            <Plus size={16} /> <span>{showForm ? "إغلاق" : "إضافة"}</span>
          </button>
        </div>
      </div>

      <SafeSummary summary={summary} />

      {showForm && (
        <TransactionForm
          initialData={editingItem}
          onSubmit={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
        />
      )}

      <TransactionTable
        transactions={transactions}
        loading={loading}
        onDelete={handleDelete}
        onEdit={(i) => {
          setEditingItem(i);
          setShowForm(true);
        }}
      />
    </div>
  );
}
