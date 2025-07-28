import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// Base types for procurement API - 与后端Go struct完全对齐
export interface Supplier {
  id: number
  code: string
  name: string
  name_en?: string
  type: 'manufacturer' | 'distributor' | 'dealer' | 'other'
  status: string
  // 联系信息
  contact_person?: string
  phone?: string
  mobile?: string
  email?: string
  fax?: string
  website?: string
  // 地址信息
  country?: string
  state?: string
  city?: string
  address?: string
  postal_code?: string
  // 财务信息
  tax_id?: string
  bank_name?: string
  bank_account?: string
  payment_terms?: string
  credit_limit: number
  currency_code: string
  // 业务信息
  lead_time: number
  min_order_value: number
  rating: number
  notes?: string
  tags?: string
  created_at: string
  updated_at: string
}

export interface PurchaseOrderItem {
  id: number
  purchase_order_id: number
  product_id: number
  djj_code: string
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
  tax_rate: number
  tax_amount: number
  // 整机特有信息
  vin_number?: string
  engine_number?: string
  machine_serial?: string
  // 收货信息
  received_quantity: number
  received_date?: string
  received_by?: number
  received_notes?: string
  // 质检信息
  qc_passed?: boolean
  qc_date?: string
  qc_by?: number
  qc_notes?: string
  // 其他信息
  supplier_part_no?: string
  specifications?: string
  notes?: string
  warranty_months: number
  created_at: string
  updated_at: string
}

export interface PurchaseOrder {
  id: number
  order_number: string
  // 供应商信息
  supplier_id: number
  supplier_contact: string
  supplier_phone: string
  // 采购单状态
  status: 'draft' | 'consignment' | 'ordered' | 'received' | 'cancelled'
  payment_status: 'unpaid' | 'deposit_paid' | 'fully_paid'
  // 金额信息
  total_amount: number
  deposit_amount: number
  paid_amount: number
  balance_amount: number
  currency_code: string
  // 日期信息
  order_date: string
  expected_delivery?: string
  actual_delivery?: string
  final_payment_due?: string
  // 收货信息
  warehouse_id: number
  delivery_notes?: string
  // 审批信息
  requires_approval: boolean
  approved_by?: number
  approved_at?: string
  approval_notes?: string
  // 其他信息
  notes?: string
  tags?: string
  attachment_count: number
  // 关联信息
  supplier?: Supplier
  items: PurchaseOrderItem[]
  payments: PurchasePayment[]
  status_history?: PurchaseStatusChange[]
  // 操作信息
  created_by: number
  updated_by: number
  created_at: string
  updated_at: string
}

export interface PurchasePayment {
  id: number
  purchase_order_id: number
  // 付款信息
  payment_type: 'deposit' | 'partial' | 'final' | 'full' | 'refund'
  payment_method: 'bank_transfer' | 'cash' | 'check' | 'credit' | 'other'
  amount: number
  currency_code: string
  exchange_rate: number
  // 付款详情
  payment_date: string
  payment_number: string
  transaction_ref?: string
  bank_account?: string
  // 附件和凭证
  proof_url?: string
  attachment_name?: string
  attachment_path?: string
  // 审批信息
  requires_approval: boolean
  approved_by?: number
  approved_at?: string
  approval_notes?: string
  // 其他信息
  notes?: string
  is_confirmed: boolean
  confirmed_by?: number
  confirmed_at?: string
  // 操作信息
  created_by: number
  updated_by: number
  created_at: string
  updated_at: string
}

export interface PurchaseStatusChange {
  id: number
  purchaseOrderId: number
  fromStatus?: string
  toStatus: string
  fromPaymentStatus?: string
  toPaymentStatus?: string
  changeReason: string
  changedBy: number
  relatedPaymentId?: number
  createdAt: string
}

// API request/response types - 与后端service.CreatePurchaseOrderInput对齐
export interface CreatePurchaseOrderRequest {
  supplier_id: number
  supplier_contact: string
  supplier_phone: string
  warehouse_id: number
  order_date: string
  expected_delivery?: string
  final_payment_due?: string
  deposit_amount: number
  notes?: string
  items: {
    product_id: number
    quantity: number
    unit_price: number
    tax_rate: number
    vin_number?: string
    engine_number?: string
    machine_serial?: string
    supplier_part_no?: string
    specifications?: string
    notes?: string
    warranty_months: number
  }[]
  created_by: number
}

export interface UpdateOrderStatusRequest {
  status: PurchaseOrder['status']
  reason: string
}

export interface AddPaymentRequest {
  payment_type: PurchasePayment['payment_type']
  payment_method: PurchasePayment['payment_method']
  amount: number
  payment_date: string
  transaction_ref?: string
  bank_account?: string
  proof_url?: string
  notes?: string
  created_by: number
}

export interface GetPurchaseOrdersParams {
  offset?: number
  limit?: number
  status?: string
  supplier_id?: number
  warehouse_id?: number
  order_date_from?: string
  order_date_to?: string
  search?: string
}

export interface PurchaseOrdersResponse {
  orders: PurchaseOrder[]
  total: number
  offset: number
  limit: number
}

// RTK Query API slice
export const procurementApi = createApi({
  reducerPath: 'procurementApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    credentials: 'include',
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json')
      return headers
    },
  }),
  tagTypes: ['PurchaseOrder', 'Supplier', 'Payment'],
  endpoints: (builder) => ({
    // Purchase Orders
    getPurchaseOrders: builder.query<PurchaseOrdersResponse, GetPurchaseOrdersParams>({
      query: (params) => ({
        url: '/purchase-orders',
        params,
      }),
      providesTags: ['PurchaseOrder'],
    }),

    getPurchaseOrderById: builder.query<PurchaseOrder, number | string>({
      query: (id) => `/purchase-orders/${id}`,
      providesTags: (result, error, id) => [
        { type: 'PurchaseOrder', id },
        { type: 'PurchaseOrder', id: 'DETAIL' },
      ],
    }),

    createPurchaseOrder: builder.mutation<PurchaseOrder, CreatePurchaseOrderRequest>({
      query: (data) => ({
        url: '/purchase-orders',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['PurchaseOrder'],
    }),

    updateOrderStatus: builder.mutation<
      PurchaseOrder,
      { id: number | string; data: UpdateOrderStatusRequest }
    >({
      query: ({ id, data }) => ({
        url: `/purchase-orders/${id}/status`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'PurchaseOrder', id },
        { type: 'PurchaseOrder', id: 'LIST' },
      ],
    }),

    deletePurchaseOrder: builder.mutation<void, number | string>({
      query: (id) => ({
        url: `/purchase-orders/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['PurchaseOrder'],
    }),

    // Payments
    addPayment: builder.mutation<
      PurchasePayment,
      { purchaseOrderId: number | string; data: AddPaymentRequest }
    >({
      query: ({ purchaseOrderId, data }) => ({
        url: `/purchase-orders/${purchaseOrderId}/payments`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { purchaseOrderId }) => [
        { type: 'PurchaseOrder', id: purchaseOrderId },
        { type: 'Payment', id: 'LIST' },
      ],
    }),

    getPayments: builder.query<PurchasePayment[], number | string>({
      query: (purchaseOrderId) => `/purchase-orders/${purchaseOrderId}/payments`,
      providesTags: (result, error, purchaseOrderId) => [
        { type: 'Payment', id: purchaseOrderId },
      ],
    }),

    // Suppliers
    getSuppliers: builder.query<Supplier[], void>({
      query: () => '/suppliers',
      providesTags: ['Supplier'],
    }),

    createSupplier: builder.mutation<Supplier, Partial<Supplier>>({
      query: (data) => ({
        url: '/suppliers',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Supplier'],
    }),

    // Warehouses
    getWarehouses: builder.query<
      Array<{ id: number; name: string; code: string }>,
      void
    >({
      query: () => '/warehouses',
    }),

    // Status changes / audit trail
    getStatusChanges: builder.query<PurchaseStatusChange[], number | string>({
      query: (purchaseOrderId) => `/purchase-orders/${purchaseOrderId}/status-changes`,
    }),
  }),
})

// Export hooks for use in components
export const {
  useGetPurchaseOrdersQuery,
  useGetPurchaseOrderByIdQuery,
  useCreatePurchaseOrderMutation,
  useUpdateOrderStatusMutation,
  useDeletePurchaseOrderMutation,
  useAddPaymentMutation,
  useGetPaymentsQuery,
  useGetSuppliersQuery,
  useCreateSupplierMutation,
  useGetWarehousesQuery,
  useGetStatusChangesQuery,
} = procurementApi

// Helper functions for data transformation
export const transformPurchaseOrderForForm = (order?: PurchaseOrder) => {
  if (!order) return null

  return {
    supplier: {
      id: order.supplierId,
      code: order.supplier?.code || '',
      name: order.supplier?.name || '',
      contact: order.supplierContact,
      phone: order.supplierPhone,
      email: order.supplier?.email || '',
    },
    items: order.items.map(item => ({
      productId: item.productId,
      djjCode: item.djjCode,
      description: item.productName,
      category: '', // This would need to come from product data
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      vinNumber: item.vinNumber || '',
      engineNumber: item.engineNumber || '',
      machineSerial: item.machineSerial || '',
      supplierPartNo: item.supplierPartNo || '',
      specifications: item.specifications || '',
      notes: item.notes || '',
      warrantyMonths: item.warrantyMonths,
    })),
    warehouseId: order.warehouseId,
    orderDate: order.orderDate,
    expectedDelivery: order.expectedDelivery || '',
    finalPaymentDue: order.finalPaymentDue || '',
    depositAmount: order.depositAmount,
    notes: order.notes || '',
  }
}

export const getPaymentStatusData = (order?: PurchaseOrder) => {
  if (!order) {
    return {
      status: 'unpaid' as const,
      totalAmount: 0,
      paidAmount: 0,
      balance: 0,
      depositAmount: 0,
    }
  }

  return {
    status: order.paymentStatus,
    totalAmount: order.totalAmount,
    paidAmount: order.paidAmount,
    balance: order.balance,
    depositAmount: order.depositAmount,
    finalPaymentDue: order.finalPaymentDue,
  }
}

// Status workflow helpers
export const getValidStatusTransitions = (currentStatus: PurchaseOrder['status']) => {
  const transitions = {
    draft: ['consignment', 'ordered', 'cancelled'],
    consignment: ['ordered', 'received', 'cancelled'],
    ordered: ['received', 'cancelled'],
    received: [], // Terminal state
    cancelled: [], // Terminal state
  }
  
  return transitions[currentStatus] || []
}

export const getStatusLabel = (status: PurchaseOrder['status']) => {
  const labels = {
    draft: 'Draft',
    consignment: 'Consignment',
    ordered: 'Ordered',
    received: 'Received',
    cancelled: 'Cancelled',
  }
  
  return labels[status] || status
}

export const getPaymentStatusLabel = (status: PurchaseOrder['paymentStatus']) => {
  const labels = {
    unpaid: 'Unpaid',
    deposit_paid: 'Deposit Paid',
    fully_paid: 'Fully Paid',
  }
  
  return labels[status] || status
}