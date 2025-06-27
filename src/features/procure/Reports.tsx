"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
} from "recharts"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Clock,
  Users,
  Download,
  Calendar,
  BarChart3,
  PieChartIcon,
  Activity,
  Target,
  AlertTriangle,
  CheckCircle,
} from "lucide-react"

// Mock data for reports
const monthlySpendingData = [
  { month: "Jan", procurement: 45000, products: 12000, total: 57000 },
  { month: "Feb", procurement: 52000, products: 15000, total: 67000 },
  { month: "Mar", procurement: 48000, products: 18000, total: 66000 },
  { month: "Apr", procurement: 61000, products: 22000, total: 83000 },
  { month: "May", procurement: 55000, products: 19000, total: 74000 },
  { month: "Jun", procurement: 67000, products: 25000, total: 92000 },
]

const supplierPerformanceData = [
  { name: "Hangzhou Hengyi", orders: 24, onTime: 92, satisfaction: 4.8, spending: 145000 },
  { name: "Suzhou Industrial", orders: 18, onTime: 88, satisfaction: 4.6, spending: 98000 },
  { name: "Beijing Manufacturing", orders: 15, onTime: 95, satisfaction: 4.9, spending: 76000 },
  { name: "Chongqing Ankong", orders: 12, onTime: 85, satisfaction: 4.3, spending: 54000 },
  { name: "Shanghai Tech", orders: 9, onTime: 90, satisfaction: 4.7, spending: 43000 },
]

const statusDistributionData = [
  { name: "Approved", value: 45, color: "#10b981" },
  { name: "Pending", value: 28, color: "#f59e0b" },
  { name: "In Stock", value: 15, color: "#3b82f6" },
  { name: "Delivered", value: 8, color: "#8b5cf6" },
  { name: "Rejected", value: 4, color: "#ef4444" },
]

const departmentSpendingData = [
  { department: "Procurement", amount: 180000, requests: 45 },
  { department: "Engineering", amount: 120000, requests: 32 },
  { department: "Manufacturing", amount: 95000, requests: 28 },
  { department: "R&D", amount: 75000, requests: 18 },
  { department: "Quality", amount: 45000, requests: 12 },
]

const approvalTimelineData = [
  { week: "Week 1", avgDays: 3.2, requests: 12 },
  { week: "Week 2", avgDays: 2.8, requests: 15 },
  { week: "Week 3", avgDays: 4.1, requests: 18 },
  { week: "Week 4", avgDays: 3.5, requests: 14 },
  { week: "Week 5", avgDays: 2.9, requests: 16 },
  { week: "Week 6", avgDays: 3.8, requests: 13 },
]

const productLaunchMetrics = [
  { quarter: "Q1 2024", launched: 8, approved: 12, rejected: 3, successRate: 67 },
  { quarter: "Q2 2024", launched: 12, approved: 15, rejected: 2, successRate: 80 },
  { quarter: "Q3 2024", launched: 10, approved: 14, rejected: 4, successRate: 71 },
  { quarter: "Q4 2024", launched: 15, approved: 18, rejected: 1, successRate: 94 },
]

export function ReportsOverview() {
  const [timeRange, setTimeRange] = useState("6months")
  const [selectedDepartment, setSelectedDepartment] = useState("all")

  // Calculate KPIs
  const totalSpending = monthlySpendingData.reduce((sum, month) => sum + month.total, 0)
  const avgMonthlySpending = totalSpending / monthlySpendingData.length
  const lastMonthSpending = monthlySpendingData[monthlySpendingData.length - 1].total
  const previousMonthSpending = monthlySpendingData[monthlySpendingData.length - 2].total
  const spendingGrowth = ((lastMonthSpending - previousMonthSpending) / previousMonthSpending) * 100

  const totalRequests = departmentSpendingData.reduce((sum, dept) => sum + dept.requests, 0)
  const avgApprovalTime =
    approvalTimelineData.reduce((sum, week) => sum + week.avgDays, 0) / approvalTimelineData.length

  const kpiData = [
    {
      title: "Total Spending",
      value: `$${totalSpending.toLocaleString()}`,
      change: `${spendingGrowth > 0 ? "+" : ""}${spendingGrowth.toFixed(1)}%`,
      trend: spendingGrowth > 0 ? "up" : "down",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Active Requests",
      value: totalRequests.toString(),
      change: "+12%",
      trend: "up",
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Avg Approval Time",
      value: `${avgApprovalTime.toFixed(1)} days`,
      change: "-8%",
      trend: "down",
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Supplier Partners",
      value: supplierPerformanceData.length.toString(),
      change: "+2",
      trend: "up",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ]

  const exportReport = (type: "pdf" | "excel") => {
    // In a real app, this would generate and download the report
    console.log(`Exporting ${type} report...`)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into procurement and product launch performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-auto">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => exportReport("excel")}>
            <Download className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
          <Button onClick={() => exportReport("pdf")}>
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi) => (
          <Card key={kpi.title} className="card-hover">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                  <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                </div>
                <div className="flex items-center text-xs">
                  {kpi.trend === "up" ? (
                    <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                  )}
                  <span className={kpi.trend === "up" ? "text-green-600" : "text-red-600"}>{kpi.change}</span>
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold">{kpi.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{kpi.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Reports Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="procurement" className="flex items-center space-x-2">
            <Package className="h-4 w-4" />
            <span>Procurement</span>
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center space-x-2">
            <Target className="h-4 w-4" />
            <span>Products</span>
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>Performance</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Monthly Spending Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Monthly Spending Trend
                </CardTitle>
                <CardDescription>Procurement and product launch spending over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    procurement: {
                      label: "Procurement",
                      color: "hsl(var(--chart-1))",
                    },
                    products: {
                      label: "Products",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlySpendingData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="procurement"
                        stackId="1"
                        stroke="var(--color-procurement)"
                        fill="var(--color-procurement)"
                        fillOpacity={0.6}
                      />
                      <Area
                        type="monotone"
                        dataKey="products"
                        stackId="1"
                        stroke="var(--color-products)"
                        fill="var(--color-products)"
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChartIcon className="h-5 w-5 mr-2" />
                  Request Status Distribution
                </CardTitle>
                <CardDescription>Current status of all requests</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    approved: { label: "Approved", color: "#10b981" },
                    pending: { label: "Pending", color: "#f59e0b" },
                    inStock: { label: "In Stock", color: "#3b82f6" },
                    delivered: { label: "Delivered", color: "#8b5cf6" },
                    rejected: { label: "Rejected", color: "#ef4444" },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusDistributionData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {statusDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Department Spending */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Department Spending Analysis
              </CardTitle>
              <CardDescription>Spending breakdown by department</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  amount: {
                    label: "Amount ($)",
                    color: "hsl(var(--chart-1))",
                  },
                  requests: {
                    label: "Requests",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-[400px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={departmentSpendingData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="amount" fill="var(--color-amount)" name="Amount ($)" />
                    <Bar yAxisId="right" dataKey="requests" fill="var(--color-requests)" name="Requests" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Procurement Tab */}
        <TabsContent value="procurement" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Supplier Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Top Suppliers Performance
                </CardTitle>
                <CardDescription>Supplier rankings by performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {supplierPerformanceData.map((supplier, index) => (
                    <div key={supplier.name} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{supplier.name}</p>
                          <p className="text-sm text-muted-foreground">{supplier.orders} orders</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {supplier.onTime}% on-time
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            ⭐ {supplier.satisfaction}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium mt-1">${supplier.spending.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Approval Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Approval Timeline Trends
                </CardTitle>
                <CardDescription>Average approval time over recent weeks</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    avgDays: {
                      label: "Avg Days",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={approvalTimelineData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="avgDays"
                        stroke="var(--color-avgDays)"
                        strokeWidth={2}
                        dot={{ fill: "var(--color-avgDays)" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Procurement Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Key Insights & Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <h4 className="font-medium text-green-600">✅ Positive Trends</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                      Supplier on-time delivery improved by 5% this quarter
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                      Average approval time decreased from 4.2 to 3.4 days
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                      Cost savings of $23,000 achieved through better negotiations
                    </li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-orange-600">⚠️ Areas for Improvement</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <AlertTriangle className="h-4 w-4 text-orange-600 mr-2 mt-0.5" />
                      Engineering department has 15% higher rejection rate
                    </li>
                    <li className="flex items-start">
                      <AlertTriangle className="h-4 w-4 text-orange-600 mr-2 mt-0.5" />
                      Chongqing Ankong supplier needs performance review
                    </li>
                    <li className="flex items-start">
                      <AlertTriangle className="h-4 w-4 text-orange-600 mr-2 mt-0.5" />
                      High-priority requests taking 20% longer than target
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Product Launch Success Rate */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Product Launch Success Rate
                </CardTitle>
                <CardDescription>Quarterly product launch performance</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    successRate: {
                      label: "Success Rate (%)",
                      color: "hsl(var(--chart-1))",
                    },
                    launched: {
                      label: "Launched",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={productLaunchMetrics}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="quarter" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar yAxisId="right" dataKey="launched" fill="var(--color-launched)" name="Products Launched" />
                      <Line
                        yAxisId="left"
                        dataKey="successRate"
                        stroke="var(--color-successRate)"
                        name="Success Rate %"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Product Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Product Categories Performance
                </CardTitle>
                <CardDescription>Success rate by product category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { category: "Electronics", launched: 15, success: 87, revenue: 450000 },
                    { category: "Industrial", launched: 12, success: 92, revenue: 380000 },
                    { category: "Automotive", launched: 8, success: 75, revenue: 290000 },
                    { category: "Healthcare", launched: 6, success: 83, revenue: 220000 },
                  ].map((category) => (
                    <div key={category.category} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium">{category.category}</p>
                        <p className="text-sm text-muted-foreground">{category.launched} products launched</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              category.success >= 85
                                ? "border-green-200 text-green-800"
                                : category.success >= 75
                                  ? "border-yellow-200 text-yellow-800"
                                  : "border-red-200 text-red-800"
                            }`}
                          >
                            {category.success}% success
                          </Badge>
                        </div>
                        <p className="text-sm font-medium mt-1">${category.revenue.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Product Launch Pipeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Product Launch Pipeline
              </CardTitle>
              <CardDescription>Current status of products in the launch pipeline</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                {[
                  { stage: "Concept", count: 12, color: "bg-gray-100 text-gray-800" },
                  { stage: "Development", count: 8, color: "bg-blue-100 text-blue-800" },
                  { stage: "Testing", count: 5, color: "bg-yellow-100 text-yellow-800" },
                  { stage: "Launch Ready", count: 3, color: "bg-green-100 text-green-800" },
                ].map((stage) => (
                  <div key={stage.stage} className="text-center p-4 rounded-lg border">
                    <div
                      className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${stage.color} mb-2`}
                    >
                      <span className="text-lg font-bold">{stage.count}</span>
                    </div>
                    <p className="font-medium">{stage.stage}</p>
                    <p className="text-sm text-muted-foreground">Products</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Team Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Team Performance Metrics
                </CardTitle>
                <CardDescription>Individual and team productivity metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Sarah Johnson", role: "Procurement Manager", requests: 24, avgTime: 2.8, efficiency: 95 },
                    { name: "Mike Chen", role: "Product Manager", requests: 18, avgTime: 3.2, efficiency: 88 },
                    { name: "Lisa Wang", role: "Supply Chain", requests: 21, avgTime: 3.0, efficiency: 92 },
                    { name: "John Smith", role: "Procurement Specialist", requests: 15, avgTime: 3.5, efficiency: 85 },
                  ].map((member) => (
                    <div key={member.name} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {member.requests} requests
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {member.avgTime}d avg
                          </Badge>
                        </div>
                        <div className="flex items-center mt-1">
                          <div className="w-16 h-2 bg-gray-200 rounded-full mr-2">
                            <div className="h-2 bg-green-500 rounded-full" style={{ width: `${member.efficiency}%` }} />
                          </div>
                          <span className="text-xs font-medium">{member.efficiency}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* System Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  System Performance
                </CardTitle>
                <CardDescription>Platform usage and performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Request Processing Speed</span>
                      <span className="font-medium">94%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: "94%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>User Satisfaction</span>
                      <span className="font-medium">4.7/5.0</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: "94%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>System Uptime</span>
                      <span className="font-medium">99.8%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: "99.8%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Data Accuracy</span>
                      <span className="font-medium">98.5%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-500 h-2 rounded-full" style={{ width: "98.5%" }} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Performance Summary & Goals
              </CardTitle>
              <CardDescription>Current performance vs targets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="text-center p-4 rounded-lg border">
                  <div className="text-3xl font-bold text-green-600 mb-2">92%</div>
                  <p className="font-medium">Overall Efficiency</p>
                  <p className="text-sm text-muted-foreground">Target: 90%</p>
                  <Badge className="mt-2 bg-green-100 text-green-800">Above Target</Badge>
                </div>
                <div className="text-center p-4 rounded-lg border">
                  <div className="text-3xl font-bold text-blue-600 mb-2">3.2</div>
                  <p className="font-medium">Avg Processing Days</p>
                  <p className="text-sm text-muted-foreground">Target: 3.0 days</p>
                  <Badge className="mt-2 bg-yellow-100 text-yellow-800">Near Target</Badge>
                </div>
                <div className="text-center p-4 rounded-lg border">
                  <div className="text-3xl font-bold text-purple-600 mb-2">87%</div>
                  <p className="font-medium">Customer Satisfaction</p>
                  <p className="text-sm text-muted-foreground">Target: 85%</p>
                  <Badge className="mt-2 bg-green-100 text-green-800">Above Target</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
