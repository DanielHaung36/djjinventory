import { api } from './client'
import { SalesOrder, OrderStatus } from '../features/sales/types/sales-order'

// Order API 服务
export const orderApi = {
  // 获取订单列表
  async getOrders(page = 1, limit = 10): Promise<{
    data: SalesOrder[]
    total: number
    page: number
    limit: number
  }> {
    const response = await api.get('orders', {
      params: { page, limit }
    })
    return response.data
  },

  // 根据状态获取订单列表
  async getOrdersByStatus(status: string, page = 1, limit = 10): Promise<{
    data: SalesOrder[]
    total: number
    page: number
    limit: number
    status: string
  }> {
    const response = await api.get(`orders/status/${status}`, {
      params: { page, limit }
    })
    return response.data
  },

  // 获取订单详情
  async getOrderById(id: number): Promise<SalesOrder> {
    const response = await api.get(`orders/${id}`)
    return response.data
  },

  // 根据QuoteID获取订单
  async getOrderByQuoteId(quoteId: number): Promise<SalesOrder> {
    const response = await api.get(`orders/by-quote/${quoteId}`)
    return response.data
  },

  // 更新订单状态
  async updateOrderStatus(id: number, status: OrderStatus, note?: string): Promise<SalesOrder> {
    const response = await api.put(`orders/${id}/status`, { status, note })
    return response.data
  },

  // 处理定金支付
  async processDepositPayment(id: number): Promise<SalesOrder> {
    const response = await api.put(`orders/${id}/deposit-paid`)
    return response.data
  },

  // 处理尾款支付
  async processFinalPayment(id: number): Promise<SalesOrder> {
    const response = await api.put(`orders/${id}/final-paid`)
    return response.data
  },

  // PD检验完成
  async processPDComplete(id: number): Promise<SalesOrder> {
    const response = await api.put(`orders/${id}/pd-complete`)
    return response.data
  },

  // 处理发货
  async processShipment(id: number): Promise<SalesOrder> {
    const response = await api.put(`orders/${id}/ship`)
    return response.data
  },

  // 处理配送完成
  async processDelivery(id: number): Promise<SalesOrder> {
    const response = await api.put(`orders/${id}/deliver`)
    return response.data
  },

  // 取消订单
  async cancelOrder(id: number, reason: string): Promise<SalesOrder> {
    const response = await api.put(`orders/${id}/cancel`, { reason })
    return response.data
  }
}