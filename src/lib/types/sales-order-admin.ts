// Define the possible statuses an order can be in
export const ALL_ORDER_STATUSES = [
  "pending-deposit",
  "deposit-received",
  "order-placed",
  "pd-check-pending",
  "pd-check-complete",
  "final-payment-pending",
  "final-payment-received",
  "ready-for-shipment",
  "shipped",
  "delivered",
  "order-closed", // A final closed state
  "cancelled", // A state for cancelled orders
] as const

export type OrderStatus = (typeof ALL_ORDER_STATUSES)[number]

export interface SalesOrderAdminItem {
  id: string
  orderNumber: string
  quoteNumber: string
  customer: string
  orderDate: string // ISO date string
  totalAmount: number
  currency: string // e.g., "AUD"
  currentStatus: OrderStatus
  salesRep?: string
  createdBy: string
  lastModifiedBy?: string // Added: Who last modified the order
  lastModifiedDate?: string // Added: When it was last modified (ISO date string)
}
