import { api } from './client'
import { SalesOrder } from '../features/sales/types/sales-order'

// Quote接口类型
export interface Quote {
  id: number
  storeId: number
  customerId: number
  salesRepId: number
  quoteNumber: string
  quoteDate: string
  currency: string
  subTotal: number
  gstTotal: number
  totalAmount: number
  requiresDeposit: boolean
  depositAmount: number
  remarks?: string
  warrantyNotes?: string
  status: 'pending' | 'approved' | 'rejected'
  convertedToOrder: boolean
  convertedAt?: string
  convertedBy?: number
  convertedOrderId?: number
  createdAt: string
  updatedAt: string
  items: QuoteItem[]
  // 关联对象
  store?: any
  customer?: any
  salesRepUser?: any
}

export interface QuoteItem {
  id: number
  quoteId: number
  productId: number
  warehouseId: number
  quantity: number
  unitPrice: number
  totalPrice: number
  description: string
  specifications?: string
}

// Quote API 服务
export const quoteApi = {
  // 获取已批准且未转换的Quotes（用于Sales页面）
  async getApprovedQuotes(page = 1, limit = 10): Promise<{
    data: Quote[]
    total: number
    page: number
    limit: number
  }> {
    const response = await api.get('quotes/approval/status/approved', {
      params: { page, limit }
    })
    return response.data
  },

  // 获取Quote详情
  async getQuoteById(id: number): Promise<Quote> {
    const response = await api.get(`quotes/${id}`)
    return response.data
  },

  // 将Quote转换为Order
  async convertQuoteToOrder(quoteId: number): Promise<SalesOrder> {
    const response = await api.post(`quotes/${quoteId}/convert-to-order`)
    return response.data
  },

  // 获取已转换的Quotes
  async getConvertedQuotes(page = 1, limit = 10): Promise<{
    data: Quote[]
    total: number
    page: number
    limit: number
  }> {
    // 这个API可能需要后端添加一个专门的端点
    const response = await api.get('quotes', {
      params: { 
        page, 
        limit,
        converted: true  // 过滤已转换的quotes
      }
    })
    return response.data
  }
}