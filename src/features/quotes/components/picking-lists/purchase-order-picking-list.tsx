"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { InfoIcon } from "lucide-react"
import type { PurchaseOrder, InboundItem } from "@/lib/types"

interface PurchaseOrderPickingListProps {
  purchaseOrder: PurchaseOrder
  onItemsSelected: (items: InboundItem[]) => void
  onCancel: () => void
}

export function PurchaseOrderPickingList({ purchaseOrder, onItemsSelected, onCancel }: PurchaseOrderPickingListProps) {
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({})
  const [receivedQuantities, setReceivedQuantities] = useState<Record<string, number>>(
    Object.fromEntries(purchaseOrder.items.map((item) => [item.id, item.orderedQty - item.receivedQty])),
  )

  const handleSelectItem = (itemId: string, checked: boolean) => {
    setSelectedItems((prev) => ({
      ...prev,
      [itemId]: checked,
    }))
  }

  const handleQuantityChange = (itemId: string, quantity: number) => {
    const item = purchaseOrder.items.find((i) => i.id === itemId)
    if (!item) return

    const remainingQty = item.orderedQty - item.receivedQty
    const validQty = Math.min(Math.max(0, quantity), remainingQty)

    setReceivedQuantities((prev) => ({
      ...prev,
      [itemId]: validQty,
    }))
  }

  const handleSelectAll = (checked: boolean) => {
    const newSelectedItems: Record<string, boolean> = {}
    purchaseOrder.items.forEach((item) => {
      if (item.orderedQty > item.receivedQty) {
        newSelectedItems[item.id] = checked
      }
    })
    setSelectedItems(newSelectedItems)
  }

  const handleConfirm = () => {
    const items: InboundItem[] = purchaseOrder.items
      .filter((item) => selectedItems[item.id] && receivedQuantities[item.id] > 0)
      .map((item) => ({
        id: item.id,
        name: item.name,
        type: item.type,
        qty: receivedQuantities[item.id],
        price: item.unitPrice,
        orderedQty: item.orderedQty,
        receivedQty: item.receivedQty,
        remark: item.description,
      }))

    onItemsSelected(items)
  }

  const anyItemSelected = Object.values(selectedItems).some(Boolean)
  const allItemsSelected = purchaseOrder.items
    .filter((item) => item.orderedQty > item.receivedQty)
    .every((item) => selectedItems[item.id])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Purchase Order Picking List</CardTitle>
        <CardDescription>Select items from PO #{purchaseOrder.orderNumber} to receive</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium">Supplier</p>
            <p className="text-sm">{purchaseOrder.supplier.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Order Date</p>
            <p className="text-sm">{purchaseOrder.orderDate}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Expected Delivery</p>
            <p className="text-sm">{purchaseOrder.expectedDeliveryDate}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Status</p>
            <Badge variant={purchaseOrder.status === "pending" ? "warning" : "info"}>
              {purchaseOrder.status.charAt(0).toUpperCase() + purchaseOrder.status.slice(1)}
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
                <TableHead>Received</TableHead>
                <TableHead>Remaining</TableHead>
                <TableHead>Receiving Now</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchaseOrder.items.map((item) => {
                const remainingQty = item.orderedQty - item.receivedQty
                const isFullyReceived = remainingQty <= 0

                return (
                  <TableRow key={item.id} className={isFullyReceived ? "bg-muted/50" : ""}>
                    <TableCell>
                      <Checkbox
                        checked={selectedItems[item.id] || false}
                        onCheckedChange={(checked) => handleSelectItem(item.id, !!checked)}
                        disabled={isFullyReceived}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.sku}</TableCell>
                    <TableCell>{item.orderedQty}</TableCell>
                    <TableCell>{item.receivedQty}</TableCell>
                    <TableCell>{remainingQty}</TableCell>
                    <TableCell>
                      {isFullyReceived ? (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <InfoIcon className="mr-1 h-4 w-4" />
                          Fully received
                        </div>
                      ) : (
                        <Input
                          type="number"
                          min="0"
                          max={remainingQty}
                          value={receivedQuantities[item.id] || 0}
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
