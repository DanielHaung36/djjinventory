"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PackageCheck, PackageOpen } from "lucide-react"

// Define the transaction type
interface Transaction {
  id: string
  type: "inbound" | "outbound"
  reference: string
  date: string
  entity: string
  items: number
  status: string
}

interface RecentTransactionsProps {
  transactions: Transaction[]
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
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
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => (
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
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
