"use client"

import { useState, useEffect } from "react";
import { Box, Typography, Button, Tabs, Tab, Card, CardContent } from "@mui/material";
import { Plus, ShoppingCart, Assignment } from "@mui/icons-material";
import StatsCards from "./StatsCards";
import OrdersTable from "./OrdersTable";
import type { DashboardStats } from "./types/dashboard";
import type { SalesOrder } from "./types/sales-order";
import CreateOrderForm from "./components/form/create-order-form";
import ApprovedQuotesPage from "./ApprovedQuotesPage";
import OrderManagementPage from "./OrderManagementPage";
import { useNavigate } from "react-router-dom";
import { orderApi } from "../../api/orderApi";

const mockStats: DashboardStats = {
  totalOrders: 156,
  pendingDeposits: 18,
  pendingPDChecks: 8,
  pendingFinalPayments: 12,
  pendingShipments: 22,
}

// 生成更多假数据用于测试分页
const generateMockOrders = (): SalesOrder[] => {
  const customers = [
    "DW TILES QLD",
    "Geoff Harcourt",
    "Sam Construction",
    "BuildCorp Australia",
    "Mining Solutions Ltd",
    "Pacific Infrastructure",
    "Urban Development Co",
    "Coastal Constructions",
    "Metro Building Group",
    "Industrial Partners Ltd",
    "Construction Masters",
    "Heavy Machinery Co",
    "Infrastructure Solutions",
    "Building Dynamics",
    "Construction Elite",
  ]

  const creators = ["LiuEcho", "Jack Yao", "Monica Chen", "Tony Yang", "Alice Brown", "John Lee", "Robert Wilson"]

  const salesReps = [
    "Monica Simons",
    "Jack Wilson",
    "Sarah Chen",
    "David Kim",
    "Lisa Wang",
    "Michael Zhang",
    "Emma Johnson",
    "Peter Liu",
  ]

  const models = ["LM930 Wheel Loader", "LM940 Wheel Loader", "LM946 Wheel Loader", "LM950 Wheel Loader"]

  const regions = [
    "Queensland",
    "New South Wales",
    "Victoria",
    "Western Australia",
    "South Australia",
    "Tasmania",
    "Northern Territory",
  ]

  const statuses: SalesOrder["status"][] = [
    "deposit-received",
    "order-placed",
    "final-payment",
    "pre-delivery-inspection",
    "shipment",
    "order-closed",
  ]

  const priorities: SalesOrder["priority"][] = ["high", "medium", "low"]

  const orders: SalesOrder[] = []

  for (let i = 1; i <= 45; i++) {
    const orderNumber = `INV-25${String(i).padStart(3, "0")}${String.fromCharCode(65 + (i % 26))}`
    const quoteNumber = `${creators[i % creators.length].substring(0, 2).toUpperCase()}25051${i % 10}-${i % 5}${String.fromCharCode(
      65 + (i % 26),
    )}`

    const baseDate = new Date("2025-05-01")
    const orderDate = new Date(baseDate.getTime() + i * 24 * 60 * 60 * 1000)
    const etaDate = new Date(orderDate.getTime() + (10 + (i % 20)) * 24 * 60 * 60 * 1000)

    const total = 35000 + (i % 10) * 5000 + Math.floor(Math.random() * 10000)
    const depositAmount = Math.floor(total * 0.3)
    const finalPaymentAmount = total - depositAmount

    orders.push({
      orderNumber,
      quoteNumber,
      createdBy: creators[i % creators.length],
      quoteDate: orderDate.toLocaleDateString("en-AU"),
      customer: customers[i % customers.length],
      quotePDF: `DJJ_QUOTE_${quoteNumber}.pdf`,
      paymentScreenshot: "",
      quoteContent: `Quote content for ${quoteNumber}`,
      status: statuses[i % statuses.length],
      machineModel: models[i % models.length],
      orderDate: orderDate.toISOString().split("T")[0],
      eta: etaDate.toISOString().split("T")[0],
      total,
      depositAmount,
      finalPaymentAmount,
      priority: priorities[i % priorities.length],
      region: regions[i % regions.length],
      salesRep: salesReps[i % salesReps.length],
    })
  }

  return orders
}

export const mockOrders = generateMockOrders()

interface SalesDashboardProps {
  onNewOrder: () => void
  onViewOrder: (order?: SalesOrder) => void
}

export function SalesDashboard({ onNewOrder, onViewOrder }: SalesDashboardProps) {
  const [statusFilter, setStatusFilter] = useState("all")

  const handleFilterChange = (filter: string) => {
    setStatusFilter(filter)
  }
   return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, overflow: "auto", px: 4, py: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: "bold" }}>
            Sales Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your sales orders and track their progress
          </Typography>
        </Box>
        <Button
          onClick={onNewOrder}
          variant="contained"
          startIcon={<Plus size={16} />}
          sx={{ backgroundColor: "#2563eb", "&:hover": { backgroundColor: "#1d4ed8" } }}
        >
          New Sales Order
        </Button>
      </Box>

      {/* StatsCards */}
      <StatsCards stats={mockStats} onFilterChange={handleFilterChange} activeFilter={statusFilter} />

      {/* Orders Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6">
          {statusFilter === "all" ? "All Orders" : `Filtered Orders`}
          {statusFilter !== "all" && (
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
              ({mockOrders.filter((o) => o.status === statusFilter).length} orders)
            </Typography>
          )}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {mockOrders.length} total orders
        </Typography>
      </Box>

      {/* OrdersTable */}
      <OrdersTable orders={mockOrders} onViewOrder={onViewOrder} statusFilter={statusFilter} />
    </Box>
  );
}