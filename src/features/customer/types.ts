
export interface Company {
  id: number
  code: string
  name: string
  email: string
  phone: string
  website: string
  abn: string
  address: string
  bank_name: string
  bsb: string
  account_number: string
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface Region {
  id: number
  name: string
  companyId: number
  company: Company
  createdAt: string
  updatedAt: string
  warehouses?:Warehouse[]
}

export interface Store {
  id: number;
  code: string;
  name: string;
  region_id: number;
  region: Region;
  company_id: number;
  company: Company;
  address: string;
  manager_id: number;
  manager: User;
  version: number;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export interface User {
  id: number;
  version: number;
  username: string;
  store_id: number;
  email: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  roles?: RoleType[];
  direct_permissions?: PermissionType[];
  permissions?: PermissionType[];
  avatar_url: string;
}
export interface PermissionType {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  label: string;
  description: string;
}
export interface RoleType {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  permissions?: PermissionType[]; // 每个角色可以包含多个权限
}


export interface Customer {
  id: number;
  store_id: number;
  store: Store;
  type: 'retail' | 'wholesale' | 'corporate';
  company:string;
  name: string;
  phone: string;
  email: string;
  abn: string;
  contact: string;
  
  // 详细地址字段
  delivery_address_line1: string;
  delivery_address_line2?: string;
  delivery_city: string;
  delivery_state: string;
  delivery_postcode: string;
  delivery_country: string;
  
  billing_address_line1: string;
  billing_address_line2?: string;
  billing_city: string;
  billing_state: string;
  billing_postcode: string;
  billing_country: string;
  
  same_as_delivery: boolean;
  
  // 保留原来的address字段以兼容
  address: string;
  
  version: number;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}
// —— 1. 定义 TypeScript 接口 —— 
export interface Warehouse {
  /** 仓库 ID */
  id: number
  /** 仓库名称 */
  name: string
  /** 地址，可选 */
  location?: string
  /** 乐观锁版本号 */
  version: number
  /** 创建时间（ISO 字符串） */
  createdAt: string
  /** 更新时间（ISO 字符串） */
  updatedAt: string
  /** 是否已删除 */
  isDeleted: boolean
  /** 如果后端做了 Preload("Regions")，可以在这里取回关联的 Region 列表 */
  regions?: Region[]
}
