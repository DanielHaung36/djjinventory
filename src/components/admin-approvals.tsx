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
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  AlertTriangle,
  FileText,
  Package,
  ShoppingCart,
  User,
  Calendar,
  DollarSign,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ApprovalItem {
  id: string
  type: "procurement" | "product-launch"
  title: string
  requester: string
  department: string
  submittedDate: string
  priority: "high" | "medium" | "low"
  status: "pending" | "approved" | "rejected"
  description: string
  amount?: number
  currency?: string
  dueDate: string
  documents: string[]
}

const mockApprovals: ApprovalItem[] = [
  {
    id: "A001",
    type: "procurement",
    title: "Industrial Water Meters - Contract JH240411AULG",
    requester: "John Smith",
    department: "Procurement",
    submittedDate: "2024-01-15",
    priority: "high",
    status: "pending",
    description:
      "Procurement request for industrial water meters with NB-IoT capability for Hangzhou installation project.",
    amount: 14491,
    currency: "AUD",
    dueDate: "2024-01-20",
    documents: ["Contract_JH240411AULG.pdf", "Technical_Specs.pdf"],
  },
  {
    id: "A002",
    type: "product-launch",
    title: "Smart Temperature Sensor Launch",
    requester: "Sarah Johnson",
    department: "Product Development",
    submittedDate: "2024-01-14",
    priority: "medium",
    status: "pending",
    description:
      "New product launch request for outdoor temperature and humidity collection terminal with solar power supply.",
    amount: 320,
    currency: "AUD",
    dueDate: "2024-01-25",
    documents: ["Product_Specs.pdf", "Market_Analysis.pdf", "Cost_Analysis.xlsx"],
  },
  {
    id: "A003",
    type: "procurement",
    title: "Explosion-Proof Enclosures - Emergency Order",
    requester: "Mike Chen",
    department: "Procurement",
    submittedDate: "2024-01-13",
    priority: "high",
    status: "approved",
    description: "Emergency procurement for Class II explosion-proof enclosures for PetroChina Western Project.",
    amount: 650,
    currency: "AUD",
    dueDate: "2024-01-18",
    documents: ["Emergency_Request.pdf", "Safety_Certification.pdf"],
  },
  {
    id: "A004",
    type: "product-launch",
    title: "Outdoor Lightning Protection Box",
    requester: "Lisa Wang",
    department: "Product Development",
    submittedDate: "2024-01-12",
    priority: "low",
    status: "rejected",
    description:
      "Product launch request for aluminum alloy outdoor lightning protection box suitable for pole installation.",
    amount: 120,
    currency: "AUD",
    dueDate: "2024-01-22",
    documents: ["Product_Design.pdf", "Competitor_Analysis.pdf"],
  },
]

export function AdminApprovals() {
  const [approvals, setApprovals] = useState<ApprovalItem[]>(mockApprovals)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [selectedApproval, setSelectedApproval] = useState<ApprovalItem | null>(null)
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
  const [reviewComment, setReviewComment] = useState("")
  const { toast } = useToast()

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)

  const filteredApprovals = approvals.filter((approval) => {
    const matchesSearch =
      approval.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      approval.requester.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || approval.type === filterType
    const matchesStatus = filterStatus === "all" || approval.status === filterStatus
    return matchesSearch && matchesType && matchesStatus
  })

  const pendingApprovals = filteredApprovals.filter((a) => a.status === "pending")
  const completedApprovals = filteredApprovals.filter((a) => a.status !== "pending")

  // 分页逻辑
  const totalPendingPages = Math.ceil(pendingApprovals.length / itemsPerPage)
  const totalCompletedPages = Math.ceil(completedApprovals.length / itemsPerPage)

  const paginatedPending = pendingApprovals.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const paginatedCompleted = completedApprovals.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleApproval = (approvalId: string, decision: "approved" | "rejected") => {
    setApprovals((prev) =>
      prev.map((approval) => (approval.id === approvalId ? { ...approval, status: decision } : approval)),
    )

    toast({
      title: decision === "approved" ? "Request Approved" : "Request Rejected",
      description: `The request has been ${decision}.`,
    })

    setIsReviewDialogOpen(false)
    setSelectedApproval(null)
    setReviewComment("")
  }

  const openReviewDialog = (approval: ApprovalItem) => {
    setSelectedApproval(approval)
    setIsReviewDialogOpen(true)
  }

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Approvals</h1>
          <p className="text-muted-foreground">Review and approve procurement and product launch requests</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-yellow-50">
            {pendingApprovals.length} Pending
          </Badge>
          <Badge variant="outline" className="bg-red-50">
            {pendingApprovals.filter((a) => isOverdue(a.dueDate)).length} Overdue
          </Badge>
        </div>
      </div>

      {/* Urgent Alerts */}
      {pendingApprovals.some((a) => a.priority === "high" || isOverdue(a.dueDate)) && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            You have {pendingApprovals.filter((a) => a.priority === "high").length} high priority requests and{" "}
            {pendingApprovals.filter((a) => isOverdue(a.dueDate)).length} overdue items requiring immediate attention.
          </AlertDescription>
        </Alert>
      )}

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by title or requester..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="procurement">Procurement</SelectItem>
            <SelectItem value="product-launch">Product Launch</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
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

      {/* Tabs for Pending vs Completed */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending Approvals ({pendingApprovals.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedApprovals.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <div className="grid gap-4">
            {paginatedPending.map((approval) => (
              <Card key={approval.id} className={`${isOverdue(approval.dueDate) ? "border-red-200 bg-red-50" : ""}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center space-x-2">
                        {approval.type === "procurement" ? (
                          <ShoppingCart className="h-5 w-5 text-blue-600" />
                        ) : (
                          <Package className="h-5 w-5 text-green-600" />
                        )}
                        <span>{approval.title}</span>
                        {isOverdue(approval.dueDate) && (
                          <Badge variant="destructive" className="ml-2">
                            Overdue
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {approval.requester} • {approval.department}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Due: {approval.dueDate}
                        </span>
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getPriorityColor(approval.priority)} variant="outline">
                        {approval.priority}
                      </Badge>
                      <Badge className={getStatusColor(approval.status)}>{approval.status}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{approval.description}</p>

                  {approval.amount && (
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {approval.currency} {approval.amount.toLocaleString()}
                      </span>
                    </div>
                  )}

                  {approval.documents.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Documents:</p>
                      <div className="flex flex-wrap gap-2">
                        {approval.documents.map((doc, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            <FileText className="h-3 w-3 mr-1" />
                            {doc}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline" onClick={() => openReviewDialog(approval)}>
                      Review Details
                    </Button>
                    <Button variant="destructive" onClick={() => handleApproval(approval.id, "rejected")}>
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button onClick={() => handleApproval(approval.id, "approved")}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {paginatedPending.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
                <p className="text-muted-foreground text-center">No pending approvals at the moment.</p>
              </CardContent>
            </Card>
          )}

          {/* Pagination Controls */}
          {totalPendingPages > 1 && (
            <div className="flex justify-center space-x-2">
              {Array.from({ length: totalPendingPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="grid gap-4">
            {paginatedCompleted.map((approval) => (
              <Card key={approval.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center space-x-2">
                        {approval.type === "procurement" ? (
                          <ShoppingCart className="h-5 w-5 text-blue-600" />
                        ) : (
                          <Package className="h-5 w-5 text-green-600" />
                        )}
                        <span>{approval.title}</span>
                      </CardTitle>
                      <CardDescription className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {approval.requester} • {approval.department}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Submitted: {approval.submittedDate}
                        </span>
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(approval.status)}>{approval.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{approval.description}</p>
                  {approval.amount && (
                    <div className="flex items-center space-x-2 mt-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {approval.currency} {approval.amount.toLocaleString()}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {paginatedCompleted.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No completed approvals</h3>
                <p className="text-muted-foreground text-center">Completed approvals will appear here.</p>
              </CardContent>
            </Card>
          )}

          {/* Pagination Controls */}
          {totalCompletedPages > 1 && (
            <div className="flex justify-center space-x-2">
              {Array.from({ length: totalCompletedPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Request</DialogTitle>
            <DialogDescription>Review the details and provide your decision</DialogDescription>
          </DialogHeader>
          {selectedApproval && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Requester</Label>
                  <p className="text-sm">{selectedApproval.requester}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Department</Label>
                  <p className="text-sm">{selectedApproval.department}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Type</Label>
                  <p className="text-sm capitalize">{selectedApproval.type.replace("-", " ")}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Priority</Label>
                  <Badge className={getPriorityColor(selectedApproval.priority)} variant="outline">
                    {selectedApproval.priority}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-sm mt-1">{selectedApproval.description}</p>
              </div>

              {selectedApproval.amount && (
                <div>
                  <Label className="text-sm font-medium">Amount</Label>
                  <p className="text-sm mt-1">
                    {selectedApproval.currency} {selectedApproval.amount.toLocaleString()}
                  </p>
                </div>
              )}

              <div>
                <Label htmlFor="reviewComment">Review Comment</Label>
                <Textarea
                  id="reviewComment"
                  placeholder="Add your review comments..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedApproval && handleApproval(selectedApproval.id, "rejected")}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button onClick={() => selectedApproval && handleApproval(selectedApproval.id, "approved")}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
