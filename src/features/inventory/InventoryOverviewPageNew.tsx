"use client"

import { useState, useMemo, useEffect } from "react"
import { MaterialReactTable, useMaterialReactTable, type MRT_ColumnDef } from "material-react-table"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "@/hooks/use-toast"
import {
  type InventoryItem,
  type InventoryStats,
  type InventoryQueryParams,
  type ProductCategory,
  type StockAlertLevel,
  type PaginatedResponse,
  type Region,
} from "./types"
import {
  useGetInventoryItemsQuery,
  useGetInventoryStatsQuery,
  useGetRegionsWithWarehousesQuery,
} from "./inventoryApi"
import {
  AlertTriangle,
  Eye,
  History,
  Plus,
  Minus,
  MapPin,
  Building2,
  Info,
  WarehouseIcon,
  RefreshCw,
  Download,
  FilterX,
  Package,
  TrendingUp,
  TrendingDown,
} from "lucide-react"

// === 地区和仓库接口定义 ===
// 使用类型定义文件中的接口

// === 模拟数据 ===
// 已替换为RTK Query接口调用

// === 主页面组件 ===
function InventoryOverviewPageNew() {
  // === 状态管理 ===
  const [selectedRegion, setSelectedRegion] = useState<string>("all")
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("all")
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [filterMode, setFilterMode] = useState<"all" | "low_stock" | "critical">("all")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  // === RTK Query数据获取 ===
  
  // 构建查询参数
  const queryParams = useMemo((): InventoryQueryParams => {
    const params: InventoryQueryParams = {
      page,
      page_size: pageSize,
    }
    
    if (selectedRegion !== "all") {
      params.region_id = parseInt(selectedRegion)
    }
    
    if (selectedWarehouse !== "all") {
      params.warehouse_id = parseInt(selectedWarehouse)
    }
    
    if (filterMode === "low_stock") {
      params.low_stock = true
    }
    
    return params
  }, [selectedRegion, selectedWarehouse, filterMode, page, pageSize])

  // 获取地区数据
  const { data: regionsResponse, isLoading: regionsLoading } = useGetRegionsWithWarehousesQuery()
  
  // 获取库存数据
  const { data: inventoryResponse, isLoading: inventoryLoading, error: inventoryError } = useGetInventoryItemsQuery(queryParams)
  console.log(inventoryResponse);
  
  // 获取统计数据
  const { data: statsResponse, isLoading: statsLoading } = useGetInventoryStatsQuery(queryParams)
  
  // 提取数据
  const regions = regionsResponse?.data || []
  const inventoryData = inventoryResponse?.data || { data: [], pagination: { current_page: 1, page_size: 20, total_items: 0, total_pages: 0, has_next: false, has_prev: false } }
  const stats = statsResponse?.data || {
    total_items: 0,
    total_products: 0,
    total_value: 0,
    total_cost: 0,
    active_items: 0,
    inactive_items: 0,
    low_stock_items: 0,
    out_of_stock_items: 0,
    critical_alerts: 0,
    low_stock_alerts: 0,
    by_category: {},
    by_region: {},
    by_warehouse: {},
    date_range: { start: '', end: '' }
  }
  
  // 是否正在加载
  const isLoading = inventoryLoading || statsLoading || regionsLoading

  // === 仓库联动逻辑 ===
  const availableWarehouses = useMemo(() => {
    if (selectedRegion === "all") {
      // 返回所有地区的所有仓库
      return regions.flatMap((region) => 
        region.warehouses.map(warehouse => ({
          ...warehouse,
          displayName: `${region.name} - ${warehouse.name}`,
          regionName: region.name
        }))
      )
    }
    
    // 返回选中地区的仓库
    const region = regions.find((r) => r.id.toString() === selectedRegion)
    return region?.warehouses.map(warehouse => ({
      ...warehouse,
      displayName: warehouse.name,
      regionName: region.name
    })) || []
  }, [selectedRegion, regions])

  // === 数据筛选逻辑 ===
  // 由于使用RTK Query，筛选逻辑已移到查询参数中
  const filteredData = inventoryData?.data ?? []
  
  // === 统计信息 ===
  const enhancedStats = useMemo(() => {
    const totalOnHand = filteredData.reduce((sum, item) => sum + item.on_hand, 0)
    const totalReserved = filteredData.reduce((sum, item) => sum + item.reserved, 0)
    const totalAvailable = filteredData.reduce((sum, item) => sum + item.available, 0)
    const lowStockItems = filteredData.filter((item) => item.low_stock)
    const criticalItems = filteredData.filter((item) => item.alert_level === "critical")

    return {
      totalItems: stats.total_items,
      lowStockItems: stats.low_stock_items,
      criticalItems: stats.critical_alerts,
      totalValue: stats.total_value,
      totalOnHand,
      totalReserved,
      totalAvailable,
      lowStockDetails: lowStockItems,
      criticalDetails: criticalItems,
    }
  }, [stats, filteredData])

  // === 地区选择变化处理 ===
  const handleRegionChange = (regionValue: string) => {
    setSelectedRegion(regionValue)
    setSelectedWarehouse("all") // 重置仓库选择
    setFilterMode("all") // 重置筛选模式
    setPage(1) // 重置页码
  }

  // === 仓库选择变化处理 ===
  const handleWarehouseChange = (warehouseValue: string) => {
    setSelectedWarehouse(warehouseValue)
    setFilterMode("all") // 重置筛选模式
    setPage(1) // 重置页码
  }

  // === 筛选模式变化处理 ===
  const handleFilterModeChange = (mode: "all" | "low_stock" | "critical") => {
    setFilterMode(mode)
    setPage(1) // 重置页码
  }

  // === 刷新数据 ===
  const handleRefresh = () => {
    // RTK Query会自动重新获取数据
    toast({
      title: "数据已刷新",
      description: "库存数据已更新到最新状态",
    })
  }

  // === 表格列定义 ===
  const columns = useMemo<MRT_ColumnDef<InventoryItem>[]>(
    () => [
      {
        accessorKey: "product_code",
        header: "产品代码",
        size: 120,
        Cell: ({ cell }) => (
          <span className="font-mono text-blue-600 font-medium">
            {cell.getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: "product_name",
        header: "产品名称",
        size: 200,
        Cell: ({ cell, row }) => (
          <div>
            <p className="font-bold text-gray-800">{cell.getValue<string>()}</p>
            <p className="text-xs text-gray-500">ID: {row.original.product_id}</p>
            {row.original.product_description && (
              <p className="text-xs text-gray-400 truncate max-w-40">
                {row.original.product_description}
              </p>
            )}
          </div>
        ),
      },
      {
        accessorKey: "category",
        header: "分类",
        filterVariant: "select",
        filterSelectOptions: ["Machine", "Parts", "Tools", "Accessories", "Consumables"],
        size: 120,
        Cell: ({ cell }) => {
          const category = cell.getValue<ProductCategory>()
          const colorMap: Record<ProductCategory, string> = {
            Machine: "bg-orange-100 text-orange-700 border-orange-200",
            Parts: "bg-blue-100 text-blue-700 border-blue-200",
            Tools: "bg-green-100 text-green-700 border-green-200",
            Accessories: "bg-purple-100 text-purple-700 border-purple-200",
            Consumables: "bg-gray-100 text-gray-700 border-gray-200",
          }
          return (
            <div className="flex justify-center">
              <Badge
                variant="outline"
                className={`rounded-full px-3 py-1 text-xs font-semibold ${colorMap[category]}`}
              >
                {category}
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
              <p className="text-xs text-gray-500">
                {row.original.warehouse_name}
                {row.original.warehouse_code && (
                  <span className="ml-1 text-gray-400">({row.original.warehouse_code})</span>
                )}
              </p>
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
          <span className="font-bold text-blue-700 text-center block">
            {cell.getValue<number>()}
          </span>
        ),
      },
      {
        accessorKey: "reserved",
        header: "锁定量",
        filterVariant: "range",
        size: 80,
        Cell: ({ cell }) => (
          <span className="font-bold text-orange-600 text-center block">
            {cell.getValue<number>()}
          </span>
        ),
      },
      {
        accessorKey: "available",
        header: "可用量",
        filterVariant: "range",
        size: 80,
        Cell: ({ cell, row }) => {
          const value = cell.getValue<number>()
          const alertLevel = row.original.alert_level
          
          if (alertLevel === "critical") {
            return (
              <div className="flex justify-center">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500 px-3 py-1 text-sm font-semibold text-white">
                  <AlertTriangle className="h-3 w-3" />
                  {value}
                </span>
              </div>
            )
          }
          
          if (alertLevel === "low") {
            return (
              <div className="flex justify-center">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-500 px-3 py-1 text-sm font-semibold text-white">
                  <AlertTriangle className="h-3 w-3" />
                  {value}
                </span>
              </div>
            )
          }
          
          return (
            <span className="block text-center font-bold text-green-600">
              {value}
            </span>
          )
        },
      },
      {
        accessorKey: "unit_price",
        header: "单价",
        filterVariant: "range",
        size: 100,
        Cell: ({ cell }) => (
          <span className="font-medium">
            ¥{cell.getValue<number>().toLocaleString()}
          </span>
        ),
      },
      {
        accessorKey: "total_value",
        header: "总价值",
        filterVariant: "range",
        size: 120,
        Cell: ({ cell }) => (
          <span className="font-bold text-green-600">
            ¥{cell.getValue<number>().toLocaleString()}
          </span>
        ),
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

  // === 表格配置 ===
  const table = useMaterialReactTable({
    columns,
    data: filteredData,
    enableRowSelection: true,
    enableColumnFilterModes: true,
    enableColumnOrdering: true,
    enableRowActions: true,
    enableStickyHeader: true,
    enableDensityToggle: true,
    enableFullScreenToggle: true,
    enableGlobalFilter: true,
    enableColumnFilters: true,
    enableSorting: true,
    enablePagination: true,
    
    // 服务器端分页
    manualPagination: true,
    rowCount: inventoryData.pagination.total_items,
    
    state: {
      isLoading,
      pagination: {
        pageIndex: page - 1,
        pageSize: pageSize,
      },
    },
    
    onPaginationChange: (updater) => {
      const newPagination = typeof updater === 'function' 
        ? updater({ pageIndex: page - 1, pageSize: pageSize })
        : updater
      
      setPage(newPagination.pageIndex + 1)
      setPageSize(newPagination.pageSize)
    },
    
    initialState: { 
      density: "compact", 
      showGlobalFilter: true,
      columnPinning: {
        left: ["mrt-row-select", "product_code"],
        right: ["mrt-row-actions"],
      },
    },
    
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
        "&:hover": {
          backgroundColor: "rgba(0, 0, 0, 0.04)",
        },
      },
    }),
    
    muiTableHeadCellProps: {
      sx: {
        fontWeight: "700",
        fontSize: "0.875rem",
        backgroundColor: "rgb(248 250 252)",
      },
    },
    
    renderTopToolbarCustomActions: () => (
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
        >
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
          toast({ title: "查看交易历史", description: `正在加载 ${row.original.product_name} 的交易历史` })
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
          toast({ title: "入库操作", description: `正在处理 ${row.original.product_name} 的入库操作` })
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
          toast({ title: "出库操作", description: `正在处理 ${row.original.product_name} 的出库操作` })
          closeMenu()
        }}
        className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer"
      >
        <Minus className="h-4 w-4 text-red-600" />
        出库
      </div>,
    ],
  })

  return (
    <div className="p-2 bg-gray-50 min-h-screen">
      <div className="space-y-6 bg-white p-4 rounded-lg shadow-sm">
        {/* === 页面标题 === */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">库存总览</h1>
            <p className="text-muted-foreground">
              管理和监控所有地区仓库的库存情况
              {selectedRegion !== "all" && (
                <span className="ml-2 text-blue-600">
                  - 当前筛选: {regions.find(r => r.id.toString() === selectedRegion)?.name}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* === 统计卡片 === */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">总库存项目</p>
                  <p className="text-2xl font-bold text-gray-900">{enhancedStats.totalItems}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">低库存预警</p>
                  <p className="text-2xl font-bold text-red-600">{enhancedStats.lowStockItems}</p>
                  {enhancedStats.criticalItems > 0 && (
                    <p className="text-xs text-red-500">其中 {enhancedStats.criticalItems} 个紧急</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">总库存数量</p>
                  <p className="text-2xl font-bold text-green-600">{enhancedStats.totalOnHand}</p>
                  <p className="text-xs text-gray-500">可用: {enhancedStats.totalAvailable}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingDown className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">库存总价值</p>
                  <p className="text-2xl font-bold text-purple-600">${enhancedStats.totalValue?.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">锁定: {enhancedStats.totalReserved}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* === 库存预警 === */}
        {(enhancedStats.lowStockItems > 0 || enhancedStats.criticalItems > 0) && (
          <Card className="shadow-sm border-l-4 border-yellow-400">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                库存预警
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {enhancedStats.criticalItems > 0 && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      发现 <span className="font-bold">{enhancedStats.criticalItems}</span> 个产品库存<span className="text-red-600 font-semibold">严重不足</span>，需要立即补货！
                    </AlertDescription>
                  </Alert>
                )}
                
                {enhancedStats.lowStockItems > enhancedStats.criticalItems && (
                  <Alert className="border-yellow-200 bg-yellow-50">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                      发现 <span className="font-bold">{enhancedStats.lowStockItems - enhancedStats.criticalItems}</span> 个产品库存偏低，建议及时补货。
                    </AlertDescription>
                  </Alert>
                )}
              </div>
              
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {enhancedStats.criticalItems > 0 && (
                  <Button
                    variant={filterMode === "critical" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleFilterModeChange("critical")}
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    查看紧急库存 ({enhancedStats.criticalItems})
                  </Button>
                )}
                
                <Button
                  variant={filterMode === "low_stock" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterModeChange("low_stock")}
                  className="border-yellow-300 text-yellow-600 hover:bg-yellow-50"
                >
                  查看全部低库存 ({enhancedStats.lowStockItems})
                </Button>
                
                {filterMode !== "all" && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleFilterModeChange("all")}
                  >
                    <FilterX className="h-4 w-4 mr-2" />
                    清除筛选
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* === 地区和仓库筛选 === */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-5 w-5 text-gray-500" />
              地区和仓库筛选
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 地区选择 */}
              <Select
                value={selectedRegion}
                onValueChange={handleRegionChange}
              >
                <SelectTrigger>
                  <MapPin className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="选择地区" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有地区</SelectItem>
                  {regions.map((region) => (
                    <SelectItem key={region.id} value={region.id.toString()}>
                      {region.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* 仓库选择 */}
              <Select 
                value={selectedWarehouse} 
                onValueChange={handleWarehouseChange}
              >
                <SelectTrigger>
                  <Building2 className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="选择仓库" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    所有仓库 ({availableWarehouses.length}个)
                  </SelectItem>
                  {availableWarehouses.map((warehouse) => (
                    <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                      {warehouse.displayName}
                      {warehouse.code && (
                        <span className="text-gray-400 ml-1">({warehouse.code})</span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* 选择状态显示 */}
            {(selectedRegion !== "all" || selectedWarehouse !== "all") && (
              <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                <Info className="h-4 w-4" />
                当前显示: 
                {selectedRegion !== "all" && (
                  <Badge variant="outline" className="ml-1">
                    {regions.find(r => r.id.toString() === selectedRegion)?.name}
                  </Badge>
                )}
                {selectedWarehouse !== "all" && (
                  <Badge variant="outline" className="ml-1">
                    {availableWarehouses.find(w => w.id.toString() === selectedWarehouse)?.displayName}
                  </Badge>
                )}
                <span className="text-gray-500">- 共 {inventoryData.pagination.total_items} 项</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* === 库存数据表格 === */}
        <Card className="shadow-sm">
          <CardContent className="p-0">
            <MaterialReactTable table={table} />
          </CardContent>
        </Card>

        {/* === 库存详情抽屉 === */}
        <Sheet open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
          <SheetContent className="w-[400px] sm:w-[540px] h-screen flex flex-col overflow-y-auto">
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
                
                <div className="mt-6 space-y-6 text-sm">
                  {/* 基本信息 */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 border-b pb-2">基本信息</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">产品代码:</span>
                        <span className="font-mono font-medium">{selectedItem.product_code}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">产品名称:</span>
                        <span className="font-medium">{selectedItem.product_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">产品描述:</span>
                        <span className="text-right max-w-60">
                          {selectedItem.product_description || "无"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">分类:</span>
                        <Badge variant="outline">{selectedItem.category}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">单位:</span>
                        <span>{selectedItem.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">状态:</span>
                        <Badge variant={selectedItem.status === "active" ? "default" : "secondary"}>
                          {selectedItem.status === "active" ? "活跃" : "非活跃"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* 位置信息 */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 border-b pb-2">位置信息</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">地区:</span>
                        <span className="font-medium">{selectedItem.region_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">仓库:</span>
                        <span className="font-medium">{selectedItem.warehouse_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">仓库代码:</span>
                        <span className="font-mono">{selectedItem.warehouse_code || "无"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">仓库地址:</span>
                        <span className="text-right max-w-60">{selectedItem.warehouse_location}</span>
                      </div>
                    </div>
                  </div>

                  {/* 库存信息 */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 border-b pb-2">库存信息</h3>
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
                        <span className={`font-semibold ${
                          selectedItem.alert_level === "critical" ? "text-red-600" :
                          selectedItem.alert_level === "low" ? "text-yellow-600" : "text-green-600"
                        }`}>
                          {selectedItem.available}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">在途量:</span>
                        <span className="font-semibold text-purple-600">{selectedItem.in_transit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">已分配:</span>
                        <span className="font-semibold text-gray-600">{selectedItem.allocated}</span>
                      </div>
                    </div>
                  </div>

                  {/* 库存阈值 */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 border-b pb-2">库存阈值</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">安全库存:</span>
                        <span className="font-medium">{selectedItem.threshold}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">最小库存:</span>
                        <span>{selectedItem.min_stock}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">最大库存:</span>
                        <span>{selectedItem.max_stock}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">补货点:</span>
                        <span>{selectedItem.reorder_point}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">补货数量:</span>
                        <span>{selectedItem.reorder_quantity}</span>
                      </div>
                    </div>
                  </div>

                  {/* 价值信息 */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 border-b pb-2">价值信息</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">单价:</span>
                        <span className="font-medium">¥{selectedItem.unit_price.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">成本价:</span>
                        <span>¥{selectedItem.cost_price.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">总价值:</span>
                        <span className="font-semibold text-green-600">
                          ¥{selectedItem.total_value.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">总成本:</span>
                        <span>¥{selectedItem.total_cost.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* 供应商信息 */}
                  {selectedItem.supplier_name && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 border-b pb-2">供应商信息</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">供应商:</span>
                          <span className="font-medium">{selectedItem.supplier_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">供应商ID:</span>
                          <span>{selectedItem.supplier_id}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 操作信息 */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 border-b pb-2">操作信息</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">最后更新:</span>
                        <span>{new Date(selectedItem.last_updated).toLocaleString("zh-CN")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">创建时间:</span>
                        <span>{new Date(selectedItem.created_at).toLocaleString("zh-CN")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">操作员:</span>
                        <span className="font-medium">{selectedItem.operator}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">版本:</span>
                        <span>v{selectedItem.version}</span>
                      </div>
                    </div>
                  </div>

                  {/* 备注信息 */}
                  {selectedItem.notes && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 border-b pb-2">备注信息</h3>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                        {selectedItem.notes}
                      </p>
                    </div>
                  )}

                  {/* 操作按钮 */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button className="flex-1">
                      <Plus className="h-4 w-4 mr-2" />
                      入库
                    </Button>
                    <Button variant="outline" className="flex-1">
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

// === 最终导出组件 ===
export default function InventoryOverviewPageNewWrapper() {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <InventoryOverviewPageNew />
    </LocalizationProvider>
  )
}