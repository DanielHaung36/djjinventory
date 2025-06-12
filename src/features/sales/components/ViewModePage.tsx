import CreateOrderForm from "./form/create-order-form"
import EditDepositForm from "./form/edit-deposit-form"
import EditFinalPaymentForm from "./form/edit-final-payment-form"
import EditShipmentForm from "./form/edit-shipment-form"
import CloseOrderForm from "./form/close-order-form"
import type { ViewMode } from "../Salesorderdetail"
import type { SalesOrder, OrderItem } from "../types/sales-order"
import PickingListDrawer from "../picking-list-drawer"
import OrderSummaryWidget from "./order-summary-widget"
interface ViewModeProps {
    viewMode: ViewMode
    setViewMode: React.Dispatch<React.SetStateAction<ViewMode>>;
    sampleOrder: SalesOrder;
    isPickingListOpen: boolean;
    setIsPickingListOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const ViewModePage = ({ viewMode, setViewMode, sampleOrder, isPickingListOpen, setIsPickingListOpen }: ViewModeProps) => {
    const handleCreateOrder = (orderData: Partial<SalesOrder>) => {
        console.log("Creating order:", orderData)
        alert("Order created successfully!")
        setViewMode("detail")
    }

    const handleSaveEdit = (data: any) => {
        console.log("Saving edit:", data)
        alert("Changes saved successfully!")
        setViewMode("detail")
    }

    const handleCloseOrder = (data: any) => {
        console.log("Closing order:", data)
        alert("Order closed successfully!")
        setViewMode("detail")
    }
    console.log("viewMode")
    // Render different views based on viewMode
    if (viewMode === "create") {
        console.log("Creating new order")
        return <CreateOrderForm  onSave={handleCreateOrder} onCancel={() => setViewMode("detail")} />
    }

    if (viewMode === "edit-deposit") {
        return (
            <div className=" bg-gradient-to-br from-gray-50 to-gray-100 overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-4">
                    <div className="lg:col-span-3">
                        <EditDepositForm
                            orderNumber={sampleOrder.orderNumber}
                            onSave={handleSaveEdit}
                            onCancel={() => setViewMode("detail")}
                        />
                    </div>
                    <div className="lg:col-span-1">
                        <div className="sticky top-6">
                            <OrderSummaryWidget order={sampleOrder} />
                        </div>
                    </div>
                </div>
                <PickingListDrawer isOpen={isPickingListOpen} onClose={() => setIsPickingListOpen(false)} order={sampleOrder} />
            </div>
        )
    }

    if (viewMode === "edit-payment") {
        return (
            <div className=" bg-gradient-to-br from-gray-50 to-gray-100 overflow-y-auto" >
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-4">
                    <div className="lg:col-span-3">
                        <EditFinalPaymentForm
                            orderNumber={sampleOrder.orderNumber}
                            onSave={handleSaveEdit}
                            onCancel={() => setViewMode("detail")}
                        />
                    </div>
                    <div className="lg:col-span-1">
                        <div className="sticky top-6">
                            <OrderSummaryWidget order={sampleOrder} />
                        </div>
                    </div>
                </div>
                <PickingListDrawer isOpen={isPickingListOpen} onClose={() => setIsPickingListOpen(false)} order={sampleOrder} />
            </div>
        )
    }

    if (viewMode === "edit-shipment") {
        return (
            <div className=" bg-gradient-to-br from-gray-50 to-gray-100 overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-4">
                    <div className="lg:col-span-3">
                        <EditShipmentForm
                            orderNumber={sampleOrder.orderNumber}
                            onSave={handleSaveEdit}
                            onCancel={() => setViewMode("detail")}
                        />
                    </div>
                    <div className="lg:col-span-1">
                        <div className="sticky top-6">
                            <OrderSummaryWidget order={sampleOrder} />
                        </div>
                    </div>
                </div>
                <PickingListDrawer isOpen={isPickingListOpen} onClose={() => setIsPickingListOpen(false)} order={sampleOrder} />
            </div>
        )
    }

    if (viewMode === "close-order") {
        return (
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-4">
                    <div className="lg:col-span-3">
                        <CloseOrderForm
                            orderNumber={sampleOrder.orderNumber}
                            onSave={handleCloseOrder}
                            onCancel={() => setViewMode("detail")}
                        />
                    </div>
                    <div className="lg:col-span-1">
                        <div className="sticky top-6">
                            <OrderSummaryWidget order={sampleOrder} />
                        </div>
                    </div>
                </div>
                <PickingListDrawer isOpen={isPickingListOpen} onClose={() => setIsPickingListOpen(false)} order={sampleOrder} />
            </div>
        )
    }
}

export default ViewModePage