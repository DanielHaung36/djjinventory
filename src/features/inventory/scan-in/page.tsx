"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Package, ArrowLeft, Check, Plus, Minus } from "lucide-react"
import { useNavigate } from "react-router-dom"
import ZxingBarcodeScanner from "@/components/zxing-barcode-scanner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useScanInMutation, useGetInventoryByCodeQuery } from "../inventoryApi"
import { useTranslation } from "react-i18next"
import { useToast } from "../../../hooks/use-toast"

export default function ScanInPage() {
  const { toast } = useToast();
  const { t } = useTranslation()
  const router = useNavigate()
  const [scannedCode, setScannedCode] = useState("")
  const [scannedFormat, setScannedFormat] = useState("")
  const [data, setdata] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [scanError, setScanError] = useState("")
  const [scanHistory, setScanHistory] = useState<Array<{ code: string; format: string; time: Date }>>([])
  const [scanIn, { isLoading }] = useScanInMutation();
  const { data: inventory, isLoading: ld } = useGetInventoryByCodeQuery(scannedCode, { skip: !scannedCode });
  const availableStock = ((inventory?.actualQty || 0) - (inventory?.lockedQty || 0)) || 0;

  const handleScan = (result: string, format: string) => {
    setScannedCode(result)
    setScannedFormat(format)

    setScanError("")

    // 添加到扫描历史
    const newScan = { code: result, format, time: new Date() }
    setScanHistory((prev) => [newScan, ...prev.slice(0, 4)]) // 保留最近5次


    // 播放扫码成功音效（可选）
    // try {
    //   const audio = new Audio(
    //     "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT",
    //   )
    //   audio.play().catch(() => {}) // 忽略音频播放错误
    // } catch (e) {}
  }

  const handleScanError = (error: string) => {
    setScanError(error)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!scannedCode) return

    setIsSubmitting(true)
    console.log(e);
    try {
      // 模拟API调用
      const res = await scanIn({
        code: scannedCode,
        format: scannedFormat,
        quantity,
      }).unwrap();
      setdata((res as any).inventory?.barcode || "")
      setIsSubmitting(false)
      setIsSuccess(true)
      toast({
        title: t("inventoryscan.inboundSuccess"),
        description: t("inventoryscan.inboundSuccessInfo"),
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
    }
    finally {
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
    setQuantity((prev) => prev + 1)
  }

  const decrementQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 1))
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm text-center">
          {data}
          <CardContent className="p-8">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-green-800 mb-2">{t('inventoryscan.inboundSuccess')}</h3>
            <p className="text-green-600 mb-2">{t('inventoryscan.inboundSuccessInfo')}</p>
            <div className="text-sm text-gray-600">
              <p>{t('inventoryscan.code')}: {scannedCode}</p>
              <p>{t('inventoryscan.num')}: {quantity}</p>
              {scannedFormat && <p>{t('inventoryscan.format')}: {scannedFormat}</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6 pt-4">
          <Button variant="ghost" size="icon" onClick={() => router(-1)} className="mr-3">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">{t("inventoryscan.scanInTitle")}</h1>
            <p className="text-gray-600 text-sm">{t("inventoryscan.scanBarcode")}</p>
          </div>
        </div>

        {/* 扫码器 - 自动启动 */}
        <div className="mb-6">
          <ZxingBarcodeScanner onScan={handleScan} onError={handleScanError} isActive={true} autoStart={true} />
        </div>

        {scanError && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{scanError}</AlertDescription>
          </Alert>
        )}

        {/* 扫码结果显示 */}
        {scannedCode && (
          <Card className="mb-4 border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-green-800">{t("inventoryscan.scanSuccess")}</p>
                  <p className="text-sm text-green-600 font-mono">{scannedCode}</p>
                  {scannedFormat && <p className="text-xs text-green-500">{t("inventoryscan.format")}: {scannedFormat}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 入库表单 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="w-5 h-5 mr-2" />
              {t("inventoryscan.inboundInfo")}
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
                  className={scannedCode ? "border-green-300 bg-green-50" : ""}
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
                    onChange={(e) => setQuantity(Math.max(1, Number.parseInt(e.target.value) || 1))}
                    className="text-center font-medium"
                    min="1"
                  />
                  <Button type="button" variant="outline" size="icon" onClick={incrementQuantity}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* 商品预览 */}
              {scannedCode && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">{t("inventoryscan.productPreview")}</h4>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-gray-500" />
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

              <Button type="submit" className="w-full" disabled={isSubmitting || !scannedCode || isLoading}>
                {isSubmitting ? t("inventoryscan.processing") : t("inventoryscan.confirmInbound", { qty: quantity })}
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
