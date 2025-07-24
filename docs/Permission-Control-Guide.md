# 前端权限控制使用指南

## 📋 目录

- [概述](#概述)
- [权限Hook使用](#权限hook使用)
- [UI组件权限控制](#ui组件权限控制)
- [路由权限保护](#路由权限保护)
- [API权限处理](#api权限处理)
- [最佳实践](#最佳实践)
- [常见问题](#常见问题)

## 📖 概述

DJJ库存管理系统前端采用基于Hook的权限控制模式，通过 `useProductPermissions` 等权限Hook来实现精细化的UI权限控制。本指南将详细介绍如何在前端应用中正确使用权限控制功能。

### 🎯 权限控制原则

1. **UI层权限**: 根据用户权限动态显示/隐藏UI元素
2. **功能层权限**: 禁用用户无权访问的功能按钮
3. **数据层权限**: 根据权限过滤显示的数据内容
4. **路由层权限**: 保护用户无权访问的页面路由

## 🔧 权限Hook使用

### useProductPermissions Hook

#### 基本用法
```tsx
import { useProductPermissions } from '@/features/products/hooks/useProductPermissions'

function ProductComponent() {
  const permissions = useProductPermissions()
  
  return (
    <div>
      {permissions.canViewProducts && <ProductList />}
      {permissions.canCreateProduct && <CreateButton />}
      {permissions.canEditProduct && <EditButton />}
      {permissions.canDeleteProduct && <DeleteButton />}
    </div>
  )
}
```

#### 权限接口定义
```typescript
export interface ProductPermissions {
  canViewProducts: boolean      // 是否可以查看产品
  canCreateProduct: boolean     // 是否可以创建产品
  canEditProduct: boolean       // 是否可以编辑产品
  canDeleteProduct: boolean     // 是否可以删除产品
  canManageStatus: boolean      // 是否可以管理产品状态
  canViewFinancial: boolean     // 是否可以查看财务信息
}
```

#### 权限检查逻辑
```typescript
export const useProductPermissions = (): ProductPermissions => {
  const { user } = useAppSelector(state => state.auth)
  
  const permissions = user?.permissions || []
  const userRoles = user?.roles || []
  
  // 检查管理员身份
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
```

### useIsProductAdmin Hook

用于快速判断用户是否为产品管理员：

```tsx
import { useIsProductAdmin } from '@/features/products/hooks/useProductPermissions'

function AdminPanel() {
  const isAdmin = useIsProductAdmin()
  
  if (!isAdmin) {
    return <div>Access Denied</div>
  }
  
  return <AdminDashboard />
}
```

## 🎨 UI组件权限控制

### 1. 条件渲染

#### 财务字段显示控制
```tsx
function ProductForm() {
  const permissions = useProductPermissions()
  
  return (
    <form>
      {/* 基础字段 - 所有有查看权限的用户都能看到 */}
      <Input label="Product Name" {...nameProps} />
      <Input label="Description" {...descProps} />
      
      {/* 财务字段 - 只有财务权限的用户能看到 */}
      {permissions.canViewFinancial && (
        <>
          <Input 
            label="RRP Price (Exc. GST)" 
            type="number"
            {...priceProps}
          />
          <Input 
            label="Profit Margin" 
            type="number"
            {...marginProps}
          />
        </>
      )}
    </form>
  )
}
```

#### 操作按钮显示控制
```tsx
function ProductActions({ product }) {
  const permissions = useProductPermissions()
  
  return (
    <div className="flex gap-2">
      {/* 查看按钮 - 所有用户都能看到 */}
      <Button variant="outline" onClick={handleView}>
        <Eye className="h-4 w-4" />
        View
      </Button>
      
      {/* 编辑按钮 - 有编辑权限才显示 */}
      {permissions.canEditProduct && (
        <Button onClick={handleEdit}>
          <Edit className="h-4 w-4" />
          Edit
        </Button>
      )}
      
      {/* 删除按钮 - 只有管理员才显示 */}
      {permissions.canDeleteProduct && (
        <DeleteConfirmDialog onConfirm={handleDelete}>
          <Button variant="destructive">
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </DeleteConfirmDialog>
      )}
    </div>
  )
}
```

### 2. 字段禁用控制

#### 状态字段管理员控制
```tsx
function ProductStatusField() {
  const permissions = useProductPermissions()
  
  return (
    <div className="space-y-2">
      <Label htmlFor="status">
        Status {!permissions.canManageStatus && "(Read-only)"}
      </Label>
      <Select
        value={status}
        onValueChange={setStatus}
        disabled={!permissions.canManageStatus}
      >
        <SelectTrigger 
          className={`h-10 ${!permissions.canManageStatus ? 'bg-gray-50 cursor-not-allowed' : ''}`}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="draft">Draft</SelectItem>
          <SelectItem value="published">Published</SelectItem>
        </SelectContent>
      </Select>
      {!permissions.canManageStatus && (
        <p className="text-xs text-gray-500 mt-1">
          Only administrators can modify product status
        </p>
      )}
    </div>
  )
}
```

### 3. 列表数据过滤

#### 表格列的条件显示
```tsx
function ProductTable() {
  const permissions = useProductPermissions()
  
  const columns = [
    { key: 'name', label: 'Product Name' },
    { key: 'category', label: 'Category' },
    { key: 'supplier', label: 'Supplier' },
    { key: 'status', label: 'Status' },
    // 财务列只有权限用户才能看到
    ...(permissions.canViewFinancial ? [
      { key: 'price', label: 'Price', format: 'currency' },
      { key: 'profit_margin', label: 'Profit Margin', format: 'percentage' }
    ] : []),
    { key: 'actions', label: 'Actions' }
  ]
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map(col => (
            <TableHead key={col.key}>{col.label}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map(product => (
          <TableRow key={product.id}>
            {columns.map(col => (
              <TableCell key={col.key}>
                {renderCellContent(product, col)}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

### 4. 下拉菜单权限控制

```tsx
function ProductDropdownMenu({ product }) {
  const permissions = useProductPermissions()
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {/* 查看详情 - 所有用户 */}
        <DropdownMenuItem onClick={handleView}>
          <Eye className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>
        
        {/* 编辑 - 有编辑权限的用户 */}
        {permissions.canEditProduct && (
          <DropdownMenuItem onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
        )}
        
        {/* 删除 - 只有管理员 */}
        {permissions.canDeleteProduct && (
          <DeleteConfirmDialog onConfirm={handleDelete}>
            <DropdownMenuItem 
              className="text-red-600 cursor-pointer"
              onSelect={(e) => e.preventDefault()}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DeleteConfirmDialog>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

## 🛡️ 路由权限保护

### RequireAuth 组件

```tsx
// components/auth/RequireAuth.tsx
interface RequireAuthProps {
  children: React.ReactNode
  permission?: string
  fallback?: React.ReactNode
}

export function RequireAuth({ children, permission, fallback }: RequireAuthProps) {
  const { user, isAuthenticated } = useAppSelector(state => state.auth)
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  if (permission && !hasPermission(user, permission)) {
    return fallback || <AccessDenied />
  }
  
  return <>{children}</>
}

function hasPermission(user: any, permission: string): boolean {
  const permissions = user?.permissions || []
  return permissions.includes(permission) || permissions.includes(permission.split('.')[0] + '.*')
}
```

### 路由配置

```tsx
// routes/index.tsx
export const router = createBrowserRouter([
  {
    path: "/",
    element: <RequireAuth><AppLayout /></RequireAuth>,
    children: [
      {
        path: "products",
        element: (
          <RequireAuth permission="products.view">
            <ProductManagement />
          </RequireAuth>
        )
      },
      {
        path: "products/create",
        element: (
          <RequireAuth permission="products.create">
            <CreateProduct />
          </RequireAuth>
        )
      },
      {
        path: "users",
        element: (
          <RequireAuth permission="users.view">
            <UserManagement />
          </RequireAuth>
        )
      }
    ]
  }
])
```

## 🔌 API权限处理

### RTK Query权限集成

```tsx
// api/productsApi.ts
export const productsApi = createApi({
  reducerPath: 'productsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/products',
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
      const user = (getState() as RootState).auth.user
      if (user?.token) {
        headers.set('authorization', `Bearer ${user.token}`)
      }
      return headers
    },
  }),
  endpoints: (builder) => ({
    getProducts: builder.query<ProductResponse, ProductParams>({
      query: (params) => ({
        url: '/',
        params,
      }),
      // 根据用户权限过滤返回数据
      transformResponse: (response: any, meta, arg) => {
        const state = store.getState() as RootState
        const permissions = useProductPermissions()
        
        if (!permissions.canViewFinancial) {
          // 移除财务字段
          response.products = response.products.map(product => ({
            ...product,
            price: undefined,
            profit_margin: undefined,
          }))
        }
        
        return response
      },
    }),
  }),
})
```

### 错误处理

```tsx
// hooks/useApiErrorHandler.ts
export function useApiErrorHandler() {
  const navigate = useNavigate()
  const { toast } = useToast()
  
  const handleApiError = useCallback((error: any) => {
    if (error.status === 403) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to perform this action.",
        variant: "destructive",
      })
    } else if (error.status === 401) {
      navigate('/login')
    } else {
      toast({
        title: "Error",
        description: error.data?.message || "An unexpected error occurred.",
        variant: "destructive",
      })
    }
  }, [navigate, toast])
  
  return { handleApiError }
}
```

## 📚 最佳实践

### 1. 权限检查模式

✅ **推荐做法**:
```tsx
// 使用专门的权限Hook
const permissions = useProductPermissions()
if (permissions.canViewFinancial) {
  // 显示财务数据
}
```

❌ **不推荐做法**:
```tsx
// 直接检查用户角色
const { user } = useAppSelector(state => state.auth)
if (user.roles.includes('admin')) {
  // 硬编码角色检查
}
```

### 2. UI反馈模式

✅ **推荐做法**:
```tsx
// 提供清晰的权限提示
{!permissions.canEdit && (
  <p className="text-sm text-gray-500">
    Contact your administrator to request edit permissions.
  </p>
)}
```

❌ **不推荐做法**:
```tsx
// 完全隐藏，用户不知道为什么看不到
{permissions.canEdit && <EditButton />}
```

### 3. 性能优化

✅ **推荐做法**:
```tsx
// 使用useMemo缓存权限计算
const permissions = useMemo(() => ({
  canView: hasPermission('products.view'),
  canEdit: hasPermission('products.edit'),
}), [user.permissions])
```

### 4. 组件设计

✅ **推荐做法**:
```tsx
// 组件内部处理权限逻辑
function ProductCard({ product }) {
  const permissions = useProductPermissions()
  
  return (
    <Card>
      <CardContent>
        {permissions.canViewFinancial ? (
          <PriceDisplay price={product.price} />
        ) : (
          <div>Price: Contact for pricing</div>
        )}
      </CardContent>
    </Card>
  )
}
```

❌ **不推荐做法**:
```tsx
// 外部传入权限标志
function ProductCard({ product, showPrice }) {
  return (
    <Card>
      <CardContent>
        {showPrice ? (
          <PriceDisplay price={product.price} />
        ) : (
          <div>Price: Contact for pricing</div>
        )}
      </CardContent>
    </Card>
  )
}
```

## ❓ 常见问题

### Q1: 权限Hook返回的权限不准确？

**A**: 检查以下几点：
1. 确认用户已正确登录且权限数据已加载
2. 检查后端返回的权限数据格式是否正确
3. 验证权限名称拼写是否正确

```tsx
// 调试权限数据
const { user } = useAppSelector(state => state.auth)
console.log('User permissions:', user?.permissions)
console.log('User roles:', user?.roles)
```

### Q2: 页面刷新后权限失效？

**A**: 确保权限数据持久化到localStorage或通过token重新获取：

```tsx
// authSlice.ts
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    token: localStorage.getItem('token'),
  },
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user
      state.token = action.payload.token
      localStorage.setItem('user', JSON.stringify(action.payload.user))
      localStorage.setItem('token', action.payload.token)
    },
  },
})
```

### Q3: 如何处理动态权限？

**A**: 实现权限实时更新机制：

```tsx
// 监听权限变更
useEffect(() => {
  const handlePermissionUpdate = (event) => {
    dispatch(updateUserPermissions(event.detail.permissions))
  }
  
  window.addEventListener('permissions-updated', handlePermissionUpdate)
  return () => {
    window.removeEventListener('permissions-updated', handlePermissionUpdate)
  }
}, [dispatch])
```

### Q4: 如何测试权限控制？

**A**: 使用不同角色的测试账号：

```tsx
// 测试用例示例
describe('Product Management Permissions', () => {
  test('admin can see all buttons', () => {
    renderWithAuth(<ProductManagement />, { role: 'admin' })
    expect(screen.getByText('Delete')).toBeInTheDocument()
    expect(screen.getByText('Edit')).toBeInTheDocument()
  })
  
  test('viewer cannot see delete button', () => {
    renderWithAuth(<ProductManagement />, { role: 'viewer' })
    expect(screen.queryByText('Delete')).not.toBeInTheDocument()
  })
})
```

---

📝 **文档维护**: 请在权限Hook发生变更时及时更新本文档

🔗 **相关文档**:
- [后端RBAC权限方案](../djj-inventory-system/docs/RBAC-Permission-Scheme.md)
- [组件开发指南](./Component-Development-Guide.md)