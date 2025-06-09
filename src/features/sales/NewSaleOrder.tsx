import React from 'react';
import NewSalesOrderForm from './Newsalesorderform';
import { useNavigate } from "react-router-dom"
import type { SalesOrder } from './types/sales-order';

export default function SalesOverviewPage() {
  const navigate = useNavigate()

  const handleBack = () => navigate("/sales/overview")
  const handleSubmit = (data: any) => {
    console.log("Form Submitted", data)
    navigate("/sales/overview")
  }
  return (
    <NewSalesOrderForm
      onBack={handleBack}
      onSubmit={handleSubmit}
    />
  )
}
