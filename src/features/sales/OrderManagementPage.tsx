import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material'
import OrdersTable from './OrdersTable'
import { SalesOrder, OrderStatus } from './types/sales-order'
import { orderApi } from '../../api/orderApi'

// 状态标签页配置
const statusTabs = [
  { label: '全部', value: 'all' },
  { label: '已下单', value: 'ordered' },
  { label: '已收定金', value: 'deposit_received' },
  { label: '已收尾款', value: 'final_payment_received' },
  { label: 'PD检验中', value: 'pre_delivery_inspection' },
  { label: '已发货', value: 'shipped' },
  { label: '已完成', value: 'delivered' },
  { label: '已取消', value: 'cancelled' }
]

const OrderManagementPage: React.FC = () => {
  const [orders, setOrders] = useState<SalesOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTab, setSelectedTab] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [showActionDialog, setShowActionDialog] = useState(false)
  const [actionType, setActionType] = useState<string>('')
  const [cancelReason, setCancelReason] = useState('')

  // 加载订单数据
  useEffect(() => {
    loadOrders()
  }, [selectedTab])

  const loadOrders = async () => {
    try {
      setLoading(true)
      let response
      if (selectedTab === 'all') {
        response = await orderApi.getOrders(1, 100)
      } else {
        response = await orderApi.getOrdersByStatus(selectedTab, 1, 100)
      }
      setOrders(response.data)
      setError(null)
    } catch (err) {
      console.error('Error loading orders:', err)
      setError('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  // 处理订单操作
  const handleOrderAction = async (order: SalesOrder, action: string) => {
    setSelectedOrder(order)
    setActionType(action)
    
    if (action === 'cancel') {
      setShowActionDialog(true)
      return
    }

    try {
      setActionLoading(true)
      let updatedOrder: SalesOrder

      switch (action) {
        case 'deposit-paid':
          updatedOrder = await orderApi.processDepositPayment(order.id)
          break
        case 'final-paid':
          updatedOrder = await orderApi.processFinalPayment(order.id)
          break
        case 'pd-complete':
          updatedOrder = await orderApi.processPDComplete(order.id)
          break
        case 'ship':
          updatedOrder = await orderApi.processShipment(order.id)
          break
        case 'deliver':
          updatedOrder = await orderApi.processDelivery(order.id)
          break
        default:
          throw new Error(`Unknown action: ${action}`)
      }

      // 更新本地状态
      setOrders(prev => prev.map(o => o.id === order.id ? updatedOrder : o))
      
    } catch (err: any) {
      console.error(`Error processing ${action}:`, err)
      setError(err.response?.data?.error || `Failed to process ${action}`)
    } finally {
      setActionLoading(false)
    }
  }

  // 处理取消订单
  const handleCancelOrder = async () => {
    if (!selectedOrder || !cancelReason.trim()) return

    try {
      setActionLoading(true)
      const updatedOrder = await orderApi.cancelOrder(selectedOrder.id, cancelReason)
      
      // 更新本地状态
      setOrders(prev => prev.map(o => o.id === selectedOrder.id ? updatedOrder : o))
      
      setShowActionDialog(false)
      setCancelReason('')
      
    } catch (err: any) {
      console.error('Error cancelling order:', err)
      setError(err.response?.data?.error || 'Failed to cancel order')
    } finally {
      setActionLoading(false)
    }
  }

  // 查看订单详情
  const handleViewOrder = (order: SalesOrder) => {
    // TODO: 实现订单详情页面导航
    console.log('View order:', order)
  }

  // 获取可用的操作按钮
  const getAvailableActions = (order: SalesOrder) => {
    const actions = []

    switch (order.status) {
      case 'ordered':
        actions.push({ label: '确认定金', action: 'deposit-paid', color: 'success' })
        break
      case 'deposit_received':
        actions.push({ label: '确认尾款', action: 'final-paid', color: 'success' })
        break
      case 'final_payment_received':
        actions.push({ label: 'PD完成', action: 'pd-complete', color: 'primary' })
        break
      case 'pre_delivery_inspection':
        actions.push({ label: '发货', action: 'ship', color: 'info' })
        break
      case 'shipped':
        actions.push({ label: '确认送达', action: 'deliver', color: 'success' })
        break
    }

    // 除了已完成和已取消的订单，都可以取消
    if (!['delivered', 'cancelled'].includes(order.status)) {
      actions.push({ label: '取消订单', action: 'cancel', color: 'error' })
    }

    return actions
  }

  return (
    <Box p={3}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        订单管理
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          {/* 状态标签页 */}
          <Tabs
            value={selectedTab}
            onChange={(_, newValue) => setSelectedTab(newValue)}
            sx={{ mb: 2 }}
            variant="scrollable"
            scrollButtons="auto"
          >
            {statusTabs.map((tab) => (
              <Tab key={tab.value} label={tab.label} value={tab.value} />
            ))}
          </Tabs>

          {/* 订单表格 */}
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <Box>
              <OrdersTable
                orders={orders}
                onViewOrder={handleViewOrder}
                statusFilter={selectedTab}
              />
              
              {/* 操作按钮 */}
              {orders.length > 0 && (
                <Box mt={2}>
                  <Typography variant="h6" gutterBottom>
                    快速操作
                  </Typography>
                  {orders.slice(0, 5).map((order) => {
                    const actions = getAvailableActions(order)
                    if (actions.length === 0) return null

                    return (
                      <Box key={order.id} display="flex" alignItems="center" gap={1} mb={1}>
                        <Typography variant="body2" sx={{ minWidth: 120 }}>
                          {order.orderNumber}:
                        </Typography>
                        {actions.map((action) => (
                          <Button
                            key={action.action}
                            size="small"
                            variant="outlined"
                            color={action.color as any}
                            onClick={() => handleOrderAction(order, action.action)}
                            disabled={actionLoading}
                          >
                            {action.label}
                          </Button>
                        ))}
                      </Box>
                    )
                  })}
                </Box>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* 取消订单对话框 */}
      <Dialog open={showActionDialog} onClose={() => setShowActionDialog(false)}>
        <DialogTitle>取消订单</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            确定要取消订单 {selectedOrder?.orderNumber} 吗？
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="取消原因"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            sx={{ mt: 2 }}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowActionDialog(false)}>
            取消
          </Button>
          <Button
            onClick={handleCancelOrder}
            color="error"
            disabled={!cancelReason.trim() || actionLoading}
          >
            {actionLoading ? <CircularProgress size={20} /> : '确认取消'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default OrderManagementPage