export type QuoteStatusString = "pending" | "approve" | "reject"

export interface Quote {
  id: string
  quoteNumber: string
  customer: string
  quoteDate: string // ISO date string
  amounts: {
    subtotal: number
    gst: number
    total: number
    currency: string
  }
  status: {
    inStockApproval: QuoteStatusString
    approvalReason?: string // Optional: reason for approval/rejection
  }
  salesRep?: string
  requester: string // Added: The person who requested/created the quote
  items?: any[] // Placeholder for quote items
  companyInfo?: any // Placeholder
  customerInfo?: any // Placeholder
}
