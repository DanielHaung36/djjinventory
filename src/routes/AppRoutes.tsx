import React from 'react';
import { BrowserRouter, Routes, Route ,Navigate} from 'react-router-dom';
import ProductsPage from '../features/products/ProductsPage';
import LoginSimple from '../features/auth/LoginSimple';
import Dashboard from '../features/dashboard/Dashboard';
export default function AppRoutes() {
  const token = localStorage.getItem('token')
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/products" element={<ProductsPage />} />
        {/* TODO: add other routes */}
        <Route path="/login" element={<LoginSimple/>}></Route>
        <Route path='/dashboard' element={token ?  <Dashboard /> : <Navigate to="/login"/>}> </Route>
        <Route path='/*' element={token ?  <Dashboard /> : <Navigate to="/login"/>}></Route> <Route/>
      </Routes>
    </BrowserRouter>
  );
}
