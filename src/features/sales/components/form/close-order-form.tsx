"use client"

import type React from "react"

import { useState } from "react"
import { X, CheckCircle, AlertTriangle, Star } from "lucide-react"

interface CloseOrderFormProps {
  orderNumber: string
  onSave: (data: any) => void
  onCancel: () => void
}

export default function CloseOrderForm({ orderNumber, onSave, onCancel }: CloseOrderFormProps) {
  const [formData, setFormData] = useState({
    deliveryConfirmed: false,
    deliveryDate: "",
    signedBy: "",
    customerSatisfaction: 0,
    warrantyActivated: false,
    warrantyStartDate: "",
    warrantyEndDate: "",
    finalInvoiceSent: false,
    paymentReceived: false,
    documentsProvided: {
      userManual: false,
      warrantyCard: false,
      maintenanceSchedule: false,
      completionCertificate: false,
    },
    customerFeedback: "",
    internalNotes: "",
    followUpRequired: false,
    followUpDate: "",
    followUpReason: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.deliveryConfirmed) {
      newErrors.deliveryConfirmed = "Please confirm delivery completion"
    }
    if (!formData.deliveryDate) {
      newErrors.deliveryDate = "Delivery date is required"
    }
    if (!formData.signedBy.trim()) {
      newErrors.signedBy = "Signature recipient name is required"
    }
    if (!formData.paymentReceived) {
      newErrors.paymentReceived = "Please confirm all payments have been received"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSave(formData)
    }
  }

  const handleDocumentChange = (document: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      documentsProvided: {
        ...prev.documentsProvided,
        [document]: checked,
      },
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Close Order</h1>
              <p className="text-purple-100 mt-1">Order: {orderNumber}</p>
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
                className="px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Close Order
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Delivery Confirmation */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Delivery Confirmation</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="deliveryConfirmed"
                  checked={formData.deliveryConfirmed}
                  onChange={(e) => setFormData((prev) => ({ ...prev, deliveryConfirmed: e.target.checked }))}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="deliveryConfirmed" className="text-sm font-medium text-gray-700">
                  Confirm that the order has been successfully delivered and received by the customer
                </label>
              </div>
              {errors.deliveryConfirmed && <p className="text-red-500 text-xs">{errors.deliveryConfirmed}</p>}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Date *</label>
                  <input
                    type="date"
                    value={formData.deliveryDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, deliveryDate: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                      errors.deliveryDate ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.deliveryDate && <p className="text-red-500 text-xs mt-1">{errors.deliveryDate}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Signed By *</label>
                  <input
                    type="text"
                    value={formData.signedBy}
                    onChange={(e) => setFormData((prev) => ({ ...prev, signedBy: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                      errors.signedBy ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Name of person who signed for delivery"
                  />
                  {errors.signedBy && <p className="text-red-500 text-xs mt-1">{errors.signedBy}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Customer Satisfaction */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Customer Satisfaction</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rate Customer Satisfaction</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, customerSatisfaction: star }))}
                      className={`w-8 h-8 ${
                        star <= formData.customerSatisfaction ? "text-purple-500" : "text-gray-300"
                      } hover:text-purple-400 transition-colors`}
                    >
                      <Star className="w-full h-full fill-current" />
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {formData.customerSatisfaction === 0 && "No rating selected"}
                  {formData.customerSatisfaction === 1 && "Very Dissatisfied"}
                  {formData.customerSatisfaction === 2 && "Dissatisfied"}
                  {formData.customerSatisfaction === 3 && "Neutral"}
                  {formData.customerSatisfaction === 4 && "Satisfied"}
                  {formData.customerSatisfaction === 5 && "Very Satisfied"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Feedback</label>
                <textarea
                  value={formData.customerFeedback}
                  onChange={(e) => setFormData((prev) => ({ ...prev, customerFeedback: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  rows={3}
                  placeholder="Any feedback or comments from the customer"
                />
              </div>
            </div>
          </div>

          {/* Warranty Information */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Warranty Information</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="warrantyActivated"
                  checked={formData.warrantyActivated}
                  onChange={(e) => setFormData((prev) => ({ ...prev, warrantyActivated: e.target.checked }))}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="warrantyActivated" className="text-sm font-medium text-gray-700">
                  Warranty has been activated
                </label>
              </div>

              {formData.warrantyActivated && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Warranty Start Date</label>
                    <input
                      type="date"
                      value={formData.warrantyStartDate}
                      onChange={(e) => setFormData((prev) => ({ ...prev, warrantyStartDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Warranty End Date</label>
                    <input
                      type="date"
                      value={formData.warrantyEndDate}
                      onChange={(e) => setFormData((prev) => ({ ...prev, warrantyEndDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Confirmation */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Confirmation</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="finalInvoiceSent"
                  checked={formData.finalInvoiceSent}
                  onChange={(e) => setFormData((prev) => ({ ...prev, finalInvoiceSent: e.target.checked }))}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="finalInvoiceSent" className="text-sm font-medium text-gray-700">
                  Final invoice has been sent to customer
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="paymentReceived"
                  checked={formData.paymentReceived}
                  onChange={(e) => setFormData((prev) => ({ ...prev, paymentReceived: e.target.checked }))}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="paymentReceived" className="text-sm font-medium text-gray-700">
                  All payments have been received in full *
                </label>
              </div>
              {errors.paymentReceived && <p className="text-red-500 text-xs">{errors.paymentReceived}</p>}
            </div>
          </div>

          {/* Documentation */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Documentation Provided</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: "userManual", label: "User Manual" },
                { key: "warrantyCard", label: "Warranty Card" },
                { key: "maintenanceSchedule", label: "Maintenance Schedule" },
                { key: "completionCertificate", label: "Completion Certificate" },
              ].map((doc) => (
                <div key={doc.key} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id={doc.key}
                    checked={formData.documentsProvided[doc.key as keyof typeof formData.documentsProvided]}
                    onChange={(e) => handleDocumentChange(doc.key, e.target.checked)}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <label htmlFor={doc.key} className="text-sm font-medium text-gray-700">
                    {doc.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Follow-up */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Follow-up Required</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="followUpRequired"
                  checked={formData.followUpRequired}
                  onChange={(e) => setFormData((prev) => ({ ...prev, followUpRequired: e.target.checked }))}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="followUpRequired" className="text-sm font-medium text-gray-700">
                  Schedule follow-up with customer
                </label>
              </div>

              {formData.followUpRequired && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Date</label>
                    <input
                      type="date"
                      value={formData.followUpDate}
                      onChange={(e) => setFormData((prev) => ({ ...prev, followUpDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Reason</label>
                    <textarea
                      value={formData.followUpReason}
                      onChange={(e) => setFormData((prev) => ({ ...prev, followUpReason: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      rows={2}
                      placeholder="Reason for follow-up (e.g., training, maintenance check, satisfaction survey)"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Internal Notes */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Internal Notes</h2>
            <textarea
              value={formData.internalNotes}
              onChange={(e) => setFormData((prev) => ({ ...prev, internalNotes: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              rows={4}
              placeholder="Add any internal notes about the order completion"
            />
          </div>

          {/* Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-amber-800">Important Notice</h3>
                <p className="text-sm text-amber-700 mt-1">
                  Once you close this order, it cannot be reopened. Please ensure all information is accurate and
                  complete before proceeding.
                </p>
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
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Close Order
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
