// Re-export all types from individual files
export * from './quote'
export * from './sales-order-admin'
export * from './user-permission'

// Common types that may be used across modules
export interface QuoteItem {
  id?: number
  quoteId?: number
  productId?: number
  product?: {
    id: number
    name: string
    djjCode: string
    vinEngine?: string
    model?: string
    manufacturer?: string
    manufacturerCode?: string
    supplier?: string
    category?: string
    specs?: string
    warranty?: string
    standards?: string
    unit?: string
    price?: number
    rrpPrice?: number
    currency?: string
    status?: string
    productType?: string
    standardWarranty?: string
    weightKg?: number
    liftCapacityKg?: number
    liftHeightMm?: number
    powerSource?: string
    createdAt?: string
    updatedAt?: string
  }
  description: string
  detailDescription?: string
  quantity: number
  unit: string
  unitPrice: number
  discount?: number
  totalPrice: number
  goodsNature?: string
  createdAt?: string
}

// Extended Quote interface that includes all fields used in the application
export interface Quote {
  id: string | number
  quoteNumber: string
  customer?: {
    id: number
    name: string
    abn?: string
    contact: string
    phone: string
    email: string
    address?: string
  }
  // Legacy fields for backward compatibility
  customerABN?: string
  phone?: string
  email?: string
  
  billingAddress?: {
    line1: string
    line2?: string
    city?: string
    state?: string
    postcode?: string
    country?: string
  }
  
  deliveryAddress?: {
    line1: string
    line2?: string
    city?: string
    state?: string
    postcode?: string
    country?: string
  }
  
  store?: {
    id: number
    name: string
  }
  
  company?: {
    id: number
    name: string
    code?: string
    abn?: string
    phone?: string
    email?: string
    website?: string
    address?: string
    bankDetails?: {
      bankName: string
      bsb: string
      accountNumber: string
    }
  }
  
  salesRepUser?: {
    id: number
    username: string
    email: string
  }
  
  items: QuoteItem[]
  
  quoteDate: string | Date
  quoteDateText?: string
  
  amounts?: {
    subTotal: number
    gstTotal: number
    total: number
    currency: string
  }
  
  depositAmount?: number
  
  remarks?: Array<{
    general?: string
    warrantyAndSpecial?: string
  }>
  
  warrantyNotes?: string
  
  status?: {
    inStockApproval?: QuoteStatusString
    approvalReason?: string
    inStockState?: string
    inStockTime?: Date
    pdfUrl?: string
    pdfGenerationStatus?: string
  }
  
  salesRep?: string
  store?: string
  warehouse?: string
  createdBy?: string
  requester?: string
  
  createdAt?: string
  updatedAt?: string
  
  attachments?: Array<{
    id: number
    fileName: string
    fileType: string
    fileSize: number
    url: string
    uploadedAt: string
    refType: string
    refId: number
  }>
}

export type QuoteStatusString = "pending" | "approve" | "reject"