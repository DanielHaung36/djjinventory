import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProductsPage from "../features/products/ProductsPage";
import AuthLayout from "../layouts/AuthLayout";
import LoginPage from "../features/auth/LoginPage";
import RegisterPage from "../features/auth/RegisterPage";
import PasswordResetPage from "../features/auth/PasswordResetPage";
import RegistrationCompletePage from "../features/auth/RegistrationCompletePage";

import MainLayout from "../layouts/MainLayout";
import Dashboard from "../features/dashboard/Dashboard";

import InventoryOverviewPage from "../features/inventory/InventoryOverviewPage";
import ProductDetailPage from "../features/products/ProductDetails";
import ProductDictionaryPage from "../features/products/ProductDictionaryPage";
import ProductEditPage from "../features/products/ProductEditPage";
import PurchasePage from "../features/purchase/Purchase";
import ProcurementPage from "../features/purchase/ProcurementPage";
import InventoryInboundPage from "../features/inventory/components/InventoryInBoundPage";
import InventoryOutboundPage from "../features/inventory/components/InventoryOutBoundPage";
import FAQ from "../features/faq/Faq";
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
        <Route element={<MainLayout />}>
          {/* 默认重定向 */}
          <Route index element={<Navigate to="dashboard" replace />} />

          {/* 一级路由 */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<ProductDictionaryPage />} />
          <Route path="purchases">
            <Route index element={< ProcurementPage/>}></Route>
            <Route path="/purchases/newpurchase" element={< PurchasePage/>} />
          </Route>

          {/* 二级路由组：inventory/* */}
          <Route path="inventory">
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<InventoryOverviewPage />} />
            {/* <Route path="details" element={<ProductDictionaryPage  />} /> */}
            <Route path="inbound" element={<InventoryInboundPage />} />
            <Route path="outbound" element={<InventoryOutboundPage />} />
          </Route>
          <Route path="/products/:code" element={<ProductDetailPage />} />
          <Route path="/products/edit/:code" element={<ProductEditPage />} />
          <Route path="/team" element={<Team />} />
          <Route path="/team/create" element={<Form />} />
          <Route path="/team/edit" element={<Form />} />
          <Route path="/faq" element={<FAQ />}></Route>
          <Route
            path="/settings/global"
            element={<UserPermissionEditor />}
          ></Route>

          {/* TODO: 更多二级路由组：orders/*、stores/* … */}
        </Route>
        {/* ====== 未匹配路由，跳到登录 ====== */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
