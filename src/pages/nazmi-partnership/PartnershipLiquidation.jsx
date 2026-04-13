import React from 'react';
import { Calculator, Landmark, Banknote, Receipt, TrendingUp, UserCheck, Wallet, Info } from 'lucide-react';

export default function PartnershipLiquidation({ settings, transactions }) {
  
  // الحسابات باستخدام البيانات الحقيقية
  const totalBankIncome = transactions.filter(t => t.type === 'إيراد' && t.category === 'بنك').reduce((s, t) => s + t.amount, 0);
  const totalCashIncome = transactions.filter(t => t.type === 'إيراد' && t.category === 'كاش').reduce((s, t) => s + t.amount, 0);
  const totalDistributed = transactions.filter(t => t.type === 'توزيع').reduce((s, t) => s + t.amount, 0);
  
  const undistributedCash = Math.max(0, totalCashIncome - totalDistributed);
  const totalUndistributed = totalBankIncome + undistributedCash;
  const estimatedTaxes = totalBankIncome * 0.15;
  const netUndistributed = Math.max(0, totalUndistributed - estimatedTaxes);

  const myExpectedShare = netUndistributed * (settings.myPercentage / 100);
  const partnerExpectedShare = netUndistributed * (settings.partnerPercentage / 100);
  const totalCapital = settings.capitalSAR + settings.cashReserveSAR;

  return (
    <div className="space-y-3 sm:space-y-4 animate-in fade-in duration-300 px-1">
      
      {/* ✅ Top Cards - Compact Mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
        <TopCard 
          title="رأس المال + الاحتياطي" 
          amount={totalCapital} 
          color="from-blue-600 to-blue-800" 
          icon={<Wallet size={16}/>} 
          sub={`${settings.capitalSAR.toLocaleString()} + ${settings.cashReserveSAR.toLocaleString()}`} 
        />
        <TopCard 
          title="صافي الأرباح" 
          amount={netUndistributed} 
          color="from-emerald-500 to-emerald-700" 
          icon={<TrendingUp size={16}/>} 
          sub="بعد خصم الضرائب" 
        />
        <TopCard 
          title="ضرائب (15%)" 
          amount={estimatedTaxes} 
          color="from-rose-500 to-rose-700" 
          icon={<Receipt size={16}/>} 
          sub="من رصيد البنك فقط" 
        />
      </div>

      {/* ✅ Details Sections - Stacked Mobile */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4">
        
        {/* ملخص الأرباح */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl sm:rounded-2xl overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
          <div className="bg-slate-50 border-b border-slate-100 p-3 sm:p-4">
            <h3 className="text-sm sm:text-base font-black text-slate-800 flex items-center gap-2">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg sm:rounded-xl"><Calculator size={16}/></div> 
              ملخص الأرباح
            </h3>
          </div>
          <div className="p-3 sm:p-4 space-y-3">
             <ListItem icon={<Landmark size={16}/>} title="رصيد البنك" amount={totalBankIncome} color="text-blue-600" bg="bg-blue-50" />
             <ListItem icon={<Banknote size={16}/>} title="كاش متبقي" amount={undistributedCash} color="text-emerald-600" bg="bg-emerald-50" />
             
             {/* Total Undistributed */}
             <div className="flex justify-between items-center p-3 sm:p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-black text-slate-900 text-sm sm:text-base">الإجمالي</span>
                <InlineCurrency amount={totalUndistributed} color="text-slate-900" size="text-base sm:text-lg" />
             </div>
             
             {/* Taxes */}
             <div className="flex justify-between items-center p-3 sm:p-4 bg-rose-50 rounded-xl border border-rose-100 text-rose-700">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-rose-100 rounded-lg"><Receipt size={14}/></div>
                  <span className="font-bold text-[11px] sm:text-sm">ضرائب (15%)</span>
                </div>
                <InlineCurrency amount={estimatedTaxes} color="text-rose-800" size="text-base sm:text-lg" />
             </div>
             
             {/* Net for Liquidation - Highlighted */}
             <div className="p-3 sm:p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
                <div className="flex justify-between items-center">
                   <div className="flex items-center gap-2">
                      <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><TrendingUp size={16}/></div>
                      <span className="font-black text-sm sm:text-base text-emerald-900">صافي التصفية</span>
                   </div>
                   <InlineCurrency amount={netUndistributed} color="text-emerald-900" size="text-lg sm:text-xl" />
                </div>
                <p className="text-[10px] text-slate-500 mt-2 flex items-center gap-1">
                  <Info size={10}/> المبلغ المتاح للتوزيع النهائي
                </p>
             </div>
          </div>
        </div>

        {/* توقع التصفية لكل شريك - Compact Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          
          {/* My Share */}
          <ShareCard 
            title="نصيبي" 
            percentage={settings.myPercentage} 
            amount={myExpectedShare} 
            color="emerald"
            partnerName={null}
          />
          
          {/* Partner Share */}
          <ShareCard 
            title={`نصيب ${settings.partnerName}`} 
            percentage={settings.partnerPercentage} 
            amount={partnerExpectedShare} 
            color="purple"
            partnerName={settings.partnerName}
          />
          
        </div>
      </div>
    </div>
  );
}

// ✅ Compact Top Card
function TopCard({ title, amount, color, icon, sub }) {
  return (
    <div className={`bg-gradient-to-br ${color} text-white p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-sm relative overflow-hidden active:scale-[0.98] transition-transform`}>
      <div className="absolute -right-2 -top-2 w-16 h-16 bg-white opacity-10 rounded-full blur-xl"></div>
      <div className="relative z-10 space-y-1.5">
         <h3 className="text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 opacity-90">{icon} {title}</h3>
         <p className="text-lg sm:text-xl font-black drop-shadow-sm">
           {amount.toLocaleString()} <span className="text-[10px] font-normal opacity-75">SAR</span>
         </p>
         <p className="text-[9px] opacity-90 bg-white/10 px-2 py-1 rounded inline-block">{sub}</p>
      </div>
    </div>
  );
}

// ✅ Compact List Item
function ListItem({ icon, title, amount, color, bg }) {
  return (
    <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-slate-100">
      <div className="flex items-center gap-2.5">
        <div className={`p-2 ${bg} ${color} rounded-lg`}>{icon}</div>
        <span className="font-bold text-slate-700 text-[11px] sm:text-sm">{title}</span>
      </div>
      <InlineCurrency amount={amount} color="text-slate-800" size="text-base" compact />
    </div>
  );
}

// ✅ Share Card - Mobile Optimized
function ShareCard({ title, percentage, amount, color, partnerName }) {
  const colorClasses = {
    emerald: {
      bg: 'from-emerald-50 to-teal-50',
      border: 'border-emerald-200',
      text: 'text-emerald-700',
      badge: 'bg-emerald-100 text-emerald-700',
      icon: 'bg-emerald-100 text-emerald-600'
    },
    purple: {
      bg: 'from-purple-50 to-pink-50',
      border: 'border-purple-200',
      text: 'text-purple-700',
      badge: 'bg-purple-100 text-purple-700',
      icon: 'bg-purple-100 text-purple-600'
    }
  };
  
  const styles = colorClasses[color];

  return (
    <div className={`bg-gradient-to-br ${styles.bg} p-3 sm:p-4 rounded-xl sm:rounded-2xl border ${styles.border} shadow-sm relative overflow-hidden`}>
      <div className="absolute top-0 right-0 w-1 h-full bg-current opacity-20"></div>
      
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-black text-slate-900 text-sm sm:text-base">{title}</h4>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${styles.badge}`}>
          {percentage}%
        </span>
      </div>
      
      {/* Amount */}
      <div className="flex justify-between items-end">
        <span className={`font-bold text-[11px] sm:text-sm ${styles.text}`}>المتوقع:</span>
        <span className={`font-black ${color === 'emerald' ? 'text-emerald-900' : 'text-purple-900'} text-lg sm:text-xl`}>
          {amount.toLocaleString()} <span className="text-[10px] font-normal opacity-70">SAR</span>
        </span>
      </div>
      
      {/* Visual Progress Bar */}
      <div className="mt-3 pt-3 border-t border-slate-200/60">
        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${color === 'emerald' ? 'bg-emerald-500' : 'bg-purple-500'} rounded-full transition-all duration-500`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <p className="text-[9px] text-slate-500 mt-1.5 text-center">
          من صافي الأرباح للتصفية
        </p>
      </div>
    </div>
  );
}

// ✅ Compact Currency Display
function InlineCurrency({ amount, color, size, compact = false }) {
  return (
    <div className={`flex flex-col items-end font-cairo ${compact ? 'gap-0' : 'gap-0.5'}`}>
      <span className={`font-black ${size} ${color}`}>
        {amount.toLocaleString()} <span className="text-[9px] font-normal opacity-70">SAR</span>
      </span>
      {!compact && (
        <div className="flex gap-1 text-[8px] font-bold opacity-70">
          <span className="bg-blue-50 text-blue-700 px-1 py-0.5 rounded border border-blue-100">
            ${(amount * 0.2667).toLocaleString(undefined, {maximumFractionDigits: 0})}
          </span>
        </div>
      )}
    </div>
  );
}