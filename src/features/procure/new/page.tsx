"use client"

import { useState, useMemo, useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useGetProductsQuery } from "../../products/productsApi"
import { useSelector } from "react-redux"
import type { RootState } from "../../app/store"
import { Plus, Trash2, Package, Building2, Calendar, Loader2, Search, ShoppingCart, CreditCard } from "lucide-react"
import { useNavigate } from "react-router-dom"

// Form validation schema based on procurement requirements
const formSchema = z.object({
  supplier: z.object({
    id: z.number().optional(),
    code: z.string().min(1, "Supplier code is required"),
    name: z.string().min(1, "Supplier name is required"),
    contact: z.string().min(1, "Contact person is required"),
    phone: z.string().min(1, "Phone number is required"),
    email: z.string().email("Invalid email address"),
  }),
  items: z.array(
    z.object({
      productId: z.number().optional(),
      djjCode: z.string().min(1, "DJJ Code is required"),
      description: z.string().min(1, "Description is required"),
      category: z.string().min(1, "Category is required"),
      quantity: z.number().min(1, "Quantity must be at least 1"),
      unitPrice: z.number().min(0, "Unit price must be non-negative"),
      vinNumber: z.string().optional(),
      engineNumber: z.string().optional(),
      machineSerial: z.string().optional(),
      supplierPartNo: z.string().optional(),
      specifications: z.string().optional(),
      notes: z.string().optional(),
      warrantyMonths: z.number().min(0, "Warranty months must be non-negative").default(0),
    })
  ).min(1, "At least one item is required"),
  warehouseId: z.number().min(1, "Please select a warehouse"),
  orderDate: z.string().min(1, "Order date is required"),
  expectedDelivery: z.string().optional(),
  finalPaymentDue: z.string().optional(),
  depositAmount: z.number().min(0, "Deposit amount must be non-negative").default(0),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>

// Supplier selector component (adapted from CustomerSelector)
function SupplierSelector({
  value,
  onValueChange,
  disabled,
  suppliers = [],
  loading = false,
}: {
  value?: { code: string; name: string; contact_person: string; phone: string; email: string }
  onValueChange: (supplier: any | null) => void
  disabled?: boolean
  suppliers?: any[]
  loading?: boolean
}) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  const filteredSuppliers = useMemo(() => {
    if (!searchTerm) return suppliers
    return suppliers.filter(
      (supplier) =>
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (supplier.contact_person && supplier.contact_person.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  }, [searchTerm, suppliers])

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search suppliers by name, code, or contact..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          className="pl-10"
          disabled={disabled || loading}
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
        )}
      </div>

      {isOpen && (
        <div className="relative">
          <div className="absolute top-0 left-0 right-0 z-50 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                Loading suppliers...
              </div>
            ) : filteredSuppliers.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No suppliers found</div>
            ) : (
              filteredSuppliers.map((supplier) => (
                <Button
                  key={supplier.id}
                  type="button"
                  variant="ghost"
                  className="w-full justify-start text-left h-auto p-3 border-b last:border-b-0"
                  onClick={() => {
                    onValueChange(supplier)
                    setSearchTerm(supplier.name)
                    setIsOpen(false)
                  }}
                >
                  <div className="w-full">
                    <div className="font-medium">{supplier.name}</div>
                    <div className="text-sm text-gray-500">
                      {supplier.code} • {supplier.contact_person}
                    </div>
                  </div>
                </Button>
              ))
            )}
          </div>
        </div>
      )}

      {value && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="font-medium text-blue-900">{value.name}</div>
          <div className="text-sm text-blue-700">
            {value.code} • {value.contact_person} • {value.phone}
          </div>
        </div>
      )}
    </div>
  )
}

// Product selector component (adapted from Quote page)
function ProcurementProductSelector({
  value,
  onValueChange,
  disabled,
  products = [],
  loading = false,
  onProductSelect,
}: {
  value?: number
  onValueChange: (product: any | null) => void
  disabled?: boolean
  products?: any[]
  loading?: boolean
  onProductSelect?: (product: any) => void
}) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products
    return products.filter((product) => 
      product.name_cn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.name_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.djj_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [searchTerm, products])

  const selectedProduct = products.find((product) => product.id === value)

  useEffect(() => {
    if (selectedProduct) {
      setSearchTerm(selectedProduct.djj_code || selectedProduct.name_cn || selectedProduct.name_en || '')
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
          placeholder={loading ? "Loading products..." : "Search by DJJ Code, product name, or manufacturer..."}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          className="pl-10 h-9"
          disabled={disabled || loading}
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
        )}
      </div>

      {isOpen && (
        <div className="relative">
          <div className="absolute top-0 left-0 right-0 z-50 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
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
                    onProductSelect?.(product)
                    setSearchTerm(product.djj_code || product.name_cn || product.name_en || '')
                    setIsOpen(false)
                  }}
                >
                  <div className="w-full space-y-1">
                    <div className="font-medium text-gray-900">
                      {product.djj_code} - {product.name_cn || product.name_en || 'Unnamed Product'}
                    </div>
                    <div className="text-sm text-gray-600 space-y-0.5">
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
      )}

      {selectedProduct && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="font-medium text-green-900 text-base">
            {selectedProduct.djj_code} - {selectedProduct.name_cn || selectedProduct.name_en || 'Product Name Not Available'}
          </div>
          <div className="text-sm text-green-700 mt-1 space-y-1">
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

export default function NewProcurementForm() {
  const { toast } = useToast()
  const navigate = useNavigate()
  
  // Mock data for suppliers and warehouses (in real app, these would come from APIs)
  const mockSuppliers = [
    { id: 1, code: "LM930", name: "Hangzhou Hengyi Technology", contact_person: "Zhang Wei", phone: "+86 138 0013 8000", email: "zhang@hengyi.com" },
    { id: 2, code: "LM932", name: "Suzhou Industrial Solutions", contact_person: "Li Ming", phone: "+86 150 5000 1500", email: "li@suzhou-ind.com" },
    { id: 3, code: "LM940", name: "Beijing Manufacturing Co", contact_person: "Wang Lei", phone: "+86 132 0132 0132", email: "wang@bj-mfg.com" },
  ]

  const mockWarehouses = [
    { id: 1, name: "Sydney Warehouse A", code: "SYD-A" },
    { id: 2, name: "Sydney Warehouse B", code: "SYD-B" },
    { id: 3, name: "Melbourne Warehouse", code: "MEL-A" },
  ]

  // RTK Query hooks
  const { data: productsResponse, isLoading: productsLoading } = useGetProductsQuery({
    offset: 0,
    limit: 1000,
  })
  const products = productsResponse?.products || []
  
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | undefined>()
  const [selectedProductIds, setSelectedProductIds] = useState<{ [key: number]: number | undefined }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      supplier: {
        code: "",
        name: "",
        contact: "",
        phone: "",
        email: "",
      },
      items: [
        {
          djjCode: "",
          description: "",
          category: "",
          quantity: 1,
          unitPrice: 0,
          vinNumber: "",
          engineNumber: "",
          machineSerial: "",
          supplierPartNo: "",
          specifications: "",
          notes: "",
          warrantyMonths: 0,
        },
      ],
      warehouseId: 1,
      orderDate: new Date().toISOString().split('T')[0],
      expectedDelivery: "",
      finalPaymentDue: "",
      depositAmount: 0,
      notes: "",
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  })

  const handleSupplierSelect = (supplier: any | null) => {
    if (supplier) {
      setSelectedSupplierId(supplier.id)
      form.setValue("supplier", {
        id: supplier.id,
        code: supplier.code,
        name: supplier.name,
        contact: supplier.contact_person || "",
        phone: supplier.phone || "",
        email: supplier.email || "",
      })
      form.clearErrors("supplier")
    } else {
      setSelectedSupplierId(undefined)
      form.setValue("supplier", {
        code: "",
        name: "",
        contact: "",
        phone: "",
        email: "",
      })
    }
  }

  const handleProductSelect = (index: number, product: any | null) => {
    if (product) {
      form.setValue(`items.${index}.productId`, product.id)
      form.setValue(`items.${index}.djjCode`, product.djj_code || "")
      form.setValue(`items.${index}.description`, product.name_cn || product.name_en || "")
      form.setValue(`items.${index}.category`, product.category || "")
      form.setValue(`items.${index}.unitPrice`, product.price || 0)
      setSelectedProductIds((prev) => ({ ...prev, [index]: product.id }))
      form.clearErrors(`items.${index}`)
    } else {
      form.setValue(`items.${index}.productId`, undefined)
      form.setValue(`items.${index}.djjCode`, "")
      form.setValue(`items.${index}.description`, "")
      form.setValue(`items.${index}.category`, "")
      form.setValue(`items.${index}.unitPrice`, 0)
      setSelectedProductIds((prev) => ({ ...prev, [index]: undefined }))
    }
  }

  const calculateItemTotal = (index: number) => {
    const item = form.watch(`items.${index}`)
    return item.quantity * item.unitPrice
  }

  const calculateGrandTotal = () => {
    const items = form.watch("items")
    return items.reduce((total, item) => {
      return total + item.quantity * item.unitPrice
    }, 0)
  }

  const onSubmit = async (data: FormData) => {
    console.log("Procurement order data:", data)
    
    setIsSubmitting(true)
    try {
      // Simulate API call to create procurement order
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Construct the API data matching backend expectations
      const apiData = {
        supplier_id: data.supplier.id || 1,
        supplier_contact: data.supplier.contact,
        supplier_phone: data.supplier.phone,
        warehouse_id: data.warehouseId,
        order_date: data.orderDate,
        expected_delivery: data.expectedDelivery || undefined,
        final_payment_due: data.finalPaymentDue || undefined,
        deposit_amount: data.depositAmount,
        notes: data.notes || "",
        items: data.items.map(item => ({
          product_id: item.productId || 1,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          tax_rate: 0.1, // Default 10% tax
          vin_number: item.vinNumber || "",
          engine_number: item.engineNumber || "",
          machine_serial: item.machineSerial || "",
          supplier_part_no: item.supplierPartNo || "",
          specifications: item.specifications || "",
          notes: item.notes || "",
          warranty_months: item.warrantyMonths,
        })),
        created_by: 1, // Current user ID
      }

      console.log("API Data:", apiData)

      toast({
        title: "Procurement Order Created",
        description: "Your procurement order has been submitted successfully.",
      })

      // Reset form and navigate
      form.reset()
      setSelectedSupplierId(undefined)
      setSelectedProductIds({})
      navigate("/procure")
    } catch (error) {
      console.error("Failed to create procurement order:", error)
      toast({
        title: "Submission Failed",
        description: "Failed to create procurement order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(amount)
  }

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Create Procurement Order</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Supplier Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Supplier Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Select Supplier</label>
                <SupplierSelector 
                  value={selectedSupplierId ? mockSuppliers.find(s => s.id === selectedSupplierId) : undefined}
                  onValueChange={handleSupplierSelect}
                  suppliers={mockSuppliers}
                  loading={false}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="supplier.code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier Code *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter supplier code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="supplier.name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter supplier name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="supplier.contact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Person *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter contact person" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="supplier.phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="supplier.email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Enter email address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="warehouseId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Warehouse *</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select warehouse" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {mockWarehouses.map((warehouse) => (
                            <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                              {warehouse.name} ({warehouse.code})
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
                  name="orderDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="expectedDelivery"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected Delivery</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="finalPaymentDue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Final Payment Due</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Procurement Items */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Procurement Items
              </CardTitle>
              <Button
                type="button"
                onClick={() =>
                  append({
                    djjCode: "",
                    description: "",
                    category: "",
                    quantity: 1,
                    unitPrice: 0,
                    vinNumber: "",
                    engineNumber: "",
                    machineSerial: "",
                    supplierPartNo: "",
                    specifications: "",
                    notes: "",
                    warrantyMonths: 0,
                  })
                }
                variant="outline"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-medium text-gray-900">Item #{index + 1}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-green-600">
                          {formatCurrency(calculateItemTotal(index))}
                        </span>
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            onClick={() => remove(index)}
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Product Selection */}
                    <div className="mb-3">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Product Selection</label>
                      <ProcurementProductSelector
                        value={form.watch(`items.${index}.productId`)}
                        onValueChange={(product) => handleProductSelect(index, product)}
                        products={products}
                        loading={productsLoading}
                        onProductSelect={(product) => handleProductSelect(index, product)}
                      />
                    </div>

                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      <FormField
                        control={form.control}
                        name={`items.${index}.djjCode`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">DJJ Code *</FormLabel>
                            <FormControl>
                              <Input placeholder="DJJ00001" {...field} className="h-9" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`items.${index}.category`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Category *</FormLabel>
                            <FormControl>
                              <Input placeholder="Machine/Parts/Attachment" {...field} className="h-9" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name={`items.${index}.description`}
                      render={({ field }) => (
                        <FormItem className="mb-3">
                          <FormLabel className="text-xs">Description *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter item description" {...field} className="h-9" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* VIN and Machine Details - Show for machine category */}
                    {form.watch(`items.${index}.category`)?.toLowerCase() === 'machine' && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                        <FormField
                          control={form.control}
                          name={`items.${index}.vinNumber`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">VIN Number</FormLabel>
                              <FormControl>
                                <Input placeholder="Vehicle Identification Number" {...field} className="h-9" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`items.${index}.engineNumber`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Engine Number</FormLabel>
                              <FormControl>
                                <Input placeholder="Engine number" {...field} className="h-9" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`items.${index}.machineSerial`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Machine Serial</FormLabel>
                              <FormControl>
                                <Input placeholder="Machine serial number" {...field} className="h-9" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {/* Quantity, Price, Warranty */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                      <FormField
                        control={form.control}
                        name={`items.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Quantity *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                className="h-9"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`items.${index}.unitPrice`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Unit Price *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                className="h-9"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`items.${index}.warrantyMonths`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Warranty (Months)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                className="h-9"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`items.${index}.supplierPartNo`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Supplier Part No</FormLabel>
                            <FormControl>
                              <Input placeholder="Supplier part number" {...field} className="h-9" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Additional Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name={`items.${index}.specifications`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Specifications</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Technical specifications" {...field} rows={2} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`items.${index}.notes`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Notes</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Additional notes" {...field} rows={2} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Summary */}
              <div className="flex justify-between items-center pt-4 border-t mt-4">
                <Button
                  type="button"
                  onClick={() =>
                    append({
                      djjCode: "",
                      description: "",
                      category: "",
                      quantity: 1,
                      unitPrice: 0,
                      vinNumber: "",
                      engineNumber: "",
                      machineSerial: "",
                      supplierPartNo: "",
                      specifications: "",
                      notes: "",
                      warrantyMonths: 0,
                    })
                  }
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Another Item
                </Button>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">
                    Grand Total: {formatCurrency(calculateGrandTotal())}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment & Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="depositAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deposit Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="Enter deposit amount"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Additional Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order Notes</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter any additional notes" rows={4} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate("/procure")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Order...
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Create Procurement Order
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}