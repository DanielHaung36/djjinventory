"use client"

import { memo, useMemo } from "react"
import { Link } from "react-router-dom"
import {
  FileText,
  Package,
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowUpRight,
  Activity,
  Download,
} from "lucide-react"

// 使用 memo 优化的统计卡片组件
const StatCard = memo(({ title, value, change, icon: Icon, color, bgColor }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow duration-200">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-sm font-medium text-gray-600">{title}</h3>
      <div className={`p-2 rounded-lg ${bgColor}`}>
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
    </div>
    <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
    <p className="text-xs text-gray-500">{change}</p>
  </div>
))

// 使用 memo 优化的活动项组件
const ActivityItem = memo(({ activity }) => (
  <div className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
    <div className={`p-2 rounded-full ${activity.bgColor} flex-shrink-0`}>
      <activity.icon className={`h-4 w-4 ${activity.color}`} />
    </div>
    <div className="flex-1 space-y-1 min-w-0">
      <p className="text-sm font-medium text-gray-900">{activity.message}</p>
      <p className="text-xs text-gray-500">{activity.time}</p>
    </div>
    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full flex-shrink-0">{activity.type}</span>
  </div>
))

const Dashboard = () => {
  // 使用 useMemo 缓存静态数据
  const stats = useMemo(
    () => [
      {
        title: "待审批报价",
        value: "12",
        change: "+2 from yesterday",
        icon: FileText,
        color: "text-blue-600",
        bgColor: "bg-blue-100",
      },
      {
        title: "活跃订单",
        value: "45",
        change: "+7 from last week",
        icon: Package,
        color: "text-green-600",
        bgColor: "bg-green-100",
      },
      {
        title: "本月销售额",
        value: "$2,350,000",
        change: "+15% from last month",
        icon: DollarSign,
        color: "text-purple-600",
        bgColor: "bg-purple-100",
      },
      {
        title: "活跃用户",
        value: "28",
        change: "+3 from last week",
        icon: Users,
        color: "text-orange-600",
        bgColor: "bg-orange-100",
      },
    ],
    [],
  )

  const recentActivity = useMemo(
    () => [
      {
        id: 1,
        type: "approved",
        message: "Quote Q-2025-008 approved",
        time: "2 minutes ago",
        icon: CheckCircle,
        color: "text-green-600",
        bgColor: "bg-green-100",
      },
      {
        id: 2,
        type: "updated",
        message: "Order SO-250025 status updated",
        time: "15 minutes ago",
        icon: Package,
        color: "text-blue-600",
        bgColor: "bg-blue-100",
      },
      {
        id: 3,
        type: "pending",
        message: "Quote Q-2025-009 awaiting approval",
        time: "1 hour ago",
        icon: Clock,
        color: "text-amber-600",
        bgColor: "bg-amber-100",
      },
      {
        id: 4,
        type: "rejected",
        message: "Quote Q-2025-007 rejected",
        time: "2 hours ago",
        icon: AlertTriangle,
        color: "text-red-600",
        bgColor: "bg-red-100",
      },
    ],
    [],
  )

  const quickActions = useMemo(
    () => [
      {
        title: "报价审批",
        description: "Process pending quote approvals",
        href: "/approvals",
        icon: FileText,
        color: "text-blue-600",
        bgColor: "bg-blue-100",
      },
      {
        title: "订单管理",
        description: "View and manage orders",
        href: "/orders",
        icon: Package,
        color: "text-green-600",
        bgColor: "bg-green-100",
      },
      {
        title: "数据分析",
        description: "View sales data analysis",
        href: "/analytics",
        icon: TrendingUp,
        color: "text-purple-600",
        bgColor: "bg-purple-100",
      },
    ],
    [],
  )

  return (
    <div className="h-full flex flex-col">
      {/* 优化后的头部 - 减少复杂度 */}
      <div className="flex-shrink-0 mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">库存管理仪表板</h1>
          <p className="text-gray-600 mt-1">库存、采购和销售数据概览</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Download className="h-4 w-4" />
          导出报表
        </button>
      </div>

      {/* 简化的统计卡片网格 */}
      <div className="flex-shrink-0 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* 简化的主要内容区域 */}
      <div className="flex-1 grid gap-6 lg:grid-cols-7 min-h-0">
        {/* 最近活动 */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col">
          <div className="p-6 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  最近活动
                </h2>
                <p className="text-gray-600 text-sm">最新的系统操作和更新</p>
              </div>
              <Link to="/activity" className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1">
                查看全部
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="flex-1 p-6 space-y-4 overflow-auto">
            {recentActivity.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        </div>

        {/* 快速操作 */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col">
          <div className="p-6 border-b border-gray-200 flex-shrink-0">
            <h2 className="text-lg font-semibold text-gray-900">快速操作</h2>
            <p className="text-gray-600 text-sm">常用功能快速访问</p>
          </div>

          <div className="flex-1 p-6 space-y-3">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.href}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all group"
              >
                <div className={`p-2 rounded-lg ${action.bgColor} mr-3 flex-shrink-0`}>
                  <action.icon className={`h-5 w-5 ${action.color}`} />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <div className="font-medium text-gray-900">{action.title}</div>
                  <div className="text-sm text-gray-600 truncate">{action.description}</div>
                </div>
                <ArrowUpRight className="h-4 w-4 ml-auto text-gray-400 group-hover:text-gray-600 flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
