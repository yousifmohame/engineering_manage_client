import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

export default function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="h-screen bg-slate-50 flex overflow-hidden font-cairo" dir="rtl">
      <Sidebar isOpen={isSidebarOpen} toggleMobileMenu={() => setIsSidebarOpen(!isSidebarOpen)} />

      <main className="flex-1 md:mr-64 h-screen flex flex-col transition-all duration-300">
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b p-3 flex justify-between items-center z-20 shrink-0">
          <h1 className="font-black text-lg text-blue-600">مديرتي المالية</h1>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1.5 bg-slate-100 text-slate-700 rounded-md">
            <Menu size={20} />
          </button>
        </div>

        {/* Content Area (Scrollable independently) */}
        <div className="flex-1 overflow-y-auto p-3 md:p-5">
          <Outlet />
        </div>
      </main>

      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-20 md:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}
    </div>
  );
}