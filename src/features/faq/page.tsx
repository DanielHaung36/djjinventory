"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  HelpCircle,
  Search,
  ChevronDown,
  ChevronRight,
  FileText,
  Package,
  Users,
  Settings,
  DollarSign,
  Shield,
  CheckCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
  tags: string[]
  popular?: boolean
}

interface FAQCategory {
  id: string
  name: string
  icon: React.ElementType
  color: string
  bgColor: string
}

const categories: FAQCategory[] = [
  {
    id: "quotes",
    name: "Quote Management",
    icon: FileText,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    id: "orders",
    name: "Order Processing",
    icon: Package,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  {
    id: "users",
    name: "User Management",
    icon: Users,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  {
    id: "system",
    name: "System Settings",
    icon: Settings,
    color: "text-gray-600",
    bgColor: "bg-gray-100",
  },
  {
    id: "billing",
    name: "Billing & Payments",
    icon: DollarSign,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
  },
  {
    id: "security",
    name: "Security & Permissions",
    icon: Shield,
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
]

const faqData: FAQItem[] = [
  {
    id: "q1",
    question: "How do I approve or reject a quote?",
    answer:
      "To approve or reject a quote: 1) Navigate to the Quote Approvals page, 2) Find the quote you want to review, 3) Click the 'Approve' or 'Reject' button, 4) Provide a reason for your decision in the dialog box, 5) Click 'Submit' to confirm your action. The quote status will be updated immediately and the requester will be notified.",
    category: "quotes",
    tags: ["approval", "workflow", "status"],
    popular: true,
  },
  {
    id: "q2",
    question: "What information is required when creating a new quote?",
    answer:
      "When creating a new quote, you need to provide: Customer information (name, contact details), Quote items with quantities and pricing, Valid quote date and expiration date, Sales representative assignment, Any special terms or conditions, and Delivery requirements if applicable.",
    category: "quotes",
    tags: ["creation", "requirements", "fields"],
  },
  {
    id: "q3",
    question: "Can I modify a quote after it's been submitted for approval?",
    answer:
      "Once a quote is submitted for approval, it cannot be modified directly. However, you can: 1) Contact the approver to reject the current quote, 2) Create a new version of the quote with the necessary changes, 3) Submit the new version for approval. This ensures proper audit trail and approval workflow integrity.",
    category: "quotes",
    tags: ["modification", "workflow", "versioning"],
  },
  {
    id: "q4",
    question: "How long does the quote approval process typically take?",
    answer:
      "The quote approval process typically takes 1-3 business days, depending on: Quote amount (higher amounts may require additional approvals), Complexity of the quote, Availability of approvers, and Current workload. You can track the status of your quote in real-time through the Quote Approvals dashboard.",
    category: "quotes",
    tags: ["timeline", "process", "tracking"],
    popular: true,
  },
  {
    id: "o1",
    question: "How do I track the status of an order?",
    answer:
      "To track order status: 1) Go to the Orders section, 2) Use the search function to find your order by order number or customer name, 3) Click on the order to view detailed status information, 4) Check the status timeline to see all updates and changes. You can also set up notifications to receive updates when order status changes.",
    category: "orders",
    tags: ["tracking", "status", "monitoring"],
    popular: true,
  },
  {
    id: "u1",
    question: "How do I reset my password?",
    answer:
      "To reset your password: 1) Click on your profile avatar in the top right corner, 2) Select 'Settings' from the dropdown menu, 3) Navigate to the 'Security' tab, 4) Click 'Change Password', 5) Enter your current password and new password, 6) Confirm the change. If you've forgotten your current password, contact your system administrator for assistance.",
    category: "users",
    tags: ["password", "security", "account"],
    popular: true,
  },
]

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [openItems, setOpenItems] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  const filteredFAQs = useMemo(() => {
    let filtered = faqData

    if (selectedCategory !== "all") {
      filtered = filtered.filter((faq) => faq.category === selectedCategory)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
          faq.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    return filtered
  }, [searchTerm, selectedCategory])

  const paginatedFAQs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredFAQs.slice(startIndex, endIndex)
  }, [filteredFAQs, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredFAQs.length / itemsPerPage)

  const toggleItem = (id: string) => {
    setOpenItems((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const popularFAQs = faqData.filter((faq) => faq.popular)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-200 p-8 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50" />
        <div className="relative">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-2xl bg-blue-500 text-white shadow-sm">
              <HelpCircle className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Frequently Asked Questions</h1>
              <p className="text-lg text-gray-600 mt-1">
                Find quick answers to common questions about the sales management system
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Search */}
          <Card className="shadow-sm border-gray-200 bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search FAQs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="pl-9 bg-gray-50 border-gray-200 focus:border-blue-300 focus:ring-blue-100"
                />
              </div>
            </CardContent>
          </Card>

          {/* Categories */}
          <Card className="shadow-sm border-gray-200 bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant={selectedCategory === "all" ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  selectedCategory === "all" && "bg-blue-50 text-blue-700 hover:bg-blue-100",
                )}
                onClick={() => {
                  setSelectedCategory("all")
                  setCurrentPage(1)
                }}
              >
                All Categories
                <Badge variant="secondary" className="ml-auto">
                  {faqData.length}
                </Badge>
              </Button>
              {categories.map((category) => {
                const count = faqData.filter((faq) => faq.category === category.id).length
                return (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      selectedCategory === category.id && "bg-blue-50 text-blue-700 hover:bg-blue-100",
                    )}
                    onClick={() => {
                      setSelectedCategory(category.id)
                      setCurrentPage(1)
                    }}
                  >
                    <div className={`p-1 rounded ${category.bgColor} mr-2`}>
                      <category.icon className={`h-4 w-4 ${category.color}`} />
                    </div>
                    {category.name}
                    <Badge variant="secondary" className="ml-auto">
                      {count}
                    </Badge>
                  </Button>
                )
              })}
            </CardContent>
          </Card>

          {/* Popular Questions */}
          <Card className="shadow-sm border-gray-200 bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Popular Questions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {popularFAQs.map((faq) => (
                <Button
                  key={faq.id}
                  variant="ghost"
                  className="w-full justify-start text-left h-auto p-3"
                  onClick={() => {
                    setSelectedCategory("all")
                    setSearchTerm("")
                    setCurrentPage(1)
                    // Scroll to the FAQ item
                    setTimeout(() => {
                      const element = document.getElementById(`faq-${faq.id}`)
                      if (element) {
                        element.scrollIntoView({ behavior: "smooth", block: "center" })
                        toggleItem(faq.id)
                      }
                    }, 100)
                  }}
                >
                  <div className="text-sm font-medium truncate">{faq.question}</div>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Card className="shadow-sm border-gray-200 bg-white">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">
                    {selectedCategory === "all"
                      ? "All Questions"
                      : categories.find((c) => c.id === selectedCategory)?.name}
                  </CardTitle>
                  <CardDescription className="text-base mt-1">
                    {filteredFAQs.length} question{filteredFAQs.length !== 1 ? "s" : ""} found
                    {searchTerm && ` for "${searchTerm}"`}
                  </CardDescription>
                </div>
                {searchTerm && (
                  <Button variant="outline" size="sm" onClick={() => setSearchTerm("")}>
                    Clear Search
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {filteredFAQs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Search className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2 text-gray-900">No Questions Found</h3>
                  <p className="text-gray-600 max-w-md">
                    Try adjusting your search terms or browse different categories to find what you're looking for.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {paginatedFAQs.map((faq) => {
                    const isOpen = openItems.includes(faq.id)
                    const category = categories.find((c) => c.id === faq.category)

                    return (
                      <Collapsible key={faq.id} open={isOpen} onOpenChange={() => toggleItem(faq.id)}>
                        <div id={`faq-${faq.id}`}>
                          <CollapsibleTrigger className="w-full p-6 text-left hover:bg-blue-50 transition-colors cursor-pointer [&[data-state=open]]:bg-blue-50">
                            <div className="flex items-start justify-between gap-4 w-full">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="font-semibold text-gray-900 text-lg">{faq.question}</h3>
                                  {faq.popular && (
                                    <Badge className="bg-green-50 text-green-700 border-green-200">Popular</Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                  {category && (
                                    <Badge variant="outline" className="text-xs">
                                      <div className={`p-0.5 rounded ${category.bgColor} mr-1`}>
                                        <category.icon className={`h-3 w-3 ${category.color}`} />
                                      </div>
                                      {category.name}
                                    </Badge>
                                  )}
                                  {faq.tags.map((tag) => (
                                    <Badge key={tag} variant="secondary" className="text-xs bg-gray-50 text-gray-600">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <div className="flex-shrink-0">
                                {isOpen ? (
                                  <ChevronDown className="h-5 w-5 text-blue-500" />
                                ) : (
                                  <ChevronRight className="h-5 w-5 text-gray-400" />
                                )}
                              </div>
                            </div>
                          </CollapsibleTrigger>
                        </div>
                        <CollapsibleContent>
                          <div className="px-6 pb-6">
                            <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-300">
                              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{faq.answer}</p>
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    )
                  })}
                </div>
              )}
              {paginatedFAQs.length > 0 && totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                  <div className="text-sm text-gray-500">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                    {Math.min(currentPage * itemsPerPage, filteredFAQs.length)} of {filteredFAQs.length} questions
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={cn("w-8 h-8", currentPage === page && "bg-blue-500 hover:bg-blue-600")}
                      >
                        {page}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
