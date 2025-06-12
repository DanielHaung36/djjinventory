import React, { useState } from "react"
import {
  Box,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Button,
  Chip,
  Divider,
  Avatar,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
} from "@mui/material"
import OrderSummary from "./components/OrderSummary"

import type { SalesOrder, WorkflowStep, OrderItem } from "./types/sales-order"
import ViewModePage from "./components/ViewModePage"
import TimeLine from "./components/WorkflowStep"
import DetailHeader from "./components/DetailHeader"
import PickingListDrawer from "./picking-list-drawer"
import StageOverview from "./stages/StageOverivew"
import OrderDetailsTable from "./components/order-details-table"
interface SalesOrderDetailProps {
  order: SalesOrder
  onBack: () => void
}

export const workflowSteps: WorkflowStep[] = [
  {
    id: 1,
    title: "Deposit Received",
    status: "completed",
    date: "2025-05-02",
    description: "Initial payment confirmed",
  },
  {
    id: 2,
    title: "Order Placed",
    status: "completed",
    date: "2025-05-03",
    description: "Order officially submitted",
  },
  {
    id: 3,
    title: "Final Payment",
    status: "pending",
    description: "Awaiting final payment",
  },
  {
    id: 4,
    title: "Pre-Delivery Inspection",
    status: "current",
    description: "Quality assurance in progress",
  },
  {
    id: 5,
    title: "Shipment",
    status: "pending",
    description: "Ready for dispatch",
  },
  {
    id: 6,
    title: "Order Closed",
    status: "pending",
    description: "Final completion",
  },
]
// Sample order items for demo
export const sampleOrderItems: OrderItem[] = [
  {
    id: "item-1",
    name: "LM930 Wheel Loader",
    description: "Base model with standard configuration",
    quantity: 1,
    unitPrice: 38000,
    totalPrice: 38000,
    image: "/placeholder.svg?height=200&width=200",
    specifications: [
      "Engine: 175 HP Diesel Engine",
      "Operating Weight: 13,500 kg",
      "Bucket Capacity: 2.5 m³",
      "Max Speed: 38 km/h",
      "Fuel Tank: 250 L",
    ],
  },
  {
    id: "item-2",
    name: "Extended Warranty Package",
    description: "3-year extended warranty coverage",
    quantity: 1,
    unitPrice: 3500,
    totalPrice: 3500,
    specifications: [
      "Duration: 3 years",
      "Covers all mechanical components",
      "Includes annual maintenance visits",
      "24/7 support hotline",
    ],
  },
  {
    id: "item-3",
    name: "Premium Operator Cabin Upgrade",
    description: "Enhanced comfort and features for operator cabin",
    quantity: 1,
    unitPrice: 2800,
    totalPrice: 2800,
    image: "/placeholder.svg?height=200&width=200",
    specifications: [
      "Climate Control System",
      "Ergonomic Seat with Air Suspension",
      "7-inch Touchscreen Display",
      "Bluetooth Connectivity",
      "Enhanced Sound Insulation",
    ],
  },
  {
    id: "item-4",
    name: "Hydraulic Quick Coupler",
    description: "For rapid attachment changes",
    quantity: 1,
    unitPrice: 700,
    totalPrice: 700,
    specifications: ["Compatible with all standard attachments", "Hydraulic locking system", "Safety lock indicator"],
  },
]


export const sampleOrder: SalesOrder = {
  orderNumber: "ORD-2025050301",
  customer: "ABC Construction Co.",
  machineModel: "LM930 Wheel Loader",
  orderDate: "2025-05-02",
  eta: "2025-05-15",
  total: 45000,
  quoteNumber: "QUO-2025040289",
  quoteDate: "2025-04-28",
  createdBy: "Michael Smith",
  quoteContent: "Standard equipment package with extended warranty and premium operator cabin",
  items: sampleOrderItems,
}




export type ViewMode = "list" | "detail" | "create" | "edit-deposit" | "edit-payment" | "edit-shipment" | "close-order"

export function SalesOrderDetail({ order, onBack }: SalesOrderDetailProps) {
  const [selectedStep, setSelectedStep] = useState<number>(4)

  const completedSteps = workflowSteps.filter((step) => step.status === "completed").length
  const progressPercentage = (completedSteps / workflowSteps.length) * 100
  const [isPickingListOpen, setIsPickingListOpen] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>("detail")
    // Main order detail view

  if (viewMode === "create" || viewMode === "edit-deposit" || viewMode === "edit-payment" || viewMode === "edit-shipment" || viewMode === "close-order") {
    return (
      <ViewModePage
        viewMode={viewMode}
        setViewMode={setViewMode}
        sampleOrder={sampleOrder}
        isPickingListOpen={isPickingListOpen}
        setIsPickingListOpen={setIsPickingListOpen}
      />
    )
  } else {
    return (
      <Box
        p={3}
        sx={{
          background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
          overflowY: "auto",
        }}
      >
        {/* Enhanced Header */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 3,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
          }}
        >
          <DetailHeader order={order} workflowSteps={workflowSteps} setIsPickingListOpen={setIsPickingListOpen} setViewMode={setViewMode} />
        </Paper>

        <Grid className="workflow" container spacing={4} sx={{flexWrap:'nowrap'}}>
          {/* Enhanced Workflow Steps Sidebar */}
          <TimeLine completedSteps={completedSteps} setViewMode={setViewMode} viewMode={viewMode} setIsPickingListOpen={setIsPickingListOpen} selectedStep={selectedStep} setSelectedStep={setSelectedStep}/>
          {/* Enhanced Main Content */}
          <Grid className="main-content"  item xs={12} lg={8} container direction="column" spacing={4} sx={{ position: "relative", flexGrow: 1,display:"flex" }}>
            {/* Enhanced Order Summary */}
            <OrderSummary order={order} />
            {/* Enhanced Current Step Details */}
          {/* Order Details Table */}
          {sampleOrder.items && sampleOrder.items.length > 0 && selectedStep===1 && (
            <OrderDetailsTable items={sampleOrder.items} currency="$" />
          )}

            {
              <StageOverview selectedStep={selectedStep} />
            }
            {/* Enhanced Order Details */}

          </Grid>
        </Grid>

        <PickingListDrawer isOpen={isPickingListOpen} onClose={() => setIsPickingListOpen(false)} order={sampleOrder} />
      </Box>
    )
  }


}
export default SalesOrderDetail