"use client"

import React, { useState, useMemo, useEffect, useRef, forwardRef } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Autocomplete, TextField, Box, Typography, CircularProgress } from "@mui/material"
import type { InboundItem, OutboundItem } from "@/lib/types"
import { useGetProductsQuery } from "@/features/products/productsApi"
import type { Product } from "@/features/products/types"

// 产品类型映射 - 对应后端枚举
const PRODUCT_TYPES = {
  machine: "Machine",
  parts: "Parts", 
  attachment: "Attachment",
  tools: "Tools",
  others: "Others"
} as const

// 产品缓存管理
class ProductCache {
  private static instance: ProductCache
  private cache: Product[] = []
  private isLoaded = false

  static getInstance(): ProductCache {
    if (!ProductCache.instance) {
      ProductCache.instance = new ProductCache()
    }
    return ProductCache.instance
  }

  setProducts(products: Product[]) {
    this.cache = products
    this.isLoaded = true
  }

  getProducts(): Product[] {
    return this.cache
  }

  isDataLoaded(): boolean {
    return this.isLoaded
  }

  clear() {
    this.cache = []
    this.isLoaded = false
  }
}


const formSchema = z.object({
  product: z.object({
    id: z.number(),
    djj_code: z.string(),
    name_cn: z.string(),
    category: z.string(),
  }).nullable().refine((val) => val !== null, "Product is required"),
  type: z.string().min(1, "Type is required"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  unitPrice: z.coerce.number().min(0, "Unit price must be non-negative"),
  vin: z.string().optional(),
  serial: z.string().optional(),
  addLoan: z.boolean().optional(),
  remark: z.string().optional(),
})

interface AddItemDialogProps {
  open: boolean
  onClose: () => void
  onAdd: (item: InboundItem | OutboundItem) => void
  mode?: "inbound" | "outbound"
}

export function AddItemDialog({ open, onClose, onAdd, mode = "inbound" }: AddItemDialogProps) {
  const productCache = ProductCache.getInstance()
  const [cachedProducts, setCachedProducts] = useState<Product[]>([])
  const [isLoadingCache, setIsLoadingCache] = useState(false)

  // 只在需要时才加载产品数据
  const { data: productsData, isLoading: isLoadingProducts } = useGetProductsQuery({
    offset: 0,
    limit: 0, // 获取所有产品
  }, {
    skip: productCache.isDataLoaded(), // 如果已缓存则跳过查询
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      product: null,
      type: "parts",
      quantity: 1,
      unitPrice: 0,
      vin: "",
      serial: "",
      addLoan: false,
      remark: "",
    },
  })

  // 初始化缓存
  useEffect(() => {
    if (productsData?.products && !productCache.isDataLoaded()) {
      productCache.setProducts(productsData.products)
      setCachedProducts(productsData.products)
      setIsLoadingCache(false) // 缓存完成，停止加载状态
    } else if (productCache.isDataLoaded() && cachedProducts.length === 0) {
      setCachedProducts(productCache.getProducts())
      setIsLoadingCache(false)
    }
  }, [productsData, cachedProducts.length])

  // 对话框打开时确保数据已加载
  useEffect(() => {
    if (open && !productCache.isDataLoaded() && !isLoadingProducts) {
      setIsLoadingCache(true)
    } else {
      setIsLoadingCache(false)
    }
  }, [open, isLoadingProducts, productCache.isDataLoaded()])

  // 产品选项数据处理
  const productOptions = useMemo(() => {
    const options = cachedProducts.map(product => ({
      id: product.id,
      djj_code: product.djj_code,
      name_cn: product.name_cn,
      category: product.category,
      rrp_price: product.rrp_price || 0,
    }))
    return options
  }, [cachedProducts])

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!values.product) return

    onAdd({
      id: `temp-${Date.now()}`,
      productId: values.product.id, // 🔥 添加产品ID - 关键字段！
      djjCode: values.product.djj_code, // 添加DJJ编码
      name: values.product.name_cn,
      category: PRODUCT_TYPES[values.type as keyof typeof PRODUCT_TYPES], // 🔥 统一使用category字段
      quantity: values.quantity, // 🔥 统一使用quantity字段
      unitPrice: values.unitPrice, // 🔥 统一使用unitPrice字段
      vin: values.vin,
      serial: values.serial,
      addLoan: values.addLoan,
      remark: values.remark,
      source: "manual",
    })

    form.reset()
    onClose()
  }

  const watchProduct = form.watch("product")
  const watchType = form.watch("type")

  // 当选择产品时，自动设置价格和类型
  const handleProductChange = (product: typeof productOptions[0] | null) => {
    if (product) {
      form.setValue("product", product)
      form.setValue("unitPrice", product.rrp_price)
      
      // 根据产品类别自动设置类型
      const categoryTypeMap: Record<string, string> = {
        "Machine": "machine",
        "Parts": "parts",
        "Tools": "tools", 
        "Accessories": "attachment"
      }
      const autoType = categoryTypeMap[product.category] || "others"
      form.setValue("type", autoType)
    } else {
      form.setValue("product", null)
    }
  }

  const isLoading = isLoadingProducts || isLoadingCache

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add {mode === "inbound" ? "Inbound" : "Outbound"} Item</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="product"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>产品选择</FormLabel>
                  <FormControl>
                    <Autocomplete
                      disablePortal 
                      options={productOptions}
                      loading={isLoading}
                      value={field.value}
                      getOptionLabel={(option) => {
                        if (!option) return ''
                        return `${option.name_cn || '未知产品'} (${option.djj_code || 'N/A'})`
                      }}
                      isOptionEqualToValue={(option, value) => {
                        return option?.id === value?.id
                      }}
                      onChange={(_, value) => {
                        field.onChange(value)
                        if (value) {
                          handleProductChange(value)
                        }
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="搜索产品名称或编码..."
                          size="small"
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {isLoading && <CircularProgress size={20} />}
                                {params.InputProps.endAdornment}
                              </>
                            ),
                          }}
                        />
                      )}
                      renderOption={(props, option) => (
                        <li {...props} style={{ padding: '8px 16px', cursor: 'pointer' }}>
                          <div>
                            <div style={{ fontWeight: 500 }}>
                              {option.name_cn || '未知产品'}
                            </div>
                            <div style={{ fontSize: '12px', color: '#666' }}>
                              {option.djj_code} | {option.category} | ¥{option.rrp_price}
                            </div>
                          </div>
                        </li>
                      )}
                     ListboxProps={{ sx: { maxHeight: 240, overflowY: 'auto' } }}
                      noOptionsText={
                        isLoading ? "加载中..." : productOptions.length === 0 ? "暂无产品数据" : "未找到匹配的产品"
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>产品类型</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="选择产品类型" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="machine">机械设备</SelectItem>
                      <SelectItem value="parts">零部件</SelectItem>
                      <SelectItem value="attachment">附件</SelectItem>
                      <SelectItem value="tools">工具</SelectItem>
                      <SelectItem value="others">其他</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unitPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit Price</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {watchType === "machine" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="vin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>VIN Number</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="serial"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Serial Number</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="addLoan"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Add Loan</FormLabel>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            )}

            <FormField
              control={form.control}
              name="remark"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter any additional notes about this item" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Add Item</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
