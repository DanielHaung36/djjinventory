"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronUp } from "lucide-react"
import type { AuditTrailEntry } from "@/lib/types"

interface AuditTrailProps {
  entries: AuditTrailEntry[]
}

export function AuditTrail({ entries }: AuditTrailProps) {
  const [expandedEntries, setExpandedEntries] = useState<Record<string, boolean>>({})

  const toggleEntry = (id: string) => {
    setExpandedEntries((prev) => ({
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
      second: "2-digit",
    }).format(date)
  }

  const getActionBadge = (action: string) => {
    switch (action) {
      case "create":
        return <Badge variant="outline">Created</Badge>
      case "update":
        return <Badge variant="default">Updated</Badge>
      case "approve":
        return <Badge variant="success">Approved</Badge>
      case "reject":
        return <Badge variant="destructive">Rejected</Badge>
      case "void":
        return <Badge variant="secondary">Voided</Badge>
      default:
        return <Badge>{action}</Badge>
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

  if (entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Audit Trail</CardTitle>
          <CardDescription>History of changes to this document</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-32 items-center justify-center rounded-md border border-dashed">
            <p className="text-sm text-muted-foreground">No audit trail entries found for this document.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Trail</CardTitle>
        <CardDescription>History of changes to this document</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {entries
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .map((entry) => (
              <Collapsible
                key={entry.id}
                open={expandedEntries[entry.id]}
                onOpenChange={() => toggleEntry(entry.id)}
                className="border rounded-md"
              >
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center space-x-4">
                    {getActionBadge(entry.action)}
                    <div>
                      <p className="text-sm font-medium">
                        {entry.userName} <span className="text-muted-foreground">({entry.userId})</span>
                      </p>
                      <p className="text-xs text-muted-foreground">{formatDate(entry.timestamp)}</p>
                    </div>
                  </div>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm">
                      {expandedEntries[entry.id] ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent>
                  <div className="border-t p-4">
                    {entry.reason && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium">Reason</h4>
                        <p className="text-sm">{entry.reason}</p>
                      </div>
                    )}
                    {entry.changes && entry.changes.length > 0 ? (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Changes</h4>
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
                              {entry.changes.map((change, index) => (
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
                    ) : (
                      <p className="text-sm text-muted-foreground">No detailed changes recorded.</p>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
        </div>
      </CardContent>
    </Card>
  )
}
