"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useGetTransactionDetailQuery } from "@/features/inventory/inventoryApi"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { DocumentPreviewDialog, type DocumentPreviewData } from "./document-preview-dialog"
import { 
  FileText, 
  Download, 
  Eye, 
  Package2, 
  Calendar, 
  User, 
  MapPin, 
  Hash,
  ImageIcon,
  FileIcon,
  ExternalLink
} from "lucide-react"

// 类型定义
export interface OutboundDetailData {
  id: string
  referenceNumber: string
  batchId?: number
  date: string
  operator: string
  operatorId: number
  region: string
  regionId: number
  warehouse: string
  warehouseId: number
  totalItems: number
  totalQuantity: number
  totalValue: number
  notes?: string
  status: string
  createdAt: string
  
  // 出库项目明细
  items: OutboundItemDetail[]
  
  // 附件文档
  documents: OutboundDocumentDetail[]
}

export interface OutboundItemDetail {
  id: number
  transactionId: number
  productId: number
  productName: string
  djjCode: string
  category: string
  quantity: number
  unitPrice: number
  totalValue: number
  beforeStock: number
  afterStock: number
  vin?: string
  serial?: string
  remark?: string
}

export interface OutboundDocumentDetail {
  id: number
  fileName: string
  fileType: string
  fileSize: number
  filePath: string
  fileUrl: string
  documentType: string
  description?: string
  uploadedBy: string
  uploadedAt: string
  isImage: boolean
  isPdf: boolean
}

interface OutboundDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  outboundId: number | null
  transactionType?: 'IN' | 'OUT'
  onRefresh?: () => void
}

export function OutboundDetailDialog({ 
  open, 
  onOpenChange, 
  outboundId,
  transactionType = 'OUT',
  onRefresh 
}: OutboundDetailDialogProps) {
  const [selectedDocument, setSelectedDocument] = useState<DocumentPreviewData | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  
  // 使用通用事务详情API调用
  const { data: outboundDetail, isLoading, error } = useGetTransactionDetailQuery(
    { id: outboundId || 0, type: transactionType },
    { skip: !outboundId || outboundId <= 0 }
  )

  // 调试日志
  console.log('📦 [OutboundDetailDialog] State:', {
    outboundId,
    transactionType,
    isLoading,
    error: error ? {
      status: error?.status,
      data: error?.data,
      error: error?.error,
      message: error?.message,
      fullError: error
    } : null,
    hasData: !!outboundDetail,
    dataKeys: outboundDetail ? Object.keys(outboundDetail) : [],
    documentsCount: outboundDetail?.documents?.length || 0,
    itemsCount: outboundDetail?.items?.length || 0,
    apiUrl: `/api/inventory/transaction/detail/${outboundId}?type=OUT`
  });

  if (outboundDetail?.documents) {
    outboundDetail.documents.forEach((doc, index) => {
      console.log(`📄 [OutboundDetailDialog] Document ${index + 1}:`, {
        id: doc.id,
        fileName: doc.fileName,
        fileType: doc.fileType,
        fileSize: doc.fileSize,
        documentType: doc.documentType,
        isImage: doc.isImage,
        isImageType: typeof doc.isImage,
        isPdf: doc.isPdf,
        isPdfType: typeof doc.isPdf,
        uploadedAt: doc.uploadedAt,
        description: doc.description
      });
    });
  }

  if (outboundDetail) {
    console.log('📦 [OutboundDetailDialog] Full Data:', {
      id: outboundDetail.id,
      referenceNumber: outboundDetail.referenceNumber,
      items: outboundDetail.items?.slice(0, 2).map(item => ({
        id: item.id,
        productName: item.productName,
        djjCode: item.djjCode,
        category: item.category,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalValue: item.totalValue,
        allKeys: Object.keys(item)
      })),
      documentsCount: outboundDetail.documents?.length || 0,
      allKeys: Object.keys(outboundDetail)
    });
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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

  const getDocumentTypeColor = (type: string) => {
    switch (type) {
      case "outbound_report":
        return "default"
      case "inspection_doc":
        return "secondary"
      case "other":
        return "outline"
      default:
        return "outline"
    }
  }

  const handlePreviewDocument = (document: OutboundDocumentDetail) => {
    console.log('👀 [OutboundDetail] 点击预览按钮:', document.fileName);
    
    // 转换为DocumentPreviewData格式
    const previewData: DocumentPreviewData = {
      id: document.id,
      fileName: document.fileName,
      fileType: document.fileType,
      fileSize: document.fileSize,
      filePath: document.filePath,
      fileUrl: document.fileUrl,
      documentType: document.documentType,
      description: document.description,
      uploadedBy: document.uploadedBy,
      uploadedAt: document.uploadedAt,
      isImage: document.isImage,
      isPdf: document.isPdf
    }
    
    console.log('👀 [OutboundDetail] 设置预览数据:', previewData);
    console.log('👀 [OutboundDetail] 打开预览对话框');
    
    setSelectedDocument(previewData)
    setPreviewOpen(true)
  }

  const handleDownloadDocument = async (document: OutboundDocumentDetail) => {
    try {
      console.log('📥 [Document] 开始下载:', document.fileName);
      
      // 使用带认证的fetch请求下载
      const response = await fetch(`/api/inventory/documents/${document.id}/download`, {
        method: 'GET',
        credentials: 'include', // 包含cookies
        headers: {
          'Accept': '*/*',
        },
      });

      console.log('📥 [Document] 下载响应:', {
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get('content-type'),
        contentDisposition: response.headers.get('content-disposition')
      });

      if (!response.ok) {
        throw new Error(`下载失败: ${response.status} ${response.statusText}`);
      }

      // 获取文件内容
      const blob = await response.blob();
      
      // 创建下载链接
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = document.fileName;
      link.click();
      
      // 清理
      window.URL.revokeObjectURL(url);
      
      console.log('📥 [Document] 下载完成:', document.fileName);
    } catch (error) {
      console.error('❌ [Document] 下载失败:', error);
      // 这里可以添加toast提示
    }
  }

  // 移除这个条件渲染，让对话框始终可以显示
  // if (!outboundDetail && !isLoading) {
  //   return null
  // }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package2 className="h-5 w-5" />
              出库详情 - {outboundDetail?.referenceNumber}
            </DialogTitle>
            <DialogDescription>
              查看出库记录的详细信息、商品明细和相关附件
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">加载中...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-96 text-center">
              <div className="text-red-500 mb-4">
                <FileText className="h-12 w-12 mx-auto mb-2" />
                <p className="text-lg font-medium">加载失败</p>
                <p className="text-sm text-muted-foreground mt-1">
                  出库详情ID: {outboundId} 
                </p>
                <div className="text-sm text-red-500 mt-2 space-y-1">
                  <p>错误状态: {error?.status || 'N/A'}</p>
                  <p>请求URL: /api/inventory/transaction/detail/{outboundId}?type=OUT</p>
                  {error?.data && (
                    <pre className="text-xs bg-red-50 p-2 rounded mt-2 max-h-32 overflow-auto">
                      {JSON.stringify(error.data, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
              >
                重新加载
              </Button>
            </div>
          ) : !outboundDetail ? (
            <div className="flex flex-col items-center justify-center h-96 text-center">
              <div className="text-muted-foreground mb-4">
                <FileText className="h-12 w-12 mx-auto mb-2" />
                <p className="text-lg font-medium">暂无数据</p>
                <p className="text-sm text-muted-foreground mt-1">
                  出库详情ID: {outboundId}
                </p>
              </div>
            </div>
          ) : (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">基本信息</TabsTrigger>
                <TabsTrigger value="items">商品明细</TabsTrigger>
                <TabsTrigger value="documents">附件文档</TabsTrigger>
              </TabsList>

              {/* 基本信息Tab */}
              <TabsContent value="overview" className="space-y-4">
                <ScrollArea className="h-[500px]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 基础信息卡片 */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">基础信息</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">参考编号:</span>
                            <p className="font-medium">{outboundDetail?.referenceNumber}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">批次ID:</span>
                            <p className="font-medium">{outboundDetail?.batchId || '-'}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">出库日期:</span>
                            <p className="font-medium">{outboundDetail?.date}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">状态:</span>
                            <Badge variant={getStatusColor(outboundDetail?.status || '')}>
                              {outboundDetail?.status}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* 操作信息卡片 */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">操作信息</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-1 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">操作员:</span>
                            <p className="font-medium">{outboundDetail?.operator}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">地区:</span>
                            <p className="font-medium">{outboundDetail?.region}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">仓库:</span>
                            <p className="font-medium">{outboundDetail?.warehouse}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">创建时间:</span>
                            <p className="font-medium">{outboundDetail?.createdAt}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* 统计信息卡片 */}
                    <Card className="md:col-span-2">
                      <CardHeader>
                        <CardTitle className="text-lg">统计信息</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center p-4 bg-muted/50 rounded-lg">
                            <div className="text-2xl font-bold text-primary">
                              {outboundDetail?.totalItems || 0}
                            </div>
                            <div className="text-sm text-muted-foreground">商品种类</div>
                          </div>
                          <div className="text-center p-4 bg-muted/50 rounded-lg">
                            <div className="text-2xl font-bold text-red-600">
                              {outboundDetail?.totalQuantity || 0}
                            </div>
                            <div className="text-sm text-muted-foreground">总数量</div>
                          </div>
                          <div className="text-center p-4 bg-muted/50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">
                              ¥{(outboundDetail?.totalValue || 0).toLocaleString()}
                            </div>
                            <div className="text-sm text-muted-foreground">总价值</div>
                          </div>
                          <div className="text-center p-4 bg-muted/50 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">
                              {outboundDetail?.documents?.length || 0}
                            </div>
                            <div className="text-sm text-muted-foreground">附件数量</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* 备注信息 */}
                    {outboundDetail?.notes && (
                      <Card className="md:col-span-2">
                        <CardHeader>
                          <CardTitle className="text-lg">备注信息</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">{outboundDetail.notes}</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* 商品明细Tab */}
              <TabsContent value="items" className="space-y-4">
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>商品编码</TableHead>
                        <TableHead>商品名称</TableHead>
                        <TableHead>类别</TableHead>
                        <TableHead>数量</TableHead>
                        <TableHead>单价</TableHead>
                        <TableHead>总价</TableHead>
                        <TableHead>出库前</TableHead>
                        <TableHead>出库后</TableHead>
                        <TableHead>备注</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {outboundDetail?.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-mono">{item.djjCode}</TableCell>
                          <TableCell className="font-medium">{item.productName}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{item.category || '未分类'}</Badge>
                          </TableCell>
                          <TableCell className="text-center">{item.quantity || 0}</TableCell>
                          <TableCell>¥{(item.unitPrice || 0).toFixed(2)}</TableCell>
                          <TableCell className="font-medium">¥{(item.totalValue || 0).toFixed(2)}</TableCell>
                          <TableCell className="text-center">{item.beforeStock || 0}</TableCell>
                          <TableCell className="text-center">{item.afterStock || 0}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {item.remark || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </TabsContent>

              {/* 附件文档Tab */}
              <TabsContent value="documents" className="space-y-4">
                <ScrollArea className="h-[500px]">
                  {outboundDetail?.documents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                      <FileText className="h-12 w-12 mb-4" />
                      <p>暂无附件文档</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {outboundDetail?.documents.map((document) => (
                        <Card key={document.id} className="overflow-hidden">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0">
                                {document.isImage ? (
                                  <ImageIcon className="h-8 w-8 text-blue-500" />
                                ) : (
                                  <FileIcon className="h-8 w-8 text-gray-500" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm truncate" title={document.fileName}>
                                  {document.fileName}
                                </h4>
                                <div className="mt-1 space-y-1">
                                  <Badge 
                                    variant={getDocumentTypeColor(document.documentType)} 
                                    className="text-xs"
                                  >
                                    {document.documentType === 'outbound_report' ? '出库报告' : 
                                     document.documentType === 'inspection_doc' ? '检验文档' : '其他'}
                                  </Badge>
                                  <p className="text-xs text-muted-foreground">
                                    {formatFileSize(document.fileSize)}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {document.uploadedAt}
                                  </p>
                                </div>
                                {document.description && (
                                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                                    {document.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            <Separator className="my-3" />
                            <div className="flex gap-2">
                              {(document.isImage || document.isPdf) && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handlePreviewDocument(document)}
                                  className="flex-1"
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  预览
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadDocument(document)}
                                className="flex-1"
                              >
                                <Download className="h-3 w-3 mr-1" />
                                下载
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* 文档预览对话框 */}
      <DocumentPreviewDialog
        document={selectedDocument}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />
    </>
  )
}