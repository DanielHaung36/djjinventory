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

const initialState: AuthState = { token: null, user: null, profile: null };


const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        /** 手动登出，清空 state **/
        logoutLocal(state) {
            state.token = null
            state.user  = null
            state.profile = null
        },
        setUser(state, action: PayloadAction<User>) {
            state.user = action.payload
        },
        // 专门用于处理登录的action，确保完全替换用户状态
        loginSuccess(state, action: PayloadAction<LoginResponse>) {
            state.token = action.payload.token
            state.user = action.payload.user
            state.profile = null
        },
    },
    extraReducers: (builder) => {
        // —— 当 login mutation 成功时，把返回的 token/user 存进去 ——
        // 总是更新状态，确保数据一致性
        builder.addMatcher(
            authApi.endpoints.login.matchFulfilled,
            (state, { payload }: PayloadAction<LoginResponse>) => {
                console.log('Login API succeeded:', payload);
                // ✅ 总是更新状态，不要有条件判断，确保完全替换旧状态
                state.token = payload.token
                state.user  = payload.user
                state.profile = null // 清理旧的profile数据
                console.log('authSlice: 状态已更新至新用户:', payload.user?.email);
            }
        )
        // —— 当 register mutation 成功时，同样存 token/user ——
        builder.addMatcher(
            authApi.endpoints.register.matchFulfilled,
            (state, { payload }: PayloadAction<RegisterResponse>) => {
                // ✅ 清理旧状态并设置新状态
                state.token = payload.token
                state.user = payload.user
                state.profile = null
                console.log('authSlice: 注册成功，状态已更新:', payload.user?.email);
            }
        )

        // 处理Cookie验证成功的情况
        builder.addMatcher(
            authApi.endpoints.getProfile.matchFulfilled,
            (state, { payload }) => { 
                state.profile = payload
                // 如果Redux中没有user，但profile有值，说明是从cookie恢复的
                if (!state.user && payload) {
                    state.user = payload
                    console.log('authSlice: 从Cookie恢复用户状态:', payload.email);
                } else if (state.user && payload && state.user.id !== payload.id) {
                    // ✅ 如果Cookie中的用户和Redux中的用户不匹配，更新为Cookie中的用户
                    console.log('authSlice: 检测到用户不匹配，更新状态:', { 
                        redux: state.user.id, 
                        cookie: payload.id 
                    });
                    state.user = payload
                }
            }
        )
    },
})

export const { logoutLocal, setUser, loginSuccess } = authSlice.actions;
export default authSlice.reducer
