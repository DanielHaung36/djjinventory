# DeleteConfirmDialog 组件使用文档

## 概述

`DeleteConfirmDialog` 是一个通用的删除确认对话框组件，基于 shadcn/ui 的 AlertDialog 构建，提供了美观和安全的删除确认体验。

## 特性

- ✅ **安全确认** - 防止误删操作
- ✅ **自定义内容** - 支持自定义项目名称、类型和描述
- ✅ **加载状态** - 显示删除进度
- ✅ **美观界面** - 使用 shadcn/ui 设计风格
- ✅ **可访问性** - 支持键盘操作和屏幕阅读器

## 基本用法

### 1. 基本删除确认

```tsx
import { DeleteConfirmDialog } from "@/components/dialogs/DeleteConfirmDialog"

// 基本用法
<DeleteConfirmDialog
  itemName="测试产品"
  itemType="产品"
  onConfirm={() => handleDelete(productId)}
>
  <Button variant="outline" className="text-red-600">
    删除
  </Button>
</DeleteConfirmDialog>
```

### 2. 在表格中使用

```tsx
// 在数据表格的操作列中
{
  header: "操作",
  cell: ({ row }) => (
    <div className="flex space-x-2">
      <Button size="sm" variant="outline">编辑</Button>
      
      <DeleteConfirmDialog
        itemName={row.original.name}
        itemType="用户"
        onConfirm={() => handleDeleteUser(row.original.id)}
        isDeleting={deletingUserId === row.original.id}
        description="删除用户将会移除其所有相关数据和权限设置。"
      />
    </div>
  )
}
```

### 3. 在下拉菜单中使用

```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost">操作</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>编辑</DropdownMenuItem>
    
    <DeleteConfirmDialog
      itemName={item.name}
      onConfirm={() => handleDelete(item.id)}
    >
      <DropdownMenuItem 
        className="text-red-600 cursor-pointer"
        onSelect={(e) => e.preventDefault()}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        删除
      </DropdownMenuItem>
    </DeleteConfirmDialog>
  </DropdownMenuContent>
</DropdownMenu>
```

## Props 说明

| 属性 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `itemName` | `string` | ✅ | - | 要删除的项目名称 |
| `itemType` | `string` | ❌ | `"项目"` | 项目类型（如：产品、用户、订单等） |
| `onConfirm` | `() => void` | ✅ | - | 确认删除的回调函数 |
| `isDeleting` | `boolean` | ❌ | `false` | 是否正在删除中 |
| `children` | `ReactNode` | ❌ | 默认删除按钮 | 触发对话框的元素 |
| `description` | `string` | ❌ | 默认警告信息 | 自定义删除警告描述 |

## 完整示例

```tsx
import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { DeleteConfirmDialog } from "@/components/dialogs/DeleteConfirmDialog"
import { useDeleteProductMutation } from './api/productsApi'

export const ProductManager = () => {
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [deleteProduct] = useDeleteProductMutation()

  const handleConfirmDelete = async (id: number, name: string) => {
    setDeletingId(id)
    
    try {
      await deleteProduct(id).unwrap()
      toast({
        title: "删除成功",
        description: `产品"${name}"已被删除。`,
      })
    } catch (error) {
      toast({
        title: "删除失败",
        description: "删除时发生错误，请稍后重试。",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div>
      {products.map(product => (
        <div key={product.id} className="flex justify-between items-center">
          <span>{product.name}</span>
          
          <DeleteConfirmDialog
            itemName={product.name}
            itemType="产品"
            onConfirm={() => handleConfirmDelete(product.id, product.name)}
            isDeleting={deletingId === product.id}
            description="删除产品将会永久移除所有相关数据，包括库存记录和销售历史。"
          >
            <Button 
              variant="outline" 
              size="sm"
              className="text-red-600"
              disabled={deletingId === product.id}
            >
              删除产品
            </Button>
          </DeleteConfirmDialog>
        </div>
      ))}
    </div>
  )
}
```

## 样式自定义

组件使用 Tailwind CSS 类进行样式设置，您可以通过以下方式自定义：

### 自定义触发按钮

```tsx
<DeleteConfirmDialog
  itemName="测试项目"
  onConfirm={handleDelete}
>
  <Button 
    variant="ghost" 
    size="sm"
    className="text-red-500 hover:text-red-700 hover:bg-red-50"
  >
    <Trash2 className="h-4 w-4" />
  </Button>
</DeleteConfirmDialog>
```

### 自定义对话框行为

如果需要更复杂的自定义，可以参考组件源码进行修改，或者创建一个专门的变体组件。

## 注意事项

1. **在 DropdownMenuItem 中使用时**，记得设置 `onSelect={(e) => e.preventDefault()}` 防止菜单自动关闭
2. **加载状态管理**，确保 `isDeleting` 状态正确传递，避免重复提交
3. **错误处理**，在 `onConfirm` 回调中添加适当的错误处理和用户反馈
4. **权限检查**，在显示删除按钮前检查用户是否有删除权限

## 可访问性

组件已经内置了基本的可访问性支持：
- 正确的 ARIA 标签
- 键盘导航支持
- 焦点管理
- 屏幕阅读器兼容