"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, X, Check, Filter, Calendar, ArrowUpDown, Loader2 } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { format } from "date-fns"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { SalesOrder } from "@/lib/types"

interface SelectSalesOrderDialogProps {
  open: boolean
  onClose: () => void
  onSelect: (salesOrders: SalesOrder[]) => void
  salesOrders: SalesOrder[]
  multiSelect?: boolean
  isLoading?: boolean
}

type SortField = "orderNumber" | "customer" | "orderDate" | "expectedShipDate" | "status"
type SortDirection = "asc" | "desc"
type StatusFilter = "all" | "pending" | "partial" | "complete" | "cancelled"

export function SelectSalesOrderDialog({
  open,
  onClose,
  onSelect,
  salesOrders,
  multiSelect = true,
  isLoading = false,
}: SelectSalesOrderDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedOrders, setSelectedOrders] = useState<Record<string, boolean>>({})
  const [sortField, setSortField] = useState<SortField>("orderDate")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [dateRange, setDateRange] = useState<{ start?: Date; end?: Date }>({})
  const itemsPerPage = 5

  // Reset selections when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedOrders({})
      setCurrentPage(1)
    }
  }, [open])

  // Filter orders based on search query, status, and date range
  const filteredOrders = useMemo(() => {
    return salesOrders.filter((order) => {
      // Search filter
      const matchesSearch =
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer.name.toLowerCase().includes(searchQuery.toLowerCase())

      // Status filter
      const matchesStatus = statusFilter === "all" || order.status === statusFilter

      // Date range filter
      let matchesDateRange = true
      if (dateRange.start) {
        const orderDate = new Date(order.orderDate)
        matchesDateRange = matchesDateRange && orderDate >= dateRange.start
      }
      if (dateRange.end) {
        const orderDate = new Date(order.orderDate)
        matchesDateRange = matchesDateRange && orderDate <= dateRange.end
      }

      return matchesSearch && matchesStatus && matchesDateRange
    })
  }, [salesOrders, searchQuery, statusFilter, dateRange])

  // Sort orders
  const sortedOrders = useMemo(() => {
    return [...filteredOrders].sort((a, b) => {
      let comparison = 0

      switch (sortField) {
        case "orderNumber":
          comparison = a.orderNumber.localeCompare(b.orderNumber)
          break
        case "customer":
          comparison = a.customer.name.localeCompare(b.customer.name)
          break
        case "orderDate":
          comparison = new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime()
          break
        case "expectedShipDate":
          comparison = new Date(a.expectedShipDate).getTime() - new Date(b.expectedShipDate).getTime()
          break
        case "status":
          comparison = a.status.localeCompare(b.status)
          break
      }

      return sortDirection === "asc" ? comparison : -comparison
    })
  }, [filteredOrders, sortField, sortDirection])

  // Calculate pagination
  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedOrders = sortedOrders.slice(startIndex, startIndex + itemsPerPage)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const handleSelectOrder = (order: SalesOrder) => {
    if (!multiSelect) {
      // If multi-select is disabled, just select this order and close
      onSelect([order])
      return
    }

    // Toggle selection
    setSelectedOrders((prev) => ({
      ...prev,
      [order.id]: !prev[order.id],
    }))
  }

  const handleSelectAll = () => {
    const allSelected = paginatedOrders.every((order) => selectedOrders[order.id])

    if (allSelected) {
      // Deselect all on current page
      const newSelected = { ...selectedOrders }
      paginatedOrders.forEach((order) => {
        if (order.status !== "complete" && order.status !== "cancelled") {
          newSelected[order.id] = false
        }
      })
      setSelectedOrders(newSelected)
    } else {
      // Select all on current page
      const newSelected = { ...selectedOrders }
      paginatedOrders.forEach((order) => {
        if (order.status !== "complete" && order.status !== "cancelled") {
          newSelected[order.id] = true
        }
      })
      setSelectedOrders(newSelected)
    }
  }

  const handleConfirmSelection = () => {
    const selected = salesOrders.filter((order) => selectedOrders[order.id])
    onSelect(selected)
  }

  const handleClearFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
    setDateRange({})
    setSortField("orderDate")
    setSortDirection("desc")
    setCurrentPage(1)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="warning">Pending</Badge>
      case "partial":
        return <Badge variant="info">Partial</Badge>
      case "complete":
        return <Badge variant="success">Complete</Badge>
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const selectedCount = Object.values(selectedOrders).filter(Boolean).length

  // Calculate total items and value in selected orders
  const selectedOrdersDetails = useMemo(() => {
    const selected = salesOrders.filter((order) => selectedOrders[order.id])

    let totalItems = 0
    let totalValue = 0

    selected.forEach((order) => {
      order.items.forEach((item) => {
        totalItems += item.orderedQty - item.shippedQty
        totalValue += (item.orderedQty - item.shippedQty) * item.unitPrice
      })
    })

    return {
      totalItems,
      totalValue: totalValue.toFixed(2),
    }
  }, [salesOrders, selectedOrders])

  const hasFiltersApplied = searchQuery || statusFilter !== "all" || dateRange.start || dateRange.end

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Select Sales {multiSelect ? "Orders" : "Order"}</DialogTitle>
          <DialogDescription>
            {multiSelect
              ? "Choose one or more sales orders to ship items from"
              : "Choose a sales order to ship items from"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Search and filter bar */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by SO number or customer..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1) // Reset to first page on search
                }}
                className="pl-8"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Clear search</span>
                </Button>
              )}
            </div>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="relative">
                          <Filter className="h-4 w-4" />
                          {hasFiltersApplied && (
                            <span className="absolute -right-1 -top-1 flex h-3 w-3 rounded-full bg-primary">
                              <span className="animate-none h-full w-full rounded-full bg-primary opacity-75"></span>
                            </span>
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuCheckboxItem
                          checked={statusFilter === "all"}
                          onCheckedChange={() => {
                            setStatusFilter("all")
                            setCurrentPage(1)
                          }}
                        >
                          All Statuses
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={statusFilter === "pending"}
                          onCheckedChange={() => {
                            setStatusFilter("pending")
                            setCurrentPage(1)
                          }}
                        >
                          Pending
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={statusFilter === "partial"}
                          onCheckedChange={() => {
                            setStatusFilter("partial")
                            setCurrentPage(1)
                          }}
                        >
                          Partial
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={statusFilter === "complete"}
                          onCheckedChange={() => {
                            setStatusFilter("complete")
                            setCurrentPage(1)
                          }}
                        >
                          Complete
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={statusFilter === "cancelled"}
                          onCheckedChange={() => {
                            setStatusFilter("cancelled")
                            setCurrentPage(1)
                          }}
                        >
                          Cancelled
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={handleClearFilters}
                          className="text-primary justify-center font-medium"
                        >
                          Clear All Filters
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TooltipTrigger>
                <TooltipContent>Filter Orders</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                          <Calendar className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Filter by Date</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <div className="p-2">
                          <div className="space-y-2">
                            <div>
                              <label className="text-xs font-medium">Start Date</label>
                              <Input
                                type="date"
                                value={dateRange.start ? format(dateRange.start, "yyyy-MM-dd") : ""}
                                onChange={(e) => {
                                  setDateRange((prev) => ({
                                    ...prev,
                                    start: e.target.value ? new Date(e.target.value) : undefined,
                                  }))
                                  setCurrentPage(1)
                                }}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium">End Date</label>
                              <Input
                                type="date"
                                value={dateRange.end ? format(dateRange.end, "yyyy-MM-dd") : ""}
                                onChange={(e) => {
                                  setDateRange((prev) => ({
                                    ...prev,
                                    end: e.target.value ? new Date(e.target.value) : undefined,
                                  }))
                                  setCurrentPage(1)
                                }}
                                className="mt-1"
                              />
                            </div>
                          </div>
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setDateRange({})
                            setCurrentPage(1)
                          }}
                          className="text-primary justify-center font-medium"
                        >
                          Clear Date Filter
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TooltipTrigger>
                <TooltipContent>Date Range</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Active filters display */}
          {hasFiltersApplied && (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-muted-foreground">Active filters:</span>
              {searchQuery && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Search: {searchQuery}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => setSearchQuery("")}
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Clear search filter</span>
                  </Button>
                </Badge>
              )}
              {statusFilter !== "all" && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Status: {statusFilter}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => setStatusFilter("all")}
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Clear status filter</span>
                  </Button>
                </Badge>
              )}
              {(dateRange.start || dateRange.end) && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Date: {dateRange.start ? format(dateRange.start, "MMM d, yyyy") : "Any"} -{" "}
                  {dateRange.end ? format(dateRange.end, "MMM d, yyyy") : "Any"}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => setDateRange({})}
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Clear date filter</span>
                  </Button>
                </Badge>
              )}
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={handleClearFilters}>
                Clear all
              </Button>
            </div>
          )}

          {/* Table of sales orders */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {multiSelect && (
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={
                          paginatedOrders.length > 0 &&
                          paginatedOrders.every(
                            (order) =>
                              selectedOrders[order.id] || order.status === "complete" || order.status === "cancelled",
                          )
                        }
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all"
                      />
                    </TableHead>
                  )}
                  <TableHead className="cursor-pointer" onClick={() => handleSort("orderNumber")}>
                    <div className="flex items-center">
                      SO Number
                      {sortField === "orderNumber" && (
                        <ArrowUpDown
                          className={cn("ml-1 h-4 w-4", sortDirection === "asc" ? "rotate-180 transform" : "rotate-0")}
                        />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("customer")}>
                    <div className="flex items-center">
                      Customer
                      {sortField === "customer" && (
                        <ArrowUpDown
                          className={cn("ml-1 h-4 w-4", sortDirection === "asc" ? "rotate-180 transform" : "rotate-0")}
                        />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("orderDate")}>
                    <div className="flex items-center">
                      Order Date
                      {sortField === "orderDate" && (
                        <ArrowUpDown
                          className={cn("ml-1 h-4 w-4", sortDirection === "asc" ? "rotate-180 transform" : "rotate-0")}
                        />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("expectedShipDate")}>
                    <div className="flex items-center">
                      Expected Ship Date
                      {sortField === "expectedShipDate" && (
                        <ArrowUpDown
                          className={cn("ml-1 h-4 w-4", sortDirection === "asc" ? "rotate-180 transform" : "rotate-0")}
                        />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("status")}>
                    <div className="flex items-center">
                      Status
                      {sortField === "status" && (
                        <ArrowUpDown
                          className={cn("ml-1 h-4 w-4", sortDirection === "asc" ? "rotate-180 transform" : "rotate-0")}
                        />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={multiSelect ? 7 : 6} className="h-24 text-center">
                      <div className="flex items-center justify-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading sales orders...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : paginatedOrders.length > 0 ? (
                  paginatedOrders.map((order) => (
                    <TableRow
                      key={order.id}
                      className={cn(
                        selectedOrders[order.id] ? "bg-primary/5" : "",
                        order.status === "complete" || order.status === "cancelled" ? "opacity-60" : "",
                      )}
                    >
                      {multiSelect && (
                        <TableCell>
                          <Checkbox
                            checked={selectedOrders[order.id] || false}
                            onCheckedChange={() => handleSelectOrder(order)}
                            disabled={order.status === "complete" || order.status === "cancelled"}
                          />
                        </TableCell>
                      )}
                      <TableCell className="font-medium">{order.orderNumber}</TableCell>
                      <TableCell>{order.customer.name}</TableCell>
                      <TableCell>{format(new Date(order.orderDate), "MMM d, yyyy")}</TableCell>
                      <TableCell>{format(new Date(order.expectedShipDate), "MMM d, yyyy")}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>
                        <Button
                          variant={selectedOrders[order.id] ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleSelectOrder(order)}
                          disabled={order.status === "complete" || order.status === "cancelled"}
                          className={cn("w-full", selectedOrders[order.id] ? "bg-primary text-primary-foreground" : "")}
                        >
                          {selectedOrders[order.id] ? (
                            <>
                              <Check className="mr-1 h-4 w-4" />
                              Selected
                            </>
                          ) : (
                            "Select"
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={multiSelect ? 7 : 6} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="text-muted-foreground">No sales orders found</div>
                        {hasFiltersApplied && (
                          <Button variant="outline" size="sm" onClick={handleClearFilters}>
                            Clear filters
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* Selection summary */}
          {multiSelect && selectedCount > 0 && (
            <div className="rounded-md bg-muted p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <Badge variant="default" className="px-2 py-1">
                    {selectedCount}
                  </Badge>
                  <span className="text-sm font-medium">
                    {selectedCount === 1 ? "sales order" : "sales orders"} selected
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <div>
                    <span className="font-medium">{selectedOrdersDetails.totalItems}</span> items to ship
                  </div>
                  <div>
                    <span className="font-medium">${selectedOrdersDetails.totalValue}</span> total value
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {multiSelect && (
            <Button onClick={handleConfirmSelection} disabled={selectedCount === 0}>
              Confirm Selection ({selectedCount})
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
