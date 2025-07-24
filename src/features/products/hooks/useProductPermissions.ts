import { useAppSelector } from '@/app/hooks'

export interface ProductPermissions {
  canViewProducts: boolean
  canCreateProduct: boolean
  canEditProduct: boolean
  canDeleteProduct: boolean
  canManageStatus: boolean  // 管理产品状态的权限
  canViewFinancial: boolean // 查看财务信息的权限
}

export const useProductPermissions = (): ProductPermissions => {
  const { user } = useAppSelector(state => state.auth)
  
  // 从用户权限中检查
  const permissions = user?.permissions || []
  const userRoles = user?.roles || []
  
  // 检查是否为管理员角色
  const isAdmin = userRoles.some(role => 
    role.toLowerCase().includes('admin') || 
    role.toLowerCase().includes('manager')
  )
  
  return {
    canViewProducts: permissions.includes('products.view') || permissions.includes('products.*'),
    canCreateProduct: permissions.includes('products.create') || permissions.includes('products.*'),
    canEditProduct: permissions.includes('products.edit') || permissions.includes('products.*'),
    canDeleteProduct: isAdmin || permissions.includes('products.delete') || permissions.includes('products.*'),
    canManageStatus: isAdmin || permissions.includes('products.manage_status') || permissions.includes('products.*'),
    canViewFinancial: permissions.includes('products.view_financial') || permissions.includes('products.*'),
  }
}

// 简化的权限检查Hook，用于快速判断是否为管理员
export const useIsProductAdmin = (): boolean => {
  const permissions = useProductPermissions()
  return permissions.canManageStatus && permissions.canDeleteProduct
}