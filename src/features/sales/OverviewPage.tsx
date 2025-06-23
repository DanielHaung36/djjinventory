import React from 'react';
import { SalesDashboard } from './SalesDashboard';
import { useNavigate } from "react-router-dom"
import type { SalesOrder } from './types/sales-order';
import { Box } from '@mui/material';
export default function SalesOverviewPage() {
  const navigate = useNavigate()

  const handleNewOrder = () => navigate("/sales/new")
  const handleViewOrder = (orderId: string) => navigate(`/sales/${orderId}`)

  return (
    <Box  sx={{display: 'flex', flexDirection: 'column',flexGrow: 1,overflow: 'hidden',height: "100%",          // 整个视口高度
        minHeight: 0, // 允许子元素水平缩小
        width: "100%",}}> 
        <Box  sx={{display: 'flex',flexDirection: 'column',flexGrow: 1,gap: 4,overflow: 'auto',height: "100%"}}>
             <SalesDashboard
                onNewOrder={handleNewOrder}
                onViewOrder={(order?:SalesOrder) => handleViewOrder(order?.orderNumber||"")}
                />  
                
        </Box>
    </Box>

  )
}
