"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Menu, Search, Bell, Settings, User, LogOut, Languages, Shield, Zap } from "lucide-react"
import { useSidebar } from "./sidebar-provider"
import { useLanguage } from "./language-provider"
import { Sidebar } from "./sidebar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export function Header() {
  const { isMobile, isOpen, setOpen } = useSidebar()
  const { language, setLanguage, t } = useLanguage()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm">
      <div className="flex h-16 items-center space-between px-6">
        {/* Left Section - Mobile Menu + Logo */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu */}
          {isMobile && (
            <Sheet open={isOpen} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden hover:bg-gray-100 text-gray-600 transition-colors"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">{t("system.toggle-sidebar")}</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72">
                <Sidebar />
              </SheetContent>
            </Sheet>
          )}

          {/* Logo/Brand for mobile */}
          {isMobile && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg text-gray-900 leading-none">Sales System</span>
                <span className="text-xs text-blue-600 font-medium">Professional Edition</span>
              </div>
            </div>
          )}
        </div>
          <div className="flex-shrink-0">
               <img src="../../assets/logo.png" alt="Logo" className="h-10 w-auto ml-10" />
        </div>

        {/* Center Section - Search */}
        {/* <div className="flex-1 max-w-md mx-8">
          
          <div className="relative group">

            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            <Input
              placeholder={t("common.search")}
              className="w-full pl-10 pr-4 h-10 bg-gray-50 border-gray-200 focus-visible:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all duration-200 rounded-xl"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>
          </div>
        </div> */}

        {/* Right Section - Actions */}
        <div className="flex flex-1 justify-end gap-2">
          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-gray-100 text-gray-600 transition-all duration-200 rounded-xl"
              >
                <Languages className="h-5 w-5" />
                <span className="sr-only">{t("system.language")}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-white border-gray-200 shadow-xl rounded-xl">
              <DropdownMenuItem
                onClick={() => setLanguage("en")}
                className={cn("cursor-pointer rounded-lg m-1", language === "en" && "bg-blue-50")}
              >
                <span className="mr-3 text-lg">🇺🇸</span>
                <span className="flex-1">English</span>
                {language === "en" && (
                  <Badge className="ml-auto bg-blue-100 text-blue-700 border-blue-200" variant="secondary">
                    Active
                  </Badge>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setLanguage("zh")}
                className={cn("cursor-pointer rounded-lg m-1", language === "zh" && "bg-blue-50")}
              >
                <span className="mr-3 text-lg">🇨🇳</span>
                <span className="flex-1">中文</span>
                {language === "zh" && (
                  <Badge className="ml-auto bg-blue-100 text-blue-700 border-blue-200" variant="secondary">
                    Active
                  </Badge>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative hover:bg-gray-100 text-gray-600 transition-all duration-200 rounded-xl"
                >
                  <Bell className="h-5 w-5" />
                  <div className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white text-xs font-bold">3</span>
                  </div>
                  <span className="sr-only">{t("user.notifications")}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-white border-gray-200 shadow-xl rounded-lg">
                <p className="font-medium">3 new notifications</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Settings */}
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-gray-100 text-gray-600 transition-all duration-200 rounded-xl"
          >
            <Settings className="h-5 w-5" />
            <span className="sr-only">Settings</span>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-xl p-0 hover:bg-gray-100 transition-all duration-200 ml-2"
              >
                <Avatar className="h-10 w-10 ring-2 ring-gray-200 shadow-md">
                  <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Avatar" />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold">
                    AD
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-white shadow-sm" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72 bg-white border-gray-200 shadow-xl rounded-xl" align="end" forceMount>
              <DropdownMenuLabel className="font-normal p-4">
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 ring-2 ring-gray-200 shadow-md">
                      <AvatarImage src="/placeholder.svg?height=48&width=48" alt="Avatar" />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold">
                        AD
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold leading-none text-gray-900">Admin User</p>
                        <Badge className="text-xs bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0">
                          <Shield className="w-3 h-3 mr-1" />
                          Super Admin
                        </Badge>
                      </div>
                      <p className="text-xs leading-none text-gray-600 mt-1">admin@example.com</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600 bg-green-50 rounded-lg px-3 py-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="font-medium">Online • Last active now</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-200" />
              <div className="p-2">
                <DropdownMenuItem className="cursor-pointer hover:bg-gray-50 text-gray-700 rounded-lg">
                  <User className="mr-3 h-4 w-4" />
                  <span>{t("user.profile")}</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer hover:bg-gray-50 text-gray-700 rounded-lg">
                  <Settings className="mr-3 h-4 w-4" />
                  <span>{t("user.settings")}</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer hover:bg-gray-50 text-gray-700 rounded-lg">
                  <Zap className="mr-3 h-4 w-4" />
                  <span>Quick Actions</span>
                </DropdownMenuItem>
              </div>
              <DropdownMenuSeparator className="bg-gray-200" />
              <div className="p-2">
                <DropdownMenuItem className="cursor-pointer text-red-600 hover:bg-red-50 focus:bg-red-50 rounded-lg">
                  <LogOut className="mr-3 h-4 w-4" />
                  <span>{t("user.logout")}</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
