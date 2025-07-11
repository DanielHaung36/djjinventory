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
    prepareHeaders: (headers, { getState }) => {
      // 添加认证token
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      headers.set('content-type', 'application/json');
      return headers;
    },
  }),
 tagTypes: ['Inventory', 'Stock', 'Reservation', 'Transaction', 'Region'],
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
} = inventoryApi;