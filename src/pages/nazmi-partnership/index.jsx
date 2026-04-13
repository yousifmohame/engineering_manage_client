import React, { useState, useEffect } from "react";
import {
  Briefcase,
  Settings,
  TrendingUp,
  Wallet,
  Calculator,
  Receipt,
  FileText,
  X,
  Save,
  ChevronDown,
} from "lucide-react";
import PartnershipIncome from "./PartnershipIncome";
import PartnershipLiquidation from "./PartnershipLiquidation";
import PartnershipExpenses from "./PartnershipExpenses";
import PartnershipDistributions from "./PartnershipDistributions";
import PartnershipReports from "./PartnershipReports";
import { nazmiService } from "../../services/nazmiService";

export default function NazmiPartnershipPage() {
  const [activeTab, setActiveTab] = useState("income");
  const [settings, setSettings] = useState({
    id: "",
    myPercentage: 50,
    partnerPercentage: 50,
    partnerName: "نظمي",
    currency: "SAR",
    capitalSAR: 1000000,
    cashReserveSAR: 50000,
    establishmentDate: new Date().toISOString().split("T")[0],
    companyName: "المكتب الهندسي",
  });

  const [transactions, setTransactions] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await nazmiService.getData();
      setTransactions(data.transactions || []);
      if (data.id) {
        setSettings((prev) => ({
          ...prev,
          id: data.id,
          myPercentage: data.mySharePercent ?? 50,
          partnerPercentage: data.partnerShare ?? 50,
          capitalSAR: data.capital ?? 1000000,
          cashReserveSAR: data.reserve ?? 50000,
        }));
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const saveSettings = async (e) => {
    e.preventDefault();
    try {
      await nazmiService.updateSettings({
        capital: settings.capitalSAR,
        reserve: settings.cashReserveSAR,
        mySharePercent: settings.myPercentage,
        partnerShare: settings.partnerPercentage,
      });
      setShowSettings(false);
      loadData();
    } catch (error) {
      alert("حدث خطأ أثناء حفظ الإعدادات");
    }
  };

  const tabs = [
    { id: "income", label: "الإيرادات", icon: TrendingUp, color: "text-blue-600", border: "border-blue-600" },
    { id: "expenses", label: "المصاريف", icon: Receipt, color: "text-red-600", border: "border-red-600" },
    { id: "distributions", label: "التوزيعات", icon: Wallet, color: "text-emerald-600", border: "border-emerald-600" },
    { id: "liquidation", label: "التصفية والأرباح", icon: Calculator, color: "text-indigo-600", border: "border-indigo-600" },
    { id: "reports", label: "التقارير", icon: FileText, color: "text-purple-600", border: "border-purple-600" },
  ];

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 mx-auto border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-slate-600 font-bold text-sm">جاري التحميل...</p>
        </div>
      </div>
    );

  return (
    <div className="flex-1 min-h-screen bg-slate-50 font-cairo" dir="rtl">
      <div className="max-w-7xl mx-auto px-2 sm:px-3 pb-20 sm:pb-6">
        
        {/* ✅ Header - Compact Mobile */}
        <header className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 p-3 sm:p-4 mb-3 sm:mb-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="p-2 sm:p-2.5 bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 rounded-lg sm:rounded-xl shadow-inner border border-blue-200/50 shrink-0">
                <Briefcase size={18} className="sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  أرباح الشراكة
                </h1>
                <p className="text-slate-500 mt-0.5 text-[10px] sm:text-xs font-medium truncate">
                  {settings.companyName} • {settings.partnerName}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="shrink-0 flex items-center justify-center gap-1.5 h-9 sm:h-10 px-3 sm:px-4 rounded-lg sm:rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-bold text-slate-700 shadow-sm transition-all text-[10px] sm:text-xs active:scale-95 min-w-[40px] min-h-[40px]"
              aria-label="إعدادات"
            >
              <Settings size={16} />
              <span className="hidden sm:inline">إعدادات</span>
            </button>
          </div>
        </header>

        {/* ✅ Tabs Navigation - Compact */}
        <nav className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 mb-3 sm:mb-4 overflow-hidden">
          {/* 📱 Mobile: Compact Dropdown */}
          <div className="sm:hidden p-2">
            <div className="relative">
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value)}
                className="w-full h-10 px-3 pr-8 rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 active:bg-slate-100 transition-all"
                aria-label="اختر القسم"
              >
                {tabs.map((tab) => (
                  <option key={tab.id} value={tab.id}>{tab.label}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* 💻 Desktop: Horizontal Tabs */}
          <div className="hidden sm:flex overflow-x-auto hide-scrollbar scroll-smooth snap-x border-b border-slate-100">
            {tabs.map((tab) => (
              <TabButton
                key={tab.id}
                active={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                icon={<tab.icon size={14} className="shrink-0" />}
                label={tab.label}
                color={tab.color}
                border={tab.border}
              />
            ))}
          </div>
        </nav>

        {/* ✅ Tab Content */}
        <main className="space-y-3 sm:space-y-4">
          {activeTab === "income" && (
            <PartnershipIncome settings={settings} transactions={transactions} reload={loadData} />
          )}
          {activeTab === "expenses" && (
            <PartnershipExpenses settings={settings} transactions={transactions} reload={loadData} />
          )}
          {activeTab === "distributions" && (
            <PartnershipDistributions settings={settings} transactions={transactions} reload={loadData} />
          )}
          {activeTab === "liquidation" && (
            <PartnershipLiquidation settings={settings} transactions={transactions} />
          )}
          {activeTab === "reports" && (
            <PartnershipReports settings={settings} transactions={transactions} />
          )}
        </main>

      </div>

      {/* ✅ Settings Modal - Compact Mobile Bottom Sheet */}
      {showSettings && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-0 sm:p-3"
          onClick={(e) => e.target === e.currentTarget && setShowSettings(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="settings-title"
        >
          <div className="bg-white w-full max-w-lg sm:max-w-2xl rounded-t-2xl sm:rounded-2xl shadow-2xl animate-in slide-in-from-bottom-10 overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh]">
            
            {/* Modal Header - Compact */}
            <div className="p-3 sm:p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0 sticky top-0 z-10">
              <h3 id="settings-title" className="font-black text-slate-800 text-sm sm:text-base flex items-center gap-2">
                <Settings size={16} className="text-blue-600" /> إعدادات الشراكة
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1.5 sm:p-2 hover:bg-slate-200 text-slate-500 rounded-lg sm:rounded-xl transition-all min-w-[36px] min-h-[36px] flex items-center justify-center"
                aria-label="إغلاق"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content - Compact */}
            <div className="p-3 sm:p-4 overflow-y-auto custom-scrollbar flex-1">
              <form onSubmit={saveSettings} className="space-y-4">
                
                {/* Percentages Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase">نسبتي (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      required
                      inputMode="numeric"
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      value={settings.myPercentage}
                      onChange={(e) => {
                        const val = Math.min(100, Math.max(0, Number(e.target.value)));
                        setSettings((prev) => ({ ...prev, myPercentage: val, partnerPercentage: 100 - val }));
                      }}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase">نسبة {settings.partnerName} (%)</label>
                    <input
                      type="number"
                      readOnly
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-100 text-slate-500 text-sm font-bold outline-none cursor-not-allowed"
                      value={settings.partnerPercentage}
                    />
                  </div>
                </div>

                {/* Financial Inputs */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase">رأس المال (SAR)</label>
                    <input
                      type="number"
                      min="0"
                      required
                      inputMode="numeric"
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      value={settings.capitalSAR}
                      onChange={(e) => setSettings((prev) => ({ ...prev, capitalSAR: e.target.value ? Number(e.target.value) : "" }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase">احتياطي (SAR)</label>
                    <input
                      type="number"
                      min="0"
                      required
                      inputMode="numeric"
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      value={settings.cashReserveSAR}
                      onChange={(e) => setSettings((prev) => ({ ...prev, cashReserveSAR: e.target.value ? Number(e.target.value) : "" }))}
                    />
                  </div>
                </div>

                {/* Action Buttons - Compact */}
                <div className="flex gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowSettings(false)}
                    className="flex-1 h-10 rounded-lg font-black text-slate-600 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-xs transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white h-10 rounded-lg font-black shadow-sm flex items-center justify-center gap-1.5 transition-all text-xs"
                  >
                    <Save size={14} /> حفظ
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

// ✅ TabButton - Compact
function TabButton({ active, onClick, icon, label, color, border }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-3 font-medium text-[11px] border-b-[2px] transition-all whitespace-nowrap flex items-center gap-1.5 snap-center focus:outline-none min-h-[44px] ${
        active
          ? `${border} ${color} font-black bg-slate-50/50`
          : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/30 active:bg-slate-100"
      }`}
      role="tab"
      aria-selected={active}
    >
      {icon} {label}
    </button>
  );
}