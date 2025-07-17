import { api } from './client'
import type { User, PermissionModule, UserPermissionData } from '../lib/types/user-permission'

// 权限模块API接口
export interface PermissionModuleResponse {
  module: string
  icon?: string
  description?: string
  permissions: {
    id: number
    name: string
    label: string
    description?: string
  }[]
}

// 用户权限数据接口
export interface UserPermissionDataResponse {
  userId: number
  permissions: number[]
  lastModified?: string
  modifiedBy?: string
}

// 更新用户权限请求接口
export interface UpdateUserPermissionsRequest {
  permission_ids: number[]
  modified_by: string
}

// 用户API接口
export interface UserResponse {
  id: number
  username: string
  fullName: string
  email?: string
  role?: string
  isActive: boolean
  lastLogin?: string
}

// 权限管理API
export const permissionApi = {
  // 获取所有用户
  async getUsers(): Promise<User[]> {
    const response = await api.get('/users')
    return response.data.map((user: UserResponse): User => ({
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
    }))
  },

  // 获取权限模块
  async getPermissionModules(): Promise<PermissionModule[]> {
    const response = await api.get('/permissions/modules')
    return response.data.map((module: PermissionModuleResponse): PermissionModule => ({
      module: module.module,
      icon: module.icon,
      description: module.description,
      permissions: module.permissions.map(p => ({
        id: p.id,
        name: p.name,
        label: p.label,
        description: p.description,
      }))
    }))
  },

  // 获取用户权限
  async getUserPermissions(userId: number): Promise<UserPermissionData> {
    const response = await api.get(`/users/${userId}/permissions`)
    const data: UserPermissionDataResponse = response.data
    return {
      userId: data.userId,
      permissions: data.permissions,
      lastModified: data.lastModified,
      modifiedBy: data.modifiedBy,
    }
  },

  // 更新用户权限
  async updateUserPermissions(userId: number, permissions: number[], modifiedBy: string): Promise<UserPermissionData> {
    const requestData: UpdateUserPermissionsRequest = {
      permission_ids: permissions,
      modified_by: modifiedBy,
    }
    const response = await api.put(`/users/${userId}/permissions`, requestData)
    const data: UserPermissionDataResponse = response.data
    return {
      userId: data.userId,
      permissions: data.permissions,
      lastModified: data.lastModified,
      modifiedBy: data.modifiedBy,
    }
  },

  // 授予用户权限
  async grantUserPermissions(userId: number, permissionIds: number[]): Promise<void> {
    await api.post(`/users/${userId}/permissions`, {
      permission_ids: permissionIds,
    })
  },

  // 撤销用户权限
  async revokeUserPermissions(userId: number, permissionIds: number[]): Promise<void> {
    await api.delete(`/users/${userId}/permissions`, {
      data: {
        permission_ids: permissionIds,
      }
    })
  },

  // 获取单个用户信息
  async getUser(userId: number): Promise<User> {
    const response = await api.get(`/users/${userId}`)
    const user: UserResponse = response.data
    return {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
    }
  },

  // 创建用户
  async createUser(userData: {
    username: string
    email: string
    password: string
    role_names: string[]
  }): Promise<User> {
    const response = await api.post('/users', userData)
    const user: UserResponse = response.data
    return {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
    }
  },

  // 更新用户信息
  async updateUser(userId: number, userData: {
    email?: string
    password?: string
  }): Promise<User> {
    const response = await api.put(`/users/${userId}`, userData)
    const user: UserResponse = response.data
    return {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
    }
  },

  // 删除用户
  async deleteUser(userId: number): Promise<void> {
    await api.delete(`/users/${userId}`)
  },
}