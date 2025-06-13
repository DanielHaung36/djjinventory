"use client"

import React, { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { getQuoteById, generateQuotePdf } from "@/lib/services/quote-service"
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
  const [quote, setQuote] = useState<Quote | null>(null)
  const [loading, setLoading] = useState(true)
  const [generatingPdf, setGeneratingPdf] = useState(false)

  useEffect(() => {
    if (!id) {
      // 没有 id，直接回列表
      navigate("/quotes", { replace: true })
      return
    }

    const fetchQuote = async () => {
      try {
        const data = await getQuoteById(id)
        if (data) {
          setQuote(data)
        } else {
          // 不存在时回列表
          navigate("/quotes", { replace: true })
        }
      } catch (error) {
        console.error("Failed to fetch quote:", error)
        navigate("/quotes", { replace: true })
      } finally {
        setLoading(false)
      }
    }

    fetchQuote()
  }, [id, navigate])

  const handleGeneratePdf = async () => {
    if (!quote) return

    try {
      setGeneratingPdf(true)
      const pdfUrl = await generateQuotePdf(quote.id)

      setQuote((prev) =>
        prev
          ? {
              ...prev,
              status: {
                ...prev.status,
                pdfUrl,
                pdfGenerationStatus: "success",
              },
            }
          : prev
      )
      window.open(pdfUrl, "_blank")
    } catch (error) {
      console.error("Failed to generate PDF:", error)
    } finally {
      setGeneratingPdf(false)
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

  if (loading) {
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
                  <h3 className="text-lg font-semibold">{quote.customer}</h3>
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
                      <p className="font-medium">{quote.store}</p>
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
                      <p>{quote.company.address.line1}</p>
                      {quote.company.address.line2 && <p>{quote.company.address.line2}</p>}
                      <p>
                        {[quote.company.address.city, quote.company.address.state, quote.company.address.postcode]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                      {quote.company.address.country && <p>{quote.company.address.country}</p>}
                    </div>
                  </div>
                )}

                {quote.bankDetails && (
                  <div className="pt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">Bank Details</span>
                    </div>
                    <div className="text-sm pl-6">
                      {quote.bankDetails.bsb && <p>BSB: {quote.bankDetails.bsb}</p>}
                      {quote.bankDetails.accountNumber && <p>Account: {quote.bankDetails.accountNumber}</p>}
                      {quote.bankDetails.other && <p>{quote.bankDetails.other}</p>}
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
                    <div className="mt-1">{getStatusBadge(quote.status)}</div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Stock Status</p>
                    <Badge className={quote.status.inStockState === "in" ? "bg-green-500" : "bg-gray-500"}>
                      {quote.status.inStockState === "in" ? "In Stock" : "Out of Stock"}
                    </Badge>
                  </div>
                </div>

                {quote.status.inStockTime && (
                  <div>
                    <p className="text-sm text-gray-500">In Stock Since</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <p className="font-medium">{formatDate(quote.status.inStockTime)}</p>
                    </div>
                  </div>
                )}

                <Separator />

                <div>
                  <p className="text-sm text-gray-500 mb-1">Documents</p>
                  <div className="space-y-2">
                    {quote.status.pdfUrl ? (
                      <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                        <a href={quote.status.pdfUrl} target="_blank" rel="noopener noreferrer">
                          <FileText className="h-4 w-4 mr-2" />
                          View Quote PDF
                        </a>
                      </Button>
                    ) : (
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
                    )}

                    {quote.status.paymentScreenshotUrl && (
                      <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                        <a href={quote.status.paymentScreenshotUrl} target="_blank" rel="noopener noreferrer">
                          <FileText className="h-4 w-4 mr-2" />
                          View Payment Screenshot
                        </a>
                      </Button>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Created By</p>
                  <p className="font-medium">{quote.createdBy}</p>
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
                Quote Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              {quote.items && quote.items.length > 0 ? (
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
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
                            <div>
                              <p className="font-medium">{item.description}</p>
                              {item.productNature && (
                                <Badge variant="outline" className="mt-1">
                                  {item.productNature}
                                </Badge>
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
        </TabsContent>

        <TabsContent value="product-info" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Product Information
              </CardTitle>
            </CardHeader>
            <CardContent>
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
              <div className="text-center py-8 text-gray-500">
                <ClipboardList className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p>History tracking is not available in this demo</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
