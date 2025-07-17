import React from "react"
import { Box, Typography, Chip } from "@mui/material"
import {
  TrendingUp,
  Schedule,
  Warning,
  LocalShipping,
  Inventory,
} from "@mui/icons-material"
import type { DashboardStats } from "./types/dashboard"

interface StatsCardsProps {
  stats: DashboardStats
  onFilterChange: (filter: string) => void
  activeFilter: string
}

const StatsCards: React.FC<StatsCardsProps> = ({
  stats,
  onFilterChange,
  activeFilter,
}) => {
  const cards = [
    {
      title: "Total Orders",
      value: stats.totalOrders,
      color: "#1976d2",
      bgColor: "#e3f2fd",
      icon: TrendingUp,
      filter: "all",
      description: "All orders",
    },
    {
      title: "Pending Deposits",
      value: stats.pendingDeposits,
      color: "#f57c00",
      bgColor: "#fff3e0",
      icon: Warning,
      filter: "ordered",
      description: "Awaiting deposit",
      urgent: true,
    },
    {
      title: "Pending PD Checks",
      value: stats.pendingPDChecks,
      color: "#7b1fa2",
      bgColor: "#f3e5f5",
      icon: Inventory,
      filter: "pre-delivery-inspection",
      description: "Pre-delivery inspection",
    },
    {
      title: "Pending Final Payments",
      value: stats.pendingFinalPayments,
      color: "#388e3c",
      bgColor: "#e8f5e8",
      icon: Schedule,
      filter: "deposit_received",
      description: "Final payment due",
    },
    {
      title: "Pending Shipments",
      value: stats.pendingShipments,
      color: "#303f9f",
      bgColor: "#e8eaf6",
      icon: LocalShipping,
      filter: "final_payment_received",
      description: "Ready to ship",
    },
  ]

  return (
    <Box
      display="flex"
      flexWrap="wrap"
      gap={2}        // 16px gap
      mb={2}
    >
      {cards.map((card, i) => {
        const Icon = card.icon
        const isActive = activeFilter === card.filter

        return (
          <Box
            key={i}
            onClick={() => onFilterChange(card.filter)}
            sx={{
              flex: "1 1 calc(20% - 16px)", // 5 等分，每列宽 calc(20% - gap)
              cursor: "pointer",
              fontWeight:500,
              bgcolor: card.bgColor,
              border: isActive
                ? `2px solid ${card.color}`
                : "1px solid #e0e0e0",
              boxShadow: isActive ? 3 : 1,
              transition: "all 0.2s",
              "&:hover": {
                boxShadow: 3,
                transform: "translateY(-2px)",
              },
              display: "flex",
              flexDirection: "column",
              p: 2,
              borderRadius: 1,
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Icon sx={{ fontSize: 24, color: card.color }} />
              {card.urgent && <Chip label="Urgent" color="error" size="small" />}
            </Box>
            <Typography variant="body2" color="text.secondary">
              {card.title}
            </Typography>
            <Typography variant="h4" fontWeight={600} sx={{ color: card.color }}>
              {card.value}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {card.description}
            </Typography>
          </Box>
        )
      })}
    </Box>
  )
}

export default StatsCards
