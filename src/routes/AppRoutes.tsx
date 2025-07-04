import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AuthLayout from "../layouts/AuthLayout";
import LoginPage from "../features/auth/LoginPage";
import RegisterPage from "../features/auth/RegisterPage";
import PasswordResetPage from "../features/auth/PasswordResetPage";
import RegistrationCompletePage from "../features/auth/RegistrationCompletePage";
import RequireAuth from "../features/auth/RequireAuth.tsx";
import { InvoicePDFGenerator } from "../features/sales/InviocePDF";
import { AppLayout } from "../layout/app-layout";
import Dashboard from "../features/dashboard/Dashboard";
import SalesOverviewPage from "../features/sales/OverviewPage";
import CustomerManagement from "../features/customer/page.tsx";
import InventoryOverviewPage from "../features/inventory/InventoryOverviewPage";
import ProductDetailPage from "../features/products/ProductDetails";
import ProductDictionaryPage from "../features/products/ProductDictionaryPage";
import ProductEditPage from "../features/products/ProductEditPage";
import ProductManagement from "../features/products/ProductManagement.tsx";
import PurchasePage from "../features/procure/Purchase";
import { ProcurementManagement } from "../features/procure/Procurement-management";
import { ProductLaunchManagement } from "../features/procure/Product-launch-management";
import { ReportsOverview } from "../features/procure/Reports";
import { DashboardOverview } from "../features/procure/DashboardOverview";
import { AdminApprovals } from "../components/admin-approvals";
import { AdminProductReview } from "../features/procure/admin-product-review";
import ProductLaunchForm from "../features/procure/Productlaunchform";
import InboundPage from "../features/inventory/components/InventoryInboundPage";
import QuoteApprovalsPage from "../features/quotes/approvals";
import QuotesPage from "../features/quotes/page";
import NewQuotePage from "../features/quotes/new/page";
import QuoteDetailPage from "../features/quotes/[id]/page";
import EditQuotePage from "../features/quotes/[id]/edit/page";
import OutboundPage from "../features/inventory/components/InventoryOutBoundPage";
import DashboardPage from "../features/inventory/pages/pages";
import NewInboundPage from "../features/inventory/pages/components/inbound/new/page";
import NewOutboundPage from "../features/inventory/pages/components/outbound/new/page";
import NewSalesOrderForm from "../features/sales/NewSaleOrder";
import SalesOrderDetail from "../features/sales/SalesDetails";
import AdminSalesOrdersPage from "../features/sales/AdminSalesOrder";
import FAQPage from "../features/faq/page";
import KnowledgeBasePage from "../features/knowledge/page";
import UserPermissionEditor from "../features/setting/Rbac";
import Team from "../features/user";
import Form from "../features/user/components/Form";


export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ====== 认证模块（无需侧边栏/TopBar） ====== */}
        <Route element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="reset-password" element={<PasswordResetPage />} />
          <Route
            path="registration-complete"
            element={<RegistrationCompletePage />}
          />
        </Route>

        {/* ====== 主应用模块（带侧边栏/TopBar） ====== */}
        <Route element={<RequireAuth />}>
          <Route element={<AppLayout />}>
            {/* 默认重定向 */}
            <Route index element={<Navigate to="dashboard" replace />} />

            {/* 一级路由 */}
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="quotes" >
              <Route index element={< QuotesPage />}></Route>
              <Route path="/quotes/overview" element={< QuotesPage />} />
              <Route path="/quotes/new" element={< NewQuotePage />} />
              <Route path="/quotes/:id" element={< QuoteDetailPage />} />
              <Route path="/quotes/:id/edit" element={< EditQuotePage />} />
              <Route path="/quotes/approvals" element={<QuoteApprovalsPage />} />
            </Route>

            <Route path="customer" element={<CustomerManagement />} />


            <Route path="procure">
              <Route index element={< DashboardOverview />}></Route>
              <Route path="/procure/dashboard" element={< DashboardOverview />} />
              <Route path="/procure/newpurchase" element={< PurchasePage />} />
              <Route path="/procure/procurement" element={< ProcurementManagement />} />
              <Route path="/procure/products" element={< ProductLaunchManagement />} />
              <Route path="/procure/products/new" element={< ProductLaunchForm />} />
              <Route path="/procure/reports" element={< ReportsOverview />} />
              <Route path="/procure/admin" element={< AdminApprovals />} />
              <Route path="/procure/admin/products" element={< AdminProductReview />} />
              {/* <Route path="/procure/newpurchase" element={< PurchasePage/>} /> */}
            </Route>

            <Route path="/sales/overview" element={<SalesOverviewPage />} />
            <Route path="/sales/new" element={<NewSalesOrderForm />} />
            <Route path="/sales/:id" element={<SalesOrderDetail />} />
            <Route path="/sales/details" element={<InvoicePDFGenerator />} />
            <Route path="/sales/admin" element={<AdminSalesOrdersPage />} />

            {/* 二级路由组：inventory/* */}
            <Route path="inventory">
              <Route index element={<Navigate to="overview" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="overview" element={<InventoryOverviewPage />} />
              <Route path="inbound" element={<InboundPage />} />
              <Route path="/inventory/inbound/new" element={<NewInboundPage />} />
              <Route path="/inventory/outbound/new" element={<NewOutboundPage />} />
              <Route path="outbound" element={<OutboundPage />} />
            </Route>
            <Route path="products" element={<ProductManagement />} />
            <Route path="/products/:code" element={<ProductDetailPage />} />
            <Route path="/products/edit/:code" element={<ProductEditPage />} />
            <Route path="/team" element={<Team />} />
            <Route path="/team/create" element={<Form />} />
            <Route path="/team/edit" element={<Form />} />
            <Route path="/faq" element={<FAQPage />}></Route>
            <Route path="/knowledge" element={<KnowledgeBasePage />}></Route>
            <Route
              path="/settings/global"
              element={<UserPermissionEditor />}
            ></Route>
          </Route>
        </Route>
        {/* ====== 未匹配路由，跳到登录 ====== */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
