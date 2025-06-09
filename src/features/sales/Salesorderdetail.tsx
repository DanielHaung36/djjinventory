"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  CheckCircle,
  Circle,
  Clock,
  ArrowLeft,
  Download,
  User,
  Calendar,
  DollarSign,
  Package,
  FileText,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { SalesOrder, WorkflowStep } from "@/types/sales-order"

interface SalesOrderDetailProps {
  order: SalesOrder
  onBack: () => void
}

const workflowSteps: WorkflowStep[] = [
  { id: 1, title: "Deposit Received", status: "completed", date: "2025-05-02" },
  { id: 2, title: "Order Placed", status: "completed", date: "2025-05-03" },
  { id: 3, title: "Final Payment", status: "pending" },
  { id: 4, title: "Pre-Delivery Inspection", status: "current" },
  { id: 5, title: "Shipment", status: "pending" },
  { id: 6, title: "Order Closed", status: "pending" },
]

export function SalesOrderDetail({ order, onBack }: SalesOrderDetailProps) {
  const [selectedStep, setSelectedStep] = useState<number>(4)

  const getStepIcon = (status: WorkflowStep["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "current":
        return <Clock className="w-5 h-5 text-blue-500" />
      default:
        return <Circle className="w-5 h-5 text-gray-300" />
    }
  }

  const getStepBadge = (status: WorkflowStep["status"]) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 border-green-200">✓</Badge>
      case "current":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">●</Badge>
      default:
        return (
          <Badge variant="outline" className="text-gray-500">
            ○
          </Badge>
        )
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Sales Order - {order.orderNumber}</h1>
          <p className="text-muted-foreground mt-1">Track order progress and manage workflow</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button size="sm">
            <FileText className="w-4 h-4 mr-2" />
            Edit Order
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Workflow Steps Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="w-5 h-5" />
                Order Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {workflowSteps.map((step) => (
                <div
                  key={step.id}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedStep === step.id
                      ? "bg-blue-50 border border-blue-200 shadow-sm"
                      : "hover:bg-gray-50 border border-transparent"
                  }`}
                  onClick={() => setSelectedStep(step.id)}
                >
                  <div className="flex items-center gap-2">
                    {getStepBadge(step.status)}
                    <span className="text-xs font-medium text-gray-500">{step.id}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{step.title}</div>
                    {step.date && <div className="text-xs text-gray-500 mt-0.5">{step.date}</div>}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Order Summary Card */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Sales Order - {order.orderNumber}</CardTitle>
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">Active</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                <div className="space-y-1">
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                    <User className="w-3 h-3" />
                    Customer
                  </div>
                  <div className="font-semibold text-lg">{order.customer}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                    <Package className="w-3 h-3" />
                    Machine Model
                  </div>
                  <div className="font-semibold text-lg">{order.machineModel || "LM930 Wheel Loader"}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Order Date
                  </div>
                  <div className="font-semibold text-lg">{order.orderDate || "2025-05-02"}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    ETA
                  </div>
                  <div className="font-semibold text-lg">{order.eta || "2025-05-15"}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    Total
                  </div>
                  <div className="font-bold text-xl text-green-600">${order.total?.toLocaleString() || "45,000"}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Step Details */}
          {selectedStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  Pre-Delivery Inspection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Inspector</div>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs bg-blue-100 text-blue-700">JD</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">John Doe</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Date</div>
                      <div className="font-medium">2025-05-05</div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Report</div>
                      <Button variant="outline" size="sm" className="text-blue-600">
                        <Download className="w-3 h-3 mr-1" />
                        Download PDF
                      </Button>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Notes</div>
                      <div className="font-medium text-green-600">All tests passed successfully.</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Order Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quote Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Quote Number:</span>
                  <span className="font-mono font-medium">{order.quoteNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created By:</span>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-5 w-5">
                      <AvatarFallback className="text-xs bg-green-100 text-green-700">
                        {order.createdBy
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{order.createdBy}</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Quote Date:</span>
                  <span className="font-medium">{order.quoteDate}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-gray-600">Quote PDF:</span>
                  {order.quotePDF ? (
                    <Button variant="link" className="h-auto p-0 text-blue-600">
                      <FileText className="w-3 h-3 mr-1" />
                      View PDF
                    </Button>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Quote Content:</span>
                  <span className="font-medium text-right max-w-[200px] truncate">{order.quoteContent || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Screenshot:</span>
                  <span className="text-gray-400">-</span>
                </div>
                <Separator />
                <div className="pt-2">
                  <Button className="w-full" size="sm">
                    点击编辑后的样式
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
