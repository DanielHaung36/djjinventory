// src/lib/auth-utils.ts
import { authApi } from '@/features/auth/authApi';
import { customerApi } from '@/features/customer/customerApi';
import { storeapi } from '@/features/store/storeapi';
import { regionsApi } from '@/features/region/regionApi';
import { productsApi } from '@/features/products/productsApi';
import { uploadApi } from '@/features/products/uploadProductApi';
import { inventoryApi } from '@/features/inventory/inventoryApi';
import { logoutLocal } from '@/features/auth/authSlice';
import { type AppDispatch } from "../app/store";

/**
 * 完整的登出操作，包含cookie清理
 */
export const performLogout = async (dispatch: AppDispatch) => {
  console.log('performLogout: 开始执行完整登出流程');
  
  try {
    // 1. 调用后端登出API
    await dispatch(authApi.endpoints.logout.initiate()).unwrap();
    console.log('performLogout: 后端登出API调用成功');
  } catch (error) {
    console.error('performLogout: 后端登出API失败:', error);
    // 即使后端失败，也要清理前端状态
  }
  
  // 2. 清理Redux状态
  dispatch(logoutLocal());
  console.log('performLogout: Redux状态已清理');
  
  // 3. 清理所有RTK Query缓存
  resetAllApiCaches(dispatch);
  console.log('performLogout: 所有RTK Query缓存已清理');
  
  // 4. 手动清理可能残留的cookie（作为备选方案）
  clearAllCookies();
  console.log('performLogout: Cookie已清理');
  
  // 5. 登出完成，Redux 状态和 cookie 已清理
  console.log('performLogout: 完整登出流程已完成');
};

/**
 * 清理所有cookie的工具函数
 */
export const clearAllCookies = () => {
  console.log('clearAllCookies: 开始清理所有cookie');
  const cookies = document.cookie.split(";");
  console.log('clearAllCookies: 发现cookie数量:', cookies.length);
  
  cookies.forEach(cookie => {
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
    
    if (name) {
      console.log('clearAllCookies: 清理cookie:', name);
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
  
  console.log('clearAllCookies: Cookie清理完成');
};

/**
 * 检查是否有认证相关的cookie
 */
export const hasAuthCookie = (): boolean => {
  const cookies = document.cookie.split(';');
  const hasAuth = cookies.some(cookie => {
    const name = cookie.trim().split('=')[0];
    // 检查常见的认证cookie名称
    return ['token', 'auth-token', 'session', 'jwt', 'access_token'].includes(name.toLowerCase());
  });
  
  console.log('hasAuthCookie: 认证cookie检查结果:', hasAuth);
  return hasAuth;
};

/**
 * 清理所有API的RTK Query缓存
 */
export const resetAllApiCaches = (dispatch: AppDispatch) => {
  console.log('resetAllApiCaches: 开始清理所有API缓存');
  
  // 清理所有API缓存
  dispatch(authApi.util.resetApiState());
  dispatch(customerApi.util.resetApiState());
  dispatch(storeapi.util.resetApiState());
  dispatch(regionsApi.util.resetApiState());
  dispatch(productsApi.util.resetApiState());
  dispatch(uploadApi.util.resetApiState());
  dispatch(inventoryApi.util.resetApiState());
  
  // ✅ 额外清理特定的缓存标签，确保地区相关数据完全清理
  dispatch(inventoryApi.util.invalidateTags(['Region']));
  dispatch(regionsApi.util.invalidateTags(['REGIONS']));
  
  console.log('resetAllApiCaches: 所有API缓存已清理，包括地区相关标签');
};

/**
 * 清理特定API的RTK Query缓存
 */
export const clearApiCaches = (dispatch: AppDispatch, apiNames: string[] = []) => {
  console.log('clearApiCaches: 开始清理指定API缓存:', apiNames);
  
  const apiMap = {
    auth: authApi,
    customer: customerApi,
    store: storeapi,
    region: regionsApi,
    products: productsApi,
    upload: uploadApi,
    inventory: inventoryApi,
  };
  
  if (apiNames.length === 0) {
    // 如果没有指定，清理所有API缓存
    resetAllApiCaches(dispatch);
  } else {
    // 清理指定的API缓存
    apiNames.forEach(apiName => {
      const api = apiMap[apiName as keyof typeof apiMap];
      if (api) {
        dispatch(api.util.resetApiState());
        console.log(`clearApiCaches: ${apiName} API缓存已清理`);
      }
    });
  }
  
  console.log('clearApiCaches: API缓存清理完成');
};

/**
 * 强制刷新地区和仓库数据
 */
export const forceRefreshRegionsData = async (dispatch: AppDispatch) => {
  console.log('forceRefreshRegionsData: 开始强制刷新地区数据');
  
  try {
    // 第一步：清理地区相关的缓存标签
    dispatch(inventoryApi.util.invalidateTags(['Region']));
    dispatch(regionsApi.util.invalidateTags(['REGIONS']));
    console.log('forceRefreshRegionsData: 缓存标签已清理');
    
    // 第二步：强制重新获取数据
    const result = await dispatch(inventoryApi.endpoints.getRegionsWithWarehouses.initiate(undefined, { 
      forceRefetch: true,
      subscribe: false // 不订阅，只获取一次
    })).unwrap();
    
    console.log('forceRefreshRegionsData: 地区数据强制刷新完成，获取到数据:', result);
    
    return result;
  } catch (error) {
    console.error('forceRefreshRegionsData: 地区数据刷新失败:', error);
    throw error;
  }
};