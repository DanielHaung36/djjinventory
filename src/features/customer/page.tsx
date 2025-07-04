"use client"

import { useState, useMemo, useEffect } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import {
  useGetCustomersQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation
} from './customerApi'
import { useGetStoresQuery } from "../store/storeapi"
import { useGetRegionsQuery } from "../region/regionApi"
import type { Customer } from './types'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Building2,
  Phone,
  Mail,
  MapPin,
  User,
  MoreHorizontal,
  Eye,
  ChevronLeft,
  ChevronRight,
  Warehouse,
  CompassIcon
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { daDK } from "@mui/x-date-pickers/locales"

// 数据类型定义
interface Company {
  id: number
  code: string
  name: string
  email: string
  phone: string
  website: string
  abn: string
  address: string
  bank_name: string
  bsb: string
  account_number: string
  is_default: boolean
  created_at: string
  updated_at: string
}

interface Region {
  id: number
  name: string
  companyId: number
  company: Company
  createdAt: string
  updatedAt: string
}

interface Store {
  id: number
  code: string
  name: string
  regionId: number
  region: Region
  companyId: number
  company: Company
  address: string
  managerId?: number
  manager?: any
  version: number
  createdAt: string
  updatedAt: string
  isDeleted: boolean
}

// interface Customer {
//   id: number
//   code: string
//   name: string
//   storeId: number
//   store: Store
//   regionId: number
//   region: Region
//   companyId: number
//   company: Company
//   address: string
//   version: number
//   createdAt: string
//   updatedAt: string
//   isDeleted: boolean
//   // 从Go结构体中添加的字段
//   type?: string
//   phone?: string
//   email?: string
//   abn?: string
//   contact?: string
// }



// 分页接口
interface PaginationInfo {
  currentPage: number
  pageSize: number
  totalItems: number
  totalPages: number
}

// 客户数据验证模式
const customerSchema = z.object({
  id: z.number().optional(),
  code: z.string().optional(), // 改为可选，因为会自动生成
  name: z.string().min(1, "Customer name is required"),
  storeId: z.number().min(1, "Store is required"),
  regionId: z.number().optional(), // 改为可选，会自动设置
  companyId: z.number().optional(), // 改为可选，会自动设置
  address: z.string().optional(),
  type: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  abn: z.string().optional(),
  contact: z.string().optional(),
})

type CustomerFormData = z.infer<typeof customerSchema>

// 模拟数据
const mockCompanies: Company[] = [
  {
    id: 1,
    code: "DJJ_PERTH",
    name: "DJJ PERTH PTY LTD",
    email: "sales@djjequipment.com.au",
    phone: "1800 355 388",
    website: "https://djjequipment.com.au",
    abn: "95 663 874 664",
    address: "56 Clavering Road Bayswater, WA Australia 6053",
    bank_name: "",
    bsb: "",
    account_number: "",
    is_default: true,
    created_at: "2025-07-01T13:36:54.239942Z",
    updated_at: "2025-07-01T13:36:54.239942Z",
  },
]

const mockRegions: Region[] = [
  {
    id: 1,
    name: "Perth",
    companyId: 1,
    company: mockCompanies[0],
    createdAt: "2025-07-01T13:36:54.246384Z",
    updatedAt: "2025-07-01T13:36:54.246384Z",
  },
  {
    id: 2,
    name: "Sydney",
    companyId: 1,
    company: mockCompanies[0],
    createdAt: "2025-07-01T13:36:54.246384Z",
    updatedAt: "2025-07-01T13:36:54.246384Z",
  },
]

const mockStores: Store[] = [
  {
    id: 1,
    code: "PER_STORE",
    name: "Perth Store",
    regionId: 1,
    region: mockRegions[0],
    companyId: 1,
    company: mockCompanies[0],
    address: "56 Clavering Road Bayswater, WA Australia 6053",
    version: 1,
    createdAt: "2025-07-01T13:36:54.274506Z",
    updatedAt: "2025-07-01T13:36:54.274506Z",
    isDeleted: false,
  },
  {
    id: 2,
    code: "SYD_STORE",
    name: "Sydney Store",
    regionId: 2,
    region: mockRegions[1],
    companyId: 1,
    company: mockCompanies[0],
    address: "123 Industrial Drive, Sydney NSW 2000",
    version: 1,
    createdAt: "2025-07-01T13:36:54.274506Z",
    updatedAt: "2025-07-01T13:36:54.274506Z",
    isDeleted: false,
  },
]

const initialCustomers: Customer[] = [
  {
    id: 1,
    code: "CUST_001",
    name: "ACME Pty Ltd",
    storeId: 1,
    store: mockStores[0],
    regionId: 1,
    region: mockRegions[0],
    companyId: 1,
    company: mockCompanies[0],
    address: "123 Industrial Drive, Perth WA 6000",
    version: 1,
    createdAt: "2025-07-01T13:36:54.274506Z",
    updatedAt: "2025-07-01T13:36:54.274506Z",
    isDeleted: false,
    type: "wholesale",
    phone: "08 9999 1234",
    email: "contact@acme.com.au",
    abn: "12 345 678 901",
    contact: "John Smith",
  },
  {
    id: 2,
    code: "CUST_002",
    name: "Tech Solutions Inc",
    storeId: 1,
    store: mockStores[0],
    regionId: 1,
    region: mockRegions[0],
    companyId: 1,
    company: mockCompanies[0],
    address: "456 Technology Park, Perth WA 6000",
    version: 1,
    createdAt: "2025-07-01T14:00:00.000000Z",
    updatedAt: "2025-07-01T14:00:00.000000Z",
    isDeleted: false,
    type: "retail",
    phone: "08 9999 5678",
    email: "info@techsolutions.com.au",
    abn: "98 765 432 109",
    contact: "Alice Johnson",
  },
  {
    id: 3,
    code: "CUST_003",
    name: "Mining Corp Australia",
    storeId: 2,
    store: mockStores[1],
    regionId: 2,
    region: mockRegions[1],
    companyId: 1,
    company: mockCompanies[0],
    address: "789 Mining Road, Sydney NSW 2000",
    version: 1,
    createdAt: "2025-07-01T15:00:00.000000Z",
    updatedAt: "2025-07-01T15:00:00.000000Z",
    isDeleted: false,
    type: "corporate",
    phone: "02 9999 9012",
    email: "contact@miningcorp.com.au",
    abn: "11 222 333 444",
    contact: "Bob Wilson",
  },
  {
    id: 4,
    code: "CUST_004",
    name: "Construction Plus",
    storeId: 1,
    store: mockStores[0],
    regionId: 1,
    region: mockRegions[0],
    companyId: 1,
    company: mockCompanies[0],
    address: "321 Builder Street, Perth WA 6000",
    version: 1,
    createdAt: "2025-07-01T16:00:00.000000Z",
    updatedAt: "2025-07-01T16:00:00.000000Z",
    isDeleted: false,
    type: "wholesale",
    phone: "08 9999 3456",
    email: "info@constructionplus.com.au",
    abn: "55 666 777 888",
    contact: "Carol Brown",
  },
  {
    id: 5,
    code: "CUST_005",
    name: "Heavy Machinery Co",
    storeId: 2,
    store: mockStores[1],
    regionId: 2,
    region: mockRegions[1],
    companyId: 1,
    company: mockCompanies[0],
    address: "654 Equipment Avenue, Sydney NSW 2000",
    version: 1,
    createdAt: "2025-07-01T17:00:00.000000Z",
    updatedAt: "2025-07-01T17:00:00.000000Z",
    isDeleted: false,
    type: "retail",
    phone: "02 9999 7890",
    email: "sales@heavymachinery.com.au",
    abn: "99 111 222 333",
    contact: "David Lee",
  },
]

// 自动生成客户编码
const generateCustomerCode = (storeCode: string, customerName: string) => {
  // 取客户名称的前3个字符（去除空格和特殊字符）
  const namePrefix = customerName
    .replace(/[^a-zA-Z0-9]/g, "")
    .substring(0, 3)
    .toUpperCase()

  // 生成随机3位数字
  const randomNum = Math.floor(Math.random() * 900) + 100

  return `${storeCode}_${namePrefix}_${randomNum}`
}

export default function CustomerManagement() {
  // 订阅列表，onCacheEntryAdded 会帮你维持 WS
  const { data: customers, isLoading, error } = useGetCustomersQuery()
  const [createCustomer] = useCreateCustomerMutation()
  const [updateCustomer] = useUpdateCustomerMutation()
  const [deleteCustomer] = useDeleteCustomerMutation()
  const { data: stores } = useGetStoresQuery();
  const { data: regions } = useGetRegionsQuery()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStore, setSelectedStore] = useState<string>("all")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  // ① watch 当前选中的 storeId

  console.log(regions);

  // 分页状态
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
  })

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      storeId: 1,
      address: "",
      type: "retail",
      phone: "",
      email: "",
      abn: "",
      contact: "",
    },
  })
  const selectedStoreId = useWatch({ control: form.control, name: 'storeId' });
  // ② 根据 storeId 过滤 regions
  const filteredRegions = useMemo(() => {
    if (!selectedStoreId || !regions) return [];
    // 假设 store 对象里有个 regionId 字段：
    const store = stores?.find((s) => s.id === selectedStoreId);
    if (store) {
      // 如果一个 store 只属于一个 region
      return regions.filter((r) => r.id === store.region_id);
      // —— 或者，如果 store 有 “regions” 数组：
      // return store.regions;
    }
    return [];
  }, [selectedStoreId, regions, stores]);

  console.log(selectedStoreId);

  // 处理Store选择变化
  const handleStoreChange = (storeId: number) => {
    const selectedStore = stores?.find((s) => s.id === storeId)
    if (selectedStore) {
      form.setValue("storeId", storeId)
      form.setValue("regionId", selectedStore.regionId)
      form.setValue("companyId", selectedStore.companyId)

      // 如果已经有客户名称，重新生成编码
      const customerName = form.getValues("name")
      if (customerName) {
        const newCode = generateCustomerCode(selectedStore.code, customerName)
        form.setValue("code", newCode)
      }
    }
  }

  // 处理客户名称变化
  const handleNameChange = (name: string) => {
    form.setValue("name", name)

    // 如果已经选择了Store，生成新的编码
    const storeId = form.getValues("storeId")
    const selectedStore = stores.find((s) => s.id === storeId)
    if (selectedStore && name) {
      const newCode = generateCustomerCode(selectedStore.code, name)
      form.setValue("code", newCode)
    }
  }

  // 过滤和分页客户
  const { filteredCustomers, paginatedCustomers } = useMemo(() => {
    // use empty array if customers is ever undefined
    let filtered = customers?.filter((c) => !c.isDeleted) || []

    // 搜索过滤
    if (searchTerm) {
      filtered = filtered?.filter(
        (customer) =>
          customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (customer.contact && customer.contact.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (customer.abn && customer.abn.includes(searchTerm)),
      )
    }

    // Store过滤
    if (selectedStore !== "all") {
      filtered = filtered?.filter((customer) => customer.storeId === Number(selectedStore))
    }

    // 类型过滤
    if (selectedType !== "all") {
      filtered = filtered?.filter((customer) => customer.type === selectedType)
    }

    // 计算分页
    const totalItems = filtered?.length
    const totalPages = Math.ceil(totalItems / pagination.pageSize)
    const startIndex = (pagination.currentPage - 1) * pagination.pageSize
    const endIndex = startIndex + pagination.pageSize
    const paginated = filtered?.slice(startIndex, endIndex)

    // // 更新分页信息
    // setPagination((prev) => ({
    //   ...prev,
    //   totalItems,
    //   totalPages,
    // }))

    return {
      filteredCustomers: filtered,
      paginatedCustomers: paginated,
      totalItems,
      totalPages,
    }

  }, [customers, searchTerm, selectedStore, selectedType, pagination.currentPage, pagination.pageSize])

  // 5) sync pagination metadata in an effect
  useEffect(() => {
    setPagination(p => ({
      ...p,
      totalItems: p.totalItems,      // you can also read from the memo return
      totalPages: Math.ceil(filteredCustomers.length / p.pageSize),
    }))
  }, [filteredCustomers.length, pagination.pageSize])

  // 分页控制
  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page }))
  }

  const handlePageSizeChange = (size: number) => {
    setPagination((prev) => ({ ...prev, pageSize: size, currentPage: 1 }))
  }


  // 添加客户
  const handleAddCustomer = async (data: CustomerFormData) => {
    try {
      const selectedStore = stores?.find((s) => s.id === data.storeId)
      const selectedRegion = selectedStore?.region
      const selectedCompany = selectedRegion?.company
      console.log(selectedCompany);
      // 确保有Customer Code，如果没有则生成
      // let customerCode = data.code
      // if (!customerCode && selectedStore && data.name) {
      //   customerCode = generateCustomerCode(selectedStore.code, data.name)
      // }

      const newCustomer: Customer = {
        ...data,
        id: Math.max(...customers.map((c) => c.id || 0)) + 1,
        // region_id: selectedStore!.region_id,
        // companyId: selectedStore!.companyId,
        store: selectedStore!,
        store_id: selectedStore!.id,
        // region: selectedRegion!,
        // company: selectedCompany!,
        version: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_deleted: false,
      }

      console.log(newCustomer);
      // 发请求，把 newCustomer 传给后端
      const result = await createCustomer(newCustomer).unwrap()
      console.log(result);

      setIsAddDialogOpen(false)
      form.reset()
      toast({
        title: "Customer Added",
        description: `New customer has been added with code: ${newCustomer.name}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add customer. Please try again.",
        variant: "destructive",
      })
    }
  }

  // // 编辑客户
  // const handleEditCustomer = async (data: CustomerFormData) => {
  //   try {
  //     const selectedStore = stores?.find((s) => s.id === data.storeId)
  //     const selectedRegion = regions?.find((r) => r.id === data.regionId)
  //     const selectedCompany = mockCompanies.find((c) => c.id === data.companyId)

  //     customers?.map((c) =>
  //       c.id === selectedCustomer?.id
  //         ? {
  //           ...c,
  //           ...data,
  //           store: selectedStore!,
  //           region: selectedRegion!,
  //           company: selectedCompany!,
  //           version: c.version + 1,
  //           updatedAt: new Date().toISOString(),
  //         }
  //         : c,
  //     ),

  //     setIsEditDialogOpen(false)
  //     setSelectedCustomer(null)
  //     form.reset()
  //     toast({
  //       title: "Customer Updated",
  //       description: "Customer information has been updated successfully.",
  //     })
  //   } catch (error) {
  //     toast({
  //       title: "Error",
  //       description: "Failed to update customer. Please try again.",
  //       variant: "destructive",
  //     })
  //   }
  // }
const handleEditCustomer = async (data: CustomerFormData) => {
  if (!selectedCustomer) return

  try {
    // ① 找到关联的 store / region / company
    const selectedStore   = stores?.find(s => s.id === data.storeId)!
    const selectedRegion  = regions?.find(r => r.id === data.regionId)!
    const selectedCompany = mockCompanies.find(c => c.id === data.companyId)!

    // ② 拼装一个完整的 Customer 对象
    const updatedCustomer: Customer = {
      ...selectedCustomer,              // id, created_at, is_deleted 这些原来就有
      ...data,                          // name, storeId, regionId, companyId, address, type, phone, email, abn, contact
      store:       selectedStore,       // 关联对象
      store_id:    selectedStore.id,    // 外键
      version:     selectedCustomer.version + 1,
      updated_at:  new Date().toISOString(),
    }

    // ③ 调用 RTK Query 的 mutation
    //    这里假设你在 customerApi 里是这样定的：
    //    updateCustomer: builder.mutation<Customer, Customer>({...})
    await updateCustomer(updatedCustomer).unwrap()

    // ④ UI 收尾
    setIsEditDialogOpen(false)
    setSelectedCustomer(null)
    form.reset()
    toast({
      title: "Customer Updated",
      description: `客户 ${data.name} 已更新`,
    })
    // （因为你设置了 invalidatesTags，列表会自动刷新）
  } catch (err) {
    console.error(err)
    toast({
      title: "Error",
      description: "更新失败，请重试。",
      variant: "destructive",
    })
  }
}



  // // 删除客户（软删除）
  // const handleDeleteCustomer = async () => {
  //   try {
  //     customers?.map((c) =>
  //       c.id === selectedCustomer?.id ? { ...c, isDeleted: true, updatedAt: new Date().toISOString() } : c,
  //     ),
  //       setIsDeleteDialogOpen(false)
  //     setSelectedCustomer(null)
  //     toast({
  //       title: "Customer Deleted",
  //       description: "Customer has been deleted successfully.",
  //     })
  //   } catch (error) {
  //     toast({
  //       title: "Error",
  //       description: "Failed to delete customer. Please try again.",
  //       variant: "destructive",
  //     })
  //   }
  // }
    const handleDeleteCustomer = async () => {
    if (!selectedCustomer) return;

    try {
      // 1. 复制一份，把 is_deleted 打开
      const deletedCustomer: Customer = {
        ...selectedCustomer,
        is_deleted: true,
        updated_at: new Date().toISOString(),
      };

      // 2. 发 updateCustomer，后端把它当成 “软删”
      await updateCustomer(deletedCustomer).unwrap();

      // 3. UI 反馈
      setIsDeleteDialogOpen(false);
      setSelectedCustomer(null);
      toast({
        title: "Customer Deleted",
        description: `客户【${selectedCustomer.name}】已标记删除`,
      });
      // 列表同样会自动刷新
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "删除失败，请重试。",
        variant: "destructive",
      });
    }
  }


  // 打开编辑对话框
  const openEditDialog = (customer: Customer) => {
    setSelectedCustomer(customer)
    form.reset({
      code: customer.code,
      name: customer.name,
      storeId: customer.storeId,
      regionId: customer.regionId,
      companyId: customer.companyId,
      address: customer.address || "",
      type: customer.type || "retail",
      phone: customer.phone || "",
      email: customer.email || "",
      abn: customer.abn || "",
      contact: customer.contact || "",
    })
    setIsEditDialogOpen(true)
  }

  // 打开查看对话框
  const openViewDialog = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsViewDialogOpen(true)
  }

  // 打开删除对话框
  const openDeleteDialog = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsDeleteDialogOpen(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-AU", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (isLoading) return <div>Loading…</div>
  if (error) return <div>Error loading customers</div>


  return (
    <div className="container mx-auto py-6 max-w-7xl">
      {/* 页面标题和操作 */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Customer Management</h1>
          <p className="text-gray-600 mt-1">Manage your customer database</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleAddCustomer)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          Customer Name *
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter customer name"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e)
                              handleNameChange(e.target.value)
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="storeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Warehouse className="h-4 w-4" />
                          Store *</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            const storeId = Number(value)
                            field.onChange(storeId)
                            handleStoreChange(storeId)
                          }}
                          defaultValue={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select store" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {stores?.filter((store) => !store.isDeleted)
                              .map((store) => (
                                <SelectItem key={store.id} value={store.id.toString()}>
                                  {store.name} ({store.code}) - {store.region.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* 显示自动生成的Customer Code */}
                {/* {form.watch("code") && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="text-sm font-medium text-blue-900">Auto-generated Customer Code:</div>
                    <div className="text-lg font-mono text-blue-800">{form.watch("code")}</div>
                  </div>
                )} */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
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

                  {/* 显示自动选择的Region */}
                  <div>
                    <label className="text-sm font-medium text-gray-700">Region (Auto-selected)</label>
                    <div className="mt-1 p-2 bg-gray-50 border rounded-md text-sm text-gray-600">
                      {form.watch("storeId")
                        ? stores?.find((s) => s.id === form.watch("storeId"))?.region.name || "Select a store first"
                        : "Select a store first"}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Contact Person
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Enter contact person" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Phone
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Enter phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                 <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <CompassIcon className="h-4 w-4" />
                          Company
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Enter Company" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email
                        </FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Enter email address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="abn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ABN</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter ABN" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Address
                      </FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter address" rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Add Customer</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* 搜索和过滤栏 */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search customers by name, code, contact, email, or ABN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Select value={selectedStore} onValueChange={setSelectedStore}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by store" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stores</SelectItem>
                  {stores?.filter((store) => !store.isDeleted)
                    .map((store) => (
                      <SelectItem key={store.id} value={store.id.toString()}>
                        {store.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="wholesale">Wholesale</SelectItem>
                  <SelectItem value="corporate">Corporate</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 客户列表 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            Customers ({pagination.totalItems} total, showing {paginatedCustomers.length})
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Show:</span>
            <Select
              value={pagination.pageSize.toString()}
              onValueChange={(value) => handlePageSizeChange(Number(value))}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {paginatedCustomers.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
              <p className="text-gray-500">
                {searchTerm || selectedStore !== "all" || selectedType !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Get started by adding your first customer"}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Id</th>
                      <th className="text-left py-3 px-4 font-medium">Name</th>
                      <th className="text-left py-3 px-4 font-medium">Type</th>
                      <th className="text-left py-3 px-4 font-medium">Contact</th>
                      <th className="text-left py-3 px-4 font-medium">Phone</th>
                      <th className="text-left py-3 px-4 font-medium">Store</th>
                      <th className="text-right py-3 px-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedCustomers.map((customer) => (
                      <tr key={customer.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-mono text-sm">{customer.id}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium">{customer.name}</div>
                          {customer.email && <div className="text-sm text-gray-500">{customer.email}</div>}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${customer.type === "wholesale"
                                ? "bg-blue-100 text-blue-800"
                                : customer.type === "corporate"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                          >
                            {customer.type || "retail"}
                          </span>
                        </td>
                        <td className="py-3 px-4">{customer.contact || "-"}</td>
                        <td className="py-3 px-4">{customer.phone || "-"}</td>
                        <td className="py-3 px-4">
                          <div className="font-medium">{customer.store.name}</div>
                          <div className="text-sm text-gray-500">{customer.store.code}</div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openViewDialog(customer)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openEditDialog(customer)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openDeleteDialog(customer)} className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 分页控件 */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-500">
                    Showing {(pagination.currentPage - 1) * pagination.pageSize + 1} to{" "}
                    {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} of{" "}
                    {pagination.totalItems} results
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        let pageNumber
                        if (pagination.totalPages <= 5) {
                          pageNumber = i + 1
                        } else if (pagination.currentPage <= 3) {
                          pageNumber = i + 1
                        } else if (pagination.currentPage >= pagination.totalPages - 2) {
                          pageNumber = pagination.totalPages - 4 + i
                        } else {
                          pageNumber = pagination.currentPage - 2 + i
                        }

                        return (
                          <Button
                            key={pageNumber}
                            variant={pagination.currentPage === pageNumber ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(pageNumber)}
                            className="w-8 h-8 p-0"
                          >
                            {pageNumber}
                          </Button>
                        )
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={pagination.currentPage === pagination.totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* 编辑对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Edit Customer</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEditCustomer)} className="space-y-6">
              {/* 基本信息 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* <FormField
                      control={form.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer Code *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter customer code" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    /> */}

                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter customer name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                          <FormField
                      control={form.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter customer's company name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="storeId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Store *</FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange(Number(value))}
                            value={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select store" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {stores?.filter((store) => !store.is_deleted)
                                .map((store) => (
                                  <SelectItem key={store.id} value={store.id.toString()}>
                                    {store.name} ({store.code})
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
                      name="regionId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Region *</FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange(Number(value))}
                            value={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select region" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {stores?.map((store) => {
                                if (store.id === selectedStoreId)
                                  return (<SelectItem key={store.region.id} value={store.region.id.toString()}>
                                    {store.region.name}
                                  </SelectItem>)
                              }

                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
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
                  </div>
                </CardContent>
              </Card>

              {/* 联系信息 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="contact"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Contact Person
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Enter contact person" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            Phone
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Enter phone number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            Email
                          </FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Enter email address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="abn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ABN</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter ABN" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Address
                        </FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter address" rows={3} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  <Edit className="h-4 w-4 mr-2" />
                  Update Customer
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* 查看详情对话框 */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-6">
              {/* 基本信息 */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b">Basic Information</h3>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Customer Company</dt>
                    <dd className="mt-1 text-sm text-gray-900 font-mono">{selectedCustomer.company}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Customer Name</dt>
                    <dd className="mt-1 text-sm text-gray-900 font-semibold">{selectedCustomer.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Type</dt>
                    <dd className="mt-1">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${selectedCustomer.type === "wholesale"
                            ? "bg-blue-100 text-blue-800"
                            : selectedCustomer.type === "corporate"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-green-100 text-green-800"
                          }`}
                      >
                        {selectedCustomer.type || "retail"}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Version</dt>
                    <dd className="mt-1 text-sm text-gray-900">v{selectedCustomer.version}</dd>
                  </div>
                </dl>
              </div>

              {/* 联系信息 */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b">Contact Information</h3>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Contact Person</dt>
                    <dd className="mt-1 text-sm text-gray-900">{selectedCustomer.contact || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Phone</dt>
                    <dd className="mt-1 text-sm text-gray-900">{selectedCustomer.phone || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900">{selectedCustomer.email || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">ABN</dt>
                    <dd className="mt-1 text-sm text-gray-900">{selectedCustomer.abn || "—"}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Address</dt>
                    <dd className="mt-1 text-sm text-gray-900">{selectedCustomer.address || "—"}</dd>
                  </div>
                </dl>
              </div>

              {/* 关联信息 */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b">Store & Company</h3>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Store</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <div className="font-medium">{selectedCustomer.store.name}</div>
                      <div className="text-xs text-gray-500">{selectedCustomer.store.code}</div>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Region</dt>
                    <dd className="mt-1 text-sm text-gray-900">{selectedCustomer.store.region.name}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Company</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <div className="font-medium">{selectedCustomer.company}</div>
                      {/* <div className="text-xs text-gray-500">{selectedCustomer.company.code}</div> */}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* 时间戳 */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b">Record Information</h3>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Created</dt>
                    <dd className="mt-1 text-sm text-gray-900">{formatDate(selectedCustomer.createdAt)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                    <dd className="mt-1 text-sm text-gray-900">{formatDate(selectedCustomer.updatedAt)}</dd>
                  </div>
                </dl>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => openEditDialog(selectedCustomer)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedCustomer?.name}" ({selectedCustomer?.email})? This action will
              mark the customer as deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCustomer} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
