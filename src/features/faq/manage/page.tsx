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
import { Plus, Edit, Trash2, Settings, FileText, Package, Users, DollarSign, Shield } from "lucide-react"

interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
  tags: string[]
  popular?: boolean
}

const categories = [
  { id: "quotes", name: "Quote Management", icon: FileText },
  { id: "orders", name: "Order Processing", icon: Package },
  { id: "users", name: "User Management", icon: Users },
  { id: "system", name: "System Settings", icon: Settings },
  { id: "billing", name: "Billing & Payments", icon: DollarSign },
  { id: "security", name: "Security & Permissions", icon: Shield },
]

const initialFAQs: FAQItem[] = [
  {
    id: "q1",
    question: "How do I approve or reject a quote?",
    answer:
      "To approve or reject a quote: 1) Navigate to the Quote Approvals page, 2) Find the quote you want to review, 3) Click the 'Approve' or 'Reject' button, 4) Provide a reason for your decision in the dialog box, 5) Click 'Submit' to confirm your action.",
    category: "quotes",
    tags: ["approval", "workflow", "status"],
    popular: true,
  },
  {
    id: "q2",
    question: "What information is required when creating a new quote?",
    answer:
      "When creating a new quote, you need to provide: Customer information, Quote items with quantities and pricing, Valid quote date and expiration date, Sales representative assignment, Any special terms or conditions.",
    category: "quotes",
    tags: ["creation", "requirements", "fields"],
  },
]

export default function FAQManagePage() {
  const [faqs, setFaqs] = useState<FAQItem[]>(initialFAQs)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingFAQ, setEditingFAQ] = useState<FAQItem | null>(null)
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    category: "",
    tags: "",
    popular: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    // Validation
    const newErrors: Record<string, string> = {}
    if (!formData.question.trim()) newErrors.question = "Question is required"
    if (!formData.answer.trim()) newErrors.answer = "Answer is required"
    if (!formData.category) newErrors.category = "Category is required"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setIsSubmitting(false)
      return
    }

    try {
      const newFAQ: FAQItem = {
        id: editingFAQ ? editingFAQ.id : `faq_${Date.now()}`,
        question: formData.question.trim(),
        answer: formData.answer.trim(),
        category: formData.category,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        popular: formData.popular,
      }

      if (editingFAQ) {
        // Update existing FAQ
        setFaqs((prev) => prev.map((faq) => (faq.id === editingFAQ.id ? newFAQ : faq)))
        console.log("FAQ updated successfully")
      } else {
        // Create new FAQ
        setFaqs((prev) => [...prev, newFAQ])
        console.log("FAQ created successfully")
      }

      resetForm()
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error saving FAQ:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (faq: FAQItem) => {
    console.log("Editing FAQ:", faq)
    setEditingFAQ(faq)
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      tags: faq.tags.join(", "),
      popular: faq.popular || false,
    })
    setErrors({})
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      setFaqs((prev) => prev.filter((faq) => faq.id !== id))
      console.log("FAQ deleted successfully")
    } catch (error) {
      console.error("Error deleting FAQ:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      question: "",
      answer: "",
      category: "",
      tags: "",
      popular: false,
    })
    setEditingFAQ(null)
    setErrors({})
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">FAQ Management</h1>
          <p className="text-muted-foreground">Manage frequently asked questions and answers</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add FAQ
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingFAQ ? "Edit FAQ" : "Add New FAQ"}</DialogTitle>
              <DialogDescription>
                {editingFAQ ? "Update the FAQ information below." : "Create a new frequently asked question."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="question">Question</Label>
                  <Input
                    id="question"
                    value={formData.question}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, question: e.target.value }))
                      if (errors.question) setErrors((prev) => ({ ...prev, question: "" }))
                    }}
                    placeholder="Enter the question"
                    className={errors.question ? "border-red-500" : ""}
                    required
                  />
                  {errors.question && <p className="text-sm text-red-500 mt-1">{errors.question}</p>}
                </div>
                <div>
                  <Label htmlFor="answer">Answer</Label>
                  <Textarea
                    id="answer"
                    value={formData.answer}
                    onChange={(e) => setFormData((prev) => ({ ...prev, answer: e.target.value }))}
                    placeholder="Enter the detailed answer"
                    rows={4}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
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
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
                    placeholder="e.g., approval, workflow, status"
                  />
                </div>
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
              </div>
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : editingFAQ ? "Update FAQ" : "Create FAQ"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* FAQ List */}
      <Card>
        <CardHeader>
          <CardTitle>All FAQs ({faqs.length})</CardTitle>
          <CardDescription>Manage your frequently asked questions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {faqs.map((faq) => {
              const category = categories.find((c) => c.id === faq.category)
              return (
                <Card key={faq.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4 w-full">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{faq.question}</h3>
                          {faq.popular && (
                            <Badge className="bg-green-50 text-green-700 border-green-200">Popular</Badge>
                          )}
                        </div>
                        <p className="text-gray-600 mb-3 line-clamp-2">{faq.answer}</p>
                        <div className="flex items-center gap-2">
                          {category && (
                            <Badge variant="outline" className="text-xs">
                              {category.name}
                            </Badge>
                          )}
                          {faq.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(faq)} className="h-8 w-8 p-0">
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
                              <AlertDialogTitle>Delete FAQ</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this FAQ? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(faq.id)}
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
