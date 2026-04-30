import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, House, Users, Building2, Briefcase, 
  FileText, Landmark, CircleUser, Vault, Coins, 
  Receipt, BrainCircuit, History, FolderOpen, Settings, 
  Moon, LogOut 
} from 'lucide-react';

const SidebarLink = ({ to, icon: Icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <li>
      <Link 
        to={to} 
        className={`group flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-all duration-200 font-medium ${
          isActive 
          ? 'bg-blue-50 text-blue-700 font-bold border border-blue-100/50' 
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        }`}
      >
        <Icon size={16} className={`${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
        <span className="text-[13px]">{label}</span>
      </Link>
    </li>
  );
};

export default function Sidebar({ isOpen, toggleMobileMenu }) {
  return (
    <aside className={`
      fixed inset-y-0 right-0 z-30 w-64 bg-white border-l border-slate-100 shadow-xl transform transition-transform duration-300 ease-in-out
      md:fixed md:h-screen md:translate-x-0 flex flex-col
      ${isOpen ? 'translate-x-0' : 'translate-x-full'}
    `}>
      <div className="p-4 hidden md:flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-md">
          <LayoutDashboard className="text-white h-4 w-4" />
        </div>
        <h1 className="text-xl font-black text-slate-900 tracking-tight">مديرتي المالية</h1>
      </div>

      <nav className="flex-1 overflow-y-auto py-1 custom-scrollbar">
        <ul className="space-y-0.5 px-2">
          <SidebarLink to="/" icon={LayoutDashboard} label="لوحة التحكم" />
          <SidebarLink to="/properties" icon={House} label="العقارات" />
          <SidebarLink to="/property-partners" icon={Users} label="شركاء العقارات" />
          <SidebarLink to="/tower" icon={Building2} label="شراكة عمارة طيبة" />
          <SidebarLink to="/nazmi-partnership" icon={Briefcase} label="شراكتي مع نظمي" />
          <SidebarLink to="/partnership-expenses" icon={FileText} label="مصروفات تشغيل المكتب" />
          <SidebarLink to="/bank-accounts" icon={Landmark} label="الأرصدة البنكية للشركة" />
          <SidebarLink to="/youssef" icon={Users} label="شراكتي مع يوسف" />
          <SidebarLink to="/youssef-portal" icon={CircleUser} label="بوابة يوسف" />
          <SidebarLink to="/safe" icon={Vault} label="الخزنة الشخصية" />
          <SidebarLink to="/gold" icon={Coins} label="الذهب والمصوغات" />
          <SidebarLink to="/expenses" icon={Receipt} label="المصروفات اليومية والشهرية" />
          <SidebarLink to="/ai-insights" icon={BrainCircuit} label="الرؤى الذكية" />
          <SidebarLink to="/ai-history" icon={History} label="سجل التحليلات" />
          <SidebarLink to="/files" icon={FolderOpen} label="مستعرض الملفات" />
          <SidebarLink to="/settings" icon={Settings} label="الإعدادات" />
        </ul>
      </nav>

      <div className="p-3 border-t border-slate-100 bg-slate-50/50 m-2 rounded-xl">
        <div className="px-2 flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
            <CircleUser className="h-5 w-5 text-slate-500" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-slate-900 truncate">يوسف فارس</p>
            <p className="text-[10px] text-slate-500 truncate">youssef@example.com</p>
          </div>
        </div>
        <button className="flex items-center justify-center gap-2 px-3 py-1.5 w-full rounded-lg text-red-600 bg-red-50 hover:bg-red-100 transition-colors font-bold text-xs">
          <LogOut size={14} />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
}