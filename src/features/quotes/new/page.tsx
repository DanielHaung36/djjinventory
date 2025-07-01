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
import { FileUploader } from "./file-uploader"
import { useToast } from "@/hooks/use-toast"
import { Plus, Trash2, User, Package, CreditCard, Loader2, Building2, Phone, Mail, MapPin, Search } from "lucide-react"

// Form validation schema
const formSchema = z.object({
  customer: z.object({
    id:      z.number().optional(),
    name:    z.string().min(1, "Customer name is required"),
    abn:     z.string().optional(),
    contact: z.string().min(1, "Contact person is required"),
    phone:   z.string().min(1, "Phone number is required"),
    email:   z.string().email("Invalid email address"),
    address: z.string().min(1, "Delivery address is required"),
  }),
  items: z.array(
    z.object({
      productId:        z.number().optional(),
      description:      z.string().min(1, "Description is required"),
      detailDescription:z.string().optional(),
      unit:             z.string().min(1, "Unit is required"),
      quantity:         z.number().min(1, "Quantity must be at least 1"),
      unitPrice:        z.number().min(0, "Unit price must be non-negative"),
      discount:         z.number().min(0, "Discount must be non-negative").default(0),
      goodsNature:      z.enum(["contract","warranty","gift","selfPurchase","pending"]),
    })
  ).min(1, "At least one item is required"),

  depositAmount:       z.number().min(0, "Deposit amount must be non-negative"),
  // 改成复数，并且只要 url
  depositAttachments:  z.array(z.object({ url: z.string().url() })).optional(),

  remarks:      z.string().optional(),
  warrantyNotes:z.string().optional(),
});
type FormData = z.infer<typeof formSchema>

// 模拟客户数据
const existingCustomers = [
  {
    id: 123,
    name: "ACME Pty Ltd",
    abn: "12 345 678 901",
    contact: "Alice Lee",
    phone: "0412 345 678",
    email: "alice@example.com",
    address: "8 Kimberley St, Wyndham WA 6740",
  },
  {
    id: 124,
    name: "Tech Solutions Inc",
    abn: "98 765 432 109",
    contact: "Bob Smith",
    phone: "0423 456 789",
    email: "bob@techsolutions.com",
    address: "15 Innovation Drive, Perth WA 6000",
  },
  {
    id: 125,
    name: "Mining Corp Australia",
    abn: "11 222 333 444",
    contact: "Carol Johnson",
    phone: "0434 567 890",
    email: "carol@miningcorp.com.au",
    address: "45 Industrial Road, Kalgoorlie WA 6430",
  },
  {
    id: 126,
    name: "Construction Plus",
    abn: "55 666 777 888",
    contact: "David Wilson",
    phone: "0445 678 901",
    email: "david@constructionplus.com.au",
    address: "78 Builder Street, Bunbury WA 6230",
  },
  {
    id: 127,
    name: "Heavy Machinery Co",
    abn: "99 111 222 333",
    contact: "Emma Brown",
    phone: "0456 789 012",
    email: "emma@heavymachinery.com.au",
    address: "23 Equipment Avenue, Geraldton WA 6530",
  },
]

// Mock products data
const availableProducts = [
  { id: 42, name: "LGMA Wheel Loader – LM930", price: 24990 },
  { id: 43, name: "Excavator CAT 320", price: 45000 },
  { id: 44, name: "Bulldozer D6T", price: 78000 },
  { id: 45, name: "Crane Liebherr LTM 1050", price: 125000 },
  { id: 46, name: "Dump Truck Volvo A40G", price: 89000 },
]

// 客户搜索组件
function CustomerSelector({
  value,
  onValueChange,
  disabled,
}: {
  value?: number
  onValueChange: (typeof existingCustomers)[0] | null
  disabled?: boolean
}) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  const filteredCustomers = useMemo(() => {
    if (!searchTerm) return existingCustomers
    return existingCustomers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.abn.includes(searchTerm),
    )
  }, [searchTerm])

  const selectedCustomer = existingCustomers.find((customer) => customer.id === value)

  // 当选择客户时更新搜索框显示
  useEffect(() => {
    if (selectedCustomer) {
      setSearchTerm(selectedCustomer.name)
    }
  }, [selectedCustomer])

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search customers by name, contact, or ABN..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          className="pl-10"
          disabled={disabled}
        />
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
                  <div className="font-medium">Create New Customer</div>
                  <div className="text-sm text-gray-500">Add a new customer to the system</div>
                </div>
              </Button>
            </div>
            <div className="border-t">
              {filteredCustomers.length === 0 ? (
                <div className="p-4 text-center text-gray-500">No customers found</div>
              ) : (
                filteredCustomers.map((customer) => (
                  <Button
                    key={customer.id}
                    type="button"
                    variant="ghost"
                    className="w-full justify-start text-left h-auto p-3 border-b last:border-b-0"
                    onClick={() => {
                      onValueChange(customer)
                      setSearchTerm(customer.name)
                      setIsOpen(false)
                    }}
                  >
                    <div className="w-full">
                      <div className="font-medium">{customer.name}</div>
                      <div className="text-sm text-gray-500">
                        {customer.contact} • {customer.abn}
                      </div>
                    </div>
                  </Button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {selectedCustomer && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="font-medium text-blue-900">{selectedCustomer.name}</div>
          <div className="text-sm text-blue-700">
            {selectedCustomer.contact} • {selectedCustomer.phone} • {selectedCustomer.email}
          </div>
        </div>
      )}
    </div>
  )
}

// 产品搜索组件
function ProductSelector({
  value,
  onValueChange,
  disabled,
}: {
  value?: number
  onValueChange: (typeof availableProducts)[0] | null
  disabled?: boolean
}) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return availableProducts
    return availableProducts.filter((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [searchTerm])

  const selectedProduct = availableProducts.find((product) => product.id === value)

  useEffect(() => {
    if (selectedProduct) {
      setSearchTerm(selectedProduct.name)
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
          placeholder="Search products or enter custom description..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          className="pl-10 h-9"
          disabled={disabled}
        />
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
              {filteredProducts.length === 0 ? (
                <div className="p-4 text-center text-gray-500">No products found</div>
              ) : (
                filteredProducts.map((product) => (
                  <Button
                    key={product.id}
                    type="button"
                    variant="ghost"
                    className="w-full justify-start text-left h-auto p-3 border-b last:border-b-0"
                    onClick={() => {
                      onValueChange(product)
                      setSearchTerm(product.name)
                      setIsOpen(false)
                    }}
                  >
                    <div className="w-full">
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-gray-500">{formatCurrency(product.price)}</div>
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
          <div className="font-medium text-green-900">{selectedProduct.name}</div>
          <div className="text-sm text-green-700">{formatCurrency(selectedProduct.price)}</div>
        </div>
      )}
    </div>
  )
}

export default function QuoteSubmissionForm() {
  const { toast } = useToast()
  const [submitting, setSubmitting] = useState(false)
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | undefined>()
  const [selectedProductIds, setSelectedProductIds] = useState<{ [key: number]: number | undefined }>({})

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customer: {
        name: "",
        abn: "",
        contact: "",
        phone: "",
        email: "",
        address: "",
      },
      items: [
        {
          description: "",
          detailDescription: "",
          unit: "ea",
          quantity: 1,
          unitPrice: 0,
          discount: 0,
          goodsNature: "contract",
        },
      ],
      depositAmount: 0,
      depositAttachment: [],
      remarks: "",
      warrantyNotes: "",
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  })

  const handleCustomerSelect = (customer: (typeof existingCustomers)[0] | null) => {
    if (customer) {
      setSelectedCustomerId(customer.id)
      form.setValue("customer", customer)
      // 清除验证错误
      form.clearErrors("customer")
    } else {
      setSelectedCustomerId(undefined)
      form.setValue("customer", {
        name: "",
        abn: "",
        contact: "",
        phone: "",
        email: "",
        address: "",
      })
    }
  }

  const handleProductSelect = (index: number, product: (typeof availableProducts)[0] | null) => {
    if (product) {
      form.setValue(`items.${index}.productId`, product.id)
      form.setValue(`items.${index}.description`, product.name)
      form.setValue(`items.${index}.unitPrice`, product.price)
      setSelectedProductIds((prev) => ({ ...prev, [index]: product.id }))
      form.clearErrors(`items.${index}.description`)
    } else {
      form.setValue(`items.${index}.productId`, undefined)
      form.setValue(`items.${index}.description`, "")
      form.setValue(`items.${index}.unitPrice`, 0)
      setSelectedProductIds((prev) => ({ ...prev, [index]: undefined }))
    }
  }

  const calculateItemTotal = (index: number) => {
    const item = form.watch(`items.${index}`)
    return item.quantity * item.unitPrice - (item.discount || 0)
  }

  const calculateGrandTotal = () => {
    const items = form.watch("items")
    return items.reduce((total, item) => {
      return total + item.quantity * item.unitPrice - (item.discount || 0)
    }, 0)
  }

  const onSubmit = async (data: FormData) => {
    setSubmitting(true)
    console.log(data);
    
    try {
      // 构建API数据
      const apiData = {
        customer: data.customer,
        items: data.items,
        depositAmount: data.depositAmount,
        depositAttachment: data.depositAttachment?.[0] ? "https://example.com/upload/xyz.pdf" : undefined,
        status: "pending",
        remarks: data.remarks,
        warrantyNotes: data.warrantyNotes,
      }

      console.log("Submitting quote data:", apiData)

      // 模拟API调用
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Quote Submitted Successfully",
        description: "Your quote has been submitted and is pending approval.",
      })

      // 重置表单
      form.reset()
      setSelectedCustomerId(undefined)
    } catch (error) {
      console.error("Failed to submit quote:", error)
      toast({
        title: "Submission Failed",
        description: "Failed to submit quote. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(amount)
  }

  const isExistingCustomer = selectedCustomerId !== undefined

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Submit Quote</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* 客户信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Select Customer</label>
                <CustomerSelector value={selectedCustomerId} onValueChange={handleCustomerSelect} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <FormField
                  control={form.control}
                  name="customer.name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 h-5">
                        <Building2 className="h-4 w-4" />
                        Company Name *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter company name"
                          {...field}
                          disabled={isExistingCustomer}
                          className="h-10"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customer.abn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="h-5 flex items-center">ABN</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter ABN" {...field} disabled={isExistingCustomer} className="h-10" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <FormField
                  control={form.control}
                  name="customer.contact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 h-5">
                        <User className="h-4 w-4" />
                        Contact Person *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter contact person"
                          {...field}
                          disabled={isExistingCustomer}
                          className="h-10"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customer.phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 h-5">
                        <Phone className="h-4 w-4" />
                        Phone *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter phone number"
                          {...field}
                          disabled={isExistingCustomer}
                          className="h-10"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="customer.email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email *
                    </FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter email address" {...field} disabled={isExistingCustomer} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customer.address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Delivery Address *
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter delivery address"
                        {...field}
                        disabled={isExistingCustomer}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* 商品列表 - 紧凑卡片样式 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Quote Items
              </CardTitle>
              <Button
                type="button"
                onClick={() =>
                  append({
                    description: "",
                    detailDescription: "",
                    unit: "ea",
                    quantity: 1,
                    unitPrice: 0,
                    discount: 0,
                    goodsNature: "contract",
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
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="border rounded-lg p-4 bg-gray-50">
                    {/* 项目标题行 - 修复布局 */}
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-medium text-gray-900">Item #{index + 1}</h3>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-sm font-medium text-green-600 whitespace-nowrap">
                          {formatCurrency(calculateItemTotal(index))}
                        </span>
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            onClick={() => remove(index)}
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* 第一行：产品选择和商品性质 - 修复垂直对齐 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3 items-end">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Product Selection</label>
                        <ProductSelector
                          value={form.watch(`items.${index}.productId`)}
                          onValueChange={(product) => handleProductSelect(index, product)}
                        />
                      </div>

                      <div>
                        <FormField
                          control={form.control}
                          name={`items.${index}.goodsNature`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Goods Nature *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-9">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="contract">Contract</SelectItem>
                                  <SelectItem value="warranty">Warranty</SelectItem>
                                  <SelectItem value="gift">Gift</SelectItem>
                                  <SelectItem value="selfPurchase">Self Purchase</SelectItem>
                                  <SelectItem value="pending">Pending</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* 第二行：描述 */}
                    <div className="mb-3">
                      <FormField
                        control={form.control}
                        name={`items.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Description *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter item description" {...field} className="h-9" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* 第三行：数量、单位、单价、折扣 */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <FormField
                        control={form.control}
                        name={`items.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Qty *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                {...field}
                                onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 1)}
                                className="h-9"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`items.${index}.unit`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Unit *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-9">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="ea">Each</SelectItem>
                                <SelectItem value="pc">Piece</SelectItem>
                                <SelectItem value="set">Set</SelectItem>
                                <SelectItem value="kg">Kilogram</SelectItem>
                                <SelectItem value="m">Meter</SelectItem>
                              </SelectContent>
                            </Select>
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
                                onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                                className="h-9"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`items.${index}.discount`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Discount</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                {...field}
                                onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                                className="h-9"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* 表格预览 */}
              {fields.length > 0 && (
                <div className="mt-6 pt-4 border-t">
                  <h4 className="font-medium text-gray-900 mb-3">Quote Preview</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse border border-gray-200">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-200 px-3 py-2 text-left font-medium">#</th>
                          <th className="border border-gray-200 px-3 py-2 text-left font-medium">Description</th>
                          <th className="border border-gray-200 px-3 py-2 text-left font-medium">Qty</th>
                          <th className="border border-gray-200 px-3 py-2 text-left font-medium">Unit</th>
                          <th className="border border-gray-200 px-3 py-2 text-left font-medium">Unit Price</th>
                          <th className="border border-gray-200 px-3 py-2 text-left font-medium">Discount</th>
                          <th className="border border-gray-200 px-3 py-2 text-left font-medium">Nature</th>
                          <th className="border border-gray-200 px-3 py-2 text-left font-medium">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fields.map((field, index) => {
                          const item = form.watch(`items.${index}`)
                          return (
                            <tr key={field.id} className="hover:bg-gray-50">
                              <td className="border border-gray-200 px-3 py-2 text-center">{index + 1}</td>
                              <td className="border border-gray-200 px-3 py-2">
                                {item.description || <span className="text-gray-400 italic">No description</span>}
                              </td>
                              <td className="border border-gray-200 px-3 py-2 text-center">{item.quantity}</td>
                              <td className="border border-gray-200 px-3 py-2 text-center capitalize">{item.unit}</td>
                              <td className="border border-gray-200 px-3 py-2 text-right">
                                {formatCurrency(item.unitPrice)}
                              </td>
                              <td className="border border-gray-200 px-3 py-2 text-right">
                                {item.discount > 0 ? formatCurrency(item.discount) : "-"}
                              </td>
                              <td className="border border-gray-200 px-3 py-2 text-center capitalize">
                                {item.goodsNature}
                              </td>
                              <td className="border border-gray-200 px-3 py-2 text-right font-medium">
                                {formatCurrency(calculateItemTotal(index))}
                              </td>
                            </tr>
                          )
                        })}
                        <tr className="bg-green-50 font-medium">
                          <td colSpan={7} className="border border-gray-200 px-3 py-2 text-right">
                            Grand Total:
                          </td>
                          <td className="border border-gray-200 px-3 py-2 text-right text-green-600 font-bold">
                            {formatCurrency(calculateGrandTotal())}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 底部操作栏 */}
              <div className="flex justify-between items-center pt-4 border-t mt-4">
                <Button
                  type="button"
                  onClick={() =>
                    append({
                      description: "",
                      detailDescription: "",
                      unit: "ea",
                      quantity: 1,
                      unitPrice: 0,
                      discount: 0,
                      goodsNature: "contract",
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

          {/* 定金信息 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 定金信息 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Deposit Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="depositAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deposit Amount *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="Enter deposit amount"
                          {...field}
                          onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="depositAttachment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Proof</FormLabel>
                      <FormControl>
                        <FileUploader
                          value={field.value}
                          onChange={field.onChange}
                          maxFiles={3}
                          accept={{
                            "image/*": [".png", ".jpg", ".jpeg"],
                            "application/pdf": [".pdf"],
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* 备注信息 */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="remarks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>General Remarks</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter any general remarks" rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="warrantyNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Warranty Notes</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter warranty information" rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* 提交按钮 */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline">
              Save as Draft
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Quote"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
