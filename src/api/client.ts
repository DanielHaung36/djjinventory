import axios from 'axios'

// úaxios‹
export const api = axios.create({
  baseURL: 'https://localhost:8080/api', // GoïAPI0@
  timeout: 10000,
  withCredentials: true, // /Cookie¤Á
  headers: {
    'Content-Type': 'application/json',
  },
})

// ÷Bæ*h
api.interceptors.request.use(
  (config) => {
    // ïå(ÙÌû ¤Átoken
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Í”æ*h
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // (ï
    if (error.response?.status === 401) {
      // *¤ÁïåÍš0{Uu
      console.warn('Authentication required')
    }
    return Promise.reject(error)
  }
)

export default api