// src/features/auth/authSlice.ts
import { createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import axios from '../../api/client'
import type { LoginRequest, User, AuthState } from './types'
import { AxiosError } from 'axios'
import type { PayloadAction } from '@reduxjs/toolkit'

// —— 1. 定义登录 Thunk —— 
export const login = createAsyncThunk<
  { token: string; user: User },
  LoginRequest,
  { rejectValue: string }
>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post('/login', credentials)
      return response.data as { token: string; user: User }
    } catch (err: unknown) {
      let message = '登录失败'
      if (axios.isAxiosError(err)) {
        const axiosErr = err as AxiosError<{ message: string }>
        message = axiosErr.response?.data?.message ?? message
      }
      return rejectWithValue(message)
    }
  }
)

// —— 2. 创建 Slice —— 
const initialState: AuthState = {
  token: null,
  user: null,
  loading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
      logout(state)  //reset state
      { 
      state.token   = null
      state.user    = null
      state.loading = false
      state.error   = null
    }
  },
  extraReducers: builder => {
    builder
      .addCase(login.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.token = action.payload.token
        state.user = action.payload.user
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  }
})

export const { logout } = authSlice.actions
export default authSlice.reducer
