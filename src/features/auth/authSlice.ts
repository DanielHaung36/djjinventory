// // src/features/auth/authSlice.ts
// import { createSlice, createAsyncThunk} from '@reduxjs/toolkit'
// import axios from '../../api/client'
// import type { LoginRequest, User, AuthState } from './types'
// import { AxiosError } from 'axios'
// import type { PayloadAction } from '@reduxjs/toolkit'
//
// // —— 1. 定义登录 Thunk ——
// export const login = createAsyncThunk<
//   { token: string; user: User },
//   LoginRequest,
//   { rejectValue: string }
// >(
//   'auth/login',
//   async (credentials, { rejectWithValue }) => {
//     try {
//       const response = await axios.post('/login', credentials)
//       return response.data as { token: string; user: User }
//     } catch (err: unknown) {
//       let message = '登录失败'
//       if (axios.isAxiosError(err)) {
//         const axiosErr = err as AxiosError<{ message: string }>
//         message = axiosErr.response?.data?.message ?? message
//       }
//       return rejectWithValue(message)
//     }
//   }
// )
//
// // —— 2. 创建 Slice ——
// const initialState: AuthState = {
//   token: null,
//   user: null,
//   loading: false,
//   error: null,
// }
//
// const authSlice = createSlice({
//   name: 'auth',
//   initialState,
//   reducers: {
//       logout(state)  //reset state
//       {
//       state.token   = null
//       state.user    = null
//       state.loading = false
//       state.error   = null
//     }
//   },
//   extraReducers: builder => {
//     builder
//       .addCase(login.pending, state => {
//         state.loading = true
//         state.error = null
//       })
//       .addCase(login.fulfilled, (state, action) => {
//         state.loading = false
//         state.token = action.payload.token
//         state.user = action.payload.user
//       })
//       .addCase(login.rejected, (state, action) => {
//         state.loading = false
//         state.error = action.payload as string
//       })
//   }
// })
//
// export const { logout } = authSlice.actions
// export default authSlice.reducer


// src/features/auth/authSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type {
    LoginResponse,
    RegisterResponse,
    User
} from './authApi'
import { authApi } from './authApi'

// 只用 any，前端不关心它长什么样
interface AuthState {
  token: string | null
  user: any     // ← 这里用 any，自动换成后端给你的完整对象
  profile:any
}

// 从localStorage读取初始状态
const loadFromLocalStorage = () => {
  try {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    return {
      token: token || null,
      user: user ? JSON.parse(user) : null,
      profile: null
    };
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return {
      token: null,
      user: null,
      profile: null
    };
  }
};

const initialState: AuthState = loadFromLocalStorage();


const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        /** 手动登出，清空 state **/
        logoutLocal(state) {
            state.token = null
            state.user  = null
            state.profile = null
            // 清理localStorage
            localStorage.removeItem('user')
            localStorage.removeItem('token')
        },
        setUser(state, action: PayloadAction<User>) {
            state.user = action.payload
            // 同步保存到localStorage
            localStorage.setItem('user', JSON.stringify(action.payload))
        },
        // 专门用于处理登录的action，确保完全替换用户状态
        loginSuccess(state, action: PayloadAction<LoginResponse>) {
            // 先清理所有旧状态
            state.token = null
            state.user = null
            state.profile = null
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            
            // 设置新状态
            state.token = action.payload.token
            state.user = action.payload.user
            
            // 保存到localStorage
            localStorage.setItem('token', action.payload.token)
            localStorage.setItem('user', JSON.stringify(action.payload.user))
        },
    },
    extraReducers: (builder) => {
        // —— 当 login mutation 成功时，把返回的 token/user 存进去 ——
        // 现在主要在LoginPage中手动处理，这里作为备选方案
        builder.addMatcher(
            authApi.endpoints.login.matchFulfilled,
            (state, { payload }: PayloadAction<LoginResponse>) => {
                console.log('Login API succeeded:', payload);
                // 如果没有通过手动dispatch处理，这里作为备选
                if (!state.user) {
                    // 先清理旧的状态
                    state.token = null
                    state.user = null
                    state.profile = null
                    localStorage.removeItem('token')
                    localStorage.removeItem('user')
                    
                    // 设置新的状态
                    state.token = payload.token
                    state.user  = payload.user
                    // 保存新的数据到localStorage
                    localStorage.setItem('token', payload.token)
                    localStorage.setItem('user', JSON.stringify(payload.user))
                }
            }
        )
        // —— 当 register mutation 成功时，同样存 token/user ——
        builder.addMatcher(
            authApi.endpoints.register.matchFulfilled,
            (state, { payload }: PayloadAction<RegisterResponse>) => {
                // 先清理旧的状态
                state.token = null
                state.user = null
                state.profile = null
                localStorage.removeItem('token')
                localStorage.removeItem('user')
                
                // 设置新的状态
                state.user = payload.user
                // 同步保存到localStorage
                localStorage.setItem('user', JSON.stringify(payload.user))
            }
        )

        // 你也可以根据需要，对其他接口做缓存失效、清理之类的处理
        builder.addMatcher(
            authApi.endpoints.getProfile.matchFulfilled,
            (state, { payload }) => { 
                state.profile = payload
                // 如果Redux中没有user，但profile有值，说明是从cookie恢复的
                if (!state.user && payload) {
                    state.user = payload
                    localStorage.setItem('user', JSON.stringify(payload))
                }
            }
        )
    },
})

export const { logoutLocal, setUser, loginSuccess } = authSlice.actions;
export default authSlice.reducer
