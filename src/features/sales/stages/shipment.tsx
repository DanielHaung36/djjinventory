import { Truck, MapPin, Calendar, Clock, Home, Edit, ExternalLink, Phone } from "lucide-react"

export default function ShipmentStage() {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-4">
        <div className="flex items-center gap-3">
          <Truck className="w-6 h-6" />
          <div>
            <h2 className="text-xl font-bold">Shipment</h2>
            <p className="text-indigo-100">Your order is on its way</p>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">Tracking Information</h3>
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="w-5 h-5 text-indigo-600" />
                  <span className="font-semibold text-indigo-800">In Transit</span>
                </div>
                <p className="text-indigo-700 mb-3">Your order has been shipped and is currently in transit.</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-indigo-600">Carrier</p>
                    <p className="font-semibold text-indigo-800">Express Freight</p>
                  </div>
                  <div>
                    <p className="text-xs text-indigo-600">Tracking Number</p>
                    <p className="font-semibold text-indigo-800">EF2025051289</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">Current Location</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">Chicago Distribution Center</p>
                    <p className="text-sm text-gray-600">Last updated: May 12, 2025 - 14:30 EST</p>
                  </div>
                </div>
                <button className="w-full border border-indigo-500 text-indigo-600 py-2 px-4 rounded-lg hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  View Live Tracking Map
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">Delivery Information</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-indigo-600" />
                      <span className="text-xs text-gray-600">Estimated Delivery</span>
                    </div>
                    <p className="font-semibold ml-6">May 15, 2025</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-indigo-600" />
                      <span className="text-xs text-gray-600">Time Window</span>
                    </div>
                    <p className="font-semibold ml-6">9:00 AM - 12:00 PM</p>
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-3 mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Home className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs text-gray-600">Delivery Address</span>
                  </div>
                  <div className="ml-6">
                    <p className="font-medium">
                      1234 Main Street
                      <br />
                      Suite 500
                      <br />
                      Anytown, CA 12345
                    </p>
                  </div>
                </div>
                <button className="ml-6 text-indigo-600 text-sm hover:underline flex items-center gap-1">
                  <Edit className="w-3 h-3" />
                  Edit Address
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">Carrier Contact</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">Express Freight Support</p>
                    <p className="text-sm text-gray-600">1-800-555-1234</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-indigo-600 hover:to-indigo-700 transition-colors">
                Schedule Delivery Appointment
              </button>
              <button className="w-full border border-indigo-500 text-indigo-600 py-3 px-4 rounded-lg font-semibold hover:bg-indigo-50 transition-colors">
                Update Delivery Instructions
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
