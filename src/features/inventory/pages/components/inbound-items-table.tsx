"use client"

import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Trash2 } from "lucide-react"
import type { InboundItem } from "@/lib/types"
import type { ReactNode } from "react"

interface InboundItemsTableProps {
  items: InboundItem[]
  updateItem: (id: string, field: keyof InboundItem, value: any) => void
  removeItem: (id: string) => void
  renderItemBadge?: (item: InboundItem) => ReactNode
}

export function InboundItemsTable({ items, updateItem, removeItem, renderItemBadge }: InboundItemsTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Unit Price</TableHead>
            <TableHead>Details</TableHead>
            <TableHead>Remarks</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">
                <div className="flex items-center">
                  {item.name}
                  {renderItemBadge && renderItemBadge(item)}
                </div>
              </TableCell>
              <TableCell>{item.category}</TableCell>
              <TableCell>
                <Input
                  type="number"
                  min="1"
                  value={item.qty}
                  onChange={(e) => updateItem(item.id, "qty", Number.parseInt(e.target.value) || 1)}
                  className="w-20"
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={item.price}
                  onChange={(e) => updateItem(item.id, "price", Number.parseFloat(e.target.value) || 0)}
                  className="w-24"
                />
              </TableCell>
              <TableCell>
                {item.category === "Machine" ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Input
                        placeholder="VIN Number"
                        value={item.vin || ""}
                        onChange={(e) => updateItem(item.id, "vin", e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Input
                        placeholder="Serial Number"
                        value={item.serial || ""}
                        onChange={(e) => updateItem(item.id, "serial", e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">Add Loan</span>
                      <Switch
                        checked={!!item.addLoan}
                        onCheckedChange={(checked) => updateItem(item.id, "addLoan", checked)}
                      />
                    </div>
                  </div>
                ) : (
                  <span className="text-muted-foreground">N/A</span>
                )}
              </TableCell>
              <TableCell>
                <Input
                  placeholder="Remarks"
                  value={item.remark || ""}
                  onChange={(e) => updateItem(item.id, "remark", e.target.value)}
                  className="w-full"
                />
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Remove</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
