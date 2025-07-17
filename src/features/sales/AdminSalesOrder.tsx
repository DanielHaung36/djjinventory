"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge, type BadgeProps } from "@/components/ui/badge" // Assuming BadgeProps can be imported for variant type
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Filter,
  Loader2,
  ShieldAlert,
  CheckCircle,
  PackageSearch,
  UserCog,
  Clock,
  ChevronLeft,
  ChevronRight,
  Info,
} from "lucide-react"
import type { SalesOrderAdminItem, OrderStatus } from "@/lib/types/sales-order-admin"
import { ALL_ORDER_STATUSES } from "@/lib/types/sales-order-admin"
import {
  getAdminSalesOrders,
  updateAdminSalesOrderStatus,
  deleteAdminSalesOrder,
} from "@/lib/services/admin-order-service"
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"
import { PermissionGate, PermissionButton } from "@/components/PermissionGate"

// Simulate current admin user - in a real app, this would come from auth context
const CURRENT_ADMIN_USER = "AdminUser_01"

export default function AdminSalesOrdersPage() {
  const { toast } = useToast()
  const [orders, setOrders] = useState<SalesOrderAdminItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all")

  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<SalesOrderAdminItem | null>(null)
  const [newStatus, setNewStatus] = useState<OrderStatus | "">("")

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true)
      try {
        const data = await getAdminSalesOrders()
        setOrders(data)
      } catch (error) {
        toast({
          title: "Error Fetching Sales Orders",
          description: "Could not load sales orders. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [toast])

  const filteredOrders = useMemo(() => {
    return orders.filter(
      (order) =>
        (order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (order.quoteNumber && order.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()))) &&
        (statusFilter === "all" || order.currentStatus === statusFilter),
    )
  }, [orders, searchTerm, statusFilter])

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredOrders.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredOrders, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)

  const handleOpenStatusDialog = (order: SalesOrderAdminItem) => {
    setSelectedOrder(order)
    setNewStatus(order.currentStatus)
    setIsStatusDialogOpen(true)
  }

  const handleOpenDeleteDialog = (order: SalesOrderAdminItem) => {
    setSelectedOrder(order)
    setIsDeleteDialogOpen(true)
  }

  const handleStatusUpdate = async () => {
    if (!selectedOrder || !newStatus) return

    try {
      const updatedOrder = await updateAdminSalesOrderStatus(
        selectedOrder.id,
        newStatus as OrderStatus,
        CURRENT_ADMIN_USER,
      )
      if (updatedOrder) {
        setOrders((prev) => prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)))
        toast({
          variant: "success", // Explicitly set success variant
          title: "Status Updated Successfully",
          description: (
            <div>
              <p>
                Sales Order <span className="font-semibold">{selectedOrder.orderNumber}</span> status changed to{" "}
                <span className="font-semibold">{formatStatus(newStatus as OrderStatus)}</span>.
              </p>
              <p>
                Operated by: <span className="font-semibold">{CURRENT_ADMIN_USER}</span>
              </p>
            </div>
          ),
        })
      } else {
        throw new Error("Service did not return an updated order.")
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error Updating Status",
        description: (error as Error).message || "An unexpected error occurred.",
      })
    } finally {
      setIsStatusDialogOpen(false)
      setSelectedOrder(null)
    }
  }

  const handleDeleteOrder = async () => {
    if (!selectedOrder) return
    try {
      const success = await deleteAdminSalesOrder(selectedOrder.id, CURRENT_ADMIN_USER)
      if (success) {
        setOrders((prev) => prev.filter((o) => o.id !== selectedOrder.id))
        toast({
          variant: "success", // Explicitly set success variant
          title: "Sales Order Deleted",
          description: (
            <div>
              <p>
                Sales Order <span className="font-semibold">{selectedOrder?.orderNumber}</span> has been deleted.
              </p>
              <p>
                Operated by: <span className="font-semibold">{CURRENT_ADMIN_USER}</span>
              </p>
            </div>
          ),
        })
      } else {
        throw new Error("Service indicated deletion failed.")
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error Deleting Order",
        description: (error as Error).message || "An unexpected error occurred.",
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setSelectedOrder(null)
    }
  }

  // Refined status badge logic
  const getStatusBadgeConfig = (
    status: OrderStatus,
  ): { variant: BadgeProps["variant"]; className?: string; icon?: React.ElementType } => {
    switch (status) {
      case "draft":
        return { variant: "warning", className: "bg-amber-100 text-amber-800 border-amber-300", icon: Clock } // Assuming 'warning' is yellow/amber
      case "deposit_received":
      case "ordered":
        return { variant: "info", className: "bg-sky-100 text-sky-800 border-sky-300", icon: Info } // Assuming 'info' is blueish
      case "pre_delivery_inspection":
      case "shipped":
        return { variant: "default", className: "bg-blue-600 text-white" } // Primary action color
      case "final_payment_received":
      case "delivered":
        return { variant: "success", className: "bg-green-600 text-white", icon: CheckCircle } // Assuming 'success' is green
      case "order_closed":
        return { variant: "secondary", className: "bg-slate-600 text-white" } // Darker gray for closed
      case "cancelled":
        return { variant: "destructive", className: "bg-red-600 text-white" }
      default:
        return { variant: "outline", className: "text-gray-700" }
    }
  }

  const formatStatus = (status: OrderStatus) => {
    return status
      .split("_")
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(" ")
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-AU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto py-8 px-4 md:px-6">
        <Card className="shadow-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800">
          <CardHeader className="border-b border-slate-200 dark:border-slate-700 pb-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <CardTitle className="text-3xl font-bold flex items-center text-slate-800 dark:text-slate-100">
                <ShieldAlert className="mr-3 h-8 w-8 text-blue-600 dark:text-blue-500" />
                Admin Sales Order Management
              </CardTitle>
            </div>
            <CardDescription className="mt-1 text-slate-600 dark:text-slate-400">
              Oversee and manage all sales orders. Manually adjust statuses or remove orders if necessary. All actions
              are logged.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="mb-6 p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <Input
                  placeholder="Search Order #, Quote #, Customer..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="text-base h-10 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-50"
                />
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                  <Select
                    value={statusFilter}
                    onValueChange={(value) => {
                      setStatusFilter(value as OrderStatus | "all")
                      setCurrentPage(1)
                    }}
                  >
                    <SelectTrigger className="w-full text-base h-10 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-50">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-slate-700 dark:border-slate-600">
                      <SelectItem value="all" className="dark:text-slate-50 dark:focus:bg-slate-600">
                        All Statuses
                      </SelectItem>
                      {ALL_ORDER_STATUSES.map((status) => (
                        <SelectItem key={status} value={status} className="dark:text-slate-50 dark:focus:bg-slate-600">
                          {formatStatus(status)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col justify-center items-center h-96">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-500" />
                <p className="ml-4 mt-4 text-lg text-slate-500 dark:text-slate-400">Loading Sales Orders...</p>
              </div>
            ) : (
              <div className="rounded-md border border-slate-200 dark:border-slate-700 overflow-x-auto bg-white dark:bg-slate-800">
                <Table className="min-w-full">
                  <TableHeader className="bg-slate-100 dark:bg-slate-700">
                    <TableRow>
                      <TableHead className="w-[150px] px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 tracking-wider">
                        Order #
                      </TableHead>
                      <TableHead className="w-[150px] px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 tracking-wider">
                        Quote #
                      </TableHead>
                      <TableHead className="px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 tracking-wider">
                        Customer
                      </TableHead>
                      <TableHead className="w-[120px] px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 tracking-wider">
                        Order Date
                      </TableHead>
                      <TableHead className="w-[130px] px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 tracking-wider">
                        Total
                      </TableHead>
                      <TableHead className="w-[220px] px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 tracking-wider">
                        Status
                      </TableHead>
                      <TableHead className="w-[220px] px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 tracking-wider">
                        Last Operated By
                      </TableHead>
                      <TableHead className="text-right w-[100px] px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 tracking-wider">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {paginatedOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-40 text-center text-slate-500 dark:text-slate-400 text-lg">
                          No sales orders match your criteria.
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedOrders.map((order) => {
                        const statusConfig = getStatusBadgeConfig(order.currentStatus)
                        const IconComponent = statusConfig.icon
                        return (
                          <TableRow
                            key={order.id}
                            className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-150"
                          >
                            <TableCell className="font-medium px-4 py-3 text-slate-700 dark:text-slate-200">
                              <Link
                                to={`/admin/sales-orders/${order.id}`}
                                className="hover:underline text-blue-600 dark:text-blue-400 font-semibold"
                              >
                                {order.orderNumber}
                              </Link>
                            </TableCell>
                            <TableCell className="px-4 py-3 text-slate-600 dark:text-slate-300">
                              {order.quoteNumber}
                            </TableCell>
                            <TableCell className="px-4 py-3 text-slate-600 dark:text-slate-300">
                              {order.customer}
                            </TableCell>
                            <TableCell className="px-4 py-3 text-slate-600 dark:text-slate-300">
                              {formatDate(order.orderDate)}
                            </TableCell>
                            <TableCell className="px-4 py-3 text-slate-700 dark:text-slate-200">
                              {new Intl.NumberFormat("en-AU", { style: "currency", currency: order.currency }).format(
                                order.totalAmount,
                              )}
                            </TableCell>
                            <TableCell className="px-4 py-3">
                              <Badge
                                variant={statusConfig.variant}
                                className={cn(
                                  "text-xs px-2.5 py-1 font-medium flex items-center gap-1.5 w-fit",
                                  statusConfig.className,
                                )}
                              >
                                {IconComponent && <IconComponent className="h-3.5 w-3.5" />}
                                {formatStatus(order.currentStatus)}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                              <div className="flex items-center">
                                <UserCog className="w-4 h-4 mr-1.5 text-slate-400 dark:text-slate-500" />{" "}
                                {order.lastModifiedBy || "N/A"}
                              </div>
                              <div className="flex items-center mt-0.5 text-xs">
                                <Clock className="w-3.5 h-3.5 mr-1.5 text-slate-400 dark:text-slate-500" />{" "}
                                {formatDate(order.lastModifiedDate)}
                              </div>
                            </TableCell>
                            <TableCell className="text-right px-4 py-3">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-400"
                                  >
                                    <MoreHorizontal className="h-5 w-5" />
                                    <span className="sr-only">Order Actions</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="w-48 dark:bg-slate-700 dark:border-slate-600"
                                >
                                  <DropdownMenuLabel className="dark:text-slate-300">Admin Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator className="dark:bg-slate-600" />
                                  <PermissionGate permission="sales.edit">
                                    <DropdownMenuItem
                                      onClick={() => handleOpenStatusDialog(order)}
                                      className="cursor-pointer dark:text-slate-200 dark:focus:bg-slate-600"
                                    >
                                      <Edit className="mr-2 h-4 w-4" />
                                      Change Status
                                    </DropdownMenuItem>
                                  </PermissionGate>
                                  <DropdownMenuItem
                                    asChild
                                    className="cursor-pointer dark:text-slate-200 dark:focus:bg-slate-600"
                                  >
                                    <Link to={`/admin/sales-orders/${order.id}`}>
                                      <PackageSearch className="mr-2 h-4 w-4" />
                                      View Details
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className="dark:bg-slate-600" />
                                  <PermissionGate permission="sales.delete">
                                    <DropdownMenuItem
                                      onClick={() => handleOpenDeleteDialog(order)}
                                      className="text-red-600 focus:text-red-700 dark:text-red-400 dark:focus:text-red-500 dark:focus:bg-red-900/50 cursor-pointer"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete Order
                                    </DropdownMenuItem>
                                  </PermissionGate>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
          {totalPages > 1 && !loading && (
            <CardFooter className="border-t border-slate-200 dark:border-slate-700 pt-5 flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredOrders.length)} to{" "}
                {Math.min(currentPage * itemsPerPage, filteredOrders.length)} of {filteredOrders.length} entries
              </span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-50 dark:hover:bg-slate-600"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-50 dark:hover:bg-slate-600"
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardFooter>
          )}
        </Card>

        <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
          <DialogContent className="sm:max-w-md dark:bg-slate-800 dark:border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-xl dark:text-slate-100">Change Sales Order Status</DialogTitle>
              <DialogDescription className="dark:text-slate-400">
                Manually update status for Order: <span className="font-semibold">{selectedOrder?.orderNumber}</span>.
                This action will be logged under <span className="font-semibold">{CURRENT_ADMIN_USER}</span>.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-2">
              <label htmlFor="newStatusSelect" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                New Status
              </label>
              <Select
                value={newStatus}
                onValueChange={(value) => setNewStatus(value as OrderStatus)}
                name="newStatusSelect"
              >
                <SelectTrigger
                  id="newStatusSelect"
                  className="w-full dark:bg-slate-700 dark:border-slate-600 dark:text-slate-50"
                >
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-700 dark:border-slate-600">
                  {ALL_ORDER_STATUSES.map((status) => (
                    <SelectItem key={status} value={status} className="dark:text-slate-50 dark:focus:bg-slate-600">
                      {formatStatus(status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button
                  variant="outline"
                  className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-50 dark:hover:bg-slate-600"
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                onClick={handleStatusUpdate}
                disabled={!newStatus || newStatus === selectedOrder?.currentStatus}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <CheckCircle className="mr-2 h-4 w-4" /> Update Status
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md dark:bg-slate-800 dark:border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-xl text-red-600 dark:text-red-500">Confirm Deletion</DialogTitle>
              <DialogDescription className="dark:text-slate-400">
                Are you sure you want to delete Sales Order:{" "}
                <span className="font-semibold">{selectedOrder?.orderNumber}</span>? This action cannot be undone and
                will be logged under <span className="font-semibold">{CURRENT_ADMIN_USER}</span>.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4">
              <DialogClose asChild>
                <Button
                  variant="outline"
                  className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-50 dark:hover:bg-slate-600"
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                variant="destructive"
                onClick={handleDeleteOrder}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete Order
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
