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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Package,
  Calendar,
  DollarSign,
  User,
  Building,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Copy,
  Download,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react"

interface ProductLaunch {
  id: string
  productName: string
  demandDate: string
  expectedPrice: number
  customerInfo: string
  supplierName: string
  supplierCode: string
  productDesc: string
  techStatus: "pending" | "approved" | "rejected"
  techComment: string
  deliveryDate: string
  purchaseComment: string
  financeCost: number
  financePrice: number
  financeComment: string
  djjCode: string
  finalStatus: "pending" | "launched" | "rejected"
  priority: "high" | "medium" | "low"
}

const mockData: ProductLaunch[] = [
  {
    id: "1",
    productName: "Smart Water Meter",
    demandDate: "2025-06-03",
    expectedPrice: 180,
    customerInfo: "Zhang San / Hangzhou Installation Company",
    supplierName: "Hangzhou Hengyi",
    supplierCode: "HY-2108X",
    productDesc: "Supports NB-IoT upload, built-in lithium battery",
    techStatus: "pending",
    techComment: "",
    deliveryDate: "2025-07-10",
    purchaseComment: "Initial commitment has longer delivery time",
    financeCost: 100,
    financePrice: 150,
    financeComment: "Priced according to industry standard profit",
    djjCode: "",
    finalStatus: "pending",
    priority: "high",
  },
  {
    id: "2",
    productName: "Industrial Socket Box",
    demandDate: "2025-06-01",
    expectedPrice: 220,
    customerInfo: "Li Si / Shenzhen Industrial Park",
    supplierName: "Suzhou Qiangdian",
    supplierCode: "QD-CB300",
    productDesc: "Multi-specification waterproof industrial socket box",
    techStatus: "approved",
    techComment: "Structure compliant",
    deliveryDate: "2025-06-20",
    purchaseComment: "Supplier delivery time stable",
    financeCost: 120,
    financePrice: 190,
    financeComment: "Moderate markup, competitive",
    djjCode: "DJJ0620A01",
    finalStatus: "launched",
    priority: "medium",
  },
  {
    id: "3",
    productName: "Explosion-Proof Box",
    demandDate: "2025-05-28",
    expectedPrice: 650,
    customerInfo: "Wang Wu / PetroChina Western Project",
    supplierName: "Chongqing Ankong",
    supplierCode: "AK-FB890",
    productDesc: "Class II explosion-proof rating, custom wiring configuration",
    techStatus: "rejected",
    techComment: "Internal layout does not meet project requirements",
    deliveryDate: "2025-06-25",
    purchaseComment: "Original factory has no optimization plan",
    financeCost: 400,
    financePrice: 580,
    financeComment: "Price negotiable if approved",
    djjCode: "",
    finalStatus: "rejected",
    priority: "low",
  },
]

export function ProductLaunchManagement() {
  const [products, setProducts] = useState<ProductLaunch[]>(mockData)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<ProductLaunch | null>(null)
  const [editingProduct, setEditingProduct] = useState<ProductLaunch | null>(null)
  const [newProduct, setNewProduct] = useState<Partial<ProductLaunch>>({
    productName: "",
    customerInfo: "",
    demandDate: "",
    expectedPrice: 0,
    supplierName: "",
    supplierCode: "",
    productDesc: "",
    priority: "medium",
  })

  const { toast } = useToast()

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const productsPerPage = 6

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.customerInfo.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || product.techStatus === filterStatus
    return matchesSearch && matchesStatus
  })

  // Reset to first page when search/filter changes
  useState(() => {
    setCurrentPage(1)
  }, [searchTerm, filterStatus])

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct)
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  // Handle view product
  const handleViewProduct = (product: ProductLaunch) => {
    setSelectedProduct(product)
    setIsViewDialogOpen(true)
  }

  // Handle edit product
  const handleEditProduct = (product: ProductLaunch) => {
    setEditingProduct({ ...product })
    setIsEditDialogOpen(true)
  }

  // Handle delete product
  const handleDeleteProduct = (product: ProductLaunch) => {
    setSelectedProduct(product)
    setIsDeleteDialogOpen(true)
  }

  // Handle copy product
  const handleCopyProduct = (product: ProductLaunch) => {
    const newId = (Math.max(...products.map((p) => Number.parseInt(p.id))) + 1).toString()
    const copiedProduct = {
      ...product,
      id: newId,
      productName: `${product.productName} (Copy)`,
      techStatus: "pending" as const,
      finalStatus: "pending" as const,
      techComment: "",
      djjCode: "",
    }
    setProducts([...products, copiedProduct])
    toast({
      title: "Product Copied",
      description: `${product.productName} has been copied successfully.`,
    })
  }

  // Handle add new product
  const handleAddProduct = () => {
    if (!newProduct.productName || !newProduct.customerInfo || !newProduct.supplierName) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    const newId = (Math.max(...products.map((p) => Number.parseInt(p.id))) + 1).toString()
    const productToAdd: ProductLaunch = {
      id: newId,
      productName: newProduct.productName!,
      demandDate: newProduct.demandDate!,
      expectedPrice: newProduct.expectedPrice || 0,
      customerInfo: newProduct.customerInfo!,
      supplierName: newProduct.supplierName!,
      supplierCode: newProduct.supplierCode!,
      productDesc: newProduct.productDesc!,
      techStatus: "pending",
      techComment: "",
      deliveryDate: "",
      purchaseComment: "",
      financeCost: 0,
      financePrice: 0,
      financeComment: "",
      djjCode: "",
      finalStatus: "pending",
      priority: (newProduct.priority as "high" | "medium" | "low") || "medium",
    }

    setProducts([...products, productToAdd])
    setNewProduct({
      productName: "",
      customerInfo: "",
      demandDate: "",
      expectedPrice: 0,
      supplierName: "",
      supplierCode: "",
      productDesc: "",
      priority: "medium",
    })
    setIsAddDialogOpen(false)
    toast({
      title: "Product Added",
      description: "New product launch request has been created successfully.",
    })
  }

  // Handle save edit
  const handleSaveEdit = () => {
    if (!editingProduct) return

    setProducts(products.map((p) => (p.id === editingProduct.id ? editingProduct : p)))
    setIsEditDialogOpen(false)
    setEditingProduct(null)
    toast({
      title: "Product Updated",
      description: "Product information has been updated successfully.",
    })
  }

  // Handle confirm delete
  const handleConfirmDelete = () => {
    if (!selectedProduct) return

    setProducts(products.filter((p) => p.id !== selectedProduct.id))
    setIsDeleteDialogOpen(false)
    setSelectedProduct(null)
    toast({
      title: "Product Deleted",
      description: "Product launch request has been deleted successfully.",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "launched":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const getProgressValue = (techStatus: string, finalStatus: string) => {
    if (techStatus === "rejected" || finalStatus === "rejected") return 25
    if (techStatus === "pending") return 25
    if (techStatus === "approved" && finalStatus === "pending") return 75
    if (finalStatus === "launched") return 100
    return 0
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4" />
      case "rejected":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Launch Management</h1>
          <p className="text-muted-foreground">Manage new product launch requests and approval workflows</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Product Request
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Product Launch Request</DialogTitle>
              <DialogDescription>Submit a new product for launch approval</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="productName">Product Name *</Label>
                <Input
                  id="productName"
                  placeholder="Smart Water Meter"
                  value={newProduct.productName}
                  onChange={(e) => setNewProduct({ ...newProduct, productName: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerInfo">Customer Information *</Label>
                  <Input
                    id="customerInfo"
                    placeholder="Customer name / Company"
                    value={newProduct.customerInfo}
                    onChange={(e) => setNewProduct({ ...newProduct, customerInfo: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="demandDate">Demand Date</Label>
                  <Input
                    id="demandDate"
                    type="date"
                    value={newProduct.demandDate}
                    onChange={(e) => setNewProduct({ ...newProduct, demandDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expectedPrice">Expected Price</Label>
                  <Input
                    id="expectedPrice"
                    type="number"
                    placeholder="0.00"
                    value={newProduct.expectedPrice}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, expectedPrice: Number.parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={newProduct.priority}
                    onValueChange={(value) =>
                      setNewProduct({ ...newProduct, priority: value as "high" | "medium" | "low" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supplierName">Supplier Name *</Label>
                  <Input
                    id="supplierName"
                    placeholder="Supplier company"
                    value={newProduct.supplierName}
                    onChange={(e) => setNewProduct({ ...newProduct, supplierName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supplierCode">Supplier Code</Label>
                  <Input
                    id="supplierCode"
                    placeholder="HY-2108X"
                    value={newProduct.supplierCode}
                    onChange={(e) => setNewProduct({ ...newProduct, supplierCode: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="productDesc">Product Description</Label>
                <Textarea
                  id="productDesc"
                  placeholder="Detailed product description..."
                  value={newProduct.productDesc}
                  onChange={(e) => setNewProduct({ ...newProduct, productDesc: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddProduct}>Submit Request</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by product name or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Product Launch Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {currentProducts.map((product) => (
          <Card key={product.id} className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{product.productName}</CardTitle>
                <Badge className={getStatusColor(product.techStatus)}>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(product.techStatus)}
                    {product.techStatus}
                  </div>
                </Badge>
              </div>
              <CardDescription className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                {product.customerInfo}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Expected Price</p>
                  <p className="font-medium flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" />${product.expectedPrice}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Priority</p>
                  <Badge className={getPriorityColor(product.priority)} variant="outline">
                    {product.priority}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Demand Date</p>
                  <p className="font-medium flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {product.demandDate}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Supplier</p>
                  <p className="font-medium flex items-center">
                    <Building className="h-4 w-4 mr-1" />
                    {product.supplierName}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-muted-foreground text-sm">Supplier Code</p>
                <p className="font-medium">{product.supplierCode}</p>
              </div>

              <div>
                <p className="text-muted-foreground text-sm">Description</p>
                <p className="text-sm line-clamp-2">{product.productDesc}</p>
              </div>

              {product.techComment && (
                <div>
                  <p className="text-muted-foreground text-sm">Technical Comment</p>
                  <p className="text-sm line-clamp-2">{product.techComment}</p>
                </div>
              )}

              {/* Progress Steps */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Launch Progress</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Technical → Purchase → Finance → Launch</span>
                    <span>{getProgressValue(product.techStatus, product.finalStatus)}%</span>
                  </div>
                  <Progress value={getProgressValue(product.techStatus, product.finalStatus)} className="h-1" />
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleViewProduct(product)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleEditProduct(product)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => handleViewProduct(product)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleCopyProduct(product)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDeleteProduct(product)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {currentProducts.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground text-center mb-4">
              No product launch requests match your current filters.
            </p>
            <Button
              onClick={() => {
                setSearchTerm("")
                setFilterStatus("all")
              }}
            >
              Clear filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <Button variant="outline" size="icon" disabled={currentPage === 1} onClick={() => paginate(currentPage - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
            <Button
              key={number}
              variant={currentPage === number ? "default" : "outline"}
              onClick={() => paginate(number)}
              className="w-10"
            >
              {number}
            </Button>
          ))}

          <Button
            variant="outline"
            size="icon"
            disabled={currentPage === totalPages}
            onClick={() => paginate(currentPage + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* View Product Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {selectedProduct?.productName}
            </DialogTitle>
            <DialogDescription>Product launch request details</DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Product Name</p>
                      <p className="font-medium">{selectedProduct.productName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Customer Info</p>
                      <p className="font-medium">{selectedProduct.customerInfo}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Expected Price</p>
                      <p className="font-medium">${selectedProduct.expectedPrice}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Priority</p>
                      <Badge className={getPriorityColor(selectedProduct.priority)}>{selectedProduct.priority}</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Supplier Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Supplier Name</p>
                      <p className="font-medium">{selectedProduct.supplierName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Supplier Code</p>
                      <p className="font-medium">{selectedProduct.supplierCode}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Demand Date</p>
                      <p className="font-medium">{selectedProduct.demandDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Delivery Date</p>
                      <p className="font-medium">{selectedProduct.deliveryDate || "TBD"}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Product Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{selectedProduct.productDesc}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Status & Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Technical Status</p>
                      <Badge className={getStatusColor(selectedProduct.techStatus)}>{selectedProduct.techStatus}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Final Status</p>
                      <Badge className={getStatusColor(selectedProduct.finalStatus)}>
                        {selectedProduct.finalStatus}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Launch Progress</p>
                    <Progress
                      value={getProgressValue(selectedProduct.techStatus, selectedProduct.finalStatus)}
                      className="h-2"
                    />
                  </div>

                  {selectedProduct.techComment && (
                    <div>
                      <p className="text-sm text-muted-foreground">Technical Comment</p>
                      <p className="text-sm bg-muted p-3 rounded">{selectedProduct.techComment}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Product Launch Request</DialogTitle>
            <DialogDescription>Update product information</DialogDescription>
          </DialogHeader>
          {editingProduct && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-productName">Product Name</Label>
                <Input
                  id="edit-productName"
                  value={editingProduct.productName}
                  onChange={(e) => setEditingProduct({ ...editingProduct, productName: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-customerInfo">Customer Information</Label>
                  <Input
                    id="edit-customerInfo"
                    value={editingProduct.customerInfo}
                    onChange={(e) => setEditingProduct({ ...editingProduct, customerInfo: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-expectedPrice">Expected Price</Label>
                  <Input
                    id="edit-expectedPrice"
                    type="number"
                    value={editingProduct.expectedPrice}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, expectedPrice: Number.parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-supplierName">Supplier Name</Label>
                  <Input
                    id="edit-supplierName"
                    value={editingProduct.supplierName}
                    onChange={(e) => setEditingProduct({ ...editingProduct, supplierName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-priority">Priority</Label>
                  <Select
                    value={editingProduct.priority}
                    onValueChange={(value) =>
                      setEditingProduct({ ...editingProduct, priority: value as "high" | "medium" | "low" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-productDesc">Product Description</Label>
                <Textarea
                  id="edit-productDesc"
                  value={editingProduct.productDesc}
                  onChange={(e) => setEditingProduct({ ...editingProduct, productDesc: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product launch request for{" "}
              <strong>{selectedProduct?.productName}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
