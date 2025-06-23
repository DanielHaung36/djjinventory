import type { SalesOrderAdminItem, OrderStatus } from "@/lib/types/sales-order-admin"
import { ALL_ORDER_STATUSES } from "@/lib/types/sales-order-admin"

const generateAdminMockOrders = (): SalesOrderAdminItem[] => {
  const customers = [
    "DW TILES QLD",
    "Geoff Harcourt",
    "Sam Construction",
    "BuildCorp Australia",
    "Mining Solutions Ltd",
    "Pacific Infrastructure",
    "Urban Development Co",
  ]
  const creators = ["AdminMaster", "LiuEcho", "Jack Yao", "Monica Chen", "SystemProcess"]
  const salesReps = ["Monica Simons", "Jack Wilson", "Sarah Chen", "David Kim"]

  const orders: SalesOrderAdminItem[] = []
  for (let i = 1; i <= 25; i++) {
    const baseDate = new Date("2025-05-01")
    const orderDate = new Date(baseDate.getTime() + i * 24 * 60 * 60 * 1000)
    const total = 10000 + (i % 10) * 2500 + Math.floor(Math.random() * 5000)

    orders.push({
      id: `admin-order-${i}`,
      orderNumber: `AO-25${String(i).padStart(4, "0")}`,
      quoteNumber: `Q-${creators[i % creators.length].substring(0, 2).toUpperCase()}250${i % 100}`,
      customer: customers[i % customers.length],
      orderDate: orderDate.toISOString().split("T")[0],
      totalAmount: total,
      currency: "AUD",
      currentStatus: ALL_ORDER_STATUSES[i % ALL_ORDER_STATUSES.length],
      salesRep: salesReps[i % salesReps.length],
      createdBy: creators[i % creators.length],
      lastModifiedBy: creators[i % creators.length], // Initially, same as createdBy or a default admin
      lastModifiedDate: orderDate.toISOString(), // Initially, same as orderDate
    })
  }
  return orders
}

let mockAdminOrders: SalesOrderAdminItem[] = generateAdminMockOrders()

export const getAdminOrders = async (): Promise<SalesOrderAdminItem[]> => {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return JSON.parse(JSON.stringify(mockAdminOrders))
}

export const updateAdminOrderStatus = async (
  orderId: string,
  newStatus: OrderStatus,
  operatorName: string, // Added: Name of the admin performing the action
): Promise<SalesOrderAdminItem | null> => {
  await new Promise((resolve) => setTimeout(resolve, 300))
  const orderIndex = mockAdminOrders.findIndex((order) => order.id === orderId)
  if (orderIndex !== -1) {
    mockAdminOrders[orderIndex].currentStatus = newStatus
    mockAdminOrders[orderIndex].lastModifiedBy = operatorName
    mockAdminOrders[orderIndex].lastModifiedDate = new Date().toISOString()
    return JSON.parse(JSON.stringify(mockAdminOrders[orderIndex]))
  }
  return null
}

export const deleteAdminOrder = async (orderId: string, operatorName: string): Promise<boolean> => {
  await new Promise((resolve) => setTimeout(resolve, 300))
  const initialLength = mockAdminOrders.length
  const orderToDelete = mockAdminOrders.find((order) => order.id === orderId)
  mockAdminOrders = mockAdminOrders.filter((order) => order.id !== orderId)
  if (mockAdminOrders.length < initialLength && orderToDelete) {
    console.log(`Order ${orderToDelete.orderNumber} deleted by ${operatorName} on ${new Date().toISOString()}`)
    return true
  }
  return false
}

// --- Aliases so the admin UI can use friendlier names ---
export {
  getAdminOrders as getAdminSalesOrders,
  updateAdminOrderStatus as updateAdminSalesOrderStatus,
  deleteAdminOrder as deleteAdminSalesOrder,
}
