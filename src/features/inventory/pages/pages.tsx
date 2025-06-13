"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "./components/dashboard-header"
import { DashboardShell } from "./components/dashboard-shell"
import { InventorySummary } from "./components/inventory-summary"
import { RecentTransactions } from "./components/recent-transactions"
import { Button } from "@/components/ui/button"
import * as ToggleGroup from "@radix-ui/react-toggle-group"
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs"
import { ArrowUpRight, Package, PackageCheck, PackageOpen } from "lucide-react"
import { Link, Routes, Route } from 'react-router-dom'
import InventoryOverviewPage from "../InventoryOverviewPage"

export default function DashboardPage() {
  const [isClient, setIsClient] = useState(false)
  const [viewMode, setViewMode] = useState<"summary" | "overview">("summary")

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <DashboardShell>
        {/* 客户端加载中状态 */}
        <DashboardHeader
          heading="Inventory Dashboard"
          description="Overview of your inventory status and recent transactions."
        >
          <Button disabled>Loading...</Button>
        </DashboardHeader>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Inventory Dashboard"
        description="Overview of your inventory status and recent transactions."
      >
        <div className="flex items-center space-x-2">
          {/* 新建入/出库 */}
          <Link to="/inventory/inbound/new">
            <Button size="sm">
              <PackageCheck className="mr-1 h-4 w-4" />
              New Inbound
            </Button>
          </Link>
          <Link to="/inventory/outbound/new">
            <Button variant="outline" size="sm">
              <PackageOpen className="mr-1 h-4 w-4" />
              New Outbound
            </Button>
          </Link>
          {/* 视图切换 ToggleGroup */}
          <ToggleGroup.Root
            type="single"
            value={viewMode}
            onValueChange={(value) => setViewMode(value as "summary" | "overview")}
            className="ml-4 inline-flex rounded-md bg-gray-100 p-1"
          >
            <ToggleGroup.Item
              value="summary"
              className={
                `px-3 py-1 rounded-md text-sm font-medium transition-colors ` +
                (viewMode === "summary"
                  ? "bg-white text-blue-600"
                  : "text-gray-700 hover:bg-white")
              }
            >
              Summary
            </ToggleGroup.Item>
            <ToggleGroup.Item
              value="overview"
              className={
                `px-3 py-1 rounded-md text-sm font-medium transition-colors ` +
                (viewMode === "overview"
                  ? "bg-white text-blue-600"
                  : "text-gray-700 hover:bg-white")
              }
            >
              Overview
            </ToggleGroup.Item>
          </ToggleGroup.Root>
        </div>
      </DashboardHeader>

      {viewMode === "summary" ? (
        <>
          {/* 四个统计卡片 */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,248</div>
                <p className="text-xs text-muted-foreground">+180 from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Inbound Transactions</CardTitle>
                <PackageCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">45</div>
                <p className="text-xs text-muted-foreground">+20% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Outbound Transactions</CardTitle>
                <PackageOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">38</div>
                <p className="text-xs text-muted-foreground">+15% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">Requires attention</p>
              </CardContent>
            </Card>
          </div>

          {/* Summary / Transactions Tabs */}
          <Tabs defaultValue="overview" className="mt-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
              <InventorySummary />
            </TabsContent>
            <TabsContent value="transactions" className="space-y-4">
              <RecentTransactions />
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <div className="mt-6">
          {/*/* 全屏 Overview 页面 *!/*/}
          <InventoryOverviewPage />
        </div>
      )}
    </DashboardShell>
  )
}
