export interface InboundItem {
  id: string
  name: string
  type: string
  qty: number
  price: number
  vin?: string
  serial?: string
  addLoan?: boolean
  remark?: string
  orderedQty?: number // For order-based transactions
  receivedQty?: number // For order-based transactions
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
    type: string
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
    type: string
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
