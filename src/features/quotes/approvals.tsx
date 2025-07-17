"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2, CheckCircle, XCircle, Eye, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react"
import { Link } from "react-router-dom";
import type { Quote, QuoteStatusString } from "@/lib/types/quote"
import { useGetQuotesByStatusQuery, useUpdateQuoteStatusMutation } from './quotesApi'
import { ApprovalReasonDialog } from "@/components/dialogs/approval-reason-dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function QuoteApprovalsPage() {
  const { toast } = useToast()
  const [filterStatus, setFilterStatus] = useState<QuoteStatusString | "all">("pending")
  const [sortField, setSortField] = useState<keyof Quote | "amount">("quoteDate")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5) // Default items per page

  // Dialog state
  const [isReasonDialogOpen, setIsReasonDialogOpen] = useState(false)
  const [currentQuoteForAction, setCurrentQuoteForAction] = useState<Quote | null>(null)
  const [currentActionType, setCurrentActionType] = useState<"approve" | "reject">("approve")

  // RTK Query hooks
  const { data: quotesData, isLoading: loading, error: quotesError } = useGetQuotesByStatusQuery({
    status: filterStatus,
    page: currentPage,
    limit: itemsPerPage,
  })
  
  const [updateQuoteStatusMutation] = useUpdateQuoteStatusMutation()
  
  // Extract quotes from RTK Query response
  const quotes = quotesData?.data || []
  const totalQuotes = quotesData?.total || 0

  // Error handling for RTK Query
  useEffect(() => {
    if (quotesError) {
      toast({
        title: "Error",
        description: "Failed to fetch quotes. Please try again.",
        variant: "destructive",
      })
    }
  }, [quotesError, toast])

  const handleSort = (field: keyof Quote | "amount" | "requester") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
    setCurrentPage(1) // Reset to first page on sort
  }

  // Since RTK Query handles filtering and pagination on the server side,
  // we can use the quotes directly. For now, we'll handle sorting on the client side.
  const sortedQuotes = useMemo(() => {
    const sorted = [...quotes].sort((a, b) => {
      let valA: any
      let valB: any

      if (sortField === "amount") {
        valA = a.amounts?.total || 0
        valB = b.amounts?.total || 0
      } else if (sortField === "quoteDate") {
        valA = new Date(a.quoteDate).getTime()
        valB = new Date(b.quoteDate).getTime()
      } else if (sortField === "customer") {
        valA = String(a.customer?.name || a.customer || "").toLowerCase()
        valB = String(b.customer?.name || b.customer || "").toLowerCase()
      } else {
        valA = String(a[sortField as keyof Quote] || "").toLowerCase()
        valB = String(b[sortField as keyof Quote] || "").toLowerCase()
      }

      if (valA < valB) return sortDirection === "asc" ? -1 : 1
      if (valA > valB) return sortDirection === "asc" ? 1 : -1
      return 0
    })

    return sorted
  }, [quotes, sortField, sortDirection])

  const totalPages = Math.ceil(totalQuotes / itemsPerPage)

  const openApprovalDialog = (quote: Quote, action: "approve" | "reject") => {
    setCurrentQuoteForAction(quote)
    setCurrentActionType(action)
    setIsReasonDialogOpen(true)
  }

  const handleReasonSubmit = async (reason: string) => {
    if (!currentQuoteForAction) return

    try {
      const statusMap: Record<string, string> = {
        approve: 'approved',
        reject: 'rejected'
      }
      
      await updateQuoteStatusMutation({
        id: currentQuoteForAction.id.toString(),
        status: statusMap[currentActionType] || currentActionType,
        reason,
        userId: 1, // TODO: Get actual user ID from auth context
      }).unwrap()
      
      toast({
        title: `Quote ${currentActionType === "approve" ? "Approved" : "Rejected"}`,
        description: `Quote ${currentQuoteForAction.quoteNumber} has been ${currentActionType === "approve" ? "approved" : "rejected"}. ${reason ? `Reason: ${reason}` : ""}`,
        variant: currentActionType === "approve" ? "default" : "destructive",
      })
    } catch (error) {
      console.error("Failed to update status:", error)
      toast({
        title: "Error",
        description: "Failed to update quote status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsReasonDialogOpen(false)
      setCurrentQuoteForAction(null)
    }
  }

  const getStatusBadge = (status: string, reason?: string) => {
    const badge = (
      <>
        {status === "approved" && <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200">Approved</Badge>}
        {status === "rejected" && <Badge variant="destructive">Rejected</Badge>}
        {status === "pending" && <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200">Pending</Badge>}
        {!["approved", "rejected", "pending"].includes(status) && <Badge variant="secondary">{status}</Badge>}
      </>
    )
    if (reason) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>{badge}</span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{reason}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }
    return badge
  }

  const formatCurrency = (amount: number, currency = "AUD") => {
    return new Intl.NumberFormat("en-AU", { style: "currency", currency: currency }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("en-AU", { day: "2-digit", month: "2-digit", year: "numeric" }).format(
      new Date(dateString),
    )
  }

  const SortableHeader = ({ label, field }: { label: string; field: keyof Quote | "amount" | "requester" }) => (
    <TableHead onClick={() => handleSort(field)} className="cursor-pointer hover:bg-muted/50">
      <div className="flex items-center gap-1">
        {label}
        {sortField === field && <ArrowUpDown className="h-3 w-3" />}
      </div>
    </TableHead>
  )

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value))
    setCurrentPage(1) // Reset to first page
  }

  return (
    <div className="container mx-auto py-6 space-y-6 h-full">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Quote Approvals</h1>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Manage Quote Approvals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <Select
              value={filterStatus}
              onValueChange={(value: QuoteStatusString | "all") => {
                setFilterStatus(value)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center space-x-2 text-sm">
              <span>Show:</span>
              <Select value={String(itemsPerPage)} onValueChange={handleItemsPerPageChange}>
                <SelectTrigger className="w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span>entries</span>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortableHeader label="Quote #" field="quoteNumber" />
                    <SortableHeader label="Customer" field="customer" />
                    <SortableHeader label="Applicant" field="requester" />
                    <SortableHeader label="Date" field="quoteDate" />
                    <SortableHeader label="Amount" field="amount" />
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedQuotes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No quotes found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedQuotes.map((quote) => (
                      <TableRow key={quote.id}>
                        <TableCell className="font-medium">{quote.quoteNumber}</TableCell>
                        <TableCell>{quote.customer?.name || quote.customer || "N/A"}</TableCell>
                        <TableCell>{quote.salesRepUser?.username || quote.requester || "N/A"}</TableCell>
                        <TableCell>{formatDate(quote.quoteDate)}</TableCell>
                        <TableCell>{formatCurrency(quote.amounts?.total || 0, quote.amounts?.currency || "AUD")}</TableCell>
                        <TableCell>
                          {getStatusBadge(quote.status || "pending")}
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          {(quote.status || "pending") === "pending" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openApprovalDialog(quote, "approve")}
                                className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700 px-2 py-1 h-auto"
                              >
                                <CheckCircle className="mr-1 h-3 w-3" /> Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openApprovalDialog(quote, "reject")}
                                className="text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700 px-2 py-1 h-auto"
                              >
                                <XCircle className="mr-1 h-3 w-3" /> Reject
                              </Button>
                            </>
                          )}
                          <Button variant="ghost" size="icon" asChild className="h-7 w-7">
                            <Link to={`/quotes/${quote.id}`} title="View Details">
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View Details</span>
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {!loading && totalQuotes > itemsPerPage && (
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-muted-foreground">
                Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalQuotes)} to{" "}
                {Math.min(currentPage * itemsPerPage, totalQuotes)} of {totalQuotes} entries
              </span>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {currentQuoteForAction && (
        <ApprovalReasonDialog
          isOpen={isReasonDialogOpen}
          onClose={() => setIsReasonDialogOpen(false)}
          onSubmit={handleReasonSubmit}
          actionType={currentActionType}
          quoteNumber={currentQuoteForAction.quoteNumber}
        />
      )}
    </div>
  )
}
