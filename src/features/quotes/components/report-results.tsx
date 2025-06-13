"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"

interface ReportResultsProps {
  type: "inventory-levels" | "transaction-history" | "low-stock"
}

// Mock data for inventory levels report
const inventoryLevelsData = [
  { name: "Widget A", quantity: 24, value: 479.76 },
  { name: "Widget B", quantity: 12, value: 359.88 },
  { name: "Gadget X", quantity: 5, value: 249.95 },
  { name: "Gadget Y", quantity: 0, value: 0 },
  { name: "Component Z", quantity: 36, value: 359.64 },
  { name: "Accessory A", quantity: 18, value: 179.82 },
  { name: "Accessory B", quantity: 9, value: 134.91 },
]

// Mock data for transaction history report
const transactionHistoryData = [
  { date: "2025-06-01", inbound: 12, outbound: 8 },
  { date: "2025-06-02", inbound: 5, outbound: 10 },
  { date: "2025-06-03", inbound: 8, outbound: 6 },
  { date: "2025-06-04", inbound: 15, outbound: 9 },
  { date: "2025-06-05", inbound: 7, outbound: 12 },
  { date: "2025-06-06", inbound: 10, outbound: 5 },
  { date: "2025-06-07", inbound: 3, outbound: 7 },
]

// Mock data for low stock report
const lowStockData = [
  { name: "Gadget X", sku: "GX-003", quantity: 5, threshold: 10, status: "low-stock" },
  { name: "Gadget Y", sku: "GY-004", quantity: 0, threshold: 5, status: "out-of-stock" },
  { name: "Accessory B", sku: "AB-007", quantity: 3, threshold: 5, status: "low-stock" },
  { name: "Widget C", sku: "WC-008", quantity: 2, threshold: 8, status: "low-stock" },
]

export function ReportResults({ type }: ReportResultsProps) {
  // Ensure type is valid before rendering
  if (!type) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p>Please select a report type.</p>
        </CardContent>
      </Card>
    )
  }

  if (type === "inventory-levels") {
    return (
      <div className="space-y-6">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={inventoryLevelsData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <CartesianGrid strokeDasharray="3 3" />
              <Bar dataKey="quantity" name="Quantity" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventoryLevelsData.map((item) => (
                  <TableRow key={item.name}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>${item.value.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell className="font-bold">Total</TableCell>
                  <TableCell className="font-bold">
                    {inventoryLevelsData.reduce((sum, item) => sum + item.quantity, 0)}
                  </TableCell>
                  <TableCell className="font-bold">
                    ${inventoryLevelsData.reduce((sum, item) => sum + item.value, 0).toFixed(2)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (type === "transaction-history") {
    return (
      <div className="space-y-6">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={transactionHistoryData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <CartesianGrid strokeDasharray="3 3" />
              <Line type="monotone" dataKey="inbound" name="Inbound" stroke="#22c55e" strokeWidth={2} />
              <Line type="monotone" dataKey="outbound" name="Outbound" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Inbound</TableHead>
                  <TableHead>Outbound</TableHead>
                  <TableHead>Net Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactionHistoryData.map((item) => (
                  <TableRow key={item.date}>
                    <TableCell className="font-medium">{item.date}</TableCell>
                    <TableCell>{item.inbound}</TableCell>
                    <TableCell>{item.outbound}</TableCell>
                    <TableCell>{item.inbound - item.outbound}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell className="font-bold">Total</TableCell>
                  <TableCell className="font-bold">
                    {transactionHistoryData.reduce((sum, item) => sum + item.inbound, 0)}
                  </TableCell>
                  <TableCell className="font-bold">
                    {transactionHistoryData.reduce((sum, item) => sum + item.outbound, 0)}
                  </TableCell>
                  <TableCell className="font-bold">
                    {transactionHistoryData.reduce((sum, item) => sum + (item.inbound - item.outbound), 0)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (type === "low-stock") {
    return (
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Current Quantity</TableHead>
                <TableHead>Threshold</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lowStockData.map((item) => (
                <TableRow key={item.sku}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.sku}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.threshold}</TableCell>
                  <TableCell>
                    {item.status === "out-of-stock" ? (
                      <Badge variant="destructive">Out of Stock</Badge>
                    ) : (
                      <Badge variant="warning">Low Stock</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    )
  }

  // Default fallback if type doesn't match any of the expected values
  return (
    <Card>
      <CardContent className="p-6 text-center">
        <p>Invalid report type selected.</p>
      </CardContent>
    </Card>
  )
}
