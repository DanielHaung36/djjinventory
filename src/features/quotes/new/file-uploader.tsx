"use client"
import { useState, forwardRef, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { X, Upload, FileText, ImageIcon, Eye } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileUploaderProps {
  value?: File[]
  onChange?: (files: File[]) => void
  maxFiles?: number
  maxSize?: number
  accept?: Record<string, string[]>
  disabled?: boolean
}

interface FileWithPreview extends File {
  preview?: string
}

export const FileUploader = forwardRef<HTMLDivElement, FileUploaderProps>(
  ({ value = [], onChange, maxFiles = 5, maxSize = 5 * 1024 * 1024, accept, disabled = false }, ref) => {
    const [error, setError] = useState<string | null>(null)
    const [filesWithPreview, setFilesWithPreview] = useState<FileWithPreview[]>([])
    const [previewImage, setPreviewImage] = useState<string | null>(null)

    const files = value || []

    // 生成预览URL
    useEffect(() => {
      const newFilesWithPreview = files.map((file) => {
        const fileWithPreview = file as FileWithPreview
        if (file.type.startsWith("image/") && !fileWithPreview.preview) {
          fileWithPreview.preview = URL.createObjectURL(file)
        }
        return fileWithPreview
      })
      setFilesWithPreview(newFilesWithPreview)

      // 清理函数：释放URL对象
      return () => {
        newFilesWithPreview.forEach((file) => {
          if (file.preview) {
            URL.revokeObjectURL(file.preview)
          }
        })
      }
    }, [files])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop: (acceptedFiles) => {
        setError(null)

        if (files.length + acceptedFiles.length > maxFiles) {
          setError(`You can only upload a maximum of ${maxFiles} files.`)
          return
        }

        const validFiles = acceptedFiles.filter((file) => file.size <= maxSize)
        const invalidFiles = acceptedFiles.filter((file) => file.size > maxSize)

        if (invalidFiles.length > 0) {
          setError(`Some files exceed the maximum size of ${maxSize / 1024 / 1024}MB.`)
        }

        const newFiles = [...files, ...validFiles]
        onChange?.(newFiles)
      },
      maxSize,
      accept,
      disabled,
    })

    const removeFile = (index: number) => {
      const fileToRemove = filesWithPreview[index]
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview)
      }
      const newFiles = files.filter((_, i) => i !== index)
      onChange?.(newFiles)
    }

    const getFileIcon = (file: FileWithPreview) => {
      if (file.type.startsWith("image/")) {
        return <ImageIcon className="h-6 w-6 text-blue-500" />
      }
      return <FileText className="h-6 w-6 text-blue-500" />
    }

    const openPreview = (file: FileWithPreview) => {
      if (file.preview) {
        setPreviewImage(file.preview)
      }
    }

    const closePreview = () => {
      setPreviewImage(null)
    }

    return (
      <div className="space-y-4" ref={ref}>
        <div
          {...getRootProps()}
          className={cn(
            "flex flex-col items-center justify-center rounded-md border border-dashed p-6 transition-colors",
            isDragActive ? "border-primary/50 bg-primary/5" : "border-muted-foreground/25",
            error ? "border-red-500/50" : "",
            disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center text-center">
            <Upload className="h-10 w-10 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-medium">Drag & drop files here, or click to select files</h3>
            <p className="mt-1 text-xs text-muted-foreground">Supports images, PDFs up to {maxSize / 1024 / 1024}MB</p>
            <Button type="button" variant="outline" size="sm" className="mt-2 bg-transparent" disabled={disabled}>
              Select Files
            </Button>
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        {filesWithPreview.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">
              Uploaded Files ({filesWithPreview.length}/{maxFiles})
            </p>
            <div className="space-y-2">
              {filesWithPreview.map((file, index) => (
                <div key={`${file.name}-${index}`} className="flex items-center justify-between rounded-md border p-3">
                  <div className="flex items-center space-x-3">
                    {/* 文件图标或缩略图 */}
                    <div className="flex-shrink-0">
                      {file.type.startsWith("image/") && file.preview ? (
                        <div className="relative">
                          <img
                            src={file.preview || "/placeholder.svg"}
                            alt={file.name}
                            className="h-12 w-12 rounded-md object-cover border"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute inset-0 h-12 w-12 p-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity rounded-md"
                            onClick={() => openPreview(file)}
                            disabled={disabled}
                          >
                            <Eye className="h-4 w-4 text-white" />
                          </Button>
                        </div>
                      ) : (
                        getFileIcon(file)
                      )}
                    </div>

                    {/* 文件信息 */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <span>{(file.size / 1024).toFixed(1)} KB</span>
                        {file.type.startsWith("image/") && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">Image</span>
                        )}
                        {file.type === "application/pdf" && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full">PDF</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex items-center space-x-1">
                    {file.type.startsWith("image/") && file.preview && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => openPreview(file)}
                        disabled={disabled}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Preview image</span>
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      disabled={disabled}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove file</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 图片预览模态框 */}
        {previewImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={closePreview}>
            <div className="relative max-w-4xl max-h-[90vh] p-4">
              <img
                src={previewImage || "/placeholder.svg"}
                alt="Preview"
                className="max-w-full max-h-full object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={closePreview}
                className="absolute top-2 right-2 h-8 w-8 p-0 bg-black/50 text-white hover:bg-black/70"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close preview</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  },
)

FileUploader.displayName = "FileUploader"
