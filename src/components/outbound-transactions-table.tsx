"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Eye } from "lucide-react"

// Mock data for outbound transactions
const mockOutboundTransactions = [
  {
    id: "OUT-001",
    referenceNumber: "SO-2025-001",
    customer: "ABC Construction Co.",
    date: "2025-06-09",
    itemCount: 3,
    status: "submitted",
  },
  {
    id: "OUT-002",
    referenceNumber: "SO-2025-002",
    customer: "XYZ Builders",
    date: "2025-06-07",
    itemCount: 2,
    status: "approved",
  },
  {
    id: "OUT-003",
    referenceNumber: "SO-2025-003",
    customer: "City Development Corp.",
    date: "2025-06-04",
    itemCount: 5,
    status: "approved",
  },
  {
    id: "OUT-004",
    referenceNumber: "SO-2025-004",
    customer: "ABC Construction Co.",
    date: "2025-05-30",
    itemCount: 1,
    status: "approved",
  },
  {
    id: "OUT-005",
    referenceNumber: "SO-2025-005",
    customer: "XYZ Builders",
    date: "2025-05-25",
    itemCount: 4,
    status: "approved",
  },
]

export function OutboundTransactionsTable() {
  const router = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Filter transactions based on search query
  const filteredTransactions = mockOutboundTransactions.filter(
    (transaction) =>
      transaction.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.customer.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Calculate pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage)

  const handleViewDetails = (id: string) => {
    router(`/inventory/outbound/${id}`)
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
          placeholder="Search by ID, reference number, or customer..."
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
              <TableHead>Customer</TableHead>
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
                <TableCell>{transaction.customer}</TableCell>
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
