export interface SalesOrder {
  orderNumber: string
  customer: string
  machineModel?: string
  orderDate?: string
  eta?: string
  total?: number
  quoteNumber: string
  quoteDate: string
  createdBy: string
  quoteContent?: string
  items?: OrderItem[]
}


export interface OrderItem {
  id: string
  name: string
  description: string
  quantity: number
  unitPrice: number
  totalPrice: number
  image?: string
  specifications?: string[]
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
