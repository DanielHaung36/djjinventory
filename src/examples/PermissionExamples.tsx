import React from 'react'
import { PermissionGate, PermissionButton, PermissionLink } from '../components/PermissionGate'
import { usePermissions, usePermissionCheck, usePermissionChecks } from '../hooks/usePermissions.tsx'

/**
 * 权限系统使用示例
 * 这个组件展示了如何在应用中使用权限控制
 */
export const PermissionExamples: React.FC = () => {
  const { user, permissions, loading } = usePermissions()
  
  // 使用权限检查hooks
  const canViewSales = usePermissionCheck('sales.view')
  const canEditOrDelete = usePermissionChecks(['sales.edit', 'sales.delete'], 'any')
  const canManageUsers = usePermissionCheck('user.permission')

  if (loading) {
    return <div>加载权限信息中...</div>
  }

  return (
    <div className="p-6 space-y-8">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h2 className="text-xl font-bold mb-4">当前用户权限信息</h2>
        <p><strong>用户:</strong> {user?.fullName || '未登录'}</p>
        <p><strong>角色:</strong> {user?.role || '无'}</p>
        <p><strong>权限数量:</strong> {permissions.length}</p>
        <details className="mt-2">
          <summary className="cursor-pointer font-medium">查看所有权限</summary>
          <ul className="mt-2 text-sm text-gray-600">
            {permissions.map(permission => (
              <li key={permission}>• {permission}</li>
            ))}
          </ul>
        </details>
      </div>

      {/* 权限门组件示例 */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">权限门组件 (PermissionGate)</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-medium mb-2">单一权限检查</h3>
            <PermissionGate permission="sales.view">
              <div className="p-3 bg-green-100 text-green-800 rounded">
                ✓ 您有查看销售数据的权限
              </div>
            </PermissionGate>
            <PermissionGate 
              permission="sales.view" 
              fallback={
                <div className="p-3 bg-red-100 text-red-800 rounded">
                  ✗ 您没有查看销售数据的权限
                </div>
              }
              hideOnNoAccess={false}
            />
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-medium mb-2">多权限检查 (任一)</h3>
            <PermissionGate permissions={['sales.edit', 'sales.delete']} mode="any">
              <div className="p-3 bg-green-100 text-green-800 rounded">
                ✓ 您有编辑或删除销售数据的权限
              </div>
            </PermissionGate>
            <PermissionGate 
              permissions={['sales.edit', 'sales.delete']} 
              mode="any"
              fallback={
                <div className="p-3 bg-red-100 text-red-800 rounded">
                  ✗ 您没有编辑或删除销售数据的权限
                </div>
              }
              hideOnNoAccess={false}
            />
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-medium mb-2">多权限检查 (全部)</h3>
            <PermissionGate permissions={['sales.view', 'sales.edit']} mode="all">
              <div className="p-3 bg-green-100 text-green-800 rounded">
                ✓ 您同时拥有查看和编辑销售数据的权限
              </div>
            </PermissionGate>
            <PermissionGate 
              permissions={['sales.view', 'sales.edit']} 
              mode="all"
              fallback={
                <div className="p-3 bg-red-100 text-red-800 rounded">
                  ✗ 您不能同时拥有查看和编辑销售数据的权限
                </div>
              }
              hideOnNoAccess={false}
            />
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-medium mb-2">管理员权限</h3>
            <PermissionGate permission="user.permission">
              <div className="p-3 bg-purple-100 text-purple-800 rounded">
                ✓ 您有用户权限管理权限
              </div>
            </PermissionGate>
            <PermissionGate 
              permission="user.permission" 
              fallback={
                <div className="p-3 bg-gray-100 text-gray-800 rounded">
                  ✗ 您没有用户权限管理权限
                </div>
              }
              hideOnNoAccess={false}
            />
          </div>
        </div>
      </div>

      {/* 权限按钮示例 */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">权限按钮组件 (PermissionButton)</h2>
        
        <div className="flex flex-wrap gap-4">
          <PermissionButton 
            permission="sales.create"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
          >
            创建销售订单
          </PermissionButton>

          <PermissionButton 
            permission="sales.edit"
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300"
          >
            编辑销售订单
          </PermissionButton>

          <PermissionButton 
            permission="sales.delete"
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-300"
          >
            删除销售订单
          </PermissionButton>

          <PermissionButton 
            permission="user.permission"
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-300"
          >
            管理用户权限
          </PermissionButton>

          {/* 隐藏模式 */}
          <PermissionButton 
            permission="admin.super"
            hideOnNoAccess={true}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
          >
            超级管理员功能 (无权限时隐藏)
          </PermissionButton>
        </div>
      </div>

      {/* 权限链接示例 */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">权限链接组件 (PermissionLink)</h2>
        
        <div className="flex flex-wrap gap-4">
          <PermissionLink 
            permission="sales.view"
            href="/sales"
            className="text-blue-500 hover:text-blue-700 underline"
          >
            查看销售数据
          </PermissionLink>

          <PermissionLink 
            permission="inventory.view"
            href="/inventory"
            className="text-green-500 hover:text-green-700 underline"
          >
            查看库存数据
          </PermissionLink>

          <PermissionLink 
            permission="user.permission"
            href="/admin/permissions"
            className="text-purple-500 hover:text-purple-700 underline"
          >
            用户权限管理
          </PermissionLink>

          <PermissionLink 
            permission="admin.super"
            href="/admin"
            hideOnNoAccess={true}
            className="text-red-500 hover:text-red-700 underline"
          >
            超级管理员面板 (无权限时隐藏)
          </PermissionLink>
        </div>
      </div>

      {/* Hook使用示例 */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">权限Hook使用示例</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-medium mb-2">usePermissionCheck</h3>
            <p className="text-sm text-gray-600 mb-2">检查单一权限</p>
            <div className={`p-2 rounded text-sm ${canViewSales ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              sales.view: {canViewSales ? '✓' : '✗'}
            </div>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-medium mb-2">usePermissionChecks (any)</h3>
            <p className="text-sm text-gray-600 mb-2">检查多权限 (任一)</p>
            <div className={`p-2 rounded text-sm ${canEditOrDelete ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              edit OR delete: {canEditOrDelete ? '✓' : '✗'}
            </div>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-medium mb-2">usePermissionCheck</h3>
            <p className="text-sm text-gray-600 mb-2">管理员权限</p>
            <div className={`p-2 rounded text-sm ${canManageUsers ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              user.permission: {canManageUsers ? '✓' : '✗'}
            </div>
          </div>
        </div>
      </div>

      {/* 实际应用场景示例 */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">实际应用场景示例</h2>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium mb-3">销售订单管理界面</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-white rounded border">
              <span>订单 #ORD-001</span>
              <div className="flex gap-2">
                <PermissionButton 
                  permission="sales.view"
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
                >
                  查看
                </PermissionButton>
                <PermissionButton 
                  permission="sales.edit"
                  className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300"
                >
                  编辑
                </PermissionButton>
                <PermissionButton 
                  permission="sales.delete"
                  className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-300"
                >
                  删除
                </PermissionButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PermissionExamples