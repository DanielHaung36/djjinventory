"use client"

import { useState } from "react"
import { X, Download, Printer, Plus, Check, Package, Calendar, User, FileText, Loader2 } from "lucide-react"
import type { SalesOrder, OrderItem } from "./types/sales-order"
import { useDownloadPickingListPDFMutation } from "./salesApi"

interface PickingListDrawerProps {
  isOpen: boolean
  onClose: () => void
  order: SalesOrder
}

interface PickingItem extends OrderItem {
  picked: boolean
  pickedQuantity: number
  notes?: string
}

export default function PickingListDrawer({ isOpen, onClose, order }: PickingListDrawerProps) {
  const [pickingItems, setPickingItems] = useState<PickingItem[]>(
    order.items?.map((item) => ({
      ...item,
      picked: false,
      pickedQuantity: 0,
      notes: "",
    })) || [],
  )

  const [showCompleted, setShowCompleted] = useState(true)
  const [downloadPickingListPDF, { isLoading: isDownloading }] = useDownloadPickingListPDFMutation()

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const toggleItemPicked = (itemId: string) => {
    setPickingItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const newPicked = !item.picked
          return {
            ...item,
            picked: newPicked,
            pickedQuantity: newPicked ? item.quantity : 0,
          }
        }
        return item
      }),
    )
  }

  const updatePickedQuantity = (itemId: string, quantity: number) => {
    setPickingItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            pickedQuantity: Math.min(Math.max(0, quantity), item.quantity),
            picked: quantity > 0,
          }
        }
        return item
      }),
    )
  }

  const updateNotes = (itemId: string, notes: string) => {
    setPickingItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          return { ...item, notes }
        }
        return item
      }),
    )
  }

  const completedItems = pickingItems.filter((item) => item.picked).length
  const totalItems = pickingItems.length
  const completionPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = async () => {
    try {
      // 调用API生成PDF
      const pdfBlob = await downloadPickingListPDF(order.id).unwrap()
      
      // 创建下载链接
      const url = window.URL.createObjectURL(pdfBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `picking-list-${order.orderNumber}.pdf`
      
      // 触发下载
      document.body.appendChild(link)
      link.click()
      
      // 清理
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to download picking list PDF:', error)
      alert('Failed to download PDF. Please try again.')
    }
  }

  const handleGenerateNewOrder = () => {
    // Logic to generate new order from picked items
    alert("Generating new order from picked items...")
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-9999 transform transition-transform duration-300 ease-in-out overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Picking List</h2>
              <p className="text-blue-100 mt-1">
                {order.orderNumber} - {order.customer?.name || 'Unknown Customer'}
              </p>
            </div>
            <button onClick={onClose} className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress */}
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Progress</span>
              <span>
                {completedItems} of {totalItems} items picked
              </span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className="bg-green-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Order Info */}
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex-shrink-0">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-gray-500">Customer</p>
                <p className="font-medium">{order.customer?.name || 'Unknown Customer'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-gray-500">Order Date</p>
                <p className="font-medium">{order.orderDate}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-gray-500">Total Items</p>
                <p className="font-medium">{totalItems}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-b border-gray-200 flex gap-2 flex-wrap flex-shrink-0">
          <button
            onClick={handlePrint}
            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm"
          >
            <Printer className="w-4 h-4" />
            Print List
          </button>
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download PDF
              </>
            )}
          </button>
          <button
            onClick={handleGenerateNewOrder}
            className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            New Order from Picked
          </button>
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors flex items-center gap-2 text-sm"
          >
            <FileText className="w-4 h-4" />
            {showCompleted ? "Hide" : "Show"} Completed
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {pickingItems
              .filter((item) => showCompleted || !item.picked)
              .map((item) => (
                <div
                  key={item.id}
                  className={`border rounded-lg p-4 transition-all duration-200 ${
                    item.picked ? "bg-green-50 border-green-200" : "bg-white border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleItemPicked(item.id)}
                      className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        item.picked
                          ? "bg-green-500 border-green-500 text-white"
                          : "border-gray-300 hover:border-blue-500"
                      }`}
                    >
                      {item.picked && <Check className="w-3 h-3" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className={`font-medium ${item.picked ? "line-through text-gray-500" : "text-gray-900"}`}>
                            {item.name}
                          </h4>
                          <p className="text-sm text-gray-600">{item.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(item.totalPrice)}</p>
                          <p className="text-sm text-gray-500">{formatCurrency(item.unitPrice)} each</p>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Required Quantity</label>
                          <div className="px-3 py-2 bg-gray-100 rounded text-sm font-medium">{item.quantity}</div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Picked Quantity</label>
                          <input
                            type="number"
                            min="0"
                            max={item.quantity}
                            value={item.pickedQuantity}
                            onChange={(e) => updatePickedQuantity(item.id, Number(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>

                      {/* Specifications */}
                      {item.specifications && item.specifications.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs font-medium text-gray-700 mb-1">Specifications:</p>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {item.specifications.slice(0, 3).map((spec, index) => (
                              <li key={index} className="flex items-center gap-1">
                                <span className="w-1 h-1 bg-gray-400 rounded-full flex-shrink-0" />
                                {spec}
                              </li>
                            ))}
                            {item.specifications.length > 3 && (
                              <li className="text-gray-500 italic">
                                +{item.specifications.length - 3} more specifications
                              </li>
                            )}
                          </ul>
                        </div>
                      )}

                      {/* Notes */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Picking Notes</label>
                        <textarea
                          value={item.notes || ""}
                          onChange={(e) => updateNotes(item.id, e.target.value)}
                          placeholder="Add notes about this item..."
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Footer Summary */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">
                {completedItems} of {totalItems} items picked
              </p>
              <p className="text-xs text-gray-500">{completionPercentage.toFixed(0)}% complete</p>
            </div>
            <div className="text-right">
              <p className="font-medium">Total Value</p>
              <p className="text-lg font-bold text-green-600">{formatCurrency(order.total || 0)}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
