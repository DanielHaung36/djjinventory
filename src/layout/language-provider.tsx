"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export type Language = "en" | "zh"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, params?: Record<string, string | number>) => string
}

const translations = {
  en: {
    // Navigation
    "nav.dashboard": "Dashboard",
    "nav.quotes": "Quotes",
    "nav.quote-approval": "Quote Approval",
    "nav.quote-list": "Quote List",
    "nav.orders": "Orders",
    "nav.sales-orders": "Sales Orders",
    "nav.admin": "Admin",
    "nav.admin-orders": "Order Management",
    "nav.admin-sales": "Sales Management",
    "nav.analytics": "Analytics",
    "nav.users": "Users",
    "nav.user-permissions": "User Permissions",
    "nav.settings": "Settings",

    // Common
    "common.search": "Search...",
    "common.loading": "Loading...",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.view": "View",
    "common.actions": "Actions",
    "common.status": "Status",
    "common.date": "Date",
    "common.customer": "Customer",
    "common.amount": "Amount",
    "common.total": "Total",
    "common.showing": "Showing",
    "common.to": "to",
    "common.of": "of",
    "common.entries": "entries",
    "common.no-data": "No data available",

    // Dashboard
    "dashboard.title": "Dashboard",
    "dashboard.welcome": "Welcome to Sales Management System",
    "dashboard.pending-quotes": "Pending Quotes",
    "dashboard.active-orders": "Active Orders",
    "dashboard.monthly-sales": "Monthly Sales",
    "dashboard.active-users": "Active Users",
    "dashboard.recent-activity": "Recent Activity",
    "dashboard.quick-actions": "Quick Actions",

    // System
    "system.title": "Sales Management System",
    "system.language": "Language",
    "system.theme": "Theme",
    "system.expand-sidebar": "Expand Sidebar",
    "system.collapse-sidebar": "Collapse Sidebar",
    "system.toggle-sidebar": "Toggle Sidebar",

    // User
    "user.profile": "Profile",
    "user.settings": "Settings",
    "user.logout": "Logout",
    "user.notifications": "Notifications",

    // Orders
    "orders.title": "Order Management",
    "orders.admin-title": "Admin Order Management",
    "orders.description": "Manage and oversee all sales orders with administrative privileges.",
    "orders.order-number": "Order #",
    "orders.quote-number": "Quote #",
    "orders.order-date": "Order Date",
    "orders.total-amount": "Total Amount",
    "orders.last-modified": "Last Modified",
    "orders.change-status": "Change Status",
    "orders.view-details": "View Details",
    "orders.delete-order": "Delete Order",
    "orders.filter-status": "Filter by status",
    "orders.all-statuses": "All Statuses",
    "orders.items-per-page": "Items per page",

    // Quotes
    "quotes.title": "Quote Approvals",
    "quotes.manage": "Manage Quote Approvals",
    "quotes.approve": "Approve",
    "quotes.reject": "Reject",
    "quotes.pending": "Pending",
    "quotes.approved": "Approved",
    "quotes.rejected": "Rejected",
    "quotes.reason": "Reason",
    "quotes.applicant": "Applicant",
  },
  zh: {
    // Navigation
    "nav.dashboard": "仪表板",
    "nav.quotes": "报价管理",
    "nav.quote-approval": "报价审批",
    "nav.quote-list": "报价列表",
    "nav.orders": "订单管理",
    "nav.sales-orders": "销售订单",
    "nav.admin": "管理员",
    "nav.admin-orders": "订单管理",
    "nav.admin-sales": "销售管理",
    "nav.analytics": "数据分析",
    "nav.users": "用户管理",
    "nav.user-permissions": "用户权限",
    "nav.settings": "系统设置",

    // Common
    "common.search": "搜索...",
    "common.loading": "加载中...",
    "common.save": "保存",
    "common.cancel": "取消",
    "common.delete": "删除",
    "common.edit": "编辑",
    "common.view": "查看",
    "common.actions": "操作",
    "common.status": "状态",
    "common.date": "日期",
    "common.customer": "客户",
    "common.amount": "金额",
    "common.total": "总计",
    "common.showing": "显示",
    "common.to": "至",
    "common.of": "共",
    "common.entries": "条记录",
    "common.no-data": "暂无数据",

    // Dashboard
    "dashboard.title": "仪表板",
    "dashboard.welcome": "欢迎使用销售管理系统",
    "dashboard.pending-quotes": "待审批报价",
    "dashboard.active-orders": "活跃订单",
    "dashboard.monthly-sales": "本月销售额",
    "dashboard.active-users": "活跃用户",
    "dashboard.recent-activity": "最近活动",
    "dashboard.quick-actions": "快速操作",

    // System
    "system.title": "销售管理系统",
    "system.language": "语言",
    "system.theme": "主题",
    "system.expand-sidebar": "展开侧边栏",
    "system.collapse-sidebar": "收起侧边栏",
    "system.toggle-sidebar": "切换侧边栏",

    // User
    "user.profile": "个人资料",
    "user.settings": "设置",
    "user.logout": "退出登录",
    "user.notifications": "通知",

    // Orders
    "orders.title": "订单管理",
    "orders.admin-title": "管理员订单管理",
    "orders.description": "使用管理员权限管理和监督所有销售订单。",
    "orders.order-number": "订单号",
    "orders.quote-number": "报价号",
    "orders.order-date": "订单日期",
    "orders.total-amount": "总金额",
    "orders.last-modified": "最后修改",
    "orders.change-status": "更改状态",
    "orders.view-details": "查看详情",
    "orders.delete-order": "删除订单",
    "orders.filter-status": "按状态筛选",
    "orders.all-statuses": "所有状态",
    "orders.items-per-page": "每页显示",

    // Quotes
    "quotes.title": "报价审批",
    "quotes.manage": "管理报价审批",
    "quotes.approve": "批准",
    "quotes.reject": "拒绝",
    "quotes.pending": "待审批",
    "quotes.approved": "已批准",
    "quotes.rejected": "已拒绝",
    "quotes.reason": "原因",
    "quotes.applicant": "申请人",
  },
} as const

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("zh")

  useEffect(() => {
    const saved = localStorage.getItem("language") as Language
    if (saved && (saved === "en" || saved === "zh")) {
      setLanguage(saved)
    }
  }, [])

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem("language", lang)
  }

  const t = (key: string, params?: Record<string, string | number>): string => {
    let text = translations[language][key as keyof (typeof translations)[typeof language]] || key

    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        text = text.replace(`{{${param}}}`, String(value))
      })
    }

    return text
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
