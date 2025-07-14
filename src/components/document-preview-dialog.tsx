"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  FileText, 
  Download, 
  Eye, 
  ImageIcon,
  FileIcon,
  ExternalLink,
  X
} from "lucide-react"

export interface DocumentPreviewData {
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

interface DocumentPreviewDialogProps {
  document: DocumentPreviewData | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DocumentPreviewDialog({ 
  document, 
  open, 
  onOpenChange 
}: DocumentPreviewDialogProps) {
  const [imageError, setImageError] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isLoadingPreview, setIsLoadingPreview] = useState(false)

  // 使用静态文件服务进行预览，就像库存图片一样
  useEffect(() => {
    console.log('🔍 [DocumentPreview] useEffect 检查条件:', {
      hasDocument: !!document,
      isOpen: open,
      fileName: document?.fileName,
      filePath: document?.filePath,
      isPdf: document?.isPdf,
      isImage: document?.isImage,
      canPreview: document ? (document.isPdf || document.isImage) : false
    });
    
    if (!document || !open || !(document.isPdf || document.isImage)) {
      console.log('🔍 [DocumentPreview] 条件不满足，不进行预览');
      setPreviewUrl(null)
      return
    }

    setIsLoadingPreview(true)
    console.log('🔍 [DocumentPreview] 开始设置静态文件预览URL:', document.fileName)
    
    // 直接使用静态文件URL进行预览，避免API下载
    const staticUrl = document.filePath.startsWith('/uploads/') 
      ? document.filePath  // 如果已经是/uploads/开头，直接使用
      : document.filePath.startsWith('uploads/') 
        ? `/${document.filePath}` // 如果是uploads/开头，添加前导/
        : `/uploads/${document.filePath.replace(/^\/+/, '')}`; // 否则构建静态URL
    
    setPreviewUrl(staticUrl)
    setIsLoadingPreview(false)
    console.log('🔍 [DocumentPreview] 静态文件预览URL设置完成:', staticUrl)

    // 清理函数
    return () => {
      setPreviewUrl(null)
    }
  }, [document?.id, open])

  const handleDownload = async () => {
    if (!document) return
    
    try {
      console.log('📥 [DocumentPreview] 开始下载:', document.fileName);
      
      // 直接使用静态文件URL进行下载
      const staticUrl = document.filePath.startsWith('/uploads/') 
        ? document.filePath
        : document.filePath.startsWith('uploads/') 
          ? `/${document.filePath}` // 如果是uploads/开头，添加前导/
          : `/uploads/${document.filePath.replace(/^\/+/, '')}`;
      
      // 创建临时链接进行下载
      const link = window.document.createElement('a');
      link.href = staticUrl;
      link.download = document.fileName;
      link.target = '_blank'; // 在新窗口打开，以防静态文件服务不支持下载
      link.click();
      
      console.log('📥 [DocumentPreview] 下载完成, URL:', staticUrl);
    } catch (error) {
      console.error('❌ [DocumentPreview] 下载失败:', error);
    }
  }

  const handleOpenInNewTab = async () => {
    if (!document) return
    
    try {
      console.log('🔍 [DocumentPreview] 新窗口预览:', document.fileName);
      
      // 直接使用静态文件URL在新窗口打开
      const staticUrl = document.filePath.startsWith('/uploads/') 
        ? document.filePath
        : document.filePath.startsWith('uploads/') 
          ? `/${document.filePath}` // 如果是uploads/开头，添加前导/
          : `/uploads/${document.filePath.replace(/^\/+/, '')}`;
      
      window.open(staticUrl, '_blank');
      console.log('🔍 [DocumentPreview] 新窗口预览URL:', staticUrl);
      
    } catch (error) {
      console.error('❌ [DocumentPreview] 预览失败:', error);
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getDocumentTypeLabel = (type: string): string => {
    switch (type) {
      case 'inbound_report':
        return '入库报告'
      case 'outbound_report':
        return '出库报告'
      case 'inspection_doc':
        return '检验文档'
      case 'pd_report':
        return 'PD检查报告'
      case 'shipping_doc':
        return '发货单据'
      default:
        return '其他文档'
    }
  }

  if (!document) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[95vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            {document.isImage ? (
              <ImageIcon className="h-5 w-5 text-blue-500" />
            ) : document.isPdf ? (
              <FileText className="h-5 w-5 text-red-500" />
            ) : (
              <FileIcon className="h-5 w-5 text-gray-500" />
            )}
            文档预览 - {document.fileName}
          </DialogTitle>
        </DialogHeader>

        {/* 文档信息栏 */}
        <div className="flex-shrink-0 bg-muted/50 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{getDocumentTypeLabel(document.documentType)}</Badge>
              <span className="text-sm text-muted-foreground">
                {formatFileSize(document.fileSize)}
              </span>
              <span className="text-sm text-muted-foreground">
                {document.uploadedAt}
              </span>
            </div>
            <div className="flex gap-2">
              {document.isPdf && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenInNewTab}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  新窗口打开
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
              >
                <Download className="h-3 w-3 mr-1" />
                下载
              </Button>
            </div>
          </div>
          {document.description && (
            <>
              <Separator />
              <p className="text-sm text-muted-foreground">
                {document.description}
              </p>
            </>
          )}
        </div>

        {/* 预览内容 */}
        <div className="flex-1 min-h-[600px] flex items-center justify-center p-4">
          {isLoadingPreview ? (
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">加载预览中...</p>
            </div>
          ) : document.isImage ? (
            <div className="w-full h-full flex items-center justify-center">
              {previewUrl && !imageError ? (
                <img
                  src={previewUrl}
                  alt={document.fileName}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                  onError={() => {
                    console.error('❌ [DocumentPreview] 图片加载失败:', {
                      fileName: document.fileName,
                      previewUrl,
                      isImage: document.isImage
                    })
                    setImageError(true)
                  }}
                  onLoad={() => {
                    console.log('✅ [DocumentPreview] 图片加载成功:', document.fileName)
                  }}
                />
              ) : (
                <div className="text-center space-y-4">
                  <ImageIcon className="h-16 w-16 mx-auto text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">
                      {imageError ? '图片加载失败' : `图片预览不可用 (previewUrl: ${!!previewUrl})`}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownload}
                      className="mt-2"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      下载查看
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : document.isPdf ? (
            <div className="w-full h-full min-h-[600px]">
              {previewUrl ? (
                <iframe
                  src={previewUrl}
                  className="w-full h-full min-h-[600px] rounded-lg border"
                  title={document.fileName}
                />
              ) : (
                <div className="text-center space-y-4">
                  <FileText className="h-16 w-16 mx-auto text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">PDF预览不可用</p>
                    <p className="text-sm text-muted-foreground">请下载文件查看</p>
                    <Button
                      variant="default"
                      onClick={handleDownload}
                      className="mt-2"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      下载PDF
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center space-y-4">
              <FileIcon className="h-16 w-16 mx-auto text-muted-foreground" />
              <div>
                <p className="text-muted-foreground mb-2">
                  此文件类型不支持预览
                </p>
                <Button
                  variant="default"
                  onClick={handleDownload}
                >
                  <Download className="h-4 w-4 mr-2" />
                  下载文件
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}