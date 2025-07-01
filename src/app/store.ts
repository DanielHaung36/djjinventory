import { configureStore } from '@reduxjs/toolkit';
// import your feature reducers here:
// import productsReducer from '../features/products/productsSlice';
import authReducer from "../features/auth/authSlice"
import { authApi } from '../features/auth/authApi'
export const store = configureStore({
  reducer: {
    //slice reducers
    auth:authReducer,
    [authApi.reducerPath]: authApi.reducer,
    // products: productsReducer,
  },
  middleware:(getDefaultMiddleware) =>
      // 必须将 RTK Query 的中间件添加到默认中间件链中
      getDefaultMiddleware()
          .concat(authApi.middleware)

});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
