"use client"

import type React from "react"

import { useState } from "react"
import { Save, X, AlertTriangle, DollarSign } from "lucide-react"

interface EditFinalPaymentFormProps {
  orderNumber: string
  onSave: (data: any) => void
  onCancel: () => void
}

export default function EditFinalPaymentForm({ orderNumber, onSave, onCancel }: EditFinalPaymentFormProps) {
  const [formData, setFormData] = useState({
    remainingAmount: "31500",
    dueDate: "2025-05-10",
    paymentMethod: "",
    reminderSent: false,
    extensionRequested: false,
    extensionDate: "",
    extensionReason: "",
    paymentInstructions: "Please transfer the final payment to our bank account",
    latePaymentFee: "0",
    notes: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const sendReminder = () => {
    setFormData((prev) => ({ ...prev, reminderSent: true }))
    // Here you would typically call an API to send the reminder
    alert("Payment reminder sent to customer")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 overflow-y-auto full-height">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Manage Final Payment</h1>
              <p className="text-amber-100 mt-1">Order: {orderNumber}</p>
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
                className="px-4 py-2 bg-white text-amber-600 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Payment Information */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remaining Amount ($)</label>
                <input
                  type="number"
                  value={formData.remainingAmount}
                  onChange={(e) => setFormData((prev) => ({ ...prev, remainingAmount: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Payment Method</label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData((prev) => ({ ...prev, paymentMethod: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="">Select payment method</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="wire_transfer">Wire Transfer</option>
                  <option value="check">Check</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Late Payment Fee ($)</label>
                <input
                  type="number"
                  value={formData.latePaymentFee}
                  onChange={(e) => setFormData((prev) => ({ ...prev, latePaymentFee: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  step="0.01"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Instructions</label>
              <textarea
                value={formData.paymentInstructions}
                onChange={(e) => setFormData((prev) => ({ ...prev, paymentInstructions: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                rows={3}
              />
            </div>
          </div>

          {/* Payment Extension */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Extension</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="extensionRequested"
                  checked={formData.extensionRequested}
                  onChange={(e) => setFormData((prev) => ({ ...prev, extensionRequested: e.target.checked }))}
                  className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                />
                <label htmlFor="extensionRequested" className="text-sm font-medium text-gray-700">
                  Customer has requested payment extension
                </label>
              </div>

              {formData.extensionRequested && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Due Date</label>
                    <input
                      type="date"
                      value={formData.extensionDate}
                      onChange={(e) => setFormData((prev) => ({ ...prev, extensionDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Extension Reason</label>
                    <textarea
                      value={formData.extensionReason}
                      onChange={(e) => setFormData((prev) => ({ ...prev, extensionReason: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      rows={2}
                      placeholder="Reason for payment extension request"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={sendReminder}
                className="p-4 border border-amber-500 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors flex items-center gap-3"
              >
                <AlertTriangle className="w-5 h-5" />
                <div className="text-left">
                  <p className="font-medium">Send Payment Reminder</p>
                  <p className="text-sm">Email customer about pending payment</p>
                </div>
              </button>

              <button
                type="button"
                className="p-4 border border-green-500 text-green-600 rounded-lg hover:bg-green-50 transition-colors flex items-center gap-3"
              >
                <DollarSign className="w-5 h-5" />
                <div className="text-left">
                  <p className="font-medium">Process Payment</p>
                  <p className="text-sm">Mark payment as received</p>
                </div>
              </button>
            </div>

            {formData.reminderSent && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 text-sm">✓ Payment reminder sent successfully</p>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Notes</h2>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              rows={4}
              placeholder="Add any additional notes about the final payment"
            />
          </div>
        </form>
      </div>
    </div>
  )
}
