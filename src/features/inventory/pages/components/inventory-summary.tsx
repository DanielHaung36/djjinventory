"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

// Mock data for inventory summary
const inventoryData = [
  {
    category: "Heavy Equipment",
    inStock: 24,
    lowStock: 3,
    outOfStock: 1,
  },
  {
    category: "Tools",
    inStock: 45,
    lowStock: 5,
    outOfStock: 2,
  },
  {
    category: "Parts",
    inStock: 78,
    lowStock: 8,
    outOfStock: 4,
  },
  {
    category: "Accessories",
    inStock: 32,
    lowStock: 6,
    outOfStock: 0,
  },
  {
    category: "Consumables",
    inStock: 56,
    lowStock: 12,
    outOfStock: 3,
  },
]

export function InventorySummary() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Summary</CardTitle>
        <CardDescription>Overview of inventory levels by category</CardDescription>
      </CardHeader>
      <CardContent className="px-2">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={inventoryData}>
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="inStock" name="In Stock" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="lowStock" name="Low Stock" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="outOfStock" name="Out of Stock" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
