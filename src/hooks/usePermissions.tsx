import { useState, useEffect, useContext, createContext } from 'react'
import type { User, Permission } from '../lib/types/user-permission'
import { permissionApi } from '../api/permissionApi'

// 权限上下文接口
interface PermissionContextType {
  user: User | null
  permissions: string[]
  hasPermission: (permission: string) => boolean
  hasAnyPermission: (permissions: string[]) => boolean
  hasAllPermissions: (permissions: string[]) => boolean
  loading: boolean
  error: string | null
  refreshPermissions: () => Promise<void>
}

// 创建权限上下文
const PermissionContext = createContext<PermissionContextType | undefined>(undefined)

// 权限提供者组件
export const PermissionProvider: React.FC<{ 
  children: React.ReactNode
  userId?: number 
}> = ({ children, userId }) => {
  const [user, setUser] = useState<User | null>(null)
  const [permissions, setPermissions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadUserPermissions = async () => {
    if (!userId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // 获取用户信息
      const userData = await permissionApi.getUser(userId)
      setUser(userData)

      // 获取权限模块
      const modules = await permissionApi.getPermissionModules()
      
      // 获取用户权限数据
      const userPermissionData = await permissionApi.getUserPermissions(userId)
      
      // 将权限ID转换为权限名称
      const permissionNames: string[] = []
      modules.forEach(module => {
        module.permissions.forEach(permission => {
          if (userPermissionData.permissions.includes(permission.id)) {
            permissionNames.push(permission.name)
          }
        })
      })
      
      setPermissions(permissionNames)
    } catch (err) {
      console.error('Error loading user permissions:', err)
      setError('Failed to load user permissions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUserPermissions()
  }, [userId])

  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission)
  }

  const hasAnyPermission = (requiredPermissions: string[]): boolean => {
    return requiredPermissions.some(permission => permissions.includes(permission))
  }

  const hasAllPermissions = (requiredPermissions: string[]): boolean => {
    return requiredPermissions.every(permission => permissions.includes(permission))
  }

  const refreshPermissions = async () => {
    await loadUserPermissions()
  }

  const value: PermissionContextType = {
    user,
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    loading,
    error,
    refreshPermissions,
  }

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  )
}

// 使用权限的hook
export const usePermissions = (): PermissionContextType => {
  const context = useContext(PermissionContext)
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionProvider')
  }
  return context
}

// 权限检查hook - 用于特定权限检查
export const usePermissionCheck = (permission: string): boolean => {
  const { hasPermission } = usePermissions()
  return hasPermission(permission)
}

// 多权限检查hook
export const usePermissionChecks = (permissions: string[], mode: 'any' | 'all' = 'any'): boolean => {
  const { hasAnyPermission, hasAllPermissions } = usePermissions()
  return mode === 'any' ? hasAnyPermission(permissions) : hasAllPermissions(permissions)
}