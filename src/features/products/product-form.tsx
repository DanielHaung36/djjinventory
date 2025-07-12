"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Plus, X, ImageIcon, Upload, Loader2, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import type { Product, ProductImage,ProductStatus } from "./types"
import { useUploadFilesMutation, useDeleteFileMutation } from "./uploadProductApi"

interface ProductFormProps {
  product?: Product
  onSave: (product: Omit<Product, "id" | "version" | "created_at" | "updated_at">) => void
  onCancel: () => void
  isLoading?: boolean
}

interface ImageUploadState {
  id: number
  file?: File
  url: string
  alt: string
  is_primary: boolean
  isLocalFile: boolean // 标识是否为本地文件
}

export default function ProductForm({ product, onSave, onCancel, isLoading = false }: ProductFormProps) {
  const { toast } = useToast()
  const [uploadFiles] = useUploadFilesMutation()
  const [deleteFile] = useDeleteFileMutation()
  const [isUploading, setIsUploading] = useState(false)

  const [formData, setFormData] = useState<Partial<Product>>(
    product || {
      djj_code: "",
      status: "draft",
      supplier: "",
      manufacturer_code: "",
      category: "Parts",
      subcategory: "",
      tertiary_category: "",
      name_cn: "",
      name_en: "",
      specs: "",
      standards: "",
      unit: "Piece",
      currency: "AUD",
      rrp_price: 0,
      standard_warranty: "",
      remarks: "",
      weight_kg: 0,
      lift_capacity_kg: 0,
      lift_height_mm: 0,
      power_source: "",
      other_specs: null,
      warranty: "",
      marketing_info: "",
      training_docs: "",
      product_url: "",
      monthly_sales: 0,
      total_sales: 0,
      profit_margin: 0,
      last_modified_by: "Current User",
      stocks: [],
      sales_data: [],
      images: [],
      technical_specs: null,
      other_info: null,
    },
  )

  const [imageStates, setImageStates] = useState<ImageUploadState[]>(
    product?.images?.map((img) => ({
      id: img.id,
      url: img.url,
      alt: img.alt,
      is_primary: img.is_primary,
      isLocalFile: false,
    })) || [
      {
        id: 1,
        url: "",
        alt: "Product Front View",
        is_primary: true,
        isLocalFile: false,
      },
      {
        id: 2,
        url: "",
        alt: "Product Side View",
        is_primary: false,
        isLocalFile: false,
      },
      {
        id: 3,
        url: "",
        alt: "Product Interior View",
        is_primary: false,
        isLocalFile: false,
      },
    ],
  )

  const [stocks, setStocks] = useState(
    product?.stocks || [
      { warehouse_id: 1, warehouse_name: "Sydney", on_hand: 0 },
      { warehouse_id: 2, warehouse_name: "Perth", on_hand: 0 },
      { warehouse_id: 3, warehouse_name: "Brisbane", on_hand: 0 },
    ],
  )

  useEffect(() => {
    if (product) {
      setFormData(product)
      setImageStates(
        product.images?.map((img) => ({
          id: img.id,
          url: img.url,
          alt: img.alt,
          is_primary: img.is_primary,
          isLocalFile: false,
        })) || [],
      )
      setStocks(product.stocks || [])
    }
  }, [product])

  // 清理本地预览URL
  useEffect(() => {
    return () => {
      imageStates.forEach((img) => {
        if (img.isLocalFile && img.url.startsWith("blob:")) {
          URL.revokeObjectURL(img.url)
        }
      })
    }
  }, [])

  const handleAddImage = () => {
    const newImage: ImageUploadState = {
      id: Date.now(),
      url: "",
      alt: "",
      is_primary: imageStates.length === 0,
      isLocalFile: false,
    }
    setImageStates([...imageStates, newImage])
  }

  const handleRemoveImage = async (id: number) => {
    const imageState = imageStates.find((img) => img.id === id)

    // 清理本地预览URL
    if (imageState?.isLocalFile && imageState.url.startsWith("blob:")) {
      URL.revokeObjectURL(imageState.url)
    }

    // 如果是已上传的图片，标记为删除（实际删除在保存时处理）
    setImageStates(imageStates.filter((img) => img.id !== id))
  }

  const handleImageChange = (id: number, field: keyof ImageUploadState, value: string | boolean) => {
    setImageStates(
      imageStates.map((img) =>
        img.id === id
          ? {
              ...img,
              [field]: value,
            }
          : field === "is_primary" && value === true
            ? { ...img, is_primary: false }
            : img,
      ),
    )
  }

  const handleFileSelect = (id: number, file: File) => {
    if (!file || !file.type.startsWith("image/")) {
      toast({
        title: "Invalid File",
        description: "Please select a valid image file.",
        variant: "destructive",
      })
      return
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 10MB.",
        variant: "destructive",
      })
      return
    }

    // 清理之前的预览URL
    const currentImage = imageStates.find((img) => img.id === id)
    if (currentImage?.isLocalFile && currentImage.url.startsWith("blob:")) {
      URL.revokeObjectURL(currentImage.url)
    }

    // 创建本地预览URL
    const previewUrl = URL.createObjectURL(file)

    // 更新状态
    setImageStates((prev) =>
      prev.map((img) =>
        img.id === id
          ? {
              ...img,
              file,
              url: previewUrl,
              isLocalFile: true,
              // 自动生成alt文本
              alt: img.alt || file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
            }
          : img,
      ),
    )

    toast({
      title: "Image Selected",
      description: "Image will be uploaded when you save the product.",
    })
  }

  const handleDrop = (id: number, e: React.DragEvent) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(id, files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleStockChange = (warehouseId: number, on_hand: number) => {
    setStocks(stocks.map((stock) => (stock.warehouse_id === warehouseId ? { ...stock, on_hand } : stock)))
  }

  const uploadPendingImages = async (): Promise<ProductImage[]> => {
    const imagesToUpload = imageStates.filter((img) => img.file && img.isLocalFile)
    const existingImages = imageStates.filter((img) => !img.isLocalFile && img.url)

    if (imagesToUpload.length === 0) {
      // 只返回现有图片
      return existingImages.map((img) => ({
        id: img.id,
        url: img.url,
        alt: img.alt,
        is_primary: img.is_primary,
      }))
    }

    try {
      setIsUploading(true)

      // 批量上传新图片
      const uploadResult = await uploadFiles({
        files: imagesToUpload.map((img) => img.file!),
        folder: "products",
      }).unwrap()

      // 合并上传结果和现有图片
      const uploadedImages: ProductImage[] = imagesToUpload.map((img, index) => ({
        id: img.id,
        url: uploadResult[index].url,
        alt: img.alt,
        is_primary: img.is_primary,
      }))
      
      const allImages = [
        ...existingImages.map((img) => ({
          id: img.id,
          url: img.url,
          alt: img.alt,
          is_primary: img.is_primary,
        })),
        ...uploadedImages,
      ]

      // 清理本地预览URL
      imagesToUpload.forEach((img) => {
        if (img.url.startsWith("blob:")) {
          URL.revokeObjectURL(img.url)
        }
      })

      return allImages
    } catch (error: any) {
      throw new Error(error.data?.message || "Failed to upload images")
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsUploading(true)

      // 上传待处理的图片
      const productImages = await uploadPendingImages()
       console.log(productImages);
        
      const now = new Date().toISOString()

      const productData = {
        ...(formData as Omit<Product, "id" | "version" | "created_at" | "updated_at">),
        images: productImages,
        stocks: stocks,
        last_update: now,
      }
     console.log(productData);
      await onSave(productData)
    } catch (error: any) {
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save product. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const hasLocalImages = imageStates.some((img) => img.isLocalFile)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="specs">Specifications</TabsTrigger>
          <TabsTrigger value="stock">Stock & Pricing</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="additional">Additional</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="djj_code">DJJ Code *</Label>
              <Input
                id="djj_code"
                value={formData.djj_code || ""}
                onChange={(e) => setFormData({ ...formData, djj_code: e.target.value })}
                required
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as Product["status"] })}
              >
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending_tech">Pending Tech</SelectItem>
                   <SelectItem value="pending_purchase">Pending Purchase</SelectItem>
                    <SelectItem value="pending_finance">Pending Finance</SelectItem>
                    <SelectItem value="ready_published">Ready to Publish</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier *</Label>
              <Input
                id="supplier"
                value={formData.supplier || ""}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                required
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manufacturer_code">Manufacturer Code</Label>
              <Input
                id="manufacturer_code"
                value={formData.manufacturer_code || ""}
                onChange={(e) => setFormData({ ...formData, manufacturer_code: e.target.value })}
                className="h-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value as Product["category"] })}
              >
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Machine">Machine</SelectItem>
                  <SelectItem value="Parts">Parts</SelectItem>
                  <SelectItem value="Tools">Tools</SelectItem>
                  <SelectItem value="Accessories">Accessories</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subcategory">Subcategory</Label>
              <Input
                id="subcategory"
                value={formData.subcategory || ""}
                onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tertiary_category">Tertiary Category</Label>
              <Input
                id="tertiary_category"
                value={formData.tertiary_category || ""}
                onChange={(e) => setFormData({ ...formData, tertiary_category: e.target.value })}
                className="h-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name_en">English Name *</Label>
              <Input
                id="name_en"
                value={formData.name_en || ""}
                onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                required
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name_cn">Chinese Name</Label>
              <Input
                id="name_cn"
                value={formData.name_cn || ""}
                onChange={(e) => setFormData({ ...formData, name_cn: e.target.value })}
                className="h-10"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="specs" className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="specs">Specifications</Label>
              <Textarea
                id="specs"
                value={formData.specs || ""}
                onChange={(e) => setFormData({ ...formData, specs: e.target.value })}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="standards">Standards</Label>
              <Input
                id="standards"
                value={formData.standards || ""}
                onChange={(e) => setFormData({ ...formData, standards: e.target.value })}
                className="h-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="weight_kg">Weight (kg)</Label>
              <Input
                id="weight_kg"
                type="number"
                value={formData.weight_kg || 0}
                onChange={(e) => setFormData({ ...formData, weight_kg: Number.parseFloat(e.target.value) || 0 })}
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lift_capacity_kg">Lift Capacity (kg)</Label>
              <Input
                id="lift_capacity_kg"
                type="number"
                value={formData.lift_capacity_kg || ""}
                onChange={(e) =>
                  setFormData({ ...formData, lift_capacity_kg: Number.parseFloat(e.target.value) || undefined })
                }
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lift_height_mm">Lift Height (mm)</Label>
              <Input
                id="lift_height_mm"
                type="number"
                value={formData.lift_height_mm || ""}
                onChange={(e) =>
                  setFormData({ ...formData, lift_height_mm: Number.parseFloat(e.target.value) || undefined })
                }
                className="h-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="power_source">Power Source</Label>
              <Input
                id="power_source"
                value={formData.power_source || ""}
                onChange={(e) => setFormData({ ...formData, power_source: e.target.value })}
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                value={formData.unit || ""}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="h-10"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="stock" className="space-y-6">
          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => setFormData({ ...formData, currency: value })}
              >
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AUD">AUD</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rrp_price">RRP Price</Label>
              <Input
                id="rrp_price"
                type="number"
                step="0.01"
                value={formData.rrp_price || 0}
                onChange={(e) => setFormData({ ...formData, rrp_price: Number.parseFloat(e.target.value) || 0 })}
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="standard_warranty">Standard Warranty</Label>
              <Input
                id="standard_warranty"
                value={formData.standard_warranty || ""}
                onChange={(e) => setFormData({ ...formData, standard_warranty: e.target.value })}
                className="h-10"
              />
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-lg font-semibold">Stock Levels</Label>
            <div className="grid grid-cols-3 gap-6">
              {stocks.map((stock) => (
                <div key={stock.warehouse_id} className="space-y-2">
                  <Label htmlFor={`stock_${stock.warehouse_id}`}>{stock.warehouse_name} Stock</Label>
                  <Input
                    id={`stock_${stock.warehouse_id}`}
                    type="number"
                    value={stock.on_hand}
                    onChange={(e) => handleStockChange(stock.warehouse_id, Number.parseInt(e.target.value) || 0)}
                    className="h-10"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="monthly_sales">Monthly Sales</Label>
              <Input
                id="monthly_sales"
                type="number"
                value={formData.monthly_sales || 0}
                onChange={(e) => setFormData({ ...formData, monthly_sales: Number.parseInt(e.target.value) || 0 })}
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="total_sales">Total Sales</Label>
              <Input
                id="total_sales"
                type="number"
                value={formData.total_sales || 0}
                onChange={(e) => setFormData({ ...formData, total_sales: Number.parseInt(e.target.value) || 0 })}
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profit_margin">Profit Margin</Label>
              <Input
                id="profit_margin"
                type="number"
                step="0.01"
                value={formData.profit_margin || 0}
                onChange={(e) => setFormData({ ...formData, profit_margin: Number.parseFloat(e.target.value) || 0 })}
                className="h-10"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="images" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <Label className="text-lg font-semibold">Product Images</Label>
              {hasLocalImages && (
                <p className="text-sm text-blue-600 mt-1 flex items-center gap-1">
                  <Upload className="h-4 w-4" />
                  Images will be uploaded when you save the product
                </p>
              )}
            </div>
            <Button type="button" onClick={handleAddImage} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Image
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {imageStates.map((image, index) => {
              const viewLabels = ["Front View", "Side View", "Interior View"]
              const viewLabel = index < 3 ? viewLabels[index] : `View ${index + 1}`

              return (
                <Card
                  key={image.id}
                  className="overflow-hidden border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md"
                >
                  <div className="p-4 space-y-4">
                    {/* Header with badges */}
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs font-medium bg-gray-50">
                        {viewLabel}
                      </Badge>
                      <div className="flex items-center gap-2">
                        {image.isLocalFile && (
                          <Badge className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200">📁 Local</Badge>
                        )}
                        {!image.isLocalFile && image.url && (
                          <Badge className="text-xs bg-green-100 text-green-700 hover:bg-green-200">☁️ Uploaded</Badge>
                        )}
                        {index >= 3 && (
                          <Button
                            type="button"
                            onClick={() => handleRemoveImage(image.id)}
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Image Upload/Display Area */}
                    <div
                      className="relative group cursor-pointer"
                      onDrop={(e) => handleDrop(image.id, e)}
                      onDragOver={handleDragOver}
                      onClick={() => {
                        const input = document.createElement("input")
                        input.type = "file"
                        input.accept = "image/*"
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0]
                          if (file) handleFileSelect(image.id, file)
                        }
                        input.click()
                      }}
                    >
                      {image.url ? (
                        <div className="relative">
                          <div className="aspect-[4/3] w-full overflow-hidden rounded-lg border-2 border-gray-200 bg-gray-50">
                            <img
                              src={image.url || "/placeholder.svg"}
                              alt={image.alt || viewLabel}
                              className="w-full h-auto object-contain transition-transform duration-200 group-hover:scale-105"
                              onError={(e) => {
                                console.error("Image failed to load:", image.url)
                                e.currentTarget.src = "/placeholder.svg?height=200&width=300&text=Failed+to+load"
                              }}
                              onLoad={() => {
                                console.log("Image loaded successfully:", image.url)
                              }}
                            />
                          </div>

                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white text-center">
                              <Upload className="h-6 w-6 mx-auto mb-1" />
                              <span className="text-sm font-medium">Change Image</span>
                            </div>
                          </div>

                          {/* Success indicator */}
                          <div className="absolute top-2 right-2">
                            <div className="bg-white rounded-full p-1 shadow-sm">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="aspect-[4/3] w-full border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:border-gray-400 hover:bg-gray-100 transition-colors duration-200 flex flex-col items-center justify-center p-6">
                          <Upload className="h-10 w-10 text-gray-400 mb-3" />
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-700 mb-1">Upload {viewLabel}</p>
                            <p className="text-xs text-gray-500 mb-2">Drag & drop or click to browse</p>
                            <p className="text-xs text-gray-400">PNG, JPG, GIF up to 10MB</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Description Input */}
                    <div className="space-y-2">
                      <Label htmlFor={`image_alt_${image.id}`} className="text-sm font-medium text-gray-700">
                        Description
                      </Label>
                      <Input
                        id={`image_alt_${image.id}`}
                        value={image.alt}
                        onChange={(e) => handleImageChange(image.id, "alt", e.target.value)}
                        placeholder={`Describe the ${viewLabel.toLowerCase()}`}
                        className="h-9 text-sm"
                      />
                    </div>

                    {/* Primary Image Toggle */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`image_primary_${image.id}`}
                          checked={image.is_primary}
                          onChange={(e) => handleImageChange(image.id, "is_primary", e.target.checked)}
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 focus:ring-2"
                        />
                        <Label htmlFor={`image_primary_${image.id}`} className="text-sm font-medium text-gray-700">
                          Primary Image
                        </Label>
                      </div>

                      {image.is_primary && (
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 text-xs">⭐ Primary</Badge>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>

          {imageStates.length === 0 && (
            <div className="text-center py-16 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              <ImageIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2 text-gray-600">No images added yet</p>
              <p className="text-sm text-gray-500 mb-4">Add product photos to showcase your items</p>
              <Button type="button" onClick={handleAddImage} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add First Image
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="additional" className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="warranty">Warranty Details</Label>
            <Textarea
              id="warranty"
              value={formData.warranty || ""}
              onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="marketing_info">Marketing Information</Label>
            <Textarea
              id="marketing_info"
              value={formData.marketing_info || ""}
              onChange={(e) => setFormData({ ...formData, marketing_info: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="training_docs">Training Documents</Label>
            <Textarea
              id="training_docs"
              value={formData.training_docs || ""}
              onChange={(e) => setFormData({ ...formData, training_docs: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="product_url">Product URL</Label>
              <Input
                id="product_url"
                type="url"
                value={formData.product_url || ""}
                onChange={(e) => setFormData({ ...formData, product_url: e.target.value })}
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                id="remarks"
                value={formData.remarks || ""}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                rows={3}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading || isUploading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || isUploading}>
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading Images...
            </>
          ) : isLoading ? (
            "Saving..."
          ) : product ? (
            "Update Product"
          ) : (
            "Create Product"
          )}
        </Button>
      </div>
    </form>
  )
}
