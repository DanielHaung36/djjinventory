"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, FilterX } from "lucide-react"

export function ReportFilters() {
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [category, setCategory] = useState("")

  const handleReset = () => {
    setDateFrom("")
    setDateTo("")
    setCategory("")
  }

  return (
    <div className="mb-6">
      <div className="grid gap-4 md:grid-cols-4">
        <div className="space-y-2">
          <label htmlFor="date-from" className="text-sm font-medium">
            Date From
          </label>
          <Input id="date-from" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        </div>
        <div className="space-y-2">
          <label htmlFor="date-to" className="text-sm font-medium">
            Date To
          </label>
          <Input id="date-to" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>
        <div className="space-y-2">
          <label htmlFor="category" className="text-sm font-medium">
            Category
          </label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger id="category">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="widgets">Widgets</SelectItem>
              <SelectItem value="gadgets">Gadgets</SelectItem>
              <SelectItem value="components">Components</SelectItem>
              <SelectItem value="accessories">Accessories</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end space-x-2">
          <Button className="flex-1">
            <Search className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
          <Button variant="outline" onClick={handleReset}>
            <FilterX className="h-4 w-4" />
            <span className="sr-only">Reset filters</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
