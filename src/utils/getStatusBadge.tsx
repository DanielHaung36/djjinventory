import { Badge } from "@/components/ui/badge"
import type { ProductStatus } from "@/features/product/types"

const statusMap: Record<ProductStatus, { label: string; variant: "default"|"secondary"|"destructive"|"warning"|"success" }> = {
  draft:            { label: "Draft",             variant: "secondary" },
  pending_tech:     { label: "Pending Tech",      variant: "warning"   },
  pending_purchase: { label: "Pending Purchase",  variant: "warning"   },
  pending_finance:  { label: "Pending Finance",   variant: "warning"   },
  ready_published:  { label: "Ready to Publish",  variant: "default"   },
  published:        { label: "Published",         variant: "success"   },
  rejected:         { label: "Rejected",          variant: "destructive"},
  closed:           { label: "Closed",            variant: "secondary"},
}

export function getStatusBadge(status: ProductStatus) {
  const { label, variant } = statusMap[status]
  return <Badge variant={variant}>{label}</Badge>
}