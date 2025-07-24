"use client"

import React, { useState, useEffect, useMemo } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useGetQuoteByIdQuery, useUpdateQuoteMutation } from '../../quotesApi'
import { useGetProductsQuery } from '@/features/products/productsApi'
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
import { Search } from "lucide-react"

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

// 产品选择组件
function ProductSelector({
  value,
  onValueChange,
  disabled,
  products = [],
  loading = false,
}: {
  value?: number
  onValueChange: (product: any | null) => void
  disabled?: boolean
  products?: any[]
  loading?: boolean
}) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  const filteredProducts = React.useMemo(() => {
    if (!searchTerm) return products
    return products.filter((product) => 
      product.name_cn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.name_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.djj_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [searchTerm, products])

  const selectedProduct = products.find((product) => product.id === value)

  React.useEffect(() => {
    if (selectedProduct) {
      setSearchTerm(selectedProduct.name_cn || selectedProduct.name_en || selectedProduct.djj_code || '')
    } else {
      setSearchTerm("")
    }
  }, [selectedProduct])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(amount)
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder={loading ? "Loading products..." : "Search products or enter custom description..."}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          className="pl-10 h-9"
          disabled={disabled || loading}
          title={selectedProduct ? `Selected: ${selectedProduct.name_cn || selectedProduct.name_en} (${selectedProduct.djj_code})` : ''}
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
        )}
      </div>

      {isOpen && (
        <div className="relative">
          <div className="absolute top-0 left-0 right-0 z-50 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
            <div className="p-2">
              <Button
                type="button"
                variant="ghost"
                className="w-full justify-start text-left h-auto p-2"
                onClick={() => {
                  onValueChange(null)
                  setSearchTerm("")
                  setIsOpen(false)
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                <div>
                  <div className="font-medium">Custom Description</div>
                  <div className="text-sm text-gray-500">Enter your own product description</div>
                </div>
              </Button>
            </div>
            <div className="border-t">
              {loading ? (
                <div className="p-4 text-center text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                  Loading products...
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="p-4 text-center text-gray-500">No products found</div>
              ) : (
                filteredProducts.map((product) => (
                  <Button
                    key={product.id}
                    type="button"
                    variant="ghost"
                    className="w-full justify-start text-left h-auto p-3 border-b last:border-b-0 hover:bg-gray-50"
                    onClick={() => {
                      onValueChange(product)
                      setSearchTerm(product.name_cn || product.name_en || product.djj_code || '')
                      setIsOpen(false)
                    }}
                  >
                    <div className="w-full space-y-1">
                      <div className="font-medium text-gray-900">
                        {product.name_cn || product.name_en || product.name || product.djj_code || 'Unnamed Product'}
                      </div>
                      <div className="text-sm text-gray-600 space-y-0.5">
                        {product.djj_code && (
                          <div>Code: <span className="font-mono">{product.djj_code}</span></div>
                        )}
                        {product.manufacturer && (
                          <div>Manufacturer: {product.manufacturer}</div>
                        )}
                        <div className="flex justify-between items-center">
                          {product.category && (
                            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                              {product.category}
                            </span>
                          )}
                          {product.price && (
                            <span className="font-medium text-green-600">
                              {formatCurrency(product.price)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {selectedProduct && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="font-medium text-green-900 text-base">
            {selectedProduct.name_cn || selectedProduct.name_en || selectedProduct.name || 'Product Name Not Available'}
          </div>
          <div className="text-sm text-green-700 mt-1 space-y-1">
            {selectedProduct.djj_code && (
              <div><span className="font-medium">Code:</span> {selectedProduct.djj_code}</div>
            )}
            {selectedProduct.manufacturer && (
              <div><span className="font-medium">Manufacturer:</span> {selectedProduct.manufacturer}</div>
            )}
            {selectedProduct.price && (
              <div><span className="font-medium">Price:</span> {formatCurrency(selectedProduct.price)}</div>
            )}
            {selectedProduct.category && (
              <div><span className="font-medium">Category:</span> {selectedProduct.category}</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function EditQuotePage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [items, setItems] = useState<QuoteItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // 使用RTK Query获取quote数据
  const { data: quote, isLoading: loading, error: queryError } = useGetQuoteByIdQuery(id ?? '', {
    skip: !id,
  })
  
  // 使用RTK Query更新quote
  const [updateQuoteMutation, { isLoading: submitting }] = useUpdateQuoteMutation()
  
  // 获取产品数据
  const { data: productsResponse, isLoading: productsLoading } = useGetProductsQuery({
    offset: 0,
    limit: 1000,
  })
  const products = productsResponse?.products || []

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
    if (quote) {
      setItems(quote.items || [])

      // Format date for input field
      const formattedDate = quote.quoteDate
        ? new Date(quote.quoteDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0]

      // Set form values
      form.reset({
        quoteNumber: quote.quoteNumber,
        customer: quote.customer?.name || "",
        customerABN: quote.customerABN || "",
        phone: quote.phone || "",
        email: quote.email || "",
        quoteDate: formattedDate,
        salesRep: quote.salesRepUser?.username || "",
        store: quote.store?.name || "",
        warehouse: "",
        currency: quote.amounts?.currency || "AUD",
        companyName: quote.company?.name || "",
        companyABN: quote.company?.abn || "",
        remarks: quote.remarks?.[0]?.general || "",
        warrantyRemarks: quote.remarks?.[0]?.warrantyAndSpecial || "",
      })
    }
  }, [quote, form])
  
  useEffect(() => {
    if (queryError) {
      setError("Failed to load quote data")
    }
  }, [queryError])

  const addItem = () => {
    setItems([
      ...items,
      {
        productId: undefined,
        description: "",
        quantity: 1,
        unit: "unit",
        unitPrice: 0,
        totalPrice: 0,
        discount: 0,
        goodsNature: "contract",
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

  const handleProductSelect = (index: number, product: any | null) => {
    const updatedItems = [...items]
    
    if (product) {
      updatedItems[index] = {
        ...updatedItems[index],
        productId: product.id,
        description: product.name_cn || product.name_en || product.djj_code || '',
        unitPrice: product.price || updatedItems[index].unitPrice,
      }
      
      // Recalculate total price
      const quantity = updatedItems[index].quantity
      const unitPrice = product.price || updatedItems[index].unitPrice
      const discount = updatedItems[index].discount || 0
      updatedItems[index].totalPrice = quantity * unitPrice - discount
    } else {
      // Custom description - clear productId
      updatedItems[index] = {
        ...updatedItems[index],
        productId: undefined,
      }
    }
    
    setItems(updatedItems)
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (items.length === 0) {
      setError("Please add at least one item to the quote")
      return
    }

    if (!quote) {
      setError("Quote data not available")
      return
    }

    try {
      setError(null)

      const updateData = {
        customer: {
          id: quote.customer?.id,
          name: values.customer,
          abn: values.customerABN || "",
          contact: values.customer,
          phone: values.phone || "",
          email: values.email || "",
          storeId: quote.store?.id || 1,
          deliveryAddress: quote.deliveryAddress || {
            line1: "",
            line2: "",
            city: "",
            state: "",
            postcode: "",
            country: "",
          },
          billingAddress: quote.billingAddress || {
            line1: "",
            line2: "",
            city: "",
            state: "",
            postcode: "",
            country: "",
          },
          sameAsDelivery: true,
        },
        items: items.map(item => ({
          productId: item.productId,
          description: item.description,
          detailDescription: item.detailDescription || "",
          unit: item.unit,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount || 0,
          goodsNature: item.goodsNature || "contract",
        })),
        depositAmount: 0,
        remarks: values.remarks || "",
        warrantyNotes: values.warrantyRemarks || "",
      }

      await updateQuoteMutation({ id: id!, data: updateData }).unwrap()
      setSuccess("Quote updated successfully")

      // Navigate back to quote details after a short delay
      setTimeout(() => {
        navigate(`/quotes/${id}`)
      }, 1500)
    } catch (error) {
      console.error("Failed to update quote:", error)
      setError("Failed to update quote. Please try again.")
    }
  }

  const calculateTotals = () => {
    const subTotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice - (item.discount || 0)), 0)
    const gstTotal = subTotal * 0.1
    const total = subTotal + gstTotal

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
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-1">Product Selection</label>
                                <ProductSelector
                                  value={item.productId}
                                  onValueChange={(product) => handleProductSelect(index, product)}
                                  products={products}
                                  loading={productsLoading}
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium mb-1">Product Nature</label>
                                <Select
                                  value={item.goodsNature ?? "contract"}
                                  onValueChange={(value) =>
                                    updateItem(index, "goodsNature", value)
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select nature" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="contract">Contract</SelectItem>
                                    <SelectItem value="warranty">Warranty</SelectItem>
                                    <SelectItem value="gift">Gift</SelectItem>
                                    <SelectItem value="selfPurchase">Self Purchase</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            
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
