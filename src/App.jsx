// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import SafePage from "./pages/save"; // تأكد من المسار الصحيح
import ExpensesPage from "./pages/expenses"; // تأكد من المسار الصحيح
import GoldPage from "./pages/gold"; // تأكد من المسار الصحيح
import BankAccountsPage from "./pages/bank-accounts"; // تأكد من المسار الصحيح
import TowerPage from "./pages/tower"; // تأكد من المسار الصحيح
import NazmiPartnershipPage from "./pages/nazmi-partnership"; // تأكد من المسار الصحيح
import YoussefPartnershipPage from "./pages/youssef-partnership"; // تأكد من المسار الصحيح
import PartnershipExpensesPage from "./pages/office-expenses"; // تأكد من المسار الصحيح

// مكون مؤقت للصفحات التي لم نبنها بعد
const Placeholder = ({ title }) => (
  <div className="p-8 flex items-center justify-center h-[80vh]">
    <h1 className="text-2xl font-bold text-slate-400 italic">
      صفحة {title} - قريباً
    </h1>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* نستخدم AppLayout كأب لكل الصفحات المحمية */}
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Placeholder title="لوحة التحكم" />} />
          <Route path="safe" element={<SafePage />} />
          <Route path="expenses" element={<ExpensesPage />} />
          <Route path="gold" element={<GoldPage />} />
          <Route path="bank-accounts" element={<BankAccountsPage />} />
          <Route path="tower" element={<TowerPage />} />
          <Route path="nazmi-partnership" element={<NazmiPartnershipPage />} />
          <Route path="youssef" element={<YoussefPartnershipPage />} />
          <Route
            path="partnership-expenses"
            element={<PartnershipExpensesPage />}
          />
          {/* باقي المسارات */}
          <Route path="properties" element={<Placeholder title="العقارات" />} />
          <Route
            path="property-partners"
            element={<Placeholder title="شركاء العقارات" />}
          />
          <Route path="partnership" element={<Placeholder title="الشراكة" />} />
          <Route path="settings" element={<Placeholder title="الإعدادات" />} />

          {/* مسار في حال عدم وجود الصفحة */}
          <Route path="*" element={<Placeholder title="غير موجودة" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
