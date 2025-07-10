/**
 * 库存管理相关类型定义
 * 用于前后端数据对齐
 */

// ===== 基础类型 =====

/**
 * 仓库接口
 */
export interface Warehouse {
  id: number
  name: string
  code?: string
  location?: string
}

/**
 * 地区接口
 */
export interface Region {
  id: number
  name: string
  warehouses: Warehouse[]
}

/**
 * 库存项目状态
 */
export type InventoryStatus = 'active' | 'inactive' | 'discontinued'

/**
 * 库存操作类型
 */
export type InventoryOperationType = 'in' | 'out' | 'transfer' | 'adjustment' | 'reserve' | 'release'

/**
 * 产品分类
 */
export type ProductCategory = 'Machine' | 'Parts' | 'Tools' | 'Accessories' | 'Consumables'

/**
 * 库存预警级别
 */
export type StockAlertLevel = 'critical' | 'low' | 'normal' | 'high'

// ===== 核心接口 =====

/**
 * 库存项目接口
 */
export interface InventoryItem {
  // 基础信息
  id: number
  product_id: number
  product_code: string
  product_name: string
  product_description?: string
  category: ProductCategory
  status: InventoryStatus
  
  // 位置信息
  region_id: number
  region_name: string
  warehouse_id: number
  warehouse_name: string
  warehouse_code?: string
  warehouse_location: string
  region_warehouse: string // 组合字段: "地区 - 仓库"
  
  // 库存数量
  on_hand: number        // 在库量
  reserved: number       // 锁定量/预留量
  available: number      // 可用量 = on_hand - reserved
  in_transit: number     // 在途量
  allocated: number      // 已分配量
  
  // 库存阈值
  threshold: number      // 安全库存阈值
  min_stock: number      // 最小库存量
  max_stock: number      // 最大库存量
  reorder_point: number  // 补货点
  reorder_quantity: number // 补货数量
  
  // 成本和价格
  unit_price: number     // 单价
  cost_price: number     // 成本价
  total_value: number    // 总价值 = on_hand * unit_price
  total_cost: number     // 总成本 = on_hand * cost_price
  
  // 库存状态
  low_stock: boolean     // 是否低库存
  alert_level: StockAlertLevel // 预警级别
  
  // 时间和操作信息
  last_updated: string   // 最后更新时间
  created_at: string     // 创建时间
  operator: string       // 操作员
  operator_id: number    // 操作员ID
  
  // 扩展信息
  unit: string           // 单位
  shelf_life?: number    // 保质期(天)
  expiry_date?: string   // 到期日期
  batch_number?: string  // 批次号
  serial_number?: string // 序列号
  supplier_id?: number   // 供应商ID
  supplier_name?: string // 供应商名称
  
  // 统计信息
  turnover_rate?: number // 周转率
  days_on_hand?: number  // 在库天数
  
  // 元数据
  version: number        // 版本号(用于乐观锁)
  is_active: boolean     // 是否激活
  notes?: string         // 备注
}

/**
 * 库存操作记录接口
 */
export interface InventoryTransaction {
  id: number
  inventory_id: number
  product_id: number
  product_code: string
  product_name: string
  warehouse_id: number
  warehouse_name: string
  
  // 操作信息
  operation_type: InventoryOperationType
  operation_date: string
  quantity: number
  unit_price: number
  total_amount: number
  
  // 库存变化
  before_quantity: number
  after_quantity: number
  
  // 关联信息
  reference_number?: string // 参考单号
  order_id?: number        // 订单ID
  purchase_order_id?: number // 采购单ID
  sales_order_id?: number   // 销售单ID
  
  // 操作人信息
  operator: string
  operator_id: number
  
  // 备注
  remarks?: string
  reason?: string
  
  // 元数据
  created_at: string
  updated_at: string
}

/**
 * 库存预留记录接口
 */
export interface InventoryReservation {
  id: number
  inventory_id: number
  product_id: number
  product_code: string
  product_name: string
  warehouse_id: number
  
  // 预留信息
  reserved_quantity: number
  reserved_by: string
  reserved_by_id: number
  reserved_at: string
  expires_at?: string
  
  // 关联信息
  order_id?: number
  quote_id?: number
  reference_number?: string
  
  // 状态
  status: 'active' | 'expired' | 'released' | 'fulfilled'
  
  // 备注
  reason?: string
  notes?: string
  
  // 元数据
  created_at: string
  updated_at: string
}

/**
 * 库存统计信息接口
 */
export interface InventoryStats {
  // 基础统计
  total_items: number
  total_products: number
  total_value: number
  total_cost: number
  
  // 库存状态统计
  active_items: number
  inactive_items: number
  low_stock_items: number
  out_of_stock_items: number
  
  // 预警统计
  critical_alerts: number
  low_stock_alerts: number
  
  // 按分类统计
  by_category: Record<ProductCategory, {
    count: number
    value: number
    low_stock_count: number
  }>
  
  // 按地区统计
  by_region: Record<string, {
    count: number
    value: number
    low_stock_count: number
  }>
  
  // 按仓库统计
  by_warehouse: Record<string, {
    count: number
    value: number
    low_stock_count: number
  }>
  
  // 时间范围
  date_range: {
    start: string
    end: string
  }
}

/**
 * 库存查询参数接口
 */
export interface InventoryQueryParams {
  // 分页
  page?: number
  page_size?: number
  
  // 筛选
  region_id?: number
  warehouse_id?: number
  category?: ProductCategory
  status?: InventoryStatus
  low_stock?: boolean
  
  // 搜索
  search?: string
  product_code?: string
  product_name?: string
  
  // 排序
  sort_by?: string
  sort_order?: 'asc' | 'desc'
  
  // 日期范围
  date_from?: string
  date_to?: string
  
  // 数量范围
  quantity_min?: number
  quantity_max?: number
  
  // 价值范围
  value_min?: number
  value_max?: number
}

/**
 * 库存操作请求接口
 */
export interface InventoryOperationRequest {
  inventory_id: number
  operation_type: InventoryOperationType
  quantity: number
  unit_price?: number
  
  // 关联信息
  reference_number?: string
  order_id?: number
  
  // 操作信息
  operator_id: number
  remarks?: string
  reason?: string
  
  // 目标仓库(用于调拨)
  target_warehouse_id?: number
}

/**
 * 库存批量操作请求接口
 */
export interface InventoryBatchOperationRequest {
  operations: InventoryOperationRequest[]
  batch_number?: string
  batch_notes?: string
}

/**
 * 库存调整请求接口
 */
export interface InventoryAdjustmentRequest {
  inventory_id: number
  adjustment_type: 'increase' | 'decrease' | 'set'
  quantity: number
  reason: string
  remarks?: string
  operator_id: number
}

/**
 * 库存预留请求接口
 */
export interface InventoryReservationRequest {
  inventory_id: number
  quantity: number
  reserved_by_id: number
  expires_at?: string
  order_id?: number
  quote_id?: number
  reference_number?: string
  reason?: string
  notes?: string
}

// ===== 响应接口 =====

/**
 * 分页响应接口
 */
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    current_page: number
    page_size: number
    total_items: number
    total_pages: number
    has_next: boolean
    has_prev: boolean
  }
}

/**
 * API响应接口
 */
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
  code?: number
  timestamp: string
}

/**
 * 库存验证结果接口
 */
export interface InventoryValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

// ===== 表单接口 =====

/**
 * 库存编辑表单接口
 */
export interface InventoryEditForm {
  threshold: number
  min_stock: number
  max_stock: number
  reorder_point: number
  reorder_quantity: number
  unit_price: number
  cost_price: number
  status: InventoryStatus
  notes?: string
}

/**
 * 库存创建表单接口
 */
export interface InventoryCreateForm {
  product_id: number
  warehouse_id: number
  initial_quantity: number
  unit_price: number
  cost_price: number
  threshold: number
  min_stock: number
  max_stock: number
  reorder_point: number
  reorder_quantity: number
  unit: string
  batch_number?: string
  serial_number?: string
  supplier_id?: number
  expiry_date?: string
  notes?: string
}

// ===== 导出类型 =====

/**
 * 库存导出配置接口
 */
export interface InventoryExportConfig {
  format: 'excel' | 'csv' | 'pdf'
  fields: string[]
  filters?: InventoryQueryParams
  include_stats?: boolean
  include_transactions?: boolean
}

/**
 * 库存导入配置接口
 */
export interface InventoryImportConfig {
  file_type: 'excel' | 'csv'
  has_header: boolean
  field_mapping: Record<string, string>
  validation_rules?: Record<string, any>
}

// ===== 辅助类型 =====

/**
 * 库存项目显示配置
 */
export interface InventoryDisplayConfig {
  show_cost: boolean
  show_supplier: boolean
  show_expiry: boolean
  show_batch: boolean
  show_serial: boolean
  currency: string
  date_format: string
  number_format: string
}

/**
 * 库存操作权限
 */
export interface InventoryPermissions {
  can_view: boolean
  can_create: boolean
  can_edit: boolean
  can_delete: boolean
  can_adjust: boolean
  can_transfer: boolean
  can_reserve: boolean
  can_export: boolean
  can_import: boolean
}