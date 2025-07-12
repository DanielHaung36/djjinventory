"use client"
import { useState, useMemo } from "react"
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Package,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Download,
  Upload,
  ImageIcon,
  Loader2,
} from "lucide-react"
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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Area, AreaChart } from "recharts"
import type { Product } from "../types/product"
import { useToast } from "@/hooks/use-toast"
import {
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} from "./productsApi"
import ProductForm from "./product-form"
import { getStatusBadge } from "../../utils/getStatusBadge"
import { fa } from "zod/v4/locales"
const ITEMS_PER_PAGE = 20  // 每页显示数量

export default function ProductManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const { toast } = useToast()

  // RTK Query hooks - 使用后端搜索和过滤
  const offset = (currentPage - 1) * ITEMS_PER_PAGE
  const limit = ITEMS_PER_PAGE
  const [isDeleted,setDelete]=useState(false)
  
  // 传递搜索参数到后端API
  const { data, isLoading } = useGetProductsQuery({ 
    offset, 
    limit,
    search: searchTerm,
    category: categoryFilter,
    status: statusFilter
  })
  
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation()
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation()
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation()

  // 直接使用后端返回的数据，无需前端过滤
  const allProducts = data?.products ?? []
  const totalProducts = data?.total ?? 0

  // Pagination logic - 基于后端返回的总数
  const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE)
  console.log(`显示产品数: ${allProducts.length}, 总产品数: ${totalProducts}`);
  
  // 直接使用后端返回的数据，不进行前端分页
  const paginatedProducts = allProducts

  // Reset to first page when filters change
  useMemo(() => {
    setCurrentPage(1)
  }, [searchTerm, categoryFilter, statusFilter])

  // Statistics - 使用后端返回的总数
  const stats = useMemo(() => {
    // 使用后端返回的真实总产品数
    const actualTotalProducts = totalProducts
    // 当前页面的已发布产品数（这只是当前页面的统计）
    const publishedProducts = allProducts.filter((p) => p.status === "published").length
    const totalSales = allProducts.reduce((sum, p) => sum + (p.total_sales || 0), 0)
    return { totalProducts: actualTotalProducts, activeProducts: publishedProducts, totalSales }
  }, [allProducts, totalProducts])

//   const getStatusBadge = (status: Product["status"]) => {
//     const variants = {
//       Active: "default",
//       Inactive: "secondary",
//       Discontinued: "destructive",
//     } as const
//     return <Badge variant={variants[status]}>{status}</Badge>
//   }

  const getCategoryBadge = (category: Product["category"]) => {
    const colors = {
      Machine: "bg-blue-100 text-blue-800 hover:bg-blue-200",
      Parts: "bg-green-100 text-green-800 hover:bg-green-200",
      Tools: "bg-purple-100 text-purple-800 hover:bg-purple-200",
      Accessories: "bg-orange-100 text-orange-800 hover:bg-orange-200",
    }
    return <Badge className={colors[category]}>{category}</Badge>
  }

  const handleDelete = async (id: number) => {
       setDelete(true)
    
      try {
        await deleteProduct(id).unwrap()
        toast({
          title: "Product Deleted",
          description: "Product has been successfully deleted.",
        })
      } catch (error: any) {
        toast({
          title: "Delete Failed",
          description: error.data?.message || "Failed to delete product.",
          variant: "destructive",
        })
      }
      setDelete(false)
  }

  const handleCreateProduct = async (productData: Omit<Product, "id" | "version" | "created_at" | "updated_at">) => {
    try {
      await createProduct(productData).unwrap()
      setIsCreateDialogOpen(false)
      toast({
        title: "Product Created",
        description: "Product has been successfully created.",
      })
    } catch (error: any) {
      toast({
        title: "Create Failed",
        description: error.data?.message || "Failed to create product.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateProduct = async (productData: Omit<Product, "id" | "version" | "created_at" | "updated_at">) => {
    if (!selectedProduct) return

    try {
      await updateProduct({
        id: selectedProduct.id,
        body: productData,
      }).unwrap()
      setIsEditDialogOpen(false)
      setSelectedProduct(null)
      toast({
        title: "Product Updated",
        description: "Product has been successfully updated.",
      })
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.data?.message || "Failed to update product.",
        variant: "destructive",
      })
    }
  }

  const ProductDetail = ({ product }: { product: Product }) => {
    const primaryImage = product.images.find((img) => img.is_primary) || product.images[0]
    console.log(product);
    
    return (
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex space-x-6">
            {primaryImage && (
              <div className="flex-shrink-0">
                <img
                  src={primaryImage.url || "/placeholder.svg?height=144&width=192"}
                  alt={primaryImage.alt}
                  className="w-48 h-36 object-contain rounded-lg border shadow-sm "
                />
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{product.name_en}</h2>
              <p className="text-gray-600">{product.name_cn}</p>
              <div className="flex items-center space-x-2 mt-2">
                {getStatusBadge(product.status)}
                {getCategoryBadge(product.category)}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-slate-50 border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">Monthly Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">{product.monthly_sales}</div>
              <p className="text-xs text-slate-600">units/month</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-50 border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Total Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800">{product.total_sales}</div>
              <p className="text-xs text-gray-600">units sold</p>
            </CardContent>
          </Card>
          <Card className="bg-stone-50 border-stone-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-stone-700">Profit Margin</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-stone-800">{(product.profit_margin * 100).toFixed(1)}%</div>
              <p className="text-xs text-stone-600">margin</p>
            </CardContent>
          </Card>
          <Card className="bg-neutral-50 border-neutral-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-neutral-700">Price</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-neutral-800">${product.rrp_price.toLocaleString()}</div>
              <p className="text-xs text-neutral-600">{product.currency}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="analytics" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-100">
            <TabsTrigger value="analytics" className="data-[state=active]:bg-white">
              Sales Analytics
            </TabsTrigger>
            <TabsTrigger value="images" className="data-[state=active]:bg-white">
              Images
            </TabsTrigger>
            <TabsTrigger value="details" className="data-[state=active]:bg-white">
              Details
            </TabsTrigger>
            <TabsTrigger value="specs" className="data-[state=active]:bg-white">
              Specifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-800">Sales Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      sales: {
                        label: "Sales",
                        color: "hsl(203, 39%, 44%)",
                      },
                    }}
                    className="h-[300px] w-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={product.sales_data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="month" stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="sales" stroke="hsl(203, 39%, 44%)" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-800">Revenue & Profit</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      revenue: {
                        label: "Revenue",
                        color: "hsl(142, 71%, 45%)",
                      },
                      profit: {
                        label: "Profit",
                        color: "hsl(262, 83%, 58%)",
                      },
                    }}
                    className="h-[300px] w-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={product.sales_data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="month" stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stackId="1"
                          stroke="hsl(142, 31%, 45%)"
                          fill="hsl(142, 31%, 45%)"
                          fillOpacity={0.3}
                        />
                        <Area
                          type="monotone"
                          dataKey="profit"
                          stackId="2"
                          stroke="hsl(262, 43%, 58%)"
                          fill="hsl(262, 43%, 58%)"
                          fillOpacity={0.4}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg text-gray-800">Performance Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="text-3xl font-bold text-slate-700">{product.total_sales}</div>
                    <div className="text-sm text-slate-600 mt-1">Total Sales</div>
                  </div>
                  <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="text-3xl font-bold text-gray-700">
                      ${product.sales_data?.reduce((sum, data) => sum + data.revenue, 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Total Revenue</div>
                  </div>
                  <div className="text-center p-6 bg-stone-50 rounded-lg border border-stone-200">
                    <div className="text-3xl font-bold text-stone-700">
                      ${product.sales_data?.reduce((sum, data) => sum + data.profit, 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-stone-600 mt-1">Total Profit</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="images" className="space-y-4">
            {product.images.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {product.images.map((image) => (
                  <Card key={image.id} className="overflow-hidden border-slate-200">
                    <div className="relative">
                      <img
                        src={image.url || "/placeholder.svg?height=200&width=300"}
                        alt={image.alt}
                        className="w-full h-48 object-contain"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg?height=200&width=300"
                        }}
                      />
                      {image.is_primary && (
                        <Badge className="absolute top-2 left-2 bg-slate-600 hover:bg-slate-700">Primary</Badge>
                      )}
                    </div>
                    <CardContent className="p-3">
                      <p className="text-sm text-gray-600">{image.alt}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <ImageIcon className="h-16 w-16 mx-auto mb-4 opacity-40" />
                <p>No images available for this product.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <Label className="text-sm font-semibold text-gray-700">DJJ Code</Label>
                  <p className="text-gray-600 mt-1">{product.djj_code}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Supplier</Label>
                  <p className="text-gray-600 mt-1">{product.supplier}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Manufacturer Code</Label>
                  <p className="text-gray-600 mt-1">{product.manufacturer_code}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Category</Label>
                  <p className="text-gray-600 mt-1">
                    {product.category} → {product.subcategory} → {product.tertiary_category}
                  </p>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Standards</Label>
                  <p className="text-gray-600 mt-1">{product.standards}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Warranty</Label>
                  <p className="text-gray-600 mt-1">{product.standard_warranty}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Last Updated</Label>
                  <p className="text-gray-600 mt-1">
                    {new Date(product.last_update).toLocaleString()} by {product.last_modified_by}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Remarks</Label>
                  <p className="text-gray-600 mt-1">{product.remarks || "No remarks"}</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="specs" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Specifications</Label>
                  <p className="text-gray-600 mt-1">{product.specs}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Weight</Label>
                  <p className="text-gray-600 mt-1">{product.weight_kg} kg</p>
                </div>
                {product.lift_capacity_kg && (
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Lift Capacity</Label>
                    <p className="text-gray-600 mt-1">{product.lift_capacity_kg} kg</p>
                  </div>
                )}
                {product.lift_height_mm && (
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Lift Height</Label>
                    <p className="text-gray-600 mt-1">{product.lift_height_mm} mm</p>
                  </div>
                )}
              </div>
              <div className="space-y-6">
                {product.power_source && (
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Power Source</Label>
                    <p className="text-gray-600 mt-1">{product.power_source}</p>
                  </div>
                )}
                {product.other_specs && (
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Other Specifications</Label>
                    <p className="text-gray-600 mt-1">{String(product.other_specs)}</p>
                  </div>
                )}
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Warranty Details</Label>
                  <p className="text-gray-600 mt-1">{product.warranty}</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      // 准备CSV数据
      const csvHeaders = [
        "DJJ Code",
        "Status",
        "Supplier",
        "Manufacturer Code",
        "Category",
        "Subcategory",
        "Tertiary Category",
        "Name EN",
        "Name CN",
        "Specs",
        "Standards",
        "Unit",
        "Currency",
        "RRP Price",
        "Standard Warranty",
        "Weight (kg)",
        "Lift Capacity (kg)",
        "Lift Height (mm)",
        "Power Source",
        "Monthly Sales",
        "Total Sales",
        "Profit Margin",
        "Remarks",
      ]

      const csvData = allProducts.map((product) => [
        product.djj_code,
        product.status,
        product.supplier,
        product.manufacturer_code,
        product.category,
        product.subcategory,
        product.tertiary_category,
        product.name_en,
        product.name_cn,
        product.specs,
        product.standards,
        product.unit,
        product.currency,
        product.rrp_price,
        product.standard_warranty,
        product.weight_kg,
        product.lift_capacity_kg || "",
        product.lift_height_mm || "",
        product.power_source || "",
        product.monthly_sales,
        product.total_sales,
        product.profit_margin,
        product.remarks,
      ])

      // 创建CSV内容
      const csvContent = [csvHeaders, ...csvData]
        .map((row) => row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(","))
        .join("\n")

      // 下载文件
      const BOM = '\uFEFF';
      const contentWithBOM = BOM + csvContent;
      const blob = new Blob([contentWithBOM], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `products_export_${new Date().toISOString().split("T")[0]}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Export Successful",
        description: `Exported ${allProducts.length} products to CSV file.`,
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export products. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleImport = async () => {
    if (!importFile) return

    setIsImporting(true)
    try {
      const text = await importFile.text()
      const lines = text.split("\n").filter((line) => line.trim())

      if (lines.length < 2) {
        throw new Error("File must contain at least a header row and one data row")
      }

      const headers = lines[0].split(",").map((h) => h.replace(/"/g, "").trim())
      const dataLines = lines.slice(1)

      const importedProducts: Omit<Product, "id" | "version" | "created_at" | "updated_at">[] = []
      const errors: string[] = []

      for (let i = 0; i < dataLines.length; i++) {
        try {
          const values = dataLines[i].split(",").map((v) => v.replace(/"/g, "").trim())
          if (values.length < headers.length) continue

          const product: Omit<Product, "id" | "version" | "created_at" | "updated_at"> = {
            djj_code: values[0] || `IMPORT_${Date.now()}_${i}`,
            status: (values[1] as Product["status"]) || "draft",
            supplier: values[2] || "",
            manufacturer_code: values[3] || "",
            category: (values[4] as Product["category"]) || "Parts",
            subcategory: values[5] || "",
            tertiary_category: values[6] || "",
            name_en: values[7] || "",
            name_cn: values[8] || "",
            specs: values[9] || "",
            standards: values[10] || "",
            unit: values[11] || "Piece",
            currency: values[12] || "AUD",
            rrp_price: Number.parseFloat(values[13]) || 0,
            standard_warranty: values[14] || "",
            remarks: values[22] || "",
            weight_kg: Number.parseFloat(values[15]) || 0,
            lift_capacity_kg: values[16] ? Number.parseFloat(values[16]) : undefined,
            lift_height_mm: values[17] ? Number.parseFloat(values[17]) : undefined,
            power_source: values[18] || undefined,
            other_specs: null,
            warranty: values[14] || "",
            marketing_info: "",
            training_docs: "",
            product_url: "",
            stocks: [
              { warehouse_id: 1, warehouse_name: "Sydney", on_hand: 0 },
              { warehouse_id: 2, warehouse_name: "Perth", on_hand: 0 },
              { warehouse_id: 3, warehouse_name: "Brisbane", on_hand: 0 },
            ],
            last_update: new Date().toISOString(),
            last_modified_by: "Import",
            sales_data: [],
            monthly_sales: Number.parseInt(values[19]) || 0,
            total_sales: Number.parseInt(values[20]) || 0,
            profit_margin: Number.parseFloat(values[21]) || 0,
            images: [],
            technical_specs: null,
            other_info: null,
          }

          // 检查是否已存在相同的DJJ Code
          if (allProducts.some((p) => p.djj_code === product.djj_code)) {
            errors.push(`Row ${i + 2}: Product with DJJ Code "${product.djj_code}" already exists`)
            continue
          }

          importedProducts.push(product)
        } catch (error: any) {
          errors.push(`Row ${i + 2}: ${error.message}`)
        }
      }

      if (importedProducts.length > 0) {
        // Create products using RTK Query
        for (const product of importedProducts) {
          try {
            await createProduct(product).unwrap()
          } catch (error: any) {
            errors.push(`Failed to create product ${product.djj_code}: ${error.data?.message || error.message}`)
          }
        }

        toast({
          title: "Import Successful",
          description: `Successfully imported ${importedProducts.length} products.${
            errors.length > 0 ? ` ${errors.length} rows had errors.` : ""
          }`,
        })
      }

      if (errors.length > 0 && importedProducts.length === 0) {
        toast({
          title: "Import Failed",
          description: `All rows had errors. Please check your file format.`,
          variant: "destructive",
        })
      }

      setIsImportDialogOpen(false)
      setImportFile(null)
    } catch (error: any) {
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import products. Please check your file format.",
        variant: "destructive",
      })
    } finally {
      setIsImporting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Product Management
          </h1>
          <p className="text-muted-foreground">Manage your product inventory and analyze sales performance</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export
              </>
            )}
          </Button>

          <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Upload className="mr-2 h-4 w-4" />
                Import
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Import Products</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="import-file">Select CSV File</Label>
                  <Input
                    id="import-file"
                    type="file"
                    accept=".csv"
                    onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                    className="mt-2"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Upload a CSV file with product data. The file should include headers matching the export format.
                  </p>
                </div>
                <div className="bg-blue-50 p-3 rounded-md">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">CSV Format Requirements:</h4>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• First row must contain column headers</li>
                    <li>• DJJ Code column is required and must be unique</li>
                    <li>• Status must be: Active, Inactive, or Discontinued</li>
                    <li>• Category must be: Machine, Parts, Tools, or Accessories</li>
                    <li>• Numeric fields should contain valid numbers</li>
                  </ul>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleImport} disabled={!importFile || isImporting}>
                    {isImporting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      "Import"
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Product</DialogTitle>
              </DialogHeader>
              <ProductForm
                onSave={handleCreateProduct}
                onCancel={() => setIsCreateDialogOpen(false)}
                isLoading={isCreating}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-slate-100 text-slate-800 border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-slate-600">{stats.activeProducts} published</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-100 text-gray-800 border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <BarChart3 className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSales}</div>
            <p className="text-xs text-gray-600">units sold</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="shadow-lg">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products by code, name, or supplier..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Machine">Machine</SelectItem>
                <SelectItem value="Parts">Parts</SelectItem>
                <SelectItem value="Tools">Tools</SelectItem>
                <SelectItem value="Accessories">Accessories</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending_tech">Pending Tech</SelectItem>
                <SelectItem value="pending_purchase">Pending Purchase</SelectItem>
                <SelectItem value="pending_finance">Pending Finance</SelectItem>
                <SelectItem value="ready_published">Ready to Publish</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="shadow-lg">
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100">
                <TableHead className="font-semibold">Image</TableHead>
                <TableHead className="font-semibold">DJJ Code</TableHead>
                <TableHead className="font-semibold">Product Name</TableHead>
                <TableHead className="font-semibold">Category</TableHead>
                <TableHead className="font-semibold">Supplier</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Price</TableHead>
                <TableHead className="font-semibold">Sales</TableHead>
                <TableHead className="font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedProducts.map((product, index) => {
                const primaryImage = product.images.find((img) => img.is_primary) || product.images[0]
                return (
                  <TableRow
                    key={product.id}
                    className={`hover:bg-slate-50 ${index % 2 === 0 ? "bg-white" : "bg-slate-25"}`}
                  >
                    <TableCell>
                      {primaryImage ? (
                        <img
                          src={primaryImage.url || "/placeholder.svg?height=48&width=64"}
                          alt={primaryImage.alt}
                          className="w-16 h-12 object-contain rounded border"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg?height=48&width=64"
                          }}
                        />
                      ) : (
                        <div className="w-16 h-12 bg-gray-100 rounded border flex items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium font-mono">{product.djj_code}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{product.name_en}</div>
                        <div className="text-sm text-muted-foreground">{product.name_cn}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getCategoryBadge(product.category)}</TableCell>
                    <TableCell className="text-sm">{product.supplier}</TableCell>
                    <TableCell>{getStatusBadge(product.status)}</TableCell>
                    <TableCell className="font-medium">${product.rrp_price.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{product.monthly_sales}/mo</div>
                        <div className="text-muted-foreground text-xs">{product.total_sales} total</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <Filter className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedProduct(product)
                              setIsDetailDialogOpen(true)
                            }}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedProduct(product)
                              setIsEditDialogOpen(true)
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(product.id)}
                            className="text-red-600"
                            disabled={isDeleting}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
              {Math.min(currentPage * ITEMS_PER_PAGE, totalProducts)} of {totalProducts} products
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className={currentPage === page ? "bg-gradient-to-r from-blue-600 to-purple-600" : ""}
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <ProductForm
              product={selectedProduct}
              onSave={handleUpdateProduct}
              onCancel={() => {
                setIsEditDialogOpen(false)
                setSelectedProduct(null)
              }}
              isLoading={isUpdating}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-none w-screen h-screen max-h-screen p-0 m-0 rounded-none border-0">
          <div className="flex flex-col h-full overflow-auto">
            <DialogHeader className="px-6 py-4 border-b bg-white sticky top-0 z-10">
              <DialogTitle className="text-xl">Product Details & Analytics</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto p-6">
              {selectedProduct && <ProductDetail product={selectedProduct} />}
            </div>
          </div>
        </DialogContent>
      </Dialog>

       <AlertDialog open={isDeleted} onOpenChange={setDelete}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Product</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{selectedProduct?.name}" ({selectedProduct?.code})? This action will
                    mark the customer as deleted.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
    </div>

    
  )
}
