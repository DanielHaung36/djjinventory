export interface SalesOrder {
  id: number
  quoteId?: number
  storeId: number
  customerId: number
  salesRepId: number
  orderNumber: string
  orderDate: string
  currency: string
  shippingAddress: string
  totalAmount: number
  depositAmount: number
  status: OrderStatus
  inventoryWarnings?: string
  hasStockIssues: boolean
  convertedFromQuote: boolean
  // 时间跟踪
  depositPaidAt?: string
  finalPaidAt?: string
  pdCompletedAt?: string
  shippedAt?: string
  deliveredAt?: string
  location: string
  createdBy: number
  updatedBy?: number
  createdAt: string
  updatedAt: string
  items: OrderItem[]
  // 关联对象
  store?: Store
  customer?: Customer
  salesRepUser?: SalesRep
}

// 订单状态枚举 - 与后端保持一致
export type OrderStatus = 
  | 'draft'
  | 'ordered'
  | 'deposit_received'
  | 'final_payment_received'
  | 'pre_delivery_inspection'
  | 'shipped'
  | 'delivered'
  | 'order_closed'
  | 'cancelled'

// 关联对象类型
export interface Store {
  id: number
  name: string
  address: string
}

export interface Customer {
  id: number
  name: string
  email?: string
  phone?: string
}

export interface SalesRep {
  id: number
  name: string
  email: string
}


export interface OrderItem {
  id: number
  orderId: number
  productId: number
  warehouseId: number
  quantity: number
  unitPrice: number
  totalPrice: number
  description: string
  specifications?: string
  // 关联对象
  product?: Product
  warehouse?: Warehouse
}

export interface Product {
  id: number
  name: string
  model: string
  brand: string
  image?: string
}

export interface Warehouse {
  id: number
  name: string
  location: string
}


export interface WorkflowStep {
  id: number
  title: string
  status: "completed" | "current" | "pending"
  date?: string
  description: string
}


export interface DashboardStats {
  totalOrders: number
  pendingDeposits: number
  pendingPDChecks: number
  pendingFinalPayments: number
  pendingShipments: number
}
