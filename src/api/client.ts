import axios from 'axios'

// 创建axios实例
export const api = axios.create({
  baseURL: '/api', // 使用相对路径，通过Vite代理转发
  timeout: 10000,
  withCredentials: true, // 允许发送Cookie
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 临时的认证处理 - 从localStorage获取token
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // 如果没有token，设置一个临时的默认认证
    if (!token) {
      // 临时解决方案：设置一个默认的用户ID和地区ID
      config.headers['X-User-ID'] = '1'
      config.headers['X-Region-ID'] = '1'  // 添加默认地区ID
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // 错误处理
    if (error.response?.status === 401) {
      // 处理未授权错误，重定向到登录页
      console.warn('Authentication required')
    }
    return Promise.reject(error)
  }
)

export default api