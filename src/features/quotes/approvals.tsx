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
import { getQuotes, updateQuoteStatus } from "@/lib/quote-service"
import { ApprovalReasonDialog } from "@/components/dialogs/approval-reason-dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function QuoteApprovalsPage() {
  const { toast } = useToast()
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
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

  useEffect(() => {
    const fetchQuotesData = async () => {
      setLoading(true)
      try {
        const data = await getQuotes()
        setQuotes(data)
      } catch (error) {
        console.error("Failed to fetch quotes:", error)
        toast({
          title: "Error",
          description: "Failed to fetch quotes. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchQuotesData()
  }, [toast])

  const handleSort = (field: keyof Quote | "amount" | "requester") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
    setCurrentPage(1) // Reset to first page on sort
  }

  const filteredQuotes = useMemo(() => {
    let filtered = quotes
    if (filterStatus !== "all") {
      filtered = quotes.filter((quote) => quote.status.inStockApproval === filterStatus)
    }
    return filtered
  }, [quotes, filterStatus])

  const sortedAndPaginatedQuotes = useMemo(() => {
    const sorted = [...filteredQuotes].sort((a, b) => {
      let valA: any
      let valB: any

      if (sortField === "amount") {
        valA = a.amounts.total
        valB = b.amounts.total
      } else if (sortField === "quoteDate") {
        valA = new Date(a.quoteDate).getTime()
        valB = new Date(b.quoteDate).getTime()
      } else {
        valA = String(a[sortField as keyof Quote] || "").toLowerCase()
        valB = String(b[sortField as keyof Quote] || "").toLowerCase()
      }

      if (valA < valB) return sortDirection === "asc" ? -1 : 1
      if (valA > valB) return sortDirection === "asc" ? 1 : -1
      return 0
    })

    const startIndex = (currentPage - 1) * itemsPerPage
    return sorted.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredQuotes, sortField, sortDirection, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredQuotes.length / itemsPerPage)

  const openApprovalDialog = (quote: Quote, action: "approve" | "reject") => {
    setCurrentQuoteForAction(quote)
    setCurrentActionType(action)
    setIsReasonDialogOpen(true)
  }

  const handleReasonSubmit = async (reason: string) => {
    if (!currentQuoteForAction) return

    try {
      await updateQuoteStatus(currentQuoteForAction.id, currentActionType, reason)
      setQuotes((prevQuotes) =>
        prevQuotes.map((q) =>
          q.id === currentQuoteForAction.id
            ? { ...q, status: { ...q.status, inStockApproval: currentActionType, approvalReason: reason } }
            : q,
        ),
      )
      toast({
        title: `Quote ${currentActionType === "approve" ? "Approved" : "Rejected"}`,
        description: `Quote ${currentQuoteForAction.quoteNumber} has been ${currentActionType}. Reason: ${reason || "N/A"}`,
        variant: currentActionType === "approve" ? "success" : "destructive",
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

  const getStatusBadge = (status: QuoteStatusString, reason?: string) => {
    const badge = (
      <>
        {status === "approve" && <Badge variant="success">Approved</Badge>}
        {status === "reject" && <Badge variant="destructive">Rejected</Badge>}
        {status === "pending" && <Badge variant="warning">Pending</Badge>}
        {!["approve", "reject", "pending"].includes(status) && <Badge variant="secondary">{status}</Badge>}
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
                <SelectItem value="approve">Approved</SelectItem>
                <SelectItem value="reject">Rejected</SelectItem>
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
                  {sortedAndPaginatedQuotes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No quotes found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedAndPaginatedQuotes.map((quote) => (
                      <TableRow key={quote.id}>
                        <TableCell className="font-medium">{quote.quoteNumber}</TableCell>
                        <TableCell>{quote.customer}</TableCell>
                        <TableCell>{quote.requester}</TableCell>
                        <TableCell>{formatDate(quote.quoteDate)}</TableCell>
                        <TableCell>{formatCurrency(quote.amounts.total, quote.amounts.currency)}</TableCell>
                        <TableCell>
                          {getStatusBadge(quote.status.inStockApproval, quote.status.approvalReason)}
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          {quote.status.inStockApproval === "pending" && (
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

          {!loading && filteredQuotes.length > itemsPerPage && (
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-muted-foreground">
                Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredQuotes.length)} to{" "}
                {Math.min(currentPage * itemsPerPage, filteredQuotes.length)} of {filteredQuotes.length} entries
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
