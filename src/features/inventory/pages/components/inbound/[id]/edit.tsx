"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DocumentEditor } from "@/components/document-editor"
import { getInboundTransaction, getPurchaseOrders } from "@/lib/actions/inventory-actions"
import type { InboundTransaction, PurchaseOrder } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"

interface EditInboundPageProps {
  params: {
    id: string
  }
}

export default function EditInboundPage({ params }: EditInboundPageProps) {
  const router = useRouter()
  const [document, setDocument] = useState<InboundTransaction | null>(null)
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [documentData, poData] = await Promise.all([getInboundTransaction(params.id), getPurchaseOrders()])
        setDocument(documentData)
        setPurchaseOrders(poData)
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
    router.push(`/inventory/inbound/${params.id}`)
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
        documentType="inbound"
        onCancel={handleCancel}
        onSubmit={handleSubmit}
        purchaseOrders={purchaseOrders}
      />
    </div>
  )
}
