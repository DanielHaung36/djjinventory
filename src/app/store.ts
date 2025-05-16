import { configureStore } from '@reduxjs/toolkit';
// import your feature reducers here:
// import productsReducer from '../features/products/productsSlice';
import authReducer from "../features/auth/authSlice"
export const store = configureStore({
  reducer: {
    //slice reducers
    auth:authReducer,
    // products: productsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
