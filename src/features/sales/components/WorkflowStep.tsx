import React, { useState } from "react";
import {
    Box,
    Button as MuiButton,
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

import type { WorkflowStep, SalesOrder } from "../types/sales-order"
import { 
  ORDER_STATUS, 
  ORDER_STATUS_LABELS, 
  ORDER_STATUS_FLOW,
  getStatusLabel,
  getStatusColor
} from "../constants/order-status"


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
import OrderDocumentUploadDialog from './dialogs/order-document-upload-dialog'

interface WorkflowStepProps {
    order: SalesOrder; // Pass in actual order data
    setViewMode: React.Dispatch<React.SetStateAction<ViewMode>>;
    viewMode: ViewMode;
    setIsPickingListOpen: (open: boolean) => void;
    selectedStep: number;
    setSelectedStep: React.Dispatch<React.SetStateAction<number>>;
    onProgressOrder?: (action: string) => Promise<void>; // New prop for handling progression
    loading?: boolean; // Loading state for progression actions
}

// Workflow step configuration mapping
const STEP_CONFIG = {
  [ORDER_STATUS.DRAFT]: {
    title: "Draft",
    description: "Order being created",
    icon: "draft"
  },
  [ORDER_STATUS.ORDERED]: {
    title: "Order Placed",
    description: "Order officially submitted",
    icon: "order"
  },
  [ORDER_STATUS.DEPOSIT_RECEIVED]: {
    title: "Deposit Received", 
    description: "Initial payment confirmed",
    icon: "payment"
  },
  [ORDER_STATUS.FINAL_PAYMENT_RECEIVED]: {
    title: "Final Payment",
    description: "Final payment completed",
    icon: "payment"
  },
  [ORDER_STATUS.PRE_DELIVERY_INSPECTION]: {
    title: "Pre-Delivery Inspection",
    description: "Quality assurance in progress",
    icon: "inspection"
  },
  [ORDER_STATUS.SHIPPED]: {
    title: "Shipped",
    description: "Items have been shipped",
    icon: "shipping"
  },
  [ORDER_STATUS.DELIVERED]: {
    title: "Delivered",
    description: "Items delivered to customer",
    icon: "delivered"
  },
  [ORDER_STATUS.ORDER_CLOSED]: {
    title: "Order Closed",
    description: "Order completed and closed",
    icon: "closed"
  },
  [ORDER_STATUS.CANCELLED]: {
    title: "Cancelled",
    description: "Order has been cancelled",
    icon: "cancelled"
  }
};

// Generate workflow steps based on order data
const generateWorkflowSteps = (order: SalesOrder): WorkflowStep[] => {
  const currentStatusIndex = ORDER_STATUS_FLOW.indexOf(order.status as any);
  const isCompleted = order.status === ORDER_STATUS.ORDER_CLOSED;
  const isCancelled = order.status === ORDER_STATUS.CANCELLED;
  
  return ORDER_STATUS_FLOW.map((status, index) => {
    const config = STEP_CONFIG[status];
    let stepStatus: WorkflowStep["status"] = "pending";
    let stepDate: string | undefined;
    
    // Determine step status
    if (isCancelled && index > currentStatusIndex) {
      stepStatus = "pending";
    } else if (index < currentStatusIndex || (index === currentStatusIndex && isCompleted)) {
      stepStatus = "completed";
    } else if (index === currentStatusIndex) {
      stepStatus = "current";
    }
    
    // Set step date based on order timestamp fields
    switch (status) {
      case ORDER_STATUS.ORDERED:
        stepDate = order.orderDate;
        break;
      case ORDER_STATUS.DEPOSIT_RECEIVED:
        stepDate = order.depositPaidAt;
        break;
      case ORDER_STATUS.FINAL_PAYMENT_RECEIVED:
        stepDate = order.finalPaidAt;
        break;
      case ORDER_STATUS.PRE_DELIVERY_INSPECTION:
        stepDate = order.pdCompletedAt;
        break;
      case ORDER_STATUS.SHIPPED:
        stepDate = order.shippedAt;
        break;
      case ORDER_STATUS.DELIVERED:
        stepDate = order.deliveredAt;
        break;
    }
    
    return {
      id: index + 1,
      title: config.title,
      status: stepStatus,
      date: stepDate ? new Date(stepDate).toLocaleDateString() : undefined,
      description: config.description
    };
  });
};



// Sample data removed - now using actual order data passed as props

// Get available actions for current order status
const getAvailableActions = (currentStatus: string) => {
  const actions = {
    [ORDER_STATUS.ORDERED]: [{ 
      action: 'deposit-payment', 
      label: 'Mark Deposit Received', 
      icon: DollarSign,
      requiresUpload: true,
      uploadType: 'deposit_receipt'
    }],
    [ORDER_STATUS.DEPOSIT_RECEIVED]: [{ 
      action: 'final-payment', 
      label: 'Mark Final Payment', 
      icon: DollarSign,
      requiresUpload: true,
      uploadType: 'final_payment_receipt'
    }],
    [ORDER_STATUS.FINAL_PAYMENT_RECEIVED]: [{ 
      action: 'pd-complete', 
      label: 'Complete PD Inspection', 
      icon: FileCheck,
      requiresUpload: true,
      uploadType: 'pd_report'
    }],
    [ORDER_STATUS.PRE_DELIVERY_INSPECTION]: [{ 
      action: 'ship', 
      label: 'Mark as Shipped', 
      icon: Package,
      requiresUpload: true,
      uploadType: 'shipping_doc'
    }],
    [ORDER_STATUS.SHIPPED]: [{ 
      action: 'deliver', 
      label: 'Mark as Delivered', 
      icon: CheckCircle,
      requiresUpload: true,
      uploadType: 'delivery_confirmation'
    }],
    [ORDER_STATUS.DELIVERED]: [{ 
      action: 'close-order', 
      label: 'Close Order', 
      icon: CheckCircle,
      requiresUpload: false
    }],
  };
  return actions[currentStatus] || [];
};

const TimeLine = ({ order, viewMode, setViewMode, selectedStep, setSelectedStep, onProgressOrder, loading = false }: WorkflowStepProps) => {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [currentUploadType, setCurrentUploadType] = useState<'deposit_receipt' | 'final_payment_receipt' | 'pd_report' | 'shipping_doc' | 'delivery_confirmation'>('deposit_receipt');
  
  const workflowSteps = generateWorkflowSteps(order);
  const completedSteps = workflowSteps.filter(step => step.status === "completed").length;
  const availableActions = getAvailableActions(order.status);

  // Handle action click - show upload dialog if required, or execute directly
  const handleActionClick = (actionConfig: any) => {
    if (actionConfig.requiresUpload) {
      setCurrentUploadType(actionConfig.uploadType);
      setUploadDialogOpen(true);
    } else {
      onProgressOrder?.(actionConfig.action);
    }
  };

  // Handle successful upload and workflow progression
  const handleUploadSuccess = () => {
    setUploadDialogOpen(false);
    onProgressOrder?.('refresh'); // Trigger a refresh of the order data
  };
 
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


    

    // Get action buttons for current step
    const getStepActions = (step: WorkflowStep, stepIndex: number) => {
      const currentStatusIndex = ORDER_STATUS_FLOW.indexOf(order.status as any);
      
      // Only show actions for current step
      if (stepIndex !== currentStatusIndex || step.status !== 'current') {
        return null;
      }
      
      return availableActions.map((actionConfig, index) => (
        <button
          key={index}
          onClick={() => onProgressOrder?.(actionConfig.action)}
          disabled={loading}
          className="ml-2 p-1 text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
          title={actionConfig.label}
        >
          <actionConfig.icon className="w-4 h-4" />
        </button>
      ));
    };
    
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
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <Typography variant="h6" fontWeight="600" mb={0.5}>
                          {step.title}
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          {getStepActions(step, index)}
                          {getEditButton(step.id)}
                        </Box>
                      </Box>
               
                      <Typography variant="body2" color="text.secondary" mb={1}>
                        {step.description}
                      </Typography>
                      
                      {/* Show available actions for current step */}
                      {step.status === 'current' && availableActions.length > 0 && (
                        <Box sx={{ mt: 1 }}>
                          {availableActions.map((actionConfig, actionIndex) => (
                            <MuiButton
                              key={actionIndex}
                              size="small"
                              variant="contained"
                              color="success"
                              disabled={loading}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleActionClick(actionConfig);
                              }}
                              startIcon={<actionConfig.icon size={16} />}
                              sx={{ mr: 1, mb: 1 }}
                            >
                              {loading ? 'Processing...' : actionConfig.label}
                            </MuiButton>
                          ))}
                        </Box>
                      )}
                      
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

          {/* Upload Dialog */}
          <OrderDocumentUploadDialog
            open={uploadDialogOpen}
            onClose={() => setUploadDialogOpen(false)}
            orderId={order.id}
            documentType={currentUploadType}
            onSuccess={handleUploadSuccess}
          />
        </Grid>
  )
}

export default TimeLine