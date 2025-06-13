import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { OutboundTransactionsTable } from "@/components/outbound-transactions-table"
import { Button } from "@/components/ui/button"
import { PackageOpen } from "lucide-react"
import Link from "next/link"

export default function OutboundPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Outbound Transactions"
        description="Manage and view all outgoing inventory transactions."
      >
        <Link href="/inventory/outbound/new">
          <Button>
            <PackageOpen className="mr-2 h-4 w-4" />
            New Outbound
          </Button>
        </Link>
      </DashboardHeader>
      <OutboundTransactionsTable />
    </DashboardShell>
  )
}
