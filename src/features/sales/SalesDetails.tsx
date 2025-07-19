import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { SalesOrderDetail } from "./Salesorderdetail"
import { orderApi } from "../../api/orderApi"
import { Box, CircularProgress, Alert } from "@mui/material"
import type { SalesOrder } from "./types/sales-order"

export default function SalesDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState<SalesOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      loadOrder(id)
    }
  }, [id])

  const loadOrder = async (orderId: string) => {
    try {
      setLoading(true)
      // 尝试通过订单编号获取订单
      const response = await orderApi.getOrderByNumber(orderId)
      console.log('Order response:', response)
      setOrder(response.data)
      setError(null)
    } catch (err) {
      console.error('Error loading order:', err)
      setError(`无法加载订单: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    )
  }

  if (!order) {
    return (
      <Box p={3}>
        <Alert severity="warning">订单未找到</Alert>
      </Box>
    )
  }

  return (
    <SalesOrderDetail 
      order={order} 
      onBack={() => navigate("/sales/overview")}
      onOrderUpdate={loadOrder} // 传递更新回调
    />
  )
}
