import type { Quote, QuoteStatusString } from "./types/quote"

const initialQuotes: Quote[] = [
  {
    id: "1",
    quoteNumber: "Q-2025-001",
    customer: "Acme Construction",
    quoteDate: "2025-06-01T00:00:00.000Z",
    amounts: { subtotal: 42000, gst: 4200, total: 46200, currency: "AUD" },
    status: { inStockApproval: "approve", approvalReason: "Standard approval, all checks passed." },
    salesRep: "Jane Doe",
    requester: "Mark Johnson",
  },
  {
    id: "2",
    quoteNumber: "Q-2025-002",
    customer: "Beta Innovations",
    quoteDate: "2025-06-05T00:00:00.000Z",
    amounts: { subtotal: 15000, gst: 1500, total: 16500, currency: "AUD" },
    status: { inStockApproval: "pending" },
    salesRep: "John Smith",
    requester: "Sarah Lee",
  },
  {
    id: "3",
    quoteNumber: "Q-2025-003",
    customer: "Gamma Solutions",
    quoteDate: "2025-06-10T00:00:00.000Z",
    amounts: { subtotal: 7500, gst: 750, total: 8250, currency: "AUD" },
    status: { inStockApproval: "reject", approvalReason: "Credit limit exceeded." },
    salesRep: "Alice Brown",
    requester: "David Chen",
  },
  {
    id: "4",
    quoteNumber: "Q-2025-004",
    customer: "Delta Corp",
    quoteDate: "2025-06-12T00:00:00.000Z",
    amounts: { subtotal: 22000, gst: 2200, total: 24200, currency: "AUD" },
    status: { inStockApproval: "pending" },
    salesRep: "Jane Doe",
    requester: "Emily White",
  },
  {
    id: "5",
    quoteNumber: "Q-2025-005",
    customer: "Epsilon Ltd",
    quoteDate: "2025-06-15T00:00:00.000Z",
    amounts: { subtotal: 50000, gst: 5000, total: 55000, currency: "AUD" },
    status: { inStockApproval: "approve", approvalReason: "VIP Customer, expedited." },
    salesRep: "Bob Green",
    requester: "Michael Brown",
  },
  {
    id: "6",
    quoteNumber: "Q-2025-006",
    customer: "Zeta Systems",
    quoteDate: "2025-06-18T00:00:00.000Z",
    amounts: { subtotal: 12000, gst: 1200, total: 13200, currency: "AUD" },
    status: { inStockApproval: "pending" },
    salesRep: "John Smith",
    requester: "Laura Wilson",
  },
  {
    id: "7",
    quoteNumber: "Q-2025-007",
    customer: "Omega Services",
    quoteDate: "2025-06-20T00:00:00.000Z",
    amounts: { subtotal: 33000, gst: 3300, total: 36300, currency: "AUD" },
    status: { inStockApproval: "pending" },
    salesRep: "Alice Brown",
    requester: "Kevin Davis",
  },
]

const quotesStore: Quote[] = JSON.parse(JSON.stringify(initialQuotes))

export const getQuotes = async (): Promise<Quote[]> => {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return JSON.parse(JSON.stringify(quotesStore))
}

export const updateQuoteStatus = async (
  quoteId: string,
  newStatus: QuoteStatusString,
  reason?: string,
): Promise<Quote> => {
  await new Promise((resolve) => setTimeout(resolve, 300))
  const quoteIndex = quotesStore.findIndex((q) => q.id === quoteId)
  if (quoteIndex === -1) {
    throw new Error("Quote not found")
  }
  quotesStore[quoteIndex].status.inStockApproval = newStatus
  if (reason !== undefined) {
    quotesStore[quoteIndex].status.approvalReason = reason
  } else {
    // Clear reason if not provided, e.g. if moving back to pending (though less likely for this flow)
    delete quotesStore[quoteIndex].status.approvalReason
  }
  return JSON.parse(JSON.stringify(quotesStore[quoteIndex]))
}
