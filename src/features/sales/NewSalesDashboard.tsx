import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Button,
  Alert
} from '@mui/material'
import { ShoppingCart, Assignment, Refresh } from '@mui/icons-material'
import ApprovedQuotesPage from './ApprovedQuotesPage'
import OrderManagementPage from './OrderManagementPage'
import StatsCards from './StatsCards'
import type { DashboardStats } from './types/dashboard'
import { orderApi } from '../../api/orderApi'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`sales-tabpanel-${index}`}
      aria-labelledby={`sales-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  )
}

const NewSalesDashboard: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0)
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    pendingDeposits: 0,
    pendingPDChecks: 0,
    pendingFinalPayments: 0,
    pendingShipments: 0,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardStats()
  }, [])

  const loadDashboardStats = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // 并行获取各状态的订单数量
      const [
        allOrders,
        depositOrders,
        finalPaymentOrders,
        pdOrders,
        shipmentOrders
      ] = await Promise.all([
        orderApi.getOrders({ page: 1, limit: 1 }),
        orderApi.getOrdersByStatus('deposit_received', 1, 1),
        orderApi.getOrdersByStatus('final_payment_received', 1, 1),
        orderApi.getOrdersByStatus('pre_delivery_inspection', 1, 1),
        orderApi.getOrdersByStatus('shipped', 1, 1)
      ])

      setStats({
        totalOrders: allOrders.total,
        pendingDeposits: depositOrders.total,
        pendingFinalPayments: finalPaymentOrders.total,
        pendingPDChecks: pdOrders.total,
        pendingShipments: shipmentOrders.total,
      })
    } catch (err) {
      console.error('Error loading dashboard stats:', err)
      setError('Failed to load dashboard statistics')
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue)
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            销售管理中心
          </Typography>
          <Typography variant="body2" color="text.secondary">
            管理报价单转换和订单流程
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={loadDashboardStats}
          disabled={loading}
        >
          刷新数据
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Tab Navigation */}
      <Card sx={{ mt: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={currentTab} onChange={handleTabChange}>
            <Tab
              icon={<ShoppingCart />}
              iconPosition="start"
              label="待转换报价单"
              id="sales-tab-0"
              aria-controls="sales-tabpanel-0"
            />
            <Tab
              icon={<Assignment />}
              iconPosition="start"
              label="订单管理"
              id="sales-tab-1"
              aria-controls="sales-tabpanel-1"
            />
          </Tabs>
        </Box>

        {/* Tab Content */}
        <TabPanel value={currentTab} index={0}>
          <ApprovedQuotesPage />
        </TabPanel>

        <TabPanel value={currentTab} index={1}>
          <OrderManagementPage />
        </TabPanel>
      </Card>
    </Box>
  )
}

export default NewSalesDashboard