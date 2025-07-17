import type { User, PermissionModule, UserPermissionData } from "@/lib/types/user-permission"
import { permissionApi } from "@/api/permissionApi"

// 模拟用户数据
const mockUsers: User[] = [
  {
    id: 1,
    username: "admin",
    fullName: "系统管理员",
    email: "admin@example.com",
    role: "超级管理员",
    isActive: true,
    lastLogin: "2025-06-23T10:30:00Z",
  },
  {
    id: 2,
    username: "jane.doe",
    fullName: "Jane Doe",
    email: "jane.doe@example.com",
    role: "销售经理",
    isActive: true,
    lastLogin: "2025-06-23T09:15:00Z",
  },
  {
    id: 3,
    username: "john.smith",
    fullName: "John Smith",
    email: "john.smith@example.com",
    role: "销售代表",
    isActive: true,
    lastLogin: "2025-06-22T16:45:00Z",
  },
  {
    id: 4,
    username: "alice.brown",
    fullName: "Alice Brown",
    email: "alice.brown@example.com",
    role: "财务专员",
    isActive: true,
    lastLogin: "2025-06-23T08:20:00Z",
  },
  {
    id: 5,
    username: "bob.wilson",
    fullName: "Bob Wilson",
    email: "bob.wilson@example.com",
    role: "仓库管理员",
    isActive: false,
    lastLogin: "2025-06-20T14:30:00Z",
  },
  {
    id: 6,
    username: "carol.davis",
    fullName: "Carol Davis",
    email: "carol.davis@example.com",
    role: "客服专员",
    isActive: true,
    lastLogin: "2025-06-23T11:00:00Z",
  },
]

// 模拟权限模块数据
const mockPermissionModules: PermissionModule[] = [
  {
    module: "库存管理",
    icon: "📦",
    description: "管理产品库存、入库出库等操作",
    permissions: [
      { id: 101, name: "inventory.view", label: "查看库存", description: "查看所有库存信息和统计数据" },
      { id: 102, name: "inventory.in", label: "入库操作", description: "执行商品入库操作" },
      { id: 103, name: "inventory.out", label: "出库操作", description: "执行商品出库操作" },
      { id: 104, name: "inventory.adjust", label: "库存调整", description: "调整库存数量和状态" },
      { id: 105, name: "inventory.transfer", label: "库存转移", description: "在不同仓库间转移库存" },
    ],
  },
  {
    module: "销售管理",
    icon: "💰",
    description: "管理销售订单、客户关系等",
    permissions: [
      { id: 201, name: "sales.view", label: "查看销售", description: "查看销售数据和报表" },
      { id: 202, name: "sales.create", label: "新建销售订单", description: "创建新的销售订单" },
      { id: 203, name: "sales.edit", label: "编辑销售订单", description: "修改现有销售订单" },
      { id: 204, name: "sales.delete", label: "删除销售订单", description: "删除销售订单" },
      { id: 205, name: "sales.approve", label: "审批销售订单", description: "审批销售订单" },
    ],
  },
  {
    module: "报价管理",
    icon: "📋",
    description: "管理客户报价和审批流程",
    permissions: [
      { id: 301, name: "quote.view", label: "查看报价", description: "查看所有报价信息" },
      { id: 302, name: "quote.create", label: "创建报价", description: "为客户创建新报价" },
      { id: 303, name: "quote.edit", label: "编辑报价", description: "修改现有报价" },
      { id: 304, name: "quote.approve", label: "审批报价", description: "审批客户报价" },
      { id: 305, name: "quote.reject", label: "拒绝报价", description: "拒绝客户报价" },
    ],
  },
  {
    module: "财务管理",
    icon: "💳",
    description: "管理财务数据、账单和支付",
    permissions: [
      { id: 401, name: "finance.view", label: "查看财务", description: "查看财务报表和数据" },
      { id: 402, name: "finance.invoice", label: "开具发票", description: "为客户开具发票" },
      { id: 403, name: "finance.payment", label: "处理付款", description: "处理客户付款" },
      { id: 404, name: "finance.refund", label: "处理退款", description: "处理客户退款" },
    ],
  },
  {
    module: "用户管理",
    icon: "👥",
    description: "管理系统用户和权限",
    permissions: [
      { id: 501, name: "user.view", label: "查看用户", description: "查看系统用户列表" },
      { id: 502, name: "user.create", label: "创建用户", description: "创建新的系统用户" },
      { id: 503, name: "user.edit", label: "编辑用户", description: "修改用户信息" },
      { id: 504, name: "user.delete", label: "删除用户", description: "删除系统用户" },
      { id: 505, name: "user.permission", label: "管理权限", description: "管理用户权限配置" },
    ],
  },
  {
    module: "系统设置",
    icon: "⚙️",
    description: "系统配置和参数设置",
    permissions: [
      { id: 601, name: "system.config", label: "系统配置", description: "修改系统配置参数" },
      { id: 602, name: "system.backup", label: "数据备份", description: "执行数据备份操作" },
      { id: 603, name: "system.restore", label: "数据恢复", description: "执行数据恢复操作" },
      { id: 604, name: "system.log", label: "查看日志", description: "查看系统操作日志" },
    ],
  },
]

// 模拟用户权限数据
const mockUserPermissions: Record<number, UserPermissionData> = {
  1: {
    userId: 1,
    permissions: [
      101, 102, 103, 104, 105, 201, 202, 203, 204, 205, 301, 302, 303, 304, 305, 401, 402, 403, 404, 501, 502, 503, 504,
      505, 601, 602, 603, 604,
    ],
    lastModified: "2025-06-23T10:00:00Z",
    modifiedBy: "系统管理员",
  },
  2: {
    userId: 2,
    permissions: [101, 103, 201, 202, 203, 205, 301, 302, 303, 304],
    lastModified: "2025-06-22T15:30:00Z",
    modifiedBy: "系统管理员",
  },
  3: {
    userId: 3,
    permissions: [101, 201, 202, 301, 302],
    lastModified: "2025-06-21T09:15:00Z",
    modifiedBy: "Jane Doe",
  },
  4: {
    userId: 4,
    permissions: [401, 402, 403, 404, 201],
    lastModified: "2025-06-20T14:20:00Z",
    modifiedBy: "系统管理员",
  },
  5: {
    userId: 5,
    permissions: [101, 102, 103, 104, 105],
    lastModified: "2025-06-19T11:45:00Z",
    modifiedBy: "系统管理员",
  },
  6: {
    userId: 6,
    permissions: [101, 201, 301],
    lastModified: "2025-06-18T16:30:00Z",
    modifiedBy: "系统管理员",
  },
}

export const getUsers = async (): Promise<User[]> => {
  try {
    return await permissionApi.getUsers()
  } catch (error) {
    console.error('Error fetching users from API, falling back to mock data:', error)
    await new Promise((resolve) => setTimeout(resolve, 300))
    return [...mockUsers]
  }
}

export const getPermissionModules = async (): Promise<PermissionModule[]> => {
  try {
    return await permissionApi.getPermissionModules()
  } catch (error) {
    console.error('Error fetching permission modules from API, falling back to mock data:', error)
    await new Promise((resolve) => setTimeout(resolve, 200))
    return [...mockPermissionModules]
  }
}

export const getUserPermissions = async (userId: number): Promise<UserPermissionData | null> => {
  try {
    return await permissionApi.getUserPermissions(userId)
  } catch (error) {
    console.error('Error fetching user permissions from API, falling back to mock data:', error)
    await new Promise((resolve) => setTimeout(resolve, 200))
    return mockUserPermissions[userId] || null
  }
}

export const updateUserPermissions = async (
  userId: number,
  permissions: number[],
  modifiedBy: string,
): Promise<UserPermissionData> => {
  try {
    return await permissionApi.updateUserPermissions(userId, permissions, modifiedBy)
  } catch (error) {
    console.error('Error updating user permissions via API, falling back to mock behavior:', error)
    await new Promise((resolve) => setTimeout(resolve, 500))

    const updatedData: UserPermissionData = {
      userId,
      permissions,
      lastModified: new Date().toISOString(),
      modifiedBy,
    }

    mockUserPermissions[userId] = updatedData
    return updatedData
  }
}
