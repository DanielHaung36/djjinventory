"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PackageOpen, ArrowLeft, Check, AlertTriangle, Plus, Minus } from "lucide-react"
import { useNavigate } from "react-router-dom"
import ZxingBarcodeScanner from "../../../components/zxing-barcode-scanner"
import { Alert, AlertDescription, AlertTitle } from "../../../components/ui/alert"
import { useScanOutMutation, useGetInventoryByCodeQuery } from "../inventoryApi"
import { useToast } from "../../../hooks/use-toast"
import { useTranslation } from "react-i18next"

export default function ScanOutPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const router = useNavigate()
  const [scannedCode, setScannedCode] = useState("")
  const [scannedFormat, setScannedFormat] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [scanError, setScanError] = useState("")
  const [scanHistory, setScanHistory] = useState<Array<{ code: string; format: string; time: Date }>>([])
  const [scanOut, { isLoading }] = useScanOutMutation();
  const { data: inventory, isLoading: ld,isSuccess:su } = useGetInventoryByCodeQuery(scannedCode, { skip: !scannedCode });
  const availableStock = ((inventory?.actualQty || 0) - (inventory?.lockedQty || 0)) || 0;

  const handleScan = (result: string, format: string) => {
    setScannedCode(result)
    setScannedFormat(format)
    setScanError("")

    // 添加到扫描历史
    const newScan = { code: result, format, time: new Date() }
    setScanHistory((prev) => [newScan, ...prev.slice(0, 4)])

    // // 播放扫码成功音效
    // try {
    //   const audio = new Audio(
    //     "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT",
    //   )
    //   audio.play().catch(() => { })
    // } catch (e) { }
  }

  const handleScanError = (error: string) => {
    setScanError(error)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!scannedCode) return

    setIsSubmitting(true)

    try {
      // 模拟API调用
      const res = await scanOut({
        code: scannedCode,
        format: scannedFormat,
        quantity,
      }).unwrap();

      setIsSubmitting(false)
      setIsSuccess(true)
      toast({
        title: t("inventoryscan.outboundSuccess"),
        description: t("inventoryscan.outboundSuccessInfo"),
      });
    } catch (error) {
      setIsSubmitting(false)
      const msg = error?.data?.error || t("dialog.operationFailed");
      setScanError(msg);
      toast({
        title: t("dialog.operationFailed"),
        description: msg,
        variant: "destructive",
      });
    } finally {
      // 2秒后返回主菜单
      setTimeout(() => {
        setIsSuccess(false)       // 关闭对话框
        setScannedCode("")
        setScannedFormat("")
        setQuantity(1)
        setScanError("")
        // 其他你想恢复的内容
      }, 2000)
    }

  }

  const incrementQuantity = () => {
    setQuantity((prev) => Math.min(availableStock, prev + 1))
  }

  const decrementQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 1))
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm text-center">
          <CardContent className="p-8">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-blue-800 mb-2">{t("inventoryscan.outboundSuccess")}</h3>
            <p className="text-blue-600 mb-2">{t("inventoryscan.outboundSuccessInfo")}</p>
            <div className="text-sm text-gray-600">
              <p>{t("inventoryscan.code")}: {scannedCode}</p>
              <p>{t("inventoryscan.num")}: {quantity}</p>
              {scannedFormat && <p>{t("inventoryscan.format")}: {scannedFormat}</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isQuantityValid = quantity <= availableStock

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6 pt-4">
          <Button variant="ghost" size="icon" onClick={() => router(-1)} className="mr-3">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">{t("inventoryscan.scanOutTitle")}</h1>
            <p className="text-gray-600 text-sm">{t("inventoryscan.scanBarcode")}</p>
          </div>
        </div>

        {/* 扫码器 - 自动启动 */}
        <div className="mb-6">
          <ZxingBarcodeScanner onScan={handleScan} onError={handleScanError} isActive={true} autoStart={true} />
        </div>

        {scanError && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>{t("dialog.error")}</AlertTitle>
            <AlertDescription>{scanError}</AlertDescription>
          </Alert>
        )}

        {/* 扫码结果显示 */}
        {scannedCode && (
          <Card className="mb-4 border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-blue-800">{t("inventoryscan.scanSuccess")}</p>
                  <p className="text-sm text-blue-600 font-mono">{scannedCode}</p>
                  {scannedFormat && <p className="text-xs text-blue-500">{t("inventoryscan.format")}: {scannedFormat}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 出库表单 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PackageOpen className="w-5 h-5 mr-2" />
              {t("inventoryscan.outboundInfo")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">{t("inventoryscan.code")}</Label>
                <Input
                  id="code"
                  value={scannedCode}
                  onChange={(e) => setScannedCode(e.target.value)}
                  placeholder={t("inventoryscan.enterManually")}
                  className={scannedCode ? "border-blue-300 bg-blue-50" : ""}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">{t("inventoryscan.num")}</Label>
                <div className="flex items-center space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <Input
                    id="quantity"
                    type="number"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.max(1, Math.min(availableStock, Number.parseInt(e.target.value) || 1)))
                    }
                    className="text-center font-medium"
                    min="1"
                    max={availableStock}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={incrementQuantity}
                    disabled={quantity >= availableStock}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm text-gray-600">{t("inventoryscan.availableStock")}: {availableStock} {t("inventoryscan.items")}</p>
              </div>

              {!isQuantityValid && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{t("inventoryscan.quantityExceedsStock")}</AlertDescription>
                </Alert>
              )}

              {/* 商品预览 */}
              {scannedCode && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">{t("inventoryscan.productPreview")}</h4>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                      <PackageOpen className="w-6 h-6 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium">{scannedFormat === "QR_CODE" ? t("inventoryscan.qrCodeProduct") : t("inventoryscan.barcodeProduct")}</p>
                      <p className="text-sm text-gray-600 font-mono">{scannedCode}</p>
                      <p className="text-sm text-green-600">{t("inventoryscan.stock")}: {availableStock} {t("inventoryscan.items")}</p>
                      {scannedFormat && <p className="text-xs text-blue-600">{t("inventoryscan.format")}: {scannedFormat}</p>}
                    </div>
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isSubmitting || !scannedCode || !isQuantityValid || isLoading}>
                {isSubmitting ? t("inventoryscan.processing") : t("inventoryscan.confirmOutbound", { qty: quantity })}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* 扫描历史 */}
        {scanHistory.length > 0 && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm">{t("inventoryscan.recentScans")}</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2">
                {scanHistory.slice(0, 3).map((scan, index) => (
                  <div key={index} className="flex justify-between items-center text-xs p-2 bg-gray-50 rounded">
                    <span className="font-mono truncate flex-1 mr-2">{scan.code}</span>
                    <span className="text-blue-600">{scan.format}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
