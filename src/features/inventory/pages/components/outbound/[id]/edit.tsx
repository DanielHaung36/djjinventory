"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DocumentEditor } from "@/components/document-editor"
import { getOutboundTransaction, getSalesOrders } from "@/lib/actions/inventory-actions"
import type { OutboundTransaction, SalesOrder } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"

interface EditOutboundPageProps {
  params: {
    id: string
  }
}

export default function EditOutboundPage({ params }: EditOutboundPageProps) {
  const router = useRouter()
  const [document, setDocument] = useState<OutboundTransaction | null>(null)
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [documentData, soData] = await Promise.all([getOutboundTransaction(params.id), getSalesOrders()])
        setDocument(documentData)
        setSalesOrders(soData)
      } catch (err) {
        console.error("Failed to fetch data:", err)
        setError("Failed to load document. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id])

  const handleCancel = () => {
    router.back()
  }

  const handleSubmit = () => {
    router.push(`/inventory/outbound/${params.id}`)
  }

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  if (error || !document) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Error</h2>
          <p className="text-muted-foreground">{error || "Document not found"}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <DocumentEditor
        document={document}
        documentType="outbound"
        onCancel={handleCancel}
        onSubmit={handleSubmit}
        salesOrders={salesOrders}
      />
    </div>
  )
}
