export interface StockEntry {
  warehouse_id: number
  warehouse_name?: string
  on_hand?: number
  reserved?: number
  available?: number

}


export type ProductStatus =
  | "draft"
  | "pending_tech"
  | "pending_purchase"
  | "pending_finance"
  | "ready_published"
  | "published"
  | "rejected"
  | "closed";

export type ApplicationStatus = "open" | "closed";

export interface ProductImage {
  id: number
  url: string
  alt: string
  is_primary: boolean
}

export interface SalesData {
  month: string
  sales: number
  revenue: number
  profit: number
}

export interface Product {
  id: number
  djj_code: string
  status: ProductStatus
  application_status: ApplicationStatus;
  supplier: string
  manufacturer_code: string
  category: "Machine" | "Parts" | "Tools" | "Accessories"
  subcategory: string
  tertiary_category: string
  name_cn: string
  name_en: string
  specs: string
  standards: string
  unit: string
  currency: string
  rrp_price: number
  standard_warranty: string
  remarks: string
  weight_kg: number
  lift_capacity_kg?: number
  lift_height_mm?: number
  power_source?: string
  other_specs?: unknown    // 对应 Go 的 json.RawMessage
  warranty: string
  marketing_info: string
  training_docs: string
  product_url: string

  /** 替代原来的 syd_stock/per_stock/bne_stock */
  stocks: StockEntry[]

  last_update: string      // ISO 时间字符串
  last_modified_by: string

  monthly_sales: number
  total_sales: number
  profit_margin: number

  technical_specs?: unknown
  other_info?: unknown

  images: ProductImage[]
  sales_data: SalesData[]

  version: number
  created_at: string
  updated_at: string
}
