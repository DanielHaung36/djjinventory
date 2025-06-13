"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { InfoIcon } from "lucide-react"
import type { SalesOrder, OutboundItem } from "@/lib/types"

interface SalesOrderPickingListProps {
  salesOrder: SalesOrder
  onItemsSelected: (items: OutboundItem[]) => void
  onCancel: () => void
}

export function SalesOrderPickingList({ salesOrder, onItemsSelected, onCancel }: SalesOrderPickingListProps) {
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({})
  const [shippedQuantities, setShippedQuantities] = useState<Record<string, number>>(
    Object.fromEntries(salesOrder.items.map((item) => [item.id, item.orderedQty - item.shippedQty])),
  )

  const handleSelectItem = (itemId: string, checked: boolean) => {
    setSelectedItems((prev) => ({
      ...prev,
      [itemId]: checked,
    }))
  }

  const handleQuantityChange = (itemId: string, quantity: number) => {
    const item = salesOrder.items.find((i) => i.id === itemId)
    if (!item) return

    const remainingQty = item.orderedQty - item.shippedQty
    const validQty = Math.min(Math.max(0, quantity), remainingQty)

    setShippedQuantities((prev) => ({
      ...prev,
      [itemId]: validQty,
    }))
  }

  const handleSelectAll = (checked: boolean) => {
    const newSelectedItems: Record<string, boolean> = {}
    salesOrder.items.forEach((item) => {
      if (item.orderedQty > item.shippedQty) {
        newSelectedItems[item.id] = checked
      }
    })
    setSelectedItems(newSelectedItems)
  }

  const handleConfirm = () => {
    const items: OutboundItem[] = salesOrder.items
      .filter((item) => selectedItems[item.id] && shippedQuantities[item.id] > 0)
      .map((item) => ({
        id: item.id,
        name: item.name,
        sku: item.sku,
        qty: shippedQuantities[item.id],
        price: item.unitPrice,
        orderedQty: item.orderedQty,
        shippedQty: item.shippedQty,
        remark: item.description,
      }))

    onItemsSelected(items)
  }

  const anyItemSelected = Object.values(selectedItems).some(Boolean)
  const allItemsSelected = salesOrder.items
    .filter((item) => item.orderedQty > item.shippedQty)
    .every((item) => selectedItems[item.id])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Sales Order Picking List</CardTitle>
        <CardDescription>Select items from SO #{salesOrder.orderNumber} to ship</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium">Customer</p>
            <p className="text-sm">{salesOrder.customer.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Order Date</p>
            <p className="text-sm">{salesOrder.orderDate}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Expected Ship Date</p>
            <p className="text-sm">{salesOrder.expectedShipDate}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Status</p>
            <Badge variant={salesOrder.status === "pending" ? "warning" : "info"}>
              {salesOrder.status.charAt(0).toUpperCase() + salesOrder.status.slice(1)}
            </Badge>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox checked={allItemsSelected} onCheckedChange={(checked) => handleSelectAll(!!checked)} />
                </TableHead>
                <TableHead>Item</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Ordered</TableHead>
                <TableHead>Shipped</TableHead>
                <TableHead>Remaining</TableHead>
                <TableHead>Shipping Now</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salesOrder.items.map((item) => {
                const remainingQty = item.orderedQty - item.shippedQty
                const isFullyShipped = remainingQty <= 0

                return (
                  <TableRow key={item.id} className={isFullyShipped ? "bg-muted/50" : ""}>
                    <TableCell>
                      <Checkbox
                        checked={selectedItems[item.id] || false}
                        onCheckedChange={(checked) => handleSelectItem(item.id, !!checked)}
                        disabled={isFullyShipped}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.sku}</TableCell>
                    <TableCell>{item.orderedQty}</TableCell>
                    <TableCell>{item.shippedQty}</TableCell>
                    <TableCell>{remainingQty}</TableCell>
                    <TableCell>
                      {isFullyShipped ? (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <InfoIcon className="mr-1 h-4 w-4" />
                          Fully shipped
                        </div>
                      ) : (
                        <Input
                          type="number"
                          min="0"
                          max={remainingQty}
                          value={shippedQuantities[item.id] || 0}
                          onChange={(e) => handleQuantityChange(item.id, Number.parseInt(e.target.value) || 0)}
                          disabled={!selectedItems[item.id]}
                          className="w-20"
                        />
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 flex justify-end space-x-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!anyItemSelected}>
            Confirm Selection
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
