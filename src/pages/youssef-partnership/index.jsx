import React, { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Calculator,
  History,
  Settings,
  Eye,
  TrendingUp,
  Landmark,
  Banknote,
  Wallet,
  X,
  Save,
  Trash2,
  CheckCircle,
  ArrowDownToLine,
  PieChart,
  Coins,
} from "lucide-react";
import { youssefService } from "../../services/youssefService";
import { nazmiService } from "../../services/nazmiService";

export default function YoussefPartnershipPage() {
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [settlements, setSettlements] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [distributions, setDistributions] = useState([]);
  const [loans, setLoans] = useState([]);
  const [contributions, setContributions] = useState([]);

  const [partnershipSettings, setPartnershipSettings] = useState({
    capitalSAR: 1000000,
    myPercentage: 50,
    partnerPercentage: 50,
  });
  const [portalSettings, setPortalSettings] = useState({
    showCapital: true,
    showProfits: true,
    showBankShare: true,
    showAiAnalysis: true,
    youssefSharePercentage: 20,
    useDynamicShare: false,
    partnerEmail: "",
    companyName: "شركة عمارة طيبة",
    establishmentDate: new Date().toISOString().split("T")[0],
    primaryCurrency: "SAR",
  });

  const [settlementForm, setSettlementForm] = useState({
    amount: "",
    currency: "SAR",
    date: new Date().toISOString().split("T")[0],
    description: "",
  });
  const [loanForm, setLoanForm] = useState({
    amount: "",
    currency: "SAR",
    date: "",
    fromPartner: "أنا",
    toPartner: "يوسف",
    description: "",
    repaymentDate: "",
    deductFromLiquidation: false,
  });
  const [contributionForm, setContributionForm] = useState({
    amount: "",
    currency: "EGP",
    amountInSAR: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [youssefData, nazmiData] = await Promise.all([
        youssefService.getData(),
        nazmiService.getData(),
      ]);

      setSettlements(youssefData.settlements || []);
      setLoans(youssefData.loans || []);
      setContributions(youssefData.contributions || []);

      if (youssefData.settings) {
        setPortalSettings({
          ...youssefData.settings,
          establishmentDate: new Date(youssefData.settings.establishmentDate)
            .toISOString()
            .split("T")[0],
        });
      }

      if (nazmiData) {
        const tx = nazmiData.transactions || [];
        setIncomes(tx.filter((t) => t.type === "إيراد"));
        setDistributions(tx.filter((t) => t.type === "توزيع"));
        setPartnershipSettings({
          capitalSAR: nazmiData.capital || 1000000,
          myPercentage: nazmiData.mySharePercent || 50,
        });
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- حسابات التحويل للريال ---
  const toSAR = (amount, curr) =>
    curr === "USD" ? amount / 0.2667 : curr === "EGP" ? amount / 12.8 : amount;

  // --- 1. حسابات رأس المال ---
  const companyTotalCapital = partnershipSettings.capitalSAR;
  const myCompanyShare =
    companyTotalCapital * (partnershipSettings.myPercentage / 100);
  const youssefSharePercentage = portalSettings.youssefSharePercentage;
  const youssefTargetCapitalSAR =
    myCompanyShare * (youssefSharePercentage / 100);
  const youssefPaidCapitalSAR = contributions.reduce(
    (acc, curr) => acc + curr.amountInSAR,
    0,
  );
  const youssefRemainingCapitalSAR = Math.max(
    0,
    youssefTargetCapitalSAR - youssefPaidCapitalSAR,
  );

  // --- 2. حسابات الأرباح ---
  const totalDistributedSAR = distributions.reduce(
    (sum, d) => sum + toSAR(d.amount, d.currency),
    0,
  );
  const totalBankIncomeSAR = incomes
    .filter((i) => i.category === "بنك")
    .reduce((sum, i) => sum + toSAR(i.amount, i.currency), 0);
  const totalCashIncomeSAR = incomes
    .filter((i) => i.category === "كاش")
    .reduce((sum, i) => sum + toSAR(i.amount, i.currency), 0);

  const undistributedCashSAR = Math.max(
    0,
    totalCashIncomeSAR - totalDistributedSAR,
  );
  const totalUndistributedSAR = totalBankIncomeSAR + undistributedCashSAR;

  const myTotalDistributedSAR =
    totalDistributedSAR * (partnershipSettings.myPercentage / 100);
  const myTotalUndistributedSAR =
    totalUndistributedSAR * (partnershipSettings.myPercentage / 100);

  const youssefDistributedShareSAR =
    myTotalDistributedSAR * (youssefSharePercentage / 100);
  const youssefUndistributedShareSAR =
    myTotalUndistributedSAR * (youssefSharePercentage / 100);

  const totalReceivedByYoussefSAR = settlements.reduce(
    (acc, curr) => acc + toSAR(curr.amount, curr.currency),
    0,
  );
  const remainingForYoussefSAR =
    youssefDistributedShareSAR - totalReceivedByYoussefSAR;

  // --- معالجات الحفظ والحذف ---
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await youssefService.updateSettings(portalSettings);
    setActiveModal(null);
    setSubmitting(false);
    loadData();
  };
  const handleAddSettlement = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await youssefService.addSettlement(settlementForm);
    setActiveModal(null);
    setSettlementForm({
      amount: "",
      currency: "SAR",
      date: new Date().toISOString().split("T")[0],
      description: "",
    });
    setSubmitting(false);
    loadData();
  };
  const handleAddLoan = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await youssefService.addLoan(loanForm);
    setActiveModal(null);
    setLoanForm({
      amount: "",
      currency: "SAR",
      date: "",
      fromPartner: "أنا",
      toPartner: "يوسف",
      description: "",
      repaymentDate: "",
      deductFromLiquidation: false,
    });
    setSubmitting(false);
    loadData();
  };
  const handleAddContribution = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await youssefService.addContribution(contributionForm);
    setActiveModal(null);
    setContributionForm({
      amount: "",
      currency: "EGP",
      amountInSAR: "",
      date: new Date().toISOString().split("T")[0],
      description: "",
    });
    setSubmitting(false);
    loadData();
  };

  const handleDeleteItem = async (id, type) => {
    if (window.confirm("هل أنت متأكد من الحذف؟")) {
      if (type === "loan") await youssefService.deleteLoan(id);
      if (type === "settlement") await youssefService.deleteSettlement(id);
      if (type === "contribution") await youssefService.deleteContribution(id);
      loadData();
    }
  };

  if (loading)
    return (
      <div className="p-10 text-center text-slate-500 font-bold animate-pulse">
        جاري تحميل بيانات الشراكة مع يوسف...
      </div>
    );

  return (
    <div
      className="flex-1 overflow-x-hidden overflow-y-auto p-3 md:p-6 pb-24 font-cairo bg-slate-50/50 min-h-screen"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-inner shrink-0">
              <Users size={28} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                شراكتي مع يوسف
              </h1>
              <p className="text-slate-500 mt-1 text-sm font-bold">
                لوحة التحكم الشاملة لرأس المال والأرباح والسلف
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal("settings")}
            className="h-11 px-6 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-bold text-slate-700 shadow-sm transition-all text-sm w-full md:w-auto"
          >
            <Settings size={18} /> إعدادات البوابة ليوسف
          </button>
        </div>

        {/* =========================================
            القسم الأول: رأس المال والمساهمات (باللون الأزرق)
           ========================================= */}
        <div className="bg-white rounded-3xl border border-blue-200 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 md:p-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-white">
            <div className="flex items-center gap-3">
              <Banknote size={28} className="text-blue-200" />
              <h2 className="text-xl md:text-2xl font-black">
                القسم الأول: رأس المال والمساهمات
              </h2>
            </div>
            <button
              onClick={() => setActiveModal("contribution")}
              className="h-10 px-5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-black shadow-md transition-all text-sm flex items-center gap-2"
            >
              <Plus size={16} /> إضافة دفعة رأس مال
            </button>
          </div>

          <div className="p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* بيانات الشركة العامة */}
            <div className="col-span-1 lg:col-span-2 bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex flex-col justify-center">
              <p className="text-xs text-blue-600 font-black uppercase mb-1">
                إجمالي رأس مال الشركة الأساسية
              </p>
              <div className="text-2xl font-black text-blue-900 mb-4">
                {companyTotalCapital.toLocaleString()} SAR
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-blue-800 bg-blue-100/50 p-2 rounded-lg w-fit">
                <PieChart size={16} /> نسبة يوسف: {youssefSharePercentage}% (من
                حصتك البالغة {partnershipSettings.myPercentage}%)
              </div>
            </div>

            {/* بيانات يوسف الخاصة برأس المال */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
              <p className="text-xs text-slate-500 font-bold mb-1">
                المطلوب من يوسف دفعه
              </p>
              <div className="text-xl md:text-2xl font-black text-slate-800">
                {youssefTargetCapitalSAR.toLocaleString()} SAR
              </div>
            </div>
            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 shadow-sm flex flex-col justify-center items-center text-center">
              <p className="text-xs text-emerald-600 font-bold mb-1">
                ما دفعه يوسف فعلياً
              </p>
              <div className="text-xl md:text-2xl font-black text-emerald-700">
                {youssefPaidCapitalSAR.toLocaleString()} SAR
              </div>
            </div>
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 shadow-sm flex flex-col justify-center items-center text-center">
              <p className="text-xs text-amber-600 font-bold mb-1">
                المتبقي لإكمال حصته
              </p>
              <div className="text-xl md:text-2xl font-black text-amber-700">
                {youssefRemainingCapitalSAR.toLocaleString()} SAR
              </div>
            </div>
          </div>

          {/* جدول المدفوعات (المساهمات) */}
          <div className="border-t border-blue-100 bg-slate-50/50">
            <div className="p-4 bg-slate-100/50 text-xs font-black text-slate-500 uppercase border-b border-slate-100">
              سجل دفعات رأس المال التي دفعها يوسف
            </div>
            <div className="max-h-[250px] overflow-y-auto custom-scrollbar p-2">
              {contributions.length === 0 ? (
                <div className="text-center py-6 text-slate-400 font-bold text-sm">
                  لم يدفع يوسف أي مبالغ في رأس المال حتى الآن
                </div>
              ) : (
                contributions.map((cont) => (
                  <div
                    key={cont.id}
                    className="flex justify-between items-center p-3 bg-white mb-2 rounded-xl border border-slate-200 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                        <ArrowDownToLine size={16} />
                      </div>
                      <div>
                        <div className="font-black text-slate-800 text-sm">
                          {cont.description}
                        </div>
                        <div className="text-[10px] font-bold text-slate-500 mt-0.5">
                          {new Date(cont.date).toLocaleDateString("ar-EG")} |
                          أصل الدفعة: {cont.amount.toLocaleString()}{" "}
                          {cont.currency}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-black text-emerald-600">
                        +{cont.amountInSAR.toLocaleString()} SAR
                      </span>
                      <button
                        onClick={() =>
                          handleDeleteItem(cont.id, "contribution")
                        }
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* =========================================
            القسم الثاني: الأرباح والتسويات (باللون الأخضر)
           ========================================= */}
        <div className="bg-white rounded-3xl border border-emerald-200 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-4 md:p-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-white">
            <div className="flex items-center gap-3">
              <TrendingUp size={28} className="text-emerald-200" />
              <h2 className="text-xl md:text-2xl font-black">
                القسم الثاني: الأرباح والتسويات
              </h2>
            </div>
            <button
              onClick={() => setActiveModal("settlement")}
              className="h-10 px-5 rounded-xl bg-white text-emerald-700 hover:bg-emerald-50 font-black shadow-md transition-all text-sm flex items-center gap-2"
            >
              <Plus size={16} /> تسليم أرباح ليوسف
            </button>
          </div>

          <div className="p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
              <p className="text-xs text-slate-500 font-bold mb-1">
                نصيبه من الأرباح الموزعة
              </p>
              <div className="text-xl md:text-2xl font-black text-slate-800">
                {youssefDistributedShareSAR.toLocaleString()} SAR
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
              <p className="text-xs text-slate-500 font-bold mb-1">
                نصيبه من غير الموزعة (بالبنك/الكاش)
              </p>
              <div className="text-xl md:text-2xl font-black text-slate-600">
                {youssefUndistributedShareSAR.toLocaleString()} SAR
              </div>
            </div>
            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 shadow-sm flex flex-col justify-center items-center text-center">
              <p className="text-xs text-emerald-600 font-bold mb-1">
                إجمالي ما استلمه (التسويات)
              </p>
              <div className="text-xl md:text-2xl font-black text-emerald-700">
                {totalReceivedByYoussefSAR.toLocaleString()} SAR
              </div>
            </div>
            <div
              className={`${remainingForYoussefSAR > 0 ? "bg-amber-50 border-amber-100" : "bg-slate-50 border-slate-200"} p-4 rounded-2xl border shadow-sm flex flex-col justify-center items-center text-center`}
            >
              <p
                className={`text-xs ${remainingForYoussefSAR > 0 ? "text-amber-600" : "text-slate-500"} font-bold mb-1`}
              >
                المتبقي له من الأرباح الموزعة
              </p>
              <div
                className={`text-xl md:text-2xl font-black ${remainingForYoussefSAR > 0 ? "text-amber-700" : "text-slate-700"}`}
              >
                {remainingForYoussefSAR.toLocaleString()} SAR
              </div>
            </div>
          </div>

          {/* جدول التسويات (تسليم الأرباح) */}
          <div className="border-t border-emerald-100 bg-slate-50/50">
            <div className="p-4 bg-slate-100/50 text-xs font-black text-slate-500 uppercase border-b border-slate-100">
              سجل دفعات الأرباح التي استلمها يوسف
            </div>
            <div className="max-h-[250px] overflow-y-auto custom-scrollbar p-2">
              {settlements.length === 0 ? (
                <div className="text-center py-6 text-slate-400 font-bold text-sm">
                  لم يستلم يوسف أي أرباح حتى الآن
                </div>
              ) : (
                settlements.map((set) => (
                  <div
                    key={set.id}
                    className="flex justify-between items-center p-3 bg-white mb-2 rounded-xl border border-slate-200 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                        <CheckCircle size={16} />
                      </div>
                      <div>
                        <div className="font-black text-slate-800 text-sm">
                          {set.description}
                        </div>
                        <div className="text-[10px] font-bold text-slate-500 mt-0.5">
                          {new Date(set.date).toLocaleDateString("ar-EG")}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-black text-slate-700">
                        {set.amount.toLocaleString()} {set.currency}
                      </span>
                      <button
                        onClick={() => handleDeleteItem(set.id, "settlement")}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* =========================================
            القسم الثالث: السلف والمديونيات (باللون البرتقالي)
           ========================================= */}
        <div className="bg-white rounded-3xl border border-amber-200 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-4 md:p-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-white">
            <div className="flex items-center gap-3">
              <Wallet size={28} className="text-amber-100" />
              <h2 className="text-xl md:text-2xl font-black">
                القسم الثالث: السلف والمديونيات
              </h2>
            </div>
            <button
              onClick={() => setActiveModal("loan")}
              className="h-10 px-5 rounded-xl bg-white text-amber-700 hover:bg-amber-50 font-black shadow-md transition-all text-sm flex items-center gap-2"
            >
              <Plus size={16} /> إضافة سلفة جديدة
            </button>
          </div>

          <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {loans.length === 0 ? (
              <div className="col-span-full text-center py-10 text-slate-400 font-bold text-sm">
                لا توجد سلف مسجلة بينكم حالياً
              </div>
            ) : (
              loans.map((loan) => (
                <div
                  key={loan.id}
                  className="p-4 bg-slate-50 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
                        <History size={16} />
                      </div>
                      <div>
                        <div className="font-black text-slate-800">
                          {loan.description}
                        </div>
                        <div className="text-xs font-bold text-slate-500 mt-1">
                          من: {loan.fromPartner} ← إلى: {loan.toPartner}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteItem(loan.id, "loan")}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="flex justify-between items-end border-t border-slate-200 pt-3">
                    <div className="text-xs font-bold">
                      {loan.deductFromLiquidation ? (
                        <span className="text-red-600 bg-red-50 px-2 py-1 rounded">
                          يخصم من التصفية القادمة
                        </span>
                      ) : (
                        <span className="text-slate-600">
                          السداد:{" "}
                          {loan.repaymentDate
                            ? new Date(loan.repaymentDate).toLocaleDateString(
                                "ar-EG",
                              )
                            : "غير محدد"}
                        </span>
                      )}
                    </div>
                    <div className="font-black text-lg text-slate-900">
                      {loan.amount.toLocaleString()} {loan.currency}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* --- النوافذ المنبثقة (Modals) تبقى كما هي بالكود السابق لعدم الإطالة --- */}
      {/* 1. إضافة مساهمة رأس مال */}
      {activeModal === "contribution" && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl animate-in slide-in-from-bottom-10 flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-blue-50 shrink-0">
              <h3 className="font-black text-slate-800 flex items-center gap-2">
                <Plus size={18} className="text-blue-600" /> إثبات دفعة رأس مال
                يوسف
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 hover:bg-blue-100 text-slate-500 rounded-xl"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto custom-scrollbar flex-1">
              <form onSubmit={handleAddContribution} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputCompact
                    label="المبلغ المدفوع"
                    type="number"
                    value={contributionForm.amount}
                    onChange={(v) =>
                      setContributionForm({ ...contributionForm, amount: v })
                    }
                  />
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-500 uppercase ml-1">
                      عملة الدفع
                    </label>
                    <select
                      className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs font-bold outline-none"
                      value={contributionForm.currency}
                      onChange={(e) =>
                        setContributionForm({
                          ...contributionForm,
                          currency: e.target.value,
                        })
                      }
                    >
                      <option value="EGP">جنيه مصري (EGP)</option>
                      <option value="USD">دولار أمريكي (USD)</option>
                      <option value="SAR">ريال سعودي (SAR)</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <InputCompact
                      label="القيمة الثابتة للمبلغ بالريال السعودي (SAR)"
                      type="number"
                      value={contributionForm.amountInSAR}
                      onChange={(v) =>
                        setContributionForm({
                          ...contributionForm,
                          amountInSAR: v,
                        })
                      }
                    />
                  </div>
                  <InputCompact
                    label="تاريخ الدفع"
                    type="date"
                    value={contributionForm.date}
                    onChange={(v) =>
                      setContributionForm({ ...contributionForm, date: v })
                    }
                  />
                  <InputCompact
                    label="البيان"
                    value={contributionForm.description}
                    onChange={(v) =>
                      setContributionForm({
                        ...contributionForm,
                        description: v,
                      })
                    }
                  />
                </div>
                <div className="flex gap-2 pt-4 border-t border-slate-100 mt-6">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="flex-1 py-3 rounded-xl font-black text-slate-600 bg-slate-100 text-sm"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-[2] bg-blue-600 text-white py-3 rounded-xl font-black text-sm"
                  >
                    تثبيت الدفعة
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 2. تسليم أرباح */}
      {activeModal === "settlement" && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl animate-in slide-in-from-bottom-10 flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-emerald-50 shrink-0">
              <h3 className="font-black text-slate-800 flex items-center gap-2">
                <Plus size={18} className="text-emerald-600" /> تسليم أرباح
                يوسف
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 hover:bg-emerald-100 text-slate-500 rounded-xl"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto custom-scrollbar flex-1">
              <form onSubmit={handleAddSettlement} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputCompact
                    label="المبلغ المسدد"
                    type="number"
                    value={settlementForm.amount}
                    onChange={(v) =>
                      setSettlementForm({ ...settlementForm, amount: v })
                    }
                  />
                  <InputCompact
                    label="العملة"
                    value={settlementForm.currency}
                    onChange={(v) =>
                      setSettlementForm({ ...settlementForm, currency: v })
                    }
                  />
                  <InputCompact
                    label="التاريخ"
                    type="date"
                    value={settlementForm.date}
                    onChange={(v) =>
                      setSettlementForm({ ...settlementForm, date: v })
                    }
                  />
                  <div className="sm:col-span-2">
                    <InputCompact
                      label="البيان"
                      value={settlementForm.description}
                      onChange={(v) =>
                        setSettlementForm({ ...settlementForm, description: v })
                      }
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-4 border-t border-slate-100 mt-6">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="flex-1 py-3 rounded-xl font-black text-slate-600 bg-slate-100 text-sm"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-[2] bg-emerald-600 text-white py-3 rounded-xl font-black text-sm"
                  >
                    حفظ
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 3. إضافة سلفة */}
      {activeModal === "loan" && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-xl rounded-t-3xl sm:rounded-3xl shadow-2xl animate-in slide-in-from-bottom-10 flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-amber-50 shrink-0">
              <h3 className="font-black text-slate-800 flex items-center gap-2">
                <Plus size={18} className="text-amber-600" /> إضافة سلفة جديدة
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 hover:bg-amber-100 text-slate-500 rounded-xl"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto custom-scrollbar flex-1">
              <form onSubmit={handleAddLoan} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputCompact
                    label="المبلغ"
                    type="number"
                    value={loanForm.amount}
                    onChange={(v) => setLoanForm({ ...loanForm, amount: v })}
                  />
                  <InputCompact
                    label="العملة"
                    value={loanForm.currency}
                    onChange={(v) => setLoanForm({ ...loanForm, currency: v })}
                  />
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-500 uppercase ml-1">
                      من الشريك
                    </label>
                    <select
                      className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs font-bold outline-none"
                      value={loanForm.fromPartner}
                      onChange={(e) =>
                        setLoanForm({
                          ...loanForm,
                          fromPartner: e.target.value,
                        })
                      }
                    >
                      <option value="أنا">أنا</option>
                      <option value="يوسف">يوسف</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-500 uppercase ml-1">
                      إلى الشريك
                    </label>
                    <select
                      className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs font-bold outline-none"
                      value={loanForm.toPartner}
                      onChange={(e) =>
                        setLoanForm({ ...loanForm, toPartner: e.target.value })
                      }
                    >
                      <option value="يوسف">يوسف</option>
                      <option value="أنا">أنا</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <InputCompact
                      label="الوصف"
                      value={loanForm.description}
                      onChange={(v) =>
                        setLoanForm({ ...loanForm, description: v })
                      }
                    />
                  </div>
                  <div className="sm:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded w-4 h-4 text-amber-600"
                        checked={loanForm.deductFromLiquidation}
                        onChange={(e) =>
                          setLoanForm({
                            ...loanForm,
                            deductFromLiquidation: e.target.checked,
                          })
                        }
                      />
                      <span className="text-sm font-black text-red-600">
                        خصم من التصفية القادمة
                      </span>
                    </label>
                    {!loanForm.deductFromLiquidation && (
                      <InputCompact
                        label="تاريخ الاستحقاق (اختياري)"
                        type="date"
                        required={false}
                        value={loanForm.repaymentDate}
                        onChange={(v) =>
                          setLoanForm({ ...loanForm, repaymentDate: v })
                        }
                      />
                    )}
                  </div>
                </div>
                <div className="flex gap-2 pt-4 border-t border-slate-100 mt-6">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="flex-1 py-3 rounded-xl font-black text-slate-600 bg-slate-100 text-sm"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-[2] bg-amber-600 text-white py-3 rounded-xl font-black text-sm"
                  >
                    حفظ
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 4. إعدادات البوابة */}
      {activeModal === "settings" && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-2xl rounded-t-3xl sm:rounded-3xl shadow-2xl animate-in slide-in-from-bottom-10 flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h3 className="font-black text-slate-800 flex items-center gap-2">
                <Settings size={18} className="text-slate-600" /> إعدادات بوابة
                يوسف
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 hover:bg-slate-200 text-slate-500 rounded-xl"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto custom-scrollbar flex-1">
              <form onSubmit={handleSaveSettings} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputCompact
                    label="العملة الأساسية"
                    value={portalSettings.primaryCurrency}
                    onChange={(v) =>
                      setPortalSettings({
                        ...portalSettings,
                        primaryCurrency: v,
                      })
                    }
                  />
                  <InputCompact
                    label="نسبة يوسف من حصتي (%)"
                    type="number"
                    value={portalSettings.youssefSharePercentage}
                    onChange={(v) =>
                      setPortalSettings({
                        ...portalSettings,
                        youssefSharePercentage: Number(v),
                      })
                    }
                  />
                  <div className="sm:col-span-2">
                    <InputCompact
                      label="بريد يوسف"
                      type="email"
                      value={portalSettings.partnerEmail}
                      onChange={(v) =>
                        setPortalSettings({
                          ...portalSettings,
                          partnerEmail: v,
                        })
                      }
                      required={false}
                    />
                  </div>
                </div>
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-black text-slate-400 uppercase mb-3">
                    الصلاحيات
                  </h4>
                  <CustomSwitch
                    label="عرض تفاصيل رأس المال"
                    checked={portalSettings.showCapital}
                    onChange={(c) =>
                      setPortalSettings({ ...portalSettings, showCapital: c })
                    }
                    icon={<Eye size={16} className="text-blue-500" />}
                  />
                  <CustomSwitch
                    label="عرض الأرباح"
                    checked={portalSettings.showProfits}
                    onChange={(c) =>
                      setPortalSettings({ ...portalSettings, showProfits: c })
                    }
                    icon={<TrendingUp size={16} className="text-emerald-500" />}
                  />
                </div>
                <div className="flex gap-2 pt-4 border-t border-slate-100 mt-6">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="flex-1 py-3 rounded-xl font-black text-slate-600 bg-slate-100 text-sm"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-[2] bg-slate-900 text-white py-3 rounded-xl font-black text-sm"
                  >
                    حفظ
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

// ---------------- Components ---------------- //
function CustomSwitch({ label, checked, onChange, icon }) {
  return (
    <div
      className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-200 cursor-pointer"
      onClick={() => onChange(!checked)}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm font-bold text-slate-700">{label}</span>
      </div>
      <div
        className={`w-11 h-6 rounded-full flex items-center px-1 transition-colors ${checked ? "bg-teal-500" : "bg-slate-300"}`}
      >
        <div
          className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${checked ? "-translate-x-5" : "translate-x-0"}`}
        ></div>
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
    <div className="space-y-1.5">
      <label className="text-[11px] font-black text-slate-500 uppercase ml-1">
        {label}
      </label>
      <input
        type={type}
        className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-3 text-sm font-bold outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
    </div>
  );
}
