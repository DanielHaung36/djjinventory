"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { ReportFilters } from "@/components/report-filters"
import { ReportResults } from "@/components/report-results"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<"inventory-levels" | "transaction-history" | "low-stock">(
    "inventory-levels",
  )

  return (
    <DashboardShell>
      <DashboardHeader heading="Inventory Reports" description="Generate and view reports on your inventory data." />
      <Tabs
        defaultValue="inventory-levels"
        className="space-y-4"
        onValueChange={(value) => setActiveTab(value as "inventory-levels" | "transaction-history" | "low-stock")}
      >
        <TabsList>
          <TabsTrigger value="inventory-levels">Inventory Levels</TabsTrigger>
          <TabsTrigger value="transaction-history">Transaction History</TabsTrigger>
          <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
        </TabsList>
        <TabsContent value="inventory-levels" className="space-y-4">
          <Card className="p-6">
            <ReportFilters />
            <ReportResults type="inventory-levels" />
          </Card>
        </TabsContent>
        <TabsContent value="transaction-history" className="space-y-4">
          <Card className="p-6">
            <ReportFilters />
            <ReportResults type="transaction-history" />
          </Card>
        </TabsContent>
        <TabsContent value="low-stock" className="space-y-4">
          <Card className="p-6">
            <ReportFilters />
            <ReportResults type="low-stock" />
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}
