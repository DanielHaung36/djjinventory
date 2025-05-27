import React, { useMemo, useEffect, useState } from 'react'

type CurrencyCode = 'AUD' | 'USD' | 'CNY' | 'EUR' | 'GBP'




export interface InventoryRow {
  id: number
  djj_code: string
  product_name: string
  manufacturer: string
  model: string
  last_update: string  // ISO 字符串
  category: 'Machine' | 'Parts' | 'Tools' | 'Accessories'
  price: number
  regionStore: string
  actualQty: number
  lockedQty: number
  availableQty: number
}
