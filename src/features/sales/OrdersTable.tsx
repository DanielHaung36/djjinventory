import type React from "react"
import { useState, useMemo } from "react"
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
  Select,
  InputLabel,
  Button,
  Toolbar,
  InputAdornment,
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

const OrdersTable: React.FC<OrdersTableProps> = ({ orders, onViewOrder, statusFilter }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null)

  // 筛选数据
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.salesRep.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || order.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [orders, searchTerm, statusFilter])

  // 分页数据
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredOrders.slice(startIndex, endIndex)
  }, [filteredOrders, currentPage, pageSize])

  const totalPages = Math.ceil(filteredOrders.length / pageSize)

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, order: SalesOrder) => {
    setAnchorEl(event.currentTarget)
    setSelectedOrder(order)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedOrder(null)
  }

  const toggleOrderSelection = (orderNumber: string) => {
    setSelectedOrders((prev) =>
      prev.includes(orderNumber) ? prev.filter((id) => id !== orderNumber) : [...prev, orderNumber],
    )
  }

  const toggleAllSelection = () => {
    if (selectedOrders.length === paginatedOrders.length) {
      setSelectedOrders([])
    } else {
      setSelectedOrders(paginatedOrders.map((order) => order.orderNumber))
    }
  }

  const getStatusChip = (status: string) => {
    const statusConfig = {
      "deposit-received": { label: "Deposit Received", color: "success", icon: CheckCircle },
      "order-placed": { label: "Order Placed", color: "primary", icon: Inventory },
      "final-payment": { label: "Final Payment", color: "secondary", icon: AttachMoney },
      "pre-delivery-inspection": { label: "Pre-Delivery", color: "warning", icon: Warning },
      shipment: { label: "Shipment", color: "info", icon: Inventory },
      "order-closed": { label: "Completed", color: "default", icon: CheckCircle },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig["deposit-received"]
    const IconComponent = config.icon

    return (
      <Chip
        label={config.label}
        color={config.color as any}
        size="small"
        icon={<IconComponent sx={{ fontSize: 16 }} />}
        variant="outlined"
      />
    )
  }

  const getPriorityChip = (priority: string) => {
    const priorityConfig = {
      high: { color: "error", label: "HIGH" },
      medium: { color: "warning", label: "MEDIUM" },
      low: { color: "success", label: "LOW" },
    }
    const config = priorityConfig[priority as keyof typeof priorityConfig]
    return <Chip label={config.label} color={config.color as any} size="small" />
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <Paper sx={{display:'flex',flexDirection:'column', width: "100%", }}>
      {/* Search and Filter Toolbar */}
      <Toolbar sx={{ pl: { sm: 2 }, pr: { xs: 1, sm: 1 } }}>
        <Box sx={{ flex: "1 1 100%" }}>
          <TextField
            placeholder="Search by Order #, Quote #, Customer, or Sales Rep..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{ minWidth: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="outlined" startIcon={<FilterList />} size="small" sx={{display:'flex',}}>
            Advanced Filter
          </Button>
          {selectedOrders.length > 0 && (
            <Button variant="outlined" size="small">
              Bulk Actions ({selectedOrders.length})
            </Button>
          )}
        </Box>
      </Toolbar>

      {/* Table */}
      <TableContainer component={Paper} >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedOrders.length === paginatedOrders.length && paginatedOrders.length > 0}
                  onChange={toggleAllSelection}
                  indeterminate={selectedOrders.length > 0 && selectedOrders.length < paginatedOrders.length}
                />
              </TableCell>
              <TableCell>
                <strong>Order Info</strong>
              </TableCell>
              <TableCell>
                <strong>Customer</strong>
              </TableCell>
              <TableCell>
                <strong>Machine Model</strong>
              </TableCell>
              <TableCell>
                <strong>Amount</strong>
              </TableCell>
              <TableCell>
                <strong>Status</strong>
              </TableCell>
              <TableCell>
                <strong>Priority</strong>
              </TableCell>
              <TableCell>
                <strong>Sales Rep</strong>
              </TableCell>
              <TableCell>
                <strong>ETA</strong>
              </TableCell>
              <TableCell>
                <strong>Region</strong>
              </TableCell>
              <TableCell align="right">
                <strong>Actions</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedOrders.length > 0 ? (
              paginatedOrders.map((order) => (
                <TableRow key={order.orderNumber} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedOrders.includes(order.orderNumber)}
                      onChange={() => toggleOrderSelection(order.orderNumber)}
                    />
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="bold" color="primary">
                        {order.orderNumber}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {order.quoteNumber}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                        <Person sx={{ fontSize: 12 }} />
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
                        <CalendarToday sx={{ fontSize: 12 }} />
                        <Typography variant="caption" color="text.secondary">
                          {order.quoteDate}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Inventory sx={{ fontSize: 16, color: "text.secondary" }} />
                      <Typography variant="body2">{order.machineModel}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="bold" color="success.main">
                        ${order.total.toLocaleString()}
                      </Typography>
                      {order.depositAmount && (
                        <Typography variant="caption" color="text.secondary">
                          Deposit: ${order.depositAmount.toLocaleString()}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>{getStatusChip(order.status)}</TableCell>
                  <TableCell>{getPriorityChip(order.priority)}</TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar sx={{ width: 24, height: 24, fontSize: 12, bgcolor: "success.light" }}>
                        {getInitials(order.salesRep)}
                      </Avatar>
                      <Typography variant="body2">{order.salesRep}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <Schedule sx={{ fontSize: 12, color: "text.secondary" }} />
                      <Typography variant="body2">{order.eta}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <LocationOn sx={{ fontSize: 12, color: "text.secondary" }} />
                      <Typography variant="body2">{order.region}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Box display="flex" alignItems="center" justifyContent="flex-end" gap={1}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Visibility />}
                        onClick={() => onViewOrder(order)}
                      >
                        View
                      </Button>
                      <IconButton size="small" onClick={(e) => handleMenuClick(e, order)}>
                        <MoreVert />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={11} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No orders found matching your criteria</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Box display="flex" justifyContent="space-between" alignItems="center" p={2} borderTop="1px solid #e0e0e0">
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
              <MenuItem value={5}>5</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={20}>20</MenuItem>
              <MenuItem value={50}>50</MenuItem>
            </Select>
          </FormControl>
          <Typography variant="body2" color="text.secondary">
            Showing {filteredOrders.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{" "}
            {Math.min(currentPage * pageSize, filteredOrders.length)} of {filteredOrders.length} results
            {statusFilter !== "all" && " • Filtered by status"}
          </Typography>
        </Box>
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={(_, page) => setCurrentPage(page)}
          color="primary"
          showFirstButton
          showLastButton
        />
      </Box>

      {/* Context Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
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
