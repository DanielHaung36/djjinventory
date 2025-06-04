import { Box, Button, IconButton, Typography, useTheme } from "@mui/material";
import { tokens } from "../../theme";
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

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Box
      m="1"
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "auto",
        p: "2rem",
        bgcolor: theme.palette.background.paper,
      }}
    >
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="库存管理 Dashboard" subtitle="概览您的进销存数据" />
        <Box>
          <Button
            sx={{
              backgroundColor: colors.blueAccent[700],
              color: colors.grey[100],
              fontSize: "14px",
              fontWeight: "bold",
              padding: "10px 20px",
            }}
          >
            <DownloadOutlinedIcon sx={{ mr: "10px" }} />
            导出报表
          </Button>
        </Box>
      </Box>

      {/* GRID & CHARTS */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="140px"
        gap="20px"
      >
        {/* ROW 1: KPIs */}
        <Box
          gridColumn="span 3"
          bgcolor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
          sx={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)", borderRadius: "8px" }}
        >
          <StatBox
            title={`$${totalInventoryValue}`}
            subtitle="总库存价值"
            progress={inventoryUsageRate}
            increase={`${((inventoryUsageRate - lastInventoryUsageRate) * 100).toFixed(1)}%`}
            icon={<InventoryIcon sx={{ color: colors.greenAccent[600], fontSize: 26 }} />}
          />
        </Box>
        <Box
          gridColumn="span 3"
          bgcolor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
          sx={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)", borderRadius: "8px" }}
        >
          <StatBox
            title={`${monthlySalesOrders}`}
            subtitle="本月销售订单数"
            progress={salesOrderCompletionRate}
            increase={`${((salesOrderCompletionRate - lastSalesOrderRate) * 100).toFixed(1)}%`}
            icon={<ShoppingCartIcon sx={{ color: colors.greenAccent[600], fontSize: 26 }} />}
          />
        </Box>
        <Box
          gridColumn="span 3"
          bgcolor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
          sx={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)", borderRadius: "8px" }}
        >
          <StatBox
            title={`${lowStockSKUCount}`}
            subtitle="待补货 SKU"
            progress={lowStockSKUCount / 100}
            increase={`${(((lowStockSKUCount - lastPeriodLowStockSKUCount) / lastPeriodLowStockSKUCount) * 100).toFixed(1)}%`}
            icon={<WarningIcon sx={{ color: colors.greenAccent[600], fontSize: 26 }} />}
          />
        </Box>
        <Box
          gridColumn="span 3"
          bgcolor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
          sx={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)", borderRadius: "8px" }}
        >
          <StatBox
            title={`$${weeklyProcurementCost}`}
            subtitle="本周采购支出"
            progress={weeklyProcurementCost / goalProcurement}
            increase={`${(((weeklyProcurementCost - lastWeekProcurementCost) / lastWeekProcurementCost) * 100).toFixed(1)}%`}
            icon={<LocalShippingIcon sx={{ color: colors.greenAccent[600], fontSize: 26 }} />}
          />
        </Box>

        {/* ROW 2: Inventory Trend + Sales Category */}
        <Box
          gridColumn="span 8"
          gridRow="span 2"
          bgcolor={colors.primary[400]}
          sx={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)", borderRadius: "8px" }}
        >
          <Typography
            variant="h5"
            fontWeight="600"
            color={colors.grey[100]}
            p="20px"
          >
            库存周走势
          </Typography>
          <Box height="250px" m="0 20px 0 20px">
            <LineChart data={inventoryTrend} isDashboard />
          </Box>
        </Box>
        <Box
          gridColumn="span 4"
          gridRow="span 2"
          bgcolor={colors.primary[400]}
          sx={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)", borderRadius: "8px" }}
        >
          <Typography
            variant="h5"
            fontWeight="600"
            color={colors.grey[100]}
            p="20px"
          >
            销售类别分布
          </Typography>
          <Box height="250px" m="0 20px 0 20px">
            <PieChart data={salesByCategory} isDashboard />
          </Box>
        </Box>

        {/* ROW 3: Recent Orders + Top/Low Sellers + Procurement vs Sales */}
        <Box
          gridColumn="span 4"
          gridRow="span 2"
          bgcolor={colors.primary[400]}
          overflow="auto"
          sx={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)", borderRadius: "8px" }}
        >
          <Typography color={colors.grey[100]} variant="h5" p="15px">
            最新订单
          </Typography>
          {recentOrders.map((order, idx) => (
            <Box
              key={order.id}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              borderBottom={`1px solid ${colors.primary[500]}`}
              p="15px"
            >
              <Box>
                <Typography variant="h6" color={colors.greenAccent[500]}>
                  {order.id}
                </Typography>
                <Typography color={colors.grey[100]}>
                  {order.partner}
                </Typography>
              </Box>
              <Typography color={colors.grey[100]}>{order.date}</Typography>
              <Box
                bgcolor={
                  order.type === "sale"
                    ? colors.greenAccent[600]
                    : colors.blueAccent[600]
                }
                p="5px 10px"
                borderRadius="4px"
              >
                {order.type === "sale" ? "销售" : "采购"}
              </Box>
              <Typography color={colors.grey[100]}>${order.amount}</Typography>
            </Box>
          ))}
        </Box>
        <Box
          gridColumn="span 4"
          gridRow="span 2"
          bgcolor={colors.primary[400]}
          sx={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)", borderRadius: "8px" }}
        >
          <Typography
            variant="h5"
            fontWeight="600"
            color={colors.grey[100]}
            p="20px"
          >
            热销 / 滞销 SKU
          </Typography>
          <Box height="250px" m="0 20px 0 20px">
            <BarChart data={topSellingSKUs} isDashboard />
          </Box>
        </Box>
        <Box
          gridColumn="span 4"
          gridRow="span 2"
          bgcolor={colors.primary[400]}
          sx={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)", borderRadius: "8px" }}
        >
          <Typography
            variant="h5"
            fontWeight="600"
            color={colors.grey[100]}
            p="20px"
          >
            采购 vs 销售
          </Typography>
          <Box height="250px" m="0 20px 0 20px">
            <LineChart data={procurementVsSales} isDashboard />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
