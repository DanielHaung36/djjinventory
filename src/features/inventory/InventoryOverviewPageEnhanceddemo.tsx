// "use client"

// import { useState, useMemo } from "react"
// import { MaterialReactTable, useMaterialReactTable, type MRT_ColumnDef } from "material-react-table"
// // 👇 直接在这里引入 Provider
// import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
// import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Alert, AlertDescription } from "@/components/ui/alert"
// import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
// import { toast } from "@/hooks/use-toast"
// import {
//   Package,
//   WarehouseIcon,
//   AlertTriangle,
//   TrendingUp,
//   TrendingDown,
//   Eye,
//   History,
//   Plus,
//   Minus,
//   MapPin,
//   Building2,
//   RefreshCw,
//   Download,
//   Settings,
//   Info,
// } from "lucide-react"

// // 数据类型定义
// interface InventoryItem {
//   id: number
//   product_id: number
//   product_code: string
//   product_name: string
//   category: string
//   region_id: number
//   region_name: string
//   warehouse_id: number
//   warehouse_name: string
//   warehouse_location: string
//   region_warehouse: string // 地区+仓库组合字段
//   on_hand: number
//   reserved: number
//   available: number
//   low_stock: boolean
//   threshold: number
//   unit_price: number
//   total_value: number
//   last_updated: string
//   operator: string
// }

// interface Region {
//   id: number
//   name: string
//   warehouses: any[]
// }

// // 模拟数据
// const mockRegions: Region[] = [
//   {
//     id: 1,
//     name: "华东地区",
//     warehouses: [
//       { id: 1, name: "上海仓", location: "上海市浦东新区", region_id: 1 },
//       { id: 2, name: "杭州仓", location: "杭州市余杭区", region_id: 1 },
//       { id: 3, name: "南京仓", location: "南京市江宁区", region_id: 1 },
//     ],
//   },
//   {
//     id: 2,
//     name: "华北地区",
//     warehouses: [
//       { id: 4, name: "北京仓", location: "北京市大兴区", region_id: 2 },
//       { id: 5, name: "天津仓", location: "天津市滨海新区", region_id: 2 },
//     ],
//   },
//   {
//     id: 3,
//     name: "华南地区",
//     warehouses: [
//       { id: 6, name: "深圳仓", location: "深圳市宝安区", region_id: 3 },
//       { id: 7, name: "广州仓", location: "广州市黄埔区", region_id: 3 },
//     ],
//   },
// ]

// const mockInventoryData: InventoryItem[] = [
//   {
//     id: 1,
//     product_id: 101,
//     product_code: "DJJ-001",
//     product_name: "挖掘机液压泵",
//     category: "Machine",
//     region_id: 1,
//     region_name: "华东地区",
//     warehouse_id: 1,
//     warehouse_name: "上海仓",
//     warehouse_location: "上海市浦东新区",
//     region_warehouse: "华东地区 - 上海仓",
//     on_hand: 25,
//     reserved: 5,
//     available: 20,
//     low_stock: false,
//     threshold: 10,
//     unit_price: 15000,
//     total_value: 375000,
//     last_updated: "2024-01-10T10:30:00Z",
//     operator: "张三",
//   },
//   {
//     id: 2,
//     product_id: 102,
//     product_code: "DJJ-002",
//     product_name: "发动机滤芯",
//     category: "Parts",
//     region_id: 1,
//     region_name: "华东地区",
//     warehouse_id: 2,
//     warehouse_name: "杭州仓",
//     warehouse_location: "杭州市余杭区",
//     region_warehouse: "华东地区 - 杭州仓",
//     on_hand: 8,
//     reserved: 2,
//     available: 6,
//     low_stock: true,
//     threshold: 10,
//     unit_price: 150,
//     total_value: 1200,
//     last_updated: "2024-01-10T09:15:00Z",
//     operator: "李四",
//   },
//   {
//     id: 3,
//     product_id: 103,
//     product_code: "DJJ-003",
//     product_name: "履带链条",
//     category: "Parts",
//     region_id: 2,
//     region_name: "华北地区",
//     warehouse_id: 4,
//     warehouse_name: "北京仓",
//     warehouse_location: "北京市大兴区",
//     region_warehouse: "华北地区 - 北京仓",
//     on_hand: 50,
//     reserved: 10,
//     available: 40,
//     low_stock: false,
//     threshold: 15,
//     unit_price: 800,
//     total_value: 40000,
//     last_updated: "2024-01-10T11:45:00Z",
//     operator: "王五",
//   },
//   {
//     id: 4,
//     product_id: 104,
//     product_code: "DJJ-004",
//     product_name: "液压油管",
//     category: "Accessories",
//     region_id: 3,
//     region_name: "华南地区",
//     warehouse_id: 6,
//     warehouse_name: "深圳仓",
//     warehouse_location: "深圳市宝安区",
//     region_warehouse: "华南地区 - 深圳仓",
//     on_hand: 5,
//     reserved: 1,
//     available: 4,
//     low_stock: true,
//     threshold: 8,
//     unit_price: 200,
//     total_value: 1000,
//     last_updated: "2024-01-10T14:20:00Z",
//     operator: "赵六",
//   },
//   {
//     id: 5,
//     product_id: 105,
//     product_code: "DJJ-005",
//     product_name: "工具箱套装",
//     category: "Tools",
//     region_id: 2,
//     region_name: "华北地区",
//     warehouse_id: 5,
//     warehouse_name: "天津仓",
//     warehouse_location: "天津市滨海新区",
//     region_warehouse: "华北地区 - 天津仓",
//     on_hand: 30,
//     reserved: 3,
//     available: 27,
//     low_stock: false,
//     threshold: 12,
//     unit_price: 500,
//     total_value: 15000,
//     last_updated: "2024-01-10T16:10:00Z",
//     operator: "孙七",
//   },
//   {
//     id: 6,
//     product_id: 106,
//     product_code: "DJJ-006",
//     product_name: "挖斗齿",
//     category: "Parts",
//     region_id: 1,
//     region_name: "华东地区",
//     warehouse_id: 3,
//     warehouse_name: "南京仓",
//     warehouse_location: "南京市江宁区",
//     region_warehouse: "华东地区 - 南京仓",
//     on_hand: 120,
//     reserved: 20,
//     available: 100,
//     low_stock: false,
//     threshold: 30,
//     unit_price: 80,
//     total_value: 9600,
//     last_updated: "2024-01-10T13:25:00Z",
//     operator: "钱八",
//   },
//   {
//     id: 7,
//     product_id: 107,
//     product_code: "DJJ-007",
//     product_name: "液压缸密封件",
//     category: "Parts",
//     region_id: 3,
//     region_name: "华南地区",
//     warehouse_id: 7,
//     warehouse_name: "广州仓",
//     warehouse_location: "广州市黄埔区",
//     region_warehouse: "华南地区 - 广州仓",
//     on_hand: 3,
//     reserved: 0,
//     available: 3,
//     low_stock: true,
//     threshold: 5,
//     unit_price: 300,
//     total_value: 900,
//     last_updated: "2024-01-10T15:40:00Z",
//     operator: "周九",
//   },
// ]

// export default function InventoryOverviewPage() {
//   const [selectedRegion, setSelectedRegion] = useState<string>("all")
//   const [selectedWarehouse, setSelectedWarehouse] = useState<string>("all")
//   const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
//   const [isLoading, setIsLoading] = useState(false)

//   const availableWarehouses = useMemo(() => {
//     if (selectedRegion === "all") {
//       return mockRegions.flatMap((region) => region.warehouses)
//     }
//     const region = mockRegions.find((r) => r.id.toString() === selectedRegion)
//     return region?.warehouses || []
//   }, [selectedRegion])

//   const filteredData = useMemo(() => {
//     return mockInventoryData.filter((item) => {
//       const matchesRegion = selectedRegion === "all" || item.region_id.toString() === selectedRegion
//       const matchesWarehouse = selectedWarehouse === "all" || item.warehouse_id.toString() === selectedWarehouse
//       return matchesRegion && matchesWarehouse
//     })
//   }, [selectedRegion, selectedWarehouse])

//   const stats = useMemo(() => {
//     const totalItems = filteredData.length
//     const lowStockItems = filteredData.filter((item) => item.low_stock).length
//     const totalValue = filteredData.reduce((sum, item) => sum + item.total_value, 0)
//     const totalOnHand = filteredData.reduce((sum, item) => sum + item.on_hand, 0)
//     const totalReserved = filteredData.reduce((sum, item) => sum + item.reserved, 0)
//     const totalAvailable = filteredData.reduce((sum, item) => sum + item.available, 0)

//     return {
//       totalItems,
//       lowStockItems,
//       totalValue,
//       totalOnHand,
//       totalReserved,
//       totalAvailable,
//     }
//   }, [filteredData])

//   const columns = useMemo<MRT_ColumnDef<InventoryItem>[]>(
//     () => [
//       {
//         accessorKey: "product_code",
//         header: "产品代码",
//         size: 120,
//         enableColumnFilter: true,
//         Cell: ({ cell }) => <span className="font-mono font-medium text-blue-600">{cell.getValue<string>()}</span>,
//       },
//       {
//         accessorKey: "product_name",
//         header: "产品名称",
//         size: 200,
//         enableColumnFilter: true,
//         Cell: ({ cell, row }) => (
//           <div>
//             <p className="font-medium">{cell.getValue<string>()}</p>
//             <p className="text-sm text-gray-500">ID: {row.original.product_id}</p>
//           </div>
//         ),
//       },
//       {
//         accessorKey: "category",
//         header: "分类",
//         size: 100,
//         enableColumnFilter: true,
//         filterVariant: "select",
//         filterSelectOptions: [
//           { label: "机械设备", value: "Machine" },
//           { label: "零配件", value: "Parts" },
//           { label: "工具", value: "Tools" },
//           { label: "配件", value: "Accessories" },
//         ],
//         Cell: ({ cell }) => {
//           const category = cell.getValue<string>()
//           const colorMap = {
//             Machine: "bg-orange-100 text-orange-800 border-orange-200",
//             Parts: "bg-blue-100 text-blue-800 border-blue-200",
//             Tools: "bg-green-100 text-green-800 border-green-200",
//             Accessories: "bg-purple-100 text-purple-800 border-purple-200",
//           }
//           return (
//             <Badge variant="outline" className={colorMap[category as keyof typeof colorMap]}>
//               {category}
//             </Badge>
//           )
//         },
//       },
//       {
//         accessorKey: "region_warehouse",
//         header: "地区 + 仓库",
//         size: 180,
//         enableColumnFilter: true,
//         Cell: ({ cell, row }) => (
//           <div className="flex items-center gap-2">
//             <WarehouseIcon className="h-4 w-4 text-gray-500" />
//             <div>
//               <p className="font-medium text-sm">{row.original.region_name}</p>
//               <p className="text-xs text-gray-500">{row.original.warehouse_name}</p>
//             </div>
//           </div>
//         ),
//       },
//       {
//         accessorKey: "on_hand",
//         header: "在库量",
//         size: 80,
//         enableColumnFilter: true,
//         filterVariant: "range",
//         Cell: ({ cell }) => <span className="font-semibold text-blue-600">{cell.getValue<number>()}</span>,
//       },
//       {
//         accessorKey: "reserved",
//         header: "锁定量",
//         size: 80,
//         enableColumnFilter: true,
//         filterVariant: "range",
//         Cell: ({ cell }) => <span className="font-semibold text-orange-600">{cell.getValue<number>()}</span>,
//       },
//       {
//         accessorKey: "available",
//         header: "可用量",
//         size: 80,
//         enableColumnFilter: true,
//         filterVariant: "range",
//         Cell: ({ cell, row }) => {
//           const value = cell.getValue<number>()
//           const isLow = row.original.low_stock
//           return (
//             <div className="flex items-center gap-1">
//               <span className={`font-semibold ${isLow ? "text-red-600" : "text-green-600"}`}>{value}</span>
//               {isLow && <AlertTriangle className="h-4 w-4 text-red-600" />}
//             </div>
//           )
//         },
//       },
//       {
//         accessorKey: "low_stock",
//         header: "库存状态",
//         size: 100,
//         enableColumnFilter: true,
//         filterVariant: "checkbox",
//         Cell: ({ cell }) => {
//           const isLow = cell.getValue<boolean>()
//           return isLow ? (
//             <Badge variant="destructive">库存不足</Badge>
//           ) : (
//             <Badge className="bg-green-100 text-green-800 border-green-200">库存充足</Badge>
//           )
//         },
//       },
//       {
//         accessorKey: "unit_price",
//         header: "单价",
//         size: 100,
//         enableColumnFilter: true,
//         filterVariant: "range",
//         Cell: ({ cell }) => <span>¥{cell.getValue<number>().toLocaleString()}</span>,
//       },
//       {
//         accessorKey: "total_value",
//         header: "总价值",
//         size: 120,
//         enableColumnFilter: true,
//         filterVariant: "range",
//         Cell: ({ cell }) => <span className="font-semibold">¥{cell.getValue<number>().toLocaleString()}</span>,
//       },
//       {
//         accessorKey: "operator",
//         header: "操作员",
//         size: 100,
//         enableColumnFilter: true,
//       },
//       {
//         accessorKey: "last_updated",
//         header: "最后更新",
//         size: 140,
//         enableColumnFilter: true,
//         filterVariant: "date-range",
//         Cell: ({ cell }) => {
//           const date = new Date(cell.getValue<string>())
//           return (
//             <div>
//               <p className="text-sm">{date.toLocaleDateString()}</p>
//               <p className="text-xs text-gray-500">{date.toLocaleTimeString()}</p>
//             </div>
//           )
//         },
//       },
//     ],
//     [],
//   )

//   const table = useMaterialReactTable({
//     columns,
//     data: filteredData,
//     enableColumnOrdering: true,
//     enableRowActions: true,
//     enableColumnPinning: true,
//     enableRowSelection: true,
//     enableColumnFilters: true,
//     enableColumnFilterModes: true,
//     enableGlobalFilter: true,
//     enableSorting: true,
//     enablePagination: true,
//     enableStickyHeader: true,
//     enableDensityToggle: true,
//     enableFullScreenToggle: true,
//     enableHiding: true,

//     initialState: {
//       showGlobalFilter: true,
//       showColumnFilters: true,
//       density: "compact",
//       pagination: {
//         pageSize: 20,
//         pageIndex: 0,
//       },
//       columnPinning: {
//         left: ["mrt-row-select", "product_code"],
//         right: ["mrt-row-actions"],
//       },
//     },

//     muiTableBodyRowProps: ({ row }) => ({
//       onClick: () => setSelectedItem(row.original),
//       sx: {
//         cursor: "pointer",
//         "&:hover": {
//           backgroundColor: "rgba(0, 0, 0, 0.04)",
//         },
//       },
//     }),

//     paginationDisplayMode: "pages",
//     muiPaginationProps: {
//       showFirstButton: true,
//       showLastButton: true,
//       rowsPerPageOptions: [10, 20, 50, 100],
//     },

//     muiTablePaperProps: {
//       sx: {
//         boxShadow: "none",
//         border: "1px solid #e2e8f0",
//       },
//     },

//     renderRowActionMenuItems: ({ row, closeMenu }) => [
//       <div
//         key="info"
//         onClick={() => {
//           closeMenu()
//           setSelectedItem(row.original)
//         }}
//         className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer"
//       >
//         <Eye className="h-4 w-4 text-blue-600" />
//         查看详情
//       </div>,
//       <div
//         key="history"
//         onClick={() => {
//           closeMenu()
//           toast({ title: "查看交易历史", description: `正在加载 ${row.original.product_name} 的交易历史` })
//         }}
//         className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer"
//       >
//         <History className="h-4 w-4 text-gray-600" />
//         交易历史
//       </div>,
//       <div
//         key="stock-in"
//         onClick={() => {
//           closeMenu()
//           toast({ title: "入库操作", description: `正在处理 ${row.original.product_name} 的入库操作` })
//         }}
//         className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer"
//       >
//         <Plus className="h-4 w-4 text-green-600" />
//         入库
//       </div>,
//       <div
//         key="stock-out"
//         onClick={() => {
//           closeMenu()
//           toast({ title: "出库操作", description: `正在处理 ${row.original.product_name} 的出库操作` })
//         }}
//         className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer"
//       >
//         <Minus className="h-4 w-4 text-red-600" />
//         出库
//       </div>,
//     ],

//     renderTopToolbarCustomActions: () => (
//       <div className="flex items-center gap-2">
//         <Button variant="outline" onClick={handleRefresh} disabled={isLoading} size="sm">
//           <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
//           刷新
//         </Button>
//         <Button variant="outline" size="sm">
//           <Download className="h-4 w-4 mr-2" />
//           导出
//         </Button>
//       </div>
//     ),
//   })

//   const handleRefresh = async () => {
//     setIsLoading(true)
//     await new Promise((resolve) => setTimeout(resolve, 1000))
//     setIsLoading(false)
//     toast({
//       title: "数据已刷新",
//       description: "库存数据已更新到最新状态",
//     })
//   }

//   // 👇 将 Provider 包裹在最外层
//   return (
//     <LocalizationProvider dateAdapter={AdapterDayjs}>
//       <div className="container mx-auto p-6 space-y-6">
//         {/* 页面标题 */}
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-3xl font-bold">库存管理</h1>
//             <p className="text-muted-foreground">管理和监控所有地区仓库的库存情况</p>
//           </div>
//           <div className="flex items-center gap-2">
//             <Button variant="outline">
//               <Settings className="h-4 w-4 mr-2" />
//               设置
//             </Button>
//           </div>
//         </div>

//         {/* 统计卡片 */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//           <Card>
//             <CardContent className="p-4">
//               <div className="flex items-center gap-2">
//                 <Package className="h-4 w-4 text-blue-600" />
//                 <div>
//                   <p className="text-sm font-medium text-muted-foreground">总库存项目</p>
//                   <p className="text-2xl font-bold">{stats.totalItems}</p>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//           <Card>
//             <CardContent className="p-4">
//               <div className="flex items-center gap-2">
//                 <AlertTriangle className="h-4 w-4 text-red-600" />
//                 <div>
//                   <p className="text-sm font-medium text-muted-foreground">低库存预警</p>
//                   <p className="text-2xl font-bold text-red-600">{stats.lowStockItems}</p>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//           <Card>
//             <CardContent className="p-4">
//               <div className="flex items-center gap-2">
//                 <TrendingUp className="h-4 w-4 text-green-600" />
//                 <div>
//                   <p className="text-sm font-medium text-muted-foreground">总库存数量</p>
//                   <p className="text-2xl font-bold text-green-600">{stats.totalOnHand}</p>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//           <Card>
//             <CardContent className="p-4">
//               <div className="flex items-center gap-2">
//                 <TrendingDown className="h-4 w-4 text-orange-600" />
//                 <div>
//                   <p className="text-sm font-medium text-muted-foreground">库存总价值</p>
//                   <p className="text-2xl font-bold">¥{stats.totalValue.toLocaleString()}</p>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         {/* 低库存预警 */}
//         {stats.lowStockItems > 0 && (
//           <Alert className="border-orange-200 bg-orange-50">
//             <AlertTriangle className="h-4 w-4 text-orange-600" />
//             <AlertDescription className="text-orange-800">
//               发现 <strong>{stats.lowStockItems}</strong> 个产品库存偏低，需要及时补货。
//             </AlertDescription>
//           </Alert>
//         )}

//         {/* 地区和仓库筛选 */}
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <MapPin className="h-5 w-5" />
//               地区和仓库筛选
//             </CardTitle>
//             <CardDescription>选择特定地区和仓库查看库存，表格支持强大的搜索和筛选功能</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               {/* 地区选择 */}
//               <Select
//                 value={selectedRegion}
//                 onValueChange={(value) => {
//                   setSelectedRegion(value)
//                   setSelectedWarehouse("all") // 重置仓库选择
//                 }}
//               >
//                 <SelectTrigger>
//                   <MapPin className="h-4 w-4 mr-2" />
//                   <SelectValue placeholder="选择地区" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">所有地区</SelectItem>
//                   {mockRegions.map((region) => (
//                     <SelectItem key={region.id} value={region.id.toString()}>
//                       {region.name}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>

//               {/* 仓库选择 */}
//               <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
//                 <SelectTrigger>
//                   <Building2 className="h-4 w-4 mr-2" />
//                   <SelectValue placeholder="选择仓库" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">所有仓库</SelectItem>
//                   {availableWarehouses.map((warehouse) => (
//                     <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
//                       {warehouse.name} ({warehouse.location})
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//           </CardContent>
//         </Card>

//         {/* MaterialReactTable */}
//         <Card>
//           <CardContent className="p-0">
//             <MaterialReactTable table={table} />
//           </CardContent>
//         </Card>

//         {/* 库存详情抽屉 */}
//         <Sheet open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
//           <SheetContent className="w-[400px] sm:w-[540px]">
//             {selectedItem && (
//               <>
//                 <SheetHeader>
//                   <SheetTitle className="flex items-center gap-2">
//                     <Info className="h-5 w-5" />
//                     库存详情
//                   </SheetTitle>
//                   <SheetDescription>
//                     {selectedItem.product_code} - {selectedItem.product_name}
//                   </SheetDescription>
//                 </SheetHeader>

//                 <div className="mt-6 space-y-6">
//                   {/* 基本信息 */}
//                   <div>
//                     <h3 className="text-lg font-semibold mb-3">基本信息</h3>
//                     <div className="space-y-3">
//                       <div className="flex justify-between">
//                         <span className="text-muted-foreground">产品代码:</span>
//                         <span className="font-mono">{selectedItem.product_code}</span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span className="text-muted-foreground">产品名称:</span>
//                         <span>{selectedItem.product_name}</span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span className="text-muted-foreground">分类:</span>
//                         <Badge variant="outline">{selectedItem.category}</Badge>
//                       </div>
//                     </div>
//                   </div>

//                   {/* 位置信息 */}
//                   <div>
//                     <h3 className="text-lg font-semibold mb-3">位置信息</h3>
//                     <div className="space-y-3">
//                       <div className="flex justify-between">
//                         <span className="text-muted-foreground">地区:</span>
//                         <span>{selectedItem.region_name}</span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span className="text-muted-foreground">仓库:</span>
//                         <span>{selectedItem.warehouse_name}</span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span className="text-muted-foreground">仓库地址:</span>
//                         <span className="text-right">{selectedItem.warehouse_location}</span>
//                       </div>
//                     </div>
//                   </div>

//                   {/* 库存信息 */}
//                   <div>
//                     <h3 className="text-lg font-semibold mb-3">库存信息</h3>
//                     <div className="space-y-3">
//                       <div className="flex justify-between">
//                         <span className="text-muted-foreground">在库量:</span>
//                         <span className="font-semibold text-blue-600">{selectedItem.on_hand}</span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span className="text-muted-foreground">锁定量:</span>
//                         <span className="font-semibold text-orange-600">{selectedItem.reserved}</span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span className="text-muted-foreground">可用量:</span>
//                         <span className={`font-semibold ${selectedItem.low_stock ? "text-red-600" : "text-green-600"}`}>
//                           {selectedItem.available}
//                         </span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span className="text-muted-foreground">安全库存:</span>
//                         <span>{selectedItem.threshold}</span>
//                       </div>
//                     </div>
//                   </div>

//                   {/* 价值信息 */}
//                   <div>
//                     <h3 className="text-lg font-semibold mb-3">价值信息</h3>
//                     <div className="space-y-3">
//                       <div className="flex justify-between">
//                         <span className="text-muted-foreground">单价:</span>
//                         <span>¥{selectedItem.unit_price.toLocaleString()}</span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span className="text-muted-foreground">总价值:</span>
//                         <span className="font-semibold">¥{selectedItem.total_value.toLocaleString()}</span>
//                       </div>
//                     </div>
//                   </div>

//                   {/* 操作信息 */}
//                   <div>
//                     <h3 className="text-lg font-semibold mb-3">操作信息</h3>
//                     <div className="space-y-3">
//                       <div className="flex justify-between">
//                         <span className="text-muted-foreground">最后更新:</span>
//                         <span>{new Date(selectedItem.last_updated).toLocaleString()}</span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span className="text-muted-foreground">操作员:</span>
//                         <span>{selectedItem.operator}</span>
//                       </div>
//                     </div>
//                   </div>

//                   {/* 操作按钮 */}
//                   <div className="flex gap-2 pt-4">
//                     <Button className="flex-1">
//                       <Plus className="h-4 w-4 mr-2" />
//                       入库
//                     </Button>
//                     <Button variant="outline" className="flex-1 bg-transparent">
//                       <Minus className="h-4 w-4 mr-2" />
//                       出库
//                     </Button>
//                     <Button variant="outline">
//                       <History className="h-4 w-4 mr-2" />
//                       历史
//                     </Button>
//                   </div>
//                 </div>
//               </>
//             )}
//           </SheetContent>
//         </Sheet>
//       </div>
//     </LocalizationProvider>
//   )
// }
"use client"

import { useState, useMemo } from "react"
import { MaterialReactTable, useMaterialReactTable, type MRT_ColumnDef } from "material-react-table"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { toast } from "@/hooks/use-toast"
import { useGetRegionsQuery } from "../region/regionApi"
import { type Region } from "../customer/types"
import {
  type InventoryItem,
  type InventoryStats,
  type InventoryQueryParams,
  type ProductCategory,
  type InventoryStatus,
  type StockAlertLevel,
} from "./types"
import {
  AlertTriangle,
  Eye,
  History,
  Plus,
  Minus,
  MapPin,
  Building2,
  Settings,
  Info,
  WarehouseIcon,
  RefreshCw,
  Download,
  FilterX,
} from "lucide-react"


// --- 模拟数据 ---
const mockRegions: Region[] = [
  {
    id: 1,
    name: "华东地区",
    warehouses: [
      { id: 1, name: "上海仓" },
      { id: 2, name: "杭州仓" },
      { id: 3, name: "南京仓" },
    ],
  },
  {
    id: 2,
    name: "华北地区",
    warehouses: [
      { id: 4, name: "北京仓" },
      { id: 5, name: "天津仓" },
    ],
  },
  {
    id: 3,
    name: "华南地区",
    warehouses: [
      { id: 6, name: "深圳仓" },
      { id: 7, name: "广州仓" },
    ],
  },
]

const mockInventoryData: InventoryItem[] = [
  {
    id: 1,
    product_id: 101,
    product_code: "DJJ-001",
    product_name: "挖掘机液压泵",
    product_description: "高压液压泵，适用于大型挖掘机",
    category: "Machine",
    status: "active",
    region_id: 1,
    region_name: "华东地区",
    warehouse_id: 1,
    warehouse_name: "上海仓",
    warehouse_code: "SH001",
    warehouse_location: "上海市浦东新区",
    region_warehouse: "华东地区 - 上海仓",
    on_hand: 25,
    reserved: 5,
    available: 20,
    in_transit: 2,
    allocated: 3,
    threshold: 10,
    min_stock: 5,
    max_stock: 50,
    reorder_point: 15,
    reorder_quantity: 20,
    unit_price: 15000,
    cost_price: 12000,
    total_value: 375000,
    total_cost: 300000,
    low_stock: false,
    alert_level: "normal",
    last_updated: "2024-07-10T10:30:00Z",
    created_at: "2024-01-01T00:00:00Z",
    operator: "张三",
    operator_id: 1,
    unit: "台",
    supplier_id: 1,
    supplier_name: "华东机械供应商",
    version: 1,
    is_active: true,
  },
  {
    id: 2,
    product_id: 102,
    product_code: "DJJ-002",
    product_name: "发动机滤芯",
    product_description: "高效过滤发动机杂质",
    category: "Parts",
    status: "active",
    region_id: 1,
    region_name: "华东地区",
    warehouse_id: 2,
    warehouse_name: "杭州仓",
    warehouse_code: "HZ001",
    warehouse_location: "杭州市余杭区",
    region_warehouse: "华东地区 - 杭州仓",
    on_hand: 8,
    reserved: 2,
    available: 6,
    in_transit: 0,
    allocated: 2,
    threshold: 10,
    min_stock: 5,
    max_stock: 100,
    reorder_point: 12,
    reorder_quantity: 50,
    unit_price: 150,
    cost_price: 100,
    total_value: 1200,
    total_cost: 800,
    low_stock: true,
    alert_level: "low",
    last_updated: "2024-07-09T09:15:00Z",
    created_at: "2024-01-01T00:00:00Z",
    operator: "李四",
    operator_id: 2,
    unit: "个",
    supplier_id: 2,
    supplier_name: "华东配件供应商",
    version: 1,
    is_active: true,
  },
  {
    id: 3,
    product_id: 103,
    product_code: "DJJ-003",
    product_name: "履带链条",
    product_description: "耐磨履带链条，适用于各种地形",
    category: "Parts",
    status: "active",
    region_id: 2,
    region_name: "华北地区",
    warehouse_id: 4,
    warehouse_name: "北京仓",
    warehouse_code: "BJ001",
    warehouse_location: "北京市大兴区",
    region_warehouse: "华北地区 - 北京仓",
    on_hand: 50,
    reserved: 10,
    available: 40,
    in_transit: 5,
    allocated: 8,
    threshold: 15,
    min_stock: 10,
    max_stock: 80,
    reorder_point: 20,
    reorder_quantity: 30,
    unit_price: 800,
    cost_price: 650,
    total_value: 40000,
    total_cost: 32500,
    low_stock: false,
    alert_level: "normal",
    last_updated: "2024-07-10T11:45:00Z",
    created_at: "2024-01-01T00:00:00Z",
    operator: "王五",
    operator_id: 3,
    unit: "套",
    supplier_id: 3,
    supplier_name: "华北重工供应商",
    version: 1,
    is_active: true,
  },
  {
    id: 4,
    product_id: 104,
    product_code: "DJJ-004",
    product_name: "液压油管",
    category: "Accessories",
    region_id: 3,
    region_name: "华南地区",
    warehouse_id: 6,
    warehouse_name: "深圳仓",
    warehouse_location: "深圳市宝安区",
    region_warehouse: "华南地区 - 深圳仓",
    on_hand: 5,
    reserved: 1,
    available: 4,
    low_stock: true,
    threshold: 8,
    unit_price: 200,
    total_value: 1000,
    last_updated: "2024-07-08T14:20:00Z",
    operator: "赵六",
  },
  {
    id: 5,
    product_id: 105,
    product_code: "DJJ-005",
    product_name: "工具箱套装",
    category: "Tools",
    region_id: 2,
    region_name: "华北地区",
    warehouse_id: 5,
    warehouse_name: "天津仓",
    warehouse_location: "天津市滨海新区",
    region_warehouse: "华北地区 - 天津仓",
    on_hand: 30,
    reserved: 3,
    available: 27,
    low_stock: false,
    threshold: 12,
    unit_price: 500,
    total_value: 15000,
    last_updated: "2024-07-09T16:10:00Z",
    operator: "孙七",
  },
  {
    id: 6,
    product_id: 106,
    product_code: "DJJ-006",
    product_name: "挖斗齿",
    category: "Parts",
    region_id: 1,
    region_name: "华东地区",
    warehouse_id: 3,
    warehouse_name: "南京仓",
    warehouse_location: "南京市江宁区",
    region_warehouse: "华东地区 - 南京仓",
    on_hand: 120,
    reserved: 20,
    available: 100,
    low_stock: false,
    threshold: 30,
    unit_price: 80,
    total_value: 9600,
    last_updated: "2024-07-10T13:25:00Z",
    operator: "钱八",
  },
  {
    id: 7,
    product_id: 107,
    product_code: "DJJ-007",
    product_name: "液压缸密封件",
    category: "Parts",
    region_id: 3,
    region_name: "华南地区",
    warehouse_id: 7,
    warehouse_name: "广州仓",
    warehouse_location: "广州市黄埔区",
    region_warehouse: "华南地区 - 广州仓",
    on_hand: 3,
    reserved: 0,
    available: 3,
    low_stock: true,
    threshold: 5,
    unit_price: 300,
    total_value: 900,
    last_updated: "2024-07-07T15:40:00Z",
    operator: "周九",
  },
]

// --- 主页面组件 ---
function InventoryOverviewPage() {
  const [selectedRegion, setSelectedRegion] = useState<string>("all")
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("all")
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [filterMode, setFilterMode] = useState<"all" | "low_stock" | "low_stock_machines">("all")
  const { data: regions=[] } = useGetRegionsQuery()
  console.log(regions);
  
  const availableWarehouses = useMemo(() => {
    if (selectedRegion === "all") return regions.flatMap((r) => r.warehouses)
    return regions.find((r) => r.id.toString() === selectedRegion)?.warehouses || []
  }, [selectedRegion])
  console.log(selectedRegion);
  const baseFilteredData = useMemo(() => {
    return mockInventoryData.filter((item) => {
      const matchesRegion = selectedRegion === "all" || item.region_id.toString() === selectedRegion
      const matchesWarehouse = selectedWarehouse === "all" || item.warehouse_id.toString() === selectedWarehouse
      return matchesRegion && matchesWarehouse
    })
  }, [selectedRegion, selectedWarehouse])

  const filteredData = useMemo(() => {
    if (filterMode === "low_stock") {
      return baseFilteredData.filter((item) => item.low_stock)
    }
    if (filterMode === "low_stock_machines") {
      return baseFilteredData.filter((item) => item.low_stock && item.category === "Machine")
    }
    return baseFilteredData
  }, [baseFilteredData, filterMode])

  const lowStockItems = useMemo(() => baseFilteredData.filter((item) => item.low_stock), [baseFilteredData])
  const lowStockMachines = useMemo(() => lowStockItems.filter((item) => item.category === "Machine"), [lowStockItems])

  const columns = useMemo<MRT_ColumnDef<InventoryItem>[]>(
    () => [
      {
        accessorKey: "product_code",
        header: "产品代码",
        size: 120,
        Cell: ({ cell }) => <span className="font-mono text-blue-600">{cell.getValue<string>()}</span>,
      },
      {
        accessorKey: "product_name",
        header: "产品名称",
        size: 200,
        Cell: ({ cell, row }) => (
          <div>
            <p className="font-bold text-gray-800">{cell.getValue<string>()}</p>
            <p className="text-xs text-gray-500">ID: {row.original.product_id}</p>
          </div>
        ),
      },
      {
        accessorKey: "category",
        header: "分类",
        filterVariant: "select",
        filterSelectOptions: ["Machine", "Parts", "Tools", "Accessories"],
        size: 120,
        Cell: ({ cell }) => {
          const cat = cell.getValue<string>()
          const colors: Record<string, string> = {
            Machine: "bg-orange-100 text-orange-700",
            Parts: "bg-blue-100 text-blue-700",
            Tools: "bg-green-100 text-green-700",
            Accessories: "bg-purple-100 text-purple-700",
          }
          return (
            <div className="flex justify-center">
              <Badge
                variant="outline"
                className={`border-none rounded-full px-3 py-1 text-xs font-semibold ${
                  colors[cat] ?? "bg-gray-100 text-gray-700"
                }`}
              >
                {cat}
              </Badge>
            </div>
          )
        },
      },
      {
        accessorKey: "region_warehouse",
        header: "地区 + 仓库",
        size: 180,
        Cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <WarehouseIcon className="h-4 w-4 text-gray-500 shrink-0" />
            <div>
              <p className="font-medium text-sm">{row.original.region_name}</p>
              <p className="text-xs text-gray-500">{row.original.warehouse_name}</p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "on_hand",
        header: "在库量",
        filterVariant: "range",
        size: 80,
        Cell: ({ cell }) => (
          <span className="font-bold text-blue-700 text-center block">{cell.getValue<number>()}</span>
        ),
      },
      {
        accessorKey: "reserved",
        header: "锁定量",
        filterVariant: "range",
        size: 80,
        Cell: ({ cell }) => (
          <span className="font-bold text-orange-600 text-center block">{cell.getValue<number>()}</span>
        ),
      },
      {
        accessorKey: "available",
        header: "可用量",
        filterVariant: "range",
        size: 80,
        Cell: ({ cell, row }) => {
          if (row.original.low_stock) {
            return (
              <div className="flex justify-center">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500 px-3 py-1 text-sm font-semibold text-white">
                  <AlertTriangle className="h-4 w-4" />
                  {cell.getValue<number>()}
                </span>
              </div>
            )
          }
          return <span className="block text-center font-bold text-green-600">{cell.getValue<number>()}</span>
        },
      },
      {
        id: "last_update",
        header: "最后更新",
        size: 180,
        accessorFn: (row) => ({ operator: row.operator, time: row.last_updated }),
        Cell: ({ cell }) => {
          const { operator, time } = cell.getValue<{ operator: string; time: string }>()
          const formattedTime = new Date(time).toLocaleString("zh-CN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })
          return (
            <div className="text-xs">
              <p className="font-semibold">{operator}</p>
              <p className="text-gray-500">{formattedTime}</p>
            </div>
          )
        },
      },
    ],
    [],
  )

  const table = useMaterialReactTable({
    columns,
    data: filteredData,
    enableRowSelection: true,
    enableColumnFilterModes: true,
    enableColumnOrdering: true,
    enableRowActions: true,
    initialState: { density: "compact", showGlobalFilter: true },
    muiTablePaperProps: {
      elevation: 0,
      sx: {
        borderRadius: "0.75rem",
        border: "1px solid #e2e8f0",
        overflow: "hidden",
      },
    },
    muiTableBodyRowProps: ({ row }) => ({
      onClick: () => setSelectedItem(row.original),
      sx: {
        cursor: "pointer",
      },
    }),
    renderTopToolbarCustomActions: () => (
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => {}}>
          <RefreshCw className="h-4 w-4 mr-2" />
          刷新
        </Button>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          导出
        </Button>
      </div>
    ),
    positionActionsColumn: "last",
    renderRowActionMenuItems: ({ row, closeMenu }) => [
      <div
        key="view"
        onClick={() => {
          setSelectedItem(row.original)
          closeMenu()
        }}
        className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer"
      >
        <Eye className="h-4 w-4 text-blue-600" />
        查看详情
      </div>,
      <div
        key="history"
        onClick={() => {
          toast({ title: "查看交易历史" })
          closeMenu()
        }}
        className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer"
      >
        <History className="h-4 w-4 text-gray-600" />
        交易历史
      </div>,
      <div
        key="in"
        onClick={() => {
          toast({ title: "入库操作" })
          closeMenu()
        }}
        className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer"
      >
        <Plus className="h-4 w-4 text-green-600" />
        入库
      </div>,
      <div
        key="out"
        onClick={() => {
          toast({ title: "出库操作" })
          closeMenu()
        }}
        className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer"
      >
        <Minus className="h-4 w-4 text-red-600" />
        出库
      </div>,
    ],
    muiTableHeadCellProps: {
      sx: {
        fontWeight: "700",
        fontSize: "0.875rem",
        backgroundColor: "rgb(248 250 252)",
      },
    },
  })

  return (
    <div className="p-2 bg-gray-50 min-h-screen">
      <div className="space-y-6 bg-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">库存总览</h1>
            <p className="text-muted-foreground">管理和监控所有地区仓库的库存情况</p>
          </div>
          {/* <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            页面设置
          </Button> */}
        </div>

        <Card className="shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-5 w-5 text-gray-500" />
              地区和仓库筛选
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                value={selectedRegion}
                onValueChange={(v) => {
                  setSelectedRegion(v)
                  setSelectedWarehouse("all")
                  setFilterMode("all")
                }}
              >
                <SelectTrigger>
                  <MapPin className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="选择地区" />
                </SelectTrigger>
                <SelectContent>
                  {mockRegions.map((r) => (
                    <SelectItem key={r.id} value={r.id.toString()}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={selectedWarehouse}
                onValueChange={(v) => {
                  setSelectedWarehouse(v)
                  setFilterMode("all")
                }}
              >
                <SelectTrigger>
                  <Building2 className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="选择仓库" />
                </SelectTrigger>
                <SelectContent>
                  {availableWarehouses.map((w) => (
                    <SelectItem key={w.id} value={w.id.toString()}>
                      {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {lowStockItems.length > 0 && (
          <Card className="shadow-sm rounded-xl border-l-4 border-yellow-400">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                库存预警
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                发现 <span className="font-bold text-red-600">{lowStockItems.length}</span> 个产品库存偏低
                {lowStockMachines.length > 0 && (
                  <>
                    , 其中 <span className="font-bold text-orange-600">{lowStockMachines.length}</span> 个为
                    <span className="font-semibold">【主机】</span>类产品
                  </>
                )}
                。请及时处理。
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Button
                  variant={filterMode === "low_stock" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterMode("low_stock")}
                >
                  查看全部低库存
                </Button>
                {lowStockMachines.length > 0 && (
                  <Button
                    variant={filterMode === "low_stock_machines" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterMode("low_stock_machines")}
                  >
                    查看主机低库存
                  </Button>
                )}
                {filterMode !== "all" && (
                  <Button variant="ghost" size="sm" onClick={() => setFilterMode("all")}>
                    <FilterX className="h-4 w-4 mr-2" />
                    清除筛选
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <MaterialReactTable table={table} />

        <Sheet open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
          <SheetContent className="w-[400px] sm:w-[540px]">
            {selectedItem && (
              <>
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    库存详情
                  </SheetTitle>
                  <SheetDescription>
                    {selectedItem.product_code} - {selectedItem.product_name}
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-4 text-sm">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">基本信息</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">产品代码:</span>
                        <span className="font-mono">{selectedItem.product_code}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">产品名称:</span>
                        <span>{selectedItem.product_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">分类:</span>
                        <Badge variant="outline">{selectedItem.category}</Badge>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-3">位置信息</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">地区:</span>
                        <span>{selectedItem.region_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">仓库:</span>
                        <span>{selectedItem.warehouse_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">仓库地址:</span>
                        <span className="text-right">{selectedItem.warehouse_location}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-3">库存信息</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">在库量:</span>
                        <span className="font-semibold text-blue-600">{selectedItem.on_hand}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">锁定量:</span>
                        <span className="font-semibold text-orange-600">{selectedItem.reserved}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">可用量:</span>
                        <span
                          className={
                            selectedItem.low_stock ? "font-semibold text-red-600" : "font-semibold text-green-600"
                          }
                        >
                          {selectedItem.available}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">安全库存:</span>
                        <span>{selectedItem.threshold}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button className="flex-1">
                      <Plus className="h-4 w-4 mr-2" />
                      入库
                    </Button>
                    <Button variant="outline" className="flex-1 bg-transparent">
                      <Minus className="h-4 w-4 mr-2" />
                      出库
                    </Button>
                    <Button variant="outline">
                      <History className="h-4 w-4 mr-2" />
                      历史
                    </Button>
                  </div>
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}

// --- 最终导出 ---
export default function Page() {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <InventoryOverviewPage />
    </LocalizationProvider>
  )
}
