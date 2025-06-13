import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { InventoryItemsTable } from "@/components/inventory-items-table"
import { Button } from "@/components/ui/button"
import { Package } from "lucide-react"
import Link from "next/link"

export default function InventoryItemsPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Inventory Items" description="Manage and view all items in your inventory.">
        <Link href="/inventory/items/new">
          <Button>
            <Package className="mr-2 h-4 w-4" />
            New Item
          </Button>
        </Link>
      </DashboardHeader>
      <InventoryItemsTable />
    </DashboardShell>
  )
}
