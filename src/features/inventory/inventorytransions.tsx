"use client"

import React, { useState, useEffect, useMemo } from "react"
import { useParams, useNavigate, useSearchParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import JsBarcode from "jsbarcode"
import { useGetProductTransactionsQuery, useDeleteInventoryTransactionMutation, type InventoryTransaction } from "./inventoryApi"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "@/hooks/use-toast"
import {
  ArrowLeft,
  Trash2,
  Search,
  Filter,
  Package,
  TrendingUp,
  TrendingDown,
  Calendar,
  User,
  Hash,
  Copy,
  AlertCircle,
  CheckCircle,
} from "lucide-react"
import { format, parseISO } from "date-fns"
import { LoadingScreen } from "@/components/LoadingScreen"
import { AdvancedPagination } from "@/components/advanced-pagination"
// import { type InventoryRow } from "./InventoryModel" // 暂时注释掉，使用本地接口定义
import { BarcodeSVG } from "../barcodegenerator/BarcodeSVG"
import {
  Box,
  Typography,
  Paper,
  TablePagination,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  AlertTitle,
  Chip,
  Stack,
  TextField,
  FormControl,
  InputLabel,
} from "@mui/material"
import DeleteIcon from "@mui/icons-material/Delete"

// 使用从API导入的InventoryTransaction类型
// 该类型包含product和warehouse信息

interface InventoryDetail {
  id: number
  productID: string
  warehouseID: number
  warehouseName: string
  partNumberCN: string
  partNumberAU: string
  barcode: string
  description: string
  descriptionChinese: string
  warehouse: string
  siteLocation: string
  asset: string
  customer: string
  note: string
  partGroup: string
  partLife: string
  oem: string
  purchasePrice: number
  unitPrice: number
  actualQty: number
  lockedQty: number
  availableQty: number
  operator: string
  operationTime: string
}

interface TransactionSummary {
  totalTransactions: number
  totalInbound: number
  totalOutbound: number
  netQuantity: number
}

export default function InventoryTransactionsPage() {
  const { t } = useTranslation()
  const params = useParams()
  const inventoryId = params.inventoryId
  const navigate = useNavigate()
  
  // 从URL查询参数获取仓库ID
  const [searchParams] = useSearchParams()
  const warehouseId = searchParams.get('warehouseId') ? parseInt(searchParams.get('warehouseId')!) : undefined

  // 查询产品交易历史，API会返回包含product和warehouse信息的完整数据
  const { data: transactions = [], isLoading: txLoading, isError: txError } =
    useGetProductTransactionsQuery({ 
      productId: Number(inventoryId), 
      warehouseId: warehouseId,
      page: 1, 
      page_size: 100 
    }, {
      skip: !inventoryId,
    })

  // 计算库存摘要信息
  const transactionSummary = useMemo((): TransactionSummary => {
    if (!transactions || transactions.length === 0) {
      return {
        totalTransactions: 0,
        totalInbound: 0,
        totalOutbound: 0,
        netQuantity: 0,
      }
    }
    
    const totalInbound = transactions.filter((t) => t.tx_type === "IN").reduce((sum, t) => sum + t.quantity, 0)
    const totalOutbound = transactions.filter((t) => t.tx_type === "OUT").reduce((sum, t) => sum + t.quantity, 0)
    return {
      totalTransactions: transactions.length,
      totalInbound,
      totalOutbound,
      netQuantity: totalInbound - totalOutbound,
    }
  }, [transactions])

  // 从交易数据中提取产品信息（使用第一条交易记录的产品信息）
  const productInfo = transactions && transactions.length > 0 && transactions[0].product ? {
    id: Number(inventoryId),
    partNumberCN: transactions[0].product.djj_code,
    partNumberAU: transactions[0].product.djj_code, 
    barcode: transactions[0].product.djj_code,
    description: transactions[0].product.name_cn,
    descriptionChinese: transactions[0].product.name_cn,
    actualQty: transactionSummary.netQuantity, // 通过交易历史计算当前库存
    lockedQty: 0, // 预留数量，可以从后端获取
    availableQty: transactionSummary.netQuantity, // 可用库存
    warehouse: transactions[0].warehouse?.name || `Warehouse-${warehouseId}`,
    siteLocation: transactions[0].warehouse?.location || ''
  } : {
    // 默认产品信息，当没有交易记录时使用
    id: Number(inventoryId),
    partNumberCN: `Product-${inventoryId}`,
    partNumberAU: `Product-${inventoryId}`,
    barcode: `Product-${inventoryId}`,
    description: `产品 ${inventoryId}`,
    descriptionChinese: `产品 ${inventoryId}`,
    actualQty: 0,
    lockedQty: 0,
    availableQty: 0,
    warehouse: `Warehouse-${warehouseId}`,
    siteLocation: ''
  }

  const inventory = productInfo
  const [deleting, setDeleting] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<"ALL" | "IN" | "OUT">("ALL")
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest" | "highQty" | "lowQty" | "operatorAZ" | "operatorZA">("latest")
  const [currentPage, setCurrentPage] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<InventoryTransaction | null>(null)
  const [copySuccess, setCopySuccess] = useState(false)
  const [deleteTransactionMutation, { isLoading: deleteLoading }] = useDeleteInventoryTransactionMutation()

  useEffect(() => {
    console.log('🔍 Debug Info:', {
      inventoryId,
      warehouseId,
      hasInventory: Boolean(inventory),
      transactionCount: transactions?.length || 0,
      txLoading,
      hasTxError: Boolean(txError)
    });
  }, [inventoryId, warehouseId, Boolean(inventory), transactions?.length || 0, txLoading, Boolean(txError)])

  const filteredAndSortedTransactions = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return []
    }
    
    const filtered = transactions.filter((transaction) => {
      const matchesSearch =
        transaction.operator.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.id.toString().includes(searchTerm) ||
        (transaction.note?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
      const matchesFilter = filterType === "ALL" || transaction.tx_type === filterType
      return matchesSearch && matchesFilter
    })

    return filtered.sort((a, b) => {
      let comparison = 0
      switch (sortOrder) {
        case "oldest":
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          break
        case "highQty":
          comparison = b.quantity - a.quantity
          break
        case "lowQty":
          comparison = a.quantity - b.quantity
          break
        case "operatorAZ":
          comparison = a.operator.localeCompare(b.operator)
          break
        case "operatorZA":
          comparison = b.operator.localeCompare(a.operator)
          break
        default: // latest first
          comparison = new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          break
      }
      return comparison
    })
  }, [transactions, searchTerm, filterType, sortOrder])

  const paginatedTransactions = useMemo(() => {
    const startIndex = currentPage * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredAndSortedTransactions.slice(startIndex, endIndex)
  }, [filteredAndSortedTransactions, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredAndSortedTransactions.length / itemsPerPage)
  const totalItems = filteredAndSortedTransactions.length
  // Function to copy inventory information with barcode image to clipboard
  // Function to copy inventory information with high-quality barcode to clipboard
  const copyInventoryInfo = async () => {
    if (!inventory) {
      return
    }
    try {
      // Create a temporary SVG element to generate barcode
      const tempSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
      tempSvg.setAttribute("width", "200")
      tempSvg.setAttribute("height", "60")

      // Generate barcode using JsBarcode
      JsBarcode(tempSvg, inventory?.partNumberAU, {
        format: "CODE128",
        width: 2,
        height: 40,
        displayValue: true,
        fontSize: 12,
        margin: 10,
        background: "#ffffff",
        lineColor: "#000000",
      })

      // Convert SVG to data URL
      const svgData = new XMLSerializer().serializeToString(tempSvg)
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
      const svgUrl = URL.createObjectURL(svgBlob)

      // Create canvas to convert SVG to PNG
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      const img = new Image()

      img.onload = async () => {
        canvas.width = img.width
        canvas.height = img.height
        if (ctx) {
          ctx.fillStyle = "white"
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          ctx.drawImage(img, 0, 0)
        }

        const barcodeDataUrl = canvas.toDataURL("image/png")
        URL.revokeObjectURL(svgUrl)

        // Create HTML content with text and high-quality barcode image
        const htmlContent = `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px;">
            <h3 style="margin: 0 0 10px 0; font-size: 18px; font-weight: bold;">
              &nbsp;&nbsp;&nbsp;&nbsp; ${inventory.descriptionChinese}
            </h3>
            <p style="margin: 0 0 15px 0; color: #666;">${inventory.description}</p>
            
            <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
              <tr>
                <td style="padding: 5px 0; font-weight: bold;">AU Code:</td>
                <td style="padding: 5px 0;">${inventory.partNumberAU}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; font-weight: bold;">CN Code:</td>
                <td style="padding: 5px 0;">${inventory.partNumberCN}</td>
              </tr>
            </table>
            
            <div style="text-align: center; margin: 20px 0;">
              <p style="margin: 0 0 10px 0; font-weight: bold;">Barcode:</p>
              <img src="${barcodeDataUrl}" alt="Barcode: ${inventory.barcode}" style="display: block; margin: 0 auto; border: 1px solid #ddd; padding: 5px; background: white;">
            </div>
          </div>
        `

        // Plain text fallback
        const textContent = `${inventory.descriptionChinese}
${inventory.description}

AU CODE: ${inventory.partNumberAU}
CN CODE: ${inventory.partNumberCN}
BARCODE: ${inventory.partNumberAU}`

        try {
          // Try to copy HTML content (works in modern browsers)
          const clipboardItem = new ClipboardItem({
            "text/html": new Blob([htmlContent], { type: "text/html" }),
            "text/plain": new Blob([textContent], { type: "text/plain" }),
          })

          await navigator.clipboard.write([clipboardItem])
          setCopySuccess(true)
          toast({
            title: t("copy.success"),
            description: t("copy.descHtml")
          })
        } catch (err) {
          // Fallback to text only
          await navigator.clipboard.writeText(textContent)
          setCopySuccess(true)
          toast({
            title: t("copy.successTextOnly"),
            description: t("copy.descTextOnly"),
          })
        }

        // Reset success state after 2 seconds
        setTimeout(() => setCopySuccess(false), 2000)
      }

      img.onerror = async () => {
        URL.revokeObjectURL(svgUrl)
        // Fallback to text only if image generation fails
        const textContent = ` ${inventory.descriptionChinese}
${inventory.description}

AU CODE: ${inventory.partNumberAU}
CN CODE: ${inventory.partNumberCN}
BARCODE: ${inventory.partNumberAU}`

        await navigator.clipboard.writeText(textContent)
        setCopySuccess(true)
        toast({
             title: t("copy.successTextOnly"),
            description: t("copy.descTextOnly"),
        })
        setTimeout(() => setCopySuccess(false), 2000)
      }

      img.src = svgUrl
    } catch (err) {
      toast({
        title: t("copy.fail"),
         description: t("copy.failDesc"),
        variant: "destructive",
      })
    }
  }



  // Loading & error handling
  if (txLoading) {
    return (
      <LoadingScreen 
        title={t("transactions.loadingInventoryData")}
        description="正在获取库存交易记录..."
      />
    )
  }
  
  if (txError) {
    console.error('❌ 交易历史查询失败:', txError)
    // 即使交易查询失败，也显示页面，只是显示空的交易列表
  }

  // 删除交易记录 - 使用实际API调用

  const handleDeleteAllTransactions = async () => {
    try {
      setDeleting(-1)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setCurrentPage(0)
      toast({
        title: t("transactions.clearSuccess"),
        description: t("transactions.clearSuccessDetail", { count: transactionSummary.totalTransactions }),
      })
    } catch (error) {
      toast({
        title: t("transactions.clearFail"),
        description: t("transactions.clearFailDetail"),
        variant: "destructive",
      })
    } finally {
      setDeleting(null)
    }
  }

  const getTxTypeBadge = (tx_type: "IN" | "OUT", quantity: number) => {
    return tx_type === "IN" ? (
      <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
        <TrendingUp className="h-3 w-3 mr-1" />
        {t("transactions.inType", { quantity })}
      </Badge>
    ) : (
      <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
        <TrendingDown className="h-3 w-3 mr-1" />
        {t("transactions.outType", { quantity })}
      </Badge>
    )
  }

  if (!inventory) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <div className="text-lg text-muted-foreground">{t("transactions.notFound")}</div>
            <Button variant="outline" onClick={() => navigate(-1)} className="mt-4">
              {t("transactions.goBack")}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const handleDeleteInventory = async () => {
    if (transactions && transactions.length > 0) {
      toast({
        title: t("transactions.cannotDeleteInventory"),
        description: t("transactions.cannotDeleteInventoryDesc"),
        variant: "destructive",
      })
      return
    }
    try {
      setDeleting(-2)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({
        title: t("transactions.inventoryDeleted"),
        description: t("transactions.inventoryDeletedDesc"),
      })
      navigate("/inventory")
    } catch (error) {
      toast({
        title: t("transactions.deleteFail"),
        description: t("transactions.deleteInventoryFail"),
        variant: "destructive",
      })
    } finally {
      setDeleting(null)
    }
  }

  const handleDeleteClick = (transaction: InventoryTransaction) => {
    setSelectedTransaction(transaction)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (selectedTransaction) {
      try {
        await deleteTransactionMutation(selectedTransaction.id).unwrap()
        setDeleteDialogOpen(false)
        setSelectedTransaction(null)
        toast({
          title: t("transactions.deleteSuccess"),
          description: t("transactions.deleteSuccessDetail", { id: selectedTransaction.id }),
        })
      } catch (error: any) {
        console.error("Delete failed:", error)
        toast({
          title: t("transactions.deleteFail"),
          description: error?.data?.message || t("transactions.deleteFailDetail"),
          variant: "destructive",
        })
      }
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("transactions.backToInventory")}
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{t("transactions.managementTitle")}</h1>
          <p className="text-muted-foreground">
            {warehouseId 
              ? `查看产品 ${inventory.id} 在指定仓库的交易记录`
              : t("transactions.managementDesc", { id: inventory.id })
            }
          </p>
        </div>
      </div>

      {/* Inventory Context Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                {t("transactions.inventoryContext")}
              </CardTitle>
              <CardDescription>{t("transactions.inventoryStatus")}</CardDescription>
            </div>
            {/* Copy Button */}
            <Button onClick={copyInventoryInfo} variant="outline" className="flex items-center gap-2 bg-transparent">
              {copySuccess ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  {t("copy.success")}
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                   {t("copy.copyBasicInfo")}
                </>
              )}
            </Button>
          </div>

        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">{t("transactions.partNumbers")}</label>
                <div className="space-y-1">
                  <p className="font-medium">{inventory.partNumberCN} (CN)</p>
                  <p className="font-medium">{inventory.partNumberAU} (AU)</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">{t("transactions.barcode")}</label>
                <BarcodeSVG value={inventory.partNumberAU} width={80} height={32} />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">{t("transactions.description")}</label>
                <div className="space-y-1">
                  <p className="font-medium">{inventory.description}</p>
                  <p className="text-sm text-muted-foreground">{inventory.descriptionChinese}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">{t("transactions.location")}</label>
                <p className="font-medium">
                  {inventory.warehouse} - {inventory.siteLocation}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">{t("transactions.currentStock")}</label>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-blue-600">{inventory.actualQty}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("transactions.availableLocked", { available: inventory.availableQty, locked: inventory.lockedQty })}
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">{t("transactions.pricing")}</label>
                <div className="space-y-1">
                  <p className="font-medium">{t("transactions.purchasePrice", { price: inventory })}</p>
                  {/* <p className="font-medium">{t("transactions.purchasePrice", { price: inventory.purchasePrice.toFixed(2) })}</p> */}
                  {/* <p className="font-medium">{t("transactions.unitPrice", { price: inventory.unitPrice.toFixed(2) })}</p> */}
                  <p className="font-medium">{t("transactions.unitPrice", { price: inventory })}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("transactions.totalTransactions")}</p>
                <p className="text-2xl font-bold">{transactionSummary.totalTransactions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("transactions.totalInbound")}</p>
                <p className="text-2xl font-bold text-green-600">+{transactionSummary.totalInbound}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("transactions.totalOutbound")}</p>
                <p className="text-2xl font-bold text-red-600">-{transactionSummary.totalOutbound}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("transactions.netMovement")}</p>
                <p className={`text-2xl font-bold ${transactionSummary.netQuantity >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {transactionSummary.netQuantity >= 0 ? "+" : ""}
                  {transactionSummary.netQuantity}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center">
            <div>
              <CardTitle>{t("transactions.managementTitle")}</CardTitle>
              <CardDescription>
                {warehouseId 
                  ? `${inventory.partNumberAU} - 仓库交易记录 (仓库ID: ${warehouseId})`
                  : t("transactions.managementDesc", { id: inventory.partNumberAU })
                }
              </CardDescription>
            </div>
          </div>

          {/* Bulk Actions */}
          {transactions && transactions.length > 0 && (
            <div className="flex items-center justify-end gap-2 pt-4 border-t">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={deleting !== null}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t("transactions.clearAll", { count: transactions?.length || 0 })}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-destructive" />
                      {t("transactions.clearAllTitle")}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="space-y-3">
                      <p>{t("transactions.clearAllConfirm")}</p>
                      <div className="bg-muted p-4 rounded-md space-y-2">
                        <p>
                          <strong>{t("transactions.partNo")}:</strong> {inventory.partNumberCN} - {inventory.description}
                        </p>
                        <p>
                          <strong>{t("transactions.totalTransactions")}:</strong> {transactions?.length || 0} {t("transactions.records")}
                        </p>
                        <p>
                          <strong>{t("transactions.totalInbound")}:</strong> +{transactionSummary.totalInbound}
                        </p>
                        <p>
                          <strong>{t("transactions.totalOutbound")}:</strong> -{transactionSummary.totalOutbound}
                        </p>
                        <p>
                          <strong>{t("transactions.netMovement")}:</strong> {transactionSummary.netQuantity >= 0 ? "+" : ""}
                          {transactionSummary.netQuantity}
                        </p>
                      </div>
                      <p className="text-destructive font-medium">{t("transactions.clearWarning")}</p>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t("transactions.cancel")}</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAllTransactions}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {t("transactions.clearConfirm")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}

          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("transactions.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterType} onValueChange={(value: "ALL" | "IN" | "OUT") => setFilterType(value)}>
              <SelectTrigger className="w-[140px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{t("transactions.allTypes")}</SelectItem>
                <SelectItem value="IN">{t("transactions.inOnly")}</SelectItem>
                <SelectItem value="OUT">{t("transactions.outOnly")}</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={sortOrder}
              onValueChange={(value) => {
                setSortOrder(value as "latest" | "oldest" | "highQty" | "lowQty" | "operatorAZ" | "operatorZA")
              }}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">{t("transactions.latestFirst")}</SelectItem>
                <SelectItem value="oldest">{t("transactions.oldestFirst")}</SelectItem>
                <SelectItem value="highQty">{t("transactions.highestQty")}</SelectItem>
                <SelectItem value="lowQty">{t("transactions.lowestQty")}</SelectItem>
                <SelectItem value="operatorAZ">{t("transactions.operatorAZ")}</SelectItem>
                <SelectItem value="operatorZA">{t("transactions.operatorZA")}</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => {
                setItemsPerPage(Number(value))
                setCurrentPage(0)
              }}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">{t("transactions.perPage", { count: 5 })}</SelectItem>
                <SelectItem value="10">{t("transactions.perPage", { count: 10 })}</SelectItem>
                <SelectItem value="20">{t("transactions.perPage", { count: 20 })}</SelectItem>
                <SelectItem value="50">{t("transactions.perPage", { count: 50 })}</SelectItem>
                <SelectItem value="100">{t("transactions.perPage", { count: 100 })}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          {filteredAndSortedTransactions.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-muted-foreground mb-2">{t("transactions.noResults")}</p>
              <p className="text-sm text-muted-foreground">
                {searchTerm || filterType !== "ALL"
                  ? t("transactions.noResultsFilter")
                  : t("transactions.noResultsDefault")}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">{t("transactions.tx")}</TableHead>
                    <TableHead>{t("transactions.typeQty")}</TableHead>
                    <TableHead>{t("transactions.operator")}</TableHead>
                    <TableHead>{t("transactions.dateTime")}</TableHead>
                    <TableHead>{t("transactions.notes")}</TableHead>
                    <TableHead className="text-right w-[100px]">{t("transactions.id")}</TableHead>
                    <TableHead className="w-[80px]">{t("transactions.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTransactions.map((transaction) => (
                    <TableRow key={transaction.id} className="hover:bg-muted/50">
                      <TableCell className="font-mono font-medium">#{transaction.id}</TableCell>
                      <TableCell>{getTxTypeBadge(transaction.tx_type, transaction.quantity)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{transaction.operator}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{format(parseISO(transaction.created_at), "MMM dd, yyyy")}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(parseISO(transaction.created_at), "HH:mm:ss")}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-muted-foreground max-w-[200px] truncate">
                          {transaction.note || t("transactions.noNotes")}
                        </p>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className="text-xs">
                          #{transaction.id}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick(transaction)}
                          disabled={deleteLoading}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      {totalItems > 0 && (
        <AdvancedPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={(newPage) => setCurrentPage(newPage)}
          onItemsPerPageChange={(newItemsPerPage) => {
            setItemsPerPage(newItemsPerPage)
            setCurrentPage(0)
          }}
          className="mt-4"
        />
      )}
      {/* Delete Inventory Section - Only show when no transactions */}
      {(!transactions || transactions.length === 0) && (
        <Card className="border-destructive bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              {t("transactions.dangerZone")}
            </CardTitle>
            <CardDescription>
              {t("transactions.dangerZoneDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{t("transactions.deleteInventoryItem")}</h4>
                <p className="text-sm text-muted-foreground">
                  {t("transactions.deleteInventoryDesc")}
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={deleting !== null}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t("transactions.deleteInventory")}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-destructive" />
                      {t("transactions.confirmInventoryDelete")}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="space-y-3">
                      <p>{t("transactions.confirmDeleteTip")}</p>
                      <div className="bg-muted p-4 rounded-md space-y-1">
                        <p>
                          <strong>{t("transactions.inventoryId")}:</strong> #{inventory.id}
                        </p>
                        <p>
                          <strong>{t("transactions.partNumberCN")}:</strong> {inventory.partNumberCN}
                        </p>
                        <p>
                          <strong>{t("transactions.partNumberAU")}:</strong> {inventory.partNumberAU}
                        </p>
                        <p>
                          <strong>{t("transactions.description")}:</strong> {inventory.description}
                        </p>
                        <p>
                          <strong>{t("transactions.currentStock")}:</strong> {inventory.actualQty} {t("transactions.units")}
                        </p>
                        <p>
                          <strong>{t("transactions.location")}:</strong> {inventory.warehouse} - {inventory.siteLocation}
                        </p>
                      </div>
                      <p className="text-destructive font-medium">
                        {t("transactions.deleteInventoryWarning")}
                      </p>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t("transactions.cancel")}</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteInventory}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {t("transactions.deleteInventory")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      )}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>{t("transactions.confirmDelete")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("transactions.confirmDeleteMessage", { id: selectedTransaction?.id })}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>{t("transactions.cancel")}</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            {t("transactions.delete")}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
