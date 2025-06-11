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
import {
  ArrowBackIosNew as ArrowBackIcon,
  GetApp as DownloadIcon,
  Description as FileTextIcon,
  CheckCircleOutline as CheckCircleIcon,
  RadioButtonUnchecked as CircleIcon,
  AccessTime as ClockIcon,
  LocalShipping as PackageIcon,

} from "@mui/icons-material"
import type { SalesOrder, WorkflowStep, OrderItem } from "./types/sales-order"
import ViewModePage from "./components/ViewModePage"
import TimeLine from "./components/WorkflowStep"
import DetailHeader from "./components/DetailHeader"
import PickingListDrawer from "./picking-list-drawer"
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

        <Grid className="workflow" container spacing={4}>
          {/* Enhanced Workflow Steps Sidebar */}
          <TimeLine completedSteps={completedSteps} setViewMode={setViewMode} viewMode={viewMode} setIsPickingListOpen={setIsPickingListOpen} />
          {/* Enhanced Main Content */}
          <Grid item xs={12} lg={8} container direction="column" spacing={4} sx={{ position: "relative", flexGrow: 1 }}>
            {/* Enhanced Order Summary */}
            <OrderSummary order={order} />
            {/* Enhanced Current Step Details */}
            {selectedStep === 4 && (
              <Grid item>
                <Card
                  sx={{
                    borderRadius: 3,
                    boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                    overflow: "hidden",
                  }}
                >
                  <CardHeader
                    sx={{
                      background: "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)",
                      color: "white",
                    }}
                    avatar={<ClockIcon sx={{ color: "white" }} />}
                    title={
                      <Typography variant="h5" fontWeight="bold">
                        Pre-Delivery Inspection
                      </Typography>
                    }
                    subheader={
                      <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)" }}>
                        Current step in progress
                      </Typography>
                    }
                  />
                  <CardContent sx={{ p: 4 }}>
                    <Grid container spacing={4}>
                      <Grid item xs={12} md={6}>
                        <Stack spacing={3}>
                          <Box>
                            <Typography variant="subtitle2" color="text.secondary" mb={1}>
                              Inspector
                            </Typography>
                            <Paper
                              elevation={0}
                              sx={{
                                p: 2,
                                borderRadius: 2,
                                bgcolor: "#f8fafc",
                                border: "1px solid #e2e8f0",
                              }}
                            >
                              <Box display="flex" alignItems="center" gap={2}>
                                <Avatar sx={{ width: 40, height: 40, bgcolor: "#3B82F6" }}>JD</Avatar>
                                <Box>
                                  <Typography variant="h6" fontWeight="600">
                                    John Doe
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    Senior Inspector
                                  </Typography>
                                </Box>
                              </Box>
                            </Paper>
                          </Box>

                          <Box>
                            <Typography variant="subtitle2" color="text.secondary" mb={1}>
                              Inspection Date
                            </Typography>
                            <Paper
                              elevation={0}
                              sx={{
                                p: 2,
                                borderRadius: 2,
                                bgcolor: "#f8fafc",
                                border: "1px solid #e2e8f0",
                              }}
                            >
                              <Typography variant="h6" fontWeight="600">
                                May 5, 2025
                              </Typography>
                            </Paper>
                          </Box>
                        </Stack>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Stack spacing={3}>
                          <Box>
                            <Typography variant="subtitle2" color="text.secondary" mb={1}>
                              Inspection Report
                            </Typography>
                            <Button
                              variant="contained"
                              startIcon={<DownloadIcon />}
                              fullWidth
                              sx={{
                                py: 2,
                                borderRadius: 2,
                                background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                                "&:hover": {
                                  background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                                },
                              }}
                            >
                              Download Report PDF
                            </Button>
                          </Box>

                          <Box>
                            <Typography variant="subtitle2" color="text.secondary" mb={1}>
                              Status Notes
                            </Typography>
                            <Paper
                              elevation={0}
                              sx={{
                                p: 3,
                                borderRadius: 2,
                                bgcolor: "#f0fdf4",
                                border: "1px solid #bbf7d0",
                              }}
                            >
                              <Box display="flex" alignItems="center" gap={1} mb={1}>
                                <CheckCircleIcon sx={{ color: "#10B981", fontSize: 20 }} />
                                <Typography variant="subtitle2" color="#059669" fontWeight="600">
                                  Inspection Passed
                                </Typography>
                              </Box>
                              <Typography variant="body2" color="#065f46">
                                All quality tests passed successfully. Machine is ready for final preparation.
                              </Typography>
                            </Paper>
                          </Box>
                        </Stack>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Enhanced Order Details */}

          </Grid>
        </Grid>

        <PickingListDrawer isOpen={isPickingListOpen} onClose={() => setIsPickingListOpen(false)} order={sampleOrder} />
      </Box>
    )
  }


}
export default SalesOrderDetail