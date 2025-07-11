// src/lib/auth-utils.ts
import { authApi } from '@/features/auth/authApi';
import { logoutLocal } from '@/features/auth/authSlice';
import { type AppDispatch } from "../app/store";

/**
 * 完整的登出操作，包含cookie清理
 */
export const performLogout = async (dispatch: AppDispatch) => {
  try {
    // 1. 调用后端登出API
    await dispatch(authApi.endpoints.logout.initiate()).unwrap();
  } catch (error) {
    console.error('Logout API failed:', error);
    // 即使后端失败，也要清理前端状态
  }
  
  // 2. 清理Redux状态
  dispatch(logoutLocal());
  
  // 3. 清理RTK Query缓存
  dispatch(authApi.util.resetApiState());
  
  // 4. 手动清理可能残留的cookie（作为备选方案）
  clearAllCookies();
  
  // 5. 登出完成，Redux 状态和 cookie 已清理
};

/**
 * 清理所有cookie的工具函数
 */
export const clearAllCookies = () => {
  const cookies = document.cookie.split(";");
  
  cookies.forEach(cookie => {
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
    
    if (name) {
      // 清理不同路径和域的cookie
      const cookieBase = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
      
      // 清理当前路径
      document.cookie = cookieBase + 'path=/';
      
      // 清理当前域
      document.cookie = cookieBase + `path=/;domain=${window.location.hostname}`;
      
      // 清理主域（如果是子域）
      const parts = window.location.hostname.split('.');
      if (parts.length > 2) {
        const mainDomain = parts.slice(-2).join('.');
        document.cookie = cookieBase + `path=/;domain=.${mainDomain}`;
      }
    }
  });
};

/**
 * 检查是否有认证相关的cookie
 */
export const hasAuthCookie = (): boolean => {
  const cookies = document.cookie.split(';');
  return cookies.some(cookie => {
    const name = cookie.trim().split('=')[0];
    // 检查常见的认证cookie名称
    return ['token', 'auth-token', 'session', 'jwt', 'access_token'].includes(name.toLowerCase());
  });
};