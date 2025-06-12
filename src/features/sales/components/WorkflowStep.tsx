import React, { useState } from "react";
import {
    Box,
    Card,
    CardContent,
    CardHeader,
    Chip,
    Grid,
    
    Typography,
} from "@mui/material";
import {
  ArrowLeft,
  Download,
  FileText,
  CheckCircle,
  Circle,
  Clock,
  Package,
  User,
  Calendar,
  DollarSign,
  TrendingUp,
  FileCheck,
  Plus,
  Edit,
  ClipboardList,
} from "lucide-react"

import type {WorkflowStep,SalesOrder } from "../types/sales-order"// Adjust the import path as necessary


import {
  ArrowBackIosNew as ArrowBackIcon,
  GetApp as DownloadIcon,
  Description as FileTextIcon,
  CheckCircleOutline as CheckCircleIcon,
  RadioButtonUnchecked as CircleIcon,
  AccessTime as ClockIcon,
  LocalShipping as PackageIcon,

} from "@mui/icons-material"

import DepositReceivedStage from "../stages/deposit-received"
import OrderPlacedStage from "../stages/order-placed"
import FinalPaymentStage from "../stages/final-payment"
import ShipmentStage from "../stages/shipment"
import OrderClosedStage from "../stages/order-closed"
import OrderSummaryWidget from "./order-summary-widget"
import type { OrderItem } from "../types/sales-order"
import type { ViewMode } from '../Salesorderdetail'; // Adjust the import path as necessary

interface WorkflowStepProps {
    completedSteps: number;
    //  workflowSteps: WorkflowStep[]
     setViewMode: React.Dispatch<React.SetStateAction<ViewMode>>;
     viewMode: ViewMode;
    setIsPickingListOpen: (open: boolean) => void;
    selectedStep: number;
    setSelectedStep: React.Dispatch<React.SetStateAction<number>>;
}

const workflowSteps: WorkflowStep[] = [
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
const sampleOrderItems: OrderItem[] = [
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

// Sample order data for demo
const sampleOrder: SalesOrder = {
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

const TimeLine = ({completedSteps,viewMode,setViewMode,selectedStep,setSelectedStep}: WorkflowStepProps) => {
 
    const getStepIcon = (status: WorkflowStep["status"]) => {
      switch (status) {
        case "completed":
          return <CheckCircleIcon sx={{ color: "#10B981", fontSize: 28 }} />
        case "current":
          return <ClockIcon sx={{ color: "#3B82F6", fontSize: 28 }} />
        default:
          return <CircleIcon sx={{ color: "#9CA3AF", fontSize: 28 }} />
      }
    }


    

    const getEditButton = (stepId: number) => {
      const editActions = {
        1: () => setViewMode("edit-deposit"),
        3: () => setViewMode("edit-payment"),
        5: () => setViewMode("edit-shipment"),
        6: () => setViewMode("close-order"),
      }

      
    if (editActions[stepId as keyof typeof editActions]) {
      return (
        <button
          onClick={editActions[stepId as keyof typeof editActions]}
          className="ml-2 p-1 text-blue-500 hover:bg-blue-50 rounded transition-colors"
          title="Edit this stage"
        >
          <Edit className="w-4 h-4" />
        </button>
      )
    }
    return null
  }

    return (
     <Grid item xs={12} lg={4}>
          <Card
            sx={{
              position: "sticky",
              top: 24,
              borderRadius: 3,
              boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
              overflow: "hidden",
            }}
          >
            <CardHeader
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                pb: 2,
              }}
              avatar={<PackageIcon sx={{ color: "white" }} />}
              title={
                <Typography variant="h5" fontWeight="bold">
                  Order Timeline
                </Typography>
              }
              subheader={
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)" }}>
                  {completedSteps} of {workflowSteps.length} steps completed
                </Typography>
              }
            />
            <CardContent sx={{ p: 0 }}>
              {workflowSteps.map((step, index) => (
                <Box key={step.id}>
                  <Box
                    onClick={() => setSelectedStep(step.id)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      p: 3,
                      cursor: "pointer",
                      bgcolor: selectedStep === step.id ? "#f0f9ff" : "transparent",
                      borderLeft: selectedStep === step.id ? "4px solid #3B82F6" : "4px solid transparent",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        bgcolor: "#f8fafc",
                        transform: "translateX(1px)",
                      },
                      position: "relative",
                    }}
                  >
                    <Box display="flex" alignItems="center" mr={3}>
                      {getStepIcon(step.status)}
                    </Box>
                    <Box flexGrow={1} minWidth={0}>
                      <Box sx={{ display: "flex", alignItems: "center",justifyContent: "space-between" }}>
                        <Typography variant="h6" fontWeight="600" mb={0.5}>
                        {step.title}
                      </Typography>
                       {getEditButton(step.id)}
                      </Box>
               
                      <Typography variant="body2" color="text.secondary" mb={1}>
                        {step.description}
                      </Typography>
                      {step.date && (
                        <Chip label={step.date} size="small" variant="outlined" sx={{ fontSize: "0.75rem" }} />
                      )}
                    </Box>
                    {index < workflowSteps.length - 1 && (
                      <Box
                        sx={{
                          position: "absolute",
                          left: 38,
                          bottom: -40,   // 根据实际间距调整
                          width: 2,
                          height: 80,    // 对应两步骤之间距离
                          bgcolor: step.status === "completed" ? "#10B981" : "#E5E7EB",
                          zIndex: 1,
                        }}
                      />
                    )}
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
  )
}

export default TimeLine