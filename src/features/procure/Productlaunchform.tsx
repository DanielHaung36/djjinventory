"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  Package,
  DollarSign,
  FileText,
  ImageIcon,
  Users,
  Target,
  Lightbulb,
  ArrowRight,
  ArrowLeft,
  Save,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ProductFormData {
  // Basic Information
  productName: string
  productCategory: string
  productDescription: string
  targetMarket: string

  // Business Information
  expectedPrice: number
  price: number
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

  // Files
  productImages: File[]
  technicalDocuments: File[]
  marketResearch: File[]
}

const initialFormData: ProductFormData = {
  productName: "",
  productCategory: "",
  productDescription: "",
  targetMarket: "",
  expectedPrice: 0,
  price: 0,
  currency: "AUD",
  estimatedDemand: 0,
  launchTimeline: "",
  customerInfo: "",
  competitorAnalysis: "",
  uniqueSellingPoints: "",
  supplierName: "",
  supplierCode: "",
  supplierContact: "",
  technicalSpecs: "",
  certifications: "",
  complianceRequirements: "",
  developmentCost: 0,
  manufacturingCost: 0,
  expectedMargin: 0,
  riskAssessment: "",
  marketingStrategy: "",
  supportRequirements: "",
  productImages: [],
  technicalDocuments: [],
  marketResearch: [],
}

const steps = [
  { id: 1, title: "Basic Information", icon: Package, description: "Product details and category" },
  { id: 2, title: "Business Case", icon: Target, description: "Market analysis and pricing" },
  { id: 3, title: "Technical Details", icon: FileText, description: "Specifications and compliance" },
  { id: 4, title: "Financial Analysis", icon: DollarSign, description: "Costs and projections" },
  { id: 5, title: "Documentation", icon: Upload, description: "Upload supporting files" },
  { id: 6, title: "Review & Submit", icon: CheckCircle, description: "Final review and submission" },
]

function ProductLaunchForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<ProductFormData>(initialFormData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const updateFormData = (field: keyof ProductFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    switch (step) {
      case 1:
        if (!formData.productName.trim()) newErrors.productName = "Product name is required"
        if (!formData.productCategory) newErrors.productCategory = "Product category is required"
        if (!formData.productDescription.trim()) newErrors.productDescription = "Product description is required"
        if (!formData.targetMarket.trim()) newErrors.targetMarket = "Target market is required"
        break
      case 2:
        if (formData.expectedPrice <= 0) newErrors.expectedPrice = "Expected price must be greater than 0"
        if (formData.estimatedDemand <= 0) newErrors.estimatedDemand = "Estimated demand must be greater than 0"
        if (!formData.launchTimeline) newErrors.launchTimeline = "Launch timeline is required"
        if (!formData.customerInfo.trim()) newErrors.customerInfo = "Customer information is required"
        break
      case 3:
        if (!formData.supplierName.trim()) newErrors.supplierName = "Supplier name is required"
        if (!formData.supplierCode.trim()) newErrors.supplierCode = "Supplier code is required"
        if (!formData.technicalSpecs.trim()) newErrors.technicalSpecs = "Technical specifications are required"
        break
      case 4:
        if (formData.developmentCost < 0) newErrors.developmentCost = "Development cost cannot be negative"
        if (formData.manufacturingCost <= 0) newErrors.manufacturingCost = "Manufacturing cost must be greater than 0"
        if (formData.expectedMargin < 0) newErrors.expectedMargin = "Expected margin cannot be negative"
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length))
    }
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleFileUpload = (field: keyof ProductFormData, files: FileList | null) => {
    if (files) {
      const fileArray = Array.from(files)
      updateFormData(field, fileArray)
    }
  }

  const removeFile = (field: keyof ProductFormData, index: number) => {
    const currentFiles = formData[field] as File[]
    const updatedFiles = currentFiles.filter((_, i) => i !== index)
    updateFormData(field, updatedFiles)
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return

    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Product Launch Request Submitted",
        description: "Your request has been submitted for review. You'll receive updates via email.",
      })

      // Reset form
      setFormData(initialFormData)
      setCurrentStep(1)
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="productName" className="text-sm font-medium">
                  Product Name *
                </Label>
                <Input
                  id="productName"
                  placeholder="Enter product name"
                  value={formData.productName}
                  onChange={(e) => updateFormData("productName", e.target.value)}
                  className={errors.productName ? "border-destructive" : ""}
                />
                {errors.productName && (
                  <p className="text-sm text-destructive flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.productName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="productCategory" className="text-sm font-medium">
                  Product Category *
                </Label>
                <Select
                  value={formData.productCategory}
                  onValueChange={(value) => updateFormData("productCategory", value)}
                >
                  <SelectTrigger className={errors.productCategory ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="industrial">Industrial Equipment</SelectItem>
                    <SelectItem value="automotive">Automotive</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="consumer">Consumer Goods</SelectItem>
                    <SelectItem value="software">Software</SelectItem>
                  </SelectContent>
                </Select>
                {errors.productCategory && (
                  <p className="text-sm text-destructive flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.productCategory}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="productDescription" className="text-sm font-medium">
                Product Description *
              </Label>
              <Textarea
                id="productDescription"
                placeholder="Provide a detailed description of the product, its features, and benefits"
                value={formData.productDescription}
                onChange={(e) => updateFormData("productDescription", e.target.value)}
                className={`min-h-[120px] ${errors.productDescription ? "border-destructive" : ""}`}
              />
              {errors.productDescription && (
                <p className="text-sm text-destructive flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.productDescription}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetMarket" className="text-sm font-medium">
                Target Market *
              </Label>
              <Textarea
                id="targetMarket"
                placeholder="Describe the target market, customer segments, and use cases"
                value={formData.targetMarket}
                onChange={(e) => updateFormData("targetMarket", e.target.value)}
                className={`min-h-[100px] ${errors.targetMarket ? "border-destructive" : ""}`}
              />
              {errors.targetMarket && (
                <p className="text-sm text-destructive flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.targetMarket}
                </p>
              )}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="expectedPrice" className="text-sm font-medium">
                  Expected Price *
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="expectedPrice"
                    type="number"
                    placeholder="0.00"
                    value={formData.expectedPrice || ""}
                    onChange={(e) => updateFormData("expectedPrice", Number.parseFloat(e.target.value) || 0)}
                    className={`pl-10 ${errors.expectedPrice ? "border-destructive" : ""}`}
                  />
                </div>
                {errors.expectedPrice && (
                  <p className="text-sm text-destructive flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.expectedPrice}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency" className="text-sm font-medium">
                  Currency
                </Label>
                <Select value={formData.currency} onValueChange={(value) => updateFormData("currency", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="CNY">CNY - Chinese Yuan</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedDemand" className="text-sm font-medium">
                  Estimated Annual Demand *
                </Label>
                <Input
                  id="estimatedDemand"
                  type="number"
                  placeholder="Units per year"
                  value={formData.estimatedDemand || ""}
                  onChange={(e) => updateFormData("estimatedDemand", Number.parseInt(e.target.value) || 0)}
                  className={errors.estimatedDemand ? "border-destructive" : ""}
                />
                {errors.estimatedDemand && (
                  <p className="text-sm text-destructive flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.estimatedDemand}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="launchTimeline" className="text-sm font-medium">
                Preferred Launch Timeline *
              </Label>
              <Select
                value={formData.launchTimeline}
                onValueChange={(value) => updateFormData("launchTimeline", value)}
              >
                <SelectTrigger className={errors.launchTimeline ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select timeline" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="q1-2024">Q1 2024</SelectItem>
                  <SelectItem value="q2-2024">Q2 2024</SelectItem>
                  <SelectItem value="q3-2024">Q3 2024</SelectItem>
                  <SelectItem value="q4-2024">Q4 2024</SelectItem>
                  <SelectItem value="h1-2025">H1 2025</SelectItem>
                  <SelectItem value="h2-2025">H2 2025</SelectItem>
                </SelectContent>
              </Select>
              {errors.launchTimeline && (
                <p className="text-sm text-destructive flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.launchTimeline}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerInfo" className="text-sm font-medium">
                Customer Information *
              </Label>
              <Textarea
                id="customerInfo"
                placeholder="Provide details about potential customers, their needs, and feedback received"
                value={formData.customerInfo}
                onChange={(e) => updateFormData("customerInfo", e.target.value)}
                className={`min-h-[100px] ${errors.customerInfo ? "border-destructive" : ""}`}
              />
              {errors.customerInfo && (
                <p className="text-sm text-destructive flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.customerInfo}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="competitorAnalysis" className="text-sm font-medium">
                  Competitor Analysis
                </Label>
                <Textarea
                  id="competitorAnalysis"
                  placeholder="Analyze competing products and their market position"
                  value={formData.competitorAnalysis}
                  onChange={(e) => updateFormData("competitorAnalysis", e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="uniqueSellingPoints" className="text-sm font-medium">
                  Unique Selling Points
                </Label>
                <Textarea
                  id="uniqueSellingPoints"
                  placeholder="What makes this product unique and competitive?"
                  value={formData.uniqueSellingPoints}
                  onChange={(e) => updateFormData("uniqueSellingPoints", e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="supplierName" className="text-sm font-medium">
                  Supplier Name *
                </Label>
                <Input
                  id="supplierName"
                  placeholder="Supplier company name"
                  value={formData.supplierName}
                  onChange={(e) => updateFormData("supplierName", e.target.value)}
                  className={errors.supplierName ? "border-destructive" : ""}
                />
                {errors.supplierName && (
                  <p className="text-sm text-destructive flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.supplierName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplierCode" className="text-sm font-medium">
                  Supplier Code *
                </Label>
                <Input
                  id="supplierCode"
                  placeholder="e.g., HY-2108X"
                  value={formData.supplierCode}
                  onChange={(e) => updateFormData("supplierCode", e.target.value)}
                  className={errors.supplierCode ? "border-destructive" : ""}
                />
                {errors.supplierCode && (
                  <p className="text-sm text-destructive flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.supplierCode}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplierContact" className="text-sm font-medium">
                  Supplier Contact
                </Label>
                <Input
                  id="supplierContact"
                  placeholder="Contact person or email"
                  value={formData.supplierContact}
                  onChange={(e) => updateFormData("supplierContact", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="technicalSpecs" className="text-sm font-medium">
                Technical Specifications *
              </Label>
              <Textarea
                id="technicalSpecs"
                placeholder="Detailed technical specifications, dimensions, performance metrics, etc."
                value={formData.technicalSpecs}
                onChange={(e) => updateFormData("technicalSpecs", e.target.value)}
                className={`min-h-[120px] ${errors.technicalSpecs ? "border-destructive" : ""}`}
              />
              {errors.technicalSpecs && (
                <p className="text-sm text-destructive flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.technicalSpecs}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="certifications" className="text-sm font-medium">
                  Required Certifications
                </Label>
                <Textarea
                  id="certifications"
                  placeholder="List required certifications (CE, FCC, ISO, etc.)"
                  value={formData.certifications}
                  onChange={(e) => updateFormData("certifications", e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="complianceRequirements" className="text-sm font-medium">
                  Compliance Requirements
                </Label>
                <Textarea
                  id="complianceRequirements"
                  placeholder="Regulatory compliance requirements and standards"
                  value={formData.complianceRequirements}
                  onChange={(e) => updateFormData("complianceRequirements", e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="developmentCost" className="text-sm font-medium">
                  Development Cost
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="developmentCost"
                    type="number"
                    placeholder="0.00"
                    value={formData.developmentCost || ""}
                    onChange={(e) => updateFormData("developmentCost", Number.parseFloat(e.target.value) || 0)}
                    className={`pl-10 ${errors.developmentCost ? "border-destructive" : ""}`}
                  />
                </div>
                {errors.developmentCost && (
                  <p className="text-sm text-destructive flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.developmentCost}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="manufacturingCost" className="text-sm font-medium">
                  Manufacturing Cost *
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="manufacturingCost"
                    type="number"
                    placeholder="0.00"
                    value={formData.manufacturingCost || ""}
                    onChange={(e) => updateFormData("manufacturingCost", Number.parseFloat(e.target.value) || 0)}
                    className={`pl-10 ${errors.manufacturingCost ? "border-destructive" : ""}`}
                  />
                </div>
                {errors.manufacturingCost && (
                  <p className="text-sm text-destructive flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.manufacturingCost}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="expectedMargin" className="text-sm font-medium">
                  Expected Margin (%)
                </Label>
                <Input
                  id="expectedMargin"
                  type="number"
                  placeholder="0"
                  value={formData.expectedMargin || ""}
                  onChange={(e) => updateFormData("expectedMargin", Number.parseFloat(e.target.value) || 0)}
                  className={errors.expectedMargin ? "border-destructive" : ""}
                />
                {errors.expectedMargin && (
                  <p className="text-sm text-destructive flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.expectedMargin}
                  </p>
                )}
              </div>
            </div>

            {/* Financial Summary Card */}
            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Financial Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Expected Price</p>
                    <p className="text-lg font-semibold">
                      {formData.currency} {formData.expectedPrice.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Manufacturing Cost</p>
                    <p className="text-lg font-semibold">
                      {formData.currency} {formData.manufacturingCost.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Gross Profit</p>
                    <p className="text-lg font-semibold text-success">
                      {formData.currency} {(formData.expectedPrice - formData.manufacturingCost).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Margin</p>
                    <p className="text-lg font-semibold">
                      {formData.expectedPrice > 0
                        ? (
                            ((formData.expectedPrice - formData.manufacturingCost) / formData.expectedPrice) *
                            100
                          ).toFixed(1)
                        : 0}
                      %
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="riskAssessment" className="text-sm font-medium">
                  Risk Assessment
                </Label>
                <Textarea
                  id="riskAssessment"
                  placeholder="Identify potential risks and mitigation strategies"
                  value={formData.riskAssessment}
                  onChange={(e) => updateFormData("riskAssessment", e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="marketingStrategy" className="text-sm font-medium">
                  Marketing Strategy
                </Label>
                <Textarea
                  id="marketingStrategy"
                  placeholder="Outline the marketing and go-to-market strategy"
                  value={formData.marketingStrategy}
                  onChange={(e) => updateFormData("marketingStrategy", e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="supportRequirements" className="text-sm font-medium">
                Support Requirements
              </Label>
              <Textarea
                id="supportRequirements"
                placeholder="Describe support requirements (training, documentation, technical support, etc.)"
                value={formData.supportRequirements}
                onChange={(e) => updateFormData("supportRequirements", e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6 animate-fade-in">
            <Alert>
              <Upload className="h-4 w-4" />
              <AlertDescription>
                Upload supporting documents to strengthen your product launch request. All files should be under 10MB
                each.
              </AlertDescription>
            </Alert>

            {/* Product Images */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ImageIcon className="h-5 w-5 mr-2" />
                  Product Images
                </CardTitle>
                <CardDescription>Upload product photos, renderings, or mockups (JPG, PNG, WebP)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleFileUpload("productImages", e.target.files)}
                      className="hidden"
                      id="productImages"
                    />
                    <label htmlFor="productImages" className="cursor-pointer">
                      <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-sm text-muted-foreground">Click to upload product images or drag and drop</p>
                    </label>
                  </div>

                  {formData.productImages.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {formData.productImages.map((file, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <p className="text-xs mt-1 truncate">{file.name}</p>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeFile("productImages", index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Technical Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Technical Documents
                </CardTitle>
                <CardDescription>
                  Upload technical specifications, datasheets, or engineering drawings (PDF, DOC, XLS)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.xls,.xlsx"
                      onChange={(e) => handleFileUpload("technicalDocuments", e.target.files)}
                      className="hidden"
                      id="technicalDocuments"
                    />
                    <label htmlFor="technicalDocuments" className="cursor-pointer">
                      <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload technical documents or drag and drop
                      </p>
                    </label>
                  </div>

                  {formData.technicalDocuments.length > 0 && (
                    <div className="space-y-2">
                      {formData.technicalDocuments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="text-sm">{file.name}</span>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => removeFile("technicalDocuments", index)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Market Research */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Market Research
                </CardTitle>
                <CardDescription>
                  Upload market analysis, customer surveys, or competitive research documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                      onChange={(e) => handleFileUpload("marketResearch", e.target.files)}
                      className="hidden"
                      id="marketResearch"
                    />
                    <label htmlFor="marketResearch" className="cursor-pointer">
                      <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload market research documents or drag and drop
                      </p>
                    </label>
                  </div>

                  {formData.marketResearch.length > 0 && (
                    <div className="space-y-2">
                      {formData.marketResearch.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center">
                            <Target className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="text-sm">{file.name}</span>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => removeFile("marketResearch", index)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6 animate-fade-in">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Please review all information before submitting your product launch request.
              </AlertDescription>
            </Alert>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    Product Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Product Name</p>
                    <p className="font-medium">{formData.productName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Category</p>
                    <p className="font-medium">{formData.productCategory}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Expected Price</p>
                    <p className="font-medium">
                      {formData.currency} {formData.expectedPrice.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Launch Timeline</p>
                    <p className="font-medium">{formData.launchTimeline}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Supplier & Market
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Supplier</p>
                    <p className="font-medium">{formData.supplierName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Supplier Code</p>
                    <p className="font-medium">{formData.supplierCode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Estimated Demand</p>
                    <p className="font-medium">{formData.estimatedDemand.toLocaleString()} units/year</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Manufacturing Cost</p>
                    <p className="font-medium">
                      {formData.currency} {formData.manufacturingCost.toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Documents Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="h-5 w-5 mr-2" />
                  Uploaded Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Product Images</p>
                    <Badge variant="outline">{formData.productImages.length} files</Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Technical Documents</p>
                    <Badge variant="outline">{formData.technicalDocuments.length} files</Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Market Research</p>
                    <Badge variant="outline">{formData.marketResearch.length} files</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Final Confirmation */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  <Lightbulb className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium">Ready to Submit</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your product launch request will be submitted for review. You'll receive email notifications about
                      the approval process and any feedback from reviewers.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      default:
        return null
    }
  }

  // Current step icon helper
  const StepIcon = steps[currentStep - 1]?.icon

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">New Product Launch Request</h1>
        <p className="text-muted-foreground">Submit a comprehensive product launch request for review and approval</p>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center space-y-2">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                    currentStep >= step.id
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-muted-foreground/30 text-muted-foreground"
                  }`}
                >
                  {currentStep > step.id ? <CheckCircle className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
                </div>
                <div className="text-center">
                  <p
                    className={`text-sm font-medium ${currentStep >= step.id ? "text-primary" : "text-muted-foreground"}`}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground hidden sm:block">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`absolute h-0.5 w-16 top-5 left-1/2 transform translate-x-8 ${
                      currentStep > step.id ? "bg-primary" : "bg-muted-foreground/30"
                    }`}
                    style={{ zIndex: -1 }}
                  />
                )}
              </div>
            ))}
          </div>

          <Progress value={(currentStep / steps.length) * 100} className="h-2" />
        </CardContent>
      </Card>

      {/* Form Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            {StepIcon && <StepIcon className="h-5 w-5 mr-2" />}
            {steps[currentStep - 1]?.title}
          </CardTitle>
          <CardDescription>{steps[currentStep - 1]?.description}</CardDescription>
        </CardHeader>
        <CardContent>{renderStepContent()}</CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={prevStep} disabled={currentStep === 1} className="flex items-center">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        <div className="flex space-x-2">
          <Button variant="outline" className="flex items-center">
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>

          {currentStep < steps.length ? (
            <Button onClick={nextStep} className="flex items-center">
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting} className="flex items-center gradient-primary">
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Submit Request
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductLaunchForm
