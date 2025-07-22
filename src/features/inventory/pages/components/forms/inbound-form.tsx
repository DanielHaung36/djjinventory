"use client"

import { useState, useEffect, useMemo } from "react"
import { Navigate, useNavigate, useSearchParams } from "react-router-dom"
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
import { InboundItemsTable } from "../inbound-items-table"
import { createInboundTransaction, getPurchaseOrders } from "@/lib/actions/inventory-actions"
import { createManualInboundTransaction, type ManualInboundRequest } from "@/lib/actions/manual-inbound-actions"
import type { Supplier, InboundItem, PurchaseOrder } from "@/lib/types"
import type { Region, Warehouse } from "../../../types"
import { useAppSelector } from "@/app/hooks"
import { useUserRegionAndWarehouses } from "@/hooks/useUserRegionAndWarehouses"
import { PlusCircle, FileText, ClipboardList, Tag, ListFilter, ShoppingCart, Loader2 } from "lucide-react"
import { AddItemDialog } from "../dialogs/add-item-dialog"
import { SelectPurchaseOrderDialog } from "../dialogs/select-purchase-order-dialog"
import { PurchaseOrderPickingList } from "../picking-lists/purchase-order-picking-list"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Mock data for suppliers
const suppliers: Supplier[] = [
  { id: "1", name: "Acme Supplies" },
  { id: "2", name: "Global Parts Inc." },
  { id: "3", name: "Tech Components Ltd." },
]

const formSchema = z.object({
  // Modified to allow both transaction types simultaneously
  transactionTypes: z.array(z.enum(["order-based", "non-order-based"])).min(1, "Select at least one transaction type"),
  purchaseOrderIds: z.array(z.string()).optional(),
  regionId: z.string().min(1, "Region is required"),
  warehouseId: z.string().min(1, "Warehouse is required"),
  // supplierName: z.string().min(1, "Supplier is required"),
  referenceNumber: z.string().min(1, "Reference number is required"),
  receiptDate: z.string().min(1, "Receipt date is required"),
  notes: z.string().optional(),
  files: z.array(z.any()).optional(),
})


export function InboundForm() {
  const router = useNavigate()
  const [searchParams] = useSearchParams()
  const [items, setItems] = useState<InboundItem[]>([])
  const [poItems, setPoItems] = useState<InboundItem[]>([])
  const [manualItems, setManualItems] = useState<InboundItem[]>([])
  const [isAddingItem, setIsAddingItem] = useState(false)
  const [isSelectingPO, setIsSelectingPO] = useState(false)
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
  const [isLoadingPurchaseOrders, setIsLoadingPurchaseOrders] = useState(false)
  const [selectedPOs, setSelectedPOs] = useState<PurchaseOrder[]>([])
  const [currentPO, setCurrentPO] = useState<PurchaseOrder | null>(null)
  const [showPickingList, setShowPickingList] = useState(false)
  const [supplierNameInput, setSupplierNameInput] = useState("")
  const [referenceNumberInput, setReferenceNumberInput] = useState("")
  const [currentUser, setCurrentUser] = useState<any>(null)
  
  // 使用新的hook获取用户地区和仓库信息
  const { region, regionId, regionName, warehouses } = useUserRegionAndWarehouses()
  console.log('✅ 入库表单使用useUserRegionAndWarehouses:', { region, regionId, regionName, warehouses })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      transactionTypes: ["non-order-based"],
      purchaseOrderIds: [],
      regionId: "",
      warehouseId: "",
      referenceNumber: "",
      receiptDate: new Date().toISOString().split("T")[0],
      notes: "",
      files: [],
    },
  })

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

  // Update form values when supplier name input changes
  // useEffect(() => {
  //   form.setValue("supplierName", supplierNameInput)
  // }, [supplierNameInput, form])

  // Update form values when reference number input changes
  useEffect(() => {
    form.setValue("referenceNumber", referenceNumberInput)
  }, [referenceNumberInput, form])

  // 处理从库存页面传来的产品信息
  useEffect(() => {
    const productId = searchParams.get("productId")
    const productName = searchParams.get("productName")
    
    if (productId && productName) {
      // 自动添加该产品到手动项目列表
      const newItem: InboundItem = {
        id: `manual-from-inventory-${productId}`,
        name: decodeURIComponent(productName),
        category: "Parts", // 默认分类，用户可以在对话框中修改
        qty: 1,
        price: 0,
        sku: `SKU-${productId}`,
        quantity: 1, // 兼容字段
        unitPrice: 0, // 兼容字段
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

  // 获取当前用户信息
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
        description: "Please add at least one item to the inbound transaction.",
        variant: "destructive",
      })
      return
    }
    console.log('📋 Form values:', values);
    
    // 检查是否为纯手动入库
    const isManualOnly = transactionTypes.length === 1 && transactionTypes[0] === "non-order-based"
    
    if (isManualOnly && manualItems.length > 0) {
      // 验证必需字段
      const invalidItems = manualItems.filter(item => 
        !item.productId || !item.djjCode || !item.category
      )
      
      if (invalidItems.length > 0) {
        toast({
          title: "数据验证失败",
          description: `${invalidItems.length} 个项目缺少必需的产品信息（产品ID、编码或分类）`,
          variant: "destructive",
        })
        return
      }

      // 处理文件上传
      let files: string[] = []
      if (values.files && values.files.length > 0) {
        try {
          console.log('📎 开始上传文件...', values.files.length, '个文件')
          
          // 上传每个文件
          const uploadPromises = values.files.map(async (file: File) => {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('folder', 'inbound') // 使用inbound文件夹
            
            const response = await fetch('/api/upload', {
              method: 'POST',
              body: formData,
            })
            
            if (!response.ok) {
              throw new Error(`文件上传失败: ${file.name}`)
            }
            
            const result = await response.json()
            return result.url || file.name // 返回服务器端文件URL
          })
          
          files = await Promise.all(uploadPromises)
          console.log('✅ 文件上传完成:', files)
        } catch (error) {
          console.error('❌ 文件上传失败:', error)
          toast({
            title: "文件上传失败",
            description: "部分文件上传失败，将继续处理入库操作",
            variant: "destructive",
          })
          // 即使文件上传失败，也继续处理入库操作
          files = values.files.map((file: File) => file.name)
        }
      }

      // 使用新的手动入库API
      const manualInboundData: ManualInboundRequest = {
        region_id: parseInt(values.regionId),
        warehouse_id: parseInt(values.warehouseId),
        reference_number: values.referenceNumber,
        receipt_date: values.receiptDate,
        notes: values.notes || undefined,
        file_paths: files, // 🔥 使用file_paths字段发送文件路径数组
        items: manualItems.map(item => ({
          product_id: item.productId!,        // 🔥 使用产品数据库ID
          djj_code: item.djjCode!,            // DJJ编码
          category: item.category!,           // 产品分类
          quantity: item.qty,
          unit_price: item.price,
          vin: item.vin || undefined,
          serial: item.serial || undefined,
          add_loan: item.addLoan || undefined,
          remark: item.remark || undefined,
        }))
      }
      
      console.log('🚀 发送手动入库请求:', manualInboundData);
      
      try {
        const result = await createManualInboundTransaction(manualInboundData)

        if (result.success && result.data) {
          const response = result.data
          
          // 显示详细的成功信息
          const successMsg = response.failed_items > 0 
            ? `成功 ${response.success_items}/${response.total_items} 项，失败 ${response.failed_items} 项`
            : `全部 ${response.success_items} 项处理成功`
            
          toast({
            title: "手动入库完成",
            description: `${successMsg}，总价值: ¥${response.total_value.toFixed(2)}`,
            variant: response.failed_items > 0 ? "default" : "default"
          })
          
          // 如果有失败项目，显示详细信息
          if (response.failed_items > 0) {
            const failedItems = response.processed_items.filter(item => !item.success)
            console.warn('❌ 入库失败项目:', failedItems)
          }
          
          router("/inventory/inbound")
        } else {
          throw new Error(result.error || "手动入库处理失败")
        }
      } catch (error) {
        console.error("手动入库失败:", error)
        toast({
          title: "手动入库失败",
          description: error instanceof Error ? error.message : "手动入库处理失败，请重试。",
          variant: "destructive",
        })
      }
    } else {
      // 使用原有的入库API（订单入库或混合入库）
      const submitData = {
        ...values,
        transactionType: values.transactionTypes[0],
        purchaseOrderId:
          values.purchaseOrderIds && values.purchaseOrderIds.length > 0 ? values.purchaseOrderIds[0] : undefined,
        items,
        files: values.files,
      }
      
      console.log('🚀 Sending to legacy backend:', submitData);
      
      try {
        const result = await createInboundTransaction(submitData)

        if (result.success) {
          toast({
            title: "入库成功",
            description: `入库交易 ${result.id} 创建成功，库存已更新。`,
          })
          router("/inventory/inbound")
        } else {
          throw new Error("入库交易创建失败")
        }
      } catch (error) {
        console.error("入库失败:", error)
        toast({
          title: "入库失败",
          description: error instanceof Error ? error.message : "入库交易创建失败，请重试。",
          variant: "destructive",
        })
      }
    }
  }

  const addManualItem = (item: InboundItem) => {
    const newItem = { ...item, id: `manual-${Date.now()}`, source: "manual" }
    setManualItems([...manualItems, newItem])
    setIsAddingItem(false)
  }

  const updateItem = (id: string, field: keyof InboundItem, value: any) => {
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

  const handleSelectPOs = (purchaseOrders: PurchaseOrder[]) => {
    setSelectedPOs(purchaseOrders)
    setIsSelectingPO(false)

    // Update form values based on the selected POs
    form.setValue(
      "purchaseOrderIds",
      purchaseOrders.map((po) => po.id),
    )

    // If we have selected POs and this is the first one, update supplier info
    if (purchaseOrders.length > 0 && !isManualEntry) {
      const firstPO = purchaseOrders[0]
      setSupplierNameInput(firstPO.supplier.name)
      setReferenceNumberInput(
        purchaseOrders.length === 1 ? firstPO.orderNumber : `Multiple POs (${purchaseOrders.length})`,
      )
    }

    // If we have selected POs, show the picking list for the first one
    if (purchaseOrders.length > 0) {
      setCurrentPO(purchaseOrders[0])
      setShowPickingList(true)
    }

    // Process items from all selected POs
    const newPoItems: InboundItem[] = []
    purchaseOrders.forEach((po) => {
      po.items.forEach((item) => {
        if (item.orderedQty > item.receivedQty) {
          const remainingQty = item.orderedQty - item.receivedQty
          newPoItems.push({
            id: `po-${po.id}-${item.id}`,
            name: item.name,
            category: item.category, // 使用订单项目的category
            sku: item.sku,
            qty: remainingQty, // 使用标准qty字段
            price: item.unitPrice, // 使用标准price字段
            quantity: remainingQty, // 保留兼容字段
            unitPrice: item.unitPrice, // 保留兼容字段
            location: "",
            lotNumber: "",
            expirationDate: "",
            source: "purchase-order",
            purchaseOrderId: po.id,
            purchaseOrderNumber: po.orderNumber,
          })
        }
      })
    })

    setPoItems(newPoItems)
  }

  const handleViewPickingList = (po: PurchaseOrder) => {
    setCurrentPO(po)
    setShowPickingList(true)
  }

  const handleRemovePO = (poId: string) => {
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
      setSupplierNameInput("")
      setReferenceNumberInput("")
    } else if (updatedPOs.length === 1) {
      setReferenceNumberInput(updatedPOs[0].orderNumber)
    } else if (updatedPOs.length > 1) {
      setReferenceNumberInput(`Multiple POs (${updatedPOs.length})`)
    }
  }

  
  const handlePickingListItemsSelected = (selectedItems: InboundItem[]) => {
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>New Inbound Transaction</CardTitle>
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
                        Purchase Order
                      </label>
                    </div>
                  </div>
                  <FormDescription>
                    Select one or both transaction types. Manual entry allows you to add items directly, while Purchase
                    Order lets you receive items from existing orders.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Purchase Order Selection */}
            {isOrderBased && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Purchase Orders</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsSelectingPO(true)}
                    disabled={isLoadingPurchaseOrders}
                  >
                    {isLoadingPurchaseOrders ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <FileText className="mr-2 h-4 w-4" />
                        Select Purchase Orders
                      </>
                    )}
                  </Button>
                </div>

                {selectedPOs.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {selectedPOs.map((po) => (
                        <div
                          key={po.id}
                          className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm"
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{po.orderNumber}</span>
                            <span className="text-xs text-muted-foreground">{po.supplier.name}</span>
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
                                    onClick={() => handleViewPickingList(po)}
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
                                    onClick={() => handleRemovePO(po.id)}
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
                                <TooltipContent>Remove purchase order</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                      ))}
                    </div>

                    {showPickingList && currentPO && (
                      <Card className="border-dashed">
                        <CardHeader className="py-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium">Picking List: {currentPO.orderNumber}</CardTitle>
                            {selectedPOs.length > 1 && (
                              <div className="flex items-center gap-1">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  disabled={selectedPOs.indexOf(currentPO) === 0}
                                  onClick={() => {
                                    const currentIndex = selectedPOs.findIndex((po) => po.id === currentPO.id)
                                    if (currentIndex > 0) {
                                      setCurrentPO(selectedPOs[currentIndex - 1])
                                    }
                                  }}
                                >
                                  Previous
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  disabled={selectedPOs.indexOf(currentPO) === selectedPOs.length - 1}
                                  onClick={() => {
                                    const currentIndex = selectedPOs.findIndex((po) => po.id === currentPO.id)
                                    if (currentIndex < selectedPOs.length - 1) {
                                      setCurrentPO(selectedPOs[currentIndex + 1])
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
                                   <PurchaseOrderPickingList
                              purchaseOrder={currentPO}
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
                      <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <h3 className="mt-3 text-sm font-medium">No purchase orders selected</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Click the button above to select purchase orders for this inbound transaction.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Basic Information */}
            <div className="grid gap-4 md:grid-cols-2">
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

              {/* Warehouse Selection - 使用用户地区的仓库 */}
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
                          <SelectValue placeholder={warehouses.length === 0 ? "没有可用仓库" : "选择仓库"} />
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
              {/* <FormField
                control={form.control}
                name="supplierName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier</FormLabel>
                    <Select
                      value={supplierNameInput}
                      onValueChange={(value) => {
                        setSupplierNameInput(value)
                      }}
                      disabled={isOrderBased && selectedPOs.length > 0 && !isManualEntry}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select supplier" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.name}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}

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
                        disabled={isOrderBased && selectedPOs.length > 0 && !isManualEntry}
                      />
                    </FormControl>
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
                  <FormDescription>Upload relevant documents (invoices, packing slips, etc.)</FormDescription>
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
                  {poItems.length > 0 && (
                    <Badge variant="outline" className="bg-green-50">
                      <FileText className="mr-1 h-3 w-3" />
                      PO Items: {poItems.length}
                    </Badge>
                  )}
                </div>
              )}

              {items.length > 0 ? (
                <InboundItemsTable items={items} updateItem={updateItem} removeItem={removeItem} />
              ) : (
                <div className="rounded-md border border-dashed p-6 text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <ListFilter className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <h3 className="mt-3 text-sm font-medium">No items added</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {isManualEntry && isOrderBased
                      ? "Add items manually or select from purchase orders."
                      : isManualEntry
                        ? "Click the 'Add Manual Item' button to add items."
                        : "Select purchase orders to add items."}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router("/inventory/inbound")}>
              Cancel
            </Button>
            <Button type="submit">Create Inbound Transaction</Button>
          </CardFooter>
        </Card>
      </form>

      <AddItemDialog
        open={isAddingItem}
        onClose={() => setIsAddingItem(false)}
        onAdd={addManualItem}
        mode="inbound"
      />

      <SelectPurchaseOrderDialog
        open={isSelectingPO}
        onClose={() => setIsSelectingPO(false)}
        onSelect={handleSelectPOs}
        purchaseOrders={purchaseOrders}
        multiSelect={true}
        isLoading={isLoadingPurchaseOrders}
      />
    </Form>
  )
}
