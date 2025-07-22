// ===== 统一的商品数据模型 =====

export interface BaseItem {
  id: string
  productId?: number // 🔥 产品数据库ID - 用于库存操作
  djjCode?: string // DJJ产品编码
  name: string
  category: string // 产品分类 - 统一字段
  quantity: number // 🔥 统一使用quantity字段
  unitPrice: number // 🔥 统一使用unitPrice字段
  vin?: string
  serial?: string
  addLoan?: boolean
  remark?: string
  source?: "manual" | "purchase-order" | "sales-order" // 来源标识
  sku?: string // SKU
  location?: string
  lotNumber?: string
  expirationDate?: string
}

export interface InboundItem extends BaseItem {
  orderedQty?: number // For order-based transactions
  receivedQty?: number // For order-based transactions
  purchaseOrderId?: string // 关联的采购订单ID
  purchaseOrderNumber?: string // 关联的采购订单号
}

export interface OutboundItem extends BaseItem {
  orderedQty?: number // For order-based transactions
  shippedQty?: number // For order-based transactions
  salesOrderId?: string // 关联的销售订单ID
  salesOrderNumber?: string // 关联的销售订单号
}

export interface Supplier {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
}

export interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
}

export interface ShippingMethod {
  id: string
  name: string
}

export interface PurchaseOrder {
  id: string
  orderNumber: string
  supplier: Supplier
  orderDate: string
  expectedDeliveryDate: string
  status: "pending" | "partial" | "complete" | "cancelled"
  items: Array<{
    id: string
    name: string
    category: string // 统一使用category字段
    sku: string
    description?: string
    orderedQty: number
    receivedQty: number
    unitPrice: number
    totalPrice: number
  }>
  notes?: string
}

export interface SalesOrder {
  id: string
  orderNumber: string
  customer: Customer
  orderDate: string
  expectedShipDate: string
  status: "pending" | "partial" | "complete" | "cancelled"
  items: Array<{
    id: string
    name: string
    category: string // 统一使用category字段
    sku: string
    description?: string
    orderedQty: number
    shippedQty: number
    unitPrice: number
    totalPrice: number
  }>
  notes?: string
}

export interface InboundTransaction {
  id: string
  transactionType: "order-based" | "non-order-based"
  purchaseOrderId?: string
  supplierName: string
  referenceNumber: string
  receiptDate: string
  notes?: string
  items: InboundItem[]
  files?: File[]
  status: "draft" | "submitted" | "approved" | "rejected" | "void"
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy?: string
}

export interface OutboundTransaction {
  id: string
  transactionType: "order-based" | "non-order-based"
  salesOrderId?: string
  customerName: string
  referenceNumber: string
  shipmentDate: string
  shippingMethod: string
  trackingNumber?: string
  driverInfo?: string
  transportationCost: number
  notes?: string
  items: OutboundItem[]
  files?: File[]
  status: "draft" | "submitted" | "approved" | "rejected" | "void"
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy?: string
}

export interface AuditTrailEntry {
  id: string
  documentId: string
  documentType: "inbound" | "outbound"
  action: "create" | "update" | "approve" | "reject" | "void"
  timestamp: string
  userId: string
  userName: string
  changes?: {
    field: string
    oldValue: any
    newValue: any
  }[]
  reason?: string
}

export interface User {
  id: string
  name: string
  email: string
  role: "admin" | "manager" | "operator" | "viewer"
  permissions: string[]
}

export interface EditRequest {
  id: string
  documentId: string
  documentType: "inbound" | "outbound"
  requestedBy: string
  requestedAt: string
  status: "pending" | "approved" | "rejected"
  approvedBy?: string
  approvedAt?: string
  reason: string
  changes: {
    field: string
    oldValue: any
    newValue: any
  }[]
}
