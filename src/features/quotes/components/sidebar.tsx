"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { BarChart3, Package, PackageCheck, PackageOpen, Settings, Users, FileEdit, FileQuestion } from "lucide-react"

export default function Sidebar() {
  const pathname = usePathname()

  const routes = [
    {
      href: "/",
      icon: BarChart3,
      title: "Dashboard",
    },
    {
      href: "/inventory/items",
      icon: Package,
      title: "Items",
    },
    {
      href: "/inventory/inbound",
      icon: PackageCheck,
      title: "Inbound",
    },
    {
      href: "/inventory/outbound",
      icon: PackageOpen,
      title: "Outbound",
    },
    {
      href: "/inventory/reports",
      icon: BarChart3,
      title: "Reports",
    },
    {
      href: "/inventory/edit-requests",
      icon: FileEdit,
      title: "Edit Requests",
    },
    {
      href: "/quotes",
      icon: FileQuestion,
      title: "Quotes",
    },
    {
      href: "/users",
      icon: Users,
      title: "Users",
    },
    {
      href: "/settings",
      icon: Settings,
      title: "Settings",
    },
  ]

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-muted/40">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Package className="h-6 w-6" />
          <span>Inventory System</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-sm font-medium">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                pathname === route.href && "bg-muted text-primary",
              )}
            >
              <route.icon className="h-4 w-4" />
              {route.title}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mt-auto p-4">
        <button className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground">
          <Users className="mr-2 inline-block h-4 w-4" />
          Account
        </button>
      </div>
    </div>
  )
}
