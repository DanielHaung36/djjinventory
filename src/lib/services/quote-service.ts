import type { Quote, QuoteItem } from "@/lib/types"

// Mock data for quotes
const quotes: Quote[] = [
  {
    id: "q1",
    quoteNumber: "Q-2025-001",
    createdBy: "John Smith",
    customer: "Acme Construction",
    customerABN: "12 345 678 901",
    phone: "0412 345 678",
    email: "info@acmeconstruction.com",
    amounts: {
      subTotal: 42000,
      gstTotal: 4200,
      total: 46200,
      currency: "AUD",
    },
    quoteDate: new Date("2025-06-01"),
    quoteDateText: "01/06/2025",
    items: [
      {
        description: "LM930 Wheel Loader",
        quantity: 1,
        unit: "unit",
        unitPrice: 42000,
        totalPrice: 42000,
      },
    ],
    status: {
      inStockApproval: "approve",
      inStockState: "in",
      inStockTime: new Date("2025-06-02"),
    },
    salesRep: "Jane Doe",
    store: "Sydney Central",
    warehouse: "Sydney Warehouse",
    company: {
      name: "Heavy Equipment Australia Pty Ltd",
      address: {
        line1: "123 Industrial Parkway",
        city: "Sydney",
        state: "NSW",
        postcode: "2000",
        country: "Australia",
      },
      email: "sales@heavyequipment.com.au",
      phone: "02 9876 5432",
      abn: "98 765 432 109",
    },
    remarks: [
      {
        general: "Customer requires delivery before end of month.",
        warrantyAndSpecial: "Standard 12-month warranty included.",
      },
    ],
  },
  {
    id: "q2",
    quoteNumber: "Q-2025-002",
    createdBy: "Jane Doe",
    customer: "XYZ Mining",
    customerABN: "23 456 789 012",
    phone: "0423 456 789",
    email: "procurement@xyzmining.com",
    amounts: {
      subTotal: 85000,
      gstTotal: 8500,
      total: 93500,
      currency: "AUD",
    },
    quoteDate: new Date("2025-05-28"),
    quoteDateText: "28/05/2025",
    items: [
      {
        description: "HD600 Excavator",
        quantity: 1,
        unit: "unit",
        unitPrice: 75000,
        totalPrice: 75000,
      },
      {
        description: "Hydraulic Hammer Attachment",
        quantity: 1,
        unit: "unit",
        unitPrice: 10000,
        totalPrice: 10000,
      },
    ],
    status: {
      inStockApproval: "pending",
      inStockState: "out",
    },
    salesRep: "John Smith",
    store: "Melbourne East",
    warehouse: "Melbourne Warehouse",
    company: {
      name: "Heavy Equipment Australia Pty Ltd",
      address: {
        line1: "456 Equipment Drive",
        city: "Melbourne",
        state: "VIC",
        postcode: "3000",
        country: "Australia",
      },
      email: "sales@heavyequipment.com.au",
      phone: "03 9876 5432",
      abn: "98 765 432 109",
    },
    remarks: [
      {
        general: "Customer is a repeat buyer.",
        warrantyAndSpecial: "Extended 24-month warranty offered at additional cost.",
      },
    ],
  },
]

// Get all quotes
export async function getQuotes(): Promise<Quote[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))
  return [...quotes]
}

// Get a quote by ID
export async function getQuoteById(id: string): Promise<Quote | null> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))
  const quote = quotes.find((q) => q.id === id)
  return quote || null
}

// Create a new quote
export async function createQuote(quoteData: Partial<Quote>): Promise<Quote> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  const newQuote: Quote = {
    id: `q${quotes.length + 1}`,
    quoteNumber: quoteData.quoteNumber || `Q-2025-${String(quotes.length + 1).padStart(3, "0")}`,
    createdBy: quoteData.createdBy || "Current User",
    customer: quoteData.customer || "",
    customerABN: quoteData.customerABN,
    phone: quoteData.phone,
    email: quoteData.email,
    amounts: quoteData.amounts || {
      subTotal: 0,
      gstTotal: 0,
      total: 0,
      currency: "AUD",
    },
    quoteDate: quoteData.quoteDate || new Date(),
    quoteDateText: quoteData.quoteDateText || new Date().toLocaleDateString("en-AU"),
    items: quoteData.items || [],
    status: quoteData.status || {
      inStockApproval: "pending",
      inStockState: "out",
    },
    salesRep: quoteData.salesRep,
    store: quoteData.store,
    warehouse: quoteData.warehouse,
    company: quoteData.company || {
      name: "Heavy Equipment Australia Pty Ltd",
      abn: "98 765 432 109",
    },
    remarks: quoteData.remarks || [{}],
  }

  quotes.push(newQuote)
  return newQuote
}

// Update an existing quote
export async function updateQuote(id: string, quoteData: Partial<Quote>): Promise<Quote> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  const index = quotes.findIndex((q) => q.id === id)
  if (index === -1) {
    throw new Error(`Quote with ID ${id} not found`)
  }

  const updatedQuote = {
    ...quotes[index],
    ...quoteData,
  }

  quotes[index] = updatedQuote
  return updatedQuote
}

// Delete a quote
export async function deleteQuote(id: string): Promise<void> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  const index = quotes.findIndex((q) => q.id === id)
  if (index === -1) {
    throw new Error(`Quote with ID ${id} not found`)
  }

  quotes.splice(index, 1)
}

// Copy a quote
export async function copyQuote(id: string): Promise<Quote> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  const sourceQuote = quotes.find((q) => q.id === id)
  if (!sourceQuote) {
    throw new Error(`Quote with ID ${id} not found`)
  }

  // Create a new quote based on the source quote
  const newQuote: Quote = {
    ...JSON.parse(JSON.stringify(sourceQuote)), // Deep copy
    id: `q${quotes.length + 1}`,
    quoteNumber: `Q-2025-${String(quotes.length + 1).padStart(3, "0")}`,
    quoteDate: new Date(),
    quoteDateText: new Date().toLocaleDateString("en-AU"),
    status: {
      inStockApproval: "pending",
      inStockState: "out",
    },
  }

  quotes.push(newQuote)
  return newQuote
}

// Generate a PDF for a quote
export async function generateQuotePdf(id: string): Promise<string> {
  // Simulate API delay for PDF generation
  await new Promise((resolve) => setTimeout(resolve, 1500))

  const quote = quotes.find((q) => q.id === id)
  if (!quote) {
    throw new Error(`Quote with ID ${id} not found`)
  }

  // In a real application, this would generate an actual PDF
  // For this mock implementation, we'll just return a fake URL
  const pdfUrl = `https://example.com/quotes/${quote.quoteNumber}.pdf`

  // Update the quote with the PDF URL
  if (!quote.status) {
    quote.status = {
      inStockApproval: "pending",
      inStockState: "out",
    }
  }

  quote.status.pdfUrl = pdfUrl
  quote.status.pdfGenerationStatus = "success"

  return pdfUrl
}

// Calculate quote totals
export function calculateQuoteTotals(items: QuoteItem[]) {
  const subTotal = items.reduce((sum, item) => sum + item.totalPrice, 0)
  const gstTotal = subTotal * 0.1 // 10% GST
  const total = subTotal + gstTotal

  return {
    subTotal,
    gstTotal,
    total,
  }
}
