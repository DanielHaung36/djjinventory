"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useGetOutboundListQuery } from "../../../../features/inventory/inventoryApi"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { OutboundDetailDialog } from "@/components/outbound-detail-dialog"
import { Search, Eye } from "lucide-react"

export function OutboundTransactionsTable() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedOutboundId, setSelectedOutboundId] = useState<number | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const itemsPerPage = 10

  // 使用RTK Query获取出库列表数据
  const { data: outboundListResponse, isLoading, error, refetch } = useGetOutboundListQuery({
    page: currentPage,
    pageSize: itemsPerPage,
    search: searchQuery || undefined,
  })

  const outboundTransactions = outboundListResponse?.items || []
  const totalPages = outboundListResponse ? Math.ceil(outboundListResponse.total / itemsPerPage) : 1

  const handleViewDetails = (transactionId: number) => {
    console.log('📦 [OutboundTable] 查看详情，事务ID:', transactionId)
    setSelectedOutboundId(transactionId)
    setDetailDialogOpen(true)
  }

  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false)
    setSelectedOutboundId(null)
  }

  const handleRefreshAfterChange = () => {
    console.log('🔄 [OutboundTable] 刷新出库列表数据')
    refetch()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default"
      case "pending":
        return "secondary"
      case "failed":
        return "destructive"
      default:
        return "outline"
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">加载中...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-red-500 mb-4">加载出库记录失败</p>
        <Button onClick={() => refetch()}>重试</Button>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索参考编号、客户名称..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>参考编号</TableHead>
                <TableHead>出库日期</TableHead>
                <TableHead>客户名称</TableHead>
                <TableHead>总数量</TableHead>
                <TableHead>总价值</TableHead>
                <TableHead>商品种类</TableHead>
                <TableHead>地区</TableHead>
                <TableHead>仓库</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead className="w-[80px]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {outboundTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8">
                    暂无出库记录
                  </TableCell>
                </TableRow>
              ) : (
                outboundTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">{transaction.referenceNumber}</TableCell>
                    <TableCell>{transaction.date}</TableCell>
                    <TableCell>{transaction.customerName || '-'}</TableCell>
                    <TableCell className="text-center">{transaction.totalQuantity}</TableCell>
                    <TableCell>¥{transaction.totalValue.toLocaleString()}</TableCell>
                    <TableCell className="text-center">{transaction.itemCount}</TableCell>
                    <TableCell>{transaction.region}</TableCell>
                    <TableCell>{transaction.warehouse}</TableCell>
                    <TableCell>{transaction.createdAt}</TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleViewDetails(transaction.id)}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">查看详情</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              上一页
            </Button>
            <span className="flex items-center px-3 text-sm">
              第 {currentPage} 页，共 {totalPages} 页
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
        )}
      </div>

      {/* 出库详情对话框 */}
      <OutboundDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        outboundId={selectedOutboundId}
        transactionType="OUT"
        onRefresh={handleRefreshAfterChange}
      />
    </>
  )
}
