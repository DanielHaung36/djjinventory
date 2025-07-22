import { Box, Card, CardContent, CardHeader, Chip, Grid, Paper, Typography } from "@mui/material";
import {
    AccessTime as ClockIcon,
    LocalShipping as PackageIcon,
    Person as PersonIcon,
    CalendarToday as CalendarIcon,
    AttachMoney as DollarIcon,
} from "@mui/icons-material"
import React from "react";
import type { SalesOrder } from "../types/sales-order";

interface OrderSummaryProps {
    order: SalesOrder

}

const OrderSummary = ({ order }: OrderSummaryProps) => {
    return (
        <Grid item >
            <Card
                sx={{
                    borderRadius: 3,
                    boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                    overflow: "hidden",
                }}
            >
                <CardHeader
                    sx={{
                        background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                        color: "white",
                    }}
                    title={
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                            <Typography variant="h5" fontWeight="bold">
                                Order Summary
                            </Typography>
                            <Chip
                                label="Active"
                                sx={{
                                    bgcolor: "rgba(255,255,255,0.2)",
                                    color: "white",
                                    fontWeight: "bold",
                                }}
                            />
                        </Box>
                    }
                />
                <CardContent sx={{ p: 4 }}>
                    <Grid container spacing={4}>
                        {[
                            {
                                icon: <PersonIcon />,
                                label: "Customer",
                                value: order.customer?.name || `Customer ID: ${order.customerId}`,
                                color: "#8B5CF6",
                            },
                            {
                                icon: <PackageIcon />,
                                label: "Machine Model",
                                value: order.machineModel || "LM930 Wheel Loader",
                                color: "#06B6D4",
                            },
                            {
                                icon: <CalendarIcon />,
                                label: "Order Date",
                                value: order.orderDate || "2025-05-02",
                                color: "#F59E0B",
                            },
                            {
                                icon: <ClockIcon />,
                                label: "ETA",
                                value: order.eta || "2025-05-15",
                                color: "#EF4444",
                            },
                            {
                                icon: <DollarIcon />,
                                label: "Total",
                                value: `$${order.total?.toLocaleString() || "45,000"}`,
                                color: "#10B981",
                                isPrice: true,
                            },
                        ].map((item, index) => (
                            <Grid item xs={12} sm={6} lg={2.4} key={index} display={"flex"} flexGrow={1}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 3,
                                        borderRadius: 2,
                                        bgcolor: "#f8fafc",
                                        border: "1px solid #e2e8f0",
                                        transition: "all 0.3s ease",
                                        width: "100%",
                                        "&:hover": {
                                            transform: "translateY(-2px)",
                                            boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
                                        },
                                        display: "flex",
                                        flexDirection: "column",
                                    }}
                                >
                                    <Box display="flex" alignItems="center" mb={2} flexGrow={1}>
                                        <Box
                                            sx={{
                                                p: 1,
                                                borderRadius: 2,
                                                bgcolor: item.color,
                                                color: "white",
                                                mr: 2,
                                            }}
                                        >
                                            {React.cloneElement(item.icon, { fontSize: "small" })}
                                        </Box>
                                        <Typography variant="caption" color="text.secondary" fontWeight="600">
                                            {item.label}
                                        </Typography>
                                    </Box>
                                    <Typography
                                        variant={item.isPrice ? "h5" : "h6"}
                                        fontWeight="bold"
                                        color={item.isPrice ? item.color : "text.primary"}
                                    >
                                        {item.value}
                                    </Typography>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                </CardContent>
            </Card>
        </Grid>
    )
}

export default OrderSummary