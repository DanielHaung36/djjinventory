"use client"

import { Package, DollarSign, Calendar, User } from "lucide-react"
import type { SalesOrder } from "../types/sales-order"

interface OrderSummaryWidgetProps {
  order: SalesOrder
  compact?: boolean
}

export default function OrderSummaryWidget({ order, compact = false }: OrderSummaryWidgetProps) {
  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  if (compact) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">{order.orderNumber}</h3>
          <span className="text-sm text-gray-500">{order.customer}</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-500">Items:</span>
            <span className="ml-1 font-medium">{order.items?.length || 0}</span>
          </div>
          <div>
            <span className="text-gray-500">Total:</span>
            <span className="ml-1 font-medium text-green-600">{formatCurrency(order.total || 0)}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-gray-600 to-gray-700 text-white p-4">
        <h3 className="text-lg font-bold">Order Summary</h3>
        <p className="text-gray-200 text-sm">{order.orderNumber}</p>
      </div>

      <div className="p-4">
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">Customer</p>
              <p className="font-medium text-sm">{order.customer}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">Order Date</p>
              <p className="font-medium text-sm">{order.orderDate}</p>
            </div>
          </div>
        </div>

        {/* Items Summary */}
        <div className="mb-4">
          <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
            <Package className="w-4 h-4" />
            Items ({order.items?.length || 0})
          </h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {order.items?.map((item) => (
              <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.name}</p>
                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm">{formatCurrency(item.totalPrice)}</p>
                </div>
              </div>
            )) || <p className="text-sm text-gray-500 italic">No items found</p>}
          </div>
        </div>

        {/* Total */}
        <div className="border-t border-gray-200 pt-3">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-900 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Total Amount
            </span>
            <span className="text-lg font-bold text-green-600">{formatCurrency(order.total || 0)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
