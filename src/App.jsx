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
import YoussefPortal from "./pages/youssef-portal";
import FilesPage from "./pages/files"; // تأكد من المسار الصحيح
import AiInsightsPage from "./pages/ai-insights";
import AnalyticsHistoryPage from "./pages/ai-history";
import RealEstatePage from "./pages/real-estate";
import RealEstatePartnersPage from "./pages/real-estate-partners";
import DashboardPage from "./pages/dashboard";
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
          <Route index element={<DashboardPage />} />
          <Route path="safe" element={<SafePage />} />
          <Route path="expenses" element={<ExpensesPage />} />
          <Route path="gold" element={<GoldPage />} />
          <Route path="bank-accounts" element={<BankAccountsPage />} />
          <Route path="tower" element={<TowerPage />} />
          <Route path="nazmi-partnership" element={<NazmiPartnershipPage />} />
          <Route path="youssef" element={<YoussefPartnershipPage />} />
          <Route path="youssef-portal" element={<YoussefPortal />} />
          <Route path="files" element={<FilesPage />} />
          <Route path="ai-insights" element={<AiInsightsPage />} />
          <Route path="ai-history" element={<AnalyticsHistoryPage />} />
          <Route
            path="partnership-expenses"
            element={<PartnershipExpensesPage />}
          />
          <Route path="properties" element={<RealEstatePage />} />
          <Route
            path="property-partners"
            element={<RealEstatePartnersPage />}
          />

          <Route path="settings" element={<Placeholder title="الإعدادات" />} />

          {/* مسار في حال عدم وجود الصفحة */}
          <Route path="*" element={<Placeholder title="غير موجودة" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
