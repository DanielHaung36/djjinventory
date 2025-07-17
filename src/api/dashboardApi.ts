import { api } from './api'

export interface DashboardStats {
  pending_quotes: number
  active_orders: number
  monthly_sales: string
  active_users: number
  pending_quotes_text: string
  active_orders_text: string
  monthly_sales_text: string
  active_users_text: string
}

export interface DashboardActivity {
  id: number
  type: string
  message: string
  time: string
  icon: string
  color: string
  bg_color: string
}

export interface DashboardQuickAction {
  title: string
  description: string
  href: string
  icon: string
  color: string
  bg_color: string
  permission: string
}

export interface DashboardResponse {
  stats: DashboardStats
  activities: DashboardActivity[]
  quick_actions: DashboardQuickAction[]
  timestamp: string
}

export const dashboardApi = {
  // 获取完整的看板数据
  async getDashboardData(): Promise<DashboardResponse> {
    const response = await api.get('/dashboard')
    return response.data
  },

  // 获取统计数据
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get('/dashboard/stats')
    return response.data
  },

  // 获取最近活动
  async getRecentActivities(limit = 10): Promise<DashboardActivity[]> {
    const response = await api.get(`/dashboard/activities?limit=${limit}`)
    return response.data
  },

  // 获取快速操作
  async getQuickActions(): Promise<DashboardQuickAction[]> {
    const response = await api.get('/dashboard/quick-actions')
    return response.data
  },

  // 刷新看板数据
  async refreshDashboard(): Promise<void> {
    await api.post('/dashboard/refresh')
  },

  // 健康检查
  async getHealthCheck(): Promise<any> {
    const response = await api.get('/dashboard/health')
    return response.data
  }
}