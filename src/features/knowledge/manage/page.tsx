"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Plus,
  Edit,
  Trash2,
  BookOpen,
  FileText,
  Package,
  Users,
  Settings,
  DollarSign,
  Shield,
  Star,
  Clock,
  User,
} from "lucide-react"

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

const categories = [
  { id: "getting-started", name: "Getting Started", icon: BookOpen },
  { id: "quotes", name: "Quote Management", icon: FileText },
  { id: "orders", name: "Order Processing", icon: Package },
  { id: "users", name: "User Management", icon: Users },
  { id: "billing", name: "Billing & Finance", icon: DollarSign },
  { id: "security", name: "Security & Compliance", icon: Shield },
  { id: "advanced", name: "Advanced Features", icon: Settings },
]

const initialArticles: KnowledgeArticle[] = [
  {
    id: "gs1",
    title: "System Overview and Navigation",
    description: "Learn the basics of navigating the sales management system and understanding its main components.",
    content:
      "This comprehensive guide covers the main navigation elements, dashboard overview, and basic system concepts. The system is designed with user experience in mind, providing intuitive navigation and clear visual hierarchy.",
    category: "getting-started",
    tags: ["navigation", "dashboard", "basics"],
    author: "System Admin",
    lastUpdated: "2025-06-20",
    readTime: 5,
    difficulty: "Beginner",
    featured: true,
  },
  {
    id: "q1",
    title: "Creating Your First Quote",
    description: "Step-by-step guide to creating a professional quote from start to finish.",
    content:
      "Creating quotes is one of the core functions of the sales management system. This guide will walk you through the entire process from initial setup to final approval.",
    category: "quotes",
    tags: ["creation", "workflow", "tutorial"],
    author: "Sales Team",
    lastUpdated: "2025-06-22",
    readTime: 8,
    difficulty: "Beginner",
    popular: true,
  },
]

export default function KnowledgeManagePage() {
  const [articles, setArticles] = useState<KnowledgeArticle[]>(initialArticles)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingArticle, setEditingArticle] = useState<KnowledgeArticle | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    category: "",
    tags: "",
    author: "",
    readTime: 5,
    difficulty: "Beginner" as const,
    popular: false,
    featured: false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    // Validation
    const newErrors: Record<string, string> = {}
    if (!formData.title.trim()) newErrors.title = "Title is required"
    if (!formData.description.trim()) newErrors.description = "Description is required"
    if (!formData.content.trim()) newErrors.content = "Content is required"
    if (!formData.category) newErrors.category = "Category is required"
    if (!formData.author.trim()) newErrors.author = "Author is required"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setIsSubmitting(false)
      return
    }

    try {
      const newArticle: KnowledgeArticle = {
        id: editingArticle ? editingArticle.id : `article_${Date.now()}`,
        title: formData.title.trim(),
        description: formData.description.trim(),
        content: formData.content.trim(),
        category: formData.category,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        author: formData.author.trim(),
        lastUpdated: new Date().toISOString().split("T")[0],
        readTime: Math.max(1, formData.readTime),
        difficulty: formData.difficulty,
        popular: formData.popular,
        featured: formData.featured,
      }

      if (editingArticle) {
        // Update existing article
        setArticles((prev) => prev.map((article) => (article.id === editingArticle.id ? newArticle : article)))
        console.log("Article updated successfully")
      } else {
        // Create new article
        setArticles((prev) => [...prev, newArticle])
        console.log("Article created successfully")
      }

      resetForm()
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error saving article:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (article: KnowledgeArticle) => {
    console.log("Editing article:", article)
    setEditingArticle(article)
    setFormData({
      title: article.title,
      description: article.description,
      content: article.content,
      category: article.category,
      tags: article.tags.join(", "),
      author: article.author,
      readTime: article.readTime,
      difficulty: article.difficulty,
      popular: article.popular || false,
      featured: article.featured || false,
    })
    setErrors({})
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      setArticles((prev) => prev.filter((article) => article.id !== id))
      console.log("Article deleted successfully")
    } catch (error) {
      console.error("Error deleting article:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      content: "",
      category: "",
      tags: "",
      author: "",
      readTime: 5,
      difficulty: "Beginner",
      popular: false,
      featured: false,
    })
    setEditingArticle(null)
    setErrors({})
  }

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Knowledge Base Management</h1>
          <p className="text-muted-foreground">Manage articles and documentation</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Article
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>{editingArticle ? "Edit Article" : "Add New Article"}</DialogTitle>
              <DialogDescription>
                {editingArticle ? "Update the article information below." : "Create a new knowledge base article."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, title: e.target.value }))
                        if (errors.title) setErrors((prev) => ({ ...prev, title: "" }))
                      }}
                      placeholder="Enter article title"
                      className={errors.title ? "border-red-500" : ""}
                      required
                    />
                    {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
                  </div>
                  <div>
                    <Label htmlFor="author">Author</Label>
                    <Input
                      id="author"
                      value={formData.author}
                      onChange={(e) => setFormData((prev) => ({ ...prev, author: e.target.value }))}
                      placeholder="Enter author name"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter article description"
                    rows={2}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                    placeholder="Enter the full article content"
                    rows={6}
                    required
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select
                      value={formData.difficulty}
                      onValueChange={(value: "Beginner" | "Intermediate" | "Advanced") =>
                        setFormData((prev) => ({ ...prev, difficulty: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="readTime">Read Time (minutes)</Label>
                    <Input
                      id="readTime"
                      type="number"
                      min="1"
                      max="60"
                      value={formData.readTime}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, readTime: Number.parseInt(e.target.value) || 5 }))
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
                    placeholder="e.g., tutorial, workflow, advanced"
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="popular"
                      checked={formData.popular}
                      onChange={(e) => setFormData((prev) => ({ ...prev, popular: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="popular">Mark as popular</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={formData.featured}
                      onChange={(e) => setFormData((prev) => ({ ...prev, featured: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="featured">Mark as featured</Label>
                  </div>
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : editingArticle ? "Update Article" : "Create Article"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Articles List */}
      <Card>
        <CardHeader>
          <CardTitle>All Articles ({articles.length})</CardTitle>
          <CardDescription>Manage your knowledge base articles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {articles.map((article) => {
              const category = categories.find((c) => c.id === article.category)
              return (
                <Card key={article.id} className="border-l-4 border-l-indigo-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4 w-full">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{article.title}</h3>
                          {article.featured && (
                            <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                              <Star className="h-3 w-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                          {article.popular && (
                            <Badge className="bg-blue-100 text-blue-700 border-blue-200">Popular</Badge>
                          )}
                          <Badge className={getDifficultyColor(article.difficulty)}>{article.difficulty}</Badge>
                        </div>
                        <p className="text-gray-600 mb-3 line-clamp-2">{article.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {article.author}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {article.readTime} min read
                          </div>
                          <div>Updated: {new Date(article.lastUpdated).toLocaleDateString()}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          {category && (
                            <Badge variant="outline" className="text-xs">
                              {category.name}
                            </Badge>
                          )}
                          {article.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(article)} className="h-8 w-8 p-0">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Article</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this article? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(article.id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
