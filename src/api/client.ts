import axios from 'axios'

// �axios��
export const api = axios.create({
  baseURL: 'https://localhost:8080/api', // Go�API0@
  timeout: 10000,
  withCredentials: true, // /Cookie��
  headers: {
    'Content-Type': 'application/json',
  },
})

// �B�*h
api.interceptors.request.use(
  (config) => {
    // ��(������token
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// ͔�*h
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // (�
    if (error.response?.status === 401) {
      // *����͚0{Uu
      console.warn('Authentication required')
    }
    return Promise.reject(error)
  }
)

export default api