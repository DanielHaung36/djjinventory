// src/features/quotes/quotesApi.ts
// src/features/quotes/quotesApi.ts
import type { Quote, QuoteItem } from '@/lib/types'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
// Quote types
// export interface Quote {
//   id: number
//   quoteNumber: string
//   customer: {
//     id: number
//     name: string
//     abn?: string
//     contact: string
//     phone: string
//     email: string
//     address: string
//   }
//   items: QuoteItem[]
//   subTotal: number
//   gstTotal: number
//   totalAmount: number
//   currency: string
//   depositAmount: number
//   remarks?: string
//   warrantyNotes?: string
//   status: string
//   quoteDate: string
//   createdAt: string
//   updatedAt: string
//   salesRepUser?: {
//     id: number
//     username: string
//     email: string
//   }
//   store?: {
//     id: number
//     name: string
//   }
//   company?: {
//     id: number
//     name: string
//   }
// }

// export interface QuoteItem {
//   id: number
//   quoteId: number
//   productId?: number
//   product?: {
//     id: number
//     name: string
//     djjCode: string
//   }
//   description: string
//   detailDescription?: string
//   quantity: number
//   unit: string
//   unitPrice: number
//   discount: number
//   totalPrice: number
//   goodsNature: string
//   createdAt: string
// }

export interface CreateQuoteRequest {
  customer: {
    id?: number
    name: string
    abn?: string
    contact: string
    phone: string
    email: string
    storeId: number
    deliveryAddress: {
      line1: string
      line2?: string
      city?: string
      state?: string
      postcode?: string
      country?: string
    }
    billingAddress: {
      line1?: string
      line2?: string
      city?: string
      state?: string
      postcode?: string
      country?: string
    }
    sameAsDelivery: boolean
    // 保留兼容性
    address?: string
  }
  items: {
    productId?: number
    description: string
    detailDescription?: string
    unit: string
    quantity: number
    unitPrice: number
    discount: number
    goodsNature: string
  }[]
  depositAmount: number
  depositAttachments?: {
    url: string
  }[]
  remarks?: string
  warrantyNotes?: string
}

export interface QuoteListResponse {
  data: Quote[]
  total: number
  page: number
  limit: number
}

// 库存状态相关类型
export interface QuoteStockStatusResponse {
  quoteId: number
  quoteNumber: string
  storeId: number
  regionId: number
  overallStatus: 'available' | 'partial' | 'unavailable' | 'unknown'
  totalItems: number
  availableItems: number
  items: QuoteItemStockStatus[]
  checkedAt: string
}

export interface QuoteItemStockStatus {
  itemId: number
  productId?: number
  productCode: string
  productName: string
  description: string
  requestedQty: number
  unit: string
  availableQty: number
  status: 'available' | 'partial' | 'unavailable' | 'unknown'
  warehouseStocks: WarehouseStockInfo[]
}

export interface WarehouseStockInfo {
  warehouseId: number
  warehouseName: string
  availableQty: number
  reservedQty: number
  totalQty: number
  location: string
}

export interface QuoteApprovalHistoryResponse {
  id: number
  quoteId: number
  status: string
  reason: string
  userId: number
  userName: string
  createdAt: string
}

export interface QuoteDocument {
  id: number
  fileName: string
  fileType: string
  fileSize: number
  url: string
  uploadedBy: number
  uploadedAt: string
  refType: string
  refId: number
}

export interface DocumentPreviewResponse {
  id: number
  fileName: string
  fileType: string
  fileSize: number
  url: string
  previewUrl: string
  downloadUrl: string
  uploadedAt: string
  refType: string
  refId: number
}
export const quotesApi = createApi({
  reducerPath: 'quotesApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api', credentials: 'include' }),
  tagTypes: ['Quote', 'QuoteDocument'],
  endpoints: (builder) => ({
    // 列表
    getQuotes: builder.query<QuoteListResponse, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 10 } = {}) => ({ url: 'quotes', params: { page, limit } }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Quote' as const, id })),
              { type: 'Quote' as const, id: 'LIST' },
            ]
          : [{ type: 'Quote' as const, id: 'LIST' }],
    }),

    // 单条获取，映射字段到 UI 结构
    getQuoteById: builder.query<Quote, string>({
      query: (id) => `quotes/${id}`,
      transformResponse: (res: any) => ({
        id: res.id,
        quoteNumber: res.quoteNumber,
        customer: {
          id: res.Customer.id,
          name: res.Customer.name,
          abn: res.Customer.abn,
          contact: res.Customer.contact,
          phone: res.Customer.phone,
          email: res.Customer.email,
          address: res.Customer.address,
        },
        // 添加顶级字段映射以兼容详情页面
        phone: res.Customer.phone,
        email: res.Customer.email,
        customerABN: res.Customer.abn,
        billingAddress: res.Customer.billing_address_line1 ? {
          line1: res.Customer.billing_address_line1,
          line2: res.Customer.billing_address_line2,
          city: res.Customer.billing_city,
          state: res.Customer.billing_state,
          postcode: res.Customer.billing_postcode,
          country: res.Customer.billing_country,
        } : null,
        deliveryAddress: res.Customer.delivery_address_line1 ? {
          line1: res.Customer.delivery_address_line1,
          line2: res.Customer.delivery_address_line2,
          city: res.Customer.delivery_city,
          state: res.Customer.delivery_state,
          postcode: res.Customer.delivery_postcode,
          country: res.Customer.delivery_country,
        } : null,
        store: {
          id: res.store.id,
          name: res.store.name,
        },
        company: {
          id: res.company.id,
          name: res.company.name,
          code: res.company.code,
          abn: res.company.abn,
          phone: res.company.phone,
          email: res.company.email,
          website: res.company.website,
          address: res.company.address,
          bankDetails: {
            bankName: res.company.bank_name,
            bsb: res.company.bsb,
            accountNumber: res.company.account_number,
          },
        },
        salesRepUser: res.salesRepUser,
        items: res.items.map((item: any) => ({
          id: item.id,
          quoteId: item.quoteId,
          productId: item.productId,
          product: item.product ? {
            id: item.product.id,
            name: item.product.nameEn || item.product.nameCn,
            djjCode: item.product.djjCode,
            vinEngine: item.product.vinEngine,
            model: item.product.model,
            manufacturer: item.product.manufacturer,
            manufacturerCode: item.product.manufacturerCode,
            supplier: item.product.supplier,
            category: item.product.category,
            specs: item.product.specs,
            warranty: item.product.warranty,
            standards: item.product.standards,
            unit: item.product.unit,
            price: item.product.price,
            rrpPrice: item.product.rrpPrice,
            currency: item.product.currency,
            status: item.product.status,
            productType: item.product.productType,
            standardWarranty: item.product.standardWarranty,
            weightKg: item.product.weightKg,
            liftCapacityKg: item.product.liftCapacityKg,
            liftHeightMm: item.product.liftHeightMm,
            powerSource: item.product.powerSource,
            createdAt: item.product.createdAt,
            updatedAt: item.product.updatedAt,
          } : null,
          description: item.description,
          detailDescription: item.detailDescription,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
          discount: item.discount,
          totalPrice: item.totalPrice,
          goodsNature: item.goodsNature,
          createdAt: item.createdAt,
        })),
        quoteDate: res.quoteDate,
        amounts: {
          subTotal: res.subTotal,
          gstTotal: res.gstTotal,
          total: res.totalAmount,
          currency: res.currency,
        },
        depositAmount: res.depositAmount,
        remarks: [
          {
            general: res.remarks[0]?.general || '',
            warrantyAndSpecial: res.remarks[0]?.warrantyAndSpecial || '',
          },
        ],
        warrantyNotes: res.warrantyNotes,
        status: res.status,
        createdAt: res.createdAt,
        updatedAt: res.updatedAt,
        // 添加附件信息映射
        attachments: res.attachments ? res.attachments.map((attachment: any) => ({
          id: attachment.id,
          fileName: attachment.fileName,
          fileType: attachment.fileType,
          fileSize: attachment.fileSize,
          url: attachment.url,
          uploadedAt: attachment.uploadedAt,
          refType: attachment.refType,
          refId: attachment.refId,
        })) : [],
      }),
      providesTags: (_result, _error, id) => [{ type: 'Quote' as const, id }],
    }),

    createQuote: builder.mutation<Quote, CreateQuoteRequest>({
      query: (body) => ({ url: 'quotes', method: 'POST', body }),
      invalidatesTags: [{ type: 'Quote' as const, id: 'LIST' }],
    }),
    updateQuote: builder.mutation<Quote, { id: string; data: CreateQuoteRequest }>({
      query: ({ id, data }) => ({ url: `quotes/${id}`, method: 'PUT', body: data }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'Quote' as const, id },
        { type: 'Quote' as const, id: 'LIST' },
      ],
    }),
    deleteQuote: builder.mutation<void, string>({
      query: (id) => ({ url: `quotes/${id}`, method: 'DELETE' }),
      invalidatesTags: (_res, _err, id) => [
        { type: 'Quote' as const, id },
        { type: 'Quote' as const, id: 'LIST' },
      ],
    }),
    copyQuote: builder.mutation<Quote, string>({
      query: (id) => ({ url: `quotes/${id}/copy`, method: 'POST' }),
      invalidatesTags: [{ type: 'Quote' as const, id: 'LIST' }],
    }),
    generateQuotePdf: builder.mutation<void, string>({
      queryFn: async (id, _queryApi, _extraOptions, fetchWithBQ) => {
        try {
          const response = await fetchWithBQ({
            url: `quotes/${id}/pdf`,
            method: 'GET',
            responseHandler: (response) => response.blob()
          })
          
          if (response.error) {
            return { error: response.error }
          }
          
          const blob = response.data as Blob
          const url = URL.createObjectURL(blob)
          
          // 直接下载，不返回到Redux状态
          const link = document.createElement('a')
          link.href = url
          link.download = `quote-${id}.pdf`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
          
          return { data: undefined }
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: String(error) } }
        }
      },
    }),
    getQuoteStockStatus: builder.query<QuoteStockStatusResponse, string>({
      query: (id) => `quotes/${id}/stock-status`,
      providesTags: (_result, _error, id) => [{ type: 'Quote' as const, id: `${id}-stock` }],
    }),
    
    // 审批相关API
    getQuotesByStatus: builder.query<QuoteListResponse, { status: string; page?: number; limit?: number }>({
      query: ({ status, page = 1, limit = 10 }) => ({
        url: `quotes/approval/status/${status}`,
        params: { page, limit },
      }),
      providesTags: (result, _error, { status }) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Quote' as const, id })),
              { type: 'Quote' as const, id: `STATUS_${status}` },
            ]
          : [{ type: 'Quote' as const, id: `STATUS_${status}` }],
    }),
    
    updateQuoteStatus: builder.mutation<Quote, { id: string; status: string; reason?: string; userId?: number }>({
      query: ({ id, status, reason, userId }) => ({
        url: `quotes/approval/${id}/status`,
        method: 'PUT',
        body: { status, reason, userId },
      }),
      invalidatesTags: (_result, _error, { id, status }) => [
        { type: 'Quote' as const, id },
        { type: 'Quote' as const, id: 'LIST' },
        { type: 'Quote' as const, id: `STATUS_${status}` },
        { type: 'Quote' as const, id: 'STATUS_pending' },
        { type: 'Quote' as const, id: 'STATUS_approved' },
        { type: 'Quote' as const, id: 'STATUS_rejected' },
      ],
    }),
    
    getQuoteApprovalHistory: builder.query<QuoteApprovalHistoryResponse[], string>({
      query: (id) => `quotes/approval/${id}/history`,
      providesTags: (_result, _error, id) => [{ type: 'Quote' as const, id: `${id}-history` }],
    }),
    
    batchUpdateQuoteStatus: builder.mutation<{ message: string }, { quoteIds: string[]; status: string; reason?: string; userId?: number }>({
      query: ({ quoteIds, status, reason, userId }) => ({
        url: 'quotes/approval/batch/status',
        method: 'PUT',
        body: { quoteIds, status, reason, userId },
      }),
      invalidatesTags: [
        { type: 'Quote' as const, id: 'LIST' },
        { type: 'Quote' as const, id: 'STATUS_pending' },
        { type: 'Quote' as const, id: 'STATUS_approved' },
        { type: 'Quote' as const, id: 'STATUS_rejected' },
      ],
    }),
    
    // 文档相关API
    getQuoteDocuments: builder.query<QuoteDocument[], string>({
      query: (quoteId) => `quotes/${quoteId}/documents`,
      providesTags: (_result, _error, quoteId) => [
        { type: 'QuoteDocument' as const, id: `QUOTE_${quoteId}` },
      ],
      async onCacheEntryAdded(
        quoteId,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
      ) {
        await cacheDataLoaded
        
        const wsUrl = `${import.meta.env.VITE_API_HOST.replace(/^https/, 'wss').replace(/^http/, 'ws')}/ws/quotes`
        const ws = new WebSocket(wsUrl)
        
        ws.onmessage = ({ data }) => {
          try {
            const msg = JSON.parse(data)
            if (
              msg.type === 'quote_update' && 
              msg.data?.quoteId === parseInt(quoteId) &&
              (msg.data?.action === 'document_added' || msg.data?.action === 'document_deleted')
            ) {
              updateCachedData(() => undefined) // 触发重新查询
            }
          } catch (error) {
            console.error('WebSocket message parse error:', error)
          }
        }
        
        ws.onerror = (error) => {
          console.error('WebSocket error:', error)
        }
        
        await cacheEntryRemoved
        ws.close()
      },
    }),
    
    previewDocument: builder.query<DocumentPreviewResponse, string>({
      query: (docId) => `quotes/documents/${docId}/preview`,
    }),
    
    downloadDocument: builder.mutation<Blob, string>({
      query: (docId) => ({
        url: `quotes/documents/${docId}/download`,
        method: 'GET',
        responseHandler: (response) => response.blob(),
      }),
    }),
    
    deleteDocument: builder.mutation<{ message: string }, { docId: string; quoteId: string }>({
      query: ({ docId }) => ({
        url: `quotes/documents/${docId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { quoteId }) => [
        { type: 'QuoteDocument' as const, id: `QUOTE_${quoteId}` },
      ],
    }),
  }),
})

export const {
  useGetQuotesQuery,
  useGetQuoteByIdQuery,
  useCreateQuoteMutation,
  useUpdateQuoteMutation,
  useDeleteQuoteMutation,
  useCopyQuoteMutation,
  useGenerateQuotePdfMutation,
  useGetQuoteStockStatusQuery,
  
  // 审批相关hooks
  useGetQuotesByStatusQuery,
  useUpdateQuoteStatusMutation,
  useGetQuoteApprovalHistoryQuery,
  useBatchUpdateQuoteStatusMutation,
  
  // 文档相关hooks
  useGetQuoteDocumentsQuery,
  usePreviewDocumentQuery,
  useDownloadDocumentMutation,
  useDeleteDocumentMutation,
} = quotesApi
