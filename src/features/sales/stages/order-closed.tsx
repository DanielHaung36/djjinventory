"use client"

import { CheckCircle, Download, FileText, Calendar, Shield, ThumbsUp, Headphones, Star } from "lucide-react"
import { useState } from "react"

export default function OrderClosedStage() {
  const [rating, setRating] = useState(0)

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-6 h-6" />
          <div>
            <h2 className="text-xl font-bold">Order Closed</h2>
            <p className="text-purple-100">Order successfully completed</p>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">Delivery Confirmation</h3>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-purple-600" />
                  <span className="font-semibold text-purple-800">Delivery Complete</span>
                </div>
                <p className="text-purple-700 mb-3">Your order has been successfully delivered and received.</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-purple-600">Delivery Date</p>
                    <p className="font-semibold text-purple-800">May 15, 2025</p>
                  </div>
                  <div>
                    <p className="text-xs text-purple-600">Signed By</p>
                    <p className="font-semibold text-purple-800">John Smith</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">Warranty Information</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">Extended Warranty</p>
                    <p className="text-sm text-gray-600">3 Years Full Coverage</p>
                  </div>
                </div>
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-purple-600" />
                    <span className="text-xs text-gray-600">Warranty Period</span>
                  </div>
                  <p className="font-medium ml-6">May 15, 2025 - May 15, 2028</p>
                </div>
                <button className="w-full border border-purple-500 text-purple-600 py-2 px-4 rounded-lg hover:bg-purple-50 transition-colors flex items-center justify-center gap-2">
                  <FileText className="w-4 h-4" />
                  View Warranty Details
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">Customer Satisfaction</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="font-medium mb-2">Rate your experience</p>
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`w-8 h-8 ${
                        star <= rating ? "text-purple-500" : "text-gray-300"
                      } hover:text-purple-400 transition-colors`}
                    >
                      <Star className="w-full h-full fill-current" />
                    </button>
                  ))}
                </div>
                <button className="w-full border border-purple-500 text-purple-600 py-2 px-4 rounded-lg hover:bg-purple-50 transition-colors flex items-center justify-center gap-2">
                  <ThumbsUp className="w-4 h-4" />
                  Complete Satisfaction Survey
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">Documentation</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="space-y-2">
                  {["Download User Manual", "Download Maintenance Schedule", "Download Completion Certificate"].map(
                    (item, index) => (
                      <button
                        key={index}
                        className="w-full text-left text-purple-600 py-2 px-3 rounded hover:bg-purple-50 transition-colors flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        {item}
                      </button>
                    ),
                  )}
                </div>
              </div>
            </div>

            <button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-purple-600 hover:to-purple-700 transition-colors flex items-center justify-center gap-2">
              <Headphones className="w-4 h-4" />
              Contact Customer Support
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
