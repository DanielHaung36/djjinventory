"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { getQuoteById, updateQuote, calculateQuoteTotals } from "@/lib/services/quote-service"
import type { Quote, QuoteItem } from "@/lib/types/quote"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Plus, Trash2, User, Building, Package, Calendar, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const formSchema = z.object({
  quoteNumber: z.string().min(1, "Quote number is required"),
  customer: z.string().min(1, "Customer name is required"),
  customerABN: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  quoteDate: z.string().min(1, "Quote date is required"),
  salesRep: z.string().optional(),
  store: z.string().optional(),
  warehouse: z.string().optional(),
  currency: z.enum(["AUD", "USD", "CNY"]),
  companyName: z.string().min(1, "Company name is required"),
  companyABN: z.string().optional(),
  remarks: z.string().optional(),
  warrantyRemarks: z.string().optional(),
})

export default function EditQuotePage() {
 const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [quote, setQuote] = useState<Quote | null>(null)
  const [items, setItems] = useState<QuoteItem[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quoteNumber: "",
      customer: "",
      customerABN: "",
      phone: "",
      email: "",
      quoteDate: new Date().toISOString().split("T")[0],
      salesRep: "",
      store: "",
      warehouse: "",
      currency: "AUD",
      companyName: "Heavy Equipment Australia Pty Ltd",
      companyABN: "98 765 432 109",
      remarks: "",
      warrantyRemarks: "",
    },
  })

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        setLoading(true)
        const data = await getQuoteById(id)
        if (data) {
          setQuote(data)
          setItems(data.items || [])

          // Format date for input field
          const formattedDate = data.quoteDate
            ? new Date(data.quoteDate).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0]

          // Set form values
          form.reset({
            quoteNumber: data.quoteNumber,
            customer: data.customer,
            customerABN: data.customerABN || "",
            phone: data.phone || "",
            email: data.email || "",
            quoteDate: formattedDate,
            salesRep: data.salesRep || "",
            store: data.store || "",
            warehouse: data.warehouse || "",
            currency: data.amounts.currency,
            companyName: data.company.name,
            companyABN: data.company.abn || "",
            remarks: data.remarks?.[0]?.general || "",
            warrantyRemarks: data.remarks?.[0]?.warrantyAndSpecial || "",
          })
        } else {
          setError("Quote not found")
          navigate("/quotes")
        }
      } catch (error) {
        console.error("Failed to fetch quote:", error)
        setError("Failed to load quote data")
      } finally {
        setLoading(false)
      }
    }

    fetchQuote()
  }, [id, navigate, form])

  const addItem = () => {
    setItems([
      ...items,
      {
        description: "",
        quantity: 1,
        unit: "unit",
        unitPrice: 0,
        totalPrice: 0,
      },
    ])
  }

  const updateItem = (index: number, field: keyof QuoteItem, value: any) => {
    const updatedItems = [...items]
    updatedItems[index] = { ...updatedItems[index], [field]: value }

    // Recalculate total price if quantity or unit price changes
    if (field === "quantity" || field === "unitPrice" || field === "discount") {
      const quantity = field === "quantity" ? value : updatedItems[index].quantity
      const unitPrice = field === "unitPrice" ? value : updatedItems[index].unitPrice
      const discount = field === "discount" ? value : updatedItems[index].discount || 0

      updatedItems[index].totalPrice = quantity * unitPrice - discount
    }

    setItems(updatedItems)
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (items.length === 0) {
      setError("Please add at least one item to the quote")
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      const { subTotal, gstTotal, total } = calculateQuoteTotals(items)

      if (!quote) {
        throw new Error("Quote data not available")
      }

      const quoteData: Partial<Quote> = {
        quoteNumber: values.quoteNumber,
        customer: values.customer,
        customerABN: values.customerABN || undefined,
        phone: values.phone || undefined,
        email: values.email || undefined,
        amounts: {
          subTotal,
          gstTotal,
          total,
          currency: values.currency,
        },
        quoteDate: new Date(values.quoteDate),
        quoteDateText: new Date(values.quoteDate).toLocaleDateString("en-AU"),
        items,
        salesRep: values.salesRep || undefined,
        store: values.store || undefined,
        warehouse: values.warehouse || undefined,
        company: {
          name: values.companyName,
          abn: values.companyABN || undefined,
          // Preserve other company fields
          address: quote.company.address,
          email: quote.company.email,
          phone: quote.company.phone,
        },
        remarks: [
          {
            general: values.remarks || undefined,
            warrantyAndSpecial: values.warrantyRemarks || undefined,
            // Preserve other remarks fields
            feedbackLoop: quote.remarks?.[0]?.feedbackLoop,
            inStockNote: quote.remarks?.[0]?.inStockNote,
          },
        ],
      }

      await updateQuote(id, quoteData)
      setSuccess("Quote updated successfully")

      // Navigate back to quote details after a short delay
      setTimeout(() => {
        navigate(`/quotes/${id}`)
      }, 1500)
    } catch (error) {
      console.error("Failed to update quote:", error)
      setError("Failed to update quote. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const calculateTotals = () => {
    const { subTotal, gstTotal, total } = calculateQuoteTotals(items)

    return {
      subTotal,
      gstTotal,
      total,
    }
  }

  const formatCurrency = (amount: number, currency: string = form.watch("currency")) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency,
    }).format(amount)
  }

  const { subTotal, gstTotal, total } = calculateTotals()

  if (loading) {
    return (
      <div className="container mx-auto py-6 flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/quotes/${id}`)}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Edit Quote</h1>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 text-green-800 border-green-200">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs defaultValue="basic-info">
            <TabsList>
              <TabsTrigger value="basic-info">Basic Information</TabsTrigger>
              <TabsTrigger value="items">Quote Items</TabsTrigger>
              <TabsTrigger value="remarks">Remarks</TabsTrigger>
            </TabsList>

            <TabsContent value="basic-info" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="customer"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer Name*</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter customer name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="customerABN"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer ABN</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter ABN" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter phone number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter email address" type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Quote Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="quoteNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quote Number*</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>Quote identifier</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="quoteDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quote Date*</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="salesRep"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sales Representative</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter sales rep name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="store"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Store</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter store name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="warehouse"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Warehouse</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter warehouse name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency*</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                            <SelectItem value="USD">USD - US Dollar</SelectItem>
                            <SelectItem value="CNY">CNY - Chinese Yuan</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Company Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name*</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="companyABN"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company ABN</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="items" className="space-y-6 mt-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Quote Items
                  </CardTitle>
                  <Button type="button" onClick={addItem} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Item
                  </Button>
                </CardHeader>
                <CardContent>
                  {items.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                      <p>No items added yet</p>
                      <Button type="button" onClick={addItem} variant="outline" className="mt-4">
                        <Plus className="h-4 w-4 mr-1" />
                        Add First Item
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {items.map((item, index) => (
                        <div key={index} className="border rounded-md p-4">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="font-medium">Item #{index + 1}</h3>
                            <Button
                              type="button"
                              onClick={() => removeItem(index)}
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-1">Description*</label>
                              <Input
                                value={item.description}
                                onChange={(e) => updateItem(index, "description", e.target.value)}
                                placeholder="Enter item description"
                              />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <label className="block text-sm font-medium mb-1">Quantity*</label>
                                <Input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) => updateItem(index, "quantity", Number(e.target.value))}
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium mb-1">Unit*</label>
                                <Select value={item.unit} onValueChange={(value) => updateItem(index, "unit", value)}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select unit" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="unit">Unit</SelectItem>
                                    <SelectItem value="piece">Piece</SelectItem>
                                    <SelectItem value="package">Package</SelectItem>
                                    <SelectItem value="hour">Hour</SelectItem>
                                    <SelectItem value="day">Day</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <label className="block text-sm font-medium mb-1">Product Nature</label>
                                <Select
                                 value={item.productNature ?? "none"}
                                  onValueChange={(value) =>
                                     updateItem(index, "productNature", value === "none" ? undefined : value) }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select nature" />
                                  </SelectTrigger>
                                  <SelectContent>
                                     <SelectItem value="none">None</SelectItem>
                                    <SelectItem value="contract">Contract</SelectItem>
                                    <SelectItem value="warranty">Warranty</SelectItem>
                                    <SelectItem value="gift">Gift</SelectItem>
                                    <SelectItem value="selfPurchase">Self Purchase</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <label className="block text-sm font-medium mb-1">Unit Price*</label>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={item.unitPrice}
                                  onChange={(e) => updateItem(index, "unitPrice", Number(e.target.value))}
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium mb-1">Discount</label>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={item.discount || 0}
                                  onChange={(e) => updateItem(index, "discount", Number(e.target.value))}
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium mb-1">Total Price</label>
                                <Input
                                  type="text"
                                  value={formatCurrency(item.totalPrice)}
                                  disabled
                                  className="bg-gray-50"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-4">
                  <div>
                    <Button type="button" onClick={addItem} variant="outline">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Another Item
                    </Button>
                  </div>
                  <div className="text-right">
                    <div className="space-y-1">
                      <div className="text-sm">
                        Subtotal: <span className="font-medium">{formatCurrency(subTotal)}</span>
                      </div>
                      <div className="text-sm">
                        GST: <span className="font-medium">{formatCurrency(gstTotal)}</span>
                      </div>
                      <div className="text-base font-bold">
                        Total: <span className="text-green-600">{formatCurrency(total)}</span>
                      </div>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="remarks" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Remarks</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="remarks"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>General Remarks</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter any general remarks or notes about this quote"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="warrantyRemarks"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Warranty & Special Remarks</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter warranty information or special conditions"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/quotes/${id}`)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
