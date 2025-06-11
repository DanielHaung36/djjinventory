// src/pages/Dashboard.tsx
import React from "react";
import {
  Box,
  Button,
  Typography,
  useTheme,
  useMediaQuery,
  Paper,
} from "@mui/material";
import { tokens } from "../../theme";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import InventoryIcon from "@mui/icons-material/Inventory";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import WarningIcon from "@mui/icons-material/Warning";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import Header from "../../components/Header";
import LineChart from "../../components/LineChart";
import PieChart from "../../components/PieChart";
import BarChart from "../../components/BarChart";
import StatBox from "../../components/StatBox";

// 以下全部数据都来自你现有的 mockData，请根据自己业务替换
import {
  totalInventoryValue,
  inventoryUsageRate,
  lastInventoryUsageRate,
  monthlySalesOrders,
  salesOrderCompletionRate,
  lastSalesOrderRate,
  lowStockSKUCount,
  lastPeriodLowStockSKUCount,
  weeklyProcurementCost,
  lastWeekProcurementCost,
  goalProcurement,
  inventoryTrend,
  salesByCategory,
  recentOrders,
  topSellingSKUs,
  procurementVsSales,
} from "../../data/mockData";

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // 判断当前断点（xs: <600px，sm: 600-900，md: 900-1200，lg: >=1200）
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const isSm = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const isMd = useMediaQuery(theme.breakpoints.between("md", "lg"));
  const isLg = useMediaQuery(theme.breakpoints.up("lg"));

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflowY: "auto",
        bgcolor: theme.palette.background.paper,
      }}
    >
      {/* ====== HEADER ====== */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 2,
          py: 1,
        }}
      >
        <Header title="Inventory Management Dashboard" subtitle="Overview of your inventory, purchase, and sales data" />
        <Button
          sx={{
            backgroundColor: colors.blueAccent[700],
            color: colors.grey[100],
            fontSize: "14px",
            fontWeight: "bold",
            px: 2,
            py: 1,
            "&:hover": {
              backgroundColor: colors.blueAccent[600],
            },
          }}
        >
          <DownloadOutlinedIcon sx={{ mr: 1 }} />
          导出报表
        </Button>
      </Box>

      {/* ====== GRID & CHARTS ====== */}
      <Box
        sx={{
          flexGrow: 1,
          p: 2,
          display: "grid",
          gap: 2,
          gridTemplateColumns: {
            xs: "repeat(1, 1fr)",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
            lg: "repeat(4, 1fr)",
          },
          gridAutoRows: "minmax(140px, auto)",
        }}
      >
        {/* === 行 1：4 个 KPI 卡片 === */}
        <Paper
          sx={{
            gridColumn: { xs: "span 1", sm: "span 1", md: "span 1", lg: "span 1" },
            bgcolor: theme.palette.background.paper,
            borderRadius: 1,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <StatBox
            title={`$${totalInventoryValue}`}
            subtitle="总库存价值"
            progress={inventoryUsageRate}
            increase={`${((inventoryUsageRate - lastInventoryUsageRate) * 100).toFixed(1)}%`}
            icon={
              <InventoryIcon
                sx={{ color: colors.greenAccent[600], fontSize: isXs ? 24 : 32 }}
              />
            }
          />
        </Paper>

        <Paper
          sx={{
            gridColumn: { xs: "span 1", sm: "span 1", md: "span 1", lg: "span 1" },
            bgcolor: theme.palette.background.paper,
            borderRadius: 1,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <StatBox
            title={`${monthlySalesOrders}`}
            subtitle="本月销售订单数"
            progress={salesOrderCompletionRate}
            increase={`${((salesOrderCompletionRate - lastSalesOrderRate) * 100).toFixed(1)}%`}
            icon={
              <ShoppingCartIcon
                sx={{ color: colors.greenAccent[600], fontSize: isXs ? 24 : 32 }}
              />
            }
          />
        </Paper>

        <Paper
          sx={{
            gridColumn: { xs: "span 1", sm: "span 1", md: "span 1", lg: "span 1" },
            bgcolor: theme.palette.background.paper,
            borderRadius: 1,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <StatBox
            title={`${lowStockSKUCount}`}
            subtitle="待补货 SKU"
            progress={lowStockSKUCount / 100}
            increase={`${(((lowStockSKUCount - lastPeriodLowStockSKUCount) / lastPeriodLowStockSKUCount) * 100).toFixed(1)}%`}
            icon={
              <WarningIcon
                sx={{ color: colors.greenAccent[600], fontSize: isXs ? 24 : 32 }}
              />
            }
          />
        </Paper>

        <Paper
          sx={{
            gridColumn: { xs: "span 1", sm: "span 1", md: "span 1", lg: "span 1" },
            bgcolor: theme.palette.background.paper,
            borderRadius: 1,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <StatBox
            title={`$${weeklyProcurementCost}`}
            subtitle="本周采购支出"
            progress={weeklyProcurementCost / goalProcurement}
            increase={`${(((weeklyProcurementCost - lastWeekProcurementCost) / lastWeekProcurementCost) * 100).toFixed(1)}%`}
            icon={
              <LocalShippingIcon
                sx={{ color: colors.greenAccent[600], fontSize: isXs ? 24 : 32 }}
              />
            }
          />
        </Paper>

        {/* === 行 2：库存周走势（占 3 列）  + 销售类别分布（占 1 列） === */}
        <Paper
          sx={{
            gridColumn: { xs: "span 1", sm: "span 2", md: "span 2", lg: "span 3" },
            gridRow: { xs: "span 1", sm: "span 1", md: "span 1", lg: "span 2" },
           bgcolor: theme.palette.background.paper,
            borderRadius: 1,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography
            variant={isXs ? "h6" : "h5"}
            fontWeight="600"
            color={colors.grey[100]}
            sx={{ p: 1 }}
          >
            库存周走势
          </Typography>
          <Paper sx={{ flexGrow: 1, p: 1 }}>
            <LineChart data={inventoryTrend} isDashboard={true} />
          </Paper>
        </Paper>

        <Box
          sx={{
            gridColumn: { xs: "span 1", sm: "span 2", md: "span 1", lg: "span 1" },
            gridRow: { xs: "span 1", sm: "span 1", md: "span 1", lg: "span 2" },
            bgcolor: theme.palette.background.paper,
            borderRadius: 1,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography
            variant={isXs ? "h6" : "h5"}
            fontWeight="600"
            color={colors.grey[100]}
            sx={{ p: 1 }}
          >
            销售类别分布
          </Typography>
          <Box sx={{ flexGrow: 1, p: 1 }}>
            <PieChart data={salesByCategory} isDashboard={true} />
          </Box>
        </Box>

        {/* === 行 3：最新订单（占1-2列）+ 热销/滞销SKU（占1列）+ 采购 vs 销售（占1列） === */}
        <Box
          sx={{
            gridColumn: { xs: "span 1", sm: "span 2", md: "span 1", lg: "span 1" },
            gridRow: { xs: "span 1", sm: "span 1", md: "span 1", lg: "span 2" },
           bgcolor: theme.palette.background.paper,
            borderRadius: 1,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
          }}
        >
          <Typography
            color={colors.grey[100]}
            variant={isXs ? "h6" : "h5"}
            sx={{ p: 1 }}
          >
            最新订单
          </Typography>
          {recentOrders.map((order) => (
            <Box
              key={order.id}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: `1px solid ${colors.primary[500]}`,
                px: 1,
                py: 1,
              }}
            >
              <Box>
                <Typography variant="subtitle1" color={colors.greenAccent[400]}>
                  {order.id}
                </Typography>
                <Typography color={colors.grey[100]} variant="body2">
                  {order.partner}
                </Typography>
              </Box>
              <Typography color={colors.grey[100]} variant="body2">
                {order.date}
              </Typography>
              <Box
                sx={{
                  backgroundColor:
                    order.type === "sale"
                      ? colors.greenAccent[600]
                      : colors.blueAccent[600],
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 0.5,
                }}
              >
                <Typography variant="caption" color={colors.grey[100]}>
                  {order.type === "sale" ? "销售" : "采购"}
                </Typography>
              </Box>
              <Typography color={colors.grey[100]} variant="body2">
                ${order.amount}
              </Typography>
            </Box>
          ))}
        </Box>

        <Box
          sx={{
            gridColumn: { xs: "span 1", sm: "span 2", md: "span 1", lg: "span 1" },
            gridRow: { xs: "span 1", sm: "span 1", md: "span 1", lg: "span 2" },
            bgcolor: theme.palette.background.paper,
            borderRadius: 1,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography
            variant={isXs ? "h6" : "h5"}
            fontWeight="600"
            color={colors.grey[100]}
            sx={{ p: 1 }}
          >
            热销 / 滞销 SKU
          </Typography>
          <Box sx={{ flexGrow: 1, p: 1 }}>
            <BarChart data={topSellingSKUs} isDashboard={true} />
          </Box>
        </Box>

        <Paper
          sx={{
             gridColumn: { xs: "span 1", sm: "span 2", md: "span 2", lg: "span 2" },
            gridRow: { xs: "span 1", sm: "span 1", md: "span 1", lg: "span 2" },
            bgcolor: theme.palette.background.paper,
            borderRadius: 1,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography
            variant={isXs ? "h6" : "h5"}
            fontWeight="600"
            color={colors.grey[100]}
            sx={{ p: 1 }}
          >
            采购 vs 销售
          </Typography>
          <Box sx={{ flexGrow: 1, p: 1 }}>
            <LineChart data={procurementVsSales} isDashboard={true}  axisBottom={null}/>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default Dashboard;
