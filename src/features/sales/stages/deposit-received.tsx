import { CheckCircle, DollarSign, Download, Receipt, Calendar } from "lucide-react"

export default function DepositReceivedStage() {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4">
        <div className="flex items-center gap-3">
          <DollarSign className="w-6 h-6" />
          <div>
            <h2 className="text-xl font-bold">Deposit Received</h2>
            <p className="text-green-100">Initial payment confirmed</p>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">Payment Details</h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-800">Payment Confirmed</span>
                </div>
                <p className="text-green-700 mb-3">Your deposit payment has been received and confirmed.</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-green-600">Transaction ID</p>
                    <p className="font-semibold text-green-800">TXN-2025050289</p>
                  </div>
                  <div>
                    <p className="text-xs text-green-600">Payment Date</p>
                    <p className="font-semibold text-green-800">May 2, 2025</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">Payment Method</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">Bank Transfer</p>
                    <p className="text-sm text-gray-600">Account ending in 4389</p>
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
                    <p className="text-xs text-gray-600">Deposit Amount</p>
                    <p className="text-lg font-semibold text-green-600">$13,500.00</p>
                  </div>
                </div>
                <div className="border-t border-b border-gray-200 py-3 mb-3">
                  <p className="text-xs text-gray-600">Remaining Balance</p>
                  <p className="text-2xl font-bold text-red-500">$31,500.00</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Due by: <strong>May 10, 2025</strong>
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-red-50 text-red-700 px-3 py-2 rounded-lg">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">Final payment due in 8 days</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-colors flex items-center justify-center gap-2">
                <Download className="w-4 h-4" />
                Download Payment Receipt
              </button>
              <button className="w-full border border-green-500 text-green-600 py-3 px-4 rounded-lg font-semibold hover:bg-green-50 transition-colors flex items-center justify-center gap-2">
                <Receipt className="w-4 h-4" />
                View Invoice Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
