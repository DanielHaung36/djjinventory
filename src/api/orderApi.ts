import { api } from './client'
import type { SalesOrder, OrderStatus } from '../features/sales/types/sales-order'

// 订单查询参数接口
export interface OrderQueryParams {
  page?: number
  limit?: number
  status?: string
  customer_id?: number
  store_id?: number
  sales_rep_id?: number
  date_from?: string
  date_to?: string
}

// 订单列表响应接口
export interface OrderListResponse {
  data: SalesOrder[]
  total: number
  page: number
  limit: number
}

// 创建订单项接口
export interface CreateOrderItem {
  product_id: number
  quantity: number
  unit_price: number
}

// 创建订单接口
export interface CreateOrderRequest {
  quote_id?: number
  store_id: number
  customer_id: number
  sales_rep_id: number
  shipping_address: string
  currency?: string
  items: CreateOrderItem[]
  deposit_amount?: number
  deposit_proof_url?: string
  note?: string
}

// 报价转订单接口
export interface ConvertQuoteRequest {
  quote_id: number
  deposit_amount?: number
  deposit_proof_url?: string
  note?: string
}

// Order API 服务
export const orderApi = {
  // 获取订单列表
  async getOrders(params: OrderQueryParams = {}): Promise<OrderListResponse> {
    const response = await api.get('orders', { params })
    console.log('Raw orders response:', response.data) // 调试日志
    
    // 后端可能返回 {message, data} 格式，需要适配
    if (response.data.data) {
      return response.data
    }
    
    // 如果直接返回数组，包装成预期格式
    return {
      data: Array.isArray(response.data) ? response.data : [],
      total: Array.isArray(response.data) ? response.data.length : 0,
      page: params.page || 1,
      limit: params.limit || 10
    }
  },

  // 根据状态获取订单列表
  async getOrdersByStatus(status: string, page = 1, limit = 10): Promise<OrderListResponse> {
    const response = await api.get(`orders/status/${status}`, {
      params: { page, limit }
    })
    console.log('Raw orders by status response:', response.data) // 调试日志
    
    // 后端可能返回 {message, data} 格式，需要适配
    if (response.data.data) {
      return response.data
    }
    
    // 如果直接返回数组，包装成预期格式
    return {
      data: Array.isArray(response.data) ? response.data : [],
      total: Array.isArray(response.data) ? response.data.length : 0,
      page,
      limit
    }
  },

  // 获取订单详情
  async getOrderById(id: number): Promise<{ data: SalesOrder }> {
    const response = await api.get(`orders/${id}`)
    return response.data
  },

  // 根据QuoteID获取订单
  async getOrderByQuoteId(quoteId: number): Promise<{ data: SalesOrder }> {
    const response = await api.get(`orders/by-quote/${quoteId}`)
    return response.data
  },

  // 根据订单编号获取订单
  async getOrderByNumber(orderNumber: string): Promise<{ data: SalesOrder }> {
    const response = await api.get(`orders/by-number/${orderNumber}`)
    return response.data
  },

  // 创建订单
  async createOrder(orderData: CreateOrderRequest): Promise<{ data: SalesOrder }> {
    const response = await api.post('orders', orderData)
    return response.data
  },

  // 报价转订单
  async convertQuoteToOrder(data: ConvertQuoteRequest): Promise<{ data: SalesOrder }> {
    const response = await api.post('orders/convert-quote', data)
    return response.data
  },

  // 更新订单状态
  async updateOrderStatus(id: number, status: OrderStatus, note?: string): Promise<{ message: string }> {
    const response = await api.put(`orders/${id}/status`, { status, note })
    return response.data
  },

  // 处理定金支付
  async processDepositPayment(id: number): Promise<{ message: string }> {
    const response = await api.put(`orders/${id}/deposit-payment`)
    return response.data
  },

  // 处理尾款支付
  async processFinalPayment(id: number): Promise<{ message: string }> {
    const response = await api.put(`orders/${id}/final-payment`)
    return response.data
  },

  // PD检验完成
  async processPDComplete(id: number): Promise<{ message: string }> {
    const response = await api.put(`orders/${id}/pd-complete`)
    return response.data
  },

  // 处理发货
  async processShipment(id: number): Promise<{ message: string }> {
    const response = await api.put(`orders/${id}/ship`)
    return response.data
  },

  // 取消订单
  async cancelOrder(id: number, reason: string): Promise<{ message: string }> {
    const response = await api.put(`orders/${id}/cancel`, { reason })
    return response.data
  },

  // 获取订单统计
  async getOrderStats(): Promise<{ data: Record<string, number> }> {
    const response = await api.get('orders/stats')
    return response.data
  }
}