export interface OrderData {
  orderNumber: string
  quoteNumber: string
  createdBy: string
  quoteDate: string
  customer: string
  quotePDF: string
  paymentScreenshot: string
  quoteContent: string
  model?: string
  depositStatus?: "Passed" | "Pending" | "Failed"
  inventory?: "In Stock" | "To Be Ordered"
  finalPayment?: string
  nextStep?: string
  pdStatus?: "Passed" | "Pending" | "Failed"
}

export interface DashboardStats {
  totalOrders: number
  pendingDeposits: number
  pendingPDChecks: number
  pendingFinalPayments: number
  pendingShipments: number
}
