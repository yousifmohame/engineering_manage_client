import React, { useState, useEffect, useRef } from 'react';
import { 
  House, X, Building, SquarePen, Trash2, MapPin, 
  Image as ImageIcon, Info, ChartPie, Sparkles, LoaderCircle, Plus, Upload
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { realEstateService } from '../../services/realEstateService'; // نفترض وجود الخدمة

const BASE_SERVER_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}`;

export default function RealEstatePage() {
  // 1. حالات التحكم في الواجهة
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); // إذا كان null يعني إضافة، وإذا كان به ID يعني تعديل
  const [searchQuery, setSearchQuery] = useState("");
  
  // 2. حالات البيانات
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // 3. حالة النموذج (Form State) - أضفنا حقل image
  const [formData, setFormData] = useState({
    name: '', type: '', location: '', status: 'متاح', 
    totalPrice: '', currency: 'SAR', paidAmount: '', notes: '', image: null
  });

  const fileInputRef = useRef(null);

  // جلب البيانات من الخادم
  const fetchRealEstates = async () => {
    setLoading(true);
    try {
      const data = await realEstateService.getAll();
      setProperties(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealEstates();
  }, []);

  // فتح نافذة الإضافة (تفريغ الحقول)
  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: '', type: '', location: '', status: 'متاح', totalPrice: '', currency: 'SAR', paidAmount: '', notes: '', image: null });
    setIsModalOpen(true);
  };

  // فتح نافذة التعديل (تعبئة الحقول ببيانات العقار المختار)
  const openEditModal = (property) => {
    setEditingId(property.id);
    setFormData({
      name: property.name,
      type: property.type || '',
      location: property.location || '',
      status: property.status,
      totalPrice: property.totalPrice,
      currency: property.currency,
      paidAmount: property.paidAmount,
      notes: property.notes || '',
      image: null // لا نعرض الصورة كملف، بل ننتظر من المستخدم رفع صورة جديدة إن أراد
    });
    setIsModalOpen(true);
  };

  // معالجة اختيار الصورة من الجهاز
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, image: e.target.files[0] });
    }
  };

  // إرسال النموذج (إضافة أو تعديل)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 🌟 ملاحظة: لرفع الصور، يجب استخدام FormData بدلاً من JSON
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          submitData.append(key, formData[key]);
        }
      });

      if (editingId) {
        // تحديث عقار موجود (تأكد من إضافة دالة update في realEstateService)
        await realEstateService.update(editingId, submitData);
      } else {
        // إضافة عقار جديد
        await realEstateService.create(submitData);
      }
      
      setIsModalOpen(false);
      fetchRealEstates();
    } catch (error) {
      alert("حدث خطأ أثناء حفظ العقار. تأكد من إعدادات الخادم.");
    }
  };

  // حذف عقار
  const handleDelete = async (id, name) => {
    if (!window.confirm(`هل أنت متأكد من حذف العقار "${name}"؟`)) return;
    try {
      await realEstateService.delete(id);
      fetchRealEstates();
    } catch (error) {
      alert("فشل حذف العقار");
    }
  };

  // تنسيق العملة
  const formatCurrency = (amount, currency) => {
    return `${currency} ${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  // مساعدة لعرض مسار الصورة الصحيح
  const getImageUrl = (url) => {
    if (!url) return null;
    return url.startsWith("http") ? url : `${BASE_SERVER_URL}${url}`;
  };

  const filteredProperties = properties.filter(p => p.name.includes(searchQuery) || (p.location && p.location.includes(searchQuery)));

  const chartData = [
    { name: 'متاح', value: properties.filter(p => p.status === 'متاح').length, color: '#3b82f6' },
    { name: 'مباع', value: properties.filter(p => p.status === 'مباع').length, color: '#10b981' },
    { name: 'مؤجر', value: properties.filter(p => p.status === 'مؤجر').length, color: '#f59e0b' },
    { name: 'تحت الإنشاء', value: properties.filter(p => p.status === 'تحت الإنشاء').length, color: '#8b5cf6' },
  ].filter(item => item.value > 0);

  return (
    <div className="flex-1 overflow-y-auto p-3 md:p-8 pb-24 font-cairo bg-slate-50/50 min-h-screen" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        
        {/* --- الشريط العلوي (Mobile-First) --- */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 gap-4">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="p-2 md:p-3 bg-blue-50 text-blue-600 rounded-xl">
              <House className="w-6 h-6 md:w-7 md:h-7" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">العقارات</h1>
              <p className="text-xs md:text-sm text-slate-500 mt-1 font-bold">إدارة ومتابعة الأصول العقارية</p>
            </div>
          </div>
          <button 
            onClick={openAddModal}
            className="w-full sm:w-auto justify-center whitespace-nowrap text-sm h-11 md:h-10 px-4 py-2 flex items-center gap-2 rounded-xl shadow-md transition-all hover:shadow-lg font-bold bg-blue-600 hover:bg-blue-700 text-white active:scale-95"
          >
            <Plus size={18} /> إضافة عقار
          </button>
        </div>

        {/* --- شريط البحث --- */}
        <div className="bg-white p-3 md:p-4 rounded-2xl shadow-sm border border-slate-100">
          <input 
            className="w-full border bg-slate-50 border-slate-200 focus:bg-white rounded-xl h-12 px-4 outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm md:text-base transition-colors" 
            placeholder="ابحث باسم العقار أو الموقع..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* --- منطقة العرض الرئيسية --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          
          {/* شبكة العقارات (تأخذ مساحة أكبر) */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 items-start">
            {loading ? (
              <div className="col-span-full flex flex-col justify-center items-center py-20 text-slate-400 font-bold">
                <LoaderCircle className="animate-spin mb-2 w-8 h-8" /> جاري التحميل...
              </div>
            ) : filteredProperties.length === 0 ? (
              <div className="col-span-full text-center py-20 text-slate-400 font-bold bg-white rounded-2xl border border-slate-100 border-dashed">
                لا توجد عقارات مطابقة.
              </div>
            ) : (
              filteredProperties.map((property) => (
                <div key={property.id} className="bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden group flex flex-col h-full">
                  
                  {/* منطقة الصورة العلوية */}
                  <div className="h-40 md:h-48 bg-slate-100 relative overflow-hidden flex justify-center items-center group-hover:bg-slate-200 transition-colors shrink-0">
                    {property.imageUrl ? (
                      <img src={getImageUrl(property.imageUrl)} alt={property.name} className="w-full h-full object-cover" />
                    ) : (
                      <Building size={48} className="text-slate-300 group-hover:text-slate-400 transition-colors" />
                    )}
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                    
                    {/* شارة الحالة */}
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm text-slate-800 text-[10px] md:text-xs font-black px-3 py-1 rounded-full shadow-sm">
                      {property.status}
                    </div>
                  </div>

                  {/* تفاصيل العقار */}
                  <div className="p-4 relative z-10 flex flex-col flex-1">
                    <div className="flex justify-between items-start -mt-10 mb-3">
                      <h3 className="text-lg md:text-xl font-black text-white drop-shadow-md truncate pr-1 flex-1">
                        {property.name}
                      </h3>
                      <div className="flex gap-1 shrink-0 bg-black/30 p-1 rounded-lg backdrop-blur-md">
                        <button onClick={() => openEditModal(property)} className="text-white hover:text-blue-300 transition-colors p-1.5 rounded-md hover:bg-white/20">
                          <SquarePen size={16} />
                        </button>
                        <button onClick={() => handleDelete(property.id, property.name)} className="text-white hover:text-red-400 transition-colors p-1.5 rounded-md hover:bg-white/20">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-xs md:text-sm text-slate-600 font-bold bg-slate-50 w-fit px-2 py-1 rounded-md border border-slate-100 mb-4">
                      <MapPin size={14} className="mr-1 ml-1 text-blue-500" />
                      {property.location || 'الموقع غير محدد'}
                    </div>

                    {/* الحسابات المالية تدفع نفسها للأسفل */}
                    <div className="mt-auto">
                      <div className="grid grid-cols-3 gap-1 bg-slate-50 p-2 rounded-xl border border-slate-100 mb-3">
                        <div className="text-center border-l border-slate-200">
                          <div className="text-[9px] md:text-[10px] text-slate-500 font-bold">الإجمالي</div>
                          <div className="text-[10px] md:text-xs font-black text-slate-800 mt-1 truncate px-1" title={property.totalPrice}>
                            {formatCurrency(property.totalPrice, property.currency)}
                          </div>
                        </div>
                        <div className="text-center border-l border-slate-200">
                          <div className="text-[9px] md:text-[10px] text-emerald-600 font-bold">المدفوع</div>
                          <div className="text-[10px] md:text-xs font-black text-emerald-700 mt-1 truncate px-1" title={property.paidAmount}>
                            {formatCurrency(property.paidAmount, property.currency)}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-[9px] md:text-[10px] text-red-600 font-bold">المتبقي</div>
                          <div className="text-[10px] md:text-xs font-black text-red-700 mt-1 truncate px-1" title={property.remainingAmount}>
                            {formatCurrency(property.remainingAmount, property.currency)}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] text-slate-500 font-bold">نسبة السداد</span>
                        <span className="text-[10px] font-black text-slate-700">{property.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 md:h-2 overflow-hidden">
                        <div className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-full rounded-full transition-all duration-1000" style={{ width: `${property.progress}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* القسم الجانبي (الرسم البياني والرؤى) */}
          <div className="space-y-4 md:space-y-6">
            <div className="bg-white border border-slate-100 shadow-sm rounded-2xl overflow-hidden h-fit">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                <ChartPie size={20} className="text-blue-600" />
                <h3 className="text-slate-800 text-base font-black">حالة العقارات</h3>
              </div>
              <div className="p-4 h-[250px] md:h-[300px]">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                        {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontFamily: 'Cairo', fontWeight: 'bold' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 font-bold text-sm">لا توجد بيانات</div>
                )}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-5 border border-purple-100 shadow-sm">
              <h3 className="font-black text-purple-900 flex items-center gap-2 mb-2 text-base">
                <Sparkles size={20} className="text-purple-600" /> رؤى ذكية
              </h3>
              <div className="text-purple-700 text-sm font-medium leading-relaxed">
                ميزة التحليل الذكي للعقارات ستكون متاحة قريباً. ستتمكن من معرفة العوائد المتوقعة وأفضل أوقات البيع أو الشراء.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- النافذة المنبثقة (Modal) للإضافة والتعديل --- */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* رأس النافذة */}
            <div className="bg-slate-50 border-b border-slate-100 p-5 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 text-blue-600 p-2 rounded-xl">
                  {editingId ? <SquarePen size={20} /> : <House size={20} />}
                </div>
                <h2 className="font-black text-slate-800 text-xl">{editingId ? 'تعديل العقار' : 'إضافة عقار جديد'}</h2>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 bg-white hover:bg-slate-200 rounded-full text-slate-500 transition-colors shadow-sm border border-slate-100"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* محتوى النموذج (قابل للتمرير) */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              <form id="realEstateForm" onSubmit={handleSubmit} className="space-y-6">
                
                {/* منطقة رفع الصورة */}
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:bg-slate-100 transition-colors cursor-pointer group" onClick={() => fileInputRef.current.click()}>
                  <div className="bg-white p-3 rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                    <Upload size={24} className="text-blue-500" />
                  </div>
                  <h4 className="font-bold text-slate-700 mb-1">صورة العقار (اختياري)</h4>
                  <p className="text-xs text-slate-500 font-medium">
                    {formData.image ? `تم اختيار: ${formData.image.name}` : 'اضغط هنا لاختيار صورة من جهازك'}
                  </p>
                  <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700">اسم العقار <span className="text-red-500">*</span></label>
                    <input required className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-colors font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="مثال: فيلا الياسمين" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700">النوع</label>
                    <input className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-colors font-bold" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} placeholder="مثال: شقة، أرض، عمارة" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700">الموقع</label>
                    <input className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-colors font-bold" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="مثال: الرياض، حي الملقا" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700">الحالة</label>
                    <select className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-colors font-bold" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                      <option value="متاح">متاح</option>
                      <option value="مباع">مباع</option>
                      <option value="مؤجر">مؤجر</option>
                      <option value="تحت الإنشاء">تحت الإنشاء</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700">إجمالي السعر <span className="text-red-500">*</span></label>
                    <input required type="number" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-colors font-bold" value={formData.totalPrice} onChange={e => setFormData({...formData, totalPrice: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700">العملة</label>
                    <select className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-colors font-bold" value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value})}>
                      <option value="SAR">SAR</option>
                      <option value="USD">USD</option>
                      <option value="EGP">EGP</option>
                    </select>
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-black text-slate-700">الدفعة المقدمة (المبلغ المدفوع حتى الآن)</label>
                    <input type="number" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-colors font-bold" value={formData.paidAmount} onChange={e => setFormData({...formData, paidAmount: e.target.value})} />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-black text-slate-700">ملاحظات إضافية</label>
                    <textarea rows="3" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-colors font-bold resize-none custom-scrollbar" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="اكتب أي تفاصيل أخرى عن العقار..."></textarea>
                  </div>
                </div>
              </form>
            </div>

            {/* ذيل النافذة (الأزرار) */}
            <div className="bg-slate-50 border-t border-slate-100 p-5 flex justify-end gap-3 shrink-0">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)} 
                className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold transition-colors hover:bg-slate-100 text-sm"
              >
                إلغاء
              </button>
              <button 
                type="submit" 
                form="realEstateForm" 
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md font-bold transition-colors active:scale-95 text-sm flex items-center gap-2"
              >
                {editingId ? <SquarePen size={18} /> : <Plus size={18} />}
                {editingId ? 'حفظ التعديلات' : 'إضافة العقار'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}