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
} from "lucide-react";
import { bankService } from "../../services/bankService";
import { safeService } from "../../services/safeService";
import { goldService } from "../../services/goldService";

export default function BankAccountsPage() {
  const [bankData, setBankData] = useState({ accounts: [], totalAllBanks: 0 });
  const [safeSummary, setSafeSummary] = useState({ totalBalance: 0 });
  const [goldSummary, setGoldSummary] = useState({ totalInvestment: 0 });
  const [loading, setLoading] = useState(true);

  // إدارة النوافذ المنبثقة
  const [activeModal, setActiveModal] = useState(null); // 'account' | 'transaction' | null

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
    date: new Date().toISOString().split("T")[0],
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

      if (banks.accounts?.length > 0) {
        setTransForm((prev) => ({
          ...prev,
          bankAccountId: banks.accounts[0].id,
        }));
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    await bankService.createAccount(accountForm);
    setActiveModal(null);
    setAccountForm({
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
    loadData();
  };

  const handleTransSubmit = async (e) => {
    e.preventDefault();
    await bankService.addTransaction(transForm);
    setActiveModal(null);
    setTransForm({
      ...transForm,
      amount: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
    });
    loadData();
  };

  const handleDelete = async (id) => {
    if (window.confirm("هل أنت متأكد من حذف هذا الحساب نهائياً؟")) {
      await bankService.deleteAccount(id);
      loadData();
    }
  };

  const totalAssets =
    bankData.totalAllBanks +
    safeSummary.totalBalance +
    goldSummary.totalInvestment;

  return (
    <div
      className="flex-1 overflow-y-auto p-3 md:p-6 pb-20 font-cairo"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header - Compact */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-md">
              <Landmark size={22} />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900">
                الأرصدة البنكية
              </h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                إدارة السيولة والمؤسسة
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveModal("account")}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-black transition-all"
            >
              <Plus size={14} /> حساب جديد
            </button>
            <button
              onClick={() => setActiveModal("transaction")}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-black shadow-lg shadow-indigo-100 transition-all"
            >
              <ArrowRightLeft size={14} /> تسجيل حركة
            </button>
          </div>
        </div>

        {/* Summary Cards Grid - High Density */}
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

        {/* Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Accounts List */}
          <div className="lg:col-span-2 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {bankData.accounts.map((acc) => (
                <div
                  key={acc.id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 hover:border-indigo-300 transition-all group"
                >
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
                        onClick={() => handleDelete(acc.id)}
                        className="text-slate-300 hover:text-red-500"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-end">
                    <p className="text-lg font-black text-slate-900">
                      {acc.balance?.toLocaleString()}
                    </p>
                    <button className="text-[10px] font-bold text-indigo-500 hover:underline">
                      تفاصيل الحساب
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Side History - Compact */}
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
                .slice(0, 8)
                .map((t, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-100 transition-all"
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
              {bankData.accounts.every((a) => a.transactions?.length === 0) && (
                <div className="text-center text-slate-400 text-xs py-4">
                  لا توجد حركات
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Insight - Slim */}
        <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-lg flex items-center gap-4 relative overflow-hidden">
          <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400">
            <Cpu size={24} />
          </div>
          <p className="text-[11px] leading-relaxed text-slate-300 flex-1">
            <span className="text-indigo-400 font-black block mb-0.5">
              توصية Gemini:
            </span>
            توزيع السيولة بين 3 بنوك يقلل المخاطر. رصيدك الحالي يمثل الكتلة
            الأكبر، فكر في تنويع العملات والأصول لتقليل مخاطر التضخم.
          </p>
        </div>
      </div>

      {/* --- MODALS (النماذج المنبثقة) --- */}
      {activeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className={`bg-white w-full ${activeModal === "account" ? "max-w-3xl" : "max-w-lg"} rounded-t-3xl sm:rounded-3xl shadow-2xl animate-in slide-in-from-bottom-10 overflow-hidden`}
          >
            <div className="p-4 border-b flex justify-between items-center bg-slate-50">
              <h3 className="font-black text-slate-800 text-sm">
                {activeModal === "account"
                  ? "إضافة حساب بنكي تفصيلي"
                  : "تسجيل حركة مالية جديدة"}
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
              {activeModal === "account" ? (
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
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none"
                        value={accountForm.currency}
                        onChange={(e) =>
                          setAccountForm({
                            ...accountForm,
                            currency: e.target.value,
                          })
                        }
                      >
                        <option value="SAR">SAR - ريال سعودي</option>
                        <option value="USD">USD - دولار أمريكي</option>
                        <option value="EGP">EGP - جنيه مصري</option>
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
                    <InputFull
                      label="SWIFT Code"
                      value={accountForm.swiftCode}
                      onChange={(v) =>
                        setAccountForm({ ...accountForm, swiftCode: v })
                      }
                    />
                    <InputFull
                      label="رسوم الإيداع"
                      type="number"
                      icon={<Percent size={14} />}
                      value={accountForm.depositFees}
                      onChange={(v) =>
                        setAccountForm({ ...accountForm, depositFees: v })
                      }
                    />
                    <InputFull
                      label="صرف SAR لـ USD"
                      type="number"
                      value={accountForm.exchangeRateUSD}
                      onChange={(v) =>
                        setAccountForm({ ...accountForm, exchangeRateUSD: v })
                      }
                    />
                    <InputFull
                      label="صرف SAR لـ EGP"
                      type="number"
                      value={accountForm.exchangeRateEGP}
                      onChange={(v) =>
                        setAccountForm({ ...accountForm, exchangeRateEGP: v })
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
                      className="flex-[2] bg-indigo-600 text-white py-3 rounded-2xl font-black text-xs shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 uppercase tracking-widest"
                    >
                      <Save size={16} /> حفظ الحساب
                    </button>
                  </div>
                </form>
              ) : (
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
                    <div className="col-span-2">
                      <InputCompact
                        label="البيان"
                        value={transForm.description}
                        onChange={(v) =>
                          setTransForm({ ...transForm, description: v })
                        }
                      />
                    </div>
                    <div className="col-span-2">
                      <InputCompact
                        label="التاريخ"
                        type="date"
                        value={transForm.date}
                        onChange={(v) =>
                          setTransForm({ ...transForm, date: v })
                        }
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4 border-t mt-4">
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="flex-1 bg-slate-100 text-slate-600 font-black py-3 rounded-2xl"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      className="flex-[2] bg-indigo-600 text-white font-black py-3 rounded-2xl shadow-lg flex items-center justify-center gap-2"
                    >
                      <Save size={16} /> حفظ الحركة
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

// مكونات مساعدة
function SummaryCard({ title, amount, color, icon }) {
  const usdRate = 0.2667;
  const egpRate = 12.8;

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

function InputCompact({ label, value, onChange, type = "text" }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
        {label}
      </label>
      <input
        type={type}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
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
        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={type !== "text" || label === "اسم البنك"}
      />
    </div>
  );
}
