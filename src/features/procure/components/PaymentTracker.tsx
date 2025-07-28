"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import {
  Plus,
  CreditCard,
  Calendar,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  DollarSign,
} from "lucide-react"

interface PaymentRecord {
  id: string
  paymentNumber: string
  paymentType: "deposit" | "partial" | "final" | "full"
  paymentMethod: "bank_transfer" | "cash" | "check" | "credit" | "other"
  amount: number
  currencyCode: string
  paymentDate: string
  transactionRef: string
  bankAccount: string
  proofURL?: string
  notes: string
  createdBy: string
  createdAt: string
}

interface PaymentStatus {
  status: "unpaid" | "deposit_paid" | "fully_paid"
  totalAmount: number
  paidAmount: number
  balance: number
  depositAmount: number
  finalPaymentDue?: string
}

interface PaymentTrackerProps {
  purchaseOrderId: string
  paymentStatus: PaymentStatus
  payments: PaymentRecord[]
  onAddPayment?: (payment: Omit<PaymentRecord, "id" | "paymentNumber" | "createdAt">) => void
  readonly?: boolean
}

export function PaymentTracker({
  purchaseOrderId,
  paymentStatus,
  payments,
  onAddPayment,
  readonly = false,
}: PaymentTrackerProps) {
  const { toast } = useToast()
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentForm, setPaymentForm] = useState({
    paymentType: "deposit" as const,
    paymentMethod: "bank_transfer" as const,
    amount: 0,
    paymentDate: new Date().toISOString().split('T')[0],
    transactionRef: "",
    bankAccount: "",
    proofURL: "",
    notes: "",
  })

  const formatCurrency = (amount: number, currency = "AUD") => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: currency,
    }).format(amount)
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "fully_paid":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "deposit_paid":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "unpaid":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getPaymentTypeColor = (type: string) => {
    switch (type) {
      case "deposit":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "partial":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
      case "final":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "full":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const calculatePaymentProgress = () => {
    if (paymentStatus.totalAmount === 0) return 0
    return Math.round((paymentStatus.paidAmount / paymentStatus.totalAmount) * 100)
  }

  const handleAddPayment = async () => {
    if (paymentForm.amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Payment amount must be greater than 0.",
        variant: "destructive",
      })
      return
    }

    if (paymentForm.amount > paymentStatus.balance) {
      toast({
        title: "Amount Exceeds Balance",
        description: `Payment amount cannot exceed remaining balance of ${formatCurrency(paymentStatus.balance)}.`,
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const newPayment = {
        ...paymentForm,
        purchaseOrderId,
        currencyCode: "AUD",
        createdBy: "Current User", // In real app, get from auth
      }

      await onAddPayment?.(newPayment)

      toast({
        title: "Payment Added",
        description: `Payment of ${formatCurrency(paymentForm.amount)} has been recorded successfully.`,
      })

      // Reset form
      setPaymentForm({
        paymentType: "deposit",
        paymentMethod: "bank_transfer",
        amount: 0,
        paymentDate: new Date().toISOString().split('T')[0],
        transactionRef: "",
        bankAccount: "",
        proofURL: "",
        notes: "",
      })
      setIsAddPaymentOpen(false)
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "Failed to record payment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusIcon = () => {
    switch (paymentStatus.status) {
      case "fully_paid":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "deposit_paid":
        return <Clock className="h-5 w-5 text-yellow-600" />
      case "unpaid":
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Payment Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Status
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <Badge className={getPaymentStatusColor(paymentStatus.status)}>
                {paymentStatus.status.toUpperCase().replace('_', ' ')}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-600 font-medium">Total Amount</div>
              <div className="text-xl font-bold text-blue-900">
                {formatCurrency(paymentStatus.totalAmount)}
              </div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-sm text-green-600 font-medium">Paid Amount</div>
              <div className="text-xl font-bold text-green-900">
                {formatCurrency(paymentStatus.paidAmount)}
              </div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-sm text-orange-600 font-medium">Balance Due</div>
              <div className="text-xl font-bold text-orange-900">
                {formatCurrency(paymentStatus.balance)}
              </div>
            </div>
          </div>

          {/* Payment Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Payment Progress</span>
              <span className="font-medium">{calculatePaymentProgress()}%</span>
            </div>
            <Progress value={calculatePaymentProgress()} className="h-2" />
          </div>

          {/* Final Payment Due Warning */}
          {paymentStatus.finalPaymentDue && paymentStatus.balance > 0 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">Final Payment Due: {paymentStatus.finalPaymentDue}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Records */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Payment Records
              </CardTitle>
              <CardDescription>
                All payment transactions for this procurement order
              </CardDescription>
            </div>
            {!readonly && paymentStatus.balance > 0 && (
              <Dialog open={isAddPaymentOpen} onOpenChange={setIsAddPaymentOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Payment
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Record New Payment</DialogTitle>
                    <DialogDescription>
                      Add a new payment record for this procurement order
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="paymentType">Payment Type *</Label>
                        <Select
                          value={paymentForm.paymentType}
                          onValueChange={(value: any) =>
                            setPaymentForm({ ...paymentForm, paymentType: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="deposit">Deposit</SelectItem>
                            <SelectItem value="partial">Partial Payment</SelectItem>
                            <SelectItem value="final">Final Payment</SelectItem>
                            <SelectItem value="full">Full Payment</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="paymentMethod">Payment Method *</Label>
                        <Select
                          value={paymentForm.paymentMethod}
                          onValueChange={(value: any) =>
                            setPaymentForm({ ...paymentForm, paymentMethod: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                            <SelectItem value="cash">Cash</SelectItem>
                            <SelectItem value="check">Check</SelectItem>
                            <SelectItem value="credit">Credit Card</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="amount">Amount *</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="amount"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            value={paymentForm.amount || ""}
                            onChange={(e) =>
                              setPaymentForm({
                                ...paymentForm,
                                amount: parseFloat(e.target.value) || 0,
                              })
                            }
                            className="pl-10"
                          />
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Maximum: {formatCurrency(paymentStatus.balance)}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="paymentDate">Payment Date *</Label>
                        <Input
                          id="paymentDate"
                          type="date"
                          value={paymentForm.paymentDate}
                          onChange={(e) =>
                            setPaymentForm({ ...paymentForm, paymentDate: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="transactionRef">Transaction Reference</Label>
                        <Input
                          id="transactionRef"
                          placeholder="Transaction ID or reference"
                          value={paymentForm.transactionRef}
                          onChange={(e) =>
                            setPaymentForm({ ...paymentForm, transactionRef: e.target.value })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bankAccount">Bank Account</Label>
                        <Input
                          id="bankAccount"
                          placeholder="Bank account details"
                          value={paymentForm.bankAccount}
                          onChange={(e) =>
                            setPaymentForm({ ...paymentForm, bankAccount: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="proofURL">Payment Proof URL</Label>
                      <Input
                        id="proofURL"
                        placeholder="URL to payment proof document"
                        value={paymentForm.proofURL}
                        onChange={(e) =>
                          setPaymentForm({ ...paymentForm, proofURL: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        placeholder="Additional payment notes"
                        value={paymentForm.notes}
                        onChange={(e) =>
                          setPaymentForm({ ...paymentForm, notes: e.target.value })
                        }
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsAddPaymentOpen(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAddPayment} disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Recording...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Record Payment
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No payment records found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <div className="font-medium text-sm">
                        {payment.paymentNumber}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {payment.paymentDate}
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <Badge className={getPaymentTypeColor(payment.paymentType)} variant="outline">
                        {payment.paymentType.toUpperCase()}
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-1">
                        {payment.paymentMethod.replace('_', ' ').toUpperCase()}
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <div className="font-bold text-green-600">
                        {formatCurrency(payment.amount, payment.currencyCode)}
                      </div>
                      {payment.transactionRef && (
                        <div className="text-xs text-muted-foreground">
                          Ref: {payment.transactionRef}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {payment.proofURL && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={payment.proofURL} target="_blank" rel="noopener noreferrer">
                          <FileText className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    <div className="text-xs text-muted-foreground">
                      by {payment.createdBy}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}