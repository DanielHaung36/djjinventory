import { api } from './client'

// 完全匹配后端的User结构
export interface User {
  id: number
  version: number
  username: string
  store_id: number
  email: string
  // password_hash 不返回给前端
  first_name: string
  last_name: string
  contact: string
  address1: string
  address2: string
  is_deleted: boolean
  created_at: string
  updated_at: string
  last_login_at?: string
  is_active: boolean
  // deleted_at 不返回给前端
  roles?: Role[]
  direct_permissions?: Permission[]
  permissions?: Permission[]
  avatar_url: string
}

export interface CreateUserRequest {
  username: string
  email: string
  password: string
  firstName?: string      // 前端保持驼峰，发送时转换
  lastName?: string
  contact?: string
  roleIds: number[]
  address1?: string
  address2?: string
  storeId?: number        // 前端保持驼峰，发送时转换
  permissionIds?: number[]
}

export interface UpdateUserRequest {
  email?: string
  password?: string
  firstName?: string      // 前端保持驼峰，发送时转换
  lastName?: string
  contact?: string
  roleIds?: number[]
  address1?: string
  address2?: string
  storeId?: number        // 前端保持驼峰，发送时转换
  permissionIds?: number[]
  isActive?: boolean      // 前端保持驼峰，发送时转换
}

export interface UserListResponse {
  users: User[]
  total: number
  page: number
  limit: number
}

// 角色接口
export interface Role {
  id: number
  name: string
  label: string
  description?: string
  permissions?: Permission[]
}

// 权限接口
export interface Permission {
  id: number
  name: string
  label: string
  description?: string
  module: string
}

// 门店接口
export interface Store {
  id: number
  name: string
  address: string
  regionId?: number
  isActive: boolean
}

// 权限模块接口
export interface PermissionModule {
  id: number
  name: string
  label: string
  permissions: Permission[]
}

// 前端友好的User类型（用于显示）
export interface UserDisplay {
  id: number
  version: number
  username: string
  storeId: number
  email: string
  firstName: string
  lastName: string
  contact: string
  address1: string
  address2: string
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  lastLoginAt?: string
  isActive: boolean
  roles?: Role[]
  directPermissions?: Permission[]
  permissions?: Permission[]
  avatarUrl: string
}

// 辅助函数：将后端User转换为前端友好的UserDisplay
export const toUserDisplay = (user: User): UserDisplay => ({
  id: user.id,
  version: user.version,
  username: user.username,
  storeId: user.store_id,
  email: user.email,
  firstName: user.first_name,
  lastName: user.last_name,
  contact: user.contact,
  address1: user.address1,
  address2: user.address2,
  isDeleted: user.is_deleted,
  createdAt: user.created_at,
  updatedAt: user.updated_at,
  lastLoginAt: user.last_login_at,
  isActive: user.is_active,
  roles: user.roles,
  directPermissions: user.direct_permissions,
  permissions: user.permissions,
  avatarUrl: user.avatar_url
})

// 辅助函数：将camelCase转换为snake_case
const toSnakeCase = (obj: any): any => {
  if (obj === null || obj === undefined) return obj
  if (obj instanceof Date) return obj
  if (Array.isArray(obj)) return obj.map(toSnakeCase)
  if (typeof obj !== 'object') return obj
  
  return Object.keys(obj).reduce((acc, key) => {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
    acc[snakeKey] = toSnakeCase(obj[key])
    return acc
  }, {} as any)
}

// 辅助函数：将snake_case转换为camelCase（用于显示）
const toCamelCase = (obj: any): any => {
  if (obj === null || obj === undefined) return obj
  if (obj instanceof Date) return obj
  if (Array.isArray(obj)) return obj.map(toCamelCase)
  if (typeof obj !== 'object') return obj
  
  return Object.keys(obj).reduce((acc, key) => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
    acc[camelKey] = toCamelCase(obj[key])
    return acc
  }, {} as any)
}

export const userApi = {
  // 获取用户列表
  async getUsers(page = 1, limit = 10): Promise<UserListResponse> {
    const response = await api.get(`/users?page=${page}&limit=${limit}`)
    return response.data
  },

  // 获取单个用户
  async getUser(id: number): Promise<User> {
    const response = await api.get(`/users/${id}`)
    return response.data
  },

  // 创建用户
  async createUser(userData: CreateUserRequest): Promise<User> {
    const response = await api.post('/users', userData)
    return response.data
  },

  // 更新用户
  async updateUser(id: number, userData: UpdateUserRequest): Promise<User> {
    const response = await api.put(`/users/${id}`, userData)
    return response.data
  },

  // 删除用户
  async deleteUser(id: number): Promise<void> {
    await api.delete(`/users/${id}`)
  },

  // 批量删除用户
  async deleteUsers(ids: number[]): Promise<void> {
    await api.post('/users/batch-delete', { ids })
  },

  // 搜索用户
  async searchUsers(query: string, page = 1, limit = 10): Promise<UserListResponse> {
    const response = await api.get(`/users/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`)
    return response.data
  },

  // 获取角色列表
  async getRoles(): Promise<Role[]> {
    const response = await api.get('/roles')
    return response.data
  },

  // 获取权限模块列表
  async getPermissionModules(): Promise<PermissionModule[]> {
    const response = await api.get('/permissions/modules')
    return response.data
  },

  // 获取门店列表
  async getStores(): Promise<Store[]> {
    const response = await api.get('/stores')
    return response.data
  },

  // 获取用户权限
  async getUserPermissions(userId: number): Promise<Permission[]> {
    const response = await api.get(`/users/${userId}/permissions`)
    return response.data
  },

  // 更新用户权限
  async updateUserPermissions(userId: number, permissionIds: number[]): Promise<void> {
    await api.put(`/users/${userId}/permissions`, { permissionIds })
  },

  // 分配角色给用户
  async assignRoles(userId: number, roleIds: number[]): Promise<void> {
    await api.post(`/users/${userId}/roles`, { roleIds })
  },

  // 移除用户角色
  async removeRoles(userId: number, roleIds: number[]): Promise<void> {
    await api.delete(`/users/${userId}/roles`, { data: { roleIds } })
  }
}