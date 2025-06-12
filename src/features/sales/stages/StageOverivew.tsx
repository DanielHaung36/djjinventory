
import DepositReceivedStage from "../stages/deposit-received"
import OrderPlacedStage from "../stages/order-placed"
import FinalPaymentStage from "../stages/final-payment"
import ShipmentStage from "../stages/shipment"
import OrderClosedStage from "../stages/order-closed"
import { Clock, Download, CheckCircle } from "lucide-react"
interface StageOverviewProps {
    selectedStep: number;

 }



// Main order detail view
const StageOverview = ({selectedStep }: StageOverviewProps) => {
    switch (selectedStep) {
        case 1:
            return <DepositReceivedStage />
        case 2:
            return <OrderPlacedStage />
        case 3:
            return <FinalPaymentStage />
        case 4:
            return (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4">
                        <div className="flex items-center gap-3">
                            <Clock className="w-6 h-6" />
                            <div>
                                <h2 className="text-xl font-bold">Pre-Delivery Inspection</h2>
                                <p className="text-blue-100">Current step in progress</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-600 mb-2">Inspector</h3>
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                                                JD
                                            </div>
                                            <div>
                                                <p className="font-semibold">John Doe</p>
                                                <p className="text-sm text-gray-600">Senior Inspector</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-gray-600 mb-2">Inspection Date</h3>
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                        <p className="font-semibold">May 5, 2025</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-600 mb-2">Inspection Report</h3>
                                    <button className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-colors flex items-center justify-center gap-2">
                                        <Download className="w-4 h-4" />
                                        Download Report PDF
                                    </button>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-gray-600 mb-2">Status Notes</h3>
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                            <span className="font-semibold text-green-800">Inspection Passed</span>
                                        </div>
                                        <p className="text-green-700">
                                            All quality tests passed successfully. Machine is ready for final preparation.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        case 5:
            return <ShipmentStage />
        case 6:
            return <OrderClosedStage />
        default:
            return null
    }
}


export default StageOverview