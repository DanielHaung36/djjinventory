import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download, ExternalLink } from 'lucide-react'

interface Document {
  id: number
  fileName: string
  fileType: string
  fileSize: number
  url: string
  previewUrl: string
  downloadUrl: string
  uploadedAt: string
  refType: string
  refId: number
}

interface DocumentPreviewDialogProps {
  document: Document | null
  isOpen: boolean
  onClose: () => void
}

export function DocumentPreviewDialog({ document, isOpen, onClose }: DocumentPreviewDialogProps) {
  if (!document) return null

  // 确定是否可以预览
  const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(document.fileName)
  const isPDF = /\.pdf$/i.test(document.fileName)
  const canPreview = isImage || isPDF

  // 构建静态文件URL
  const staticUrl = document.previewUrl || (
    document.url.startsWith('/uploads/') 
      ? document.url
      : document.url.startsWith('uploads/') 
        ? `/${document.url}`
        : `/uploads/${document.url.replace(/^\/+/, '')}`
  )

  const handleDownload = () => {
    window.open(document.downloadUrl, '_blank')
  }

  const handleOpenInNewWindow = () => {
    window.open(staticUrl, '_blank')
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[95vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-lg font-semibold">
                {document.fileName}
              </DialogTitle>
              <div className="text-sm text-gray-500 mt-1">
                {document.fileType} • {formatFileSize(document.fileSize)} • 
                上传时间: {new Date(document.uploadedAt).toLocaleString('zh-CN')}
              </div>
            </div>
            <div className="flex gap-2">
              {canPreview && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenInNewWindow}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  新窗口打开
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                下载
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {canPreview ? (
            <div className="w-full h-full">
              {isImage ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg">
                  <img
                    src={staticUrl}
                    alt={document.fileName}
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      console.error('Image failed to load:', staticUrl)
                      e.currentTarget.src = '/placeholder-image.png'
                    }}
                  />
                </div>
              ) : isPDF ? (
                <iframe
                  src={staticUrl}
                  className="w-full h-full rounded-lg border"
                  title={document.fileName}
                  onError={() => {
                    console.error('PDF failed to load:', staticUrl)
                  }}
                />
              ) : null}
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-6xl mb-4">📄</div>
                <div className="text-lg font-medium text-gray-700 mb-2">
                  无法预览此文件类型
                </div>
                <div className="text-sm text-gray-500 mb-4">
                  文件类型: {document.fileType}
                </div>
                <Button
                  onClick={handleDownload}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
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