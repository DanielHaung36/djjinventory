import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  FileText, 
  Download, 
  Eye, 
  Trash2, 
  AlertTriangle,
  Calendar,
  User,
  Building,
  Phone,
  Mail,
  MapPin
} from 'lucide-react'
import { 
  useGetQuoteByIdQuery, 
  useGetQuoteDocumentsQuery, 
  usePreviewDocumentQuery,
  useDeleteDocumentMutation,
  type Quote,
  type QuoteDocument,
  type DocumentPreviewResponse
} from '../quotesApi'
import { DocumentPreviewDialog } from './document-preview-dialog'
import { useToast } from '@/hooks/use-toast'

interface QuoteDetailDialogProps {
  quoteId: string | null
  isOpen: boolean
  onClose: () => void
}

export function QuoteDetailDialog({ quoteId, isOpen, onClose }: QuoteDetailDialogProps) {
  const { toast } = useToast()
  const [selectedDocument, setSelectedDocument] = useState<DocumentPreviewResponse | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)

  // API queries
  const { data: quote, isLoading: quoteLoading } = useGetQuoteByIdQuery(quoteId!, {
    skip: !quoteId
  })
  
  const { data: documents = [], isLoading: documentsLoading } = useGetQuoteDocumentsQuery(quoteId!, {
    skip: !quoteId
  })

  const [deleteDocument] = useDeleteDocumentMutation()

  // 获取状态Badge
  const getStatusBadge = (status: string) => {
    if (status === "approved") {
      return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>
    } else if (status === "rejected") {
      return <Badge variant="destructive">Rejected</Badge>
    } else {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>
    }
  }

  const formatCurrency = (amount: number, currency = "AUD") => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: currency,
    }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handlePreviewDocument = async (doc: QuoteDocument) => {
    try {
      const response = await fetch(`/api/quotes/documents/${doc.id}/preview`, {
        credentials: 'include'
      })
      if (response.ok) {
        const previewData = await response.json()
        setSelectedDocument(previewData)
        setPreviewOpen(true)
      } else {
        toast({
          title: "预览失败",
          description: "无法获取文档预览信息",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "预览失败",
        description: "网络错误，请稍后重试",
        variant: "destructive",
      })
    }
  }

  const handleDeleteDocument = async (doc: QuoteDocument) => {
    if (!window.confirm(`确定要删除文档 "${doc.fileName}" 吗？`)) {
      return
    }

    try {
      await deleteDocument({ 
        docId: doc.id.toString(), 
        quoteId: quoteId! 
      }).unwrap()
      
      toast({
        title: "删除成功",
        description: `文档 "${doc.fileName}" 已删除`,
      })
    } catch (error) {
      toast({
        title: "删除失败",
        description: "删除文档时发生错误",
        variant: "destructive",
      })
    }
  }

  const handleDownloadDocument = (doc: QuoteDocument) => {
    window.open(`/api/quotes/documents/${doc.id}/download`, '_blank')
  }

  if (!quoteId) return null

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-3">
              <FileText className="h-5 w-5" />
              报价单详情
              {quote && (
                <span className="text-lg font-mono">#{quote.quoteNumber}</span>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            {quoteLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">加载中...</p>
                </div>
              </div>
            ) : quote ? (
              <Tabs defaultValue="basic" className="h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-3 flex-shrink-0">
                  <TabsTrigger value="basic">基本信息</TabsTrigger>
                  <TabsTrigger value="items">商品明细</TabsTrigger>
                  <TabsTrigger value="documents">
                    附件文档 {documents.length > 0 && `(${documents.length})`}
                  </TabsTrigger>
                </TabsList>

                <div className="flex-1 overflow-auto mt-4">
                  <TabsContent value="basic" className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* 报价信息 */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            报价信息
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">报价单号:</span>
                            <span className="font-mono">{quote.quoteNumber}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">状态:</span>
                            {getStatusBadge(quote.status)}
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">报价日期:</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatDate(quote.quoteDate)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">销售代表:</span>
                            <span className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {quote.salesRepUser?.username || '未指定'}
                            </span>
                          </div>
                        </CardContent>
                      </Card>

                      {/* 客户信息 */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            客户信息
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">公司名称:</span>
                            <span>{quote.customer?.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">联系人:</span>
                            <span>{quote.customer?.contact}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">电话:</span>
                            <span className="flex items-center gap-1">
                              <Phone className="h-4 w-4" />
                              {quote.customer?.phone}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">邮箱:</span>
                            <span className="flex items-center gap-1">
                              <Mail className="h-4 w-4" />
                              {quote.customer?.email}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">地址:</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {quote.customer?.address}
                            </span>
                          </div>
                        </CardContent>
                      </Card>

                      {/* 金额信息 */}
                      <Card className="md:col-span-2">
                        <CardHeader>
                          <CardTitle>金额信息</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                              <div className="text-sm text-gray-600">小计</div>
                              <div className="text-lg font-semibold">
                                {formatCurrency(quote.amounts?.subTotal || 0)}
                              </div>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                              <div className="text-sm text-gray-600">GST</div>
                              <div className="text-lg font-semibold">
                                {formatCurrency(quote.amounts?.gstTotal || 0)}
                              </div>
                            </div>
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                              <div className="text-sm text-gray-600">总计</div>
                              <div className="text-xl font-bold text-blue-600">
                                {formatCurrency(quote.amounts?.total || 0)}
                              </div>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                              <div className="text-sm text-gray-600">定金</div>
                              <div className="text-lg font-semibold text-green-600">
                                {formatCurrency(quote.depositAmount || 0)}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="items" className="mt-0">
                    <Card>
                      <CardHeader>
                        <CardTitle>商品明细</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left p-2">商品</th>
                                <th className="text-center p-2">数量</th>
                                <th className="text-right p-2">单价</th>
                                <th className="text-right p-2">折扣</th>
                                <th className="text-right p-2">小计</th>
                              </tr>
                            </thead>
                            <tbody>
                              {quote.items?.map((item, index) => (
                                <tr key={index} className="border-b hover:bg-gray-50">
                                  <td className="p-2">
                                    <div>
                                      <div className="font-medium">{item.description}</div>
                                      {item.detailDescription && (
                                        <div className="text-sm text-gray-500 mt-1">
                                          {item.detailDescription}
                                        </div>
                                      )}
                                      {item.product?.djjCode && (
                                        <div className="text-xs text-blue-600 mt-1">
                                          DJJ代码: {item.product.djjCode}
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                  <td className="text-center p-2 font-medium">
                                    {item.quantity} {item.unit}
                                  </td>
                                  <td className="text-right p-2">
                                    {formatCurrency(item.unitPrice)}
                                  </td>
                                  <td className="text-right p-2">
                                    {formatCurrency(item.discount)}
                                  </td>
                                  <td className="text-right p-2 font-medium">
                                    {formatCurrency(item.totalPrice)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="documents" className="mt-0">
                    <Card>
                      <CardHeader>
                        <CardTitle>附件文档</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {documentsLoading ? (
                          <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                            <p className="text-gray-500">加载文档中...</p>
                          </div>
                        ) : documents.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {documents.map((doc) => {
                              const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(doc.fileName)
                              const isPDF = /\.pdf$/i.test(doc.fileName)
                              const canPreview = isImage || isPDF

                              return (
                                <div
                                  key={doc.id}
                                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                                >
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-medium truncate" title={doc.fileName}>
                                        {doc.fileName}
                                      </h4>
                                      <p className="text-sm text-gray-500">
                                        {doc.fileType} • {formatFileSize(doc.fileSize)}
                                      </p>
                                      <p className="text-xs text-gray-400">
                                        {new Date(doc.uploadedAt).toLocaleString('zh-CN')}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex gap-2">
                                    {canPreview && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePreviewDocument(doc)}
                                        className="flex-1 flex items-center gap-1"
                                      >
                                        <Eye className="h-4 w-4" />
                                        预览
                                      </Button>
                                    )}
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleDownloadDocument(doc)}
                                      className="flex-1 flex items-center gap-1"
                                    >
                                      <Download className="h-4 w-4" />
                                      下载
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleDeleteDocument(doc)}
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">暂无附件文档</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </div>
              </Tabs>
            ) : (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">报价单不存在或已被删除</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* 文档预览对话框 */}
      <DocumentPreviewDialog
        document={selectedDocument}
        isOpen={previewOpen}
        onClose={() => {
          setPreviewOpen(false)
          setSelectedDocument(null)
        }}
      />
    </>
  )
}