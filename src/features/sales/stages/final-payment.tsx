import { DollarSign, AlertTriangle, Upload, Receipt, Calendar, CreditCard, Building } from "lucide-react"

export default function FinalPaymentStage() {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white p-4">
        <div className="flex items-center gap-3">
          <DollarSign className="w-6 h-6" />
          <div>
            <h2 className="text-xl font-bold">Final Payment</h2>
            <p className="text-amber-100">Awaiting final payment</p>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">Payment Status</h3>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <span className="font-semibold text-amber-800">Payment Required</span>
                </div>
                <p className="text-amber-700 mb-3">Final payment is required to proceed with your order.</p>
                <div className="mb-2">
                  <p className="text-xs text-amber-600">Due Date</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-600" />
                    <span className="font-semibold text-amber-800">May 10, 2025</span>
                  </div>
                </div>
                <div className="mb-3">
                  <p className="text-xs text-amber-600 mb-1">Time Remaining</p>
                  <div className="w-full bg-amber-200 rounded-full h-2">
                    <div className="bg-amber-500 h-2 rounded-full" style={{ width: "30%" }}></div>
                  </div>
                  <p className="text-xs text-amber-600 mt-1">8 days remaining</p>
                </div>
                <div className="bg-red-50 text-red-700 px-3 py-2 rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-medium">Payment deadline approaching</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">Payment Methods</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="space-y-3">
                  <div className="border border-gray-200 rounded-lg p-3 flex items-center gap-3">
                    <Building className="w-5 h-5 text-amber-500" />
                    <div>
                      <p className="font-medium">Bank Transfer</p>
                      <p className="text-xs text-gray-600">2-3 business days to process</p>
                    </div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-3 flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-amber-500" />
                    <div>
                      <p className="font-medium">Credit Card</p>
                      <p className="text-xs text-gray-600">Processed immediately</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">Payment Summary</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-600">Order Total</p>
                    <p className="text-lg font-semibold">$45,000.00</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Deposit Paid</p>
                    <p className="text-lg font-semibold text-green-600">$13,500.00</p>
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <p className="text-xs text-gray-600">Final Payment Due</p>
                  <p className="text-2xl font-bold text-amber-500">$31,500.00</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-amber-600 hover:to-amber-700 transition-colors flex items-center justify-center gap-2">
                <DollarSign className="w-4 h-4" />
                Make Final Payment Now
              </button>
              <button className="w-full border border-amber-500 text-amber-600 py-3 px-4 rounded-lg font-semibold hover:bg-amber-50 transition-colors flex items-center justify-center gap-2">
                <Upload className="w-4 h-4" />
                Upload Payment Confirmation
              </button>
              <button className="w-full text-gray-600 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                <Receipt className="w-4 h-4" />
                Download Invoice
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
