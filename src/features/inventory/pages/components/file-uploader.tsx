"use client"
import React, { useState, forwardRef } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { X, Upload, FileText, ImageIcon } from "lucide-react"
import Popover from "@mui/material/Popover"
import Fade from "@mui/material/Fade"
import { cn } from "@/lib/utils"

interface FileUploaderProps {
  value?: File[]
  onChange?: (files: File[]) => void
  maxFiles?: number
  maxSize?: number
  accept?: Record<string, string[]>
  disabled?: boolean
}

export const FileUploader = forwardRef<HTMLDivElement, FileUploaderProps>(
  (
    {
      value = [],
      onChange,
      maxFiles = 5,
      maxSize = 5 * 1024 * 1024,
      accept,
      disabled = false,
    },
    ref
  ) => {
    const [error, setError] = useState<string | null>(null)
    const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null)
    const [previewImg, setPreviewImg] = useState<string | null>(null)
    const files = value || []

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
      const newFiles = files.filter((_, i) => i !== index)
      onChange?.(newFiles)
    }

    const getFileIcon = (file: File) => {
      if (file.type.startsWith("image/")) {
        return <ImageIcon className="h-6 w-6 text-blue-500" />
      }
      return <FileText className="h-6 w-6 text-blue-500" />
    }

    const handlePreview = (file: File, event: React.MouseEvent<HTMLDivElement>) => {
      if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file)
        setPreviewImg(url)
        setAnchorEl(event.currentTarget)
      }
    }

    const handleClose = () => {
      setAnchorEl(null)
      setPreviewImg(null)
    }

    const open = Boolean(anchorEl)

    return (
      <div className="space-y-4" ref={ref}>
        <div
          {...getRootProps()}
          className={cn(
            "flex flex-col items-center justify-center rounded-md border border-dashed p-6 transition-colors",
            isDragActive ? "border-primary/50 bg-primary/5" : "border-muted-foreground/25",
            error ? "border-red-500/50" : "",
            disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center text-center">
            <Upload className="h-10 w-10 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-medium">
              Drag & drop files here, or click to select files
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Supports images, PDFs, and office documents up to {maxSize / 1024 / 1024}MB
            </p>
            <Button type="button" variant="outline" size="sm" className="mt-2" disabled={disabled}>
              Select Files
            </Button>
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        {files.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">
              Uploaded Files ({files.length}/{maxFiles})
            </p>
            <div className="space-y-2 relative">
              {files.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between rounded-md border p-2 cursor-pointer"
                  onClick={(e) => handlePreview(file, e)}
                >
                  <div className="flex items-center space-x-2">
                    {getFileIcon(file)}
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    disabled={disabled}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove file</span>
                  </Button>
                </div>
              ))}

              <div className="flex flex-col items-center justify-center text-center ">
                <Popover
                    open={open}
                    anchorEl={anchorEl}
                    onClose={handleClose}
                    anchorOrigin={{ vertical: "center", horizontal: "right" }}
                    transformOrigin={{ vertical: "center", horizontal: "left" }}
                    PaperProps={{ sx: { p: 1, borderRadius: 2, boxShadow: "0 6px 32px #aaa" ,} }}
                    TransitionComponent={Fade}
                >
                  {previewImg && (
                      <img
                          src={previewImg}
                          alt="preview"
                          style={{
                            width: 320,
                            height: 320,
                            objectFit: "contain",
                            display: "block",
                            borderRadius: 12,
                            background: "#f7f7f7",
                          }}
                      />
                  )}
                </Popover>
              </div>
            </div>
          </div>
        )}


      </div>
    )
  }
)

FileUploader.displayName = "FileUploader"
