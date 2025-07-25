"use client"

import { useState, useEffect,useMemo } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useSearchParams } from "react-router-dom"
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
import { useSubmitManualOutboundMutation } from "@/features/inventory/inventoryApi"
import { useGetCustomersQuery } from "@/features/customer/customerApi"
import type { Customer, OutboundItem, SalesOrder,PurchaseOrder } from "@/lib/types"
import type { Customer as CustomerType } from "@/features/customer/types"
import { PlusCircle, FileText, ClipboardList, Tag, ListFilter, ShoppingBag, Loader2, Search, Plus, X } from "lucide-react"
import { AddItemDialog } from "../dialogs/add-item-dialog"
import { SelectSalesOrderDialog } from "../dialogs/select-sales-order-dialog"
import { SalesOrderPickingList } from "../picking-lists/sales-order-picking-list"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import type { Region, Warehouse } from "../../../types"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useNavigate } from "react-router-dom"
import { createInboundTransaction, getPurchaseOrders } from "@/lib/actions/inventory-actions"
import { useUserRegionAndWarehouses } from "@/hooks/useUserRegionAndWarehouses"


// 删除mock数据，使用真实API数据

// CustomerSelector组件（参考Quote表单实现）
function CustomerSelector({
  value,
  onValueChange,
  disabled,
  customers = [],
  loading = false,
}: {
  value?: number
  onValueChange: (customer: CustomerType | null) => void
  disabled?: boolean
  customers?: CustomerType[]
  loading?: boolean
}) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)

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
    </div>
  )
}

// 1) schema 加字段
const formSchema = z.object({
  transactionTypes: z.array(z.enum(["order-based", "non-order-based"])).min(1, "Select at least one transaction type"),
  salesOrderIds:    z.array(z.string()).optional(),
  purchaseOrderIds: z.array(z.string()).optional(),
  regionId:         z.string().min(1, "Region is required"),
  warehouseId:      z.string().min(1, "Warehouse is required"),
  customerId:       z.string().optional(),
  referenceNumber:  z.string().min(1),
  shipmentDate:     z.string().min(1),
  receiptDate: z.string().min(1, "Receipt date is required"),
  notes: z.string().optional(),
  files: z.array(z.any()).optional(),
})



export function OutboundForm() {
  const router = useNavigate()
  const [searchParams] = useSearchParams()
  const [submitManualOutbound, { isLoading: isSubmitting }] = useSubmitManualOutboundMutation()
  const { data: customers = [], isLoading: isLoadingCustomers } = useGetCustomersQuery()
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | undefined>()
  const [poItems, setPoItems] = useState<OutboundItem[]>([])
  const [items, setItems] = useState<OutboundItem[]>([])
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
  const [isLoadingPurchaseOrders, setIsLoadingPurchaseOrders] = useState(false)
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
  const [currentPO, setCurrentPO] = useState<PurchaseOrder | null>(null)
  const [selectedPOs, setSelectedPOs] = useState<PurchaseOrder[]>([])
  
  // 使用新的hook获取用户地区和仓库信息
  const { region, regionId, regionName, warehouses } = useUserRegionAndWarehouses()
  console.log('✅ 出库表单使用useUserRegionAndWarehouses:', { region, regionId, regionName, warehouses })
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      transactionTypes: ["non-order-based"],
      purchaseOrderIds: [],
      regionId: "",
      warehouseId: "",
      customerId: "",
      referenceNumber: "",
      shipmentDate: new Date().toISOString().split("T")[0],
      receiptDate: new Date().toISOString().split("T")[0],
      notes: "",
      files: [],
    },
  })
  const [currentUser, setCurrentUser] = useState<any>(null)
  const transactionTypes = form.watch("transactionTypes")
  const isOrderBased = transactionTypes.includes("order-based")
  const isManualEntry = transactionTypes.includes("non-order-based")
  // === 权限控制逻辑 ===
  const canViewAllRegions = useMemo(() => {
    if (!currentUser) return false
    
    // 从profile的role字段判断
    let userRole = currentUser.role
    
    // 如果没有直接的role字段，从roles数组中获取
    if (!userRole && currentUser.roles && currentUser.roles.length > 0) {
      userRole = currentUser.roles[0]?.Name || currentUser.roles[0]?.name
    }
    
    if (!userRole) return false
    
    const allowedRoles = ["admin", "financial_leader", "财务负责人", "管理员", "超级管理员"]
    const hasPermission = allowedRoles.includes(userRole)
    
    console.log('✅ 入库表单权限检查:', { 
      userRole, 
      hasPermission,
      userId: currentUser.id,
      email: currentUser.email,
      dataSource: 'profile'
    })
    
    return hasPermission
  }, [currentUser])


  // Update combined items whenever either source changes
  useEffect(() => {
    setItems([...poItems, ...manualItems])
  }, [poItems, manualItems])

   // Update form values when reference number input changes
  useEffect(() => {
    form.setValue("referenceNumber", referenceNumberInput)
  }, [referenceNumberInput, form])

  // Update form values when customer name input changes
  useEffect(() => {
    form.setValue("customerName", customerNameInput)
  }, [customerNameInput, form])




  // 处理从库存页面传来的产品信息
  useEffect(() => {
    const productId = searchParams.get("productId")
    const productName = searchParams.get("productName")
    
    if (productId && productName) {
      // 自动添加该产品到手动项目列表
      const newItem: OutboundItem = {
        id: `manual-from-inventory-${productId}`,
        productId: Number(productId),
        name: decodeURIComponent(productName),
        category: "Parts", // 默认分类，用户可以在对话框中修改
        quantity: 1, // 🔥 统一使用quantity字段
        unitPrice: 0, // 🔥 统一使用unitPrice字段
        sku: `SKU-${productId}`,
        location: "",
        lotNumber: "",
        expirationDate: "",
        source: "manual"
      }
      setManualItems([newItem])
      
      // 设置参考号码为产品信息
      setReferenceNumberInput(`${decodeURIComponent(productName)} - 入库`)
    }
  }, [searchParams])

    useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const userData = await response.json()
          setCurrentUser(userData)
          console.log('✅ 获取用户信息成功:', userData)
        }
      } catch (error) {
        console.error('Failed to fetch current user:', error)
      }
    }

    fetchCurrentUser()
  }, [])

  // 当用户地区信息可用时，自动设置表单
  useEffect(() => {
    if (regionId) {
      form.setValue("regionId", regionId.toString())
      console.log('✅ 自动设置用户地区:', regionName, 'ID:', regionId)
      
      // 如果只有一个仓库，自动选择
      if (warehouses.length === 1) {
        form.setValue("warehouseId", warehouses[0].id.toString())
        console.log('✅ 自动选择唯一仓库:', warehouses[0].name)
      }
    }
  }, [regionId, regionName, warehouses, form])

    useEffect(() => {
    const loadPurchaseOrders = async () => {
      try {
        setIsLoadingPurchaseOrders(true)
        const orders = await getPurchaseOrders()
        setPurchaseOrders(orders)
      } catch (error) {
        console.error("Failed to load purchase orders:", error)
        toast({
          title: "Error",
          description: "Failed to load purchase orders. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingPurchaseOrders(false)
      }
    }

    loadPurchaseOrders()
  }, [])


  // 处理地区变化（现在地区是固定的，所以这个函数可能不需要了）
  const handleRegionChange = (regionId: string) => {
    // 由于地区现在是从用户profile中获取的，不应该允许更改
    console.warn('地区不应该被更改，用户地区是固定的:', regionName)
  }

  // 处理顾客选择
  const handleCustomerSelect = (customer: CustomerType | null) => {
    if (customer) {
      setSelectedCustomerId(customer.id)
      form.setValue("customerId", customer.id.toString())
    } else {
      setSelectedCustomerId(undefined)
      form.setValue("customerId", "")
    }
  }


  async function onSubmit(values: z.infer<typeof formSchema>) {
        console.log('🔍 Debug - Items state:', {
      manualItems: manualItems.length,
      poItems: poItems.length,
      totalItems: items.length,
      manualItemsDetail: manualItems,
      itemsDetail: items
    })

    if (items.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one item to the outbound transaction.",
        variant: "destructive",
      })
      return
    }

    try {
      // 只处理手动出库（非订单出库）
      if (values.transactionTypes.includes("non-order-based") && manualItems.length > 0) {
        // 根据selectedCustomerId找到对应的customer name
        const selectedCustomer = selectedCustomerId ? customers.find(c => c.id === selectedCustomerId) : null
        const customerName = selectedCustomer ? `${selectedCustomer.name} (${selectedCustomer.company})` : undefined
        
        const result = await submitManualOutbound({
          regionId: values.regionId, // 发送字符串而不是数字
          warehouseId: values.warehouseId, // 发送字符串而不是数字
          referenceNumber: values.referenceNumber,
          shipmentDate: values.shipmentDate,
          customerName: customerName,
          notes: values.notes || undefined,
          items: manualItems.map(item => ({
            product_id: item.productId || 1, // 🔥 直接使用productId
            product_name: item.name,
            category: item.category || "未分类", // 🔥 统一使用category字段
            quantity: Math.abs(item.quantity || 0), // 🔥 统一使用quantity字段
            unit_price: item.unitPrice || 0, // 🔥 统一使用unitPrice字段
            notes: `出库: ${item.name}`
          })),
          file_paths: values.files?.map((file: File) => file.name) || []
        }).unwrap()

        toast({
          title: "出库成功",
          description: `出库交易 ${result.referenceNumber} 创建成功，库存已更新。`,
        })
        router("/inventory/outbound")
      } else if (values.transactionTypes.includes("order-based")) {
        // 对于基于订单的出库，仍使用原来的逻辑
        const result = await createOutboundTransaction({
          ...values,
          transactionType: values.transactionTypes[0],
          salesOrderId: values.salesOrderIds && values.salesOrderIds.length > 0 ? values.salesOrderIds[0] : undefined,
          items,
          files: values.files,
        })

        if (result.success) {
          toast({
            title: "出库成功",
            description: `出库交易 ${result.id} 创建成功，库存已更新。`,
          })
          router("/inventory/outbound")
        } else {
          throw new Error("出库交易创建失败")
        }
      } else {
        throw new Error("请选择出库类型并添加商品")
      }
    } catch (error) {
      console.error("出库失败:", error)
      toast({
        title: "出库失败",
        description: error instanceof Error ? error.message : "出库交易创建失败，请重试。",
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
    if (id.startsWith("po-")) {
      setPoItems(poItems.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
    } else {
      setManualItems(manualItems.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
    }
  }

  
  const removeItem = (id: string) => {
    // Remove from the appropriate array based on ID prefix
    if (id.startsWith("po-")) {
      setPoItems(poItems.filter((item) => item.id !== id))
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
    if (!currentPO) return

    // Add a source identifier and ensure unique IDs for PO items
    const poItemsWithSource = selectedItems.map((item) => ({
      ...item,
      id: item.id.startsWith("po-") ? item.id : `po-${currentPO.id}-${item.id}`,
      source: "purchase-order",
      purchaseOrderId: currentPO.id,
      purchaseOrderNumber: currentPO.orderNumber, // Add PO number for reference
    }))

    // Add these items to the existing PO items
    setPoItems((prev) => {
      // Remove any existing items from this PO
      const filteredItems = prev.filter((item) => !item.id.includes(`po-${currentPO.id}-`))
      return [...filteredItems, ...poItemsWithSource]
    })

    // Move to the next PO if there is one
    const currentIndex = selectedPOs.findIndex((po) => po.id === currentPO.id)
    if (currentIndex < selectedPOs.length - 1) {
      setCurrentPO(selectedPOs[currentIndex + 1])
    } else {
      setShowPickingList(false)
      setCurrentPO(null)
    }
  }

 const handleCancelPickingList = () => {
    // If we're in the middle of selecting items from multiple POs,
    // move to the next one or close if we're done
    if (currentPO) {
      const currentIndex = selectedPOs.findIndex((po) => po.id === currentPO.id)
      if (currentIndex < selectedPOs.length - 1) {
        setCurrentPO(selectedPOs[currentIndex + 1])
      } else {
        setShowPickingList(false)
        setCurrentPO(null)
      }
    } else {
      setShowPickingList(false)
    }
  }

  const handleViewPickingList = (so: SalesOrder) => {
    setCurrentSO(so)
    setShowPickingList(true)
  }

const handleRemoveSO= (poId: string) => {
    // Remove the PO from selected POs
    const updatedPOs = selectedPOs.filter((po) => po.id !== poId)
    setSelectedPOs(updatedPOs)

    // Update form values
    form.setValue(
      "purchaseOrderIds",
      updatedPOs.map((po) => po.id),
    )

    // Remove items associated with this PO
    setPoItems(poItems.filter((item) => item.purchaseOrderId !== poId))

    // If we removed all POs, hide the picking list
    if (updatedPOs.length === 0) {
      setShowPickingList(false)
      setCurrentPO(null)
    } else if (currentPO?.id === poId) {
      // If we removed the current PO, show the first one in the list
      setCurrentPO(updatedPOs[0])
    }

    // Update supplier and reference if needed
    if (updatedPOs.length === 0 && !isManualEntry) {
      // setSupplierNameInput("")
      setReferenceNumberInput("")
    } else if (updatedPOs.length === 1) {
      setReferenceNumberInput(updatedPOs[0].orderNumber)
    } else if (updatedPOs.length > 1) {
      setReferenceNumberInput(`Multiple POs (${updatedPOs.length})`)
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

              {/* <FormField
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
              /> */}
            {/* Basic Information */}
              {/* Region Selection - 现在是只读的 */}
              <FormField
                control={form.control}
                name="regionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Region</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={handleRegionChange}
                      disabled={true} // 地区不可更改
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={regionName || "未分配地区"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {region && (
                          <SelectItem key={region.id} value={region.id.toString()}>
                            {region.name}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      您被分配到 {regionName} 地区，仓库数量: {warehouses.length}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Warehouse Selection */}
              <FormField
                control={form.control}
                name="warehouseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Warehouse * ({warehouses.length} 个可选)</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={warehouses.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select warehouse" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {warehouses.map((warehouse) => (
                          <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                            {warehouse.name}
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
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer (Optional)</FormLabel>
                    <FormControl>
                      <CustomerSelector 
                        value={selectedCustomerId} 
                        onValueChange={handleCustomerSelect}
                        customers={customers}
                        loading={isLoadingCustomers}
                        disabled={isOrderBased && selectedSOs.length > 0 && !isManualEntry}
                      />
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? "创建中..." : "创建出库交易"}
            </Button>
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