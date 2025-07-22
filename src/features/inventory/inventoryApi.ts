// src/features/inventory/inventoryApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../app/store';
import {
  type InventoryItem,
  type InventoryStats,
  type InventoryQueryParams,
  type PaginatedResponse,
  type ApiResponse,
} from './types';

// 入库详情相关类型
export interface InboundDetailData {
  id: number;
  referenceNumber: string;
  batchId?: number;
  date: string;
  operator: string;
  operatorId: number;
  region: string;
  regionId: number;
  warehouse: string;
  warehouseId: number;
  totalItems: number;
  totalQuantity: number;
  totalValue: number;
  notes?: string;
  status: string;
  createdAt: string;
  items: InboundItemDetail[];
  documents: InboundDocumentDetail[];
}

export interface InboundItemDetail {
  id: number;
  transactionId: number;
  productId: number;
  productName: string;
  djjCode: string;
  category: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  beforeStock: number;
  afterStock: number;
  vin?: string;
  serial?: string;
  remark?: string;
  createdAt: string;
}

export interface InboundDocumentDetail {
  id: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  filePath: string;
  fileUrl: string;
  documentType: string;
  description?: string;
  uploadedBy: string;
  uploadedAt: string;
  isImage: boolean;
  isPdf: boolean;
}

export interface InboundListParams {
  page?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
  status?: string;
  operator?: string;
  search?: string;
}

export interface InboundListResponse {
  items: InboundListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface InboundListItem {
  id: number;
  referenceNumber: string;
  batchId?: number;
  date: string;
  operator: string;
  region: string;
  warehouse: string;
  totalItems: number;
  totalQuantity: number;
  totalValue: number;
  status: string;
  documentCount: number;
  createdAt: string;
}

// 出库详情相关类型
export interface OutboundDetailData {
  id: number;
  referenceNumber: string;
  batchId?: number;
  date: string;
  operator: string;
  operatorId: number;
  region: string;
  regionId: number;
  warehouse: string;
  warehouseId: number;
  totalItems: number;
  totalQuantity: number;
  totalValue: number;
  notes?: string;
  status: string;
  createdAt: string;
  items: OutboundItemDetail[];
  documents: OutboundDocumentDetail[];
}

export interface OutboundItemDetail {
  id: number;
  transactionId: number;
  productId: number;
  productName: string;
  djjCode: string;
  category: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  beforeStock: number;
  afterStock: number;
  vin?: string;
  serial?: string;
  remark?: string;
  createdAt: string;
}

export interface OutboundDocumentDetail {
  id: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  filePath: string;
  fileUrl: string;
  documentType: string;
  description?: string;
  uploadedBy: string;
  uploadedAt: string;
  isImage: boolean;
  isPdf: boolean;
}

export interface OutboundListParams {
  page?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
  status?: string;
  operator?: string;
  search?: string;
}

export interface OutboundListResponse {
  items: OutboundListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface OutboundListItem {
  id: number;
  referenceNumber: string;
  batchId?: number;
  date: string;
  operator: string;
  region: string;
  warehouse: string;
  totalItems: number;
  totalQuantity: number;
  totalValue: number;
  status: string;
  documentCount: number;
  createdAt: string;
  customerName?: string;
}

import type { Region } from '../customer/types';
// ===== 类型定义 =====

// 对应后端的RegionInventoryResponse
export interface RegionInventoryResponse {
  product: ProductResponse;
  region_id: number;
  region_name: string;
  total_on_hand: number;
  total_reserved: number;
  total_available: number;
  warehouses: WarehouseStock[];
}

// 对应后端的ProductResponse
export interface ProductResponse {
  id: number;
  djjCode: string;
  nameCn: string;
  nameEn?: string;
  category: string;
  subcategory?: string;
  price: number;
  currency: string;
  status: string;
  unit?: string;
  specs?: string;
  weightKg?: number;
  createdAt: string;
  updatedAt: string;
}

// 对应后端的WarehouseStock
export interface WarehouseStock {
  warehouse_id: number;
  warehouse_name: string;
  on_hand: number;
  reserved: number;
  available: number;
  updated_at: string;
}

// 对应后端的RegionInventoryListItem
export interface RegionInventoryListItem {
  product_id: number;
  product_code: string;
  product_name: string;
  category: string;
  total_on_hand: number;
  total_reserved: number;
  total_available: number;
  low_stock: boolean;
}

// 对应后端的StockMovementRequest
export interface StockMovementRequest {
  product_id: number;
  warehouse_id: number;
  quantity: number;
  tx_type: 'IN' | 'OUT' | 'SALE' | 'RESERVE' | 'RELEASE';
  note?: string;
  order_id?: number;
  reservation_id?: number;
}

// 对应后端的InventoryOperationResponse
export interface InventoryOperationResponse {
  success: boolean;
  message: string;
  transaction_id?: number;
  updated_stock?: WarehouseStock;
}

// 对应后端的ReservationRequest
export interface ReservationRequest {
  product_id: number;
  warehouse_id: number;
  quantity: number;
  order_id?: number;
  quote_id?: number;
  reason?: string;
  expires_hours?: number;
  note?: string;
}

// 对应后端的ReservationDTO
export interface ReservationDTO {
  id: number;
  order_id: number;
  order_number: string;
  product_id: number;
  product_code: string;
  product_name: string;
  warehouse_id: number;
  warehouse_name: string;
  quantity: number;
  status: string;
  note?: string;
  reserved_by: string;
  reserved_at: string;
  deposit_paid_at?: string;
  final_paid_at?: string;
  pd_completed_at?: string;
  shipped_at?: string;
}

// 对应后端的LowStockAlert
export interface LowStockAlert {
  product_id: number;
  product_code: string;
  product_name: string;
  warehouse_id: number;
  warehouse_name: string;
  current_stock: number;
  reserved_stock: number;
  available_stock: number;
  threshold: number;
}

// 库存交易流水接口
export interface InventoryTransaction {
  id: number;
  inventory_id: number;
  tx_type: string;
  quantity: number;
  operator: string;
  note?: string;
  created_at: string;
  // 关联的产品和仓库信息
  product?: {
    id: number;
    djj_code: string;
    name_cn: string;
    category: string;
  };
  warehouse?: {
    id: number;
    name: string;
    location?: string;
  };
}

// 交易流水查询参数
export interface TransactionQueryParams {
  product_id?: number;
  warehouse_id?: number;
  tx_type?: string;
  start_date?: string;
  end_date?: string;
  operator?: string;
  page?: number;
  page_size?: number;
}

// ===== API定义 =====

export const inventoryApi = createApi({
  reducerPath: 'inventoryApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/inventory',
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
      // 添加认证token
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
        console.log('🔑 [Inventory API] Using token:', token.substring(0, 20) + '...');
      } else {
        console.log('🔑 [Inventory API] No token found, using cookies only');
      }
      headers.set('content-type', 'application/json');
      return headers;
    },
    fetchFn: async (input, init) => {
      const url = typeof input === 'string' ? input : input.url;
      console.log('🌐 [Inventory API] Request:', {
        url: url,
        method: init?.method || 'GET',
        headers: Object.fromEntries(new Headers(init?.headers).entries()),
        body: init?.body
      });
      
      const response = await fetch(input, init);
      const clonedResponse = response.clone();
      
      try {
        const data = await clonedResponse.json();
        console.log('📨 [Inventory API] Response:', {
          url: url,
          status: response.status,
          statusText: response.statusText,
          data
        });
      } catch (error) {
        console.log('📨 [Inventory API] Response (non-JSON):', {
          url: url,
          status: response.status,
          statusText: response.statusText,
          error: error.message
        });
      }
      
      return response;
    },
  }),
 tagTypes: ['Inventory', 'Stock', 'Reservation', 'Transaction', 'Region','TodayStats'],
  endpoints: (builder) => ({
    
    // ===== 库存查询接口 =====
    
    // 获取产品在当前地区的库存信息
getProductStock: builder.query<RegionInventoryResponse, number>({
  query: (productId) => `products/${productId}/stock`,
  transformResponse: (response: { success: boolean; data: RegionInventoryResponse }) => {
    // Return the inner `data` field
    return response.data
  },
  providesTags: (result, error, productId) => [
    { type: 'Stock', id: productId },
    { type: 'Inventory', id: 'LIST' }
  ],
}),
    
    // 获取当前地区所有产品的库存列表
    getRegionProductList: builder.query<RegionInventoryListItem[], void>({
      query: () => 'products',
      transformResponse: (response: any) => {
        console.log('API Response:', response);
        // 如果后端返回的是 {success: true, data: [...]} 格式
        if (response.success && response.data) {
          return response.data;
        }
        // 如果后端直接返回数组
        if (Array.isArray(response)) {
          return response;
        }
        // 其他情况返回空数组
        console.warn('Unexpected API response format:', response);
        return [];
      },
      providesTags: [{ type: 'Inventory', id: 'LIST' }],
    }),
    
    // 获取低库存预警
    getLowStockProducts: builder.query<LowStockAlert[], { threshold?: number }>({
      query: ({ threshold = 10 }) => `low-stock?threshold=${threshold}`,
      providesTags: [{ type: 'Inventory', id: 'LOW_STOCK' }],
    }),
    
    // ===== 基础库存操作接口 =====
    
    // 入库操作
    stockIn: builder.mutation<InventoryOperationResponse, StockMovementRequest>({
      query: (body) => ({
        url: 'stock-in',
        method: 'POST',
        body: { ...body, tx_type: 'IN' },
      }),
      invalidatesTags: [
        { type: 'Inventory', id: 'LIST' },
        { type: 'Stock', id: 'LIST' },
        { type: 'Transaction', id: 'LIST' }
      ],
    }),
    
    // 出库操作
    stockOut: builder.mutation<InventoryOperationResponse, StockMovementRequest>({
      query: (body) => ({
        url: 'stock-out', 
        method: 'POST',
        body: { ...body, tx_type: 'OUT' },
      }),
      invalidatesTags: [
        { type: 'Inventory', id: 'LIST' },
        { type: 'Stock', id: 'LIST' },
        { type: 'Transaction', id: 'LIST' }
      ],
    }),
    
    // 通用库存操作
    executeStockMovement: builder.mutation<InventoryOperationResponse, StockMovementRequest>({
      query: (body) => ({
        url: 'movements',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: 'Inventory', id: 'LIST' },
        { type: 'Stock', id: 'LIST' },
        { type: 'Transaction', id: 'LIST' }
      ],
    }),
    
    // ===== 业务流程接口 =====
    
    // 创建订单预留（下单时调用）
    createOrderReservation: builder.mutation<{success: boolean, message: string}, {orderId: number, request: ReservationRequest}>({
      query: ({ orderId, request }) => ({
        url: `orders/${orderId}/reserve`,
        method: 'POST',
        body: request,
      }),
      invalidatesTags: [
        { type: 'Reservation', id: 'LIST' },
        { type: 'Inventory', id: 'LIST' }
      ],
    }),
    
    // 定金支付确认
    processDepositPayment: builder.mutation<{success: boolean, message: string}, number>({
      query: (orderId) => ({
        url: `orders/${orderId}/deposit-paid`,
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'Reservation', id: 'LIST' }],
    }),
    
    // 货物到达入库
    processStockArrival: builder.mutation<InventoryOperationResponse, {orderId: number, request: StockMovementRequest}>({
      query: ({ orderId, request }) => ({
        url: `orders/${orderId}/stock-arrival`,
        method: 'POST',
        body: request,
      }),
      invalidatesTags: [
        { type: 'Inventory', id: 'LIST' },
        { type: 'Stock', id: 'LIST' }
      ],
    }),
    
    // 尾款支付确认
    processFinalPayment: builder.mutation<{success: boolean, message: string}, number>({
      query: (orderId) => ({
        url: `orders/${orderId}/final-paid`,
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'Reservation', id: 'LIST' }],
    }),
    
    // PD完成确认
    processPDComplete: builder.mutation<{success: boolean, message: string}, {orderId: number, documents?: string[]}>({
      query: ({ orderId, documents = [] }) => ({
        url: `orders/${orderId}/pd-complete`,
        method: 'POST',
        body: { documents },
      }),
      invalidatesTags: [{ type: 'Reservation', id: 'LIST' }],
    }),
    
    // 发货处理
    processShipment: builder.mutation<{success: boolean, message: string}, number>({
      query: (orderId) => ({
        url: `orders/${orderId}/ship`,
        method: 'POST',
      }),
      invalidatesTags: [
        { type: 'Reservation', id: 'LIST' },
        { type: 'Inventory', id: 'LIST' },
        { type: 'Stock', id: 'LIST' }
      ],
    }),
    
    // 取消订单预留
    cancelOrderReservation: builder.mutation<{success: boolean, message: string}, {orderId: number, reason?: string}>({
      query: ({ orderId, reason = '订单取消' }) => ({
        url: `orders/${orderId}/reserve`,
        method: 'DELETE',
        body: { reason },
      }),
      invalidatesTags: [
        { type: 'Reservation', id: 'LIST' },
        { type: 'Inventory', id: 'LIST' }
      ],
    }),
    
    // ===== 预留查询接口 =====
    
    // 获取订单预留详情
    getOrderReservations: builder.query<ReservationDTO[], number>({
      query: (orderId) => `orders/${orderId}/reservations`,
      providesTags: (result, error, orderId) => [
        { type: 'Reservation', id: orderId },
        { type: 'Reservation', id: 'LIST' }
      ],
    }),

    // ===== 库存交易流水接口 =====
    
    // 获取库存交易流水
    getInventoryTransactions: builder.query<{
      transactions: InventoryTransaction[];
      total: number;
      page: number;
      page_size: number;
    }, TransactionQueryParams>({
      query: (params) => ({
        url: 'transactions',
        params: {
          ...params,
          page: params.page || 1,
          page_size: params.page_size || 20,
        },
      }),
      providesTags: [{ type: 'Transaction', id: 'LIST' }],
    }),
    
    // 获取产品的交易历史
    getProductTransactions: builder.query<InventoryTransaction[], {
      productId: number;
      warehouseId?: number;
      page?: number;
      page_size?: number;
    }>({
      query: ({ productId, warehouseId, page = 1, page_size = 20 }) => {
        let url = `products/${productId}/transactions?page=${page}&page_size=${page_size}`
        if (warehouseId) {
          url += `&warehouse_id=${warehouseId}`
        }
        return url
      },
      providesTags: (result, error, { productId }) => [
        { type: 'Transaction', id: productId },
        { type: 'Transaction', id: 'LIST' }
      ],
    }),
    
    // 获取仓库的交易历史
    getWarehouseTransactions: builder.query<InventoryTransaction[], {
      warehouseId: number;
      page?: number;
      page_size?: number;
    }>({
      query: ({ warehouseId, page = 1, page_size = 20 }) => 
        `warehouses/${warehouseId}/transactions?page=${page}&page_size=${page_size}`,
      providesTags: (result, error, { warehouseId }) => [
        { type: 'Transaction', id: warehouseId },
        { type: 'Transaction', id: 'LIST' }
      ],
    }),
    
    // ===== 兼容现有交易组件的API接口 =====
    
    // 获取所有库存记录（用于组件的库存列表）
    getInventory: builder.query<InventoryDetail[], void>({
      query: () => 'list',
      providesTags: [{ type: 'Inventory', id: 'LIST' }],
    }),
    
    // 根据ID获取单个库存记录详情
    getInventoryById: builder.query<InventoryDetail, number>({
      query: (id) => `details/${id}`,
      providesTags: (result, error, id) => [
        { type: 'Inventory', id: id }
      ],
    }),
    
    // 删除库存交易记录
    deleteInventoryTransaction: builder.mutation<{success: boolean, message: string}, number>({
      query: (transactionId) => ({
        url: `transactions/${transactionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Transaction', id: 'LIST' }],
    }),

    // === 新增接口 - 与新的类型定义对齐 ===
    
    // 获取库存项目列表 (新)
    getInventoryItems: builder.query<
      ApiResponse<PaginatedResponse<InventoryItem>>,
      InventoryQueryParams
    >({
      query: (params) => {
        const searchParams = new URLSearchParams()
        
        // 添加查询参数
        if (params.page) searchParams.append('page', params.page.toString())
        if (params.page_size) searchParams.append('page_size', params.page_size.toString())
        if (params.region_id) searchParams.append('region_id', params.region_id.toString())
        if (params.warehouse_id) searchParams.append('warehouse_id', params.warehouse_id.toString())
        if (params.category) searchParams.append('category', params.category)
        if (params.status) searchParams.append('status', params.status)
        if (params.low_stock !== undefined) searchParams.append('low_stock', params.low_stock.toString())
        if (params.search) searchParams.append('search', params.search)
        if (params.product_code) searchParams.append('product_code', params.product_code)
        if (params.product_name) searchParams.append('product_name', params.product_name)
        if (params.sort_by) searchParams.append('sort_by', params.sort_by)
        if (params.sort_order) searchParams.append('sort_order', params.sort_order)
        if (params.date_from) searchParams.append('date_from', params.date_from)
        if (params.date_to) searchParams.append('date_to', params.date_to)
        if (params.quantity_min) searchParams.append('quantity_min', params.quantity_min.toString())
        if (params.quantity_max) searchParams.append('quantity_max', params.quantity_max.toString())
        if (params.value_min) searchParams.append('value_min', params.value_min.toString())
        if (params.value_max) searchParams.append('value_max', params.value_max.toString())

        return {
          url: `/items${searchParams.toString() ? `?${searchParams.toString()}` : ''}`,
        }
      },
      providesTags: ['Inventory'],
    }),

    // 获取库存统计 (新)
   getInventoryStats: builder.query<ApiResponse<PaginatedResponse<InventoryStats>>, InventoryQueryParams>({
      query: (params) => {
        const searchParams = new URLSearchParams()
        if (params.region_id) searchParams.append('region_id', params.region_id.toString())
        if (params.warehouse_id) searchParams.append('warehouse_id', params.warehouse_id.toString())
        if (params.date_from) searchParams.append('date_from', params.date_from)
        if (params.date_to) searchParams.append('date_to', params.date_to)

        return {
          url: `/stats${searchParams.toString() ? `?${searchParams.toString()}` : ''}`,
        }
      },
      providesTags: ['Inventory'],
    }),

    // 获取地区列表 (新) - 与现有region API对齐的接口
    getRegionsWithWarehouses: builder.query<ApiResponse<Region[]>, void>({
      query: () => '/regions',
      providesTags: ['Region'],
    }),


      scanIn: builder.mutation<{ success: boolean; inventory: RegionInventoryResponse }, { code: string; format?: string; quantity: number }>({
            query: ({ code, format, quantity }) => ({
                url: "/inventory/scan-in",
                method: "POST",
                body: { code, format, quantity },
            }),
            invalidatesTags: [{ type: "Inventory", id: "LIST" }],
        }),
        scanOut: builder.mutation<{ success: boolean; inventory: RegionInventoryResponse }, { code: string; format?: string; quantity: number }>({
            query: ({ code, format, quantity }) => ({
                url: "/inventory/scan-out",
                method: "POST",
                body: { code, format, quantity },
            }),
            invalidatesTags: [{ type: "Inventory", id: "LIST" }],
        }),

            getInventoryByCode: builder.query<RegionInventoryResponse, string>({
            query: (code) => `/inventory/by-code/${code}`,
            providesTags: (result, error, code) => [{ type: 'Inventory', id: code }],
            }),

        getTodayStats: builder.query<
      { inbound: number; outbound: number },
      void
    >({
      query: () => '/inventory/stats/today',
      // 如果你想用 RTK Query 缓存并且在某些操作后失效，可以打 tag，
      // 这里简单不打 tag 也没问题
      providesTags: [{ type: 'TodayStats', id: 'TODAY' }],
    }),

    // ===== 入库详情管理接口 =====
    
    // 获取入库详情
    getInboundDetail: builder.query<InboundDetailData, number>({
      query: (inboundId) => `inbound/detail/${inboundId}`,
      transformResponse: (response: { success: boolean; data: any }) => {
        const data = response.data;
        // 转换蛇形命名为驼峰命名
        return {
          id: data.id,
          referenceNumber: data.reference_number,
          batchId: data.batch_id,
          date: data.date,
          operator: data.operator,
          operatorId: data.operator_id,
          region: data.region,
          regionId: data.region_id,
          warehouse: data.warehouse,
          warehouseId: data.warehouse_id,
          totalItems: data.total_items,
          totalQuantity: data.total_quantity,
          totalValue: data.total_value,
          notes: data.notes,
          status: data.status,
          createdAt: data.created_at,
          items: data.items?.map((item: any) => ({
            id: item.id,
            transactionId: item.transaction_id,
            productId: item.product_id,
            productName: item.product_name,
            djjCode: item.djj_code,
            category: item.category,
            quantity: item.quantity,
            unitPrice: item.unit_price,
            totalValue: item.total_value,
            beforeStock: item.before_stock,
            afterStock: item.after_stock,
            vin: item.vin,
            serial: item.serial,
            remark: item.remark,
            createdAt: item.created_at
          })) || [],
          documents: data.documents?.map((doc: any) => {
            const fileName = doc.file_name || '';
            const fileType = doc.file_type || '';
            const extension = fileName.split('.').pop()?.toLowerCase() || '';
            
            // 基于文件扩展名和MIME类型检测
            const isImageFile = Boolean(doc.is_image) || 
              ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension) ||
              fileType.startsWith('image/');
            
            const isPdfFile = Boolean(doc.is_pdf) || 
              extension === 'pdf' || 
              fileType === 'application/pdf';
            
            return {
              id: doc.id,
              fileName: fileName,
              fileType: fileType,
              fileSize: doc.file_size,
              filePath: doc.file_path,
              fileUrl: doc.file_url,
              documentType: doc.document_type,
              description: doc.description,
              uploadedBy: doc.uploaded_by,
              uploadedAt: doc.uploaded_at,
              isImage: isImageFile,
              isPdf: isPdfFile
            };
          }) || []
        };
      },
      providesTags: (result, error, inboundId) => [
        { type: 'Transaction', id: inboundId },
        'Inventory'
      ],
    }),

    // 获取事务详情（通用）
    getTransactionDetail: builder.query<InboundDetailData, {id: number, type: 'IN' | 'OUT'}>({
      query: ({id, type}) => `transaction/detail/${id}?type=${type}`,
      transformResponse: (response: { success: boolean; data: any }) => {
        const data = response.data;
        // 转换蛇形命名为驼峰命名
        return {
          id: data.id,
          referenceNumber: data.reference_number,
          batchId: data.batch_id,
          date: data.date,
          operator: data.operator,
          operatorId: data.operator_id,
          region: data.region,
          regionId: data.region_id,
          warehouse: data.warehouse,
          warehouseId: data.warehouse_id,
          totalItems: data.total_items,
          totalQuantity: data.total_quantity,
          totalValue: data.total_value,
          notes: data.notes,
          status: data.status,
          createdAt: data.created_at,
          items: data.items?.map((item: any) => ({
            id: item.id,
            transactionId: item.transaction_id,
            productId: item.product_id,
            productName: item.product_name,
            djjCode: item.djj_code,
            category: item.category,
            quantity: item.quantity,
            unitPrice: item.unit_price,
            totalValue: item.total_value,
            beforeStock: item.before_stock,
            afterStock: item.after_stock,
            vin: item.vin,
            serial: item.serial,
            remark: item.remark,
            createdAt: item.created_at
          })) || [],
          documents: data.documents?.map((doc: any) => {
            const fileName = doc.file_name || '';
            const fileType = doc.file_type || '';
            const extension = fileName.split('.').pop()?.toLowerCase() || '';
            
            // 基于文件扩展名和MIME类型检测
            const isImageFile = Boolean(doc.is_image) || 
              ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension) ||
              fileType.startsWith('image/');
            
            const isPdfFile = Boolean(doc.is_pdf) || 
              extension === 'pdf' || 
              fileType === 'application/pdf';
              
            return {
              id: doc.id,
              fileName,
              fileType,
              fileSize: doc.file_size,
              filePath: doc.file_path,
              fileUrl: doc.file_url,
              documentType: doc.document_type,
              description: doc.description,
              uploadedBy: doc.uploaded_by,
              uploadedAt: doc.uploaded_at,
              isImage: isImageFile,
              isPdf: isPdfFile
            };
          }) || []
        };
      },
      providesTags: (result, error, {id}) => [
        { type: 'Transaction', id },
        'Inventory'
      ],
    }),

    // 获取入库列表
    getInboundList: builder.query<InboundListResponse, InboundListParams>({
      query: (params) => ({
        url: 'inbound/list',
        params: {
          page: params.page || 1,
          page_size: params.pageSize || 20,
          start_date: params.startDate,
          end_date: params.endDate,
          status: params.status,
          operator: params.operator,
          search: params.search,
        },
      }),
      transformResponse: (response: { success: boolean; data: any }) => {
        const data = response.data;
        return {
          items: data.items?.map((item: any) => ({
            id: item.id,
            referenceNumber: item.reference_number,
            batchId: item.batch_id,
            date: item.date,
            operator: item.operator,
            operatorId: item.operator_id,
            region: item.region,
            regionId: item.region_id,
            warehouse: item.warehouse,
            warehouseId: item.warehouse_id,
            totalItems: item.total_items,
            totalQuantity: item.total_quantity,
            totalValue: item.total_value,
            status: item.status,
            documentCount: item.document_count || 0,
            createdAt: item.created_at
          })) || [],
          total: data.total,
          page: data.page,
          pageSize: data.page_size,
          totalPages: data.total_pages
        };
      },
      providesTags: ['Transaction', 'Inventory'],
      
      // 🎯 使用customer模式的WebSocket实时更新
      async onCacheEntryAdded(
        _arg,
        {
          updateCachedData,
          cacheDataLoaded,
          cacheEntryRemoved
        }
      ) {
        // 等待初次请求完成
        await cacheDataLoaded
        
        // 建立ws连接到 /ws/inventory
        const wsUrl = `${import.meta.env.VITE_API_HOST.replace(/^https/, 'wss').replace(/^http/, 'ws')}/ws/inventory`
        const ws = new WebSocket(wsUrl)
        
        console.log('🔌 [InventoryAPI] 建立WebSocket连接:', wsUrl)
        
        ws.onopen = () => {
          console.log('✅ [InventoryAPI] WebSocket连接成功')
        }
        
        ws.onmessage = ({ data }) => {
          try {
            const msg = JSON.parse(data) as {
              event: string
              type: string
              data: {
                action: string
                referenceNumber: string
                totalQuantity: number
                totalValue: number
                timestamp: number
              }
            }
            
            console.log('📨 [InventoryAPI] 收到WebSocket消息:', msg)
            
            // 检查是否为库存更新消息
            if (msg.type === 'inventory_update' && msg.data?.action === 'inbound_created') {
              console.log('🔄 [InventoryAPI] 检测到入库创建，触发缓存失效')
              
              // 直接失效缓存，让组件重新查询
              updateCachedData(() => {
                // 返回undefined会触发重新查询
                return undefined
              })
            }
          } catch (error) {
            console.error('❌ [InventoryAPI] WebSocket消息处理失败:', error)
          }
        }
        
        ws.onerror = (error) => {
          console.error('❌ [InventoryAPI] WebSocket连接错误:', error)
        }
        
        ws.onclose = (event) => {
          console.log('🔌 [InventoryAPI] WebSocket连接断开:', event.code, event.reason)
        }
        
        // cache销毁时，断开ws
        await cacheEntryRemoved
        ws.close()
      }
    }),

    // ===== 出库详情管理接口 =====
    
    // 获取出库列表
    getOutboundList: builder.query<OutboundListResponse, OutboundListParams>({
      query: (params) => ({
        url: 'manual-outbound',
        params: {
          page: params.page || 1,
          size: params.pageSize || 20,
          start_date: params.startDate,
          end_date: params.endDate,
          status: params.status,
          operator: params.operator,
          search: params.search,
        },
      }),
      transformResponse: (response: { success: boolean; data: any }) => {
        // 后端返回的是 OutboundRecordListDto 数组，不是分页结构
        const dataArray = Array.isArray(response.data) ? response.data : [];
        return {
          items: dataArray.map((item: any) => ({
            id: item.first_transaction_id, // 使用真实的事务ID
            referenceNumber: item.reference_number,
            batchId: undefined,
            date: item.shipment_date || item.created_at?.split(' ')[0], // 使用shipment_date或从created_at提取日期
            operator: item.operator || 'Unknown',
            region: item.region_name || 'Unknown',
            warehouse: item.warehouse_name || 'Unknown',
            totalItems: item.item_count,
            totalQuantity: item.total_quantity,
            totalValue: item.total_value || 0,
            status: 'completed', // 默认状态
            documentCount: 0, // 后端暂未返回文档数量
            createdAt: item.created_at,
            customerName: item.customer_name // 添加客户名称字段
          })),
          total: dataArray.length,
          page: 1, // 后端暂未支持分页
          pageSize: dataArray.length,
          totalPages: 1
        };
      },
      providesTags: ['Transaction', 'Inventory'],
      
      // 🎯 使用相同模式的WebSocket实时更新
      async onCacheEntryAdded(
        _arg,
        {
          updateCachedData,
          cacheDataLoaded,
          cacheEntryRemoved
        }
      ) {
        // 等待初次请求完成
        await cacheDataLoaded
        
        // 建立ws连接到 /ws/inventory
        const wsUrl = `${import.meta.env.VITE_API_HOST.replace(/^https/, 'wss').replace(/^http/, 'ws')}/ws/inventory`
        const ws = new WebSocket(wsUrl)
        
        console.log('🔌 [InventoryAPI-Outbound] 建立WebSocket连接:', wsUrl)
        
        ws.onopen = () => {
          console.log('✅ [InventoryAPI-Outbound] WebSocket连接成功')
        }
        
        ws.onmessage = ({ data }) => {
          try {
            const msg = JSON.parse(data) as {
              event: string
              type: string
              data: {
                action: string
                referenceNumber: string
                totalQuantity: number
                totalValue: number
                timestamp: number
              }
            }
            
            console.log('📨 [InventoryAPI-Outbound] 收到WebSocket消息:', msg)
            
            // 检查是否为库存更新消息
            if (msg.type === 'inventory_update' && msg.data?.action === 'outbound_created') {
              console.log('🔄 [InventoryAPI-Outbound] 检测到出库创建，触发缓存失效')
              
              // 直接失效缓存，让组件重新查询
              updateCachedData(() => {
                // 返回undefined会触发重新查询
                return undefined
              })
            }
          } catch (error) {
            console.error('❌ [InventoryAPI-Outbound] WebSocket消息处理失败:', error)
          }
        }
        
        ws.onerror = (error) => {
          console.error('❌ [InventoryAPI-Outbound] WebSocket连接错误:', error)
        }
        
        ws.onclose = (event) => {
          console.log('🔌 [InventoryAPI-Outbound] WebSocket连接断开:', event.code, event.reason)
        }
        
        // cache销毁时，断开ws
        await cacheEntryRemoved
        ws.close()
      }
    }),

    // 预览文档
    previewDocument: builder.query<{
      documentId: number;
      fileName: string;
      fileType: string;
      fileSize: number;
      previewUrl: string;
      downloadUrl: string;
      isImage: boolean;
      isPdf: boolean;
    }, number>({
      query: (documentId) => `documents/${documentId}/preview`,
      transformResponse: (response: { success: boolean; data: any }) => {
        return response.data;
      },
    }),

    // ===== 手动出库表单提交接口 =====
    submitManualOutbound: builder.mutation<
      { success: boolean; message: string; referenceNumber: string },
      {
        regionId: number;
        warehouseId: number;
        referenceNumber: string;
        shipmentDate: string;
        customerName?: string;
        notes?: string;
        items: Array<{
          product_id: number;
          product_name: string;
          category: string;
          quantity: number;
          unit_price: number;
          notes?: string;
        }>;
        file_paths?: string[];
      }
    >({
      query: (data) => ({
        url: 'manual-outbound',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: { success: boolean; data: any; message: string }, _meta, arg) => {
        return {
          success: response.success,
          message: response.message || '出库成功',
          referenceNumber: response.data?.reference_number || arg.referenceNumber
        };
      },
      invalidatesTags: ['Transaction', 'Inventory'],
    }),
  }),
});

// 补充的类型定义（兼容现有组件）
export interface InventoryDetail {
  id: number;
  productID: string;
  warehouseID: number;
  warehouseName: string;
  partNumberCN: string;
  partNumberAU: string;
  barcode: string;
  description: string;
  descriptionChinese: string;
  warehouse: string;
  siteLocation: string;
  asset: string;
  customer: string;
  note: string;
  partGroup: string;
  partLife: string;
  oem: string;
  purchasePrice: number;
  unitPrice: number;
  actualQty: number;
  lockedQty: number;
  availableQty: number;
  operator: string;
  operationTime: string;
}

// 导出hooks供组件使用
export const {
  // 查询hooks
  useGetProductStockQuery,
  useGetRegionProductListQuery,
  useGetLowStockProductsQuery,
  useGetOrderReservationsQuery,
  
  // 基础操作hooks
  useStockInMutation,
  useStockOutMutation,
  useExecuteStockMovementMutation,
  
  // 业务流程hooks
  useCreateOrderReservationMutation,
  useProcessDepositPaymentMutation,
  useProcessStockArrivalMutation,
  useProcessFinalPaymentMutation,
  useProcessPDCompleteMutation,
  useProcessShipmentMutation,
  useCancelOrderReservationMutation,
  
  // 交易流水hooks
  useGetInventoryTransactionsQuery,
  useGetProductTransactionsQuery,
  useGetWarehouseTransactionsQuery,
  
  // 兼容现有组件的hooks
  useGetInventoryQuery,
  useGetInventoryByIdQuery,
  useDeleteInventoryTransactionMutation,
  
  // 新增的hooks - 与增强的类型定义对齐
  useGetInventoryItemsQuery,
  useGetInventoryStatsQuery,
  useGetRegionsWithWarehousesQuery,

  useScanInMutation,
  useScanOutMutation,
  useGetInventoryByCodeQuery,
  useGetTodayStatsQuery,

  // 入库详情管理hooks
  useGetInboundDetailQuery,
  useGetTransactionDetailQuery,
  useGetInboundListQuery,
  
  // 出库详情管理hooks
  useGetOutboundListQuery,
  useSubmitManualOutboundMutation,
  
  usePreviewDocumentQuery,
} = inventoryApi;