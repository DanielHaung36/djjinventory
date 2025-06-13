"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Eye } from "lucide-react"

// Mock data for inbound transactions
const mockInboundTransactions = [
  {
    id: "INB-001",
    referenceNumber: "PO-2025-001",
    supplier: "Acme Supplies",
    date: "2025-06-10",
    itemCount: 5,
    status: "submitted",
  },
  {
    id: "INB-002",
    referenceNumber: "PO-2025-002",
    supplier: "Global Parts Inc.",
    date: "2025-06-08",
    itemCount: 3,
    status: "approved",
  },
  {
    id: "INB-003",
    referenceNumber: "PO-2025-003",
    supplier: "Tech Components Ltd.",
    date: "2025-06-05",
    itemCount: 8,
    status: "approved",
  },
  {
    id: "INB-004",
    referenceNumber: "PO-2025-004",
    supplier: "Acme Supplies",
    date: "2025-06-01",
    itemCount: 2,
    status: "approved",
  },
  {
    id: "INB-005",
    referenceNumber: "PO-2025-005",
    supplier: "Global Parts Inc.",
    date: "2025-05-28",
    itemCount: 6,
    status: "approved",
  },
]

export function InboundTransactionsTable() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Filter transactions based on search query
  const filteredTransactions = mockInboundTransactions.filter(
    (transaction) =>
      transaction.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.supplier.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Calculate pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage)

  const handleViewDetails = (id: string) => {
    router.push(`/inventory/inbound/${id}`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "success"
      case "submitted":
        return "default"
      case "rejected":
        return "destructive"
      case "void":
        return "secondary"
      default:
        return "default"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by ID, reference number, or supplier..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Reference Number</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="font-medium">{transaction.id}</TableCell>
                <TableCell>{transaction.referenceNumber}</TableCell>
                <TableCell>{transaction.supplier}</TableCell>
                <TableCell>{transaction.date}</TableCell>
                <TableCell>{transaction.itemCount}</TableCell>
                <TableCell>
                  <Badge variant={getStatusColor(transaction.status)}>{transaction.status}</Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => handleViewDetails(transaction.id)}>
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">View details</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-end space-x-2">
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
      )}
    </div>
  )
}
