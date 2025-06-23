"use client"

import { useState, useEffect } from "react"
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Plus,
  Search,
  Eye,
  Edit,
  FileText,
  Trash2,
  Save,
  AlertCircle,
  Calendar,
  Building,
  DollarSign,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ProcurementRequest {
  id: string
  contractNumber: string
  djjCode: string
  supplierCode: string
  supplierName: string
  productNature: "Contract" | "Warranty" | "Gift" | "Self-Purchase" | "Pending"
  currency: "AUD" | "USD" | "CNY"
  unitPrice: number
  quantity: number
  totalAmount: number
  status: "pending" | "approved" | "rejected" | "in-stock" | "delivered"
  priority: "high" | "medium" | "low"
  createdDate: string
  updatedDate: string
  deliveryDate: string
  warehouse: string
  remark: string
  requestedBy: string
  department: string
  approvedBy?: string
  approvalDate?: string
}

const initialFormData: Omit<ProcurementRequest, "id" | "createdDate" | "updatedDate"> = {
  contractNumber: "",
  djjCode: "",
  supplierCode: "",
  supplierName: "",
  productNature: "Contract",
  currency: "AUD",
  unitPrice: 0,
  quantity: 1,
  totalAmount: 0,
  status: "pending",
  priority: "medium",
  deliveryDate: "",
  warehouse: "",
  remark: "",
  requestedBy: "Current User", // In real app, get from auth context
  department: "Procurement",
}

const mockData: ProcurementRequest[] = [
  {
    id: "P001",
    contractNumber: "JH240411AULG",
    djjCode: "DJJ00001",
    supplierCode: "LM930",
    supplierName: "Hangzhou Hengyi Technology",
    productNature: "Contract",
    currency: "AUD",
    unitPrice: 14491,
    quantity: 10,
    totalAmount: 144910,
    status: "approved",
    priority: "high",
    createdDate: "2024-01-15",
    updatedDate: "2024-01-16",
    deliveryDate: "2024-02-15",
    warehouse: "Sydney Warehouse A",
    remark: "Execute according to contract terms",
    requestedBy: "John Smith",
    department: "Procurement",
    approvedBy: "Sarah Johnson",
    approvalDate: "2024-01-16",
  },
  {
    id: "P002",
    contractNumber: "JH240412AULG",
    djjCode: "DJJ00002",
    supplierCode: "LM932",
    supplierName: "Suzhou Industrial Solutions",
    productNature: "Warranty",
    currency: "USD",
    unitPrice: 1200,
    quantity: 5,
    totalAmount: 6000,
    status: "pending",
    priority: "medium",
    createdDate: "2024-01-14",
    updatedDate: "2024-01-14",
    deliveryDate: "2024-02-10",
    warehouse: "Sydney Warehouse B",
    remark: "Warranty item, small batch testing",
    requestedBy: "Mike Chen",
    department: "Engineering",
  },
  {
    id: "P003",
    contractNumber: "JH240413AULG",
    djjCode: "DJJ00003",
    supplierCode: "LM940",
    supplierName: "Beijing Manufacturing Co",
    productNature: "Gift",
    currency: "CNY",
    unitPrice: 0,
    quantity: 20,
    totalAmount: 0,
    status: "rejected",
    priority: "low",
    createdDate: "2024-01-13",
    updatedDate: "2024-01-15",
    deliveryDate: "2024-02-05",
    warehouse: "Sydney Warehouse A",
    remark: "Manufacturer gift, cost already deducted",
    requestedBy: "Lisa Wang",
    department: "Marketing",
  },
]

export function ProcurementManagement() {
  const [requests, setRequests] = useState<ProcurementRequest[]>(mockData)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterPriority, setFilterPriority] = useState<string>("all")

  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Form states
  const [formData, setFormData] = useState(initialFormData)
  const [editingRequest, setEditingRequest] = useState<ProcurementRequest | null>(null)
  const [viewingRequest, setViewingRequest] = useState<ProcurementRequest | null>(null)
  const [deletingRequest, setDeletingRequest] = useState<ProcurementRequest | null>(null)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 在现有状态后添加
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(9) // 每页显示9个项目

  const { toast } = useToast()

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.djjCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.supplierName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || request.status === filterStatus
    const matchesPriority = filterPriority === "all" || request.priority === filterPriority
    return matchesSearch && matchesStatus && matchesPriority
  })

  // 计算分页数据
  const totalItems = filteredRequests.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedRequests = filteredRequests.slice(startIndex, endIndex)

  // 重置页码当过滤条件改变时
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterStatus, filterPriority])

  // Validation function
  const validateForm = (data: typeof formData): Record<string, string> => {
    const errors: Record<string, string> = {}

    if (!data.contractNumber.trim()) errors.contractNumber = "Contract number is required"
    if (!data.djjCode.trim()) errors.djjCode = "DJJ code is required"
    if (!data.supplierCode.trim()) errors.supplierCode = "Supplier code is required"
    if (!data.supplierName.trim()) errors.supplierName = "Supplier name is required"
    if (data.unitPrice <= 0) errors.unitPrice = "Unit price must be greater than 0"
    if (data.quantity <= 0) errors.quantity = "Quantity must be greater than 0"
    if (!data.deliveryDate) errors.deliveryDate = "Delivery date is required"
    if (!data.warehouse.trim()) errors.warehouse = "Warehouse is required"

    return errors
  }

  // Update form data and calculate total
  const updateFormData = (field: keyof typeof formData, value: any) => {
    const newData = { ...formData, [field]: value }

    // Auto-calculate total amount
    if (field === "unitPrice" || field === "quantity") {
      newData.totalAmount = newData.unitPrice * newData.quantity
    }

    setFormData(newData)

    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  // Reset form
  const resetForm = () => {
    setFormData(initialFormData)
    setFormErrors({})
    setEditingRequest(null)
  }

  // Create new procurement request
  const handleCreate = async () => {
    const errors = validateForm(formData)
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const newRequest: ProcurementRequest = {
        ...formData,
        id: `P${String(requests.length + 1).padStart(3, "0")}`,
        createdDate: new Date().toISOString().split("T")[0],
        updatedDate: new Date().toISOString().split("T")[0],
        totalAmount: formData.unitPrice * formData.quantity,
      }

      setRequests((prev) => [newRequest, ...prev])
      setIsAddDialogOpen(false)
      resetForm()

      toast({
        title: "Procurement Request Created",
        description: `Request ${newRequest.contractNumber} has been created successfully.`,
      })
    } catch (error) {
      toast({
        title: "Creation Failed",
        description: "There was an error creating the procurement request.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Update procurement request
  const handleUpdate = async () => {
    if (!editingRequest) return

    const errors = validateForm(formData)
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const updatedRequest: ProcurementRequest = {
        ...editingRequest,
        ...formData,
        updatedDate: new Date().toISOString().split("T")[0],
        totalAmount: formData.unitPrice * formData.quantity,
      }

      setRequests((prev) => prev.map((req) => (req.id === editingRequest.id ? updatedRequest : req)))
      setIsEditDialogOpen(false)
      resetForm()

      toast({
        title: "Procurement Request Updated",
        description: `Request ${updatedRequest.contractNumber} has been updated successfully.`,
      })
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "There was an error updating the procurement request.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete procurement request
  const handleDelete = async () => {
    if (!deletingRequest) return

    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setRequests((prev) => prev.filter((req) => req.id !== deletingRequest.id))
      setIsDeleteDialogOpen(false)
      setDeletingRequest(null)

      toast({
        title: "Procurement Request Deleted",
        description: `Request ${deletingRequest.contractNumber} has been deleted successfully.`,
      })
    } catch (error) {
      toast({
        title: "Deletion Failed",
        description: "There was an error deleting the procurement request.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Open edit dialog
  const openEditDialog = (request: ProcurementRequest) => {
    setEditingRequest(request)
    setFormData({
      contractNumber: request.contractNumber,
      djjCode: request.djjCode,
      supplierCode: request.supplierCode,
      supplierName: request.supplierName,
      productNature: request.productNature,
      currency: request.currency,
      unitPrice: request.unitPrice,
      quantity: request.quantity,
      totalAmount: request.totalAmount,
      status: request.status,
      priority: request.priority,
      deliveryDate: request.deliveryDate,
      warehouse: request.warehouse,
      remark: request.remark,
      requestedBy: request.requestedBy,
      department: request.department,
    })
    setIsEditDialogOpen(true)
  }

  // Open view dialog
  const openViewDialog = (request: ProcurementRequest) => {
    setViewingRequest(request)
    setIsViewDialogOpen(true)
  }

  // Open delete dialog
  const openDeleteDialog = (request: ProcurementRequest) => {
    setDeletingRequest(request)
    setIsDeleteDialogOpen(true)
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "in-stock":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "delivered":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  // Get product nature color
  const getProductNatureColor = (nature: string) => {
    switch (nature) {
      case "Contract":
        return "border-l-orange-500"
      case "Warranty":
        return "border-l-green-500"
      case "Gift":
        return "border-l-blue-500"
      case "Self-Purchase":
        return "border-l-purple-500"
      case "Pending":
        return "border-l-red-500"
      default:
        return "border-l-gray-500"
    }
  }

  // Form component
  const ProcurementForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h4 className="font-medium text-sm text-muted-foreground">Basic Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="contractNumber">Contract Number *</Label>
            <Input
              id="contractNumber"
              placeholder="JH240411AULG"
              value={formData.contractNumber}
              onChange={(e) => updateFormData("contractNumber", e.target.value)}
              className={formErrors.contractNumber ? "border-destructive" : ""}
            />
            {formErrors.contractNumber && (
              <p className="text-sm text-destructive flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {formErrors.contractNumber}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="djjCode">DJJ Code *</Label>
            <Input
              id="djjCode"
              placeholder="DJJ00001"
              value={formData.djjCode}
              onChange={(e) => updateFormData("djjCode", e.target.value)}
              className={formErrors.djjCode ? "border-destructive" : ""}
            />
            {formErrors.djjCode && (
              <p className="text-sm text-destructive flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {formErrors.djjCode}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="supplierCode">Supplier Code *</Label>
            <Input
              id="supplierCode"
              placeholder="LM930"
              value={formData.supplierCode}
              onChange={(e) => updateFormData("supplierCode", e.target.value)}
              className={formErrors.supplierCode ? "border-destructive" : ""}
            />
            {formErrors.supplierCode && (
              <p className="text-sm text-destructive flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {formErrors.supplierCode}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplierName">Supplier Name *</Label>
            <Input
              id="supplierName"
              placeholder="Hangzhou Hengyi Technology"
              value={formData.supplierName}
              onChange={(e) => updateFormData("supplierName", e.target.value)}
              className={formErrors.supplierName ? "border-destructive" : ""}
            />
            {formErrors.supplierName && (
              <p className="text-sm text-destructive flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {formErrors.supplierName}
              </p>
            )}
          </div>
        </div>
      </div>

      <Separator />

      {/* Product & Pricing */}
      <div className="space-y-4">
        <h4 className="font-medium text-sm text-muted-foreground">Product & Pricing</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="productNature">Product Nature</Label>
            <Select
              value={formData.productNature}
              onValueChange={(value: any) => updateFormData("productNature", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Contract">Contract</SelectItem>
                <SelectItem value="Warranty">Warranty</SelectItem>
                <SelectItem value="Gift">Gift</SelectItem>
                <SelectItem value="Self-Purchase">Self-Purchase</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select value={formData.currency} onValueChange={(value: any) => updateFormData("currency", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                <SelectItem value="USD">USD - US Dollar</SelectItem>
                <SelectItem value="CNY">CNY - Chinese Yuan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="unitPrice">Unit Price *</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="unitPrice"
                type="number"
                placeholder="0.00"
                value={formData.unitPrice || ""}
                onChange={(e) => updateFormData("unitPrice", Number.parseFloat(e.target.value) || 0)}
                className={`pl-10 ${formErrors.unitPrice ? "border-destructive" : ""}`}
              />
            </div>
            {formErrors.unitPrice && (
              <p className="text-sm text-destructive flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {formErrors.unitPrice}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity *</Label>
            <Input
              id="quantity"
              type="number"
              placeholder="1"
              value={formData.quantity || ""}
              onChange={(e) => updateFormData("quantity", Number.parseInt(e.target.value) || 0)}
              className={formErrors.quantity ? "border-destructive" : ""}
            />
            {formErrors.quantity && (
              <p className="text-sm text-destructive flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {formErrors.quantity}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="totalAmount">Total Amount</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="totalAmount"
                value={formData.totalAmount.toLocaleString()}
                readOnly
                className="pl-10 bg-muted"
              />
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Status & Logistics */}
      <div className="space-y-4">
        <h4 className="font-medium text-sm text-muted-foreground">Status & Logistics</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value: any) => updateFormData("status", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="in-stock">In Stock</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select value={formData.priority} onValueChange={(value: any) => updateFormData("priority", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deliveryDate">Delivery Date *</Label>
            <Input
              id="deliveryDate"
              type="date"
              value={formData.deliveryDate}
              onChange={(e) => updateFormData("deliveryDate", e.target.value)}
              className={formErrors.deliveryDate ? "border-destructive" : ""}
            />
            {formErrors.deliveryDate && (
              <p className="text-sm text-destructive flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {formErrors.deliveryDate}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="warehouse">Warehouse *</Label>
          <Input
            id="warehouse"
            placeholder="Sydney Warehouse A"
            value={formData.warehouse}
            onChange={(e) => updateFormData("warehouse", e.target.value)}
            className={formErrors.warehouse ? "border-destructive" : ""}
          />
          {formErrors.warehouse && (
            <p className="text-sm text-destructive flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {formErrors.warehouse}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="remark">Remark</Label>
          <Textarea
            id="remark"
            placeholder="Additional notes..."
            value={formData.remark}
            onChange={(e) => updateFormData("remark", e.target.value)}
            className="min-h-[80px]"
          />
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Procurement Management</h1>
          <p className="text-muted-foreground text-sm">Manage procurement requests and workflows</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              New Request
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Create New Procurement Request</DialogTitle>
              <DialogDescription>Fill in the details for your new procurement request</DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[70vh] pr-4">
              <ProcurementForm />
            </ScrollArea>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Create Request
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search contracts, DJJ codes, or suppliers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-9"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="in-stock">In Stock</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Procurement Cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {paginatedRequests.map((request) => (
          <Card
            key={request.id}
            className={`border-l-4 ${getProductNatureColor(request.productNature)} hover:shadow-md transition-shadow`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base truncate">{request.contractNumber}</CardTitle>
                  <CardDescription className="text-xs">
                    {request.djjCode} • {request.supplierCode}
                  </CardDescription>
                </div>
                <Badge className={`${getStatusColor(request.status)} text-xs`}>{request.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Supplier Info */}
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Supplier</p>
                <p className="text-sm font-medium flex items-center">
                  <Building className="h-3 w-3 mr-1" />
                  {request.supplierName}
                </p>
              </div>

              {/* Compact Info Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">Nature</p>
                  <p className="font-medium">{request.productNature}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Priority</p>
                  <Badge className={`${getPriorityColor(request.priority)} text-xs`} variant="outline">
                    {request.priority}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Amount</p>
                  <p className="font-medium">
                    {request.currency} {request.totalAmount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Quantity</p>
                  <p className="font-medium">{request.quantity} units</p>
                </div>
              </div>

              {/* Delivery Date */}
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Delivery Date</p>
                <p className="text-sm font-medium flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {request.deliveryDate}
                </p>
              </div>

              {/* Progress */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">
                    {request.status === "delivered"
                      ? "100%"
                      : request.status === "approved"
                        ? "75%"
                        : request.status === "pending"
                          ? "25%"
                          : "0%"}
                  </span>
                </div>
                <Progress
                  value={
                    request.status === "delivered"
                      ? 100
                      : request.status === "approved"
                        ? 75
                        : request.status === "pending"
                          ? 25
                          : 0
                  }
                  className="h-1.5"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-between pt-2">
                <div className="flex space-x-1">
                  <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => openViewDialog(request)}>
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => openEditDialog(request)}>
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                    onClick={() => openDeleteDialog(request)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 分页控件 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <p className="text-sm text-muted-foreground">
              显示 {startIndex + 1}-{Math.min(endIndex, totalItems)} 项，共 {totalItems} 项
            </p>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => {
                setItemsPerPage(Number(value))
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-[100px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">6 项/页</SelectItem>
                <SelectItem value="9">9 项/页</SelectItem>
                <SelectItem value="12">12 项/页</SelectItem>
                <SelectItem value="24">24 项/页</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              上一页
            </Button>

            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    className="w-8 h-8 p-0"
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                )
              })}
              {totalPages > 5 && (
                <>
                  <span className="text-muted-foreground">...</span>
                  <Button
                    variant={currentPage === totalPages ? "default" : "outline"}
                    size="sm"
                    className="w-8 h-8 p-0"
                    onClick={() => setCurrentPage(totalPages)}
                  >
                    {totalPages}
                  </Button>
                </>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              下一页
            </Button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredRequests.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <FileText className="h-8 w-8 text-muted-foreground mb-3" />
            <h3 className="font-semibold mb-1">No requests found</h3>
            <p className="text-muted-foreground text-center text-sm mb-3">
              No procurement requests match your current filters.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm("")
                setFilterStatus("all")
                setFilterPriority("all")
              }}
            >
              Clear filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Edit Procurement Request</DialogTitle>
            <DialogDescription>
              Update the details for procurement request {editingRequest?.contractNumber}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] pr-4">
            <ProcurementForm isEdit />
          </ScrollArea>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false)
                resetForm()
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Update Request
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Procurement Request Details</DialogTitle>
            <DialogDescription>Detailed view of procurement request {viewingRequest?.contractNumber}</DialogDescription>
          </DialogHeader>
          {viewingRequest && (
            <ScrollArea className="max-h-[70vh] pr-4">
              <div className="space-y-6">
                {/* Header Info */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{viewingRequest.contractNumber}</h3>
                    <p className="text-sm text-muted-foreground">
                      Created by {viewingRequest.requestedBy} • {viewingRequest.department}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(viewingRequest.status)}>{viewingRequest.status}</Badge>
                    <Badge className={getPriorityColor(viewingRequest.priority)} variant="outline">
                      {viewingRequest.priority} priority
                    </Badge>
                  </div>
                </div>

                <Separator />

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Basic Information</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">DJJ Code</p>
                        <p className="font-medium">{viewingRequest.djjCode}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Supplier</p>
                        <p className="font-medium">{viewingRequest.supplierName}</p>
                        <p className="text-sm text-muted-foreground">{viewingRequest.supplierCode}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Product Nature</p>
                        <p className="font-medium">{viewingRequest.productNature}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Financial Details</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Unit Price</p>
                        <p className="font-medium">
                          {viewingRequest.currency} {viewingRequest.unitPrice.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Quantity</p>
                        <p className="font-medium">{viewingRequest.quantity} units</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Amount</p>
                        <p className="text-lg font-semibold text-primary">
                          {viewingRequest.currency} {viewingRequest.totalAmount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Logistics */}
                <div className="space-y-4">
                  <h4 className="font-medium">Logistics & Timeline</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Warehouse</p>
                      <p className="font-medium">{viewingRequest.warehouse}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Delivery Date</p>
                      <p className="font-medium">{viewingRequest.deliveryDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Last Updated</p>
                      <p className="font-medium">{viewingRequest.updatedDate}</p>
                    </div>
                  </div>
                </div>

                {/* Approval Info */}
                {viewingRequest.approvedBy && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <h4 className="font-medium">Approval Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Approved By</p>
                          <p className="font-medium">{viewingRequest.approvedBy}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Approval Date</p>
                          <p className="font-medium">{viewingRequest.approvalDate}</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Remarks */}
                {viewingRequest.remark && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <h4 className="font-medium">Remarks</h4>
                      <p className="text-sm bg-muted p-3 rounded-lg">{viewingRequest.remark}</p>
                    </div>
                  </>
                )}
              </div>
            </ScrollArea>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                setIsViewDialogOpen(false)
                if (viewingRequest) openEditDialog(viewingRequest)
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Procurement Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete procurement request "{deletingRequest?.contractNumber}"? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingRequest(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Request
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
