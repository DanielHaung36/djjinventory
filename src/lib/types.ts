export interface InboundItem {
  id: string
  productId?: number // 🔥 产品数据库ID - 用于库存操作
  djjCode?: string // DJJ产品编码
  name: string
  category: string // 产品分类 - 统一使用category字段
  qty: number
  price: number
  vin?: string
  serial?: string
  addLoan?: boolean
  remark?: string
  orderedQty?: number // For order-based transactions
  receivedQty?: number // For order-based transactions
  source?: "manual" | "purchase-order" // 来源标识，用于区分处理逻辑
  sku?: string // SKU - 用于订单入库
  quantity?: number // 兼容旧字段名
  unitPrice?: number // 兼容旧字段名
  location?: string // 兼容旧字段名
  lotNumber?: string // 兼容旧字段名
  expirationDate?: string // 兼容旧字段名
  purchaseOrderId?: string // 关联的采购订单ID
  purchaseOrderNumber?: string // 关联的采购订单号
}

export interface OutboundItem extends InboundItem {
  shippedQty?: number // For order-based transactions
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
