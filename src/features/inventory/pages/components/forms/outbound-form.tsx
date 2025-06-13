"use client"

import { useState, useEffect } from "react"
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
import { FileUploader } from "../file-uploader"
import { OutboundItemsTable } from "../outbound-items-table"
import { createOutboundTransaction, getSalesOrders } from "@/lib/actions/inventory-actions"
import type { Customer, OutboundItem, SalesOrder } from "@/lib/types"
import { PlusCircle, FileText, ClipboardList, Tag, ListFilter, ShoppingBag, Loader2 } from "lucide-react"
import { AddItemDialog } from "../dialogs/add-item-dialog"
import { SelectSalesOrderDialog } from "../dialogs/select-sales-order-dialog"
import { SalesOrderPickingList } from "../picking-lists/sales-order-picking-list"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useNavigate } from "react-router-dom"
// Mock data for customers
const customers: Customer[] = [
  { id: "1", name: "Retail Store A" },
  { id: "2", name: "Wholesale Distributor B" },
  { id: "3", name: "Online Marketplace C" },
]

const formSchema = z.object({
  // Modified to allow both transaction types simultaneously
  transactionTypes: z.array(z.enum(["order-based", "non-order-based"])).min(1, "Select at least one transaction type"),
  salesOrderIds: z.array(z.string()).optional(),
  customerName: z.string().min(1, "Customer is required"),
  referenceNumber: z.string().min(1, "Reference number is required"),
  shipmentDate: z.string().min(1, "Shipment date is required"),
  notes: z.string().optional(),
  files: z.array(z.any()).optional(),
})

export function OutboundForm() {
  const router = useNavigate()
  const [items, setItems] = useState<OutboundItem[]>([])
  const [soItems, setSoItems] = useState<OutboundItem[]>([])
  const [manualItems, setManualItems] = useState<OutboundItem[]>([])
  const [isAddingItem, setIsAddingItem] = useState(false)
  const [isSelectingSO, setIsSelectingSO] = useState(false)
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([])
  const [isLoadingSalesOrders, setIsLoadingSalesOrders] = useState(false)
  const [selectedSOs, setSelectedSOs] = useState<SalesOrder[]>([])
  const [currentSO, setCurrentSO] = useState<SalesOrder | null>(null)
  const [showPickingList, setShowPickingList] = useState(false)
  const [customerNameInput, setCustomerNameInput] = useState("")
  const [referenceNumberInput, setReferenceNumberInput] = useState("")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      transactionTypes: ["non-order-based"],
      salesOrderIds: [],
      customerName: "",
      referenceNumber: "",
      shipmentDate: new Date().toISOString().split("T")[0],
      notes: "",
      files: [],
    },
  })

  const transactionTypes = form.watch("transactionTypes")
  const isOrderBased = transactionTypes.includes("order-based")
  const isManualEntry = transactionTypes.includes("non-order-based")

  // Update combined items whenever either source changes
  useEffect(() => {
    setItems([...soItems, ...manualItems])
  }, [soItems, manualItems])

  // Update form values when customer name input changes
  useEffect(() => {
    form.setValue("customerName", customerNameInput)
  }, [customerNameInput, form])

  // Update form values when reference number input changes
  useEffect(() => {
    form.setValue("referenceNumber", referenceNumberInput)
  }, [referenceNumberInput, form])

  useEffect(() => {
    const loadSalesOrders = async () => {
      try {
        setIsLoadingSalesOrders(true)
        const orders = await getSalesOrders()
        setSalesOrders(orders)
      } catch (error) {
        console.error("Failed to load sales orders:", error)
        toast({
          title: "Error",
          description: "Failed to load sales orders. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingSalesOrders(false)
      }
    }

    loadSalesOrders()
  }, [])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (items.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one item to the outbound transaction.",
        variant: "destructive",
      })
      return
    }

    try {
      await createOutboundTransaction({
        ...values,
        // Use the first transaction type for backward compatibility
        transactionType: values.transactionTypes[0],
        // Use the first SO ID for backward compatibility
        salesOrderId: values.salesOrderIds && values.salesOrderIds.length > 0 ? values.salesOrderIds[0] : undefined,
        items,
        files: values.files,
      })

      toast({
        title: "Success",
        description: "Outbound transaction created successfully.",
      })

      router("/inventory/outbound")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create outbound transaction. Please try again.",
        variant: "destructive",
      })
    }
  }

  const addManualItem = (item: OutboundItem) => {
    const newItem = { ...item, id: `manual-${Date.now()}`, source: "manual" }
    setManualItems([...manualItems, newItem])
    setIsAddingItem(false)
  }

  const updateItem = (id: string, field: keyof OutboundItem, value: any) => {
    // Determine which array to update based on the item's ID
    if (id.startsWith("so-")) {
      setSoItems(soItems.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
    } else {
      setManualItems(manualItems.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
    }
  }

  const removeItem = (id: string) => {
    // Remove from the appropriate array based on ID prefix
    if (id.startsWith("so-")) {
      setSoItems(soItems.filter((item) => item.id !== id))
    } else {
      setManualItems(manualItems.filter((item) => item.id !== id))
    }
  }

  const handleSelectSOs = (salesOrders: SalesOrder[]) => {
    setSelectedSOs(salesOrders)
    setIsSelectingSO(false)

    // Update form values based on the selected SOs
    form.setValue(
      "salesOrderIds",
      salesOrders.map((so) => so.id),
    )

    // If we have selected SOs and this is the first one, update customer info
    if (salesOrders.length > 0 && !isManualEntry) {
      const firstSO = salesOrders[0]
      setCustomerNameInput(firstSO.customer.name)
      setReferenceNumberInput(salesOrders.length === 1 ? firstSO.orderNumber : `Multiple SOs (${salesOrders.length})`)
    }

    // If we have selected SOs, show the picking list for the first one
    if (salesOrders.length > 0) {
      setCurrentSO(salesOrders[0])
      setShowPickingList(true)
    }
  }

  const handlePickingListItemsSelected = (selectedItems: OutboundItem[]) => {
    if (!currentSO) return

    // Add a source identifier and ensure unique IDs for SO items
    const soItemsWithSource = selectedItems.map((item) => ({
      ...item,
      id: item.id.startsWith("so-") ? item.id : `so-${currentSO.id}-${item.id}`,
      source: "sales-order",
      soNumber: currentSO.orderNumber, // Add SO number for reference
    }))

    // Add these items to the existing SO items
    setSoItems((prev) => {
      // Remove any existing items from this SO
      const filteredItems = prev.filter((item) => !item.id.includes(`so-${currentSO.id}-`))
      return [...filteredItems, ...soItemsWithSource]
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

  const handleCancelPickingList = () => {
    // If we're in the middle of selecting items from multiple SOs,
    // move to the next one or close if we're done
    if (currentSO) {
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

    // If no SO items were selected and manual entry is not enabled, reset to manual entry
    if (soItems.length === 0 && !isManualEntry) {
      form.setValue("transactionTypes", ["non-order-based"])
    }
  }

  const handleViewPickingList = (so: SalesOrder) => {
    setCurrentSO(so)
    setShowPickingList(true)
  }

  const handleRemoveSO = (soId: string) => {
    // Remove the SO from selected SOs
    const updatedSOs = selectedSOs.filter((so) => so.id !== soId)
    setSelectedSOs(updatedSOs)

    // Update form values
    form.setValue(
      "salesOrderIds",
      updatedSOs.map((so) => so.id),
    )

    // Remove items associated with this SO
    setSoItems(soItems.filter((item) => !item.id.includes(`so-${soId}-`)))

    // If we removed all SOs, hide the picking list
    if (updatedSOs.length === 0) {
      setShowPickingList(false)
      setCurrentSO(null)
    } else if (currentSO?.id === soId) {
      // If we removed the current SO, show the first one in the list
      setCurrentSO(updatedSOs[0])
    }

    // Update customer and reference if needed
    if (updatedSOs.length === 0 && !isManualEntry) {
      setCustomerNameInput("")
      setReferenceNumberInput("")
    } else if (updatedSOs.length === 1) {
      setReferenceNumberInput(updatedSOs[0].orderNumber)
    } else if (updatedSOs.length > 1) {
      setReferenceNumberInput(`Multiple SOs (${updatedSOs.length})`)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>New Outbound Transaction</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Transaction Type Selection */}
            <FormField
              control={form.control}
              name="transactionTypes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transaction Type</FormLabel>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="non-order-based"
                        checked={field.value.includes("non-order-based")}
                        onCheckedChange={(checked) => {
                          const currentValues = [...field.value]
                          if (checked) {
                            if (!currentValues.includes("non-order-based")) {
                              currentValues.push("non-order-based")
                            }
                          } else {
                            const index = currentValues.indexOf("non-order-based")
                            if (index !== -1) {
                              currentValues.splice(index, 1)
                            }
                          }
                          field.onChange(currentValues)
                        }}
                      />
                      <label
                        htmlFor="non-order-based"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Manual Entry
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="order-based"
                        checked={field.value.includes("order-based")}
                        onCheckedChange={(checked) => {
                          const currentValues = [...field.value]
                          if (checked) {
                            if (!currentValues.includes("order-based")) {
                              currentValues.push("order-based")
                            }
                          } else {
                            const index = currentValues.indexOf("order-based")
                            if (index !== -1) {
                              currentValues.splice(index, 1)
                            }
                          }
                          field.onChange(currentValues)
                        }}
                      />
                      <label
                        htmlFor="order-based"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Sales Order
                      </label>
                    </div>
                  </div>
                  <FormDescription>
                    Select one or both transaction types. Manual entry allows you to add items directly, while Sales
                    Order lets you ship items from existing orders.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Sales Order Selection */}
            {isOrderBased && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Sales Orders</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsSelectingSO(true)}
                    disabled={isLoadingSalesOrders}
                  >
                    {isLoadingSalesOrders ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <FileText className="mr-2 h-4 w-4" />
                        Select Sales Orders
                      </>
                    )}
                  </Button>
                </div>

                {selectedSOs.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {selectedSOs.map((so) => (
                        <div
                          key={so.id}
                          className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm"
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{so.orderNumber}</span>
                            <span className="text-xs text-muted-foreground">{so.customer.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => handleViewPickingList(so)}
                                  >
                                    <ClipboardList className="h-4 w-4" />
                                    <span className="sr-only">View picking list</span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>View picking list</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-destructive"
                                    onClick={() => handleRemoveSO(so.id)}
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="24"
                                      height="24"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      className="h-4 w-4"
                                    >
                                      <path d="M18 6 6 18" />
                                      <path d="m6 6 12 12" />
                                    </svg>
                                    <span className="sr-only">Remove</span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Remove sales order</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                      ))}
                    </div>

                    {showPickingList && currentSO && (
                      <Card className="border-dashed">
                        <CardHeader className="py-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium">Picking List: {currentSO.orderNumber}</CardTitle>
                            {selectedSOs.length > 1 && (
                              <div className="flex items-center gap-1">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  disabled={selectedSOs.indexOf(currentSO) === 0}
                                  onClick={() => {
                                    const currentIndex = selectedSOs.findIndex((so) => so.id === currentSO.id)
                                    if (currentIndex > 0) {
                                      setCurrentSO(selectedSOs[currentIndex - 1])
                                    }
                                  }}
                                >
                                  Previous
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  disabled={selectedSOs.indexOf(currentSO) === selectedSOs.length - 1}
                                  onClick={() => {
                                    const currentIndex = selectedSOs.findIndex((so) => so.id === currentSO.id)
                                    if (currentIndex < selectedSOs.length - 1) {
                                      setCurrentSO(selectedSOs[currentIndex + 1])
                                    }
                                  }}
                                >
                                  Next
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="py-0">
                          <ScrollArea className="h-[200px]">
                            <SalesOrderPickingList
                              salesOrder={currentSO}
                              onItemsSelected={handlePickingListItemsSelected}
                              onCancel={handleCancelPickingList}
                            />
                          </ScrollArea>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                ) : (
                  <div className="rounded-md border border-dashed p-6 text-center">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                      <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <h3 className="mt-3 text-sm font-medium">No sales orders selected</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Click the button above to select sales orders for this outbound transaction.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Basic Information */}
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer</FormLabel>
                    <Select
                      value={customerNameInput}
                      onValueChange={(value) => {
                        setCustomerNameInput(value)
                      }}
                      disabled={isOrderBased && selectedSOs.length > 0 && !isManualEntry}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.name}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                      <Input
                        {...field}
                        value={referenceNumberInput}
                        onChange={(e) => setReferenceNumberInput(e.target.value)}
                        disabled={isOrderBased && selectedSOs.length > 0 && !isManualEntry}
                      />
                    </FormControl>
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
                      <Input {...field} type="date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Add any additional notes here..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="files"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Attachments</FormLabel>
                  <FormControl>
                    <FileUploader
                      value={field.value}
                      onChange={(files) => field.onChange(files)}
                      maxFiles={5}
                      maxSize={5 * 1024 * 1024} // 5MB
                      accept={{
                        "application/pdf": [".pdf"],
                        "image/*": [".png", ".jpg", ".jpeg"],
                      }}
                    />
                  </FormControl>
                  <FormDescription>Upload relevant documents (packing slips, BOLs, etc.)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Items Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Items</h3>
                <div className="flex gap-2">
                  {isManualEntry && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAddingItem(true)}
                      className="flex items-center"
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Manual Item
                    </Button>
                  )}
                </div>
              </div>

              {/* Item source indicators */}
              {items.length > 0 && isManualEntry && isOrderBased && (
                <div className="flex flex-wrap gap-2">
                  {manualItems.length > 0 && (
                    <Badge variant="outline" className="bg-blue-50">
                      <Tag className="mr-1 h-3 w-3" />
                      Manual Items: {manualItems.length}
                    </Badge>
                  )}
                  {soItems.length > 0 && (
                    <Badge variant="outline" className="bg-green-50">
                      <FileText className="mr-1 h-3 w-3" />
                      SO Items: {soItems.length}
                    </Badge>
                  )}
                </div>
              )}

              {items.length > 0 ? (
                <OutboundItemsTable items={items} updateItem={updateItem} removeItem={removeItem} />
              ) : (
                <div className="rounded-md border border-dashed p-6 text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <ListFilter className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <h3 className="mt-3 text-sm font-medium">No items added</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {isManualEntry && isOrderBased
                      ? "Add items manually or select from sales orders."
                      : isManualEntry
                        ? "Click the 'Add Manual Item' button to add items."
                        : "Select sales orders to add items."}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router("/inventory/outbound")}>
              Cancel
            </Button>
            <Button type="submit">Create Outbound Transaction</Button>
          </CardFooter>
        </Card>
      </form>

      <AddItemDialog open={isAddingItem} onClose={() => setIsAddingItem(false)} onAdd={addManualItem} mode="outbound" />

      <SelectSalesOrderDialog
        open={isSelectingSO}
        onClose={() => setIsSelectingSO(false)}
        onSelect={handleSelectSOs}
        salesOrders={salesOrders}
        multiSelect={true}
        isLoading={isLoadingSalesOrders}
      />
    </Form>
  )
}