import React, { useMemo, useEffect, useState } from 'react'

type CurrencyCode = 'AUD' | 'USD' | 'CNY' | 'EUR' | 'GBP'

// 1. 定义 InventoryRow 类型
export interface InventoryRow {
  id: number
  djj_code: string
  name: string
  product_type: string
  subtype: string
  tertiary: string

  // legacy flat fields (optional)
  on_hand?: number
  reserved_for_order?: number
  available?: number
  warehouse_name?: string
  stock_status?: string
  stock_updated_at?: string
  total_value?: number

  // new metrics structure
  price: number
  currency: CurrencyCode
  metrics: {
    [city: string]: {
      [storeName: string]: {
        on_hand: number
        reserved: number
        available: number
      }
    }
  }
}







