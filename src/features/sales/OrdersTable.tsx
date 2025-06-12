// OrdersTable.tsx

import React, { useState, useMemo } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Avatar,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Box,
  Typography,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem as SelectItem,
  Button,
  Toolbar,
  InputAdornment,
  Drawer,
} from "@mui/material"
import {
  MoreVert,
  Visibility,
  GetApp,
  Person,
  CalendarToday,
  AttachMoney,
  Inventory,
  LocationOn,
  Schedule,
  CheckCircle,
  Warning,
  Search,
  FilterList,
} from "@mui/icons-material"
import type { SalesOrder } from "./types/sales-order"

interface OrdersTableProps {
  orders: SalesOrder[]
  onViewOrder: (order: SalesOrder) => void
  statusFilter: string
}

const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  onViewOrder,
  statusFilter,
}) => {
  // 基本筛选状态
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFrom, setDateFrom] = useState("")    // YYYY-MM-DD
  const [dateTo, setDateTo] = useState("")        // YYYY-MM-DD
  const [repFilter, setRepFilter] = useState("all")
  // 高级筛选状态
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [modelFilter, setModelFilter] = useState("all")
  const [regionFilter, setRegionFilter] = useState("all")

  // 选择与分页状态
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // 菜单状态
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null)

  // 组合筛选：搜索、状态、时间段、销售代表、机型、地区
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const text = searchTerm.toLowerCase()
      const matchesSearch =
        order.orderNumber.toLowerCase().includes(text) ||
        order.customer.toLowerCase().includes(text) ||
        order.quoteNumber.toLowerCase().includes(text) ||
        order.salesRep.toLowerCase().includes(text)

      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter

      const quoteDate = new Date(order.quoteDate)
      const fromOK = !dateFrom || quoteDate >= new Date(dateFrom)
      const toOK = !dateTo || quoteDate <= new Date(dateTo)

      const repOK = repFilter === "all" || order.salesRep === repFilter
      const modelOK = modelFilter === "all" || order.machineModel === modelFilter
      const regionOK = regionFilter === "all" || order.region === regionFilter

      return matchesSearch && matchesStatus && fromOK && toOK && repOK && modelOK && regionOK
    })
  }, [orders, searchTerm, statusFilter, dateFrom, dateTo, repFilter, modelFilter, regionFilter])

  // 分页
  const totalPages = Math.ceil(filteredOrders.length / pageSize)
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredOrders.slice(start, start + pageSize)
  }, [filteredOrders, currentPage, pageSize])

  // 交互函数
  const toggleAllSelection = () => {
    if (
      selectedOrders.length === paginatedOrders.length &&
      paginatedOrders.length > 0
    ) {
      setSelectedOrders([])
    } else {
      setSelectedOrders(paginatedOrders.map((o) => o.orderNumber))
    }
  }

  const toggleOrderSelection = (orderNumber: string) => {
    setSelectedOrders((prev) =>
      prev.includes(orderNumber)
        ? prev.filter((id) => id !== orderNumber)
        : [...prev, orderNumber]
    )
  }

  const handleMenuClick = (
    e: React.MouseEvent<HTMLElement>,
    order: SalesOrder
  ) => {
    setAnchorEl(e.currentTarget)
    setSelectedOrder(order)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedOrder(null)
  }

  // 状态与优先级标签
  const getStatusChip = (status: string) => {
    const cfg = {
      "deposit-received": {
        label: "Deposit Received",
        color: "success" as const,
        icon: CheckCircle,
      },
      "order-placed": {
        label: "Order Placed",
        color: "primary" as const,
        icon: Inventory,
      },
      "final-payment": {
        label: "Final Payment",
        color: "secondary" as const,
        icon: AttachMoney,
      },
      "pre-delivery-inspection": {
        label: "Pre-Delivery",
        color: "warning" as const,
        icon: Warning,
      },
      shipment: {
        label: "Shipment",
        color: "info" as const,
        icon: Inventory,
      },
      "order-closed": {
        label: "Completed",
        color: "default" as const,
        icon: CheckCircle,
      },
    }
    const c = cfg[status as keyof typeof cfg] || cfg["deposit-received"]
    const Icon = c.icon
    return (
      <Chip
        label={c.label}
        color={c.color}
        size="small"
        icon={<Icon fontSize="small" />}
        variant="outlined"
      />
    )
  }

  const getPriorityChip = (priority: string) => {
    const cfg = {
      high: { label: "HIGH", color: "error" as const },
      medium: { label: "MEDIUM", color: "warning" as const },
      low: { label: "LOW", color: "success" as const },
    }
    const c = cfg[priority as keyof typeof cfg] || cfg.low
    return <Chip label={c.label} color={c.color} size="small" />
  }

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()

  return (
    <Paper>
      {/* 工具栏：搜索 / 时间 / 人员 / 高级 */}
      <Toolbar sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1 }}>
        <TextField
          size="small"
          placeholder="Search by Order #, Customer, Sales Rep..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setCurrentPage(1)
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          size="small"
          type="date"
          label="From"
          InputLabelProps={{ shrink: true }}
          value={dateFrom}
          onChange={(e) => {
            setDateFrom(e.target.value)
            setCurrentPage(1)
          }}
        />

        <TextField
          size="small"
          type="date"
          label="To"
          InputLabelProps={{ shrink: true }}
          value={dateTo}
          onChange={(e) => {
            setDateTo(e.target.value)
            setCurrentPage(1)
          }}
        />

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Sales Rep</InputLabel>
          <Select
            value={repFilter}
            label="Sales Rep"
            onChange={(e) => {
              setRepFilter(e.target.value)
              setCurrentPage(1)
            }}
          >
            <SelectItem value="all">All</SelectItem>
            {[...new Set(orders.map((o) => o.salesRep))].map((rep) => (
              <SelectItem key={rep} value={rep}>
                {rep}
              </SelectItem>
            ))}
          </Select>
        </FormControl>

        <Button
          size="small"
          variant="outlined"
          startIcon={<FilterList />}
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          高级筛选
        </Button>

        {showAdvanced && (
          <>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Machine Model</InputLabel>
              <Select
                value={modelFilter}
                label="Machine Model"
                onChange={(e) => {
                  setModelFilter(e.target.value)
                  setCurrentPage(1)
                }}
              >
                <SelectItem value="all">All</SelectItem>
                {[...new Set(orders.map((o) => o.machineModel))].map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Region</InputLabel>
              <Select
                value={regionFilter}
                label="Region"
                onChange={(e) => {
                  setRegionFilter(e.target.value)
                  setCurrentPage(1)
                }}
              >
                <SelectItem value="all">All</SelectItem>
                {[...new Set(orders.map((o) => o.region))].map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </Select>
            </FormControl>
          </>
        )}
      </Toolbar>

      {/* 表格 */}
      <TableContainer component={Paper}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={
                    selectedOrders.length === paginatedOrders.length &&
                    paginatedOrders.length > 0
                  }
                  indeterminate={
                    selectedOrders.length > 0 &&
                    selectedOrders.length < paginatedOrders.length
                  }
                  onChange={toggleAllSelection}
                />
              </TableCell>
              <TableCell>Order Info</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Machine Model</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Sales Rep</TableCell>
              <TableCell>ETA</TableCell>
              <TableCell>Region</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedOrders.length > 0 ? (
              paginatedOrders.map((order) => (
                <TableRow
                  key={order.orderNumber}
                  hover
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedOrders.includes(order.orderNumber)}
                      onChange={() =>
                        toggleOrderSelection(order.orderNumber)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        color="primary"
                      >
                        {order.orderNumber}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {order.quoteNumber}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                        <Person fontSize="small" />
                        <Typography variant="caption" color="text.secondary">
                          {order.createdBy}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {order.customer}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                        <CalendarToday fontSize="small" />
                        <Typography variant="caption" color="text.secondary">
                          {order.quoteDate}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Inventory fontSize="small" color="text.secondary" />
                      <Typography variant="body2">
                        {order.machineModel}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        color="success.main"
                      >
                        ${order.total.toLocaleString()}
                      </Typography>
                      {order.depositAmount && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          Deposit: ${order.depositAmount.toLocaleString()}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>{getStatusChip(order.status)}</TableCell>
                  <TableCell>{getPriorityChip(order.priority)}</TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar
                        sx={{
                          width: 24,
                          height: 24,
                          fontSize: 12,
                          bgcolor: "success.light",
                        }}                        >
                        {getInitials(order.salesRep)}
                      </Avatar>
                      <Typography variant="body2">
                        {order.salesRep}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <Schedule fontSize="small" color="text.secondary" />
                      <Typography variant="body2">{order.eta}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <LocationOn fontSize="small" color="text.secondary" />
                      <Typography variant="body2">{order.region}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Box display="flex" justifyContent="flex-end" gap={1}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Visibility />}
                        onClick={() => onViewOrder(order)}
                      >
                        View
                      </Button>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuClick(e, order)}
                      >
                        <MoreVert />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={11} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    No orders found matching your criteria
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 分页 */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        p={2}
        borderTop="1px solid #e0e0e0"
      >
        <Box display="flex" alignItems="center" gap={2}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Rows per page</InputLabel>
            <Select
              value={pageSize}
              label="Rows per page"
              onChange={(e) => {
                setPageSize(Number(e.target.value))
                setCurrentPage(1)
              }}
            >
              <SelectItem value={5}>5</SelectItem>
              <SelectItem value={10}>10</SelectItem>
              <SelectItem value={20}>20</SelectItem>
              <SelectItem value={50}>50</SelectItem>
            </Select>
          </FormControl>
          <Typography variant="body2" color="text.secondary">
            Showing{" "}
            {filteredOrders.length > 0
              ? (currentPage - 1) * pageSize + 1
              : 0}{" "}
            to{" "}
            {Math.min(currentPage * pageSize, filteredOrders.length)} of{" "}
            {filteredOrders.length} results
            {statusFilter !== "all" && " • Filtered by status"}
          </Typography>
        </Box>
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={(_, p) => setCurrentPage(p)}
          showFirstButton
          showLastButton
        />
      </Box>

      {/* 右键菜单 */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <GetApp sx={{ mr: 1 }} />
          Download PDF
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Person sx={{ mr: 1 }} />
          Contact Customer
        </MenuItem>
      </Menu>
    </Paper>
  )
}

export default OrdersTable
