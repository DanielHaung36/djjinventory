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
  Alert,
  Tabs,
  Tab,
} from "@mui/material"
import OrderSummary from "./components/OrderSummary"

import type { SalesOrder, WorkflowStep, OrderItem } from "./types/sales-order"
import ViewModePage from "./components/ViewModePage"
import TimeLine from "./components/WorkflowStep"
import DetailHeader from "./components/DetailHeader"
import PickingListDrawer from "./picking-list-drawer"
import StageOverview from "./stages/StageOverivew"
import OrderDetailsTable from "./components/order-details-table"
import OrderDocumentDisplay from "./components/order-document-display"
interface SalesOrderDetailProps {
  order: SalesOrder
  onBack: () => void
  onOrderUpdate?: (orderId: string) => void
}

// 移除硬编码的工作流步骤，现在由 WorkflowStep 组件动态生成
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

export function SalesOrderDetail({ order, onBack, onOrderUpdate }: SalesOrderDetailProps) {
  const [selectedStep, setSelectedStep] = useState<number>(4)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState(0)

  // 转换后端 OrderItem 数据为前端组件期望的格式
  const transformOrderItems = (items: any[]) => {
    return items?.map(item => ({
      id: item.id.toString(),
      name: item.product?.nameEn || item.product?.nameCn || item.description || 'Unknown Product',
      description: item.description || '',
      quantity: item.quantity || 0,
      unitPrice: item.unitPrice || 0,
      totalPrice: item.totalPrice || 0,
      image: item.product?.image || "/placeholder.svg?height=200&width=200",
      specifications: item.specifications ? item.specifications.split('\n').filter(Boolean) : []
    })) || []
  }

  // 这些变量已经被移动到各自的组件内部进行动态计算
  const [isPickingListOpen, setIsPickingListOpen] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>("detail")

  // Proceed操作处理函数
  const handleProceed = async (action: string) => {
    if (!order?.id) return
    
    setLoading(true)
    setError(null)
    
    try {
      // Import orderApi
      const { orderApi } = await import('../../api/orderApi')
      
      // Call appropriate API based on action
      switch (action) {
        case 'deposit-payment':
          await orderApi.processDepositPayment(order.id)
          break
        case 'final-payment':
          await orderApi.processFinalPayment(order.id)
          break
        case 'pd-complete':
          await orderApi.processPDComplete(order.id)
          break
        case 'ship':
          await orderApi.processShipment(order.id)
          break
        case 'deliver':
          await orderApi.processDelivery(order.id)
          break
        case 'close-order':
          await orderApi.closeOrder(order.id)
          break
        case 'refresh':
          // Just refresh the order data without making additional API calls
          break
        default:
          throw new Error(`Unknown action: ${action}`)
      }
      
      console.log(`Successfully proceeded with action: ${action} for order ${order.id}`)
      
      // Refresh order data
      if (onOrderUpdate) {
        await onOrderUpdate(order.orderNumber)
      }
    } catch (err) {
      console.error('Error proceeding with action:', err)
      setError(`Operation failed: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }
    // Main order detail view

  if (viewMode === "create" || viewMode === "edit-deposit" || viewMode === "edit-payment" || viewMode === "edit-shipment" || viewMode === "close-order") {
    return (
      <ViewModePage
        viewMode={viewMode}
        setViewMode={setViewMode}
        order={order}
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
          <DetailHeader order={order} setIsPickingListOpen={setIsPickingListOpen} setViewMode={setViewMode} />
        </Paper>

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Proceed Actions */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              订单操作
            </Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap">
              {order?.status === 'ordered' && (
                <Button
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  onClick={() => handleProceed('deposit-payment')}
                >
                  {loading ? '处理中...' : '确认定金支付'}
                </Button>
              )}
              {order?.status === 'deposit_received' && (
                <Button
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  onClick={() => handleProceed('final-payment')}
                >
                  {loading ? '处理中...' : '确认尾款支付'}
                </Button>
              )}
              {order?.status === 'final_payment_received' && (
                <Button
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  onClick={() => handleProceed('pd-complete')}
                >
                  {loading ? '处理中...' : '完成PD检查'}
                </Button>
              )}
              {order?.status === 'pre_delivery_inspection' && (
                <Button
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  onClick={() => handleProceed('ship')}
                >
                  {loading ? '处理中...' : '确认发货'}
                </Button>
              )}
            </Stack>
          </CardContent>
        </Card>

        <Grid className="workflow" container spacing={4} sx={{flexWrap:'nowrap'}}>
          {/* Enhanced Workflow Steps Sidebar */}
          <TimeLine 
            order={order} 
            setViewMode={setViewMode} 
            viewMode={viewMode} 
            setIsPickingListOpen={setIsPickingListOpen} 
            selectedStep={selectedStep} 
            setSelectedStep={setSelectedStep}
            onProgressOrder={handleProceed}
            loading={loading}
          />
          {/* Enhanced Main Content */}
          <Grid className="main-content"  item xs={12} lg={8} container direction="column" spacing={4} sx={{ position: "relative", flexGrow: 1,display:"flex" }}>
            {/* Enhanced Order Summary */}
            <OrderSummary order={order} />
            
            {/* Tab Navigation */}
            <Card>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                  <Tab label="Order Details" />
                  <Tab label="Documents" />
                  <Tab label="Stage Overview" />
                </Tabs>
              </Box>
              
              <CardContent>
                {/* Tab Content */}
                {activeTab === 0 && (
                  <Box>
                    {/* Order Details Table */}
                    {order.items && order.items.length > 0 && (
                      <OrderDetailsTable items={transformOrderItems(order.items)} currency={order.currency || "AUD"} />
                    )}
                  </Box>
                )}
                
                {activeTab === 1 && (
                  <Box>
                    {/* Order Documents */}
                    {order?.id && (
                      <OrderDocumentDisplay 
                        orderId={order.id}
                        onDocumentDeleted={() => {
                          // Optionally refresh order data when document is deleted
                          if (onOrderUpdate) {
                            onOrderUpdate(order.orderNumber);
                          }
                        }}
                      />
                    )}
                  </Box>
                )}
                
                {activeTab === 2 && (
                  <Box>
                    {/* Stage Overview */}
                    <StageOverview selectedStep={selectedStep} />
                  </Box>
                )}
              </CardContent>
            </Card>

          </Grid>
        </Grid>

        <PickingListDrawer isOpen={isPickingListOpen} onClose={() => setIsPickingListOpen(false)} order={order} />
      </Box>
    )
  }


}
export default SalesOrderDetail