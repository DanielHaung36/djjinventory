import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// —— 1. 定义请求/响应的 TypeScript 接口 ——

// 登录时传给后端的参数
export interface LoginPayload {
    email: string
    password: string
}

// src/features/auth/types.ts

/** 单个角色对象 */
export interface Role {
  /** 角色 ID */
  ID: number;
  /** 角色名称 */
  Name: string;
  /** 创建时间 ISO 字符串 */
  CreatedAt: string;
  /** 更新时间 ISO 字符串 */
  UpdatedAt: string;
  /** 该角色的所有权限列表，后端目前给 null 时可以定义为 null 或空数组 */
  Permissions: unknown[] | null;
}

/** 用户对象 */
export interface User {
  /** 用户主键 */
  id: number;
  /** 乐观锁版本号 */
  version: number;
  /** 登录名 */
  username: string;
  /** 所属门店 ID */
  store_id: number;
  /** 邮箱 */
  email: string;
  /** 是否已删除 */
  is_deleted: boolean;
  /** 创建时间 ISO 字符串 */
  created_at: string;
  /** 更新时间 ISO 字符串 */
  updated_at: string;
  /** 该用户所属的角色列表 */
  roles: Role[];
  /** 头像 URL */
  avatar_url: string;
}


// 后端返回的数据结构
export interface LoginResponse {
    token: string
    user: User
}

// 注册请求体
export interface RegisterPayload {
    name: string
    email: string
    password: string
    role?: string     // 可选，后端若不允许前端指定角色可以省略
}

// 注册返回，和登录接口一样
export interface RegisterResponse {
    token: string
    user: User
}

// 请求发送“重置密码邮件”请求体
export interface RequestPasswordResetPayload {
    email: string
}

// 后端会返回一个提示消息
export interface RequestPasswordResetResponse {
    message: string
}

// 真正重置密码时的请求体（带后端邮件里的 token）
export interface ResetPasswordPayload {
    token: string
    newPassword: string
}

// 重置密码也只是返回一个提示
export interface ResetPasswordResponse {
    message: string
}



// —— 2. 创建一个 RTK Query 的 Api Slice ——
//    这里把所有和「认证」相关的 HTTP 接口都放在同一个 createApi 中
console.log( import.meta.env.VITE_API_URL);

export const authApi = createApi({
    // 存放在 Redux state 里的 key，默认 'authApi'
    reducerPath: 'authApi', 

    // baseQuery 用来定义底层如何发请求，这里用内置的 fetchBaseQuery（基于 window.fetch）
    baseQuery: fetchBaseQuery({
        // API 根地址：所有 endpoint 都会拼接到这个 URL 后面
        // 这个值来自于环境变量（下文会说明）
        baseUrl: import.meta.env.VITE_API_URL,
        credentials: 'include',
        // prepareHeaders 用来在每个请求的 Header 里自动加上 token
        // prepareHeaders: (headers, { getState }) => {
        //     // 从 Redux state 里读出 token
        //     const token = (getState() as any).auth.token
        //     if (token) {
        //         // 如果有 token，就设置 Authorization：Bearer <token>
        //         headers.set('Authorization', `Bearer ${token}`)
        //     }
        //     return headers
        // },
        fetchFn: async (input, init) => {
            console.log('🔐 [Auth API] Request:', {
                url: input,
                method: init?.method || 'GET',
                headers: init?.headers,
                body: init?.body
            });
            
            const response = await fetch(input, init);
            const clonedResponse = response.clone();
            
            try {
                const data = await clonedResponse.json();
                console.log('📨 [Auth API] Response:', {
                    url: input,
                    status: response.status,
                    statusText: response.statusText,
                    data
                });
            } catch (error) {
                console.log('📨 [Auth API] Response (non-JSON):', {
                    url: input,
                    status: response.status,
                    statusText: response.statusText,
                    error: error.message
                });
            }
            
            return response;
        },
    }),

    // endpoints：在这里一一声明所有的接口
    endpoints: (builder) => ({
        // 2.1 定义一个 login mutation（POST /auth/login）
        login: builder.mutation<LoginResponse, LoginPayload>({
            // query 可以返回一个对象，指定 url, method, body 等
            query: (credentials) => ({
                url: '/auth/login',   // 完整请求 URL: `${baseUrl}/auth/login`
                method: 'POST',       // HTTP 方法
                body: credentials,    // 请求体：{ email, password }
            }),
        }),
        // —— 注册 ——
        register: builder.mutation<RegisterResponse, RegisterPayload>({
            query: (data) => ({
                url: '/auth/register',
                method: 'POST',
                body: data,
            }),
        }),
        logout: builder.mutation<void, void>({
            query: () => ({
                url: '/auth/logout',
                method: 'POST',
                // 后端在此清 Cookie
            }),
        }),
        getProfile: builder.query<User, void>({
            query: () => '/auth/me',     // 也走 Cookie 验证，返回当前 user
        }),
        // —— 发送重置密码邮件 ——
        requestPasswordReset: builder.mutation<
            RequestPasswordResetResponse,
            RequestPasswordResetPayload
        >({
            query: (data) => ({
                url: '/auth/password/forgot',
                method: 'POST',
                body: data,
            }),
        }),
        resetPassword: builder.mutation<
            ResetPasswordResponse,
            ResetPasswordPayload
        >({
            query: (data) => ({
                url: '/auth/password/reset',
                method: 'POST',
                body: data,
            }),
        }),
        updateProfile: builder.mutation<User, Partial<User>>({
        query: (data) => ({
            url: "/auth/me",
            method: "PUT",
            body: data,
        }),
        }),
            uploadAvatar: builder.mutation<{ avatar_url: string }, File>({
      query: (file) => {
        const form = new FormData()
        form.append("avatar", file)
        return {
          url: "/auth/avatar",
          method: "POST",
          body: form,
        }
      },
    }),
     updateProfileAndAvatar: builder.mutation<
      User, // 后端返回的完整 User 对象
      {
        username?: string
        full_name?: string
        email?: string
        old_password?: string
        new_password?: string
        avatar?: File
      }
    >({
      query: ({ avatar, ...fields }) => {
        const form = new FormData()
        // 把所有非空文本字段都 append
        Object.entries(fields).forEach(([key, value]) => {
          if (value != null) {
            form.append(key, value as string)
          }
        })
        // 如果有文件，append 到 form
        if (avatar) {
          form.append('avatar', avatar)
        }
        return {
          url: '/auth/me',    // 对应后端 unified handler
          method: 'POST',
          body: form,
        }
      },
    }),
        // TODO: 以后可以按需继续添加，比如：
        // register: builder.mutation<RegisterResponse, RegisterPayload>(…),
        // refreshToken: builder.mutation<RefreshResponse, RefreshPayload>(…),
        // logout: builder.mutation<void, void>(…),
    }),
})

// 自动生成的 React hook，用于组件中发起 login 请求
export const {
    useLoginMutation,
    useRegisterMutation,
    useRequestPasswordResetMutation,
    useResetPasswordMutation,
    useLogoutMutation,
    useGetProfileQuery,
    useUpdateProfileMutation,
    useUploadAvatarMutation,
    useUpdateProfileAndAvatarMutation
} = authApi
