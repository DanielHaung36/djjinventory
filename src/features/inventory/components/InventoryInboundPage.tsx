import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { InboundTransactionsTable } from "@/components/inbound-transactions-table"
import { Button } from "@/components/ui/button"
import { PackageCheck } from "lucide-react"
import { Link } from "react-router-dom"

export default function InboundPage() {
  console.log('🏠 [InventoryInboundPage] 页面加载');
  
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Inbound Transactions"
        description="Manage and view all incoming inventory transactions."
      >
        <Link to="/inventory/inbound/new">
          <Button>
            <PackageCheck className="mr-2 h-4 w-4" />
            New Inbound
          </Button>
        </Link>
      </DashboardHeader>
      <InboundTransactionsTable />
    </DashboardShell>
  )
}
