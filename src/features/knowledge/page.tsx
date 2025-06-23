"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  MessageSquare,
  Search,
  BookOpen,
  FileText,
  Package,
  Users,
  Settings,
  DollarSign,
  Shield,
  Clock,
  Star,
  ArrowRight,
  Download,
  Eye,
  Calendar,
  User,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface KnowledgeArticle {
  id: string
  title: string
  description: string
  content: string
  category: string
  tags: string[]
  author: string
  lastUpdated: string
  readTime: number
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  popular?: boolean
  featured?: boolean
}

interface KnowledgeCategory {
  id: string
  name: string
  description: string
  icon: React.ElementType
  color: string
  bgColor: string
  articleCount: number
}

const categories: KnowledgeCategory[] = [
  {
    id: "getting-started",
    name: "Getting Started",
    description: "Basic setup and introduction guides",
    icon: BookOpen,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    articleCount: 8,
  },
  {
    id: "quotes",
    name: "Quote Management",
    description: "Creating, managing, and approving quotes",
    icon: FileText,
    color: "text-green-600",
    bgColor: "bg-green-100",
    articleCount: 12,
  },
  {
    id: "orders",
    name: "Order Processing",
    description: "Order workflow and management",
    icon: Package,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    articleCount: 10,
  },
  {
    id: "users",
    name: "User Management",
    description: "Managing users and permissions",
    icon: Users,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    articleCount: 6,
  },
  {
    id: "billing",
    name: "Billing & Finance",
    description: "Financial processes and billing",
    icon: DollarSign,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
    articleCount: 7,
  },
  {
    id: "security",
    name: "Security & Compliance",
    description: "Security best practices and compliance",
    icon: Shield,
    color: "text-red-600",
    bgColor: "bg-red-100",
    articleCount: 5,
  },
  {
    id: "advanced",
    name: "Advanced Features",
    description: "Advanced system configuration and features",
    icon: Settings,
    color: "text-gray-600",
    bgColor: "bg-gray-100",
    articleCount: 9,
  },
]

const knowledgeArticles: KnowledgeArticle[] = [
  // Getting Started
  {
    id: "gs1",
    title: "System Overview and Navigation",
    description: "Learn the basics of navigating the sales management system and understanding its main components.",
    content:
      "This comprehensive guide covers the main navigation elements, dashboard overview, and basic system concepts...",
    category: "getting-started",
    tags: ["navigation", "dashboard", "basics"],
    author: "System Admin",
    lastUpdated: "2025-06-20",
    readTime: 5,
    difficulty: "Beginner",
    featured: true,
  },
  {
    id: "gs2",
    title: "Setting Up Your Profile",
    description: "Complete guide to setting up your user profile, preferences, and notification settings.",
    content: "Your profile is the foundation of your system experience. This guide walks you through...",
    category: "getting-started",
    tags: ["profile", "setup", "preferences"],
    author: "User Experience Team",
    lastUpdated: "2025-06-18",
    readTime: 3,
    difficulty: "Beginner",
  },
  {
    id: "gs3",
    title: "Understanding User Roles and Permissions",
    description: "Learn about different user roles in the system and what permissions each role has.",
    content: "The system uses role-based access control to ensure users have appropriate permissions...",
    category: "getting-started",
    tags: ["roles", "permissions", "access"],
    author: "Security Team",
    lastUpdated: "2025-06-15",
    readTime: 7,
    difficulty: "Intermediate",
  },

  // Quote Management
  {
    id: "q1",
    title: "Creating Your First Quote",
    description: "Step-by-step guide to creating a professional quote from start to finish.",
    content: "Creating quotes is one of the core functions of the sales management system...",
    category: "quotes",
    tags: ["creation", "workflow", "tutorial"],
    author: "Sales Team",
    lastUpdated: "2025-06-22",
    readTime: 8,
    difficulty: "Beginner",
    popular: true,
  },
  {
    id: "q2",
    title: "Quote Approval Workflow",
    description: "Understanding the quote approval process and how to manage approvals efficiently.",
    content: "The quote approval workflow ensures proper oversight and control over pricing decisions...",
    category: "quotes",
    tags: ["approval", "workflow", "management"],
    author: "Operations Manager",
    lastUpdated: "2025-06-21",
    readTime: 6,
    difficulty: "Intermediate",
    popular: true,
  },
  {
    id: "q3",
    title: "Advanced Quote Customization",
    description: "Learn how to customize quotes with special terms, conditions, and pricing structures.",
    content: "Beyond basic quotes, the system offers advanced customization options...",
    category: "quotes",
    tags: ["customization", "advanced", "pricing"],
    author: "Sales Operations",
    lastUpdated: "2025-06-19",
    readTime: 12,
    difficulty: "Advanced",
  },
  {
    id: "q4",
    title: "Quote Templates and Automation",
    description: "Save time by creating reusable quote templates and automating common processes.",
    content: "Quote templates help standardize your sales process and reduce manual work...",
    category: "quotes",
    tags: ["templates", "automation", "efficiency"],
    author: "Process Improvement Team",
    lastUpdated: "2025-06-17",
    readTime: 10,
    difficulty: "Intermediate",
  },

  // Order Processing
  {
    id: "o1",
    title: "Order Lifecycle Management",
    description: "Complete guide to managing orders from creation to delivery and closure.",
    content: "Understanding the order lifecycle is crucial for effective order management...",
    category: "orders",
    tags: ["lifecycle", "management", "process"],
    author: "Operations Team",
    lastUpdated: "2025-06-23",
    readTime: 9,
    difficulty: "Intermediate",
    featured: true,
  },
  {
    id: "o2",
    title: "Order Status Tracking and Updates",
    description: "Learn how to track order progress and communicate updates to customers.",
    content: "Effective order tracking ensures customer satisfaction and operational efficiency...",
    category: "orders",
    tags: ["tracking", "status", "communication"],
    author: "Customer Success",
    lastUpdated: "2025-06-20",
    readTime: 6,
    difficulty: "Beginner",
    popular: true,
  },
  {
    id: "o3",
    title: "Handling Order Modifications and Cancellations",
    description: "Best practices for managing order changes and cancellation requests.",
    content: "Order modifications are common in business operations. This guide covers...",
    category: "orders",
    tags: ["modifications", "cancellations", "policies"],
    author: "Customer Service",
    lastUpdated: "2025-06-18",
    readTime: 8,
    difficulty: "Intermediate",
  },

  // User Management
  {
    id: "u1",
    title: "Managing User Permissions",
    description: "Comprehensive guide to setting up and managing user permissions across the system.",
    content: "Proper permission management is essential for system security and efficiency...",
    category: "users",
    tags: ["permissions", "security", "administration"],
    author: "IT Administrator",
    lastUpdated: "2025-06-22",
    readTime: 11,
    difficulty: "Advanced",
    popular: true,
  },
  {
    id: "u2",
    title: "Onboarding New Team Members",
    description: "Step-by-step process for adding new users and getting them up to speed.",
    content: "Effective onboarding ensures new team members can contribute quickly...",
    category: "users",
    tags: ["onboarding", "training", "setup"],
    author: "HR Team",
    lastUpdated: "2025-06-19",
    readTime: 7,
    difficulty: "Beginner",
  },

  // Billing & Finance
  {
    id: "b1",
    title: "Understanding Pricing and Tax Calculations",
    description: "Learn how the system calculates prices, taxes, and discounts automatically.",
    content: "Accurate pricing calculations are fundamental to business operations...",
    category: "billing",
    tags: ["pricing", "taxes", "calculations"],
    author: "Finance Team",
    lastUpdated: "2025-06-21",
    readTime: 8,
    difficulty: "Intermediate",
  },
  {
    id: "b2",
    title: "Payment Processing and Tracking",
    description: "Guide to managing payments, tracking payment status, and handling payment issues.",
    content: "Effective payment management ensures healthy cash flow and customer satisfaction...",
    category: "billing",
    tags: ["payments", "tracking", "processing"],
    author: "Accounts Receivable",
    lastUpdated: "2025-06-20",
    readTime: 9,
    difficulty: "Intermediate",
  },

  // Security & Compliance
  {
    id: "s1",
    title: "Data Security Best Practices",
    description: "Essential security practices to protect sensitive business and customer data.",
    content: "Data security is everyone's responsibility. This guide outlines key practices...",
    category: "security",
    tags: ["security", "data protection", "best practices"],
    author: "Security Officer",
    lastUpdated: "2025-06-23",
    readTime: 10,
    difficulty: "Intermediate",
    featured: true,
  },
  {
    id: "s2",
    title: "Audit Trails and Compliance Reporting",
    description: "Understanding system audit trails and generating compliance reports.",
    content: "Audit trails provide transparency and accountability in business operations...",
    category: "security",
    tags: ["audit", "compliance", "reporting"],
    author: "Compliance Team",
    lastUpdated: "2025-06-17",
    readTime: 12,
    difficulty: "Advanced",
  },

  // Advanced Features
  {
    id: "a1",
    title: "API Integration and Automation",
    description: "Advanced guide to integrating the system with external tools and automating workflows.",
    content: "API integrations can significantly enhance system capabilities and efficiency...",
    category: "advanced",
    tags: ["api", "integration", "automation"],
    author: "Development Team",
    lastUpdated: "2025-06-16",
    readTime: 15,
    difficulty: "Advanced",
  },
  {
    id: "a2",
    title: "Custom Reporting and Analytics",
    description: "Create custom reports and analytics dashboards to gain business insights.",
    content: "Custom reporting helps you understand your business performance and trends...",
    category: "advanced",
    tags: ["reporting", "analytics", "insights"],
    author: "Business Intelligence",
    lastUpdated: "2025-06-14",
    readTime: 13,
    difficulty: "Advanced",
  },
]

export default function KnowledgeBasePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(8)
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null)

  const filteredArticles = useMemo(() => {
    let filtered = knowledgeArticles

    if (selectedCategory !== "all") {
      filtered = filtered.filter((article) => article.category === selectedCategory)
    }

    if (selectedDifficulty !== "all") {
      filtered = filtered.filter((article) => article.difficulty === selectedDifficulty)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (article) =>
          article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          article.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          article.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    return filtered
  }, [searchTerm, selectedCategory, selectedDifficulty])

  const paginatedArticles = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredArticles.slice(startIndex, endIndex)
  }, [filteredArticles, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage)

  const featuredArticles = knowledgeArticles.filter((article) => article.featured)
  const popularArticles = knowledgeArticles.filter((article) => article.popular)

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-50 text-green-700 border-green-200"
      case "Intermediate":
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      case "Advanced":
        return "bg-red-50 text-red-700 border-red-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const handleArticleClick = (article: KnowledgeArticle) => {
    setSelectedArticle(article)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-200 p-8 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/50" />
        <div className="relative">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-2xl bg-indigo-500 text-white shadow-sm">
              <MessageSquare className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Knowledge Base</h1>
              <p className="text-lg text-gray-600 mt-1">
                Comprehensive guides and documentation for the sales management system
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Articles */}
      {featuredArticles.length > 0 && (
        <Card className="shadow-sm border-gray-200 bg-white">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-xl flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Featured Articles
            </CardTitle>
            <CardDescription>Essential guides to get you started and maximize your productivity</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {featuredArticles.map((article) => {
                const category = categories.find((c) => c.id === article.category)
                return (
                  <Card
                    key={article.id}
                    className="hover:shadow-md transition-shadow cursor-pointer border-gray-200 hover:border-blue-200"
                    onClick={() => handleArticleClick(article)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                          <Star className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                        <Badge className={getDifficultyColor(article.difficulty)}>{article.difficulty}</Badge>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{article.title}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{article.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          {article.readTime} min read
                        </div>
                        {category && (
                          <Badge variant="outline" className="text-xs">
                            {category.name}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Search */}
          <Card className="shadow-sm border-gray-200 bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search Articles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search knowledge base..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="pl-9 bg-gray-50 border-gray-200 focus:border-blue-300 focus:ring-blue-100"
                />
              </div>

              {/* Difficulty Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Difficulty Level</label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => {
                    setSelectedDifficulty(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="all">All Levels</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Categories */}
          <Card className="shadow-sm border-gray-200 bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
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
                      {knowledgeArticles.length}
                    </Badge>
                  </Button>
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "ghost"}
                      className="w-full justify-start h-auto p-3"
                      onClick={() => {
                        setSelectedCategory(category.id)
                        setCurrentPage(1)
                      }}
                    >
                      <div className="flex items-start gap-3 w-full">
                        <div className={`p-1 rounded ${category.bgColor} flex-shrink-0`}>
                          <category.icon className={`h-4 w-4 ${category.color}`} />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-medium text-sm">{category.name}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{category.description}</div>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {category.articleCount}
                        </Badge>
                      </div>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Popular Articles */}
          {popularArticles.length > 0 && (
            <Card className="shadow-sm border-gray-200 bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Eye className="h-5 w-5 text-blue-600" />
                  Popular Articles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {popularArticles.slice(0, 5).map((article) => (
                  <div key={article.id} className="p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    <h4 className="font-medium text-sm text-gray-900 mb-1 line-clamp-2">{article.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      {article.readTime} min
                      <Badge className={getDifficultyColor(article.difficulty)} variant="outline">
                        {article.difficulty}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Card className="shadow-sm border-gray-200 bg-white">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">
                    {selectedCategory === "all"
                      ? "All Articles"
                      : categories.find((c) => c.id === selectedCategory)?.name}
                  </CardTitle>
                  <CardDescription className="text-base mt-1">
                    {filteredArticles.length} article{filteredArticles.length !== 1 ? "s" : ""} found
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
            <CardContent className="p-6">
              {filteredArticles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Search className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2 text-gray-900">No Articles Found</h3>
                  <p className="text-gray-600 max-w-md">
                    Try adjusting your search terms or browse different categories to find what you're looking for.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {paginatedArticles.map((article) => {
                    const category = categories.find((c) => c.id === article.category)

                    return (
                      <Card
                        key={article.id}
                        className="hover:shadow-md transition-all duration-200 cursor-pointer border-gray-200 hover:border-blue-200 hover:bg-blue-25"
                        onClick={() => handleArticleClick(article)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-xl text-gray-900">{article.title}</h3>
                                {article.featured && (
                                  <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                                    <Star className="h-3 w-3 mr-1" />
                                    Featured
                                  </Badge>
                                )}
                                {article.popular && (
                                  <Badge className="bg-blue-100 text-blue-700 border-blue-200">Popular</Badge>
                                )}
                              </div>
                              <p className="text-gray-600 mb-4 leading-relaxed">{article.description}</p>
                            </div>
                            <Badge className={getDifficultyColor(article.difficulty)}>{article.difficulty}</Badge>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              {category && (
                                <div className="flex items-center gap-1">
                                  <div className={`p-1 rounded ${category.bgColor}`}>
                                    <category.icon className={`h-3 w-3 ${category.color}`} />
                                  </div>
                                  {category.name}
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {article.readTime} min read
                              </div>
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {article.author}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(article.lastUpdated).toLocaleDateString()}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-1" />
                                Export
                              </Button>
                              <Button
                                size="sm"
                                className="bg-blue-500 hover:bg-blue-600 text-white"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleArticleClick(article)
                                }}
                              >
                                Read More
                                <ArrowRight className="h-4 w-4 ml-1" />
                              </Button>
                            </div>
                          </div>

                          {article.tags.length > 0 && (
                            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                              <span className="text-sm text-gray-500">Tags:</span>
                              {article.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
              {paginatedArticles.length > 0 && totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                  <div className="text-sm text-gray-500">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                    {Math.min(currentPage * itemsPerPage, filteredArticles.length)} of {filteredArticles.length}{" "}
                    articles
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
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i
                      return page <= totalPages ? (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className={cn("w-8 h-8", currentPage === page && "bg-blue-500 hover:bg-blue-600")}
                        >
                          {page}
                        </Button>
                      ) : null
                    })}
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
      {selectedArticle && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedArticle(null)
            }
          }}
        >
          <Card className="max-w-4xl max-h-[90vh] overflow-auto">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{selectedArticle.title}</CardTitle>
                  <CardDescription className="text-base mt-2">{selectedArticle.description}</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedArticle(null)}
                  className="hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{selectedArticle.content}</p>
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Article Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Author:</span> {selectedArticle.author}
                    </div>
                    <div>
                      <span className="font-medium">Last Updated:</span>{" "}
                      {new Date(selectedArticle.lastUpdated).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">Reading Time:</span> {selectedArticle.readTime} minutes
                    </div>
                    <div>
                      <span className="font-medium">Difficulty:</span> {selectedArticle.difficulty}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
