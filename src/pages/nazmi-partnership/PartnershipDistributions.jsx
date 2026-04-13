import React, { useState } from "react";
import {
  PieChart,
  Wallet,
  History,
  Plus,
  X,
  Save,
  Pen,
  Trash2,
  ChevronDown,
} from "lucide-react";
import { nazmiService } from "../../services/nazmiService";

export default function PartnershipDistributions({
  settings,
  transactions,
  reload,
}) {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [sortOrder, setSortOrder] = useState("desc"); // للفرز على الموبايل

  // الفورم الأساسي للتوزيع
  const initialForm = {
    date: new Date().toISOString().split("T")[0],
    category: "أرباح",
    amount: "",
    currency: "SAR",
    description: "",
  };
  const [form, setForm] = useState(initialForm);

  const dists = transactions
    .filter((t) => t.type === "توزيع")
    .sort((a, b) =>
      sortOrder === "desc"
        ? new Date(b.date) - new Date(a.date)
        : new Date(a.date) - new Date(b.date),
    );

  const totalDistributed = dists.reduce((s, i) => s + i.amount, 0);
  const myTotalShare = totalDistributed * (settings.myPercentage / 100);

  const openModal = (itemToEdit = null) => {
    if (itemToEdit) {
      setForm({
        ...itemToEdit,
        date: new Date(itemToEdit.date).toISOString().split("T")[0],
      });
      setEditingId(itemToEdit.id);
    } else {
      setForm(initialForm);
      setEditingId(null);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm(initialForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await nazmiService.updateTransaction(editingId, {
          ...form,
          type: "توزيع",
          partnershipId: settings.id,
        });
      } else {
        await nazmiService.addTransaction({
          ...form,
          type: "توزيع",
          partnershipId: settings.id,
        });
      }
      closeModal();
      reload();
    } catch (error) {
      alert("حدث خطأ أثناء الحفظ");
    }
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm("حذف سجل التوزيع نهائياً؟")) {
      await nazmiService.deleteTransaction(id);
      reload();
    }
  };

  const calcShare = (amount, percentage) => amount * (percentage / 100);

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in duration-300 px-1">
      {/* ✅ Summary Cards - Mobile Stacked */}
      <div className="grid grid-cols-1 gap-3">
        <SummaryCard
          title="إجمالي التوزيعات السابقة"
          amount={totalDistributed}
          color="from-blue-600 to-blue-800"
          icon={<PieChart size={18} />}
        />
        <SummaryCard
          title={`إجمالي نصيبي المستلم (${settings.myPercentage}%)`}
          amount={myTotalShare}
          color="from-emerald-500 to-emerald-700"
          icon={<Wallet size={18} />}
        />
      </div>

      {/* ✅ Header & Action Button */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-black text-slate-800 flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl">
              <History size={20} />
            </div>
            سجل التوزيعات
          </h3>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* 📱 Mobile: Sort Dropdown */}
            <div className="relative sm:hidden">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full h-12 px-4 pr-10 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="desc">الأحدث أولاً</option>
                <option value="asc">الأقدم أولاً</option>
              </select>
              <ChevronDown
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>

            {/* 💻 Desktop: Sort Buttons */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => setSortOrder("desc")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  sortOrder === "desc"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                الأحدث
              </button>
              <button
                onClick={() => setSortOrder("asc")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  sortOrder === "asc"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                الأقدم
              </button>
            </div>

            {/* Add Button - Full Width Mobile */}
            <button
              onClick={() => openModal()}
              className="flex-1 sm:flex-none h-12 px-6 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-md font-bold text-sm transition-all min-h-[44px] min-w-[44px]"
            >
              <Plus size={18} /> تسجيل توزيع جديد
            </button>
          </div>
        </div>
      </div>

      {/* ✅ Table - Mobile Card View + Desktop Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* 📱 Mobile: Card View */}
        <div className="md:hidden divide-y divide-slate-100">
          {dists.length === 0 ? (
            <div className="text-center py-12 text-slate-400 font-bold text-sm">
              لا توجد توزيعات مسجلة
            </div>
          ) : (
            dists.map((d) => (
              <DistributionCard
                key={d.id}
                item={d}
                settings={settings}
                calcShare={calcShare}
                onEdit={() => openModal(d)}
                onDelete={() => handleDelete(d.id)}
              />
            ))
          )}
        </div>

        {/* 💻 Desktop: Table View */}
        <div className="hidden md:block overflow-x-auto custom-scrollbar">
          <table className="w-full text-right">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-100 text-xs uppercase">
              <tr>
                <th className="px-6 py-4 font-bold">التاريخ</th>
                <th className="px-6 py-4 font-bold">الوصف</th>
                <th className="px-6 py-4 font-bold">إجمالي الموزع</th>
                <th className="px-6 py-4 font-bold text-emerald-600">
                  نصيبي ({settings.myPercentage}%)
                </th>
                <th className="px-6 py-4 font-bold text-purple-600">
                  نصيب {settings.partnerName}
                </th>
                <th className="px-6 py-4 font-bold text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {dists.map((d) => (
                <tr
                  key={d.id}
                  className="hover:bg-emerald-50/40 transition-colors group"
                >
                  <td className="px-6 py-4 font-medium text-slate-500">
                    {new Date(d.date).toLocaleDateString("ar-EG")}
                  </td>
                  <td className="px-6 py-4 font-black text-slate-800 max-w-[200px] truncate">
                    {d.description}
                  </td>
                  <td className="px-6 py-4">
                    <CurrencyDisplay
                      amount={d.amount}
                      color="text-slate-800"
                      compact
                    />
                  </td>
                  <td className="px-6 py-4">
                    <CurrencyDisplay
                      amount={calcShare(d.amount, settings.myPercentage)}
                      color="text-emerald-700"
                      compact
                    />
                  </td>
                  <td className="px-6 py-4">
                    <CurrencyDisplay
                      amount={calcShare(d.amount, settings.partnerPercentage)}
                      color="text-purple-700"
                      compact
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openModal(d)}
                        className="px-3 py-1.5 rounded-lg hover:bg-emerald-100 text-emerald-600 font-bold text-xs flex items-center gap-1 transition-all min-h-[36px]"
                      >
                        <Pen size={14} /> تعديل
                      </button>
                      <button
                        onClick={() => handleDelete(d.id)}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                        aria-label="حذف"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {dists.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center py-10 text-slate-400 font-bold"
                  >
                    لا توجد توزيعات مسجلة
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ✅ Modal - Bottom Sheet Mobile / Centered Desktop */}
      {showModal && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="bg-white w-full max-w-2xl rounded-t-3xl sm:rounded-3xl shadow-2xl animate-in slide-in-from-bottom-10 overflow-hidden flex flex-col max-h-[95vh]">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0 sticky top-0 z-10">
              <h3 className="font-black text-slate-800 text-base flex items-center gap-2 text-emerald-700">
                <Plus size={18} />{" "}
                {editingId ? "تعديل التوزيع" : "تسجيل توزيع جديد"}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-slate-200 text-slate-500 rounded-xl transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="إغلاق"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 overflow-y-auto custom-scrollbar flex-1">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Amount & Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputCompact
                    label="تاريخ التوزيع"
                    type="date"
                    value={form.date}
                    onChange={(v) => setForm({ ...form, date: v })}
                  />
                  <InputCompact
                    label="إجمالي المبلغ (SAR)"
                    type="number"
                    inputMode="numeric"
                    value={form.amount}
                    onChange={(v) => setForm({ ...form, amount: v })}
                    placeholder="أدخل المبلغ الإجمالي"
                  />
                </div>

                {/* Live Share Calculation - Visual Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <ShareCard
                    label={`نصيبي (${settings.myPercentage}%)`}
                    amount={calcShare(
                      Number(form.amount || 0),
                      settings.myPercentage,
                    )}
                    color="emerald"
                  />
                  <ShareCard
                    label={`نصيب ${settings.partnerName} (${settings.partnerPercentage}%)`}
                    amount={calcShare(
                      Number(form.amount || 0),
                      settings.partnerPercentage,
                    )}
                    color="purple"
                  />
                </div>

                {/* Description */}
                <div>
                  <InputCompact
                    label="ملاحظات / شهر التوزيع"
                    value={form.description}
                    onChange={(v) => setForm({ ...form, description: v })}
                    placeholder="مثال: أرباح الربع الأول 2024"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 h-12 rounded-xl font-black text-slate-600 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-sm transition-colors min-h-[44px]"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-[2] bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white h-12 rounded-xl font-black shadow-md flex items-center justify-center gap-2 transition-all text-sm disabled:opacity-50 min-h-[44px]"
                  >
                    <Save size={18} />{" "}
                    {submitting ? "جاري الحفظ..." : "حفظ التوزيع"}
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

// ✅ Mobile Card Component for Distribution Items
function DistributionCard({ item, settings, calcShare, onEdit, onDelete }) {
  return (
    <div className="p-4 space-y-3">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-bold text-slate-500">
            {new Date(item.date).toLocaleDateString("ar-EG", {
              weekday: "short",
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
          <p className="font-black text-slate-800 text-base mt-0.5 line-clamp-2">
            {item.description}
          </p>
        </div>
        <div className="flex gap-1">
          <button
            onClick={onEdit}
            className="p-2 rounded-lg hover:bg-emerald-100 text-emerald-600 transition-all min-w-[40px] min-h-[40px] flex items-center justify-center"
            aria-label="تعديل"
          >
            <Pen size={16} />
          </button>
          <button
            onClick={onDelete}
            className="p-2 rounded-lg hover:bg-red-100 text-red-500 transition-all min-w-[40px] min-h-[40px] flex items-center justify-center"
            aria-label="حذف"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Amounts Grid */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
        <div className="text-center p-2 bg-slate-50 rounded-xl">
          <p className="text-[10px] font-bold text-slate-500 uppercase">
            الإجمالي
          </p>
          <p className="font-black text-slate-800 text-sm">
            {item.amount.toLocaleString()}
          </p>
        </div>
        <div className="text-center p-2 bg-emerald-50 rounded-xl border border-emerald-100">
          <p className="text-[10px] font-bold text-emerald-600 uppercase">
            نصيبي
          </p>
          <p className="font-black text-emerald-700 text-sm">
            {calcShare(item.amount, settings.myPercentage).toLocaleString()}
          </p>
        </div>
        <div className="text-center p-2 bg-purple-50 rounded-xl border border-purple-100">
          <p className="text-[10px] font-bold text-purple-600 uppercase">
            نصيب الشريك
          </p>
          <p className="font-black text-purple-700 text-sm">
            {calcShare(
              item.amount,
              settings.partnerPercentage,
            ).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}

// ✅ Summary Card - Touch Optimized
function SummaryCard({ title, amount, color, icon }) {
  return (
    <div
      className={`bg-gradient-to-br ${color} text-white p-4 rounded-2xl shadow-lg relative overflow-hidden active:scale-[0.98] transition-transform`}
    >
      <div className="absolute -right-4 -top-4 w-20 h-20 bg-white opacity-10 rounded-full blur-xl"></div>
      <div className="relative z-10 space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 opacity-90">
          {icon} {title}
        </h3>
        <p className="text-2xl font-black drop-shadow-sm">
          {amount.toLocaleString()}{" "}
          <span className="text-sm font-normal opacity-75">SAR</span>
        </p>
      </div>
    </div>
  );
}

// ✅ Input Component - Mobile Friendly
function InputCompact({
  label,
  value,
  onChange,
  type = "text",
  inputMode,
  required = true,
  placeholder,
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-black text-slate-500 uppercase tracking-wide">
        {label}
      </label>
      <input
        type={type}
        inputMode={inputMode}
        className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-base font-bold outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all placeholder:text-slate-400"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
      />
    </div>
  );
}

// ✅ Share Preview Card - Visual Calculation
function ShareCard({ label, amount, color }) {
  const colorClasses = {
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
    purple: "bg-purple-50 border-purple-200 text-purple-700",
  };

  return (
    <div
      className={`h-16 flex items-center justify-between px-4 rounded-xl border ${colorClasses[color]} font-cairo`}
    >
      <span className="text-xs font-bold uppercase">{label}</span>
      <span className="text-lg font-black">
        {amount.toLocaleString()}{" "}
        <span className="text-xs font-normal">SAR</span>
      </span>
    </div>
  );
}

// ✅ Currency Display - Compact for Tables
function CurrencyDisplay({
  amount,
  color = "text-slate-900",
  compact = false,
}) {
  return (
    <div
      className={`flex flex-col items-end font-cairo ${compact ? "gap-0" : "gap-0.5"}`}
    >
      <span
        className={`font-black ${compact ? "text-base" : "text-lg"} ${color}`}
      >
        {amount.toLocaleString()}{" "}
        <span className="text-xs font-normal opacity-70">SAR</span>
      </span>
      {!compact && (
        <div className="flex gap-1 text-[10px] font-bold opacity-70">
          <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-100">
            $
            {(amount * 0.2667).toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })}
          </span>
        </div>
      )}
    </div>
  );
}
