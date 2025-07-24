"use client"

import { useState, useMemo, useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { FileUploader } from "./file-uploader"
import { useToast } from "@/hooks/use-toast"
import { useCreateQuoteMutation, useGetQuoteByIdQuery, useCopyQuoteMutation } from "../quotesApi"
import { useGetCustomersQuery, useCreateCustomerMutation } from "../../customer/customerApi"
import type { Customer } from "../../customer/types"
import { useGetStoresQuery } from "../../store/storeapi"
import { useGetProductsQuery } from "../../products/productsApi"
import { useUploadFilesMutation } from "../../products/uploadProductApi"
import { useSelector } from "react-redux"
import type { RootState } from "../../app/store"
import { Plus, Trash2, User, Package, CreditCard, Loader2, Building2, Phone, Mail, MapPin, Search, X, Copy } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useNavigate } from "react-router-dom"

// Form validation schema
const formSchema = z.object({
  customer: z.object({
    id:      z.number().optional(),
    name:    z.string().min(1, "Customer name is required"),
    abn:     z.string().optional(),
    contact: z.string().min(1, "Contact person is required"),
    phone:   z.string().min(1, "Phone number is required"),
    email:   z.string().email("Invalid email address"),
    billingAddress: z.object({
      line1:   z.string().optional(),
      line2:   z.string().optional(),
      city:    z.string().optional(),
      state:   z.string().optional(),
      postcode:z.string().optional(),
      country: z.string().optional(),
    }),
    deliveryAddress: z.object({
      line1: z.string().min(1, "Delivery address is required"),
      line2:   z.string().optional(),
      city:    z.string().optional(),
      state:   z.string().optional(),
      postcode:z.string().optional(),
      country: z.string().optional(),
    }),
    sameAsDelivery: z.boolean().default(false),
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
  // 文件上传字段，暂时设为可选的任意数组
  depositAttachments:  z.any().optional(),

  remarks:      z.string().optional(),
  warrantyNotes:z.string().optional(),
});

type FormData = z.infer<typeof formSchema>

// Customer创建表单schema
const customerFormSchema = z.object({
  name: z.string().min(1, "Company name is required"),
  abn: z.string().optional(),
  contact: z.string().min(1, "Contact person is required"), 
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email("Invalid email address"),
 sameAsDelivery: z.boolean().default(false),
 deliveryAddress: z.object({
    line1:    z.string().min(1),
    line2:    z.string().optional(),
    city:     z.string().min(1),
    state:    z.string().min(1),
    postcode: z.string().min(1),
    country:  z.string().min(1),
  }),
  billingAddress: z.object({
    line1:    z.string().min(1),
    line2:    z.string().optional(),
    city:     z.string().min(1),
    state:    z.string().min(1),
    postcode: z.string().min(1),
    country:  z.string().min(1),
  }),
  type: z.enum(["retail", "wholesale", "corporate"]).default("retail"),
  store_id: z.number().min(1, "Please select a store"),
})

type CustomerFormData = z.infer<typeof customerFormSchema>

 

// Customer创建对话框组件
function CustomerCreateDialog({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean
  onClose: () => void
  onSuccess: (customer: Customer) => void
}) {
  const { toast } = useToast()
  const [createCustomer, { isLoading: creating }] = useCreateCustomerMutation()
  const { data: allStores = [], isLoading: storesLoading, error: storesError } = useGetStoresQuery()
  const currentUser = useSelector((state: RootState) => state.auth.user)
  
  // 所有用户都可以选择所有门店
  const availableStores = allStores

  const customerForm = useForm<CustomerFormData>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: "",
      abn: "",
      contact: "",
      phone: "",
      email: "",
       sameAsDelivery: false,
      deliveryAddress: {
        line1:   "",
        line2:   "",
        city:    "",
        state:   "",
        postcode:"",
        country: "",
      },
      billingAddress: {
        line1:   "",
        line2:   "",
        city:    "",
        state:   "",
        postcode:"",
        country: "",
      },
      type: "retail",
      store_id: currentUser?.store_id || 0,
    },
  })

  // 当门店加载完成且用户有store_id时，设置默认值
  useEffect(() => {
    if (currentUser?.store_id && availableStores.length > 0) {
      const userStore = availableStores.find(store => store.id === currentUser.store_id)
      if (userStore) {
        customerForm.setValue("store_id", currentUser.store_id)
      } else if (availableStores.length === 1) {
        // 如果只有一个可选门店，自动选择它
        customerForm.setValue("store_id", availableStores[0].id)
      }
    }
  }, [availableStores, currentUser?.store_id, customerForm])

  // 监控"与快递地址一致"复选框，自动填充账单地址
  useEffect(() => {
    const subscription = customerForm.watch((value, { name }) => {
      if (name === "sameAsDelivery" && value.sameAsDelivery) {
        // 当选择"账单地址与快递地址一致"时，复制快递地址到账单地址
        const deliveryAddress = value.deliveryAddress
        if (deliveryAddress) {
          customerForm.setValue("billingAddress", {
            line1: deliveryAddress.line1 || "",
            line2: deliveryAddress.line2 || "",
            city: deliveryAddress.city || "",
            state: deliveryAddress.state || "",
            postcode: deliveryAddress.postcode || "",
            country: deliveryAddress.country || "",
          })
        }
      }
    })
    
    return () => subscription.unsubscribe()
  }, [customerForm])

  const handleSubmit = async (data: CustomerFormData) => {
    try {
      const customerData = {
        ...data,
        is_deleted: false,
        version: 1,
      }

      const result = await createCustomer(customerData).unwrap()
      
      toast({
        title: "Customer Created",
        description: `Customer "${data.name}" has been created successfully.`,
      })

      customerForm.reset()
      onSuccess(result)
    } catch (error) {
      console.error("Failed to create customer:", error)
      toast({
        title: "Error",
        description: "Failed to create customer. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Create New Customer
          </DialogTitle>
        </DialogHeader>

        <Form {...customerForm}>
          <form onSubmit={customerForm.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Sales Rep Information */}
            {currentUser?.username && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="text-sm text-blue-600">
                  <strong>Sales Rep:</strong> {currentUser.username}
                  {currentUser.email && (
                    <span className="ml-2">• {currentUser.email}</span>
                  )}
                </div>
              </div>
            )}

            {/* Store Selection */}
            <FormField
              control={customerForm.control}
              name="store_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Store *</FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a store" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {storesLoading ? (
                        <div className="p-2 text-center text-gray-500">
                          <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                          Loading stores...
                        </div>
                      ) : storesError ? (
                        <div className="p-2 text-center text-red-500">
                          Failed to load stores. Please try again.
                        </div>
                      ) : availableStores.length === 0 ? (
                        <div className="p-2 text-center text-gray-500">
                          No stores available
                        </div>
                      ) : (
                        availableStores.map((store) => (
                          <SelectItem key={store.id} value={store.id.toString()}>
                            <div className="flex flex-col">
                              <div>
                                {store.name} - {store.code}
                                {store.id === currentUser?.store_id && (
                                  <span className="ml-2 text-blue-600">(Your Store)</span>
                                )}
                              </div>
                              {store.region && (
                                <div className="text-xs text-gray-500">
                                  Region: {store.region.name}
                                </div>
                              )}
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={customerForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter company name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={customerForm.control}
                name="abn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ABN</FormLabel>
                    <FormControl>
                      <Input placeholder="12 345 678 901" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={customerForm.control}
                name="contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Person *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter contact person name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={customerForm.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select customer type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="wholesale">Wholesale</SelectItem>
                        <SelectItem value="corporate">Corporate</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={customerForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone *</FormLabel>
                    <FormControl>
                      <Input placeholder="0412 345 678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={customerForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input placeholder="contact@company.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Delivery Address */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Delivery Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={customerForm.control}
                  name="deliveryAddress.line1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Line 1 *</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main Street" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={customerForm.control}
                  name="deliveryAddress.line2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Line 2</FormLabel>
                      <FormControl>
                        <Input placeholder="Unit/Suite (optional)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={customerForm.control}
                  name="deliveryAddress.city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City *</FormLabel>
                      <FormControl>
                        <Input placeholder="Sydney" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={customerForm.control}
                  name="deliveryAddress.state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="NSW">NSW</SelectItem>
                          <SelectItem value="VIC">VIC</SelectItem>
                          <SelectItem value="QLD">QLD</SelectItem>
                          <SelectItem value="WA">WA</SelectItem>
                          <SelectItem value="SA">SA</SelectItem>
                          <SelectItem value="TAS">TAS</SelectItem>
                          <SelectItem value="ACT">ACT</SelectItem>
                          <SelectItem value="NT">NT</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={customerForm.control}
                  name="deliveryAddress.postcode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postcode *</FormLabel>
                      <FormControl>
                        <Input placeholder="2000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={customerForm.control}
                  name="deliveryAddress.country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country *</FormLabel>
                      <FormControl>
                        <Input placeholder="Australia" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Same as Delivery Checkbox */}
            <FormField
              control={customerForm.control}
              name="sameAsDelivery"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Billing address is the same as delivery address
                    </FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Check this if the billing address is identical to the delivery address
                    </p>
                  </div>
                </FormItem>
              )}
            />

            {/* Billing Address - Only show if not same as delivery */}
            {!customerForm.watch("sameAsDelivery") && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Billing Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={customerForm.control}
                    name="billingAddress.line1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address Line 1 *</FormLabel>
                        <FormControl>
                          <Input placeholder="456 Business Avenue" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={customerForm.control}
                    name="billingAddress.line2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address Line 2</FormLabel>
                        <FormControl>
                          <Input placeholder="Unit/Suite (optional)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={customerForm.control}
                    name="billingAddress.city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City *</FormLabel>
                        <FormControl>
                          <Input placeholder="Melbourne" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={customerForm.control}
                    name="billingAddress.state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select state" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="NSW">NSW</SelectItem>
                            <SelectItem value="VIC">VIC</SelectItem>
                            <SelectItem value="QLD">QLD</SelectItem>
                            <SelectItem value="WA">WA</SelectItem>
                            <SelectItem value="SA">SA</SelectItem>
                            <SelectItem value="TAS">TAS</SelectItem>
                            <SelectItem value="ACT">ACT</SelectItem>
                            <SelectItem value="NT">NT</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={customerForm.control}
                    name="billingAddress.postcode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postcode *</FormLabel>
                        <FormControl>
                          <Input placeholder="3000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={customerForm.control}
                    name="billingAddress.country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country *</FormLabel>
                        <FormControl>
                          <Input placeholder="Australia" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={creating || storesLoading || availableStores.length === 0}>
                {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Customer
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

// 客户搜索组件
function CustomerSelector({
  value,
  onValueChange,
  disabled,
  customers = [],
  loading = false,
  onCustomerCreated,
}: {
  value?: number
  onValueChange: (customer: Customer | null) => void
  disabled?: boolean
  customers?: Customer[]
  loading?: boolean
  onCustomerCreated?: (customer: Customer) => void
}) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const filteredCustomers = useMemo(() => {
    if (!searchTerm) return customers
    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer.abn && customer.abn.includes(searchTerm)),
    )
  }, [searchTerm, customers])

  const selectedCustomer = customers.find((customer) => customer.id === value)

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
          disabled={disabled || loading}
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
                  setIsOpen(false)
                  setShowCreateDialog(true)
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
              {loading ? (
                <div className="p-4 text-center text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                  Loading customers...
                </div>
              ) : filteredCustomers.length === 0 ? (
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
                        {customer.contact} • {customer.abn || 'No ABN'}
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

      <CustomerCreateDialog 
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSuccess={(customer) => {
          setShowCreateDialog(false)
          onValueChange(customer)
          onCustomerCreated?.(customer)
        }}
      />
    </div>
  )
}

// 产品搜索组件
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

export default function QuoteSubmissionForm() {
  const { toast } = useToast()
  const navigate = useNavigate()
  
  // 检查是否是复制模式
  const searchParams = new URLSearchParams(window.location.search)
  const copyQuoteId = searchParams.get('copy')
  const isCopyMode = Boolean(copyQuoteId)
  
  // 表单验证错误处理函数
  const onError = (errors: any) => {
    console.error("Form validation errors:", errors);
    toast({
      title: "Form Validation Failed",
      description: "Please check all required fields and fix any errors.",
      variant: "destructive",
    });
  }
  
  // RTK Query hooks
  const [createQuote, { isLoading: submitting }] = useCreateQuoteMutation()
  const [copyQuote, { isLoading: copying }] = useCopyQuoteMutation()
  const [uploadFiles, { isLoading: uploading }] = useUploadFilesMutation()
  
  // 如果是复制模式，获取原报价单数据
  const { data: originalQuote, isLoading: loadingOriginal } = useGetQuoteByIdQuery(copyQuoteId!, {
    skip: !copyQuoteId
  })
  const { data: customers = [], isLoading: customersLoading, error: customersError } = useGetCustomersQuery()
  const { data: productsResponse, isLoading: productsLoading, error: productsError } = useGetProductsQuery({
    offset: 0,
    limit: 1000, // 获取大量产品用于选择
  })
  const products = productsResponse?.products || []
  
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | undefined>()
  const [selectedProductIds, setSelectedProductIds] = useState<{ [key: number]: number | undefined }>({})
  const [hasInitializedCopy, setHasInitializedCopy] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customer: {
        name: "",
        abn: "",
        contact: "",
        phone: "",
        email: "",
       deliveryAddress: { line1:"", line2:"", city:"", state:"", postcode:"", country:"" },
      billingAddress:  { line1:"", line2:"", city:"", state:"", postcode:"", country:"" },
      sameAsDelivery: false,
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
      depositAttachments: undefined,
      remarks: "",
      warrantyNotes: "",
    },
  })

   const same = form.watch("customer.sameAsDelivery")
  const delivery = form.watch("customer.deliveryAddress")
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  })

  // 复制模式：当原报价单数据加载完成时，填充表单
  useEffect(() => {
    if (isCopyMode && originalQuote && !loadingOriginal && !hasInitializedCopy) {
      // 填充客户信息
      if (originalQuote.customer) {
        const customer = originalQuote.customer
        form.setValue("customer", {
          id: customer.id,
          name: customer.name,
          abn: customer.abn || "",
          contact: customer.contact,
          phone: customer.phone,
          email: customer.email,
          deliveryAddress: originalQuote.deliveryAddress || {
            line1: customer.address || "",
            line2: "",
            city: "",
            state: "",
            postcode: "",
            country: "Australia",
          },
          billingAddress: originalQuote.billingAddress || {
            line1: customer.address || "",
            line2: "",
            city: "",
            state: "",
            postcode: "",
            country: "Australia",
          },
          sameAsDelivery: false,
        })
        setSelectedCustomerId(customer.id)
      }

      // 处理项目复制
      if (originalQuote.items && originalQuote.items.length > 0) {
        // 准备新的项目数据
        console.log(originalQuote);
        
        const newItems = originalQuote.items.map((item) => ({
          productId: item.productId,
          description: item.description,
          detailDescription: item.detailDescription || "",
          unit: item.unit,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount || 0,
          goodsNature: item.goodsNature as any,
        }))
        
        // 准备产品ID映射
        const newProductIds: { [key: number]: number | undefined } = {}
        originalQuote.items.forEach((item, index) => {
          if (item.productId) {
            newProductIds[index] = item.productId
          }
        })
        
        // 一次性设置所有项目
        form.setValue("items", newItems)
        setSelectedProductIds(newProductIds)
      }

      // 填充其他信息
      form.setValue("depositAmount", originalQuote.depositAmount || 0)
      form.setValue("remarks", originalQuote.remarks?.[0]?.general || "")
      form.setValue("warrantyNotes", originalQuote.warrantyNotes || "")

      // 显示复制成功提示
      toast({
        title: "Quote Copied",
        description: `Quote #${originalQuote.quoteNumber} has been copied. You can now modify and submit as a new quote.`,
      })
      
      // 标记已初始化，防止重复执行
      setHasInitializedCopy(true)
    }
  }, [isCopyMode, originalQuote, loadingOriginal, hasInitializedCopy, toast])
  
  // 当复制模式改变时重置标志
  useEffect(() => {
    if (!isCopyMode) {
      setHasInitializedCopy(false)
    }
  }, [isCopyMode])

  const handleCustomerSelect = (customer: Customer | null) => {
    if (customer) {
      setSelectedCustomerId(customer.id)
      form.setValue("customer", {
        id: customer.id,
        name: customer.name,
        abn: customer.abn || "",
        contact: customer.contact,
        phone: customer.phone,
        email: customer.email,
        deliveryAddress: {
          line1: customer.delivery_address_line1 || customer.address || "",
          line2: customer.delivery_address_line2 || "",
          city: customer.delivery_city || "",
          state: customer.delivery_state || "",
          postcode: customer.delivery_postcode || "",
          country: customer.delivery_country || "Australia",
        },
        billingAddress: {
          line1: customer.billing_address_line1 || customer.delivery_address_line1 || customer.address || "",
          line2: customer.billing_address_line2 || customer.delivery_address_line2 || "",
          city: customer.billing_city || customer.delivery_city || "",
          state: customer.billing_state || customer.delivery_state || "",
          postcode: customer.billing_postcode || customer.delivery_postcode || "",
          country: customer.billing_country || customer.delivery_country || "Australia",
        },
        sameAsDelivery: customer.same_as_delivery || false,
      })
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
        deliveryAddress: { line1: "", line2: "", city: "", state: "", postcode: "", country: "" },
        billingAddress: { line1: "", line2: "", city: "", state: "", postcode: "", country: "" },
        sameAsDelivery: false,
      })
    }
  }

  const handleProductSelect = (index: number, product: any | null) => {
    if (product) {
      console.log(product);
      
      form.setValue(`items.${index}.productId`, product.id)
      form.setValue(`items.${index}.description`, product.name_cn || product.name_en || product.djj_code)
      form.setValue(`items.${index}.unitPrice`, product.price || product.rrp_price|| 0)
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
    console.log("Form data:", data);
    
    try {
      // 处理文件上传
      let uploadedAttachments: { url: string }[] = []
      
      if (data.depositAttachments && Array.isArray(data.depositAttachments) && data.depositAttachments.length > 0) {
        console.log("Uploading files to quotes folder:", data.depositAttachments)
        
        try {
          // 上传文件到quotes文件夹
          const uploadResult = await uploadFiles({ 
            files: data.depositAttachments as File[], 
            folder: "quotes" 
          }).unwrap()
          
          // 转换上传结果为URL数组
          uploadedAttachments = uploadResult
            .filter(result => result.success)
            .map(result => ({ url: result.url }))
          
          console.log("Files uploaded successfully:", uploadedAttachments)
          
          if (uploadedAttachments.length === 0) {
            throw new Error("No files were uploaded successfully")
          }
        } catch (uploadError) {
          console.error("File upload failed:", uploadError)
          toast({
            title: "File Upload Failed",
            description: "Failed to upload payment proof files. Please try again.",
            variant: "destructive",
          })
          return
        }
      }
      
      // 构建API数据，匹配后端期望的格式
      const apiData = {
        customer: {
          id: data.customer.id,
          name: data.customer.name,
          abn: data.customer.abn,
          contact: data.customer.contact,
          phone: data.customer.phone,
          email: data.customer.email,
          storeId: customers.find(c => c.id === selectedCustomerId)?.store_id || 1, // 使用选中客户的store_id，默认为1
          deliveryAddress: {
            line1: data.customer.deliveryAddress.line1,
            line2: data.customer.deliveryAddress.line2,
            city: data.customer.deliveryAddress.city,
            state: data.customer.deliveryAddress.state,
            postcode: data.customer.deliveryAddress.postcode,
            country: data.customer.deliveryAddress.country || 'Australia',
          },
          billingAddress: {
            line1: data.customer.billingAddress.line1,
            line2: data.customer.billingAddress.line2,
            city: data.customer.billingAddress.city,
            state: data.customer.billingAddress.state,
            postcode: data.customer.billingAddress.postcode,
            country: data.customer.billingAddress.country || 'Australia',
          },
          sameAsDelivery: data.customer.sameAsDelivery,
          // 向后兼容，使用delivery address line1作为主地址
          address: data.customer.deliveryAddress.line1,
        },
        items: data.items.map(item => ({
          productId: item.productId,
          description: item.description,
          detailDescription: item.detailDescription,
          unit: item.unit,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
          goodsNature: item.goodsNature,
        })),
        depositAmount: data.depositAmount,
        depositAttachments: uploadedAttachments,
        remarks: data.remarks,
        warrantyNotes: data.warrantyNotes,
      }

      console.log("Submitting quote data to API:", apiData)

      // 调用RTK Query mutation
      const result = await createQuote(apiData).unwrap()
      
      console.log("Quote created successfully:", result)

      toast({
        title: "Quote Submitted Successfully",
        description: `Quote ${result.quoteNumber || 'created'} has been submitted and is pending approval.`,
      })

      // 重置表单
      form.reset()
      setSelectedCustomerId(undefined)
      setSelectedProductIds({})
    } catch (error) {
      console.error("Failed to submit quote:", error)
      toast({
        title: "Submission Failed",
        description: "Failed to submit quote. Please try again.",
        variant: "destructive",
      })
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(amount)
  }

  const isExistingCustomer = selectedCustomerId !== undefined

  // 处理使用API复制的按钮
  const handleUseCopyAPI = async () => {
    if (!copyQuoteId) return
    
    try {
      const result = await copyQuote(copyQuoteId).unwrap()
      
      toast({
        title: "Quote Copied via API",
        description: `New quote #${result.quoteNumber} has been created successfully.`,
      })
      
      // 跳转到新报价单的编辑页面
      navigate(`/quotes/${result.id}/edit`)
    } catch (error) {
      console.error("Failed to copy quote:", error)
      toast({
        title: "Copy Failed",
        description: "Failed to copy quote via API. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">
            {isCopyMode ? "Copy Quote" : "Submit Quote"}
          </h1>
          {isCopyMode && originalQuote && (
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg">
              <Copy className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-700">
                Copying from #{originalQuote.quoteNumber}
              </span>
            </div>
          )}
        </div>
        
        {isCopyMode && (
          <Button
            type="button"
            variant="outline"
            onClick={handleUseCopyAPI}
            disabled={copying || loadingOriginal}
            className="flex items-center gap-2"
          >
            {copying ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            Use API Copy
          </Button>
        )}
      </div>
      
      {loadingOriginal && isCopyMode && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading original quote...</span>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-6">
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
                <CustomerSelector 
                  value={selectedCustomerId} 
                  onValueChange={handleCustomerSelect}
                  customers={customers}
                  loading={customersLoading}
                />
                {customersError && (
                  <p className="text-sm text-red-600 mt-1">
                    Failed to load customers. Please try again.
                  </p>
                )}
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
                          products={products}
                          loading={productsLoading}
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
                  name="depositAttachments"
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
            <Button 
              type="submit" 
              disabled={submitting || uploading}
              onClick={() => {
                console.log("Submit button clicked!");
                console.log("Current form state:", form.formState.errors);
                console.log("Form is valid:", form.formState.isValid);
                console.log("Form values:", form.getValues());
              }}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading Files...
                </>
              ) : submitting ? (
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
