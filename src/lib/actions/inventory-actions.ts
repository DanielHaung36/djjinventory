"use server"

import type {
  InboundTransaction,
  OutboundTransaction,
  PurchaseOrder,
  SalesOrder,
  AuditTrailEntry,
  EditRequest,
  User,
} from "@/lib/types"
import { mockPurchaseOrders, mockSalesOrders } from "@/lib/mock-data"

// Mock user for demonstration purposes
const currentUser: User = {
  id: "user-1",
  name: "John Doe",
  email: "john.doe@example.com",
  role: "manager",
  permissions: ["edit_documents", "approve_documents"],
}

// Mock transactions
const mockInboundTransactions: InboundTransaction[] = [
  {
    id: "INB-001",
    transactionType: "order-based",
    purchaseOrderId: "po-1",
    supplierName: "Acme Supplies",
    referenceNumber: "PO-2025-001",
    receiptDate: "2025-06-10",
    notes: "Regular delivery",
    items: [
      {
        id: "item-1",
        name: "Widget A",
        type: "Accessory",
        qty: 10,
        price: 19.99,
        orderedQty: 10,
        receivedQty: 10,
      },
      {
        id: "item-2",
        name: "Gadget X",
        type: "Host",
        qty: 5,
        price: 49.99,
        orderedQty: 5,
        receivedQty: 5,
        vin: "VIN123456",
        serial: "SN789012",
      },
    ],
    status: "submitted",
    createdAt: "2025-06-10T10:30:00Z",
    updatedAt: "2025-06-10T10:30:00Z",
    createdBy: "user-1",
  },
  {
    id: "INB-002",
    transactionType: "non-order-based",
    supplierName: "Global Parts Inc.",
    referenceNumber: "INV-2025-002",
    receiptDate: "2025-06-08",
    notes: "Emergency order",
    items: [
      {
        id: "item-3",
        name: "Widget B",
        type: "Accessory",
        qty: 8,
        price: 29.99,
      },
    ],
    status: "approved",
    createdAt: "2025-06-08T14:15:00Z",
    updatedAt: "2025-06-08T15:20:00Z",
    createdBy: "user-2",
    updatedBy: "user-1",
  },
]

const mockOutboundTransactions: OutboundTransaction[] = [
  {
    id: "OUT-001",
    transactionType: "order-based",
    salesOrderId: "so-1",
    customerName: "ABC Construction Co.",
    referenceNumber: "SO-2025-001",
    shipmentDate: "2025-06-09",
    shippingMethod: "logistics",
    driverInfo: "John Smith, 555-123-4567",
    transportationCost: 150.0,
    notes: "Priority delivery",
    items: [
      {
        id: "item-4",
        name: "Widget A",
        type: "Accessory",
        qty: 5,
        price: 24.99,
        orderedQty: 5,
        shippedQty: 5,
      },
      {
        id: "item-5",
        name: "Gadget X",
        type: "Host",
        qty: 2,
        price: 59.99,
        orderedQty: 2,
        shippedQty: 2,
        vin: "VIN654321",
        serial: "SN098765",
      },
    ],
    status: "submitted",
    createdAt: "2025-06-09T09:45:00Z",
    updatedAt: "2025-06-09T09:45:00Z",
    createdBy: "user-1",
  },
  {
    id: "OUT-002",
    transactionType: "non-order-based",
    customerName: "XYZ Builders",
    referenceNumber: "INV-2025-003",
    shipmentDate: "2025-06-07",
    shippingMethod: "express",
    trackingNumber: "EXP123456789",
    transportationCost: 75.0,
    notes: "Weekend delivery",
    items: [
      {
        id: "item-6",
        name: "Widget B",
        type: "Accessory",
        qty: 4,
        price: 34.99,
      },
    ],
    status: "approved",
    createdAt: "2025-06-07T16:30:00Z",
    updatedAt: "2025-06-07T17:45:00Z",
    createdBy: "user-2",
    updatedBy: "user-1",
  },
]

// Mock audit trail
const mockAuditTrail: AuditTrailEntry[] = [
  {
    id: "audit-1",
    documentId: "INB-001",
    documentType: "inbound",
    action: "create",
    timestamp: "2025-06-10T10:30:00Z",
    userId: "user-1",
    userName: "John Doe",
  },
  {
    id: "audit-2",
    documentId: "INB-002",
    documentType: "inbound",
    action: "create",
    timestamp: "2025-06-08T14:15:00Z",
    userId: "user-2",
    userName: "Jane Smith",
  },
  {
    id: "audit-3",
    documentId: "INB-002",
    documentType: "inbound",
    action: "approve",
    timestamp: "2025-06-08T15:20:00Z",
    userId: "user-1",
    userName: "John Doe",
  },
  {
    id: "audit-4",
    documentId: "OUT-001",
    documentType: "outbound",
    action: "create",
    timestamp: "2025-06-09T09:45:00Z",
    userId: "user-1",
    userName: "John Doe",
  },
  {
    id: "audit-5",
    documentId: "OUT-002",
    documentType: "outbound",
    action: "create",
    timestamp: "2025-06-07T16:30:00Z",
    userId: "user-2",
    userName: "Jane Smith",
  },
  {
    id: "audit-6",
    documentId: "OUT-002",
    documentType: "outbound",
    action: "approve",
    timestamp: "2025-06-07T17:45:00Z",
    userId: "user-1",
    userName: "John Doe",
  },
]

// Mock edit requests
const mockEditRequests: EditRequest[] = []

export async function createInboundTransaction(
  data: Omit<InboundTransaction, "id" | "status" | "createdAt" | "updatedAt" | "createdBy" | "updatedBy">,
): Promise<{ success: boolean; id: string }> {
  // In a real application, this would save to a database
  console.log("Creating inbound transaction:", data)

  // Simulate a delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // If this is an order-based transaction, update the purchase order
  if (data.transactionType === "order-based" && data.purchaseOrderId) {
    // In a real app, this would update the database
    console.log(`Updating purchase order ${data.purchaseOrderId} with received items`)
  }

  const newId = `INB-${Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")}`

  // Create a new transaction
  const newTransaction: InboundTransaction = {
    ...data,
    id: newId,
    status: "submitted",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: currentUser.id,
  }

  // Add to mock data
  mockInboundTransactions.push(newTransaction)

  // Create audit trail entry
  const auditEntry: AuditTrailEntry = {
    id: `audit-${mockAuditTrail.length + 1}`,
    documentId: newId,
    documentType: "inbound",
    action: "create",
    timestamp: new Date().toISOString(),
    userId: currentUser.id,
    userName: currentUser.name,
  }

  mockAuditTrail.push(auditEntry)

  // Return a mock response
  return {
    success: true,
    id: newId,
  }
}

export async function createOutboundTransaction(
  data: Omit<OutboundTransaction, "id" | "status" | "createdAt" | "updatedAt" | "createdBy" | "updatedBy">,
): Promise<{ success: boolean; id: string }> {
  // In a real application, this would save to a database
  console.log("Creating outbound transaction:", data)

  // Simulate a delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // If this is an order-based transaction, update the sales order
  if (data.transactionType === "order-based" && data.salesOrderId) {
    // In a real app, this would update the database
    console.log(`Updating sales order ${data.salesOrderId} with shipped items`)
  }

  const newId = `OUT-${Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")}`

  // Create a new transaction
  const newTransaction: OutboundTransaction = {
    ...data,
    id: newId,
    status: "submitted",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: currentUser.id,
  }

  // Add to mock data
  mockOutboundTransactions.push(newTransaction)

  // Create audit trail entry
  const auditEntry: AuditTrailEntry = {
    id: `audit-${mockAuditTrail.length + 1}`,
    documentId: newId,
    documentType: "outbound",
    action: "create",
    timestamp: new Date().toISOString(),
    userId: currentUser.id,
    userName: currentUser.name,
  }

  mockAuditTrail.push(auditEntry)

  // Return a mock response
  return {
    success: true,
    id: newId,
  }
}

export async function getInventoryItems() {
  // In a real application, this would fetch from a database

  // Simulate a delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Return mock data
  return [
    {
      id: "ITEM-001",
      name: "Widget A",
      sku: "WA-001",
      category: "Widgets",
      quantity: 24,
      unitPrice: 19.99,
      status: "in-stock",
    },
    {
      id: "ITEM-002",
      name: "Widget B",
      sku: "WB-002",
      category: "Widgets",
      quantity: 12,
      unitPrice: 29.99,
      status: "in-stock",
    },
    {
      id: "ITEM-003",
      name: "Gadget X",
      sku: "GX-003",
      category: "Gadgets",
      quantity: 5,
      unitPrice: 49.99,
      status: "low-stock",
    },
    {
      id: "ITEM-004",
      name: "Gadget Y",
      sku: "GY-004",
      category: "Gadgets",
      quantity: 0,
      unitPrice: 59.99,
      status: "out-of-stock",
    },
    {
      id: "ITEM-005",
      name: "Component Z",
      sku: "CZ-005",
      category: "Components",
      quantity: 36,
      unitPrice: 9.99,
      status: "in-stock",
    },
  ]
}

export async function getPurchaseOrders(): Promise<PurchaseOrder[]> {
  // Simulate a delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  return mockPurchaseOrders
}

export async function getPurchaseOrderById(id: string): Promise<PurchaseOrder | null> {
  // Simulate a delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  return mockPurchaseOrders.find((po) => po.id === id) || null
}

export async function getSalesOrders(): Promise<SalesOrder[]> {
  // Simulate a delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  return mockSalesOrders
}

export async function getSalesOrderById(id: string): Promise<SalesOrder | null> {
  // Simulate a delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  return mockSalesOrders.find((so) => so.id === id) || null
}

// New functions for document editing

export async function getInboundTransactions(): Promise<InboundTransaction[]> {
  // Simulate a delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  return mockInboundTransactions
}

export async function getOutboundTransactions(): Promise<OutboundTransaction[]> {
  // Simulate a delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  return mockOutboundTransactions
}

export async function getInboundTransactionById(id: string): Promise<InboundTransaction | null> {
  // Simulate a delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  return mockInboundTransactions.find((transaction) => transaction.id === id) || null
}

export async function getOutboundTransactionById(id: string): Promise<OutboundTransaction | null> {
  // Simulate a delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  return mockOutboundTransactions.find((transaction) => transaction.id === id) || null
}

export async function getAuditTrailForDocument(
  documentId: string,
  documentType: "inbound" | "outbound",
): Promise<AuditTrailEntry[]> {
  // Simulate a delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  return mockAuditTrail.filter((entry) => entry.documentId === documentId && entry.documentType === documentType)
}

export async function createEditRequest(
  documentId: string,
  documentType: "inbound" | "outbound",
  reason: string,
  changes: { field: string; oldValue: any; newValue: any }[],
): Promise<{ success: boolean; id: string }> {
  // Simulate a delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const newId = `edit-${mockEditRequests.length + 1}`

  // Create a new edit request
  const newRequest: EditRequest = {
    id: newId,
    documentId,
    documentType,
    requestedBy: currentUser.id,
    requestedAt: new Date().toISOString(),
    status: "pending",
    reason,
    changes,
  }

  // Add to mock data
  mockEditRequests.push(newRequest)

  // Return a mock response
  return {
    success: true,
    id: newId,
  }
}

export async function getEditRequestsForDocument(
  documentId: string,
  documentType: "inbound" | "outbound",
): Promise<EditRequest[]> {
  // Simulate a delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  return mockEditRequests.filter(
    (request) => request.documentId === documentId && request.documentType === documentType,
  )
}

export async function approveEditRequest(
  requestId: string,
): Promise<{ success: boolean; documentId: string; documentType: "inbound" | "outbound" }> {
  // Simulate a delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Find the request
  const requestIndex = mockEditRequests.findIndex((request) => request.id === requestId)
  if (requestIndex === -1) {
    throw new Error("Edit request not found")
  }

  const request = mockEditRequests[requestIndex]
  if (request.status !== "pending") {
    throw new Error("Edit request is not pending")
  }

  // Update the request
  mockEditRequests[requestIndex] = {
    ...request,
    status: "approved",
    approvedBy: currentUser.id,
    approvedAt: new Date().toISOString(),
  }

  // Apply the changes to the document
  if (request.documentType === "inbound") {
    const documentIndex = mockInboundTransactions.findIndex((doc) => doc.id === request.documentId)
    if (documentIndex === -1) {
      throw new Error("Document not found")
    }

    const document = mockInboundTransactions[documentIndex]
    const updatedDocument = { ...document, updatedAt: new Date().toISOString(), updatedBy: currentUser.id }

    // Apply each change
    request.changes.forEach((change) => {
      if (change.field.startsWith("items[")) {
        // Handle item changes
        const match = change.field.match(/items\[(\d+)\]\.(.+)/)
        if (match) {
          const itemIndex = Number.parseInt(match[1])
          const itemField = match[2]
          if (updatedDocument.items[itemIndex]) {
            updatedDocument.items[itemIndex] = {
              ...updatedDocument.items[itemIndex],
              [itemField]: change.newValue,
            }
          }
        }
      } else {
        // Handle document-level changes
        updatedDocument[change.field] = change.newValue
      }
    })

    mockInboundTransactions[documentIndex] = updatedDocument
  } else {
    const documentIndex = mockOutboundTransactions.findIndex((doc) => doc.id === request.documentId)
    if (documentIndex === -1) {
      throw new Error("Document not found")
    }

    const document = mockOutboundTransactions[documentIndex]
    const updatedDocument = { ...document, updatedAt: new Date().toISOString(), updatedBy: currentUser.id }

    // Apply each change
    request.changes.forEach((change) => {
      if (change.field.startsWith("items[")) {
        // Handle item changes
        const match = change.field.match(/items\[(\d+)\]\.(.+)/)
        if (match) {
          const itemIndex = Number.parseInt(match[1])
          const itemField = match[2]
          if (updatedDocument.items[itemIndex]) {
            updatedDocument.items[itemIndex] = {
              ...updatedDocument.items[itemIndex],
              [itemField]: change.newValue,
            }
          }
        }
      } else {
        // Handle document-level changes
        updatedDocument[change.field] = change.newValue
      }
    })

    mockOutboundTransactions[documentIndex] = updatedDocument
  }

  // Create audit trail entry
  const auditEntry: AuditTrailEntry = {
    id: `audit-${mockAuditTrail.length + 1}`,
    documentId: request.documentId,
    documentType: request.documentType,
    action: "update",
    timestamp: new Date().toISOString(),
    userId: currentUser.id,
    userName: currentUser.name,
    changes: request.changes,
    reason: request.reason,
  }

  mockAuditTrail.push(auditEntry)

  // Return success
  return {
    success: true,
    documentId: request.documentId,
    documentType: request.documentType,
  }
}

export async function rejectEditRequest(
  requestId: string,
  reason: string,
): Promise<{ success: boolean; documentId: string; documentType: "inbound" | "outbound" }> {
  // Simulate a delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Find the request
  const requestIndex = mockEditRequests.findIndex((request) => request.id === requestId)
  if (requestIndex === -1) {
    throw new Error("Edit request not found")
  }

  const request = mockEditRequests[requestIndex]
  if (request.status !== "pending") {
    throw new Error("Edit request is not pending")
  }

  // Update the request
  mockEditRequests[requestIndex] = {
    ...request,
    status: "rejected",
    approvedBy: currentUser.id,
    approvedAt: new Date().toISOString(),
  }

  // Create audit trail entry
  const auditEntry: AuditTrailEntry = {
    id: `audit-${mockAuditTrail.length + 1}`,
    documentId: request.documentId,
    documentType: request.documentType,
    action: "reject",
    timestamp: new Date().toISOString(),
    userId: currentUser.id,
    userName: currentUser.name,
    reason,
  }

  mockAuditTrail.push(auditEntry)

  // Return success
  return {
    success: true,
    documentId: request.documentId,
    documentType: request.documentType,
  }
}

export async function getCurrentUser(): Promise<User> {
  // Simulate a delay
  await new Promise((resolve) => setTimeout(resolve, 100))

  return currentUser
}

export async function getAllEditRequests(): Promise<EditRequest[]> {
  // Simulate a delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  return mockEditRequests
}
