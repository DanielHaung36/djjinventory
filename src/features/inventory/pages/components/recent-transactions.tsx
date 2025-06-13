"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PackageCheck, PackageOpen } from "lucide-react"

// Mock data for recent transactions
const recentTransactions = [
  {
    id: "INB-001",
    type: "inbound",
    reference: "PO-2025-001",
    date: "2025-06-10",
    entity: "Acme Supplies",
    items: 5,
    status: "completed",
  },
  {
    id: "OUT-001",
    type: "outbound",
    reference: "SO-2025-001",
    date: "2025-06-09",
    entity: "ABC Construction Co.",
    items: 3,
    status: "completed",
  },
  {
    id: "INB-002",
    type: "inbound",
    reference: "PO-2025-002",
    date: "2025-06-08",
    entity: "Global Parts Inc.",
    items: 3,
    status: "completed",
  },
  {
    id: "OUT-002",
    type: "outbound",
    reference: "SO-2025-002",
    date: "2025-06-07",
    entity: "XYZ Builders",
    items: 2,
    status: "completed",
  },
  {
    id: "INB-003",
    type: "inbound",
    reference: "PO-2025-003",
    date: "2025-06-05",
    entity: "Tech Components Ltd.",
    items: 8,
    status: "completed",
  },
]

export function RecentTransactions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Latest inventory movements</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="font-medium">{transaction.id}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {transaction.type === "inbound" ? (
                      <>
                        <PackageCheck className="mr-2 h-4 w-4 text-green-500" />
                        <span>Inbound</span>
                      </>
                    ) : (
                      <>
                        <PackageOpen className="mr-2 h-4 w-4 text-blue-500" />
                        <span>Outbound</span>
                      </>
                    )}
                  </div>
                </TableCell>
                <TableCell>{transaction.reference}</TableCell>
                <TableCell>{transaction.date}</TableCell>
                <TableCell>{transaction.entity}</TableCell>
                <TableCell>{transaction.items}</TableCell>
                <TableCell>
                  <Badge variant={transaction.status === "completed" ? "success" : "default"}>
                    {transaction.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
