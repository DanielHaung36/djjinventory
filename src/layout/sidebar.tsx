"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Home,
  FileText,
  Package,
  ShieldAlert,
  ChevronRight,
  ClipboardCheck,
  PanelLeftClose,
  PanelLeftOpen,
  FileQuestion,
  Star,
  Warehouse,
  Eye,
  TrendingUp,
  ShoppingCart,
  Plus,
  CheckCircle,
  MessageSquare,
  HelpCircle,
  UserCheck,
  Cog,
  ArrowDownToLine,
  ArrowUpFromLine,
  Grid3X3,
} from "lucide-react"
import { useSidebar } from "./sidebar-provider"
import { useLanguage } from "./language-provider"

interface NavItem {
  key: string
  label: string
  href?: string
  icon: React.ElementType
  children?: NavItem[]
  badge?: string
}

interface MenuSection {
  title?: string
  items: NavItem[]
}

export function Sidebar() {
  const { isCollapsed, isMobile, toggle } = useSidebar()
  const { t } = useLanguage()
  const pathname = usePathname()
  const [openItems, setOpenItems] = useState<string[]>([])
  const [showText, setShowText] = useState(!isCollapsed)

  const menuSections: MenuSection[] = [
    {
      items: [
        {
          key: "dashboard",
          label: "Dashboard",
          icon: Home,
          href: "/",
        },
        {
          key: "quotes",
          label: "Quotes",
          icon: FileQuestion,
          children: [
            {
              key: "quotes-overview",
              label: "Overview",
              icon: Eye,
              href: "/quotes/overview",
            },
            {
              key: "quotes-approval",
              label: "Quote Approvals",
              icon: ClipboardCheck,
              href: "/approvals",
              badge: "12",
            },
          ],
        },
        {
          key: "sales",
          label: "Sales",
          icon: TrendingUp,
          children: [
            {
              key: "sales-overview",
              label: "Overview",
              icon: Eye,
              href: "/sales/overview",
            },
            {
              key: "sales-details",
              label: "Details",
              icon: FileText,
              href: "/sales/details",
            },
            {
              key: "sales-admin",
              label: "Manage",
              icon: ShieldAlert,
              href: "/admin/sales-orders",
            },
          ],
        },
        {
          key: "inventory",
          label: "Inventory",
          icon: Warehouse,
          children: [
            {
              key: "inv-dashboard",
              label: "Dashboard",
              icon: Grid3X3,
              href: "/inventory/dashboard",
            },
            {
              key: "inv-overview",
              label: "Overview",
              icon: Eye,
              href: "/inventory/overview",
            },
            {
              key: "inv-inbound",
              label: "InBound",
              icon: ArrowDownToLine,
              href: "/inventory/inbound",
            },
            {
              key: "inv-outbound",
              label: "OutBound",
              icon: ArrowUpFromLine,
              href: "/inventory/outbound",
            },
          ],
        },
        {
          key: "products",
          label: "Products",
          icon: Package,
          href: "/products",
        },
        {
          key: "procure",
          label: "Procure",
          icon: ShoppingCart,
          children: [
            {
              key: "procure-dashboard",
              label: "Dashboard",
              icon: Grid3X3,
              href: "/procure/dashboard",
            },
            {
              key: "procurement",
              label: "Procurement",
              icon: ShoppingCart,
              href: "/procure/procurement",
            },
            {
              key: "procure-products",
              label: "Products",
              icon: Package,
              href: "/procure/products",
            },
            {
              key: "products-new",
              label: "New Product",
              icon: Plus,
              href: "/procure/products/new",
            },
            {
              key: "procure-admin",
              label: "Admin Approvals",
              icon: CheckCircle,
              href: "/procure/admin",
            },
            {
              key: "procure-review",
              label: "Product Reviews",
              icon: Star,
              href: "/procure/admin/products",
            },
            {
              key: "procure-newproduct",
              label: "NewProduct",
              icon: Plus,
              href: "/procure/newpurchase",
            },
          ],
        },
      ],
    },
    {
      title: "Other Information",
      items: [
        {
          key: "knowledge",
          label: "Knowledge Base",
          icon: MessageSquare,
          href: "/knowledge",
        },
        {
          key: "faq",
          label: "FAQ",
          icon: HelpCircle,
          href: "/faq",
        },
      ],
    },
    {
      title: "Settings",
      items: [
        {
          key: "team-settings",
          label: "Team Settings",
          icon: UserCheck,
          href: "/users/permissions",
        },
        {
          key: "global-settings",
          label: "Global Settings",
          icon: Cog,
          href: "/settings",
        },
      ],
    },
  ]

  // Handle text fade animation when sidebar expands/collapses
  useEffect(() => {
    if (isCollapsed) {
      // Hide text immediately when collapsing
      setShowText(false)
    } else {
      // Show text with delay when expanding
      const timer = setTimeout(() => {
        setShowText(true)
      }, 150) // Delay to let sidebar expand first
      return () => clearTimeout(timer)
    }
  }, [isCollapsed])

  const isActive = (href: string) => {
    return pathname === href || (href !== "/" && pathname.startsWith(href))
  }

  const isParentActive = (children: NavItem[]) => {
    return children.some((child) => child.href && isActive(child.href))
  }

  const toggleItem = (key: string) => {
    setOpenItems((prev) => (prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]))
  }

  // Auto-expand parent items when their children are active
  useEffect(() => {
    const activeParents: string[] = []

    menuSections.forEach((section) => {
      section.items.forEach((item) => {
        if (item.children && isParentActive(item.children)) {
          activeParents.push(item.key)
        }
      })
    })

    if (activeParents.length > 0) {
      setOpenItems((prev) => {
        const newItems = [...prev]
        activeParents.forEach((parent) => {
          if (!newItems.includes(parent)) {
            newItems.push(parent)
          }
        })
        return newItems
      })
    }
  }, [pathname])

  // Handle sidebar collapse - close all items when collapsed on desktop
  useEffect(() => {
    if (isCollapsed && !isMobile) {
      setOpenItems([])
    }
  }, [isCollapsed, isMobile])

  const renderNavItem = (item: NavItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const itemIsActive = item.href ? isActive(item.href) : hasChildren ? isParentActive(item.children!) : false
    const isOpen = openItems.includes(item.key)

    if (hasChildren) {
      // For collapsed desktop sidebar, show tooltip with children
      if (isCollapsed && !isMobile) {
        const firstChild = item.children?.[0]

        return (
          <TooltipProvider key={item.key}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-center h-11 px-2 font-medium transition-all duration-200",
                    itemIsActive && "bg-blue-50 text-blue-700 shadow-sm",
                    "hover:bg-blue-50 hover:text-blue-700",
                  )}
                  onClick={() => {
                    // Navigate to first child when collapsed
                    if (firstChild?.href) {
                      window.location.href = firstChild.href
                    }
                  }}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-medium bg-white border shadow-lg">
                <div className="space-y-2">
                  <div className="font-semibold text-blue-700">{item.label}</div>
                  <div className="space-y-1">
                    {item.children?.map((child, index) => (
                      <div
                        key={child.key}
                        className={cn(
                          "text-sm pl-2 py-1 rounded transition-colors duration-200",
                          index === 0 && "text-blue-600 font-medium",
                          index > 0 && "text-gray-600 hover:text-gray-900",
                        )}
                      >
                        • {child.label}
                        {child.badge && (
                          <span className="ml-2 bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 rounded-full">
                            {child.badge}
                          </span>
                        )}
                        {index === 0 && <span className="ml-2 text-xs text-blue-500">(默认)</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      }

      // Expanded sidebar with collapsible sub-menu
      return (
        <Collapsible key={item.key} open={isOpen} onOpenChange={() => toggleItem(item.key)}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 h-11 px-4 font-medium transition-all duration-200 text-[15px]",
                level > 0 && "ml-4 w-[calc(100%-1rem)]",
                itemIsActive && "bg-blue-50 text-blue-700 shadow-sm font-semibold",
                "hover:bg-blue-50 hover:text-blue-700 hover:shadow-sm",
                "text-gray-700 hover:font-semibold",
              )}
            >
              <item.icon className="h-[18px] w-[18px] shrink-0" />
              {(!isCollapsed || isMobile) && (
                <>
                  <span
                    className={cn(
                      "truncate flex-1 text-left tracking-wide transition-all duration-300",
                      showText ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2",
                    )}
                  >
                    {item.label}
                  </span>
                  <ChevronRight
                    className={cn(
                      "h-4 w-4 shrink-0 transition-all duration-200",
                      isOpen && "rotate-90 text-blue-600",
                      showText ? "opacity-100" : "opacity-0",
                    )}
                  />
                </>
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="overflow-hidden transition-all duration-200">
            <div className="ml-2 border-l-2 border-blue-100 pl-4 space-y-1 py-2">
              {item.children?.map((child) => renderNavItem(child, level + 1))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )
    }

    // Regular navigation item (leaf node)
    const linkContent = (
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start gap-3 h-11 px-4 font-medium transition-all duration-200 text-[15px]",
          level > 0 && "ml-0 w-full",
          itemIsActive && "bg-blue-50 text-blue-700 shadow-sm font-semibold",
          isCollapsed && !isMobile && "px-2 justify-center",
          "hover:bg-blue-50 hover:text-blue-700 hover:shadow-sm",
          level > 0 && "hover:translate-x-1",
          "text-gray-700 hover:font-semibold",
        )}
        asChild
      >
        <Link href={item.href!}>
          <item.icon
            className={cn(
              "h-[18px] w-[18px] shrink-0 transition-all duration-200",
              isCollapsed && !isMobile && "h-5 w-5",
            )}
          />
          {(!isCollapsed || isMobile) && (
            <>
              <span
                className={cn(
                  "truncate flex-1 text-left tracking-wide transition-all duration-300",
                  showText ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2",
                )}
              >
                {item.label}
              </span>
              {item.badge && (
                <span
                  className={cn(
                    "ml-auto bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full shrink-0 font-semibold transition-all duration-300",
                    showText ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2",
                  )}
                >
                  {item.badge}
                </span>
              )}
            </>
          )}
        </Link>
      </Button>
    )

    return isCollapsed && !isMobile ? (
      <TooltipProvider key={item.key}>
        <Tooltip>
          <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
          <TooltipContent side="right" className="font-medium bg-white border shadow-lg">
            <div className="flex items-center gap-2">
              {item.label}
              {item.badge && (
                <span className="bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 rounded-full">{item.badge}</span>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ) : (
      <div key={item.key}>{linkContent}</div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Header with Logo and Toggle */}
      <div className={cn("p-4 border-b border-gray-200 relative", isCollapsed && !isMobile && "px-2 pb-2")}>
        {/* Sidebar Toggle - positioned in top-center when collapsed, top-right when expanded */}
        {!isMobile && (
          <div
            className={cn(
              "absolute top-2 transition-all duration-300",
              isCollapsed ? "left-1/2 -translate-x-1/2" : "right-2",
            )}
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggle}
                    className={cn(
                      "hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-colors duration-200",
                      isCollapsed ? "h-8 w-8" : "h-8 w-8",
                    )}
                  >
                    {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-white border shadow-lg">
                  <p>{isCollapsed ? t("system.expand-sidebar") : t("system.collapse-sidebar")}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}

        {/* Logo/Brand */}
        {isCollapsed && !isMobile ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex justify-center cursor-pointer pt-12">
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">S</span>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-white border shadow-lg">
                <p>{t("system.title")}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <div className="flex items-center gap-3 pr-12 pt-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <div className="flex flex-col">
              <span
                className={cn(
                  "font-bold text-[16px] leading-none text-gray-900 tracking-wide transition-all duration-300",
                  showText ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-3",
                )}
              >
                {t("system.title")}
              </span>
              <span
                className={cn(
                  "text-xs text-blue-600 font-medium mt-1 tracking-wider transition-all duration-300 delay-75",
                  showText ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-3",
                )}
              >
                Professional v2.0
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className={cn("flex-1 py-4", isCollapsed ? "px-2" : "px-3")}>
        <nav className="space-y-6">
          {menuSections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              {/* Section Title */}
              {section.title && (!isCollapsed || isMobile) && (
                <div className="px-4 mb-3">
                  <h3
                    className={cn(
                      "text-xs font-semibold text-gray-500 uppercase tracking-wider transition-all duration-300",
                      showText ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2",
                    )}
                  >
                    {section.title}
                  </h3>
                </div>
              )}

              {/* Section Items */}
              <div className="space-y-1">{section.items.map((item) => renderNavItem(item))}</div>
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className={cn("p-4 border-t border-gray-200", isCollapsed && !isMobile && "px-2 py-3")}>
        {isCollapsed && !isMobile ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex justify-center cursor-pointer">
                  <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-sm font-semibold text-gray-600">A</span>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-white border shadow-lg">
                <p>Admin User</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <div className="w-7 h-7 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-sm">
              <span className="text-xs font-semibold text-gray-600">A</span>
            </div>
            <span
              className={cn(
                "truncate font-medium tracking-wide transition-all duration-300",
                showText ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2",
              )}
            >
              Admin User
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
