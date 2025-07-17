"use client"

import React, { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useGetQuoteByIdQuery, useGenerateQuotePdfMutation, useGetQuoteStockStatusQuery } from '../quotesApi'
import type { Quote } from "@/lib/types/quote"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Download,
  Edit,
  Printer,
  Copy,
  Trash2,
  FileText,
  User,
  Building,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  Package,
  Truck,
  ClipboardList,
  Loader2,
} from "lucide-react"

export default function QuoteDetailPage() {
  const navigate = useNavigate()
  // 从 URL 拿到 :id
  const { id } = useParams<{ id: string }>()
  // const [quote, setQuote] = useState<Quote | null>(null)
  const [loading, setLoading] = useState(true)
  // const [generatingPdf, setGeneratingPdf] = useState(false)

  // 用 RTK Query 取单条
  const {
    data: quote,
    isLoading,
    isError,
  } = useGetQuoteByIdQuery(id ?? '', {
    // 如果 id 可能 undefined，可以用 skip
    skip: !id,
  })

  // 获取库存状态
  const {
    data: stockStatus,
    isLoading: stockLoading,
    isError: stockError,
  } = useGetQuoteStockStatusQuery(id ?? '', {
    skip: !id,
  })

  // 用 RTK Query 生成 PDF
  const [generatePdf, { isLoading: generatingPdf }] = useGenerateQuotePdfMutation()
  console.log(quote);
  
  
  // useEffect(() => {
  //   if (!id) {
  //     // 没有 id，直接回列表
  //     navigate("/quotes", { replace: true })
  //     return
  //   }

  //   const fetchQuote = async () => {
  //     try {
  //       const data = await getQuoteById(id)
  //       if (data) {
  //         setQuote(data)
  //       } else {
  //         // 不存在时回列表
  //         navigate("/quotes", { replace: true })
  //       }
  //     } catch (error) {
  //       console.error("Failed to fetch quote:", error)
  //       navigate("/quotes", { replace: true })
  //     } finally {
  //       setLoading(false)
  //     }
  //   }

  //   fetchQuote()
  // }, [id, navigate])

  // const handleGeneratePdf = async () => {
  //   if (!quote) return

  //   try {
  //     setGeneratingPdf(true)
  //     const pdfUrl = await generateQuotePdf(quote.id)

  //     setQuote((prev) =>
  //       prev
  //         ? {
  //             ...prev,
  //             status: {
  //               ...prev.status,
  //               pdfUrl,
  //               pdfGenerationStatus: "success",
  //             },
  //           }
  //         : prev
  //     )
  //     window.open(pdfUrl, "_blank")
  //   } catch (error) {
  //     console.error("Failed to generate PDF:", error)
  //   } finally {
  //     setGeneratingPdf(false)
  //   }
  // }

    const handleGeneratePdf = async () => {
    if (!quote) return
    try {
      const pdfBlob = await generatePdf(quote.id).unwrap()
      const pdfUrl = URL.createObjectURL(pdfBlob)
      
      // 创建下载链接
      const link = document.createElement('a')
      link.href = pdfUrl
      link.download = `quote-${quote.quoteNumber}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // 清理URL对象
      URL.revokeObjectURL(pdfUrl)
    } catch (err) {
      console.error(err)
    }
  }


  const formatCurrency = (amount: number, currency = "AUD") =>
    new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency,
    }).format(amount)

  const formatDate = (date?: Date) =>
    date
      ? new Intl.DateTimeFormat("en-AU", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }).format(new Date(date))
      : "—"

  const getStatusBadge = (status: Quote["status"]) => {
    if (status.inStockApproval === "approve")
      return <Badge className="bg-green-500">Approved</Badge>
    if (status.inStockApproval === "reject")
      return <Badge className="bg-red-500">Rejected</Badge>
    return <Badge className="bg-yellow-500">Pending</Badge>
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    )
  }

  if (!quote) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Quote not found</h2>
          <p className="mt-2 text-gray-600">
            The quote you're looking for doesn't exist or has been removed.
          </p>
          <Button className="mt-4" onClick={() => navigate("/quotes")}>
            Back to Quotes
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/quotes")}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Quote {quote.quoteNumber}</h1>
          {getStatusBadge(quote.status)}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/quotes/${quote.id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleGeneratePdf}
            disabled={generatingPdf}
          >
            {generatingPdf ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-1" />
                Download PDF
              </>
            )}
          </Button>
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-1" />
            Print
          </Button>
          <Button variant="outline" size="sm">
            <Copy className="h-4 w-4 mr-1" />
            Duplicate
          </Button>
          <Button variant="destructive" size="sm">
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </div>

      {/* Tabs & Content */}
      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Quote Details</TabsTrigger>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="stock-status">Stock Status</TabsTrigger>
          <TabsTrigger value="product-info">Product Info</TabsTrigger>
          <TabsTrigger value="remarks">Remarks</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">{quote.customer.name}</h3>
                  {quote.customerABN && <p className="text-sm text-gray-500">ABN: {quote.customerABN}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {quote.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{quote.phone}</span>
                    </div>
                  )}

                  {quote.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span>{quote.email}</span>
                    </div>
                  )}
                </div>

                {(quote.billingAddress || quote.deliveryAddress) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    {quote.billingAddress && (
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">Billing Address</span>
                        </div>
                        <div className="text-sm pl-6">
                          <p>{quote.billingAddress.line1}</p>
                          {quote.billingAddress.line2 && <p>{quote.billingAddress.line2}</p>}
                          <p>
                            {[quote.billingAddress.city, quote.billingAddress.state, quote.billingAddress.postcode]
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                          {quote.billingAddress.country && <p>{quote.billingAddress.country}</p>}
                        </div>
                      </div>
                    )}

                    {quote.deliveryAddress && (
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Truck className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">Delivery Address</span>
                        </div>
                        <div className="text-sm pl-6">
                          <p>{quote.deliveryAddress.line1}</p>
                          {quote.deliveryAddress.line2 && <p>{quote.deliveryAddress.line2}</p>}
                          <p>
                            {[quote.deliveryAddress.city, quote.deliveryAddress.state, quote.deliveryAddress.postcode]
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                          {quote.deliveryAddress.country && <p>{quote.deliveryAddress.country}</p>}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Quote Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Quote Number</p>
                    <p className="font-medium">{quote.quoteNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Quote Date</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <p className="font-medium">{formatDate(quote.quoteDate)}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-sm text-gray-500 mb-1">Quote Amount</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm">Subtotal</p>
                      <p className="font-medium">{formatCurrency(quote.amounts.subTotal, quote.amounts.currency)}</p>
                    </div>
                    <div>
                      <p className="text-sm">GST</p>
                      <p className="font-medium">{formatCurrency(quote.amounts.gstTotal, quote.amounts.currency)}</p>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <p className="font-medium">Total</p>
                      <p className="text-xl font-bold text-green-600">
                        {formatCurrency(quote.amounts.total, quote.amounts.currency)}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  {quote.salesRep && (
                    <div>
                      <p className="text-sm text-gray-500">Sales Representative</p>
                      <p className="font-medium">{quote.salesRep}</p>
                    </div>
                  )}

                  {quote.store && (
                    <div>
                      <p className="text-sm text-gray-500">Store</p>
                      <p className="font-medium">{quote.store.name}</p>
                    </div>
                  )}
                </div>

                {quote.quoteRef && (
                  <div>
                    <p className="text-sm text-gray-500">Quote Reference</p>
                    <p className="font-medium">{quote.quoteRef}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Company Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">{quote.company.name}</h3>
                  {quote.company.abn && <p className="text-sm text-gray-500">ABN: {quote.company.abn}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {quote.company.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{quote.company.phone}</span>
                    </div>
                  )}

                  {quote.company.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span>{quote.company.email}</span>
                    </div>
                  )}
                </div>

                {quote.company.address && (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">Company Address</span>
                    </div>
                    <div className="text-sm pl-6">
                      <p>{quote.company.address}</p>
                    </div>
                  </div>
                )}

                {quote.company.bankDetails && (
                  <div className="pt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">Bank Details</span>
                    </div>
                    <div className="text-sm pl-6">
                      {quote.company.bankDetails.bankName && <p>Bank: {quote.company.bankDetails.bankName}</p>}
                      {quote.company.bankDetails.bsb && <p>BSB: {quote.company.bankDetails.bsb}</p>}
                      {quote.company.bankDetails.accountNumber && <p>Account: {quote.company.bankDetails.accountNumber}</p>}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Status Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Approval Status</p>
                    <div className="mt-1">
                      <Badge 
                        className={
                          quote.status === "approved" ? "bg-green-500" : 
                          quote.status === "rejected" ? "bg-red-500" : 
                          "bg-yellow-500"
                        }
                      >
                        {quote.status === "approved" ? "Approved" : 
                         quote.status === "rejected" ? "Rejected" : 
                         "Pending"}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Stock Status</p>
                    {(() => {
                      if (stockLoading) {
                        return <Badge className="bg-gray-500">Loading...</Badge>
                      }
                      
                      if (stockError || !stockStatus) {
                        return <Badge className="bg-red-500">Error Loading</Badge>
                      }

                      // 基于实际库存状态显示
                      const statusColorMap = {
                        'available': 'bg-green-500',
                        'partial': 'bg-yellow-500',
                        'unavailable': 'bg-red-500',
                        'unknown': 'bg-gray-500'
                      }

                      const statusTextMap = {
                        'available': 'Available',
                        'partial': `Partial (${stockStatus.availableItems}/${stockStatus.totalItems})`,
                        'unavailable': 'Unavailable',
                        'unknown': 'Unknown'
                      }

                      return (
                        <Badge className={statusColorMap[stockStatus.overallStatus]}>
                          {statusTextMap[stockStatus.overallStatus]}
                        </Badge>
                      )
                    })()}
                  </div>
                </div>

                {/* 暂时隐藏库存时间，等待实际库存集成 */}
                {false && (
                  <div>
                    <p className="text-sm text-gray-500">In Stock Since</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <p className="font-medium">Not Available</p>
                    </div>
                  </div>
                )}

                <Separator />

                <div>
                  <p className="text-sm text-gray-500 mb-1">Documents</p>
                  <div className="space-y-2">
                    {/* PDF生成按钮 */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={handleGeneratePdf}
                      disabled={generatingPdf}
                    >
                      {generatingPdf ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating PDF...
                        </>
                      ) : (
                        <>
                          <FileText className="h-4 w-4 mr-2" />
                          Generate Quote PDF
                        </>
                      )}
                    </Button>

                    {/* 显示附件中的文档 */}
                    {quote.attachments && quote.attachments.length > 0 && (
                      quote.attachments.map((attachment, index) => (
                        <Button key={index} variant="outline" size="sm" className="w-full justify-start" asChild>
                          <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                            <FileText className="h-4 w-4 mr-2" />
                            {attachment.fileName}
                          </a>
                        </Button>
                      ))
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Created By</p>
                  <p className="font-medium">{quote.salesRepUser?.username || 'Unknown'}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 附件信息 - 放在grid中作为第5个卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Attachments & Files
                </CardTitle>
              </CardHeader>
              <CardContent>
                {quote.attachments && quote.attachments.length > 0 ? (
                  <div className="space-y-2">
                    {quote.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="font-medium">{attachment.fileName}</p>
                            <p className="text-sm text-gray-500">
                              {attachment.fileSize ? `${(attachment.fileSize / 1024).toFixed(1)} KB` : ''} • 
                              {attachment.fileType || 'Unknown type'}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(attachment.url, '_blank')}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No attachments found</p>
                    <p className="text-sm">Files uploaded with the quote will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* 空白卡片或者添加其他信息 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Additional Info
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Sales Representative</p>
                    <p className="font-medium">{quote.salesRepUser?.username || 'Not assigned'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Store</p>
                    <p className="font-medium">{quote.store?.name || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Created Date</p>
                    <p className="font-medium">{formatDate(quote.createdAt)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="items" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Quote Items ({quote.items?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {quote.items && quote.items.length > 0 ? (
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product Details
                        </th>
                        <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Unit
                        </th>
                        <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Unit Price
                        </th>
                        <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Discount
                        </th>
                        <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {quote.items.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div className="space-y-2">
                              {/* 产品名称 */}
                              <div>
                                <p className="font-medium text-gray-900">{item.description}</p>
                                {item.product?.name && item.product.name !== item.description && (
                                  <p className="text-sm text-gray-600">({item.product.name})</p>
                                )}
                              </div>
                              
                              {/* 产品代码 */}
                              {item.product?.djjCode && (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                                    {item.product.djjCode}
                                  </span>
                                </div>
                              )}
                              
                              {/* 主机号信息 - VIN/Engine */}
                              {item.product?.vinEngine && (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs bg-yellow-100 px-2 py-1 rounded font-mono">
                                    VIN/Engine: {item.product.vinEngine}
                                  </span>
                                </div>
                              )}
                              
                              {/* 机器型号 */}
                              {item.product?.model && (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs bg-blue-100 px-2 py-1 rounded font-mono">
                                    Model: {item.product.model}
                                  </span>
                                </div>
                              )}
                              
                              {/* 制造商代码 */}
                              {item.product?.manufacturerCode && (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs bg-purple-100 px-2 py-1 rounded font-mono">
                                    Mfg Code: {item.product.manufacturerCode}
                                  </span>
                                </div>
                              )}
                              
                              {/* 详细描述 */}
                              {item.detailDescription && (
                                <div>
                                  <p className="text-sm text-gray-600 italic">{item.detailDescription}</p>
                                </div>
                              )}
                              
                              {/* 产品ID */}
                              {item.productId && (
                                <p className="text-xs text-gray-400">Product ID: {item.productId}</p>
                              )}
                              
                              {/* 货物性质 */}
                              {item.goodsNature && (
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {item.goodsNature}
                                  </Badge>
                                </div>
                              )}
                              
                              {/* 创建时间 */}
                              {item.createdAt && (
                                <p className="text-xs text-gray-400">
                                  Added: {formatDate(item.createdAt)}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center">{item.quantity}</td>
                          <td className="py-4 px-4 text-center">{item.unit}</td>
                          <td className="py-4 px-4 text-right">
                            {formatCurrency(item.unitPrice, quote.amounts.currency)}
                          </td>
                          <td className="py-4 px-4 text-right">
                            {item.discount ? formatCurrency(item.discount, quote.amounts.currency) : "—"}
                          </td>
                          <td className="py-4 px-4 text-right font-medium">
                            {formatCurrency(item.totalPrice, quote.amounts.currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t bg-gray-50">
                        <td colSpan={5} className="py-3 px-4 text-right font-medium">
                          Subtotal:
                        </td>
                        <td className="py-3 px-4 text-right font-medium">
                          {formatCurrency(quote.amounts.subTotal, quote.amounts.currency)}
                        </td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td colSpan={5} className="py-3 px-4 text-right font-medium">
                          GST:
                        </td>
                        <td className="py-3 px-4 text-right font-medium">
                          {formatCurrency(quote.amounts.gstTotal, quote.amounts.currency)}
                        </td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td colSpan={5} className="py-3 px-4 text-right font-medium text-lg">
                          Total:
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-lg text-green-600">
                          {formatCurrency(quote.amounts.total, quote.amounts.currency)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>No items in this quote</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* 详细产品信息卡片 */}
          {quote.items && quote.items.length > 0 && (
            <div className="grid gap-4">
              {quote.items.map((item, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      {item.description}
                      {item.product?.djjCode && (
                        <Badge variant="secondary" className="font-mono">
                          {item.product.djjCode}
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* 基本信息 */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900 border-b pb-1">Basic Information</h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-gray-500">Description:</span>
                            <p className="font-medium">{item.description}</p>
                          </div>
                          
                          {item.product?.name && (
                            <div>
                              <span className="text-gray-500">Product Name:</span>
                              <p className="font-medium">{item.product.name}</p>
                            </div>
                          )}
                          
                          {item.detailDescription && (
                            <div>
                              <span className="text-gray-500">Detail Description:</span>
                              <p className="font-medium">{item.detailDescription}</p>
                            </div>
                          )}
                          
                          {item.productId && (
                            <div>
                              <span className="text-gray-500">Product ID:</span>
                              <p className="font-medium">{item.productId}</p>
                            </div>
                          )}
                          
                          {/* 主机号信息 - VIN/Engine */}
                          {item.product?.vinEngine && (
                            <div>
                              <span className="text-gray-500">VIN/Engine:</span>
                              <p className="font-medium font-mono bg-yellow-50 px-2 py-1 rounded">
                                {item.product.vinEngine}
                              </p>
                            </div>
                          )}
                          
                          {/* 机器型号 */}
                          {item.product?.model && (
                            <div>
                              <span className="text-gray-500">Model:</span>
                              <p className="font-medium">{item.product.model}</p>
                            </div>
                          )}
                          
                          {/* 制造商信息 */}
                          {item.product?.manufacturer && (
                            <div>
                              <span className="text-gray-500">Manufacturer:</span>
                              <p className="font-medium">{item.product.manufacturer}</p>
                            </div>
                          )}
                          
                          {item.product?.manufacturerCode && (
                            <div>
                              <span className="text-gray-500">Manufacturer Code:</span>
                              <p className="font-medium font-mono bg-purple-50 px-2 py-1 rounded">
                                {item.product.manufacturerCode}
                              </p>
                            </div>
                          )}
                          
                          {/* 规格信息 */}
                          {item.product?.specs && (
                            <div>
                              <span className="text-gray-500">Specifications:</span>
                              <p className="font-medium">{item.product.specs}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* 数量和价格 */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900 border-b pb-1">Quantity & Pricing</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Quantity:</span>
                            <span className="font-medium">{item.quantity} {item.unit}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Unit Price:</span>
                            <span className="font-medium">{formatCurrency(item.unitPrice, quote.amounts.currency)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Discount:</span>
                            <span className="font-medium">
                              {item.discount ? formatCurrency(item.discount, quote.amounts.currency) : "—"}
                            </span>
                          </div>
                          <div className="flex justify-between border-t pt-2">
                            <span className="text-gray-500">Total:</span>
                            <span className="font-bold text-green-600">
                              {formatCurrency(item.totalPrice, quote.amounts.currency)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* 其他信息 */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900 border-b pb-1">Additional Details</h4>
                        <div className="space-y-2 text-sm">
                          {item.goodsNature && (
                            <div>
                              <span className="text-gray-500">Goods Nature:</span>
                              <Badge variant="outline" className="ml-2">
                                {item.goodsNature}
                              </Badge>
                            </div>
                          )}
                          
                          {/* 产品类别 */}
                          {item.product?.category && (
                            <div>
                              <span className="text-gray-500">Category:</span>
                              <p className="font-medium">{item.product.category}</p>
                            </div>
                          )}
                          
                          {/* 供应商 */}
                          {item.product?.supplier && (
                            <div>
                              <span className="text-gray-500">Supplier:</span>
                              <p className="font-medium">{item.product.supplier}</p>
                            </div>
                          )}
                          
                          {/* 保修信息 */}
                          {item.product?.warranty && (
                            <div>
                              <span className="text-gray-500">Warranty:</span>
                              <p className="font-medium">{item.product.warranty}</p>
                            </div>
                          )}
                          
                          {/* 标准 */}
                          {item.product?.standards && (
                            <div>
                              <span className="text-gray-500">Standards:</span>
                              <p className="font-medium">{item.product.standards}</p>
                            </div>
                          )}
                          
                          {item.createdAt && (
                            <div>
                              <span className="text-gray-500">Added:</span>
                              <p className="font-medium">{formatDate(item.createdAt)}</p>
                            </div>
                          )}
                          
                          <div>
                            <span className="text-gray-500">Item ID:</span>
                            <p className="font-medium">{item.id}</p>
                          </div>
                          
                          <div>
                            <span className="text-gray-500">Quote ID:</span>
                            <p className="font-medium">{item.quoteId}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {/* Remarks Section */}
          {(quote.remarks && quote.remarks.length > 0 && (quote.remarks[0].general || quote.remarks[0].warrantyAndSpecial)) || quote.warrantyNotes ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Remarks & Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {quote.remarks && quote.remarks.length > 0 && (
                  <>
                    {quote.remarks[0].general && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">General Remarks</p>
                        <p className="text-sm bg-gray-50 p-3 rounded border">{quote.remarks[0].general}</p>
                      </div>
                    )}
                    {quote.remarks[0].warrantyAndSpecial && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Warranty & Special Notes</p>
                        <p className="text-sm bg-gray-50 p-3 rounded border">{quote.remarks[0].warrantyAndSpecial}</p>
                      </div>
                    )}
                  </>
                )}
                {quote.warrantyNotes && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Warranty Notes</p>
                    <p className="text-sm bg-gray-50 p-3 rounded border">{quote.warrantyNotes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : null}
        </TabsContent>

        <TabsContent value="stock-status" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Stock Status Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stockLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Loading stock status...</span>
                </div>
              ) : stockError || !stockStatus ? (
                <div className="text-center py-8 text-red-500">
                  <Package className="h-12 w-12 mx-auto mb-3 text-red-400" />
                  <p>Failed to load stock status</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* 整体状态汇总 */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Overall Status</p>
                      <Badge className={
                        stockStatus.overallStatus === 'available' ? 'bg-green-500' :
                        stockStatus.overallStatus === 'partial' ? 'bg-yellow-500' :
                        stockStatus.overallStatus === 'unavailable' ? 'bg-red-500' : 'bg-gray-500'
                      }>
                        {stockStatus.overallStatus.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Total Items</p>
                      <p className="text-lg font-semibold">{stockStatus.totalItems}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Available Items</p>
                      <p className="text-lg font-semibold text-green-600">{stockStatus.availableItems}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Checked At</p>
                      <p className="text-sm">{stockStatus.checkedAt}</p>
                    </div>
                  </div>

                  {/* 详细项目状态 */}
                  <div className="space-y-4">
                    {stockStatus.items.map((item, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold">{item.description}</h4>
                            {item.productCode && (
                              <p className="text-sm text-gray-500">Code: {item.productCode}</p>
                            )}
                            {item.productName && (
                              <p className="text-sm text-gray-500">Product: {item.productName}</p>
                            )}
                          </div>
                          <Badge className={
                            item.status === 'available' ? 'bg-green-500' :
                            item.status === 'partial' ? 'bg-yellow-500' :
                            item.status === 'unavailable' ? 'bg-red-500' : 'bg-gray-500'
                          }>
                            {item.status.toUpperCase()}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                          <div>
                            <p className="text-sm text-gray-500">Requested</p>
                            <p className="font-medium">{item.requestedQty} {item.unit}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Available</p>
                            <p className="font-medium text-green-600">{item.availableQty} {item.unit}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Status</p>
                            <p className="font-medium">
                              {item.availableQty >= item.requestedQty ? 'Sufficient' : 
                               item.availableQty > 0 ? 'Insufficient' : 'Out of Stock'}
                            </p>
                          </div>
                        </div>

                        {/* 仓库库存详情 */}
                        {item.warehouseStocks && item.warehouseStocks.length > 0 && (
                          <div className="mt-4">
                            <h5 className="font-medium mb-2">Warehouse Details</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {item.warehouseStocks.map((warehouse, wIndex) => (
                                <div key={wIndex} className="bg-gray-50 p-3 rounded">
                                  <p className="font-medium">{warehouse.warehouseName}</p>
                                  <p className="text-sm text-gray-600">{warehouse.location}</p>
                                  <div className="flex justify-between text-sm mt-1">
                                    <span>Available: {warehouse.availableQty}</span>
                                    <span>Reserved: {warehouse.reservedQty}</span>
                                    <span>Total: {warehouse.totalQty}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="product-info" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Product Information
              </CardTitle>
            </CardHeader>
            {/* <CardContent>
              {quote.productInfo ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {quote.productInfo.engineNumber && (
                    <div>
                      <p className="text-sm text-gray-500">Engine Number</p>
                      <p className="font-medium">{quote.productInfo.engineNumber}</p>
                    </div>
                  )}

                  {quote.productInfo.chassisNumber && (
                    <div>
                      <p className="text-sm text-gray-500">Chassis Number</p>
                      <p className="font-medium">{quote.productInfo.chassisNumber}</p>
                    </div>
                  )}

                  {quote.productInfo.productionDate && (
                    <div>
                      <p className="text-sm text-gray-500">Production Date</p>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <p className="font-medium">{formatDate(quote.productInfo.productionDate)}</p>
                      </div>
                    </div>
                  )}

                  {quote.productInfo.certificateAttachmentUrl && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Certificate</p>
                      <Button variant="outline" size="sm" asChild>
                        <a href={quote.productInfo.certificateAttachmentUrl} target="_blank" rel="noopener noreferrer">
                          <FileText className="h-4 w-4 mr-2" />
                          View Certificate
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>No product information available</p>
                </div>
              )}
            </CardContent> */}

<CardContent>
  {quote.items && quote.items.length > 0 ? (
    <div className="space-y-6">
      {quote.items.map((item) => (
        <div key={item.id} className="p-4 border rounded-lg bg-gray-50">
          {/* 标题 */}
          <h4 className="text-lg font-semibold text-gray-800 mb-3">
            {item.description}
          </h4>

          {/* 基本信息网格 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Quantity</p>
              <p className="font-medium text-gray-700">
                {item.quantity} {item.unit}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Unit Price</p>
              <p className="font-medium text-gray-700">
                {item.unitPrice.toFixed(2)} {quote.currency}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Discount</p>
              <p className="font-medium text-gray-700">
                {item.discount.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total</p>
              <p className="font-medium text-gray-700">
                {item.totalPrice.toFixed(2)} {quote.currency}
              </p>
            </div>
          </div>

          {/* 详细描述（可选） */}
          {item.detailDescription && (
            <p className="mt-2 text-sm text-gray-600">
              {item.detailDescription}
            </p>
          )}
        </div>
      ))}
    </div>
  ) : (
    <div className="text-center py-8 text-gray-500">
      <Package className="h-12 w-12 mx-auto mb-3 text-gray-400" />
      <p>No items available</p>
    </div>
  )}
</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="remarks" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Remarks
              </CardTitle>
            </CardHeader>
            <CardContent>
              {quote.remarks && quote.remarks.length > 0 ? (
                <div className="space-y-6">
                  {quote.remarks.map((remark, index) => (
                    <div key={index} className="space-y-4">
                      {remark.general && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">General Remarks</h3>
                          <div className="bg-gray-50 p-3 rounded-md">{remark.general}</div>
                        </div>
                      )}

                      {remark.warrantyAndSpecial && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">Warranty & Special Remarks</h3>
                          <div className="bg-gray-50 p-3 rounded-md">{remark.warrantyAndSpecial}</div>
                        </div>
                      )}

                      {remark.feedbackLoop && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">Feedback Loop</h3>
                          <div className="bg-gray-50 p-3 rounded-md">{remark.feedbackLoop}</div>
                        </div>
                      )}

                      {remark.inStockNote && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">In Stock Note</h3>
                          <div className="bg-gray-50 p-3 rounded-md">{remark.inStockNote}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ClipboardList className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>No remarks available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Quote History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Quote Creation */}
                <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <FileText className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-green-800">Quote Created</span>
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        {quote.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-green-700 mb-2">
                      Quote {quote.quoteNumber} was created with {quote.items.length} item(s)
                    </p>
                    <div className="flex items-center gap-4 text-xs text-green-600">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{quote.salesRepUser?.username || 'System'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(quote.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quote Details */}
                <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-blue-800">Quote Details</span>
                    </div>
                    <div className="text-sm text-blue-700 space-y-1">
                      <p>Total Amount: {formatCurrency(quote.amounts.total, quote.amounts.currency)}</p>
                      <p>Customer: {quote.customer.name}</p>
                      <p>Store: {quote.store.name}</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-blue-600 mt-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(quote.quoteDate)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stock Status Check */}
                {stockStatus && (
                  <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Package className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-purple-800">Stock Status Checked</span>
                        <Badge className={
                          stockStatus.overallStatus === 'available' ? 'bg-green-500' :
                          stockStatus.overallStatus === 'partial' ? 'bg-yellow-500' :
                          stockStatus.overallStatus === 'unavailable' ? 'bg-red-500' : 'bg-gray-500'
                        }>
                          {stockStatus.overallStatus}
                        </Badge>
                      </div>
                      <p className="text-sm text-purple-700 mb-2">
                        Stock availability: {stockStatus.availableItems}/{stockStatus.totalItems} items available
                      </p>
                      <div className="flex items-center gap-4 text-xs text-purple-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{stockStatus.checkedAt}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Last Updated */}
                {quote.updatedAt !== quote.createdAt && (
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <Edit className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-800">Quote Updated</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">
                        Quote information was last modified
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(quote.updatedAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
