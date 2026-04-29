import React, { useState, useEffect } from "react";
import { goldService } from "../../services/goldService";
import { Coins, Plus, RefreshCw, Trash2, Edit } from "lucide-react";

export default function GoldPage() {
  // 🌟 تحديث: التهيئة الافتراضية أصبحت investments بدلاً من gold
  const [data, setData] = useState({ investments: [], summary: {} });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await goldService.getGold();
      // ضمان وجود مصفوفة investments لتجنب الانهيار
      setData({
        investments: response.investments || [],
        summary: response.summary || {},
      });
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (form) => {
    editingItem
      ? await goldService.updateGold(editingItem.id, form)
      : await goldService.addGold(form);
    setShowForm(false);
    setEditingItem(null);
    loadData();
  };

  const handleDelete = async (id) => {
    if (window.confirm("حذف هذا السجل؟")) {
      await goldService.deleteGold(id);
      loadData();
    }
  };

  // 🌟 حساب متوسط السعر يدوياً
  const totalWeight = data.summary.totalWeight || 0;
  const totalCost = data.summary.totalCost || 0;
  const avgPrice = totalWeight > 0 ? (totalCost / totalWeight).toFixed(2) : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-3 font-cairo" dir="rtl">
      {/* رأس الصفحة */}
      <div className="flex items-center justify-between bg-white p-2.5 rounded-xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-2">
          <div className="bg-amber-500 p-1.5 rounded-lg shadow-sm">
            <Coins className="text-white" size={18} />
          </div>
          <h1 className="text-lg font-black text-slate-900">الذهب والمصوغات</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadData}
            className="p-1.5 border rounded-lg hover:bg-slate-50"
          >
            <RefreshCw size={14} />
          </button>
          <button
            onClick={() => {
              setEditingItem(null);
              setShowForm(!showForm);
            }}
            className="bg-amber-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"
          >
            <Plus size={14} /> تسجيل ذهب
          </button>
        </div>
      </div>

      {/* ملخص الإحصائيات */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-slate-900 text-white p-3 rounded-xl border-b-4 border-b-amber-500">
          <p className="text-[10px] text-slate-400 font-bold">إجمالي الوزن</p>
          <p className="text-lg font-black">
            {totalWeight.toLocaleString()}{" "}
            <span className="text-[9px] font-normal">جرام</span>
          </p>
        </div>
        <div className="bg-white border border-slate-100 p-3 rounded-xl">
          <p className="text-[10px] text-slate-500 font-bold">
            إجمالي الاستثمار
          </p>
          <p className="text-lg font-black text-slate-800">
            {totalCost.toLocaleString()}{" "}
            <span className="text-[9px] font-normal">SAR</span>
          </p>
        </div>
        <div className="bg-white border border-slate-100 p-3 rounded-xl">
          <p className="text-[10px] text-slate-500 font-bold">
            متوسط سعر الجرام
          </p>
          <p className="text-lg font-black text-slate-800">
            {avgPrice} <span className="text-[9px] font-normal">SAR/g</span>
          </p>
        </div>
      </div>

      {/* نموذج الإضافة/التعديل */}
      {showForm && (
        <GoldForm
          initialData={editingItem}
          onSubmit={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
        />
      )}

      {/* جدول البيانات */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto max-h-[60vh] custom-scrollbar">
          <table className="w-full text-right relative">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr className="text-[10px] text-slate-400 font-black uppercase border-b">
                <th className="p-3">التاريخ</th>
                <th className="p-3">النوع</th>
                <th className="p-3">العيار</th>
                <th className="p-3">الوزن</th>
                <th className="p-3">إجمالي الشراء</th>
                <th className="p-3 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y text-xs">
              {/* 🌟 تحديث: استخدام data.investments واستخدام itemType */}
              {data.investments.map((item) => (
                <tr key={item.id} className="hover:bg-amber-50/30">
                  <td className="p-3 text-slate-500 font-medium">
                    {new Date(item.date).toLocaleDateString("ar-EG")}
                  </td>
                  <td className="p-3 font-bold text-slate-800">
                    {item.itemType}
                  </td>
                  <td className="p-3">
                    <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md font-black">
                      عيار {item.karat}
                    </span>
                  </td>
                  <td className="p-3 font-black text-slate-800">
                    {item.weight} ج
                  </td>
                  <td className="p-3 font-black text-amber-600">
                    {item.buyPrice.toLocaleString()} SAR
                  </td>
                  <td className="p-3 flex items-center justify-center gap-2">
                    <button
                      onClick={() => {
                        setEditingItem(item);
                        setShowForm(true);
                      }}
                      className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// مكون الفورم
function GoldForm({ initialData, onSubmit, onCancel }) {
  const [form, setForm] = useState(
    initialData
      ? {
          ...initialData,
          date: new Date(initialData.date).toISOString().split("T")[0],
        }
      : {
          itemType: "سبيكة",
          karat: 24,
          weight: "",
          buyPrice: "",
          date: new Date().toISOString().split("T")[0],
        },
  );

  const inputClass =
    "w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:bg-white focus:border-amber-400";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
      className="bg-white border border-amber-200 p-3 rounded-xl shadow-sm grid grid-cols-2 lg:grid-cols-6 gap-2 animate-in fade-in"
    >
      {/* 🌟 تحديث: استخدام itemType بدلاً من type لأن الخادم يتوقع ذلك */}
      <select
        className={inputClass}
        value={form.itemType}
        onChange={(e) => setForm({ ...form, itemType: e.target.value })}
      >
        <option>سبيكة</option>
        <option>جنيه ذهب</option>
        <option>مشغولات</option>
        <option>أونصة</option>
      </select>
      <select
        className={inputClass}
        value={form.karat}
        onChange={(e) => setForm({ ...form, karat: parseInt(e.target.value) })}
      >
        <option value={24}>عيار 24</option>
        <option value={21}>عيار 21</option>
        <option value={18}>عيار 18</option>
      </select>
      <input
        type="number"
        step="0.01"
        placeholder="الوزن بالجرام"
        value={form.weight}
        className={inputClass}
        onChange={(e) => setForm({ ...form, weight: e.target.value })}
        required
      />
      <input
        type="number"
        placeholder="إجمالي مبلغ الشراء"
        value={form.buyPrice}
        className={inputClass}
        onChange={(e) => setForm({ ...form, buyPrice: e.target.value })}
        required
      />
      <input
        type="date"
        className={inputClass}
        value={form.date}
        onChange={(e) => setForm({ ...form, date: e.target.value })}
        required
      />

      <div className="flex gap-1">
        <button
          type="submit"
          className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-xs py-1.5"
        >
          {initialData ? "تحديث" : "حفظ"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-lg px-2 text-xs"
        >
          إلغاء
        </button>
      </div>
    </form>
  );
}
