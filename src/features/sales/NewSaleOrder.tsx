import React from 'react';
import CreateOrderForm from './components/form/create-order-form';
import { useNavigate } from "react-router-dom"
import type { SalesOrder } from './types/sales-order';

export default function SalesOverviewPage() {
  const navigate = useNavigate()
  const handleCreateOrder = (order: Partial<SalesOrder>) => {
    console.log("New order created:", order)
    // onNewOrder()
  }

  return (
    <CreateOrderForm  onSave={handleCreateOrder} onCancel={() => {navigate("/sales/overview")}} />
  )
}
