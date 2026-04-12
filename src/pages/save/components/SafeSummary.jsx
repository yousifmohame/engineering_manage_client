import React from "react";
import { Wallet, ArrowDownLeft, ArrowUpRight } from "lucide-react";

export default function SafeSummary({ summary }) {
  const cards = [
    {
      title: "الرصيد الكلي",
      value: summary.totalBalance,
      icon: <Wallet size={20} />,
      bgColor: "bg-slate-900",
      textColor: "text-white",
      subColor: "text-emerald-400",
    },
    {
      title: "إجمالي الإيداعات",
      value: summary.totalDeposits,
      icon: <ArrowDownLeft size={20} className="text-emerald-500" />,
      bgColor: "bg-white",
      textColor: "text-slate-900",
      border: "border-b-4 border-emerald-500",
    },
    {
      title: "إجمالي السحوبات",
      value: summary.totalWithdrawals,
      icon: <ArrowUpRight size={20} className="text-red-500" />,
      bgColor: "bg-white",
      textColor: "text-slate-900",
      border: "border-b-4 border-red-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {cards.map((card, idx) => (
        <div key={idx} className={`${card.bgColor} ${card.textColor} ${card.border || 'border border-slate-100'} p-4 rounded-2xl shadow-sm flex items-center justify-between`}>
          <div>
            <p className="font-bold opacity-70 text-xs mb-1">{card.title}</p>
            <h2 className="text-xl md:text-2xl font-black">
              {card.value?.toLocaleString()} <span className={`text-[10px] font-normal ${card.subColor || "text-slate-400"}`}>SAR</span>
            </h2>
          </div>
          <div className={`p-2 rounded-xl ${idx === 0 ? "bg-white/10" : "bg-slate-50"}`}>
            {card.icon}
          </div>
        </div>
      ))}
    </div>
  );
}