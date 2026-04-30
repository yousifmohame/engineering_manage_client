import React, { useState, useEffect } from "react";
import {
  Landmark,
  Plus,
  Building2,
  Vault,
  Coins,
  TrendingUp,
  History,
  X,
  Save,
  Sparkles,
  Cpu,
  RefreshCw,
  ArrowRightLeft,
  CreditCard,
  Globe,
  Percent,
  Tag,
  UploadCloud,
  Pen,
  Trash2,
  FileText,
  ChevronRight,
  FileSearch,
  Paperclip,
} from "lucide-react";
import { bankService } from "../../services/bankService";
import { safeService } from "../../services/safeService";
import { goldService } from "../../services/goldService";

const BASE_SERVER_URL = `${import.meta.env.VITE_API_URL}`;

export default function BankAccountsPage() {
  const [bankData, setBankData] = useState({ accounts: [], totalAllBanks: 0 });
  const [safeSummary, setSafeSummary] = useState({ totalBalance: 0 });
  const [goldSummary, setGoldSummary] = useState({ totalInvestment: 0 });
  const [loading, setLoading] = useState(true);

  const [activeModal, setActiveModal] = useState(null);
  const [selectedAccountDetails, setSelectedAccountDetails] = useState(null);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [selectedBankForAi, setSelectedBankForAi] = useState("");
  const [statementFile, setStatementFile] = useState(null);

  const [accountForm, setAccountForm] = useState({
    bankName: "",
    accountName: "",
    currency: "SAR",
    balance: "",
    accountNumber: "",
    iban: "",
    swiftCode: "",
    depositFees: "0",
    exchangeRateUSD: "0.2667",
    exchangeRateEGP: "12.8",
  });

  const [transForm, setTransForm] = useState({
    bankAccountId: "",
    type: "إيداع",
    amount: "",
    description: "",
    referenceNumber: "",
    date: new Date().toISOString().split("T")[0],
    attachmentFile: null,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [banks, safe, gold] = await Promise.all([
        bankService.getAccounts(),
        safeService.getTransactions(),
        goldService.getGold(),
      ]);
      setBankData(banks);
      setSafeSummary(safe.summary || { totalBalance: 0 });
      setGoldSummary(gold.summary || { totalInvestment: 0 });

      if (banks.accounts?.length > 0 && !transForm.bankAccountId) {
        setTransForm((prev) => ({
          ...prev,
          bankAccountId: banks.accounts[0].id,
        }));
      }

      if (selectedAccountDetails) {
        const updatedAccount = banks.accounts.find(
          (a) => a.id === selectedAccountDetails.id,
        );
        if (updatedAccount) setSelectedAccountDetails(updatedAccount);
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAiAnalyze = async (e) => {
    e.preventDefault();
    if (!statementFile || !selectedBankForAi)
      return alert("اختر الحساب والملف");
    setSubmitting(true);
    try {
      const result = await bankService.analyzeStatement(
        selectedBankForAi,
        statementFile,
      );
      alert(
        `إجمالي الحركات المقروءة: ${result.totalFound}\nالجديد: ${result.added}\nتم تخطي המكرر: ${result.skipped}`,
      );
      setActiveModal(null);
      setStatementFile(null);
      loadData();
    } catch (error) {
      alert("حدث خطأ في التحليل");
    }
    setSubmitting(false);
  };

  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    await bankService.createAccount(accountForm);
    setActiveModal(null);
    loadData();
  };

  const handleTransSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData();
    formData.append("bankAccountId", transForm.bankAccountId);
    formData.append("type", transForm.type);
    formData.append("amount", transForm.amount);
    formData.append("description", transForm.description);
    formData.append("date", transForm.date);
    if (transForm.referenceNumber)
      formData.append("referenceNumber", transForm.referenceNumber);
    if (transForm.attachmentFile)
      formData.append("attachment", transForm.attachmentFile);

    try {
      if (editingTransaction)
        await bankService.updateTransaction(editingTransaction.id, formData);
      else await bankService.addTransaction(formData);

      setActiveModal(selectedAccountDetails ? "account-details" : null);
      setEditingTransaction(null);
      setTransForm({
        bankAccountId: bankData.accounts[0]?.id || "",
        type: "إيداع",
        amount: "",
        description: "",
        referenceNumber: "",
        date: new Date().toISOString().split("T")[0],
        attachmentFile: null,
      });
      loadData();
    } catch (err) {
      alert("خطأ في الحفظ");
    }
    setSubmitting(false);
  };

  const handleDeleteAccount = async (id) => {
    if (window.confirm("حذف الحساب نهائياً؟")) {
      await bankService.deleteAccount(id);
      if (selectedAccountDetails?.id === id) {
        setSelectedAccountDetails(null);
        setActiveModal(null);
      }
      loadData();
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (window.confirm("حذف الحركة نهائياً؟ سيتم تعديل رصيد البنك عكسياً!")) {
      await bankService.deleteTransaction(id);
      loadData();
    }
  };

  const openAccountDetails = (acc) => {
    setSelectedAccountDetails(acc);
    setActiveModal("account-details");
  };

  const openEditTransaction = (tx) => {
    setEditingTransaction(tx);
    setTransForm({
      bankAccountId: selectedAccountDetails.id,
      type: tx.type,
      amount: tx.amount,
      description: tx.description,
      referenceNumber: tx.referenceNumber || "",
      date: new Date(tx.date).toISOString().split("T")[0],
      attachmentFile: null,
    });
    setActiveModal("transaction");
  };

  const getFullUrl = (url) => {
    if (!url) return "";
    const fullPath = url.startsWith("http") ? url : `${BASE_SERVER_URL}${url}`;
    return encodeURI(fullPath);
  };

  const totalAssets =
    bankData.totalAllBanks +
    safeSummary.totalBalance +
    goldSummary.totalInvestment;

  if (loading)
    return (
      <div className="p-10 text-center font-bold animate-pulse">
        جاري التحميل...
      </div>
    );

  return (
    <div
      className="flex-1 overflow-y-auto p-3 md:p-6 pb-20 font-cairo"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 text-white rounded-xl">
              <Landmark size={22} />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900">
                الأرصدة البنكية
              </h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                النظام المالي الموحد
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setActiveModal("account");
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-xs font-black"
            >
              <Plus size={14} /> حساب جديد
            </button>
            <button
              onClick={() => {
                setEditingTransaction(null);
                setActiveModal("transaction");
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-black shadow-lg shadow-indigo-100"
            >
              <ArrowRightLeft size={14} /> تسجيل حركة
            </button>
            <button
              onClick={() => setActiveModal("ai-analyze")}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-black shadow-lg"
            >
              <Sparkles size={14} /> تحليل ذكي للكشف
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <SummaryCard
            title="البنوك"
            amount={bankData.totalAllBanks}
            color="from-slate-800 to-slate-950"
            icon={<Landmark size={14} />}
          />
          <SummaryCard
            title="الخزنة"
            amount={safeSummary.totalBalance}
            color="from-emerald-600 to-emerald-800"
            icon={<Vault size={14} />}
          />
          <SummaryCard
            title="الذهب"
            amount={goldSummary.totalInvestment}
            color="from-amber-500 to-amber-700"
            icon={<Coins size={14} />}
          />
          <SummaryCard
            title="الأصول"
            amount={totalAssets}
            color="from-indigo-600 to-indigo-800"
            icon={<TrendingUp size={14} />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {bankData.accounts.map((acc) => (
                <div
                  key={acc.id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 hover:border-indigo-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-black text-slate-900 text-sm">
                          {acc.bankName}
                        </h3>
                        <p className="text-[10px] text-slate-400 font-bold">
                          {acc.accountName}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md">
                          {acc.currency}
                        </span>
                        <button
                          onClick={() => handleDeleteAccount(acc.id)}
                          className="text-slate-300 hover:text-red-500"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1 mb-4 text-[10px] font-bold text-slate-500">
                      {acc.accountNumber && (
                        <p>
                          رقم الحساب:{" "}
                          <span className="text-slate-700">
                            {acc.accountNumber}
                          </span>
                        </p>
                      )}
                      {acc.iban && (
                        <p>
                          IBAN:{" "}
                          <span className="text-slate-700">{acc.iban}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-end border-t border-slate-50 pt-3 mt-auto">
                    <p className="text-lg font-black text-slate-900">
                      {acc.balance?.toLocaleString()}
                    </p>
                    <button
                      onClick={() => openAccountDetails(acc)}
                      className="text-[10px] font-bold bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white px-3 py-1.5 rounded-lg flex items-center gap-1"
                    >
                      التفاصيل والحركات <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Side History */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col h-fit overflow-hidden">
            <div className="p-3 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-black text-slate-800 text-xs flex items-center gap-2">
                <History size={14} /> آخر العمليات
              </h3>
              <RefreshCw
                size={12}
                className="text-slate-300 cursor-pointer"
                onClick={loadData}
              />
            </div>
            <div className="p-2 space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
              {bankData.accounts
                .flatMap(
                  (acc) =>
                    acc.transactions?.map((t) => ({
                      ...t,
                      bankName: acc.bankName,
                    })) || [],
                )
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 10)
                .map((t, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-lg"
                  >
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-800 truncate w-32">
                        {t.description}
                      </span>
                      <span className="text-[8px] text-slate-400">
                        {t.bankName} -{" "}
                        {new Date(t.date).toLocaleDateString("ar-EG")}
                      </span>
                    </div>
                    <span
                      className={`text-[11px] font-black ${t.type === "إيداع" ? "text-emerald-600" : "text-red-600"}`}
                    >
                      {t.type === "إيداع" ? "+" : "-"}
                      {t.amount?.toLocaleString()}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}
      {activeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className={`bg-white w-full ${activeModal === "account" || activeModal === "account-details" ? "max-w-5xl" : "max-w-lg"} rounded-t-3xl sm:rounded-3xl shadow-2xl animate-in slide-in-from-bottom-10 overflow-hidden flex flex-col max-h-[90vh]`}
          >
            <div className="p-4 border-b flex justify-between items-center bg-slate-50 shrink-0">
              <h3 className="font-black text-slate-800 text-sm flex items-center gap-2">
                {activeModal === "account" && (
                  <Building2 size={16} className="text-indigo-600" />
                )}
                {activeModal === "transaction" && (
                  <ArrowRightLeft size={16} className="text-indigo-600" />
                )}
                {activeModal === "ai-analyze" && (
                  <Sparkles size={16} className="text-purple-600" />
                )}
                {activeModal === "account-details" && (
                  <FileSearch size={16} className="text-indigo-600" />
                )}
                {activeModal === "account"
                  ? "إضافة حساب بنكي تفصيلي"
                  : activeModal === "transaction"
                    ? editingTransaction
                      ? "تعديل حركة مالية"
                      : "تسجيل حركة مالية جديدة"
                    : activeModal === "ai-analyze"
                      ? "تحليل كشف حساب بالذكاء الاصطناعي"
                      : `تفاصيل حساب: ${selectedAccountDetails?.bankName}`}
              </h3>
              <button
                onClick={() => {
                  setActiveModal(null);
                  setEditingTransaction(null);
                }}
                className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              {/* 1. Account Details Modal */}
              {activeModal === "account-details" && selectedAccountDetails && (
                <div className="space-y-6">
                  <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 flex flex-wrap gap-6 justify-between items-center">
                    <div>
                      <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider mb-1">
                        الرصيد الحالي ({selectedAccountDetails.currency})
                      </p>
                      <p className="text-3xl font-black text-indigo-900">
                        {selectedAccountDetails.balance?.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-4">
                      <div className="bg-white p-2.5 rounded-xl border shadow-sm">
                        <p className="text-[9px] text-slate-400 font-black uppercase mb-0.5">
                          رقم الحساب
                        </p>
                        <p className="text-xs font-bold text-slate-700">
                          {selectedAccountDetails.accountNumber || "غير مسجل"}
                        </p>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border shadow-sm">
                        <p className="text-[9px] text-slate-400 font-black uppercase mb-0.5">
                          IBAN
                        </p>
                        <p className="text-xs font-bold text-slate-700">
                          {selectedAccountDetails.iban || "غير مسجل"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-black text-slate-800 text-sm flex items-center gap-1.5">
                        <History size={16} /> سجل الحركات التفصيلي
                      </h4>
                      <button
                        onClick={() => {
                          setEditingTransaction(null);
                          setTransForm({
                            ...transForm,
                            bankAccountId: selectedAccountDetails.id,
                          });
                          setActiveModal("transaction");
                        }}
                        className="text-[10px] bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-700"
                      >
                        إضافة حركة يدوية
                      </button>
                    </div>

                    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                      <table className="w-full text-right">
                        <thead className="bg-slate-50 text-[10px] font-black text-slate-500 uppercase border-b border-slate-200">
                          <tr>
                            <th className="p-3">التاريخ</th>
                            <th className="p-3">البيان</th>
                            <th className="p-3 text-center">مرجع</th>
                            <th className="p-3">النوع</th>
                            <th className="p-3">المبلغ</th>
                            <th className="p-3 text-center">المرفقات</th>
                            <th className="p-3 text-center">إجراءات</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs font-bold">
                          {selectedAccountDetails.transactions?.length === 0 ? (
                            <tr>
                              <td
                                colSpan="7"
                                className="p-6 text-center text-slate-400"
                              >
                                لا توجد حركات مسجلة لهذا الحساب
                              </td>
                            </tr>
                          ) : (
                            selectedAccountDetails.transactions?.map((tx) => (
                              <tr
                                key={tx.id}
                                className="hover:bg-slate-50/80 transition-colors group"
                              >
                                <td className="p-3 text-slate-500">
                                  {new Date(tx.date).toLocaleDateString(
                                    "ar-EG",
                                  )}
                                </td>
                                <td className="p-3 text-slate-800 max-w-[180px] truncate">
                                  {tx.description}
                                </td>
                                <td className="p-3 text-center text-[10px] text-slate-400 font-mono">
                                  {tx.referenceNumber || "-"}
                                </td>
                                <td className="p-3">
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] ${tx.type === "إيداع" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}
                                  >
                                    {tx.type}
                                  </span>
                                </td>
                                <td
                                  className={`p-3 font-black ${tx.type === "إيداع" ? "text-emerald-600" : "text-red-600"}`}
                                >
                                  {tx.amount.toLocaleString()}
                                </td>
                                <td className="p-3 text-center">
                                  {tx.attachment ? (
                                    <a
                                      href={getFullUrl(tx.attachment)}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded text-[10px]"
                                    >
                                      <FileText size={12} /> عرض
                                    </a>
                                  ) : (
                                    <span className="text-slate-300">-</span>
                                  )}
                                </td>
                                <td className="p-3">
                                  <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                                    <button
                                      onClick={() => openEditTransaction(tx)}
                                      className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded"
                                    >
                                      <Pen size={14} />
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteTransaction(tx.id)
                                      }
                                      className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. Add Account */}
              {activeModal === "account" && (
                <form onSubmit={handleAccountSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <InputFull
                      label="اسم البنك"
                      icon={<Building2 size={14} />}
                      placeholder="مثال: البنك الأهلي"
                      value={accountForm.bankName}
                      onChange={(v) =>
                        setAccountForm({ ...accountForm, bankName: v })
                      }
                    />
                    <InputFull
                      label="وصف الحساب"
                      icon={<Tag size={14} />}
                      placeholder="حساب جاري - فرع جدة"
                      value={accountForm.accountName}
                      onChange={(v) =>
                        setAccountForm({ ...accountForm, accountName: v })
                      }
                    />
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase">
                        العملة
                      </label>
                      <select
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold outline-none"
                        value={accountForm.currency}
                        onChange={(e) =>
                          setAccountForm({
                            ...accountForm,
                            currency: e.target.value,
                          })
                        }
                      >
                        <option value="SAR">SAR</option>
                        <option value="USD">USD</option>
                        <option value="EGP">EGP</option>
                      </select>
                    </div>
                    <InputFull
                      label="الرصيد الحالي"
                      type="number"
                      icon={<Coins size={14} />}
                      value={accountForm.balance}
                      onChange={(v) =>
                        setAccountForm({ ...accountForm, balance: v })
                      }
                    />
                    <InputFull
                      label="رقم الحساب"
                      icon={<CreditCard size={14} />}
                      value={accountForm.accountNumber}
                      onChange={(v) =>
                        setAccountForm({ ...accountForm, accountNumber: v })
                      }
                    />
                    <InputFull
                      label="رقم IBAN"
                      icon={<Globe size={14} />}
                      value={accountForm.iban}
                      onChange={(v) =>
                        setAccountForm({ ...accountForm, iban: v })
                      }
                    />
                  </div>
                  <div className="flex gap-2 pt-4 border-t mt-4">
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="flex-1 py-3 text-slate-500 font-black text-xs uppercase bg-slate-100 rounded-2xl"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      className="flex-[2] bg-indigo-600 text-white py-3 rounded-2xl font-black text-xs shadow-lg flex items-center justify-center gap-2"
                    >
                      <Save size={16} /> حفظ
                    </button>
                  </div>
                </form>
              )}

              {/* 3. Add/Edit Transaction (With Upload) */}
              {activeModal === "transaction" && (
                <form onSubmit={handleTransSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase">
                        اختر الحساب
                      </label>
                      <select
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold outline-none mt-1"
                        value={transForm.bankAccountId}
                        onChange={(e) =>
                          setTransForm({
                            ...transForm,
                            bankAccountId: e.target.value,
                          })
                        }
                        required
                        disabled={!!editingTransaction}
                      >
                        <option value="" disabled>
                          اختر حساباً...
                        </option>
                        {bankData.accounts.map((acc) => (
                          <option key={acc.id} value={acc.id}>
                            {acc.bankName} - {acc.accountName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase">
                        النوع
                      </label>
                      <select
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold outline-none mt-1"
                        value={transForm.type}
                        onChange={(e) =>
                          setTransForm({ ...transForm, type: e.target.value })
                        }
                      >
                        <option value="إيداع">إيداع (+)</option>
                        <option value="سحب">سحب (-)</option>
                      </select>
                    </div>
                    <InputCompact
                      label="المبلغ"
                      type="number"
                      value={transForm.amount}
                      onChange={(v) =>
                        setTransForm({ ...transForm, amount: v })
                      }
                    />

                    <div className="col-span-2 sm:col-span-1">
                      <InputCompact
                        label="البيان"
                        value={transForm.description}
                        onChange={(v) =>
                          setTransForm({ ...transForm, description: v })
                        }
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <InputCompact
                        label="رقم المرجع (اختياري)"
                        value={transForm.referenceNumber}
                        onChange={(v) =>
                          setTransForm({ ...transForm, referenceNumber: v })
                        }
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <InputCompact
                        label="التاريخ"
                        type="date"
                        value={transForm.date}
                        onChange={(v) =>
                          setTransForm({ ...transForm, date: v })
                        }
                      />
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1">
                        <Paperclip size={12} /> إرفاق إيصال
                      </label>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) =>
                          setTransForm({
                            ...transForm,
                            attachmentFile: e.target.files[0],
                          })
                        }
                        className="w-full mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 text-xs"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4 border-t mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveModal(
                          selectedAccountDetails ? "account-details" : null,
                        );
                        setEditingTransaction(null);
                      }}
                      className="flex-1 bg-slate-100 text-slate-600 font-black py-3 rounded-2xl"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-[2] bg-indigo-600 text-white font-black py-3 rounded-2xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Save size={16} /> حفظ الحركة
                    </button>
                  </div>
                </form>
              )}

              {/* 4. AI Analyze */}
              {activeModal === "ai-analyze" && (
                <form onSubmit={handleAiAnalyze} className="space-y-5">
                  <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100 flex items-start gap-3 text-purple-800 text-xs leading-relaxed font-bold">
                    <Sparkles size={16} className="mt-0.5 shrink-0" />
                    <p>
                      ارفع كشف الحساب البصري (PDF أو صورة) وسيقوم Gemini بقرائته
                      واستخراج الحركات وتخطي المكرر تلقائياً.
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase">
                      الحساب البنكي
                    </label>
                    <select
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold"
                      value={selectedBankForAi}
                      onChange={(e) => setSelectedBankForAi(e.target.value)}
                      required
                    >
                      <option value="" disabled>
                        اختر حساباً...
                      </option>
                      {bankData.accounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.bankName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <div className="relative border-2 border-dashed border-slate-300 hover:border-purple-500 rounded-2xl p-6 flex flex-col items-center bg-slate-50">
                      <UploadCloud
                        size={28}
                        className={
                          statementFile ? "text-purple-600" : "text-slate-400"
                        }
                      />
                      <span className="text-xs font-bold text-slate-600 mt-2">
                        {statementFile
                          ? statementFile.name
                          : "اضغط لاختيار ملف"}
                      </span>
                      <input
                        type="file"
                        accept=".pdf,image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => setStatementFile(e.target.files[0])}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4 border-t mt-4">
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="flex-1 bg-slate-100 text-slate-600 font-black py-3 rounded-2xl text-xs"
                      disabled={submitting}
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      disabled={
                        submitting || !statementFile || !selectedBankForAi
                      }
                      className="flex-[2] bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black py-3 rounded-2xl flex items-center justify-center gap-2 text-xs disabled:opacity-50"
                    >
                      {submitting ? (
                        <RefreshCw size={16} className="animate-spin" />
                      ) : (
                        <Sparkles size={16} />
                      )}{" "}
                      {submitting ? "جاري التحليل..." : "بدء التحليل"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------- مكونات مساعدة ----------------

function SummaryCard({ title, amount, color, icon }) {
  const usdRate = 0.2667,
    egpRate = 12.8;
  return (
    <div
      className={`bg-gradient-to-br ${color} text-white p-4 rounded-2xl shadow-md relative overflow-hidden`}
    >
      <div className="absolute -right-4 -top-4 w-20 h-20 bg-white opacity-5 rounded-full blur-xl"></div>
      <div className="relative z-10">
        <div className="flex items-center gap-1.5 opacity-70 mb-2">
          {icon}{" "}
          <span className="text-[10px] font-black uppercase tracking-wider">
            {title}
          </span>
        </div>
        <p className="text-xl font-black tracking-tight">
          {amount?.toLocaleString()}{" "}
          <span className="text-[9px] font-normal">SAR</span>
        </p>
        <div className="flex gap-2 pt-2 mt-2 border-t border-white/10">
          <div className="bg-white/10 px-2 py-0.5 rounded text-[9px] font-bold">
            ${" "}
            {(amount * usdRate).toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })}
          </div>
          <div className="bg-white/10 px-2 py-0.5 rounded text-[9px] font-bold">
            £{" "}
            {(amount * egpRate).toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function InputCompact({
  label,
  value,
  onChange,
  type = "text",
  required = true,
}) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
        {label}
      </label>
      <input
        type={type}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
    </div>
  );
}

function InputFull({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  icon,
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black text-slate-500 uppercase ml-1 flex items-center gap-1">
        {icon}
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        required={type !== "text" || label === "اسم البنك"}
      />
    </div>
  );
}
