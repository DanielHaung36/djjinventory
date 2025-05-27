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



export interface Product {
  djj_code: string;              // 唯一产品编码
  product_name: string;          // 产品名（英文或中文都可）
  name_cn?: string;              // 中文品名（可选）
  name_en?: string;              // 英文品名（可选）
  category: string;              // 主类别
  subcategory?: string;          // 二级类别
  tertiary_category?: string;    // 三级类别
  supplier?: string;             // 供货商
  manufacturer?: string;         // 厂家名
  manufacturer_code?: string;    // 厂家代码
  model?: string;                // 型号
  specs?: string;                // 规格
  standards?: string;            // 标准
  unit?: string;                 // 单位
  currency?: string;             // 币种
  rrp_price?: number;            // 建议零售价
  price?: number;                // 实际价格
  standard_warranty?: string;    // 标准保修
  warranty?: string;             // 质保
  remarks?: string;              // 备注
  weight_kg?: number;            // 重量
  lift_capacity_kg?: number;     // 起重能力
  lift_height_mm?: number;       // 起升高度
  power_source?: string;         // 动力源
  other_specs?: string;          // 其他配置
  marketing_info?: string;       // 营销信息
  training_docs?: string;        // 知识资料
  status?: string;               // 状态（比如正常/停售/缺货等）
  stockByLocation: Record<string, number>; // 动态门店/仓库库存
  actualQty?: number;            // 总库存（可自动 sum）
  lockedQty?: number;            // 总锁定库存
  availableQty?: number;         // 总可用库存
  last_update?: string;          // 最后更新时间
  last_modified_by?: string;     // 最后修改人
  regionStore?: string;          // 默认主仓库（可选）
  photoUrl?: string;             // 产品图片（可选）
  product_url?: string;          // 外部链接（可选）
}


const product: Product = {
  djj_code: "DJJ-10086",
  product_name: "Hydraulic Forklift Pro",
  name_cn: "液压叉车专家",
  name_en: "Hydraulic Forklift Pro",
  category: "Machine",
  subcategory: "搬运设备",
  tertiary_category: "液压",
  supplier: "澳洲叉车有限公司",
  manufacturer: "Awesome Lift Co.",
  manufacturer_code: "AUSFORK",
  model: "PRO-X2",
  specs: "2吨 2.5米",
  standards: "ISO9001",
  unit: "台",
  currency: "AUD",
  rrp_price: 32800,
  price: 32900,
  standard_warranty: "12 months",
  warranty: "12 months",
  remarks: "Special discount available",
  weight_kg: 980,
  lift_capacity_kg: 2000,
  lift_height_mm: 2500,
  power_source: "Manual",
  other_specs: "附带备用轮胎",
  marketing_info: "Best seller of 2025",
  training_docs: "详见官方网站",
  status: "正常",
  stockByLocation: {
    "SYD": 8,
    "PER": 2,
    "BNE": 6,
    "MEL": 3,        // 新增地区只需多加一行
    "Adelaide": 0
  },
  last_update: "2025-05-27T09:12:00",
  last_modified_by: "Alice",
  regionStore: "Sydney – Warehouse 1",
  photoUrl: "",
  product_url: "https://example.com/products/10086"
};


export interface StockRecord {
  product_code: string;         // 产品编码（外键）
  region_store: string;         // 仓库/地区名
  actualQty: number;            // 在库量
  lockedQty: number;            // 锁定量
  availableQty: number;         // 可用量
  // 可扩展: 批次号、生产日期等
}




interface ProductDetailView {
  product: Product;
  stock: StockRecord[];
}