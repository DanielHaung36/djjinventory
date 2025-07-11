"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { getProductTransactionHistory } from "@/lib/actions/inventory-actions"
import { Clock, TrendingUp, TrendingDown, User, FileText, AlertCircle } from "lucide-react"
import { format } from "date-fns"

export interface TransactionRecord {
  id: number
  tx_type: string
  quantity: number
  operator: string
  note: string
  created_at: string
  before_quantity?: number
  after_quantity?: number
}

interface TransactionHistoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  productId: number
  productName: string
  warehouseId?: number
  warehouseName?: string
}

export function TransactionHistoryDialog({
  open,
  onOpenChange,
  productId,
  productName,
  warehouseId,
  warehouseName
}: TransactionHistoryDialogProps) {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open && productId) {
      loadTransactionHistory()
    }
  }, [open, productId, warehouseId])

  const loadTransactionHistory = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getProductTransactionHistory(productId, warehouseId)
      setTransactions(data)
    } catch (err) {
      console.error("加载交易历史失败:", err)
      setError("加载交易历史失败，请重试")
    } finally {
      setLoading(false)
    }
  }

  const getTransactionTypeDisplay = (txType: string) => {
    const typeMap: Record<string, { label: string; color: string; icon: any }> = {
      IN: { label: "入库", color: "bg-green-100 text-green-800", icon: TrendingUp },
      OUT: { label: "出库", color: "bg-red-100 text-red-800", icon: TrendingDown },
      SALE: { label: "销售", color: "bg-blue-100 text-blue-800", icon: TrendingDown },
      RESERVE: { label: "预留", color: "bg-yellow-100 text-yellow-800", icon: AlertCircle },
      RELEASE: { label: "释放", color: "bg-gray-100 text-gray-800", icon: AlertCircle },
      ADJUST: { label: "调整", color: "bg-purple-100 text-purple-800", icon: FileText },
      TRANSFER_IN: { label: "转入", color: "bg-green-100 text-green-800", icon: TrendingUp },
      TRANSFER_OUT: { label: "转出", color: "bg-red-100 text-red-800", icon: TrendingDown },
      RETURN: { label: "退货", color: "bg-orange-100 text-orange-800", icon: TrendingUp },
      DAMAGE: { label: "损坏", color: "bg-red-100 text-red-800", icon: TrendingDown },
      EXPIRED: { label: "过期", color: "bg-red-100 text-red-800", icon: TrendingDown },
      STOLEN: { label: "丢失", color: "bg-red-100 text-red-800", icon: TrendingDown },
    }
    return typeMap[txType] || { label: txType, color: "bg-gray-100 text-gray-800", icon: FileText }
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "yyyy-MM-dd HH:mm:ss")
    } catch {
      return dateString
    }
  }

  const handleRefresh = () => {
    loadTransactionHistory()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            交易历史
          </DialogTitle>
          <DialogDescription>
            产品: {productName} {warehouseName && `(${warehouseName})`}
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            共 {transactions.length} 条交易记录
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
            刷新
          </Button>
        </div>

        <ScrollArea className="max-h-[60vh]">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-3 w-full mb-2" />
                    <Skeleton className="h-3 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">{error}</p>
                <Button variant="outline" onClick={handleRefresh} className="mt-4">
                  重试
                </Button>
              </CardContent>
            </Card>
          ) : transactions.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">暂无交易记录</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction, index) => {
                const typeInfo = getTransactionTypeDisplay(transaction.tx_type)
                const Icon = typeInfo.icon
                
                return (
                  <Card key={transaction.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <Badge variant="secondary" className={typeInfo.color}>
                            {typeInfo.label}
                          </Badge>
                          <span className="font-medium">
                            {transaction.quantity > 0 ? "+" : ""}{transaction.quantity}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(transaction.created_at)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {transaction.note && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {transaction.note}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          操作员: {transaction.operator}
                        </div>
                        {typeof transaction.before_quantity === 'number' && typeof transaction.after_quantity === 'number' && (
                          <div>
                            库存: {transaction.before_quantity} → {transaction.after_quantity}
                          </div>
                        )}
                      </div>
                    </CardContent>
                    {index < transactions.length - 1 && <Separator />}
                  </Card>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}