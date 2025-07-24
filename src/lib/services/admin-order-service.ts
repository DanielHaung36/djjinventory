import type { SalesOrderAdminItem, OrderStatus } from "@/lib/types/sales-order-admin"
import { store } from "../../app/store"
import { salesApi } from "../../features/sales/salesApi"

// Transform backend order data to admin format
const transformOrderToAdminFormat = (order: any): SalesOrderAdminItem => {
  return {
    id: order.id?.toString() || order.orderNumber,
    orderNumber: order.orderNumber,
    quoteNumber: order.quoteNumber || '',
    customer: order.customer || 'Unknown Customer',
    orderDate: order.orderDate || order.createdAt,
    totalAmount: order.total || order.totalAmount || 0,
    currency: order.currency || 'USD',
    currentStatus: order.status as OrderStatus,
    salesRep: order.salesRep || order.createdBy,
    createdBy: order.createdBy || 'System',
    lastModifiedBy: order.lastModifiedBy || order.createdBy,
    lastModifiedDate: order.updatedAt || order.createdAt,
  }
}

export const getAdminOrders = async (): Promise<SalesOrderAdminItem[]> => {
  try {
    const result = await store.dispatch(
      salesApi.endpoints.getOrders.initiate({ limit: 100 })
    ).unwrap()
    
    return result.data.map(transformOrderToAdminFormat)
  } catch (error) {
    console.error('Failed to fetch orders for admin:', error)
    throw new Error('Failed to load orders')
  }
}

export const updateAdminOrderStatus = async (
  orderId: string,
  newStatus: OrderStatus,
  operatorName: string,
): Promise<SalesOrderAdminItem | null> => {
  try {
    // Convert orderId to number if it's a string
    const numericOrderId = parseInt(orderId.replace(/\D/g, '')) || parseInt(orderId)
    
    await store.dispatch(
      salesApi.endpoints.updateOrderStatus.initiate({
        id: numericOrderId,
        status: newStatus as any
      })
    ).unwrap()
    
    // Fetch updated order
    const updatedOrder = await store.dispatch(
      salesApi.endpoints.getOrderById.initiate(numericOrderId)
    ).unwrap()
    
    return transformOrderToAdminFormat(updatedOrder.data)
  } catch (error) {
    console.error('Failed to update order status:', error)
    throw new Error('Failed to update order status')
  }
}

export const deleteAdminOrder = async (orderId: string, operatorName: string): Promise<boolean> => {
  try {
    // Convert orderId to number if it's a string
    const numericOrderId = parseInt(orderId.replace(/\D/g, '')) || parseInt(orderId)
    
    // Call cancel order instead of delete since orders shouldn't be deleted
    await store.dispatch(
      salesApi.endpoints.cancelOrder.initiate({
        id: numericOrderId,
        reason: `Cancelled by admin: ${operatorName}`
      })
    ).unwrap()
    
    return true
  } catch (error) {
    console.error('Failed to cancel order:', error)
    throw new Error('Failed to cancel order')
  }
}

// --- Aliases so the admin UI can use friendlier names ---
export {
  getAdminOrders as getAdminSalesOrders,
  updateAdminOrderStatus as updateAdminSalesOrderStatus,
  deleteAdminOrder as deleteAdminSalesOrder,
}
