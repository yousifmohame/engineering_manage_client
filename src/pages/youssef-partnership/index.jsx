import React, { useState, useEffect } from 'react';
import { Users, Plus, Calculator, History, Settings, Eye, EyeOff, CheckCircle, Trash2, Landmark, Banknote, TrendingUp, Wallet, X, Save } from 'lucide-react';
import { youssefService } from '../../services/youssefService';
import { nazmiService } from '../../services/nazmiService'; // لجلب بيانات الشركة الأم

export default function YoussefPartnershipPage() {
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [settlements, setSettlements] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [distributions, setDistributions] = useState([]);
  const [loans, setLoans] = useState([]);
  
  const [partnershipSettings, setPartnershipSettings] = useState({ capitalSAR: 1000000, myPercentage: 50, partnerPercentage: 50 });
  const [portalSettings, setPortalSettings] = useState({
    showCapital: true, showProfits: true, showBankShare: true, showAiAnalysis: true,
    youssefSharePercentage: 20, useDynamicShare: false, partnerEmail: '', companyName: 'شركة عمارة طيبة',
    establishmentDate: new Date().toISOString().split('T')[0], primaryCurrency: 'SAR'
  });

  const [settlementForm, setSettlementForm] = useState({ amount: '', currency: 'SAR', date: new Date().toISOString().split('T')[0], description: '' });
  const [loanForm, setLoanForm] = useState({ amount: '', currency: 'SAR', date: new Date().toISOString().split('T')[0], fromPartner: 'أنا', toPartner: 'يوسف', description: '', repaymentDate: '' });

  const loadData = async () => {
    setLoading(true);
    try {
      // جلب البيانات بشكل متوازي من الباك-أند
      const [youssefData, nazmiData] = await Promise.all([
        youssefService.getData(),
        nazmiService.getData()
      ]);

      // تعيين بيانات يوسف
      setSettlements(youssefData.settlements || []);
      setLoans(youssefData.loans || []);
      if (youssefData.settings) {
        setPortalSettings({
          ...youssefData.settings,
          establishmentDate: new Date(youssefData.settings.establishmentDate).toISOString().split('T')[0]
        });
      }

      // تعيين بيانات نظمي (الشركة الأم) لحساب النسب
      if(nazmiData) {
        const tx = nazmiData.transactions || [];
        setIncomes(tx.filter(t => t.type === 'إيراد'));
        setDistributions(tx.filter(t => t.type === 'توزيع'));
        setPartnershipSettings({
          capitalSAR: nazmiData.capital || 1000000,
          myPercentage: nazmiData.mySharePercent || 50,
          partnerPercentage: nazmiData.partnerShare || 50
        });
      }

    } catch (error) { console.error("Error loading data:", error); }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  // الحسابات والنسب (مبنية على البيانات الحقيقية من الباك-أند)
  const myNazmySharePercentage = partnershipSettings.myPercentage || 50;
  const toSAR = (amount, curr) => curr === 'USD' ? amount / 0.2667 : curr === 'EGP' ? amount / 12.8 : amount;

  const totalDistributedSAR = distributions.reduce((sum, d) => sum + toSAR(d.amount, d.currency), 0);
  const totalBankIncomeSAR = incomes.filter(i => i.category === 'بنك').reduce((sum, i) => sum + toSAR(i.amount, i.currency), 0);
  const totalCashIncomeSAR = incomes.filter(i => i.category === 'كاش').reduce((sum, i) => sum + toSAR(i.amount, i.currency), 0);

  const undistributedCashSAR = Math.max(0, totalCashIncomeSAR - totalDistributedSAR);
  const totalUndistributedSAR = totalBankIncomeSAR + undistributedCashSAR;

  const youssefShareOfMyShare = portalSettings.youssefSharePercentage;
  
  const myTotalDistributedSAR = totalDistributedSAR * (myNazmySharePercentage / 100);
  const myTotalUndistributedSAR = totalUndistributedSAR * (myNazmySharePercentage / 100);

  const youssefDistributedShareSAR = myTotalDistributedSAR * (youssefShareOfMyShare / 100);
  const youssefUndistributedShareSAR = myTotalUndistributedSAR * (youssefShareOfMyShare / 100);

  const totalReceivedByYoussefSAR = settlements.reduce((acc, curr) => acc + toSAR(curr.amount, curr.currency), 0);
  const remainingForYoussefSAR = youssefDistributedShareSAR - totalReceivedByYoussefSAR;

  // معالجات الإرسال (Submit Handlers) للباك-أند
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
    setSettlementForm({ amount: '', currency: 'SAR', date: new Date().toISOString().split('T')[0], description: '' });
    setSubmitting(false);
    loadData();
  };

  const handleAddLoan = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await youssefService.addLoan(loanForm);
    setActiveModal(null);
    setLoanForm({ amount: '', currency: 'SAR', date: new Date().toISOString().split('T')[0], fromPartner: 'أنا', toPartner: 'يوسف', description: '', repaymentDate: '' });
    setSubmitting(false);
    loadData();
  };

  const handleDeleteSettlement = async (id) => {
    if(window.confirm("حذف هذه التسوية؟")) {
      await youssefService.deleteSettlement(id);
      loadData();
    }
  };

  const handleDeleteLoan = async (id) => {
    if(window.confirm("حذف هذه السلفة؟")) {
      await youssefService.deleteLoan(id);
      loadData();
    }
  };

  if (loading) return <div className="p-10 text-center text-slate-500 font-bold animate-pulse">جاري تحميل بيانات الشراكة مع يوسف...</div>;

  return (
    <div className="flex-1 overflow-x-hidden overflow-y-auto p-3 md:p-6 pb-24 font-cairo bg-slate-50/50 min-h-screen" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        
        {/* Header - Mobile Responsive */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="p-3 md:p-4 bg-gradient-to-br from-teal-100 to-emerald-100 text-teal-700 rounded-xl md:rounded-2xl shadow-inner border border-teal-200/50 shrink-0">
              <Users size={24} className="md:w-8 md:h-8" />
            </div>
            <div>
              <h1 className="text-lg md:text-3xl font-black text-slate-900 tracking-tight">شراكتي مع يوسف</h1>
              <p className="text-slate-500 mt-1 text-[10px] md:text-sm font-bold">إدارة نصيب يوسف من حصتي في الشركة والتحكم في بوابته</p>
            </div>
          </div>
          <div className="flex flex-row items-center gap-2 md:gap-3 w-full md:w-auto">
            <button onClick={() => setActiveModal('settings')} className="flex-1 md:flex-none h-10 md:h-11 px-4 md:px-6 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-bold text-slate-700 shadow-sm transition-all text-xs md:text-sm">
              <Settings size={16} /> إعدادات البوابة
            </button>
            <button onClick={() => setActiveModal('settlement')} className="flex-1 md:flex-none h-10 md:h-11 px-4 md:px-6 flex items-center justify-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md transition-all text-xs md:text-sm">
              <Plus size={16} /> إضافة تسوية
            </button>
          </div>
        </div>

        {/* حصة يوسف في رأس المال */}
        <div className="border border-slate-200 shadow-lg rounded-2xl md:rounded-3xl overflow-hidden relative bg-white">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-400 to-blue-600"></div>
          <div className="p-4 md:p-6 border-b border-slate-100 bg-slate-50/80 pb-4 md:pb-5">
            <h3 className="tracking-tight text-lg md:text-xl font-black flex items-center gap-2 md:gap-3 text-slate-800">
              <div className="p-2 md:p-2.5 bg-blue-100 text-blue-600 rounded-lg md:rounded-xl shadow-inner shrink-0"><Users size={20} /></div>
              تفاصيل حصة يوسف في رأس المال
            </h3>
          </div>
          <div className="p-4 md:p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
            <div className="p-5 md:p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 shadow-sm">
              <p className="text-xs md:text-sm text-blue-800 font-bold mb-2">إجمالي رأس مال الشركة (SAR)</p>
              <div className="text-2xl md:text-3xl font-black text-blue-900">{partnershipSettings.capitalSAR.toLocaleString()}</div>
            </div>
            <div className="p-5 md:p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100 shadow-sm">
              <p className="text-xs md:text-sm text-emerald-800 font-bold mb-2">حصة يوسف من نصيبي</p>
              <div className="text-2xl md:text-3xl font-black text-emerald-900">{portalSettings.youssefSharePercentage}%</div>
            </div>
            <div className="p-5 md:p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100 shadow-sm">
              <p className="text-xs md:text-sm text-amber-800 font-bold mb-2">مساهمة يوسف الفعلية (SAR)</p>
              <div className="text-2xl md:text-3xl font-black text-amber-900">{(partnershipSettings.capitalSAR * (myNazmySharePercentage/100) * (portalSettings.youssefSharePercentage/100)).toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* البطاقات الأربع (الملخص المالي) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <InfoCard title="نسبة يوسف من حصتي" value={`${youssefShareOfMyShare}%`} sub="من حصة الشريك الأساسي" color="from-slate-400 to-slate-600" />
          <InfoCard title="نصيبه من الأرباح الموزعة" amount={youssefDistributedShareSAR} color="from-blue-400 to-blue-600" />
          <InfoCard title="نصيبه من غير الموزعة" amount={youssefUndistributedShareSAR} sub="موجودة في البنوك والكاش" color="from-indigo-400 to-indigo-600" />
          <div className={`border-0 shadow-md rounded-2xl overflow-hidden relative ${remainingForYoussefSAR > 0 ? "bg-amber-50" : "bg-emerald-50"}`}>
            <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${remainingForYoussefSAR > 0 ? 'from-amber-400 to-amber-600' : 'from-emerald-400 to-emerald-600'}`}></div>
            <div className={`p-4 border-b ${remainingForYoussefSAR > 0 ? 'bg-amber-100/50 border-amber-200/50 text-amber-800' : 'bg-emerald-100/50 border-emerald-200/50 text-emerald-800'}`}>
              <h3 className="text-[11px] md:text-xs font-black uppercase tracking-wider">المتبقي ليوسف (من الموزع)</h3>
            </div>
            <div className="p-5 md:p-6">
              <InlineCurrency amount={remainingForYoussefSAR} color={remainingForYoussefSAR > 0 ? 'text-amber-900' : 'text-emerald-900'} size="text-2xl md:text-3xl" />
            </div>
          </div>
        </div>

        {/* ملخص الحساب التفصيلي وسجل التسويات */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          
          <div className="border border-slate-200 shadow-lg bg-white rounded-2xl md:rounded-3xl overflow-hidden relative flex flex-col">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
            <div className="flex flex-col space-y-1.5 p-4 md:p-6 border-b border-slate-100 bg-slate-50/80 pb-4 pt-5">
              <h3 className="tracking-tight text-lg md:text-xl font-black flex items-center gap-2 md:gap-3 text-slate-800">
                <div className="p-2 md:p-2.5 bg-blue-100 text-blue-600 rounded-lg md:rounded-xl shadow-inner shrink-0"><Calculator size={20} /></div>
                ملخص الحساب التفصيلي
              </h3>
            </div>
            <div className="p-4 md:p-6 space-y-4">
              <ListItem title="إجمالي المستحق ليوسف (من الموزع):" amount={youssefDistributedShareSAR} dotColor="bg-blue-500" />
              <ListItem title="إجمالي ما تم تسديده (استلمه يوسف):" amount={totalReceivedByYoussefSAR} dotColor="bg-emerald-500" />
              <div className="pt-6 border-t border-slate-100">
                <div className={`flex justify-between items-center p-4 md:p-5 rounded-2xl border shadow-sm ${remainingForYoussefSAR > 0 ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
                  <span className={`font-black text-sm md:text-lg ${remainingForYoussefSAR > 0 ? 'text-amber-900' : 'text-slate-900'}`}>الرصيد المتبقي ليوسف:</span>
                  <InlineCurrency amount={remainingForYoussefSAR} color={remainingForYoussefSAR > 0 ? 'text-amber-700' : 'text-slate-700'} size="text-xl md:text-2xl" />
                </div>
              </div>
            </div>
          </div>

          <div className="border border-slate-200 shadow-lg bg-white rounded-2xl md:rounded-3xl overflow-hidden relative flex flex-col">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
            <div className="flex flex-col space-y-1.5 p-4 md:p-6 border-b border-slate-100 bg-slate-50/80 pb-4 pt-5">
              <h3 className="tracking-tight text-lg md:text-xl font-black flex items-center gap-2 md:gap-3 text-slate-800">
                <div className="p-2 md:p-2.5 bg-emerald-100 text-emerald-600 rounded-lg md:rounded-xl shadow-inner shrink-0"><History size={20} /></div>
                سجل التسويات (المدفوعات ليوسف)
              </h3>
            </div>
            <div className="p-0 flex-1 overflow-y-auto max-h-[400px] custom-scrollbar">
              {settlements.length === 0 ? (
                <div className="text-center py-10 text-slate-400 font-bold text-sm">لا توجد تسويات مسجلة حالياً</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {settlements.map(set => (
                    <div key={set.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 md:p-6 hover:bg-slate-50/80 transition-colors gap-4 group">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="p-2 md:p-3 bg-emerald-50 text-emerald-600 rounded-xl shadow-sm border border-emerald-100 shrink-0"><CheckCircle size={20} /></div>
                        <div>
                          <div className="font-black text-slate-900 text-sm md:text-base">{set.description}</div>
                          <div className="text-[10px] md:text-xs text-slate-500 mt-1 font-bold">
                            {new Date(set.date).toLocaleDateString('ar-EG')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                         <div className="text-right bg-slate-50 px-4 py-2 md:py-3 rounded-xl border border-slate-100">
                           <InlineCurrency amount={set.amount} color="text-slate-800" size="text-lg md:text-xl" />
                         </div>
                         <button onClick={() => handleDeleteSettlement(set.id)} className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={18}/></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* إدارة السلف */}
        <div className="border border-slate-200 shadow-lg bg-white rounded-2xl md:rounded-3xl overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-400 to-orange-500"></div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 md:p-6 border-b border-slate-100 bg-slate-50/80 gap-4">
            <h3 className="tracking-tight text-lg md:text-xl font-black flex items-center gap-2 md:gap-3 text-slate-800">
              <div className="p-2 md:p-2.5 bg-amber-100 text-amber-600 rounded-lg md:rounded-xl shadow-inner shrink-0"><Wallet size={20} /></div>
              إدارة السلف بيني وبين يوسف
            </h3>
            <button onClick={() => setActiveModal('loan')} className="h-10 md:h-11 px-4 md:px-6 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-md transition-all text-xs md:text-sm flex items-center justify-center gap-2 w-full sm:w-auto">
              <Plus size={16}/> إضافة سلفة
            </button>
          </div>
          <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
             {loans.length === 0 ? (
               <div className="col-span-full text-center py-10 text-slate-400 font-bold text-sm">لا توجد سلف مسجلة حالياً</div>
             ) : (
               loans.map(loan => (
                 <div key={loan.id} className="p-4 md:p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between gap-4 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-1.5 h-full bg-amber-500 group-hover:w-2 transition-all"></div>
                   <div className="flex justify-between items-start">
                     <div className="flex items-start gap-3">
                       <div className="p-2 bg-amber-50 text-amber-600 rounded-lg border border-amber-100"><History size={18} /></div>
                       <div>
                         <div className="font-black text-slate-800 text-sm md:text-base">{loan.description}</div>
                         <div className="text-[10px] md:text-xs font-bold text-slate-500 mt-1.5 flex items-center gap-2">
                           <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">من: {loan.fromPartner}</span>
                           <span>←</span>
                           <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">إلى: {loan.toPartner}</span>
                         </div>
                       </div>
                     </div>
                     <button onClick={() => handleDeleteLoan(loan.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button>
                   </div>
                   <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mt-2 pt-3 border-t border-slate-50">
                     <div className="space-y-1 text-[10px] md:text-xs font-bold text-slate-500">
                       <div>السداد: <span className="text-slate-700">{new Date(loan.repaymentDate).toLocaleDateString('ar-EG')}</span></div>
                     </div>
                     <div className="text-left bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                        <span className="font-black text-slate-900 text-base md:text-lg">{loan.amount.toLocaleString()} SAR</span>
                     </div>
                   </div>
                 </div>
               ))
             )}
          </div>
        </div>

      </div>

      {/* --- النوافذ المنبثقة (Modals) المتجاوبة --- */}
      
      {/* 1. Modal: إعدادات البوابة */}
      {activeModal === 'settings' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-2xl rounded-t-3xl sm:rounded-3xl shadow-2xl animate-in slide-in-from-bottom-10 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 md:p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h3 className="font-black text-slate-800 text-sm md:text-base flex items-center gap-2"><Settings size={18} className="text-slate-600"/> إعدادات بوابة يوسف</h3>
              <button onClick={() => setActiveModal(null)} className="p-1.5 hover:bg-slate-200 text-slate-500 rounded-xl transition-all"><X size={20} /></button>
            </div>
            <div className="p-4 md:p-6 overflow-y-auto custom-scrollbar flex-1">
              <form onSubmit={handleSaveSettings} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                  <InputCompact label="العملة الأساسية" value={portalSettings.primaryCurrency} onChange={v => setPortalSettings({...portalSettings, primaryCurrency: v})} />
                  <InputCompact label="نسبة يوسف من حصتي (%)" type="number" value={portalSettings.youssefSharePercentage} onChange={v => setPortalSettings({...portalSettings, youssefSharePercentage: Number(v)})} />
                  <div className="sm:col-span-2">
                     <InputCompact label="بريد يوسف الإلكتروني (للدخول للبوابة)" type="email" value={portalSettings.partnerEmail} onChange={v => setPortalSettings({...portalSettings, partnerEmail: v})} required={false} />
                  </div>
                </div>
                
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-black text-slate-400 uppercase mb-3">الصلاحيات والعرض في بوابة يوسف</h4>
                  <CustomSwitch label="عرض تفاصيل رأس المال" checked={portalSettings.showCapital} onChange={c => setPortalSettings({...portalSettings, showCapital: c})} icon={<Eye size={16} className="text-blue-500"/>} />
                  <CustomSwitch label="عرض الأرباح المستحقة" checked={portalSettings.showProfits} onChange={c => setPortalSettings({...portalSettings, showProfits: c})} icon={<TrendingUp size={16} className="text-emerald-500"/>} />
                  <CustomSwitch label="عرض نصيب البنك" checked={portalSettings.showBankShare} onChange={c => setPortalSettings({...portalSettings, showBankShare: c})} icon={<Landmark size={16} className="text-indigo-500"/>} />
                </div>

                <div className="flex flex-col-reverse sm:flex-row gap-2 pt-4 border-t border-slate-100 mt-6">
                  <button type="button" onClick={() => setActiveModal(null)} className="flex-1 py-3.5 rounded-xl font-black text-slate-600 bg-slate-100 hover:bg-slate-200 text-sm transition-colors">إلغاء</button>
                  <button type="submit" disabled={submitting} className="flex-[2] bg-slate-900 hover:bg-slate-800 text-white py-3.5 rounded-xl font-black shadow-md flex items-center justify-center gap-2 transition-all text-sm disabled:opacity-50"><Save size={18} /> حفظ الإعدادات</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal: إضافة تسوية */}
      {activeModal === 'settlement' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl animate-in slide-in-from-bottom-10 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 md:p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h3 className="font-black text-slate-800 text-sm md:text-base flex items-center gap-2"><Plus size={18} className="text-teal-600"/> إضافة تسوية (دفعة ليوسف)</h3>
              <button onClick={() => setActiveModal(null)} className="p-1.5 hover:bg-slate-200 text-slate-500 rounded-xl transition-all"><X size={20} /></button>
            </div>
            <div className="p-4 md:p-6 overflow-y-auto custom-scrollbar flex-1">
              <form onSubmit={handleAddSettlement} className="space-y-4 md:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputCompact label="المبلغ المسدد" type="number" value={settlementForm.amount} onChange={v => setSettlementForm({...settlementForm, amount: v})} />
                  <InputCompact label="العملة" value={settlementForm.currency} onChange={v => setSettlementForm({...settlementForm, currency: v})} />
                  <InputCompact label="التاريخ" type="date" value={settlementForm.date} onChange={v => setSettlementForm({...settlementForm, date: v})} />
                  <div className="sm:col-span-2">
                     <InputCompact label="البيان / الوصف" value={settlementForm.description} onChange={v => setSettlementForm({...settlementForm, description: v})} />
                  </div>
                </div>
                <div className="flex flex-col-reverse sm:flex-row gap-2 pt-4 border-t border-slate-100 mt-6">
                  <button type="button" onClick={() => setActiveModal(null)} className="flex-1 py-3.5 rounded-xl font-black text-slate-600 bg-slate-100 hover:bg-slate-200 text-sm transition-colors">إلغاء</button>
                  <button type="submit" disabled={submitting} className="flex-[2] bg-teal-600 hover:bg-teal-700 text-white py-3.5 rounded-xl font-black shadow-md flex items-center justify-center gap-2 transition-all text-sm disabled:opacity-50"><Save size={18} /> حفظ التسوية</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 3. Modal: إضافة سلفة */}
      {activeModal === 'loan' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-xl rounded-t-3xl sm:rounded-3xl shadow-2xl animate-in slide-in-from-bottom-10 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 md:p-5 border-b border-slate-100 flex justify-between items-center bg-amber-50 shrink-0">
              <h3 className="font-black text-slate-800 text-sm md:text-base flex items-center gap-2"><Plus size={18} className="text-amber-600"/> إضافة سلفة جديدة</h3>
              <button onClick={() => setActiveModal(null)} className="p-1.5 hover:bg-amber-100 text-slate-500 rounded-xl transition-all"><X size={20} /></button>
            </div>
            <div className="p-4 md:p-6 overflow-y-auto custom-scrollbar flex-1">
              <form onSubmit={handleAddLoan} className="space-y-4 md:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputCompact label="المبلغ" type="number" value={loanForm.amount} onChange={v => setLoanForm({...loanForm, amount: v})} />
                  <InputCompact label="العملة" value={loanForm.currency} onChange={v => setLoanForm({...loanForm, currency: v})} />
                  
                  <div className="space-y-1.5">
                    <label className="text-[11px] md:text-xs font-black text-slate-500 uppercase ml-1">من الشريك</label>
                    <select className="w-full h-11 md:h-12 bg-slate-50 border border-slate-200 rounded-xl px-3 md:px-4 text-xs md:text-sm font-bold outline-none" value={loanForm.fromPartner} onChange={e=>setLoanForm({...loanForm, fromPartner:e.target.value})}>
                      <option value="أنا">أنا</option><option value="يوسف">يوسف</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] md:text-xs font-black text-slate-500 uppercase ml-1">إلى الشريك</label>
                    <select className="w-full h-11 md:h-12 bg-slate-50 border border-slate-200 rounded-xl px-3 md:px-4 text-xs md:text-sm font-bold outline-none" value={loanForm.toPartner} onChange={e=>setLoanForm({...loanForm, toPartner:e.target.value})}>
                      <option value="يوسف">يوسف</option><option value="أنا">أنا</option>
                    </select>
                  </div>

                  <InputCompact label="تاريخ الاستحقاق (السداد)" type="date" value={loanForm.repaymentDate} onChange={v => setLoanForm({...loanForm, repaymentDate: v})} />
                  <div className="sm:col-span-2">
                     <InputCompact label="الوصف / سبب السلفة" value={loanForm.description} onChange={v => setLoanForm({...loanForm, description: v})} />
                  </div>
                </div>
                <div className="flex flex-col-reverse sm:flex-row gap-2 pt-4 border-t border-slate-100 mt-6">
                  <button type="button" onClick={() => setActiveModal(null)} className="flex-1 py-3.5 rounded-xl font-black text-slate-600 bg-slate-100 hover:bg-slate-200 text-sm transition-colors">إلغاء</button>
                  <button type="submit" disabled={submitting} className="flex-[2] bg-amber-600 hover:bg-amber-700 text-white py-3.5 rounded-xl font-black shadow-md flex items-center justify-center gap-2 transition-all text-sm disabled:opacity-50"><Save size={18} /> حفظ السلفة</button>
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

function InfoCard({ title, value, amount, sub, color }) {
  return (
    <div className="border border-slate-200 shadow-md hover:shadow-lg transition-shadow rounded-2xl md:rounded-3xl overflow-hidden relative bg-white flex flex-col h-full group">
      <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${color}`}></div>
      <div className="p-4 md:p-5 border-b border-slate-50/50 bg-slate-50/30">
        <h3 className="text-[11px] md:text-xs font-black uppercase tracking-wider text-slate-600">{title}</h3>
      </div>
      <div className="p-5 md:p-6 flex-1 flex flex-col justify-center">
        {value ? (
           <div className="text-3xl md:text-4xl font-black text-slate-900 group-hover:scale-105 transition-transform origin-right">{value}</div>
        ) : (
           <InlineCurrency amount={amount || 0} color="text-slate-900" size="text-2xl md:text-3xl" />
        )}
        {sub && <p className="text-[10px] md:text-xs text-slate-400 mt-2 font-bold">{sub}</p>}
      </div>
    </div>
  );
}

function ListItem({ title, amount, dotColor }) {
  return (
    <div className="flex justify-between items-center p-4 bg-white rounded-xl md:rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <span className="font-bold text-slate-700 flex items-center gap-2 text-xs md:text-sm">
        <div className={`w-2 h-2 rounded-full ${dotColor}`}></div>
        {title}
      </span>
      <InlineCurrency amount={amount} color="text-slate-800" size="text-lg md:text-xl" />
    </div>
  );
}

function CustomSwitch({ label, checked, onChange, icon }) {
  return (
    <div className="flex items-center justify-between p-3.5 md:p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer" onClick={() => onChange(!checked)}>
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-xs md:text-sm font-bold text-slate-700">{label}</span>
      </div>
      <div className={`w-11 h-6 rounded-full flex items-center px-1 transition-colors ${checked ? 'bg-teal-500' : 'bg-slate-300'}`}>
         <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${checked ? '-translate-x-5' : 'translate-x-0'}`}></div>
      </div>
    </div>
  );
}

function InputCompact({ label, value, onChange, type = "text", required=true }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] md:text-xs font-black text-slate-500 uppercase ml-1">{label}</label>
      <input type={type} className="w-full h-11 md:h-12 bg-slate-50 border border-slate-200 rounded-xl px-3 md:px-4 text-xs md:text-sm font-bold focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={value} onChange={(e) => onChange(e.target.value)} required={required} />
    </div>
  );
}

function InlineCurrency({ amount, color, size }) {
  return (
    <div className="flex flex-col items-end gap-1 font-cairo">
      <span className={`font-black ${size} ${color} drop-shadow-sm group-hover:scale-105 transition-transform origin-right`}>{amount.toLocaleString()} SAR</span>
      <div className="flex gap-2 text-[8px] md:text-[10px] font-bold">
        <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-100">${(amount*0.2667).toLocaleString(undefined,{maximumFractionDigits:0})}</span>
        <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-100">EGP {(amount*12.8).toLocaleString(undefined,{maximumFractionDigits:0})}</span>
      </div>
    </div>
  );
}