"use client"

import type React from "react"

import { useState, useEffect } from "react"

import { getQuotes, deleteQuote } from "@/lib/services/quote-service"
import type { Quote } from "@/lib/types/quote"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { DeleteConfirmationDialog } from "./components/dialogs/delete-confirmation-dialog"
import { useToast } from "@/hooks/use-toast"

import {
  Search,
  Plus,
  FileText,
  MoreHorizontal,
  Download,
  Edit,
  Trash2,
  Copy,
  Filter,
  ArrowUpDown,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function QuotesPage() {
  const router = useNavigate()
  const { toast } = useToast()
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<keyof Quote>("quoteDate")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [quoteToDelete, setQuoteToDelete] = useState<Quote | null>(null)

  useEffect(() => {
    const fetchQuotes = async () => {
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

    fetchQuotes()
  }, [toast])

  const handleSort = (field: keyof Quote) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const filteredQuotes = quotes.filter(
    (quote) =>
      quote.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (quote.salesRep && quote.salesRep.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const sortedQuotes = [...filteredQuotes].sort((a, b) => {
    if (sortField === "quoteDate") {
      const dateA = new Date(a.quoteDate).getTime()
      const dateB = new Date(b.quoteDate).getTime()
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA
    }

    if (sortField === "amounts") {
      return sortDirection === "asc" ? a.amounts.total - b.amounts.total : b.amounts.total - a.amounts.total
    }

    const valueA = String(a[sortField] || "").toLowerCase()
    const valueB = String(b[sortField] || "").toLowerCase()

    return sortDirection === "asc" ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA)
  })

  // Calculate pagination values
  const totalPages = Math.ceil(sortedQuotes.length / itemsPerPage)
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentQuotes = sortedQuotes.slice(indexOfFirstItem, indexOfLastItem)

  // Handle page changes
  const goToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  // Handle items per page change
  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value))
    setCurrentPage(1) // Reset to first page when changing items per page
  }

  const formatCurrency = (amount: number, currency = "AUD") => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: currency,
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-AU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(date))
  }

  const getStatusBadge = (status: Quote["status"]) => {
    if (status.inStockApproval === "approve") {
      return <Badge variant="success">Approved</Badge>
    } else if (status.inStockApproval === "reject") {
      return <Badge variant="destructive">Rejected</Badge>
    } else {
      return <Badge variant="warning">Pending</Badge>
    }
  }

  const handleDeleteClick = (quote: Quote, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent row click
    setQuoteToDelete(quote)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!quoteToDelete) return

    try {
      await deleteQuote(quoteToDelete.id)

      // Update the quotes list after deletion
      setQuotes(quotes.filter((q) => q.id !== quoteToDelete.id))

      // Show success toast
      toast({
        title: "Quote deleted",
        description: `Quote ${quoteToDelete.quoteNumber} has been deleted successfully.`,
      })

      // Reset pagination if needed
      if (currentQuotes.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1)
      }
    } catch (error) {
      console.error("Failed to delete quote:", error)
      toast({
        title: "Error",
        description: "Failed to delete quote. Please try again.",
        variant: "destructive",
      })
      throw error // Re-throw to be caught by the dialog
    }
  }

  const handleCopyQuote = (quoteId: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent row click

    // Show toast to indicate the action is in progress
    toast({
      title: "Duplicating quote",
      description: "Preparing to duplicate the quote...",
    })

    // Navigate to the new quote page with a query parameter to indicate copying
    router(`/quotes/new?copy=${quoteId}`)
  }

  const handleDownloadPdf = (quote: Quote, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent row click

    toast({
      title: "PDF Download",
      description: "PDF download functionality will be implemented soon.",
    })
  }

  return (
    <div className="container mx-auto py-6 space-y-6 h-full">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Quotes</h1>
        <Button onClick={() => router("/quotes/new")} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Quote
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Quote Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search quotes..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <ArrowUpDown className="h-4 w-4" />
                    Sort
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleSort("quoteNumber")}>Quote Number</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort("customer")}>Customer</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort("quoteDate")}>Quote Date</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort("amounts")}>Amount</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">Quote #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sales Rep</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentQuotes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No quotes found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentQuotes.map((quote) => (
                      <TableRow
                        key={quote.id}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => router(`/quotes/${quote.id}`)}
                      >
                        <TableCell className="font-medium">{quote.quoteNumber}</TableCell>
                        <TableCell>{quote.customer}</TableCell>
                        <TableCell>{formatDate(quote.quoteDate)}</TableCell>
                        <TableCell>{formatCurrency(quote.amounts.total, quote.amounts.currency)}</TableCell>
                        <TableCell>{getStatusBadge(quote.status)}</TableCell>
                        <TableCell>{quote.salesRep || "—"}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  router(`/quotes/${quote.id}`)
                                }}
                              >
                                <FileText className="mr-2 h-4 w-4" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  router(`/quotes/${quote.id}/edit`)
                                }}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => handleDownloadPdf(quote, e)}>
                                <Download className="mr-2 h-4 w-4" />
                                Download PDF
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => handleCopyQuote(quote.id, e)}>
                                <Copy className="mr-2 h-4 w-4" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600" onClick={(e) => handleDeleteClick(quote, e)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination Controls */}
          {!loading && sortedQuotes.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Show</span>
                <select
                  className="border rounded px-2 py-1 text-sm"
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-sm text-gray-600">per page</span>
              </div>

              <div className="flex items-center">
                <span className="text-sm text-gray-600 mr-4">
                  Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, sortedQuotes.length)} of{" "}
                  {sortedQuotes.length}
                </span>

                <div className="flex items-center space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      // Show first page, last page, current page, and pages around current page
                      return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1
                    })
                    .map((page, index, array) => {
                      // Add ellipsis where pages are skipped
                      const showEllipsisBefore = index > 0 && array[index - 1] !== page - 1
                      const showEllipsisAfter = index < array.length - 1 && array[index + 1] !== page + 1

                      return (
                        <div key={page} className="flex items-center">
                          {showEllipsisBefore && <span className="px-2 text-gray-400">...</span>}

                          <Button
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => goToPage(page)}
                            className="h-8 w-8 p-0"
                          >
                            {page}
                          </Button>

                          {showEllipsisAfter && <span className="px-2 text-gray-400">...</span>}
                        </div>
                      )
                    })}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Quote"
        description="Are you sure you want to delete this quote? This will permanently remove the quote and all associated data."
        itemName={quoteToDelete ? `Quote #${quoteToDelete.quoteNumber} - ${quoteToDelete.customer}` : undefined}
      />
    </div>
  )
}
