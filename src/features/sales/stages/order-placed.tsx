import { CheckCircle, FileText, Download, Calendar, Truck, Settings, Check } from "lucide-react"

export default function OrderPlacedStage() {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6" />
          <div>
            <h2 className="text-xl font-bold">Order Placed</h2>
            <p className="text-blue-100">Order officially submitted</p>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">Order Confirmation</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-blue-800">Order Confirmed</span>
                </div>
                <p className="text-blue-700 mb-3">Your order has been officially placed and entered into our system.</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-blue-600">Order Number</p>
                    <p className="font-semibold text-blue-800">ORD-2025050301</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-600">Order Date</p>
                    <p className="font-semibold text-blue-800">May 3, 2025</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">Sales Representative</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    MS
                  </div>
                  <div>
                    <p className="font-semibold">Michael Smith</p>
                    <p className="text-sm text-gray-600">Senior Sales Manager</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 border border-blue-500 text-blue-600 rounded text-sm hover:bg-blue-50">
                    Email
                  </button>
                  <button className="px-3 py-1 border border-blue-500 text-blue-600 rounded text-sm hover:bg-blue-50">
                    Call
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">Order Specifications</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="space-y-3">
                  {[
                    "LM930 Wheel Loader - Standard Configuration",
                    "Extended Warranty Package (3 years)",
                    "Premium Operator Cabin with Climate Control",
                    "Hydraulic Quick Coupler System",
                  ].map((spec, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">{spec}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 mt-4 pt-3 flex justify-between items-center">
                  <span className="text-sm font-medium">Manufacturing Queue Position</span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-semibold">#12</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">Estimated Timeline</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span className="text-xs text-gray-600">Production Start</span>
                    </div>
                    <p className="font-semibold ml-6">May 8, 2025</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Truck className="w-4 h-4 text-blue-600" />
                      <span className="text-xs text-gray-600">Estimated Delivery</span>
                    </div>
                    <p className="font-semibold ml-6">May 15, 2025</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-colors flex items-center justify-center gap-2">
                <Download className="w-4 h-4" />
                Download Order Confirmation
              </button>
              <button className="w-full border border-blue-500 text-blue-600 py-3 px-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
                <Settings className="w-4 h-4" />
                Update Delivery Preferences
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
