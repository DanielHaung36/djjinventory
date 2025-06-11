"use client"

import type React from "react"

import { useState } from "react"
import { Save, X, Plus, Trash2, ImageIcon } from "lucide-react"
import type { SalesOrder, OrderItem } from "../../types/sales-order"

interface CreateOrderFormProps {
  onSave: (order: Partial<SalesOrder>) => void
  onCancel: () => void
}

export default function CreateOrderForm({ onSave, onCancel }: CreateOrderFormProps) {
  const [formData, setFormData] = useState({
    customer: "",
    machineModel: "",
    orderDate: new Date().toISOString().split("T")[0],
    eta: "",
    total: "",
    quoteNumber: "",
    quoteDate: "",
    createdBy: "",
    quoteContent: "",
    specifications: [""],
    paymentTerms: "30% deposit, 70% on delivery",
    deliveryAddress: "",
    contactPerson: "",
    contactPhone: "",
    contactEmail: "",
  })

  const [orderItems, setOrderItems] = useState<Partial<OrderItem>[]>([
    {
      id: `item-${Date.now()}`,
      name: "",
      description: "",
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      specifications: [],
    },
  ])

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [itemErrors, setItemErrors] = useState<Record<string, Record<string, string>>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    const newItemErrors: Record<string, Record<string, string>> = {}

    if (!formData.customer.trim()) newErrors.customer = "Customer name is required"
    if (!formData.machineModel.trim()) newErrors.machineModel = "Machine model is required"
    if (!formData.quoteNumber.trim()) newErrors.quoteNumber = "Quote number is required"
    if (!formData.createdBy.trim()) newErrors.createdBy = "Created by is required"
    if (!formData.contactPerson.trim()) newErrors.contactPerson = "Contact person is required"
    if (!formData.contactEmail.trim()) newErrors.contactEmail = "Contact email is required"

    // Validate order items
    let hasItemErrors = false
    orderItems.forEach((item, index) => {
      const itemError: Record<string, string> = {}
      if (!item.name?.trim()) {
        itemError.name = "Item name is required"
        hasItemErrors = true
      }
      if (!item.quantity || item.quantity <= 0) {
        itemError.quantity = "Quantity must be greater than 0"
        hasItemErrors = true
      }
      if (!item.unitPrice || item.unitPrice <= 0) {
        itemError.unitPrice = "Unit price must be greater than 0"
        hasItemErrors = true
      }

      if (Object.keys(itemError).length > 0) {
        newItemErrors[item.id as string] = itemError
      }
    })

    setErrors(newErrors)
    setItemErrors(newItemErrors)
    return Object.keys(newErrors).length === 0 && !hasItemErrors
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      const orderNumber = `ORD-${Date.now()}`
      const calculatedTotal = orderItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0)
      
      onSave({
        ...formData,
        orderNumber,
        total: calculatedTotal,
        items: orderItems as OrderItem[],
      })
    }
  }

  const addSpecification = () => {
    setFormData((prev) => ({
      ...prev,
      specifications: [...prev.specifications, ""],
    }))
  }

  const removeSpecification = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index),
    }))
  }

  const updateSpecification = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      specifications: prev.specifications.map((spec, i) => (i === index ? value : spec)),
    }))
  }

  const addOrderItem = () => {
    setOrderItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}`,
        name: "",
        description: "",
        quantity: 1,
        unitPrice: 0,
        totalPrice: 0,
        specifications: [],
      },
    ])
  }

  const removeOrderItem = (id: string) => {
    setOrderItems((prev) => prev.filter((item) => item.id !== id))
  }

  const updateOrderItem = (id: string, field: string, value: any) => {
    setOrderItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value }
          
          // Recalculate total price if quantity or unit price changes
          if (field === "quantity" || field === "unitPrice") {
            const quantity = field === "quantity" ? value : (item.quantity || 0)
            const unitPrice = field === "unitPrice" ? value : (item.unitPrice || 0)
            updatedItem.totalPrice = quantity * unitPrice
          }
          
          return updatedItem
        }
        return item
      })
    )
  }

  const addItemSpecification = (itemId: string) => {
    setOrderItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            specifications: [...(item.specifications || []), ""],
          }
        }
        return item
      })
    )
  }

  const removeItemSpecification = (itemId: string, index: number) => {
    setOrderItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            specifications: (item.specifications || []).filter((_, i) => i !== index),
          }
        }
        return item
      })
    )
  }

  const updateItemSpecification = (itemId: string, index: number, value: string) => {
    setOrderItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            specifications: (item.specifications || []).map((spec, i) => (i === index ? value : spec)),
          }
        }
        return item
      })
    )
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 overflow-y-auto h-full">   
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Create New Order</h1>
              <p className="text-blue-100 mt-1">Fill in the details to create a new sales order</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="px-4 py-2 border border-white/50 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Create Order
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
                <input
                  type="text"
                  value={formData.customer}
                  onChange={(e) => setFormData((prev) => ({ ...prev, customer: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.customer ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter customer name"
                />
                {errors.customer && <p className="text-red-500 text-xs mt-1">{errors.customer}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Machine Model *</label>
                <select
                  value={formData.machineModel}
                  onChange={(e) => setFormData((prev) => ({ ...prev, machineModel: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.machineModel ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select machine model</option>
                  <option value="LM930 Wheel Loader">LM930 Wheel Loader</option>
                  <option value="LM940 Wheel Loader">LM940 Wheel Loader</option>
                  <option value="EX200 Excavator">EX200 Excavator</option>
                  <option value="EX300 Excavator">EX300 Excavator</option>
                  <option value="BD100 Bulldozer">BD100 Bulldozer</option>
                </select>
                {errors.machineModel && <p className="text-red-500 text-xs mt-1">{errors.machineModel}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order Date *</label>
                <input
                  type="date"
                  value={formData.orderDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, orderDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Delivery Date</label>
                <input
                  type="date"
                  value={formData.eta}
                  onChange={(e) => setFormData((prev) => ({ ...prev, eta: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Created By *</label>
                <input
                  type="text"
                  value={formData.createdBy}
                  onChange={(e) => setFormData((prev) => ({ ...prev, createdBy: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.createdBy ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter your name"
                />
                {errors.createdBy && <p className="text-red-500 text-xs mt-1">{errors.createdBy}</p>}
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Order Items</h2>
              <button
                type="button"
                onClick={addOrderItem}
                className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            </div>

            <div className="space-y-6">
              {orderItems.map((item, itemIndex) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium text-gray-900">Item {itemIndex + 1}</h3>
                    {orderItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeOrderItem(item.id as string)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
                      <input
                        type="text"
                        value={item.name || ""}
                        onChange={(e) => updateOrderItem(item.id as string, "name", e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          itemErrors[item.id as string]?.name ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Enter item name"
                      />
                      {itemErrors[item.id as string]?.name && (
                        <p className="text-red-500 text-xs mt-1">{itemErrors[item.id as string].name}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <input
                        type="text"
                        value={item.description || ""}
                        onChange={(e) => updateOrderItem(item.id as string, "description", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter item description"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                      <input
                        type="number"
                        value={item.quantity || ""}
                        onChange={(e) => updateOrderItem(item.id as string, "quantity", Number(e.target.value))}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          itemErrors[item.id as string]?.quantity ? "border-red-500" : "border-gray-300"
                        }`}
                        min="1"
                        step="1"
                      />
                      {itemErrors[item.id as string]?.quantity && (
                        <p className="text-red-500 text-xs mt-1">{itemErrors[item.id as string].quantity}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price ($) *</label>
                      <input
                        type="number"
                        value={item.unitPrice || ""}
                        onChange={(e) => updateOrderItem(item.id as string, "unitPrice", Number(e.target.value))}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          itemErrors[item.id as string]?.unitPrice ? "border-red-500" : "border-gray-300"
                        }`}
                        min="0"
                        step="0.01"
                      />
                      {itemErrors[item.id as string]?.unitPrice && (
                        <p className="text-red-500 text-xs mt-1">{itemErrors[item.id as string].unitPrice}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Total Price ($)</label>
                      <input
                        type="text"
                        value={item.totalPrice?.toFixed(2) || "0.00"}
                        readOnly
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (optional)</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={item.image || ""}
                          onChange={(e) => updateOrderItem(item.id as string, "image", e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter image URL"
                        />
                        <button
                          type="button"
                          className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <ImageIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Item Specifications */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">Specifications</label>
                      <button
                        type="button"
                        onClick={() => addItemSpecification(item.id as string)}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        Add
                      </button>
                    </div>
                    <div className="space-y-2">
                      {(item.specifications || []).map((spec, specIndex) => (
                        <div key={specIndex} className="flex gap-2">
                          <input
                            type="text"
                            value={spec}
                            onChange={(e) => updateItemSpecification(item.id as string, specIndex, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder={`Specification ${specIndex + 1}`}
                          />
                          {(item.specifications || []).length > 0 && (
                            <button
                              type="button"
                              onClick={() => removeItemSpecification(item.id as string, specIndex)}
                              className="px-2 py-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      {(item.specifications || []).length === 0 && (
                        <p className="text-sm text-gray-500 italic">No specifications added</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Order Amount:</span>
                <span className="text-xl font-bold text-blue-600">
                  ${orderItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Quote Information */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quote Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quote Number *</label>
                <input
                  type="text"
                  value={formData.quoteNumber}
                  onChange={(e) => setFormData((prev) => ({ ...prev, quoteNumber: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.quoteNumber ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="QUO-YYYYMMDD-XXX"
                />
                {errors.quoteNumber && <p className="text-red-500 text-xs mt-1">{errors.quoteNumber}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quote Date</label>
                <input
                  type="date"
                  value={formData.quoteDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, quoteDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Quote Content</label>
                <textarea
                  value={formData.quoteContent}
                  onChange={(e) => setFormData((prev) => ({ ...prev, quoteContent: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Describe the quote content and specifications"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person *</label>
                <input
                  type="text"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData((prev) => ({ ...prev, contactPerson: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.contactPerson ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter contact person name"
                />
                {errors.contactPerson && <p className="text-red-500 text-xs mt-1">{errors.contactPerson}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, contactPhone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email *</label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData((prev) => ({ ...prev, contactEmail: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.contactEmail ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="contact@company.com"
                />
                {errors.contactEmail && <p className="text-red-500 text-xs mt-1">{errors.contactEmail}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
                <select
                  value={formData.paymentTerms}
                  onChange={(e) => setFormData((prev) => ({ ...prev, paymentTerms: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="30% deposit, 70% on delivery">30% deposit, 70% on delivery</option>
                  <option value="50% deposit, 50% on delivery">50% deposit, 50% on delivery</option>
                                     <option value="100% advance payment">100% advance payment</option>
                  <option value="Net 30 days">Net 30 days</option>
                  <option value="Net 60 days">Net 60 days</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
                <textarea
                  value={formData.deliveryAddress}
                  onChange={(e) => setFormData((prev) => ({ ...prev, deliveryAddress: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Enter complete delivery address"
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Create Order
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


