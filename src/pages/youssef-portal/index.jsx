import React, { useState, useEffect } from 'react';
import { 
  BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, 
  PieChart as RePieChart, Pie, Cell 
} from 'recharts';
import { 
  Users, History, CheckCircle, Wallet, PieChart, AlertCircle, Settings, Eye, EyeOff, 
  BarChart, Loader2, TrendingUp, FileText 
} from 'lucide-react';

// استيراد الخدمات الحقيقية من مشروعك
import { youssefService } from '../../services/youssefService';
import { nazmiService } from '../../services/nazmiService';
import { expenseService } from '../../services/expenseService';

// مكون عرض العملة (مدمج ليعمل بدون مشاكل استيراد)
function CurrencyDisplay({ amount, currency = "SAR", className = "", showAll = false }) {
  return (
    <div className={`flex flex-col font-cairo ${className}`}>
      <span className="font-black" dir="ltr">
         {amount.toLocaleString(undefined, {maximumFractionDigits: 2})} <span className="text-sm font-normal">{currency}</span>
      </span>
      {showAll && (
        <div className="flex gap-2 text-[10px] font-bold opacity-70 mt-1" dir="ltr">
          <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-100">
            ${(amount * 0.2667).toLocaleString(undefined, {maximumFractionDigits: 0})}
          </span>
          <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-100">
            EGP {(amount * 12.8).toLocaleString(undefined, {maximumFractionDigits: 0})}
          </span>
        </div>
      )}
    </div>
  );
}

export default function YoussefPortal() {
  const [partnershipSettings, setPartnershipSettings] = useState(null);
  const [portalSettings, setPortalSettings] = useState({ 
    showSettings: false, showCapital: true, showProfits: true, showBankShare: true, showAiAnalysis: true 
  });
  
  const [settlements, setSettlements] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [distributions, setDistributions] = useState([]);
  const [officeExpenses, setOfficeExpenses] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [settlementFilter, setSettlementFilter] = useState('all');

  // جلب البيانات الحقيقية من الخادم
  const loadData = async () => {
    setLoading(true);
    try {
      const [youssefData, nazmiData, officeData] = await Promise.all([
        youssefService.getData(),
        nazmiService.getData(),
        expenseService.getExpenses()
      ]);

      // إعدادات يوسف
      if(youssefData.settings) {
         setPortalSettings(prev => ({ 
             ...prev, 
             youssefSharePercentage: youssefData.settings.youssefSharePercentage || 20,
             showCapital: youssefData.settings.showCapital ?? true,
             showProfits: youssefData.settings.showProfits ?? true,
             showAiAnalysis: youssefData.settings.showAiAnalysis ?? true
         }));
      }
      setSettlements(youssefData.settlements || []);

      // إعدادات نظمي (الشراكة الأم)
      setPartnershipSettings({
        myPercentage: nazmiData.mySharePercent || 50,
        capitalSAR: nazmiData.capital || 0
      });

      // إيرادات وتوزيعات الشراكة الأم
      const allNazmiTx = nazmiData.transactions || [];
      setIncomes(allNazmiTx.filter(t => t.type === 'إيراد'));
      setDistributions(allNazmiTx.filter(t => t.type === 'توزيع' || t.type === 'DISTRIBUTION'));

      // مصروفات المكتب
      setOfficeExpenses(officeData.expenses || []);

    } catch (error) {
      console.error("خطأ في جلب البيانات:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const savePortalSettings = async () => {
    try {
        await youssefService.updateSettings({
            ...portalSettings,
            youssefSharePercentage: portalSettings.youssefSharePercentage
        });
        setPortalSettings({...portalSettings, showSettings: false});
        alert('تم حفظ الإعدادات بنجاح');
    } catch(e) {
        alert('حدث خطأ أثناء الحفظ');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" size={40} /></div>;

  // --- الحسابات المالية الدقيقة ---
  const myNazmySharePercentage = partnershipSettings?.myPercentage || 50; 
  const youssefShareOfMyShare = portalSettings?.youssefSharePercentage || 20;

  const filteredSettlements = settlements.filter(s => {
    if (settlementFilter === 'all') return true;
    const date = new Date(s.date);
    const now = new Date();
    if (settlementFilter === 'month') return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    return true;
  });

  const totalDistributedSAR = distributions.reduce((sum, d) => sum + (d.amount || 0), 0);
  const totalBankIncomeSAR = incomes.filter(i => i.category === 'بنك').reduce((sum, i) => sum + i.amount, 0);
  const totalCashIncomeSAR = incomes.filter(i => i.category === 'كاش').reduce((sum, i) => sum + i.amount, 0);

  const undistributedCashSAR = Math.max(0, totalCashIncomeSAR - totalDistributedSAR);
  const totalUndistributedSAR = totalBankIncomeSAR + undistributedCashSAR;

  // حصص يوسف
  const myTotalDistributedSAR = totalDistributedSAR * (myNazmySharePercentage / 100);
  const myTotalUndistributedSAR = totalUndistributedSAR * (myNazmySharePercentage / 100);

  const youssefDistributedShareSAR = myTotalDistributedSAR * (youssefShareOfMyShare / 100);
  const youssefUndistributedShareSAR = myTotalUndistributedSAR * (youssefShareOfMyShare / 100);

  // رأس المال
  const youssefSharePercentageOfTotal = (myNazmySharePercentage / 100) * (youssefShareOfMyShare / 100) * 100;
  const youssefCapitalContributionSAR = (partnershipSettings?.capitalSAR || 0) * (youssefSharePercentageOfTotal / 100);

  const totalReceivedByYoussefSAR = settlements.reduce((acc, curr) => acc + curr.amount, 0);
  const remainingForYoussefSAR = youssefDistributedShareSAR - totalReceivedByYoussefSAR;
  
  const cashReserveSAR = portalSettings?.cashReserveSAR || 0;
  const youssefCashReserveShareSAR = cashReserveSAR * (youssefShareOfMyShare / 100);
  
  const totalOfficeExpensesSAR = officeExpenses.reduce((sum, e) => sum + e.amount, 0);
  const youssefShareOfOfficeExpensesSAR = totalOfficeExpensesSAR * (youssefSharePercentageOfTotal / 100);

  const expensesByCategory = officeExpenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});
  const expenseData = Object.entries(expensesByCategory).map(([name, value]) => ({ name, value }));
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 md:p-6 font-cairo pb-20" dir="rtl">
      
      {/* Header Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-2 shadow-lg rounded-2xl overflow-hidden relative bg-gradient-to-br from-slate-900 to-slate-800 text-white">
          <div className="absolute top-0 left-0 p-4 opacity-10">
            <Users size={120} />
          </div>
          <div className="p-8 relative z-10 h-full flex flex-col justify-center">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-teal-500/20 rounded-2xl border border-teal-500/30 shadow-inner">
                <Users size={36} className="text-teal-400" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-white">بوابة الشريك يوسف</h1>
                <p className="text-slate-300 mt-2 font-medium text-sm md:text-lg">منصة عرض البيانات المالية المحدثة حياً</p>
              </div>
            </div>
          </div>
        </div>

        <div className="shadow-md rounded-2xl overflow-hidden relative bg-white border border-slate-100">
          <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-emerald-400 to-emerald-600"></div>
          <div className="p-6 h-full flex flex-col justify-center">
            <p className="text-sm font-bold text-emerald-800 mb-2 flex items-center gap-2">
              <CheckCircle size={16} className="text-emerald-500" /> إجمالي ما تم استلامه
            </p>
            <CurrencyDisplay amount={totalReceivedByYoussefSAR} currency="SAR" className="text-emerald-900 text-2xl md:text-3xl font-black" showAll />
          </div>
        </div>

        <div className={`shadow-md rounded-2xl overflow-hidden relative border border-slate-100 ${remainingForYoussefSAR > 0 ? 'bg-amber-50' : 'bg-slate-50'}`}>
          <div className={`absolute top-0 right-0 w-full h-1 bg-gradient-to-l ${remainingForYoussefSAR > 0 ? 'from-amber-400 to-amber-600' : 'from-slate-400 to-slate-600'}`}></div>
          <div className="p-6 h-full flex flex-col justify-center">
            <p className={`text-sm font-bold mb-2 flex items-center gap-2 ${remainingForYoussefSAR > 0 ? 'text-amber-800' : 'text-slate-600'}`}>
              <Wallet size={16} className={remainingForYoussefSAR > 0 ? 'text-amber-500' : 'text-slate-400'} /> الرصيد المتبقي ليوسف
            </p>
            <CurrencyDisplay amount={remainingForYoussefSAR} currency="SAR" className={`${remainingForYoussefSAR > 0 ? 'text-amber-900' : 'text-slate-900'} text-2xl md:text-3xl font-black`} showAll />
            {remainingForYoussefSAR < 5000 && remainingForYoussefSAR > 0 && (
              <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-100/80 p-2 rounded-lg border border-amber-200">
                <AlertCircle size={14} /> تنبيه: الرصيد منخفض
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Capital Summary */}
      <div className="shadow-lg rounded-2xl overflow-hidden relative bg-white border border-slate-100">
        <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-blue-400 to-blue-600"></div>
        <div className="bg-slate-50/50 border-b border-slate-100 p-4 flex justify-between items-center">
          <h2 className="flex items-center gap-2 text-slate-800 font-black text-lg">
            <PieChart className="text-blue-600" size={20} /> ملخص رأس مال الشراكة
          </h2>
          <button onClick={() => setPortalSettings({...portalSettings, showSettings: !portalSettings.showSettings})} className="p-2 bg-white rounded-lg border shadow-sm text-slate-600 hover:bg-slate-50"><Settings size={18}/></button>
        </div>
        
        {/* Settings Panel */}
        {portalSettings.showSettings && (
          <div className="p-4 bg-slate-100 border-b border-slate-200">
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                 <label className="flex items-center gap-2 text-sm font-bold bg-white p-3 rounded-xl border cursor-pointer"><input type="checkbox" checked={portalSettings.showCapital} onChange={e=>setPortalSettings({...portalSettings, showCapital: e.target.checked})} className="w-4 h-4 text-blue-600"/> عرض رأس المال</label>
                 <label className="flex items-center gap-2 text-sm font-bold bg-white p-3 rounded-xl border cursor-pointer"><input type="checkbox" checked={portalSettings.showProfits} onChange={e=>setPortalSettings({...portalSettings, showProfits: e.target.checked})} className="w-4 h-4 text-blue-600"/> عرض الأرباح</label>
                 <label className="flex items-center gap-2 text-sm font-bold bg-white p-3 rounded-xl border cursor-pointer"><input type="checkbox" checked={portalSettings.showBankShare} onChange={e=>setPortalSettings({...portalSettings, showBankShare: e.target.checked})} className="w-4 h-4 text-blue-600"/> عرض البنك</label>
                 <label className="flex items-center gap-2 text-sm font-bold bg-white p-3 rounded-xl border cursor-pointer"><input type="checkbox" checked={portalSettings.showAiAnalysis} onChange={e=>setPortalSettings({...portalSettings, showAiAnalysis: e.target.checked})} className="w-4 h-4 text-blue-600"/> عرض AI</label>
             </div>
             <button onClick={savePortalSettings} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800">حفظ الإعدادات</button>
          </div>
        )}

        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100/50 shadow-sm">
            <p className="text-sm text-blue-800 font-bold mb-2">إجمالي رأس المال</p>
            <div className="text-3xl font-black text-blue-900">{(partnershipSettings?.capitalSAR || 0).toLocaleString()} <span className="text-sm">SAR</span></div>
          </div>
          <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100/50 shadow-sm">
            <p className="text-sm text-emerald-800 font-bold mb-2">حصة يوسف من الشركة</p>
            <div className="text-3xl font-black text-emerald-900">{youssefSharePercentageOfTotal.toFixed(1)}%</div>
          </div>
          <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100/50 shadow-sm">
            <p className="text-sm text-amber-800 font-bold mb-2">مساهمة يوسف الفعلية</p>
            <div className="text-3xl font-black text-amber-900">{youssefCapitalContributionSAR.toLocaleString(undefined, {maximumFractionDigits: 0})} <span className="text-sm">SAR</span></div>
          </div>
        </div>
      </div>

      {/* Shares Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="shadow-md rounded-2xl overflow-hidden relative bg-white border border-slate-100">
          <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-teal-400 to-teal-600"></div>
          <div className="pb-2 bg-teal-50/50 border-b border-teal-100/50 p-4">
            <h3 className="text-sm text-teal-800 font-black uppercase">نسبة الشراكة الخاصة</h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <div className="text-4xl font-black text-teal-600">{youssefShareOfMyShare}%</div>
              <p className="text-sm text-slate-500 font-bold mt-1">من حصة الشريك الأساسي</p>
            </div>
          </div>
        </div>
        
        {portalSettings?.showProfits && (
          <div className="shadow-md rounded-2xl overflow-hidden relative bg-white border border-slate-100">
            <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-blue-400 to-blue-600"></div>
            <div className="pb-2 bg-blue-50/50 border-b border-blue-100/50 p-4">
              <h3 className="text-sm text-blue-800 font-black uppercase">الأرباح المستحقة للمقاسمة</h3>
            </div>
            <div className="p-6">
              <CurrencyDisplay amount={youssefDistributedShareSAR} currency="SAR" showAll className="text-3xl font-black text-slate-800" />
            </div>
          </div>
        )}

        {portalSettings?.showBankShare && (
           <div className="shadow-md rounded-2xl overflow-hidden relative bg-white border border-slate-100">
           <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-indigo-400 to-indigo-600"></div>
           <div className="pb-2 bg-indigo-50/50 border-b border-indigo-100/50 p-4">
             <h3 className="text-sm text-indigo-800 font-black uppercase">نصيب من أرصدة البنك</h3>
           </div>
           <div className="p-6">
             <CurrencyDisplay amount={youssefUndistributedShareSAR} currency="SAR" showAll className="text-3xl font-black text-slate-800" />
           </div>
         </div>
        )}
      </div>

      {/* Charts & Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="shadow-lg rounded-2xl overflow-hidden relative bg-white border border-slate-100 flex flex-col">
          <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-purple-400 to-pink-500"></div>
          <div className="border-b border-slate-100 bg-slate-50/50 p-4">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2"><PieChart size={20} className="text-purple-500" /> مصروفات المكتب العامة</h3>
          </div>
          <div className="h-72 p-4 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie data={expenseData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={{ fill: '#475569', fontWeight: 'bold', fontSize: 12 }}>
                  {expenseData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="white" strokeWidth={2} />)}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="shadow-lg rounded-2xl overflow-hidden relative bg-white border border-slate-100">
          <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-slate-400 to-slate-600"></div>
          <div className="border-b border-slate-100 bg-slate-50/50 p-4">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2"><FileText size={20} className="text-slate-500" /> كشف الحساب التحليلي</h3>
          </div>
          <div className="p-6 space-y-3">
            <div className="flex justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="font-bold text-slate-700">نصيب يوسف من التوزيعات:</span>
              <CurrencyDisplay amount={youssefDistributedShareSAR} className="font-black" />
            </div>
            <div className="flex justify-between p-3 bg-purple-50 rounded-xl border border-purple-100">
              <span className="font-bold text-purple-800">نصيب يوسف من مصروفات المكتب (يخصم):</span>
              <CurrencyDisplay amount={youssefShareOfOfficeExpensesSAR} className="font-black text-purple-900" />
            </div>
            <div className="flex justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-100">
              <span className="font-bold text-emerald-800">إجمالي ما تم استلامه (دفعات):</span>
              <CurrencyDisplay amount={totalReceivedByYoussefSAR} className="font-black text-emerald-900" />
            </div>
            <div className="flex justify-between p-4 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl border border-teal-200 mt-4 shadow-sm">
              <span className="font-black text-teal-900 text-lg">الرصيد المتبقي ليوسف:</span>
              <CurrencyDisplay amount={remainingForYoussefSAR} className="font-black text-teal-700 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Settlements History Table */}
      <div className="shadow-lg rounded-2xl overflow-hidden relative bg-white border border-slate-100">
        <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-slate-400 to-slate-600"></div>
        <div className="border-b border-slate-100 bg-slate-50/50 p-4 flex justify-between items-center">
          <h3 className="text-lg font-black text-slate-800 flex items-center gap-2"><History className="text-slate-500" size={20} /> سجل الدفعات المستلمة</h3>
        </div>
        <div className="p-0">
          {filteredSettlements.length === 0 ? (
            <div className="text-center p-10 text-slate-400 font-bold">لا توجد دفعات مسجلة حتى الآن</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredSettlements.map(settlement => (
                <div key={settlement.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle size={24} /></div>
                    <div>
                      <div className="font-black text-slate-900">{settlement.description}</div>
                      <div className="text-xs text-slate-500 font-bold mt-1">{new Date(settlement.date).toLocaleDateString('ar-EG')}</div>
                    </div>
                  </div>
                  <CurrencyDisplay amount={settlement.amount} currency="SAR" className="items-end font-black text-slate-800 text-lg" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}