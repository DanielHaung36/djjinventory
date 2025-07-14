"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Eye, FileText, Loader2, Wifi, WifiOff } from "lucide-react"
import { InboundDetailDialog } from "./inbound-detail-dialog"
import { useGetInboundListQuery } from "@/features/inventory/inventoryApi"
export function InboundTransactionsTable() {
  const router = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [selectedInboundId, setSelectedInboundId] = useState<number | null>(null)
  const itemsPerPage = 10

  // 使用真实API获取入库列表（RTK Query会自动处理WebSocket更新）
  const { data: inboundListResponse, isLoading, error, refetch } = useGetInboundListQuery({
    page: currentPage,
    pageSize: itemsPerPage,
    search: searchQuery || undefined,
  })

  const inboundTransactions = inboundListResponse?.items || []
  const totalItems = inboundListResponse?.total || 0
  const totalPages = inboundListResponse?.totalPages || 1

  // 调试日志
  console.log('📋 [InboundTransactionsTable] State:', {
    currentPage,
    searchQuery,
    isLoading,
    error,
    hasData: !!inboundListResponse,
    itemsCount: inboundTransactions.length,
    totalItems,
    totalPages
  });

  if (inboundListResponse) {
    console.log('📋 [InboundTransactionsTable] Response:', {
      fullResponse: inboundListResponse,
      items: inboundTransactions.slice(0, 3).map(item => ({
        id: item.id,
        referenceNumber: item.referenceNumber,
        batchId: item.batchId,
        date: item.date,
        status: item.status,
        totalValue: item.totalValue,
        totalQuantity: item.totalQuantity,
        operator: item.operator,
        allKeys: Object.keys(item)
      })),
      totalShown: Math.min(3, inboundTransactions.length),
      totalItems: inboundTransactions.length
    });
  }

  const handleViewDetails = (id: number) => {
    setSelectedInboundId(id)
    setDetailDialogOpen(true)
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "success":
        return "default"
      case "pending":
      case "processing":
        return "secondary"
      case "failed":
      case "error":
        return "destructive"
      case "cancelled":
      case "void":
        return "outline"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索ID、参考编号或操作员..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Wifi className="h-4 w-4 text-green-500" />
          <span>实时更新</span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">加载中...</span>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-32 text-red-500">
          <span>加载失败，请重试</span>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="ml-2">
            重试
          </Button>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>参考编号</TableHead>
                <TableHead>操作员</TableHead>
                <TableHead>地区</TableHead>
                <TableHead>仓库</TableHead>
                <TableHead>日期</TableHead>
                <TableHead>商品数</TableHead>
                <TableHead>总数量</TableHead>
                <TableHead>总价值</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>附件</TableHead>
                <TableHead className="w-[120px]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inboundTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} className="text-center h-32 text-muted-foreground">
                    暂无入库记录
                  </TableCell>
                </TableRow>
              ) : (
                inboundTransactions.map((transaction, index) => (
                  <TableRow key={`${transaction.id}-${transaction.referenceNumber}-${index}`}>
                    <TableCell className="font-medium">{transaction.id}</TableCell>
                    <TableCell>{transaction.referenceNumber}</TableCell>
                    <TableCell>{transaction.operator}</TableCell>
                    <TableCell>{transaction.region}</TableCell>
                    <TableCell>{transaction.warehouse}</TableCell>
                    <TableCell>{transaction.date}</TableCell>
                    <TableCell className="text-center">{transaction.totalItems || 0}</TableCell>
                    <TableCell className="text-center">{transaction.totalQuantity || 0}</TableCell>
                    <TableCell>¥{(transaction.totalValue || 0).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(transaction.status)}>{transaction.status}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {(transaction.documentCount || 0) > 0 ? (
                        <Badge variant="outline">{transaction.documentCount}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleViewDetails(transaction.id)}
                          title="查看详情"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            显示第 {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} 条，共 {totalItems} 条记录
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              上一页
            </Button>
            <span className="flex items-center px-3 py-1 text-sm">
              第 {currentPage} / {totalPages} 页
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              下一页
            </Button>
          </div>
        </div>
      )}

      {/* 入库详情对话框 */}
      <InboundDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        inboundId={selectedInboundId}
        onRefresh={() => {
          refetch()
        }}
      />
    </div>
  )
}
