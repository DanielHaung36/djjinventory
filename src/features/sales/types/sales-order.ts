export interface SalesOrder {
  orderNumber: string
  quoteNumber: string
  createdBy: string
  quoteDate: string
  customer: string
  quotePDF: string
  paymentScreenshot: string
  quoteContent: string
  machineModel: string
  orderDate: string
  eta: string
  total: number
  depositAmount?: number
  finalPaymentAmount?: number
  status:
    | "deposit-received"
    | "order-placed"
    | "final-payment"
    | "pre-delivery-inspection"
    | "shipment"
    | "order-closed"
  priority: "high" | "medium" | "low"
  region: string
  salesRep: string
  currentStep?: number
}

export interface OrderItem {
  id: string
  type: "deposit" | "final-payment"
  amount: number
  receipt: string
  remark: string
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
