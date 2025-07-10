import { configureStore } from '@reduxjs/toolkit';
// import your feature reducers here:
// import productsReducer from '../features/products/productsSlice';
import authReducer from "../features/auth/authSlice"
import { authApi } from '../features/auth/authApi'
import { customerApi } from '../features/customer/customerApi';
import { storeapi } from '../features/store/storeapi';
import { regionsApi } from '../features/region/regionApi';
import { productsApi } from '../features/products/productsApi';
import { uploadApi } from '../features/products/uploadProductApi';
import { inventoryApi } from '../features/inventory/inventoryApi';
export const store = configureStore({
  reducer: {
    //slice reducers
    auth:authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [customerApi.reducerPath]: customerApi.reducer,
    [storeapi.reducerPath]: storeapi.reducer,
    [regionsApi.reducerPath]:regionsApi.reducer,
    [productsApi.reducerPath]:productsApi.reducer,
    [uploadApi.reducerPath]:uploadApi.reducer,
    [inventoryApi.reducerPath]: inventoryApi.reducer,

    // products: productsReducer,
  },
  middleware:(getDefaultMiddleware) =>
      // 必须将 RTK Query 的中间件添加到默认中间件链中
      getDefaultMiddleware()
          .concat(authApi.middleware)
          .concat(customerApi.middleware)
          .concat(storeapi.middleware)
          .concat(regionsApi.middleware)
          .concat(productsApi.middleware)
          .concat(uploadApi.middleware)
          .concat(inventoryApi.middleware)

});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
