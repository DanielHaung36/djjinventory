"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"
import { AuditTrail } from "@/components/audit-trail"
import { EditRequests } from "@/components/edit-requests"
import { DocumentEditor } from "@/components/document-editor"
import { OutboundItemsTable } from "@/components/outbound-items-table"
import { FileEdit, ArrowLeft, History, ClipboardList } from "lucide-react"
import {
  getOutboundTransactionById,
  getAuditTrailForDocument,
  getEditRequestsForDocument,
  getCurrentUser,
  getSalesOrders,
} from "@/lib/actions/inventory-actions"
import type { OutboundTransaction, AuditTrailEntry, EditRequest, User, SalesOrder } from "@/lib/types"

export default function OutboundDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [transaction, setTransaction] = useState<OutboundTransaction | null>(null)
  const [auditTrail, setAuditTrail] = useState<AuditTrailEntry[]>([])
  const [editRequests, setEditRequests] = useState<EditRequest[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState("details")

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [transactionData, auditTrailData, editRequestsData, userData, soData] = await Promise.all([
          getOutboundTransactionById(params.id),
          getAuditTrailForDocument(params.id, "outbound"),
          getEditRequestsForDocument(params.id, "outbound"),
          getCurrentUser(),
          getSalesOrders(),
        ])

        if (!transactionData) {
          toast({
            title: "Error",
            description: "Transaction not found.",
            variant: "destructive",
          })
          router.push("/inventory/outbound")
          return
        }

        setTransaction(transactionData)
        setAuditTrail(auditTrailData)
        setEditRequests(editRequestsData)
        setCurrentUser(userData)
        setSalesOrders(soData)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load transaction details.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [params.id, router])

  const refreshData = async () => {
    try {
      const [transactionData, auditTrailData, editRequestsData] = await Promise.all([
        getOutboundTransactionById(params.id),
        getAuditTrailForDocument(params.id, "outbound"),
        getEditRequestsForDocument(params.id, "outbound"),
      ])

      if (transactionData) {
        setTransaction(transactionData)
        setAuditTrail(auditTrailData)
        setEditRequests(editRequestsData)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh data.",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline">Draft</Badge>
      case "submitted":
        return <Badge variant="default">Submitted</Badge>
      case "approved":
        return <Badge variant="success">Approved</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      case "void":
        return <Badge variant="secondary">Void</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  const handleEditClick = () => {
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
  }

  const handleEditSubmit = () => {
    setIsEditing(false)
    refreshData()
    setActiveTab("requests")
  }

  const canEdit = currentUser?.permissions?.includes("edit_documents") && transaction?.status !== "void"
  const hasPendingRequests = editRequests.some((request) => request.status === "pending")

  if (isLoading) {
    return (
      <DashboardShell>
        <DashboardHeader heading="Loading..." description="Loading transaction details...">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </DashboardHeader>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    )
  }

  if (!transaction) {
    return (
      <DashboardShell>
        <DashboardHeader heading="Not Found" description="The requested transaction could not be found.">
          <Button variant="outline" onClick={() => router.push("/inventory/outbound")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Outbound Transactions
          </Button>
        </DashboardHeader>
      </DashboardShell>
    )
  }

  if (isEditing) {
    return (
      <DashboardShell>
        <DashboardHeader heading="Edit Outbound Transaction" description="Make changes to this outbound transaction.">
          <Button variant="outline" onClick={handleCancelEdit}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        </DashboardHeader>
        <DocumentEditor
          document={transaction}
          documentType="outbound"
          onCancel={handleCancelEdit}
          onSubmit={handleEditSubmit}
          salesOrders={salesOrders}
        />
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading={`Outbound Transaction: ${transaction.id}`}
        description={`View details for outbound transaction ${transaction.id}`}
      >
        <div className="flex space-x-2">
          {canEdit && !hasPendingRequests && (
            <Button onClick={handleEditClick}>
              <FileEdit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
          <Button variant="outline" onClick={() => router.push("/inventory/outbound")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
      </DashboardHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">
            <ClipboardList className="mr-2 h-4 w-4" />
            Details
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="mr-2 h-4 w-4" />
            Audit Trail
          </TabsTrigger>
          <TabsTrigger value="requests">
            <FileEdit className="mr-2 h-4 w-4" />
            Edit Requests {hasPendingRequests && <Badge className="ml-2">New</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Information</CardTitle>
              <CardDescription>Details about this outbound transaction</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="text-sm font-medium">Status</h3>
                  <div>{getStatusBadge(transaction.status)}</div>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Transaction Type</h3>
                  <div className="capitalize">{transaction.transactionType.replace("-", " ")}</div>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Customer</h3>
                  <div>{transaction.customerName}</div>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Reference Number</h3>
                  <div>{transaction.referenceNumber}</div>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Shipment Date</h3>
                  <div>{formatDate(transaction.shipmentDate)}</div>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Shipping Method</h3>
                  <div className="capitalize">{transaction.shippingMethod.replace("-", " ")}</div>
                </div>
                {transaction.trackingNumber && (
                  <div>
                    <h3 className="text-sm font-medium">Tracking Number</h3>
                    <div>{transaction.trackingNumber}</div>
                  </div>
                )}
                {transaction.driverInfo && (
                  <div>
                    <h3 className="text-sm font-medium">Driver Information</h3>
                    <div>{transaction.driverInfo}</div>
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-medium">Transportation Cost</h3>
                  <div>${transaction.transportationCost.toFixed(2)}</div>
                </div>
                {transaction.salesOrderId && (
                  <div>
                    <h3 className="text-sm font-medium">Sales Order ID</h3>
                    <div>{transaction.salesOrderId}</div>
                  </div>
                )}
                <div className="md:col-span-2">
                  <h3 className="text-sm font-medium">Notes</h3>
                  <div>{transaction.notes || "No notes provided"}</div>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Created By</h3>
                  <div>{transaction.createdBy}</div>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Created At</h3>
                  <div>{formatDate(transaction.createdAt)}</div>
                </div>
                {transaction.updatedBy && (
                  <>
                    <div>
                      <h3 className="text-sm font-medium">Last Updated By</h3>
                      <div>{transaction.updatedBy}</div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Last Updated At</h3>
                      <div>{formatDate(transaction.updatedAt)}</div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
              <CardDescription>Items included in this transaction</CardDescription>
            </CardHeader>
            <CardContent>
              <OutboundItemsTable
                items={transaction.items}
                updateItem={() => {}} // Read-only view
                removeItem={() => {}} // Read-only view
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <AuditTrail entries={auditTrail} />
        </TabsContent>

        <TabsContent value="requests">
          <EditRequests requests={editRequests} onRequestProcessed={refreshData} />
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}
