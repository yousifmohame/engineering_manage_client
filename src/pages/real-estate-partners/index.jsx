import React, { useState, useEffect } from 'react';
import { 
  Users, Search, UserPlus, X, SquarePen, Trash2, 
  Building, Wallet, Percent, PieChart, ShieldCheck, LoaderCircle
} from 'lucide-react';
import { partnerService } from '../../services/partnerService';
import { realEstateService } from '../../services/realEstateService';

export default function RealEstatePartnersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // 🌟 حالات البيانات الحقيقية من الخادم
  const [partners, setPartners] = useState([]);
  const [availableProperties, setAvailableProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // حالة نموذج الإضافة/التعديل
  const [formData, setFormData] = useState({
    name: '',
    percentage: '',
    propertyIds: [] // مصفوفة لحفظ معرّفات العقارات المختارة
  });

  // 1. جلب البيانات من الخادم عند تحميل الصفحة
  const fetchData = async () => {
    setLoading(true);
    try {
      // جلب الشركاء والعقارات المتاحة في نفس الوقت
      const [partnersData, propertiesData] = await Promise.all([
        partnerService.getAll(),
        realEstateService.getAll()
      ]);
      setPartners(partnersData);
      setAvailableProperties(propertiesData);
    } catch (error) {
      console.error("فشل جلب البيانات:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: '', percentage: '', propertyIds: [] });
    setIsModalOpen(true);
  };

  const openEditModal = (partner) => {
    setEditingId(partner.id);
    setFormData({
      name: partner.name,
      percentage: partner.percentage,
      // استخراج معرّفات العقارات من الكائنات المرتبطة بالشريك
      propertyIds: partner.properties ? partner.properties.map(p => p.id) : []
    });
    setIsModalOpen(true);
  };

  const handlePropertyToggle = (propertyId) => {
    setFormData(prev => {
      const isSelected = prev.propertyIds.includes(propertyId);
      if (isSelected) {
        return { ...prev, propertyIds: prev.propertyIds.filter(id => id !== propertyId) };
      } else {
        return { ...prev, propertyIds: [...prev.propertyIds, propertyId] };
      }
    });
  };

  // 2. إرسال البيانات للخادم الحقيقي
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await partnerService.update(editingId, formData);
      } else {
        await partnerService.create(formData);
      }
      setIsModalOpen(false);
      fetchData(); // تحديث الشاشة بعد النجاح
    } catch (error) {
      alert("حدث خطأ أثناء حفظ الشريك");
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`هل أنت متأكد من حذف الشريك "${name}"؟`)) return;
    try {
      await partnerService.delete(id);
      fetchData();
    } catch (error) {
      alert("فشل حذف الشريك");
    }
  };

  // 🌟 حساب قيمة حصة الشريك من العقارات الفعلية المربوطة به
  const calculatePartnerShareValue = (partner) => {
    let totalPropertiesValue = 0;
    // الخادم يرسل العقارات ككائنات كاملة داخل الشريك (include: { properties: true })
    if (partner.properties) {
      partner.properties.forEach(prop => {
        totalPropertiesValue += prop.totalPrice || 0;
      });
    }
    return (totalPropertiesValue * (partner.percentage / 100));
  };

  const formatCurrency = (amount) => {
    return `SAR ${Number(amount).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  const filteredPartners = partners.filter(p => p.name.includes(searchQuery));
  const totalPartnersCount = partners.length;
  const totalSharedValue = partners.reduce((sum, partner) => sum + calculatePartnerShareValue(partner), 0);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 font-cairo bg-slate-50/50 min-h-screen" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* --- الشريط العلوي --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100 gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Users size={28} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">شركاء العقارات</h1>
              <p className="text-sm text-slate-500 mt-1 font-bold">إدارة نسب الشراكة والمستثمرين في الأصول</p>
            </div>
          </div>
          <button 
            onClick={openAddModal}
            className="w-full md:w-auto justify-center whitespace-nowrap text-sm h-11 px-5 flex items-center gap-2 rounded-xl shadow-md transition-all hover:shadow-lg font-bold bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95"
          >
            <UserPlus size={18} /> إضافة شريك
          </button>
        </div>

        {/* --- ملخص الإحصائيات --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
              <ShieldCheck size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">إجمالي عدد الشركاء</p>
              <h3 className="text-2xl font-black text-slate-800">{totalPartnersCount} <span className="text-sm font-bold text-slate-400">شريك</span></h3>
            </div>
          </div>
          <div className="bg-gradient-to-r from-indigo-900 to-slate-800 p-5 rounded-2xl border border-indigo-800 shadow-md flex items-center gap-4 text-white">
            <div className="p-3 bg-white/10 rounded-full">
              <Wallet size={24} className="text-indigo-200" />
            </div>
            <div>
              <p className="text-xs font-bold text-indigo-200 uppercase">إجمالي قيمة حصص الشركاء</p>
              <h3 className="text-2xl font-black">{formatCurrency(totalSharedValue)}</h3>
            </div>
          </div>
        </div>

        {/* --- شريط البحث --- */}
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
          <div className="relative flex-1">
            <input 
              className="w-full border bg-slate-50 border-slate-200 focus:bg-white rounded-xl h-12 pr-10 pl-4 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm transition-colors" 
              placeholder="ابحث باسم الشريك..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute right-3 top-3.5 text-slate-400" size={20} />
          </div>
        </div>

        {/* --- شبكة عرض الشركاء --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-indigo-600 font-bold">
              <LoaderCircle size={40} className="animate-spin mb-4" /> جاري التحميل...
            </div>
          ) : filteredPartners.length === 0 ? (
            <div className="col-span-full text-center py-20 text-slate-400 font-bold bg-white rounded-2xl border border-slate-100 border-dashed">
              لا يوجد شركاء مسجلين. أضف شريكاً جديداً للبدء.
            </div>
          ) : (
            filteredPartners.map((partner) => {
              const partnerShare = calculatePartnerShareValue(partner);
              
              return (
                <div key={partner.id} className="bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all rounded-2xl overflow-hidden group flex flex-col">
                  <div className="p-5 pb-3 flex justify-between items-start border-b border-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-lg">
                        {partner.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-black text-slate-800 text-lg">{partner.name}</h3>
                        <div className="flex items-center gap-1 text-xs font-bold text-slate-400">
                          <Building size={12} /> 
                          {partner.properties?.length || 0} عقار مرتبط
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditModal(partner)} className="p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors">
                        <SquarePen size={16} />
                      </button>
                      <button onClick={() => handleDelete(partner.id, partner.name)} className="p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col gap-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-slate-500 flex items-center gap-1"><PieChart size={14}/> نسبة الشراكة</span>
                        <span className="text-sm font-black text-indigo-600">{partner.percentage}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${partner.percentage}%` }}></div>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                        <Wallet size={14} className="text-slate-400" /> قيمة الحصة التقريبية
                      </span>
                      <span className="text-sm font-black text-slate-800 truncate pl-2" title={partnerShare}>{formatCurrency(partnerShare)}</span>
                    </div>

                    <div className="mt-auto pt-2">
                      <p className="text-[10px] font-bold text-slate-400 mb-2 uppercase">العقارات المشتركة</p>
                      <div className="flex flex-wrap gap-1.5">
                        {partner.properties && partner.properties.length > 0 ? (
                          partner.properties.map(prop => (
                            <span key={prop.id} className="bg-white border border-slate-200 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-md shadow-sm">
                              {prop.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 font-bold">لم يتم ربط عقارات</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* --- النافذة المنبثقة (Modal) للإضافة والتعديل --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            
            <div className="bg-slate-50 border-b border-slate-100 p-5 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-100 text-indigo-600 p-2 rounded-xl">
                  <Users size={20} />
                </div>
                <h2 className="font-black text-slate-800 text-xl">{editingId ? 'تعديل الشريك' : 'إضافة شريك جديد'}</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white hover:bg-slate-200 rounded-full text-slate-500 transition-colors shadow-sm border border-slate-100">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <form id="partnerForm" onSubmit={handleSubmit} className="space-y-5">
                
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700">اسم الشريك <span className="text-red-500">*</span></label>
                  <input required className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white transition-colors font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="مثال: يوسف فارس" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700">نسبة الشراكة المئوية (%) <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input required type="number" min="1" max="100" step="0.01" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white transition-colors font-bold" value={formData.percentage} onChange={e => setFormData({...formData, percentage: e.target.value})} placeholder="مثال: 50" />
                    <Percent className="absolute left-4 top-3.5 text-slate-400" size={16} />
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-xs font-black text-slate-700 flex items-center gap-2">
                    <Building size={14} /> العقارات المرتبطة بهذا الشريك
                  </label>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto custom-scrollbar">
                    {availableProperties.length === 0 ? (
                      <div className="col-span-full text-xs font-bold text-slate-400 text-center py-4">لا توجد عقارات مضافة في النظام.</div>
                    ) : (
                      availableProperties.map(prop => (
                        <label key={prop.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 cursor-pointer transition-colors">
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                            checked={formData.propertyIds.includes(prop.id)}
                            onChange={() => handlePropertyToggle(prop.id)}
                          />
                          <span className="text-sm font-bold text-slate-700">{prop.name}</span>
                        </label>
                      ))
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold px-1">سيتم حساب قيمة حصة الشريك بناءً على العقارات المحددة هنا.</p>
                </div>

              </form>
            </div>

            <div className="bg-slate-50 border-t border-slate-100 p-5 flex justify-end gap-3">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold transition-colors hover:bg-slate-100 text-sm">
                إلغاء
              </button>
              <button type="submit" form="partnerForm" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md font-bold transition-colors active:scale-95 text-sm">
                {editingId ? 'حفظ التعديلات' : 'اعتماد الشريك'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}