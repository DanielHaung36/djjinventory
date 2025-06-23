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
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  AlertTriangle,
  FileText,
  Package,
  User,
  Calendar,
  DollarSign,
  Eye,
  MessageSquare,
  Star,
  TrendingUp,
  Building,
  Target,
  Download,
  ImageIcon,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ProductLaunchRequest {
  id: string
  productName: string
  productCategory: string
  submitter: string
  department: string
  submittedDate: string
  priority: "high" | "medium" | "low"
  status: "pending" | "under-review" | "approved" | "rejected" | "needs-revision"

  // Basic Information
  productDescription: string
  targetMarket: string

  // Business Information
  expectedPrice: number
  currency: string
  estimatedDemand: number
  launchTimeline: string

  // Customer & Market
  customerInfo: string
  competitorAnalysis: string
  uniqueSellingPoints: string

  // Supplier Information
  supplierName: string
  supplierCode: string
  supplierContact: string

  // Technical Specifications
  technicalSpecs: string
  certifications: string
  complianceRequirements: string

  // Financial Information
  developmentCost: number
  manufacturingCost: number
  expectedMargin: number

  // Additional Information
  riskAssessment: string
  marketingStrategy: string
  supportRequirements: string

  // Review Information
  reviewComments: ReviewComment[]
  overallScore: number

  // Files
  productImages: string[]
  technicalDocuments: string[]
  marketResearch: string[]
}

interface ReviewComment {
  id: string
  reviewer: string
  department: string
  date: string
  category: "technical" | "business" | "financial" | "market" | "general"
  rating: number
  comment: string
  status: "pending" | "addressed"
}

const mockRequests: ProductLaunchRequest[] = [
  {
    id: "PLR-001",
    productName: "Smart IoT Water Meter Pro",
    productCategory: "Electronics",
    submitter: "Sarah Johnson",
    department: "Product Development",
    submittedDate: "2024-01-15",
    priority: "high",
    status: "pending",
    productDescription:
      "Advanced smart water meter with NB-IoT connectivity, real-time monitoring, and leak detection capabilities. Features long-life battery and weatherproof design.",
    targetMarket:
      "Municipal water utilities, smart city projects, and commercial buildings requiring accurate water consumption monitoring.",
    expectedPrice: 285,
    currency: "AUD",
    estimatedDemand: 5000,
    launchTimeline: "Q2 2024",
    customerInfo:
      "City of Melbourne has expressed strong interest. Initial order of 1000 units confirmed upon approval.",
    competitorAnalysis:
      "Main competitors: Sensus, Itron. Our product offers 20% better battery life and 15% lower cost.",
    uniqueSellingPoints: "Superior battery life, advanced leak detection, competitive pricing, local support.",
    supplierName: "TechFlow Solutions",
    supplierCode: "TFS-WM-2024",
    supplierContact: "james.chen@techflow.com",
    technicalSpecs:
      "NB-IoT connectivity, 10-year battery life, IP68 rating, -20°C to +60°C operating range, ±2% accuracy",
    certifications: "CE, FCC, ACMA, WaterMark",
    complianceRequirements: "Australian Water Quality Standards, Smart Meter Standards AS/NZS 4755",
    developmentCost: 45000,
    manufacturingCost: 180,
    expectedMargin: 35,
    riskAssessment:
      "Low technical risk. Main risks: supply chain delays, regulatory changes. Mitigation: dual supplier strategy.",
    marketingStrategy: "Target municipal utilities, trade shows, digital marketing, partner channel development.",
    supportRequirements: "Technical documentation, training materials, 24/7 support hotline, field service network.",
    reviewComments: [
      {
        id: "RC-001",
        reviewer: "Dr. Michael Zhang",
        department: "Technical Review",
        date: "2024-01-16",
        category: "technical",
        rating: 4,
        comment: "Strong technical specifications. Battery life claims need verification. Recommend prototype testing.",
        status: "pending",
      },
      {
        id: "RC-002",
        reviewer: "Lisa Wang",
        department: "Market Analysis",
        date: "2024-01-16",
        category: "market",
        rating: 5,
        comment: "Excellent market opportunity. Customer validation is strong. Competitive positioning is favorable.",
        status: "pending",
      },
    ],
    overallScore: 4.2,
    productImages: ["water-meter-1.jpg", "water-meter-2.jpg", "water-meter-3.jpg"],
    technicalDocuments: ["technical-specs.pdf", "certification-docs.pdf"],
    marketResearch: ["market-analysis.pdf", "competitor-research.xlsx"],
  },
  {
    id: "PLR-002",
    productName: "Industrial Temperature Sensor Array",
    productCategory: "Industrial",
    submitter: "Mark Thompson",
    department: "Engineering",
    submittedDate: "2024-01-14",
    priority: "medium",
    status: "under-review",
    productDescription:
      "Multi-point temperature monitoring system for industrial applications with wireless connectivity and cloud integration.",
    targetMarket:
      "Manufacturing facilities, food processing, pharmaceutical companies requiring precise temperature monitoring.",
    expectedPrice: 450,
    currency: "AUD",
    estimatedDemand: 2000,
    launchTimeline: "Q3 2024",
    customerInfo:
      "Three major food processing companies have shown interest. Pilot program scheduled with FoodCorp Australia.",
    competitorAnalysis:
      "Limited direct competition in multi-point wireless systems. Opportunity for market leadership.",
    uniqueSellingPoints: "Multi-point monitoring, wireless mesh network, cloud analytics, easy installation.",
    supplierName: "Precision Instruments Ltd",
    supplierCode: "PIL-TS-2024",
    supplierContact: "anna.smith@precision.com",
    technicalSpecs: "16-point monitoring, ±0.1°C accuracy, 2.4GHz wireless, cloud connectivity, mobile app",
    certifications: "CE, FCC, FDA (food grade)",
    complianceRequirements: "HACCP compliance, FDA food safety standards",
    developmentCost: 65000,
    manufacturingCost: 280,
    expectedMargin: 38,
    riskAssessment: "Medium risk due to complex wireless networking. Regulatory approval timeline uncertain.",
    marketingStrategy: "Industry trade shows, direct sales, system integrator partnerships, technical webinars.",
    supportRequirements: "Installation guides, technical training, remote monitoring support, maintenance contracts.",
    reviewComments: [
      {
        id: "RC-003",
        reviewer: "David Kim",
        department: "Technical Review",
        date: "2024-01-15",
        category: "technical",
        rating: 3,
        comment:
          "Wireless mesh complexity concerns. Need more details on network reliability and interference handling.",
        status: "pending",
      },
    ],
    overallScore: 3.8,
    productImages: ["temp-sensor-1.jpg", "temp-sensor-2.jpg"],
    technicalDocuments: ["wireless-specs.pdf", "installation-guide.pdf"],
    marketResearch: ["industrial-market-study.pdf"],
  },
  {
    id: "PLR-003",
    productName: "Compact Solar Charge Controller",
    productCategory: "Electronics",
    submitter: "Emma Rodriguez",
    department: "Product Development",
    submittedDate: "2024-01-12",
    priority: "low",
    status: "approved",
    productDescription:
      "High-efficiency MPPT solar charge controller for residential and small commercial solar installations.",
    targetMarket:
      "Residential solar installers, RV enthusiasts, off-grid applications, small commercial solar systems.",
    expectedPrice: 320,
    currency: "AUD",
    estimatedDemand: 3500,
    launchTimeline: "Q1 2024",
    customerInfo: "Strong demand from solar installer network. Pre-orders from 5 major distributors.",
    competitorAnalysis: "Competitive market but our efficiency ratings are superior. Price point is competitive.",
    uniqueSellingPoints: "99.5% efficiency, compact design, advanced MPPT algorithm, mobile monitoring.",
    supplierName: "SolarTech Manufacturing",
    supplierCode: "STM-CC-2024",
    supplierContact: "robert.lee@solartech.com",
    technicalSpecs: "40A capacity, 12V/24V auto-detect, MPPT efficiency 99.5%, LCD display, Bluetooth connectivity",
    certifications: "CE, FCC, CEC approved",
    complianceRequirements: "Australian solar standards AS/NZS 5033",
    developmentCost: 35000,
    manufacturingCost: 195,
    expectedMargin: 39,
    riskAssessment: "Low risk. Proven technology. Main risk is component supply chain.",
    marketingStrategy: "Solar trade shows, installer partnerships, online marketing, technical content marketing.",
    supportRequirements: "Installation manuals, mobile app, technical support hotline, warranty service.",
    reviewComments: [
      {
        id: "RC-004",
        reviewer: "Jennifer Adams",
        department: "Financial Review",
        date: "2024-01-13",
        category: "financial",
        rating: 5,
        comment: "Excellent financial projections. Strong margins and realistic demand estimates. Approved for launch.",
        status: "addressed",
      },
    ],
    overallScore: 4.6,
    productImages: ["solar-controller-1.jpg", "solar-controller-2.jpg", "solar-controller-app.jpg"],
    technicalDocuments: ["mppt-specs.pdf", "efficiency-test-results.pdf"],
    marketResearch: ["solar-market-trends.pdf", "installer-survey.pdf"],
  },
]

export function AdminProductReview() {
  const [requests, setRequests] = useState<ProductLaunchRequest[]>(mockRequests)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterPriority, setFilterPriority] = useState<string>("all")
  const [selectedRequest, setSelectedRequest] = useState<ProductLaunchRequest | null>(null)
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
  const [reviewComment, setReviewComment] = useState("")
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewCategory, setReviewCategory] = useState<ReviewComment["category"]>("general")
  const { toast } = useToast()

  // Pagination state
  const [pendingPage, setPendingPage] = useState(1)
  const [completedPage, setCompletedPage] = useState(1)
  const pageSize = 5

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.submitter.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.productCategory.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || request.status === filterStatus
    const matchesPriority = filterPriority === "all" || request.priority === filterPriority
    return matchesSearch && matchesStatus && matchesPriority
  })

  const pendingRequests = filteredRequests.filter((r) => r.status === "pending" || r.status === "under-review")
  const completedRequests = filteredRequests.filter((r) => r.status === "approved" || r.status === "rejected")

  // Paginated requests
  const paginatedPendingRequests = pendingRequests.slice((pendingPage - 1) * pageSize, pendingPage * pageSize)
  const paginatedCompletedRequests = completedRequests.slice((completedPage - 1) * pageSize, completedPage * pageSize)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "status-approved"
      case "pending":
        return "status-pending"
      case "under-review":
        return "status-info"
      case "rejected":
        return "status-rejected"
      case "needs-revision":
        return "status-warning"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "priority-high"
      case "medium":
        return "priority-medium"
      case "low":
        return "priority-low"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleStatusChange = (requestId: string, newStatus: "approved" | "rejected" | "needs-revision") => {
    setRequests((prev) =>
      prev.map((request) => (request.id === requestId ? { ...request, status: newStatus } : request)),
    )

    toast({
      title: `Request ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
      description: `The product launch request has been ${newStatus}.`,
    })

    setIsReviewDialogOpen(false)
    setSelectedRequest(null)
    setReviewComment("")
    setReviewRating(5)
  }

  const addReviewComment = () => {
    if (!selectedRequest || !reviewComment.trim()) return

    const newComment: ReviewComment = {
      id: `RC-${Date.now()}`,
      reviewer: "Current Admin", // In real app, get from auth context
      department: "Admin Review",
      date: new Date().toISOString().split("T")[0],
      category: reviewCategory,
      rating: reviewRating,
      comment: reviewComment,
      status: "pending",
    }

    setRequests((prev) =>
      prev.map((request) =>
        request.id === selectedRequest.id
          ? {
              ...request,
              reviewComments: [...request.reviewComments, newComment],
              status: "under-review",
            }
          : request,
      ),
    )

    toast({
      title: "Review Comment Added",
      description: "Your review comment has been added to the request.",
    })

    setReviewComment("")
    setReviewRating(5)
  }

  const openReviewDialog = (request: ProductLaunchRequest) => {
    setSelectedRequest(request)
    setIsReviewDialogOpen(true)
  }

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return "text-green-600"
    if (score >= 3.5) return "text-yellow-600"
    return "text-red-600"
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
    ))
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Launch Review</h1>
          <p className="text-muted-foreground">Review and approve new product launch requests</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="status-pending">
            {pendingRequests.length} Pending Review
          </Badge>
          <Badge variant="outline" className="status-info">
            {requests.filter((r) => r.status === "under-review").length} Under Review
          </Badge>
        </div>
      </div>

      {/* Urgent Alerts */}
      {pendingRequests.some((r) => r.priority === "high") && (
        <Alert className="border-red-200 bg-red-50 animate-slide-up">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            You have {pendingRequests.filter((r) => r.priority === "high").length} high priority product launch requests
            requiring immediate attention.
          </AlertDescription>
        </Alert>
      )}

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by product name, submitter, or category..."
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
                <SelectItem value="under-review">Under Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="needs-revision">Needs Revision</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="low">Low Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Pending vs Completed */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending" className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Pending Review ({pendingRequests.length})</span>
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4" />
            <span>Completed ({completedRequests.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <div className="grid gap-6">
            {paginatedPendingRequests.map((request) => (
              <Card key={request.id} className={`card-hover ${getPriorityColor(request.priority)}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="flex items-center space-x-2">
                        <Package className="h-5 w-5 text-primary" />
                        <span>{request.productName}</span>
                        <Badge variant="outline" className="ml-2">
                          {request.productCategory}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {request.submitter} • {request.department}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Submitted: {request.submittedDate}
                        </span>
                        <span className="flex items-center">
                          <Target className="h-4 w-4 mr-1" />
                          Launch: {request.launchTimeline}
                        </span>
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getPriorityColor(request.priority)} variant="outline">
                        {request.priority} priority
                      </Badge>
                      <Badge className={getStatusColor(request.status)}>{request.status.replace("-", " ")}</Badge>
                      {request.overallScore > 0 && (
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className={`font-medium ${getScoreColor(request.overallScore)}`}>
                            {request.overallScore.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">{request.productDescription}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Expected Price</p>
                      <p className="font-medium flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        {request.currency} {request.expectedPrice.toLocaleString()}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Est. Demand</p>
                      <p className="font-medium">{request.estimatedDemand.toLocaleString()} units/year</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Margin</p>
                      <p className="font-medium text-green-600">{request.expectedMargin}%</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Supplier</p>
                      <p className="font-medium flex items-center">
                        <Building className="h-4 w-4 mr-1" />
                        {request.supplierName}
                      </p>
                    </div>
                  </div>

                  {request.reviewComments.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium flex items-center">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Recent Reviews ({request.reviewComments.length})
                      </p>
                      <div className="space-y-2">
                        {request.reviewComments.slice(-2).map((comment) => (
                          <div key={comment.id} className="bg-muted/30 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium">{comment.reviewer}</span>
                              <div className="flex items-center space-x-1">{renderStars(comment.rating)}</div>
                            </div>
                            <p className="text-sm text-muted-foreground">{comment.comment}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-4">
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => openReviewDialog(request)}>
                        <Eye className="h-4 w-4 mr-1" />
                        Review Details
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Documents
                      </Button>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(request.id, "needs-revision")}
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Request Changes
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleStatusChange(request.id, "rejected")}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange(request.id, "approved")}
                        className="gradient-success"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {pendingRequests.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
                <p className="text-muted-foreground text-center">No pending product launch requests at the moment.</p>
              </CardContent>
            </Card>
          )}

          {/* Pagination Controls for Pending Requests */}
          {pendingRequests.length > 0 && (
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={() => setPendingPage((prev) => Math.max(prev - 1, 1))}
                disabled={pendingPage === 1}
              >
                <ChevronsLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <span>
                Page {pendingPage} of {Math.ceil(pendingRequests.length / pageSize)}
              </span>
              <Button
                variant="outline"
                onClick={() =>
                  setPendingPage((prev) => Math.min(prev + 1, Math.ceil(pendingRequests.length / pageSize)))
                }
                disabled={pendingPage === Math.ceil(pendingRequests.length / pageSize)}
              >
                Next
                <ChevronsRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="grid gap-4">
            {paginatedCompletedRequests.map((request) => (
              <Card key={request.id} className="card-hover">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center space-x-2">
                        <Package className="h-5 w-5 text-primary" />
                        <span>{request.productName}</span>
                      </CardTitle>
                      <CardDescription className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {request.submitter} • {request.department}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Submitted: {request.submittedDate}
                        </span>
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                      {request.overallScore > 0 && (
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className={`font-medium ${getScoreColor(request.overallScore)}`}>
                            {request.overallScore.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{request.productDescription}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm">
                        <DollarSign className="h-4 w-4 inline mr-1" />
                        {request.currency} {request.expectedPrice.toLocaleString()}
                      </span>
                      <span className="text-sm">
                        <TrendingUp className="h-4 w-4 inline mr-1" />
                        {request.expectedMargin}% margin
                      </span>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => openReviewDialog(request)}>
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {completedRequests.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No completed reviews</h3>
                <p className="text-muted-foreground text-center">Completed product launch reviews will appear here.</p>
              </CardContent>
            </Card>
          )}

          {/* Pagination Controls for Completed Requests */}
          {completedRequests.length > 0 && (
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={() => setCompletedPage((prev) => Math.max(prev - 1, 1))}
                disabled={completedPage === 1}
              >
                <ChevronsLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <span>
                Page {completedPage} of {Math.ceil(completedRequests.length / pageSize)}
              </span>
              <Button
                variant="outline"
                onClick={() =>
                  setCompletedPage((prev) => Math.min(prev + 1, Math.ceil(completedRequests.length / pageSize)))
                }
                disabled={completedPage === Math.ceil(completedRequests.length / pageSize)}
              >
                Next
                <ChevronsRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Detailed Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Product Launch Review: {selectedRequest?.productName}
            </DialogTitle>
            <DialogDescription>Comprehensive review of product launch request</DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <ScrollArea className="max-h-[70vh]">
              <div className="space-y-6 pr-4">
                {/* Overview Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Product Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium">Product Name</Label>
                        <p className="text-sm mt-1">{selectedRequest.productName}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Category</Label>
                        <p className="text-sm mt-1">{selectedRequest.productCategory}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Description</Label>
                        <p className="text-sm mt-1">{selectedRequest.productDescription}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Target Market</Label>
                        <p className="text-sm mt-1">{selectedRequest.targetMarket}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Financial Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Expected Price</Label>
                          <p className="text-lg font-semibold">
                            {selectedRequest.currency} {selectedRequest.expectedPrice.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Manufacturing Cost</Label>
                          <p className="text-lg font-semibold">
                            {selectedRequest.currency} {selectedRequest.manufacturingCost.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Expected Margin</Label>
                          <p className="text-lg font-semibold text-green-600">{selectedRequest.expectedMargin}%</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Est. Annual Demand</Label>
                          <p className="text-lg font-semibold">{selectedRequest.estimatedDemand.toLocaleString()}</p>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Development Cost</Label>
                        <p className="text-sm mt-1">
                          {selectedRequest.currency} {selectedRequest.developmentCost.toLocaleString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Technical & Supplier Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Technical Specifications</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium">Specifications</Label>
                        <p className="text-sm mt-1">{selectedRequest.technicalSpecs}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Certifications</Label>
                        <p className="text-sm mt-1">{selectedRequest.certifications || "Not specified"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Compliance Requirements</Label>
                        <p className="text-sm mt-1">{selectedRequest.complianceRequirements || "Not specified"}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Supplier Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium">Supplier Name</Label>
                        <p className="text-sm mt-1">{selectedRequest.supplierName}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Supplier Code</Label>
                        <p className="text-sm mt-1">{selectedRequest.supplierCode}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Contact</Label>
                        <p className="text-sm mt-1">{selectedRequest.supplierContact || "Not provided"}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Market Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Market Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Customer Information</Label>
                      <p className="text-sm mt-1">{selectedRequest.customerInfo}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Competitor Analysis</Label>
                      <p className="text-sm mt-1">{selectedRequest.competitorAnalysis || "Not provided"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Unique Selling Points</Label>
                      <p className="text-sm mt-1">{selectedRequest.uniqueSellingPoints || "Not provided"}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Risk & Strategy */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Risk Assessment</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{selectedRequest.riskAssessment || "Not provided"}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Marketing Strategy</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{selectedRequest.marketingStrategy || "Not provided"}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Documents */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Supporting Documents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Product Images</Label>
                        <div className="space-y-1">
                          {selectedRequest.productImages.map((image, index) => (
                            <div key={index} className="flex items-center text-sm">
                              <ImageIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                              {image}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Technical Documents</Label>
                        <div className="space-y-1">
                          {selectedRequest.technicalDocuments.map((doc, index) => (
                            <div key={index} className="flex items-center text-sm">
                              <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                              {doc}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Market Research</Label>
                        <div className="space-y-1">
                          {selectedRequest.marketResearch.map((research, index) => (
                            <div key={index} className="flex items-center text-sm">
                              <Target className="h-4 w-4 mr-2 text-muted-foreground" />
                              {research}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Review Comments */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Review Comments</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedRequest.reviewComments.length > 0 ? (
                      selectedRequest.reviewComments.map((comment) => (
                        <div key={comment.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{comment.reviewer}</span>
                              <Badge variant="outline">{comment.department}</Badge>
                              <Badge variant="outline">{comment.category}</Badge>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center space-x-1">{renderStars(comment.rating)}</div>
                              <span className="text-sm text-muted-foreground">{comment.date}</span>
                            </div>
                          </div>
                          <p className="text-sm">{comment.comment}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No review comments yet.</p>
                    )}

                    {/* Add New Comment */}
                    <Separator />
                    <div className="space-y-4">
                      <h4 className="font-medium">Add Review Comment</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="reviewCategory">Category</Label>
                          <Select
                            value={reviewCategory}
                            onValueChange={(value: ReviewComment["category"]) => setReviewCategory(value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="technical">Technical</SelectItem>
                              <SelectItem value="business">Business</SelectItem>
                              <SelectItem value="financial">Financial</SelectItem>
                              <SelectItem value="market">Market</SelectItem>
                              <SelectItem value="general">General</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="reviewRating">Rating</Label>
                          <Select
                            value={reviewRating.toString()}
                            onValueChange={(value) => setReviewRating(Number.parseInt(value))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="5">5 - Excellent</SelectItem>
                              <SelectItem value="4">4 - Good</SelectItem>
                              <SelectItem value="3">3 - Average</SelectItem>
                              <SelectItem value="2">2 - Poor</SelectItem>
                              <SelectItem value="1">1 - Very Poor</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="reviewComment">Comment</Label>
                        <Textarea
                          id="reviewComment"
                          placeholder="Add your review comments..."
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <Button onClick={addReviewComment} disabled={!reviewComment.trim()}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Add Comment
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
              Close
            </Button>
            {selectedRequest && (selectedRequest.status === "pending" || selectedRequest.status === "under-review") && (
              <>
                <Button
                  variant="outline"
                  onClick={() => selectedRequest && handleStatusChange(selectedRequest.id, "needs-revision")}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Request Changes
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => selectedRequest && handleStatusChange(selectedRequest.id, "rejected")}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => selectedRequest && handleStatusChange(selectedRequest.id, "approved")}
                  className="gradient-success"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve Launch
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
