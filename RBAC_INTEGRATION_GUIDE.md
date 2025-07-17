# RBAC权限系统集成指南

## 概述

本项目已成功集成了完整的RBAC（基于角色的访问控制）权限管理系统，支持前后端分离的权限验证和管理。

## 🔧 技术架构

### 后端 (Go)
- **模型层**: `internal/model/rbac/` - 用户、角色、权限模型
- **仓库层**: `internal/repository/user.go`, `internal/repository/permission.go` - 数据访问
- **服务层**: `internal/service/user.go` - 业务逻辑
- **处理层**: `internal/handler/user.go`, `internal/handler/permission.go` - API接口

### 前端 (React + TypeScript)
- **API客户端**: `src/api/permissionApi.ts` - 后端接口调用
- **类型定义**: `src/lib/types/user-permission.ts` - TypeScript类型
- **服务层**: `src/lib/services/user-permission-service.ts` - 业务逻辑封装
- **权限组件**: `src/components/PermissionGate.tsx` - 权限控制组件
- **权限Hooks**: `src/hooks/usePermissions.ts` - React权限hooks
- **管理界面**: `src/features/setting/Rbac.tsx` - 权限管理页面

## 📋 权限模块

### 库存管理 (inventory)
- `inventory.view` - 查看库存
- `inventory.in` - 入库操作
- `inventory.out` - 出库操作
- `inventory.adjust` - 库存调整
- `inventory.transfer` - 库存转移

### 销售管理 (sales)
- `sales.view` - 查看销售
- `sales.create` - 新建销售订单
- `sales.edit` - 编辑销售订单
- `sales.delete` - 删除销售订单
- `sales.approve` - 审批销售订单

### 报价管理 (quote)
- `quote.view` - 查看报价
- `quote.create` - 创建报价
- `quote.edit` - 编辑报价
- `quote.approve` - 审批报价
- `quote.reject` - 拒绝报价

### 财务管理 (finance)
- `finance.view` - 查看财务
- `finance.invoice` - 开具发票
- `finance.payment` - 处理付款
- `finance.refund` - 处理退款

### 用户管理 (user)
- `user.view` - 查看用户
- `user.create` - 创建用户
- `user.edit` - 编辑用户
- `user.delete` - 删除用户
- `user.permission` - 管理权限

### 系统设置 (system)
- `system.config` - 系统配置
- `system.backup` - 数据备份
- `system.restore` - 数据恢复
- `system.log` - 查看日志

## 🚀 使用方法

### 1. 权限Provider设置

```tsx
import { PermissionProvider } from './hooks/usePermissions'

function App() {
  const currentUserId = 1 // 从认证系统获取

  return (
    <PermissionProvider userId={currentUserId}>
      {/* 你的应用组件 */}
    </PermissionProvider>
  )
}
```

### 2. 权限门组件使用

```tsx
import { PermissionGate } from './components/PermissionGate'

// 单一权限检查
<PermissionGate permission="sales.edit">
  <button>编辑订单</button>
</PermissionGate>

// 多权限检查 (任一)
<PermissionGate permissions={['sales.edit', 'sales.delete']} mode="any">
  <div>编辑或删除功能</div>
</PermissionGate>

// 多权限检查 (全部)
<PermissionGate permissions={['sales.view', 'sales.edit']} mode="all">
  <div>需要同时有查看和编辑权限</div>
</PermissionGate>

// 自定义无权限显示
<PermissionGate 
  permission="admin.access"
  fallback={<div>您没有管理员权限</div>}
  hideOnNoAccess={false}
>
  <AdminPanel />
</PermissionGate>
```

### 3. 权限按钮使用

```tsx
import { PermissionButton } from './components/PermissionGate'

<PermissionButton 
  permission="sales.create"
  className="btn btn-primary"
  onClick={handleCreateOrder}
>
  创建订单
</PermissionButton>

// 无权限时隐藏
<PermissionButton 
  permission="admin.delete"
  hideOnNoAccess={true}
  className="btn btn-danger"
>
  危险操作
</PermissionButton>
```

### 4. 权限Hooks使用

```tsx
import { usePermissions, usePermissionCheck, usePermissionChecks } from './hooks/usePermissions'

function MyComponent() {
  const { user, permissions, hasPermission, loading } = usePermissions()
  
  // 检查单一权限
  const canEdit = usePermissionCheck('sales.edit')
  
  // 检查多权限
  const canManage = usePermissionChecks(['sales.edit', 'sales.delete'], 'any')

  if (loading) return <div>加载中...</div>

  return (
    <div>
      <h1>欢迎, {user?.fullName}</h1>
      {canEdit && <button>编辑</button>}
      {canManage && <button>管理</button>}
    </div>
  )
}
```

### 5. API调用示例

```tsx
import { permissionApi } from './api/permissionApi'

// 获取用户列表
const users = await permissionApi.getUsers()

// 获取权限模块
const modules = await permissionApi.getPermissionModules()

// 获取用户权限
const userPermissions = await permissionApi.getUserPermissions(userId)

// 更新用户权限
await permissionApi.updateUserPermissions(userId, [101, 102, 103], 'Admin')
```

## 🔗 API接口

### 用户管理
- `GET /users` - 获取用户列表
- `GET /users/:id` - 获取用户详情
- `POST /users` - 创建用户
- `PUT /users/:id` - 更新用户
- `DELETE /users/:id` - 删除用户

### 权限管理
- `GET /permissions/modules` - 获取权限模块
- `GET /users/:id/permissions` - 获取用户权限
- `PUT /users/:id/permissions` - 更新用户权限
- `POST /users/:id/permissions` - 授予用户权限
- `DELETE /users/:id/permissions` - 撤销用户权限

## 🛡️ 安全特性

### 前端安全
- 组件级权限控制
- 路由级权限保护
- 按钮/链接权限控制
- 权限状态实时更新

### 后端安全
- 数据库事务保证数据一致性
- 权限验证中间件
- 操作审计日志
- 角色继承和直接权限支持

## 📊 权限管理界面

访问 `/settings/rbac` 可以进入权限管理界面，支持：
- 用户列表和搜索
- 权限模块可视化
- 权限批量分配
- 权限修改历史
- 实时权限统计

## 🔍 故障排除

### 1. API连接问题
如果看到"使用模拟数据"提示，说明前端无法连接到后端API：
- 检查后端服务是否启动
- 确认API端点配置正确
- 检查CORS设置

### 2. 权限不生效
- 确认用户已正确登录
- 检查权限Provider是否正确设置userId
- 验证后端权限数据是否正确

### 3. 组件不显示
- 检查权限名称是否正确
- 确认组件是否在PermissionProvider内部
- 查看浏览器控制台错误信息

## 📈 扩展指南

### 添加新权限模块
1. 在后端`permission_modules_config.go`中添加新模块
2. 在数据库中插入对应权限记录
3. 前端会自动获取新权限模块

### 自定义权限组件
```tsx
import { usePermissions } from './hooks/usePermissions'

const CustomPermissionComponent = ({ children, permission }) => {
  const { hasPermission } = usePermissions()
  
  if (!hasPermission(permission)) {
    return <div>权限不足</div>
  }
  
  return children
}
```

### 权限中间件集成
在路由层面集成权限检查：
```tsx
import { PermissionProvider } from './hooks/usePermissions'
import { ProtectedRoute } from './components/ProtectedRoute'

<Route 
  path="/admin" 
  element={
    <ProtectedRoute permission="admin.access">
      <AdminPage />
    </ProtectedRoute>
  } 
/>
```

## 📝 开发建议

1. **权限粒度**: 合理设计权限粒度，避免过细或过粗
2. **命名规范**: 使用模块.操作的命名格式
3. **缓存策略**: 合理缓存权限数据，减少API调用
4. **错误处理**: 提供友好的权限错误提示
5. **测试覆盖**: 编写权限相关的单元测试和集成测试

## 🎯 最佳实践

1. **最小权限原则**: 默认不授予权限，按需分配
2. **权限分层**: 使用角色管理常见权限组合
3. **审计追踪**: 记录所有权限变更操作
4. **定期审查**: 定期审查用户权限，移除不必要权限
5. **文档维护**: 保持权限文档的及时更新

---

通过以上集成，你的应用现在具备了完整的RBAC权限管理能力，支持细粒度的功能控制和灵活的权限分配。