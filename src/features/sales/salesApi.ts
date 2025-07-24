import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { SalesOrder, OrderStatus } from './types/sales-order'

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

// 审批相关接口
export interface ApprovalRequest {
  action: string
  comments?: string
  documents?: string[]
}

export interface RejectRequest {
  action: string
  reason: string
  comments?: string
}

export interface DocumentUploadData {
  orderId: number
  documentType: string
  notes?: string
}

export const salesApi = createApi({
  reducerPath: 'salesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers) => {
      // Add auth token if available
      const token = localStorage.getItem('auth_token')
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      } else {
        // 临时的默认认证
        headers.set('X-User-ID', '1')
        headers.set('X-Region-ID', '1')
      }
      return headers
    },
  }),
  tagTypes: ['Order', 'OrderDocument', 'ApprovalHistory'],
  endpoints: (builder) => ({
    // 获取订单列表
    getOrders: builder.query<OrderListResponse, OrderQueryParams>({
      query: (params = {}) => ({
        url: 'orders',
        params,
      }),
      transformResponse: (response: any) => {
        console.log('Raw orders response:', response)
        
        if (response.data) {
          return response
        }
        
        return {
          data: Array.isArray(response) ? response : [],
          total: Array.isArray(response) ? response.length : 0,
          page: params.page || 1,
          limit: params.limit || 10
        }
      },
      providesTags: ['Order'],
    }),

    // 根据状态获取订单列表
    getOrdersByStatus: builder.query<OrderListResponse, { status: string; page?: number; limit?: number }>({
      query: ({ status, page = 1, limit = 10 }) => ({
        url: `orders/status/${status}`,
        params: { page, limit },
      }),
      transformResponse: (response: any) => {
        if (response.data) {
          return response
        }
        
        return {
          data: Array.isArray(response) ? response : [],
          total: Array.isArray(response) ? response.length : 0,
          page: 1,
          limit: 10
        }
      },
      providesTags: ['Order'],
    }),

    // 获取订单详情
    getOrderById: builder.query<{ data: SalesOrder }, number>({
      query: (id) => `orders/${id}`,
      providesTags: (result, error, id) => [{ type: 'Order', id }],
    }),

    // 根据QuoteID获取订单
    getOrderByQuoteId: builder.query<{ data: SalesOrder }, number>({
      query: (quoteId) => `orders/by-quote/${quoteId}`,
      providesTags: ['Order'],
    }),

    // 根据订单编号获取订单
    getOrderByNumber: builder.query<{ data: SalesOrder }, string>({
      query: (orderNumber) => `orders/by-number/${orderNumber}`,
      providesTags: ['Order'],
    }),

    // 创建订单
    createOrder: builder.mutation<{ data: SalesOrder }, CreateOrderRequest>({
      query: (orderData) => ({
        url: 'orders',
        method: 'POST',
        body: orderData,
      }),
      invalidatesTags: ['Order'],
    }),

    // 报价转订单
    convertQuoteToOrder: builder.mutation<{ data: SalesOrder }, ConvertQuoteRequest>({
      query: (data) => ({
        url: 'orders/convert-quote',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Order'],
    }),

    // 更新订单状态
    updateOrderStatus: builder.mutation<{ message: string }, { id: number; status: OrderStatus; note?: string }>({
      query: ({ id, status, note }) => ({
        url: `orders/${id}/status`,
        method: 'PUT',
        body: { status, note },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Order', id }, 'Order'],
    }),

    // 处理定金支付
    processDepositPayment: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `orders/${id}/deposit-payment`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Order', id }, 'Order'],
    }),

    // 处理尾款支付
    processFinalPayment: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `orders/${id}/final-payment`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Order', id }, 'Order'],
    }),

    // PD检验完成
    processPDComplete: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `orders/${id}/pd-complete`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Order', id }, 'Order'],
    }),

    // 处理发货
    processShipment: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `orders/${id}/ship`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Order', id }, 'Order'],
    }),

    // 标记为已送达
    processDelivery: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `orders/${id}/deliver`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Order', id }, 'Order'],
    }),

    // 关闭订单
    closeOrder: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `orders/${id}/close`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Order', id }, 'Order'],
    }),

    // 取消订单
    cancelOrder: builder.mutation<{ message: string }, { id: number; reason: string }>({
      query: ({ id, reason }) => ({
        url: `orders/${id}/cancel`,
        method: 'PUT',
        body: { reason },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Order', id }, 'Order'],
    }),

    // 获取订单统计
    getOrderStats: builder.query<{ data: Record<string, number> }, void>({
      query: () => 'orders/stats',
      providesTags: ['Order'],
    }),

    // 上传订单文档
    uploadOrderDocuments: builder.mutation<{ message: string; documents: any[] }, FormData>({
      query: (formData) => ({
        url: 'orders/upload-documents',
        method: 'POST',
        body: formData,
        formData: true,
      }),
      invalidatesTags: ['Order', 'OrderDocument'],
    }),

    // 获取订单文档列表
    getOrderDocuments: builder.query<{ data: any[] }, number>({
      query: (orderId) => `orders/${orderId}/documents`,
      providesTags: (result, error, orderId) => [
        { type: 'OrderDocument', id: orderId },
        'OrderDocument',
      ],
    }),

    // 删除订单文档
    deleteOrderDocument: builder.mutation<{ message: string }, number>({
      query: (documentId) => ({
        url: `orders/documents/${documentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['OrderDocument'],
    }),

    // 审批订单操作
    approveOrderAction: builder.mutation<{ message: string }, { id: number } & ApprovalRequest>({
      query: ({ id, ...body }) => ({
        url: `orders/${id}/approve`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Order', id },
        { type: 'ApprovalHistory', id },
        'Order',
      ],
    }),

    // 拒绝订单操作
    rejectOrderAction: builder.mutation<{ message: string }, { id: number } & RejectRequest>({
      query: ({ id, ...body }) => ({
        url: `orders/${id}/reject`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Order', id },
        { type: 'ApprovalHistory', id },
        'Order',
      ],
    }),

    // 获取订单审批历史
    getOrderApprovalHistory: builder.query<{ data: any[]; total: number }, number>({
      query: (id) => `orders/${id}/approval-history`,
      providesTags: (result, error, id) => [{ type: 'ApprovalHistory', id }],
    }),

    // 生成并下载picking list PDF
    downloadPickingListPDF: builder.mutation<Blob, number>({
      query: (orderId) => ({
        url: `orders/${orderId}/picking-pdf`,
        method: 'GET',
        responseHandler: async (response) => {
          return await response.blob()
        },
      }),
      transformResponse: (response: Blob) => response,
    }),
  }),
})

export const {
  useGetOrdersQuery,
  useGetOrdersByStatusQuery,
  useGetOrderByIdQuery,
  useGetOrderByQuoteIdQuery,
  useGetOrderByNumberQuery,
  useCreateOrderMutation,
  useConvertQuoteToOrderMutation,
  useUpdateOrderStatusMutation,
  useProcessDepositPaymentMutation,
  useProcessFinalPaymentMutation,
  useProcessPDCompleteMutation,
  useProcessShipmentMutation,
  useProcessDeliveryMutation,
  useCloseOrderMutation,
  useCancelOrderMutation,
  useGetOrderStatsQuery,
  useUploadOrderDocumentsMutation,
  useGetOrderDocumentsQuery,
  useDeleteOrderDocumentMutation,
  useApproveOrderActionMutation,
  useRejectOrderActionMutation,
  useGetOrderApprovalHistoryQuery,
  useDownloadPickingListPDFMutation,
} = salesApi