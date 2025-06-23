"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  ShoppingCart,
  Package,
  CheckCircle,
  Clock,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"

export function DashboardOverview() {
  const stats = [
    {
      title: "Active Procurement",
      value: "24",
      change: "+12%",
      trend: "up",
      icon: ShoppingCart,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Product Launches",
      value: "8",
      change: "+5%",
      trend: "up",
      icon: Package,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Pending Approvals",
      value: "15",
      change: "-8%",
      trend: "down",
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Completed",
      value: "42",
      change: "+23%",
      trend: "up",
      icon: CheckCircle,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ]

  const recentRequests = [
    {
      id: "PR-001",
      type: "Procurement",
      title: "Industrial Water Meters",
      status: "pending",
      priority: "high",
      date: "2024-01-15",
    },
    {
      id: "PL-003",
      type: "Product Launch",
      title: "Smart Temperature Sensor",
      status: "approved",
      priority: "medium",
      date: "2024-01-14",
    },
    {
      id: "PR-002",
      type: "Procurement",
      title: "Explosion-Proof Enclosures",
      status: "rejected",
      priority: "low",
      date: "2024-01-13",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Overview of your procurement and product launch activities</p>
        </div>
        <Button>
          <TrendingUp className="mr-2 h-4 w-4" />
          View Reports
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <div className="flex items-center text-xs">
                  {stat.trend === "up" ? (
                    <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-red-600 mr-1" />
                  )}
                  <span className={stat.trend === "up" ? "text-green-600" : "text-red-600"}>{stat.change}</span>
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Requests */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Recent Requests</CardTitle>
            <CardDescription className="text-sm">Latest procurement and product launch requests</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">{request.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {request.id} • {request.type}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant={
                      request.status === "approved"
                        ? "default"
                        : request.status === "pending"
                          ? "secondary"
                          : "destructive"
                    }
                    className="text-xs"
                  >
                    {request.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Approval Progress */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Approval Progress</CardTitle>
            <CardDescription className="text-sm">Current status of approval workflows</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Technical Review</span>
                <span className="font-medium">75%</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Procurement Approval</span>
                <span className="font-medium">60%</span>
              </div>
              <Progress value={60} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Financial Review</span>
                <span className="font-medium">40%</span>
              </div>
              <Progress value={40} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" className="h-auto p-4 flex-col space-y-2">
              <ShoppingCart className="h-5 w-5" />
              <span className="text-xs">New Procurement</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col space-y-2">
              <Package className="h-5 w-5" />
              <span className="text-xs">Product Launch</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col space-y-2">
              <TrendingUp className="h-5 w-5" />
              <span className="text-xs">View Reports</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col space-y-2">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-xs">Urgent Items</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
