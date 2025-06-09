"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Separator } from "../../components/ui/separator"
import { Trash2, ArrowLeft, Plus, Upload, User, Calendar, Package, FileText } from "lucide-react"
import type { OrderItem } from "./types/sales-order"

interface NewSalesOrderFormProps {
  onBack: () => void
  onSubmit: (data: any) => void
}

export function NewSalesOrderForm({ onBack, onSubmit }: NewSalesOrderFormProps) {
  const [formData, setFormData] = useState({
    orderNumber: `INV-${Date.now().toString().slice(-6)}`,
    quoteNumber: "",
    customer: "",
    createdBy: "Monica Simons",
    quoteDate: new Date().toISOString().split("T")[0],
    machineModel: "",
    quotePDF: "",
    quoteContent: "",
    paymentScreenshot: "",
  })

  const [items, setItems] = useState<OrderItem[]>([
    {
      id: "1",
      type: "deposit",
      amount: 0,
      receipt: "请联系我",
      remark: "未来将在何处付款",
    },
  ])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ ...formData, items })
  }

  const updateItem = (id: string, field: keyof OrderItem, value: any) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  const addItem = () => {
    const newItem: OrderItem = {
      id: Date.now().toString(),
      type: "final-payment",
      amount: 0,
      receipt: "",
      remark: "",
    }
    setItems((prev) => [...prev, newItem])
  }

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">New Sales Order</h1>
          <p className="text-muted-foreground mt-1">Create a new sales order for your customer</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Order Number</div>
          <div className="font-mono font-bold text-lg">{formData.orderNumber}</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="quoteNumber" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Quote Number *
                </Label>
                <Input
                  id="quoteNumber"
                  placeholder="e.g., EL250515-1B"
                  value={formData.quoteNumber}
                  onChange={(e) => setFormData((prev) => ({ ...prev, quoteNumber: e.target.value }))}
                  className="font-mono"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Customer *
                </Label>
                <Select
                  value={formData.customer}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, customer: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DW TILES QLD">DW TILES QLD</SelectItem>
                    <SelectItem value="Geoff Harcourt">Geoff Harcourt</SelectItem>
                    <SelectItem value="Sam">Sam</SelectItem>
                    <SelectItem value="Monica Simmons">Monica Simmons</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quoteDate" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Quote Date
                </Label>
                <Input
                  id="quoteDate"
                  type="date"
                  value={formData.quoteDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, quoteDate: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="machineModel" className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Machine Model
                </Label>
                <Select
                  value={formData.machineModel}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, machineModel: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select machine model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LM930 Wheel Loader">LM930 Wheel Loader</SelectItem>
                    <SelectItem value="LM940 Wheel Loader">LM940 Wheel Loader</SelectItem>
                    <SelectItem value="LM950 Wheel Loader">LM950 Wheel Loader</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quoteContent">Quote Content</Label>
              <Textarea
                id="quoteContent"
                placeholder="Enter quote content details..."
                value={formData.quoteContent}
                onChange={(e) => setFormData((prev) => ({ ...prev, quoteContent: e.target.value }))}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* File Uploads */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="quotePDF">Quote PDF</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="quotePDF"
                    placeholder="Upload quote PDF file"
                    value={formData.quotePDF}
                    onChange={(e) => setFormData((prev) => ({ ...prev, quotePDF: e.target.value }))}
                  />
                  <Button type="button" variant="outline" size="icon">
                    <Upload className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentScreenshot">Payment Screenshot</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="paymentScreenshot"
                    placeholder="Upload payment screenshot"
                    value={formData.paymentScreenshot}
                    onChange={(e) => setFormData((prev) => ({ ...prev, paymentScreenshot: e.target.value }))}
                  />
                  <Button type="button" variant="outline" size="icon">
                    <Upload className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Items */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Payment Items</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-6 gap-4 text-sm font-medium text-gray-600 pb-2 border-b">
                <div>Type</div>
                <div>Amount</div>
                <div>Receipt</div>
                <div className="col-span-2">Remark</div>
                <div>Action</div>
              </div>

              {items.map((item, index) => (
                <div key={item.id} className="grid grid-cols-6 gap-4 items-center p-3 bg-gray-50 rounded-lg">
                  <Select
                    value={item.type}
                    onValueChange={(value: "deposit" | "final-payment") => updateItem(item.id, "type", value)}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="deposit">Deposit</SelectItem>
                      <SelectItem value="final-payment">Final Payment</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="$0.00"
                    value={item.amount > 0 ? `$${item.amount.toFixed(2)}` : ""}
                    onChange={(e) => {
                      const value = e.target.value.replace("$", "")
                      updateItem(item.id, "amount", Number.parseFloat(value) || 0)
                    }}
                    className="bg-white"
                  />
                  <Input
                    placeholder="Receipt info"
                    value={item.receipt}
                    onChange={(e) => updateItem(item.id, "receipt", e.target.value)}
                    className="bg-white"
                  />
                  <div className="col-span-2">
                    <Input
                      placeholder="Remark"
                      value={item.remark}
                      onChange={(e) => updateItem(item.id, "remark", e.target.value)}
                      className="bg-white"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                    disabled={items.length === 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Separator />

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onBack}>
            Cancel
          </Button>
          <Button type="submit" size="lg">
            Create Sales Order
          </Button>
        </div>
      </form>
    </div>
  )
}
export default NewSalesOrderForm