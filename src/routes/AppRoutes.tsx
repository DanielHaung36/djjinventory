import React from 'react';
import { BrowserRouter, Routes, Route ,Navigate} from 'react-router-dom';
import ProductsPage from '../features/products/ProductsPage';
import AuthLayout from '../layouts/AuthLayout';
import LoginPage from '../features/auth/LoginPage';
import RegisterPage from '../features/auth/RegisterPage';
import PasswordResetPage from '../features/auth/PasswordResetPage';
import RegistrationCompletePage from '../features/auth/RegistrationCompletePage';

import MainLayout from '../layouts/MainLayout';
import Dashboard from '../features/dashboard/Dashboard';

import InventoryOverviewPage from '../features/inventory/InventoryOverviewPage';
import ProductDictionaryPage from '../features/inventory/components/ProductDictionaryPage';
import InventoryShippingPage from '../features/inventory/components/InventoryShippingPage';
import InventoryInboundPage from '../features/inventory/components/InventoryInboundPage';

export default function AppRoutes() {
  return (
    <BrowserRouter>
   <Routes>
        {/* ====== 认证模块（无需侧边栏/TopBar） ====== */}
        <Route element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="reset-password" element={<PasswordResetPage />} />
          <Route path="registration-complete" element={<RegistrationCompletePage />} />
        </Route>

        {/* ====== 主应用模块（带侧边栏/TopBar） ====== */}
        <Route element={<MainLayout />}>
          {/* 默认重定向 */}
          <Route index element={<Navigate to="dashboard" replace />} />

          {/* 一级路由 */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<ProductsPage />} />

          {/* 二级路由组：inventory/* */}
          <Route path="inventory">
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<InventoryOverviewPage />} />
              {/* <Route path="/inventory/:code" element={<InventoryDetailsPage />} /> */}
              <Route path="details" element={<ProductDictionaryPage  />} />
            <Route path="shipping" element={<InventoryInboundPage />} />
          </Route>

          {/* TODO: 更多二级路由组：orders/*、stores/* … */}
        </Route>

        {/* ====== 未匹配路由，跳到登录 ====== */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}