"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { ChevronDown, ChevronUp, CheckCircle, XCircle } from "lucide-react"
import { approveEditRequest, rejectEditRequest } from "@/lib/actions/inventory-actions"
import type { EditRequest } from "@/lib/types"

interface EditRequestsProps {
  requests: EditRequest[]
  onRequestProcessed: () => void
}

export function EditRequests({ requests, onRequestProcessed }: EditRequestsProps) {
  const [expandedRequests, setExpandedRequests] = useState<Record<string, boolean>>({})
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [activeRequest, setActiveRequest] = useState<EditRequest | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")

  const toggleRequest = (id: string) => {
    setExpandedRequests((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Pending</Badge>
      case "approved":
        return <Badge variant="success">Approved</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const handleApprove = async () => {
    if (!activeRequest) return

    setIsApproving(true)
    try {
      await approveEditRequest(activeRequest.id)
      toast({
        title: "Success",
        description: "Edit request approved successfully.",
      })
      onRequestProcessed()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve edit request.",
        variant: "destructive",
      })
    } finally {
      setIsApproving(false)
      setActiveRequest(null)
    }
  }

  const handleReject = async () => {
    if (!activeRequest) return
    if (!rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for rejection.",
        variant: "destructive",
      })
      return
    }

    setIsRejecting(true)
    try {
      await rejectEditRequest(activeRequest.id, rejectionReason)
      toast({
        title: "Success",
        description: "Edit request rejected successfully.",
      })
      onRequestProcessed()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject edit request.",
        variant: "destructive",
      })
    } finally {
      setIsRejecting(false)
      setActiveRequest(null)
      setRejectionReason("")
    }
  }

  const formatValue = (value: any) => {
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground italic">None</span>
    }

    if (typeof value === "object") {
      return <pre className="text-xs overflow-auto p-2 bg-muted rounded-md">{JSON.stringify(value, null, 2)}</pre>
    }

    return String(value)
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Edit Requests</CardTitle>
          <CardDescription>Requests to modify this document</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-32 items-center justify-center rounded-md border border-dashed">
            <p className="text-sm text-muted-foreground">No edit requests found for this document.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Edit Requests</CardTitle>
          <CardDescription>Requests to modify this document</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {requests
              .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime())
              .map((request) => (
                <Collapsible
                  key={request.id}
                  open={expandedRequests[request.id]}
                  onOpenChange={() => toggleRequest(request.id)}
                  className="border rounded-md"
                >
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center space-x-4">
                      {getStatusBadge(request.status)}
                      <div>
                        <p className="text-sm font-medium">
                          Requested by: <span className="font-normal">{request.requestedBy}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">{formatDate(request.requestedAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {request.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600"
                            onClick={(e) => {
                              e.stopPropagation()
                              setActiveRequest(request)
                              setIsApproving(true)
                            }}
                          >
                            <CheckCircle className="mr-1 h-4 w-4" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600"
                            onClick={(e) => {
                              e.stopPropagation()
                              setActiveRequest(request)
                              setIsRejecting(true)
                            }}
                          >
                            <XCircle className="mr-1 h-4 w-4" />
                            Reject
                          </Button>
                        </>
                      )}
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm">
                          {expandedRequests[request.id] ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                  </div>
                  <CollapsibleContent>
                    <div className="border-t p-4">
                      <div className="mb-4">
                        <h4 className="text-sm font-medium">Reason for Changes</h4>
                        <p className="text-sm">{request.reason}</p>
                      </div>
                      {request.approvedBy && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium">
                            {request.status === "approved" ? "Approved by" : "Rejected by"}
                          </h4>
                          <p className="text-sm">
                            {request.approvedBy} at {request.approvedAt && formatDate(request.approvedAt)}
                          </p>
                        </div>
                      )}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Requested Changes</h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left py-2 px-4">Field</th>
                                <th className="text-left py-2 px-4">Old Value</th>
                                <th className="text-left py-2 px-4">New Value</th>
                              </tr>
                            </thead>
                            <tbody>
                              {request.changes.map((change, index) => (
                                <tr key={index} className="border-b">
                                  <td className="py-2 px-4 font-medium">{change.field}</td>
                                  <td className="py-2 px-4">{formatValue(change.oldValue)}</td>
                                  <td className="py-2 px-4">{formatValue(change.newValue)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isApproving} onOpenChange={(open) => !open && setActiveRequest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Edit Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this edit request? This will apply all the requested changes to the
              document.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveRequest(null)}>
              Cancel
            </Button>
            <Button onClick={handleApprove}>Approve</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isRejecting} onOpenChange={(open) => !open && setActiveRequest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Edit Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this edit request. This will be visible in the audit trail.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter reason for rejection"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="min-h-32"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveRequest(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={!rejectionReason.trim()}>
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
