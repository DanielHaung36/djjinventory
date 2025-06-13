"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { InboundItemsTable } from "@/components/inbound-items-table"
import { OutboundItemsTable } from "@/components/outbound-items-table"
import { createEditRequest } from "@/lib/actions/inventory-actions"
import type { InboundTransaction, OutboundTransaction, InboundItem, OutboundItem } from "@/lib/types"
import { PlusCircle, ClipboardList, Tag } from "lucide-react"
import { AddItemDialog } from "@/components/dialogs/add-item-dialog"
import { SelectPurchaseOrderDialog } from "@/components/dialogs/select-purchase-order-dialog"
import { SelectSalesOrderDialog } from "@/components/dialogs/select-sales-order-dialog"
import { PurchaseOrderPickingList } from "@/components/picking-lists/purchase-order-picking-list"
import { SalesOrderPickingList } from "@/components/picking-lists/sales-order-picking-list"
import { Badge } from "@/components/ui/badge"

interface DocumentEditorProps {
  document: InboundTransaction | OutboundTransaction
  documentType: "inbound" | "outbound"
  onCancel: () => void
  onSubmit: () => void
  purchaseOrders?: any[]
  salesOrders?: any[]
}

export function DocumentEditor({
  document,
  documentType,
  onCancel,
  onSubmit,
  purchaseOrders = [],
  salesOrders = [],
}: DocumentEditorProps) {
  const router = useRouter()
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false)
  const [editReason, setEditReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [items, setItems] = useState<InboundItem[] | OutboundItem[]>(document.items)
  const [changes, setChanges] = useState<{ field: string; oldValue: any; newValue: any }[]>([])

  // States for adding items
  const [isAddingItem, setIsAddingItem] = useState(false)
  const [isSelectingPO, setIsSelectingPO] = useState(false)
  const [isSelectingSO, setIsSelectingSO] = useState(false)
  const [selectedPOs, setSelectedPOs] = useState<any[]>([])
  const [selectedSOs, setSelectedSOs] = useState<any[]>([])
  const [currentPO, setCurrentPO] = useState<any | null>(null)
  const [currentSO, setCurrentSO] = useState<any | null>(null)
  const [showPickingList, setShowPickingList] = useState(false)
  const [removedItems, setRemovedItems] = useState<string[]>([])

  // Create form schema based on document type
  const formSchema =
    documentType === "inbound"
      ? z.object({
          supplierName: z.string().min(1, "Supplier is required"),
          referenceNumber: z.string().min(1, "Reference number is required"),
          receiptDate: z.string().min(1, "Receipt date is required"),
          notes: z.string().optional(),
        })
      : z.object({
          customerName: z.string().min(1, "Customer is required"),
          referenceNumber: z.string().min(1, "Reference number is required"),
          shipmentDate: z.string().min(1, "Shipment date is required"),
          shippingMethod: z.string().min(1, "Shipping method is required"),
          trackingNumber: z.string().optional(),
          driverInfo: z.string().optional(),
          transportationCost: z.string().optional(),
          notes: z.string().optional(),
        })

  // Create form with default values from document
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues:
      documentType === "inbound"
        ? {
            supplierName: (document as InboundTransaction).supplierName,
            referenceNumber: document.referenceNumber,
            receiptDate: (document as InboundTransaction).receiptDate,
            notes: document.notes || "",
          }
        : {
            customerName: (document as OutboundTransaction).customerName,
            referenceNumber: document.referenceNumber,
            shipmentDate: (document as OutboundTransaction).shipmentDate,
            shippingMethod: (document as OutboundTransaction).shippingMethod,
            trackingNumber: (document as OutboundTransaction).trackingNumber || "",
            driverInfo: (document as OutboundTransaction).driverInfo || "",
            transportationCost: (document as OutboundTransaction).transportationCost?.toString() || "0",
            notes: document.notes || "",
          },
  })

  // Track form changes
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (type === "change" && name) {
        const oldValue =
          documentType === "inbound" ? (document as InboundTransaction)[name] : (document as OutboundTransaction)[name]
        const newValue = value[name]

        if (oldValue !== newValue && newValue !== undefined) {
          // Check if we already have a change for this field
          const existingChangeIndex = changes.findIndex((change) => change.field === name)
          if (existingChangeIndex !== -1) {
            // If the value is back to the original, remove the change
            if (newValue === oldValue) {
              setChanges((prev) => prev.filter((_, i) => i !== existingChangeIndex))
            } else {
              // Otherwise update the change
              setChanges((prev) => {
                const newChanges = [...prev]
                newChanges[existingChangeIndex] = {
                  field: name,
                  oldValue,
                  newValue,
                }
                return newChanges
              })
            }
          } else {
            // Add a new change
            setChanges((prev) => [
              ...prev,
              {
                field: name,
                oldValue,
                newValue,
              },
            ])
          }
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [form, document, documentType, changes])

  const updateItem = (id: string, field: string, value: any) => {
    setItems((prevItems) => {
      const updatedItems = prevItems.map((item, index) => {
        if (item.id === id) {
          // Track the change
          const oldValue = item[field]
          if (oldValue !== value) {
            const fieldPath = `items[${index}].${field}`
            const existingChangeIndex = changes.findIndex((change) => change.field === fieldPath)
            if (existingChangeIndex !== -1) {
              // If the value is back to the original, remove the change
              if (value === oldValue) {
                setChanges((prev) => prev.filter((_, i) => i !== existingChangeIndex))
              } else {
                // Otherwise update the change
                setChanges((prev) => {
                  const newChanges = [...prev]
                  newChanges[existingChangeIndex] = {
                    field: fieldPath,
                    oldValue,
                    newValue: value,
                  }
                  return newChanges
                })
              }
            } else {
              // Add a new change
              setChanges((prev) => [
                ...prev,
                {
                  field: fieldPath,
                  oldValue,
                  newValue: value,
                },
              ])
            }
          }

          return { ...item, [field]: value }
        }
        return item
      })
      return updatedItems
    })
  }

  const addManualItem = (item: InboundItem | OutboundItem) => {
    const newItem = { ...item, id: `manual-${Date.now()}`, source: "manual" }
    setItems((prevItems) => [...prevItems, newItem])

    // Track the addition in changes
    setChanges((prev) => [
      ...prev,
      {
        field: `items.add`,
        oldValue: null,
        newValue: newItem,
      },
    ])

    setIsAddingItem(false)
  }

  const removeItem = (id: string) => {
    // Find the item to be removed
    const itemToRemove = items.find((item) => item.id === id)

    if (itemToRemove) {
      // Track the removal in changes
      setChanges((prev) => [
        ...prev,
        {
          field: `items.remove`,
          oldValue: itemToRemove,
          newValue: null,
        },
      ])

      // Add to removed items list
      setRemovedItems((prev) => [...prev, id])

      // Remove from items list
      setItems((prevItems) => prevItems.filter((item) => item.id !== id))
    }
  }

  const handleFormSubmit = () => {
    // Open the submit dialog if there are changes
    if (changes.length > 0) {
      setIsSubmitDialogOpen(true)
    } else {
      toast({
        title: "No changes",
        description: "No changes were made to the document.",
      })
    }
  }

  const handleSubmitChanges = async () => {
    if (!editReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for the changes.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      await createEditRequest(document.id, documentType, editReason, changes)
      toast({
        title: "Success",
        description: "Edit request submitted successfully.",
      })
      setIsSubmitDialogOpen(false)
      onSubmit()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit edit request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSelectPOs = (purchaseOrders: any[]) => {
    setSelectedPOs(purchaseOrders)
    setIsSelectingPO(false)

    // If we have selected POs, show the picking list for the first one
    if (purchaseOrders.length > 0) {
      setCurrentPO(purchaseOrders[0])
      setShowPickingList(true)
    }
  }

  const handleSelectSOs = (salesOrders: any[]) => {
    setSelectedSOs(salesOrders)
    setIsSelectingSO(false)

    // If we have selected SOs, show the picking list for the first one
    if (salesOrders.length > 0) {
      setCurrentSO(salesOrders[0])
      setShowPickingList(true)
    }
  }

  const handlePickingListItemsSelected = (selectedItems: InboundItem[] | OutboundItem[]) => {
    if (documentType === "inbound" && currentPO) {
      // Add a source identifier and ensure unique IDs for PO items
      const poItemsWithSource = selectedItems.map((item) => ({
        ...item,
        id: item.id.startsWith("po-") ? item.id : `po-${currentPO.id}-${item.id}-${Date.now()}`,
        source: "purchase-order",
        poNumber: currentPO.orderNumber, // Add PO number for reference
      }))

      // Add these items to the existing items
      setItems((prev) => [...prev, ...poItemsWithSource])

      // Track the additions in changes
      poItemsWithSource.forEach((item) => {
        setChanges((prev) => [
          ...prev,
          {
            field: `items.add`,
            oldValue: null,
            newValue: item,
          },
        ])
      })

      // Move to the next PO if there is one
      const currentIndex = selectedPOs.findIndex((po) => po.id === currentPO.id)
      if (currentIndex < selectedPOs.length - 1) {
        setCurrentPO(selectedPOs[currentIndex + 1])
      } else {
        setShowPickingList(false)
        setCurrentPO(null)
      }
    } else if (documentType === "outbound" && currentSO) {
      // Add a source identifier and ensure unique IDs for SO items
      const soItemsWithSource = selectedItems.map((item) => ({
        ...item,
        id: item.id.startsWith("so-") ? item.id : `so-${currentSO.id}-${item.id}-${Date.now()}`,
        source: "sales-order",
        soNumber: currentSO.orderNumber, // Add SO number for reference
      }))

      // Add these items to the existing items
      setItems((prev) => [...prev, ...soItemsWithSource])

      // Track the additions in changes
      soItemsWithSource.forEach((item) => {
        setChanges((prev) => [
          ...prev,
          {
            field: `items.add`,
            oldValue: null,
            newValue: item,
          },
        ])
      })

      // Move to the next SO if there is one
      const currentIndex = selectedSOs.findIndex((so) => so.id === currentSO.id)
      if (currentIndex < selectedSOs.length - 1) {
        setCurrentSO(selectedSOs[currentIndex + 1])
      } else {
        setShowPickingList(false)
        setCurrentSO(null)
      }
    }
  }

  const handleCancelPickingList = () => {
    if (documentType === "inbound" && currentPO) {
      const currentIndex = selectedPOs.findIndex((po) => po.id === currentPO.id)
      if (currentIndex < selectedPOs.length - 1) {
        setCurrentPO(selectedPOs[currentIndex + 1])
      } else {
        setShowPickingList(false)
        setCurrentPO(null)
      }
    } else if (documentType === "outbound" && currentSO) {
      const currentIndex = selectedSOs.findIndex((so) => so.id === currentSO.id)
      if (currentIndex < selectedSOs.length - 1) {
        setCurrentSO(selectedSOs[currentIndex + 1])
      } else {
        setShowPickingList(false)
        setCurrentSO(null)
      }
    } else {
      setShowPickingList(false)
    }
  }

  return (
    <>
      {showPickingList ? (
        <div className="space-y-4">
          {documentType === "inbound" && currentPO ? (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">
                  Selecting items from PO: {currentPO.orderNumber} ({currentPO.supplier.name})
                </h3>
                <div className="text-sm text-muted-foreground">
                  PO {selectedPOs.findIndex((po) => po.id === currentPO.id) + 1} of {selectedPOs.length}
                </div>
              </div>
              <PurchaseOrderPickingList
                purchaseOrder={currentPO}
                onItemsSelected={handlePickingListItemsSelected}
                onCancel={handleCancelPickingList}
              />
            </>
          ) : documentType === "outbound" && currentSO ? (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">
                  Selecting items from SO: {currentSO.orderNumber} ({currentSO.customer.name})
                </h3>
                <div className="text-sm text-muted-foreground">
                  SO {selectedSOs.findIndex((so) => so.id === currentSO.id) + 1} of {selectedSOs.length}
                </div>
              </div>
              <SalesOrderPickingList
                salesOrder={currentSO}
                onItemsSelected={handlePickingListItemsSelected}
                onCancel={handleCancelPickingList}
              />
            </>
          ) : null}
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Edit {documentType === "inbound" ? "Inbound" : "Outbound"} Document</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {documentType === "inbound" ? (
                  // Inbound form fields
                  <>
                    <FormField
                      control={form.control}
                      name="supplierName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Supplier</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="referenceNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reference Number</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>Purchase order or invoice number</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="receiptDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Receipt Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                ) : (
                  // Outbound form fields
                  <>
                    <FormField
                      control={form.control}
                      name="customerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="referenceNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reference Number</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>Sales order or invoice number</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="shipmentDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Shipment Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="shippingMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Shipping Method</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select shipping method" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="logistics">Logistics</SelectItem>
                              <SelectItem value="express">Express Shipping</SelectItem>
                              <SelectItem value="pickup">Customer Pickup</SelectItem>
                              <SelectItem value="warehouse">Warehouse Delivery</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="trackingNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tracking Number</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="transportationCost"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Transportation Cost</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="driverInfo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Driver Information</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Items</CardTitle>
                <div className="flex space-x-2">
                  {documentType === "inbound" && (
                    <Button type="button" variant="outline" onClick={() => setIsSelectingPO(true)}>
                      <ClipboardList className="mr-2 h-4 w-4" />
                      Add from Purchase Order
                    </Button>
                  )}
                  {documentType === "outbound" && (
                    <Button type="button" variant="outline" onClick={() => setIsSelectingSO(true)}>
                      <ClipboardList className="mr-2 h-4 w-4" />
                      Add from Sales Order
                    </Button>
                  )}
                  <Button type="button" variant="outline" onClick={() => setIsAddingItem(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Manual Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {items.length > 0 ? (
                  <div className="space-y-4">
                    {documentType === "inbound" ? (
                      <InboundItemsTable
                        items={items as InboundItem[]}
                        updateItem={updateItem}
                        removeItem={removeItem}
                        renderItemBadge={(item) => {
                          const isPoItem = item.id.startsWith("po-")
                          return (
                            <Badge variant={isPoItem ? "info" : "default"} className="ml-2">
                              <Tag className="mr-1 h-3 w-3" />
                              {isPoItem ? (item as any).poNumber || "PO Item" : "Manual"}
                            </Badge>
                          )
                        }}
                      />
                    ) : (
                      <OutboundItemsTable
                        items={items as OutboundItem[]}
                        updateItem={updateItem}
                        removeItem={removeItem}
                        renderItemBadge={(item) => {
                          const isSoItem = item.id.startsWith("so-")
                          return (
                            <Badge variant={isSoItem ? "info" : "default"} className="ml-2">
                              <Tag className="mr-1 h-3 w-3" />
                              {isSoItem ? (item as any).soNumber || "SO Item" : "Manual"}
                            </Badge>
                          )
                        }}
                      />
                    )}
                  </div>
                ) : (
                  <div className="flex h-32 items-center justify-center rounded-md border border-dashed">
                    <p className="text-sm text-muted-foreground">
                      No items in this document. Add items using the buttons above.
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button variant="outline" type="button" onClick={onCancel}>
                  Cancel
                </Button>
                <Button type="submit" disabled={changes.length === 0}>
                  Submit Changes
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>
      )}

      <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Changes</DialogTitle>
            <DialogDescription>
              Please provide a reason for the changes. This will be visible in the audit trail.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter reason for changes"
              value={editReason}
              onChange={(e) => setEditReason(e.target.value)}
              className="min-h-32"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSubmitDialogOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmitChanges} disabled={isSubmitting || !editReason.trim()}>
              {isSubmitting ? "Submitting..." : "Submit Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AddItemDialog
        open={isAddingItem}
        onClose={() => setIsAddingItem(false)}
        onAdd={addManualItem}
        mode={documentType === "inbound" ? "inbound" : "outbound"}
      />

      {documentType === "inbound" && (
        <SelectPurchaseOrderDialog
          open={isSelectingPO}
          onClose={() => setIsSelectingPO(false)}
          onSelect={handleSelectPOs}
          purchaseOrders={purchaseOrders}
          multiSelect={true}
        />
      )}

      {documentType === "outbound" && (
        <SelectSalesOrderDialog
          open={isSelectingSO}
          onClose={() => setIsSelectingSO(false)}
          onSelect={handleSelectSOs}
          salesOrders={salesOrders}
          multiSelect={true}
        />
      )}
    </>
  )
}
