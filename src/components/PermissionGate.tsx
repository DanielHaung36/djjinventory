import React from 'react'
import { usePermissions } from '../hooks/usePermissions.tsx'

interface PermissionGateProps {
  children: React.ReactNode
  permission?: string
  permissions?: string[]
  mode?: 'any' | 'all'
  fallback?: React.ReactNode
  hideOnNoAccess?: boolean
}

/**
 * 权限门组件 - 根据用户权限控制组件渲染
 * @param children 要保护的子组件
 * @param permission 单个权限名称
 * @param permissions 多个权限名称数组
 * @param mode 多权限检查模式：'any' 任一权限 | 'all' 全部权限
 * @param fallback 无权限时显示的组件
 * @param hideOnNoAccess 无权限时是否完全隐藏（默认true）
 */
export const PermissionGate: React.FC<PermissionGateProps> = ({
  children,
  permission,
  permissions,
  mode = 'any',
  fallback,
  hideOnNoAccess = true,
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, loading } = usePermissions()

  // 加载中时不渲染
  if (loading) {
    return null
  }

  let hasAccess = false

  // 检查单个权限
  if (permission) {
    hasAccess = hasPermission(permission)
  }
  // 检查多个权限
  else if (permissions && permissions.length > 0) {
    hasAccess = mode === 'any' 
      ? hasAnyPermission(permissions)
      : hasAllPermissions(permissions)
  }
  // 没有指定权限则默认有权限
  else {
    hasAccess = true
  }

  // 有权限时渲染子组件
  if (hasAccess) {
    return <>{children}</>
  }

  // 无权限时的处理
  if (hideOnNoAccess) {
    return null
  }

  // 显示fallback组件或默认无权限提示
  return (
    <>
      {fallback || (
        <div className="text-gray-500 text-sm italic">
          您没有权限访问此功能
        </div>
      )}
    </>
  )
}

/**
 * 权限按钮组件 - 根据权限控制按钮可用性
 */
interface PermissionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  permission?: string
  permissions?: string[]
  mode?: 'any' | 'all'
  hideOnNoAccess?: boolean
  disableOnNoAccess?: boolean
}

export const PermissionButton: React.FC<PermissionButtonProps> = ({
  permission,
  permissions,
  mode = 'any',
  hideOnNoAccess = false,
  disableOnNoAccess = true,
  children,
  disabled,
  ...props
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, loading } = usePermissions()

  // 加载中时禁用
  if (loading) {
    return (
      <button {...props} disabled={true}>
        {children}
      </button>
    )
  }

  let hasAccess = false

  // 检查权限
  if (permission) {
    hasAccess = hasPermission(permission)
  } else if (permissions && permissions.length > 0) {
    hasAccess = mode === 'any' 
      ? hasAnyPermission(permissions)
      : hasAllPermissions(permissions)
  } else {
    hasAccess = true
  }

  // 无权限且需要隐藏
  if (!hasAccess && hideOnNoAccess) {
    return null
  }

  // 无权限且需要禁用
  const isDisabled = disabled || (!hasAccess && disableOnNoAccess)

  return (
    <button {...props} disabled={isDisabled}>
      {children}
    </button>
  )
}

/**
 * 权限链接组件 - 根据权限控制链接可用性
 */
interface PermissionLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  permission?: string
  permissions?: string[]
  mode?: 'any' | 'all'
  hideOnNoAccess?: boolean
  disableOnNoAccess?: boolean
}

export const PermissionLink: React.FC<PermissionLinkProps> = ({
  permission,
  permissions,
  mode = 'any',
  hideOnNoAccess = false,
  disableOnNoAccess = true,
  children,
  className,
  onClick,
  ...props
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, loading } = usePermissions()

  if (loading) {
    return <span className={className}>{children}</span>
  }

  let hasAccess = false

  if (permission) {
    hasAccess = hasPermission(permission)
  } else if (permissions && permissions.length > 0) {
    hasAccess = mode === 'any' 
      ? hasAnyPermission(permissions)
      : hasAllPermissions(permissions)
  } else {
    hasAccess = true
  }

  if (!hasAccess && hideOnNoAccess) {
    return null
  }

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!hasAccess && disableOnNoAccess) {
      e.preventDefault()
      return
    }
    onClick?.(e)
  }

  const linkClassName = !hasAccess && disableOnNoAccess
    ? `${className} cursor-not-allowed opacity-50`
    : className

  return (
    <a {...props} className={linkClassName} onClick={handleClick}>
      {children}
    </a>
  )
}

export default PermissionGate