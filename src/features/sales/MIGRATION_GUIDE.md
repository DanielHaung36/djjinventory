# Sales Order Status Migration Guide

## 状态字段统一修改指南

### 🔄 **需要修改的状态值**

以下是需要在整个前端项目中统一修改的状态值：

| 旧状态值 | 新状态值 | 说明 |
|---------|---------|------|
| `"deposit-received"` | `"deposit_received"` | 已收定金 |
| `"order-placed"` | `"ordered"` | 已下单 |
| `"final-payment"` | `"final_payment_received"` | 已收尾款 |
| `"shipment"` | `"shipped"` | 已发货 |
| `"order-closed"` | `"order_closed"` | 订单关闭 |

### 📂 **需要检查和修改的文件**

1. **类型定义文件**
   - ✅ `src/features/sales/types/sales-order.ts` - 已修改

2. **Mock数据文件**
   - ✅ `src/features/sales/SalesDashboard.tsx` - 已修改
   - ✅ `src/features/sales/StatsCards.tsx` - 已修改

3. **需要手动检查的文件**
   - `src/features/sales/stages/StageOverivew.tsx`
   - `src/features/sales/components/form/edit-shipment-form.tsx`
   - `src/features/sales/components/ViewModePage.tsx`
   - `src/features/sales/components/WorkflowStep.tsx`
   - `src/features/sales/Salesorderdetail.tsx`
   - `src/features/sales/NewSalesDashboard.tsx`
   - `src/features/sales/Newsalesorderform.tsx`
   - `src/features/sales/AdminSalesOrder.tsx`

### 🔧 **推荐的修改方法**

#### 1. 使用新的状态常量
```typescript
// 推荐使用
import { ORDER_STATUS } from '../constants/order-status';

// 而不是硬编码字符串
const status = ORDER_STATUS.DEPOSIT_RECEIVED; // 而不是 "deposit_received"
```

#### 2. 使用状态工具函数
```typescript
import { 
  getStatusLabel, 
  getStatusColor, 
  isValidStatusTransition,
  isCancellable 
} from '../constants/order-status';

// 获取状态显示名称
const label = getStatusLabel(order.status);

// 获取状态颜色
const color = getStatusColor(order.status);

// 检查状态转换
const canTransition = isValidStatusTransition(currentStatus, newStatus);

// 检查是否可以取消
const canCancel = isCancellable(order.status);
```

### 🔍 **查找和替换模式**

在VS Code中可以使用以下正则表达式进行批量替换：

```regex
// 查找: "deposit-received"
// 替换: "deposit_received"

// 查找: "order-placed"
// 替换: "ordered"

// 查找: "final-payment"
// 替换: "final_payment_received"

// 查找: "shipment"
// 替换: "shipped"
```

### 🧪 **测试要点**

修改完成后，需要测试以下功能：

1. **状态筛选功能**
   - 检查StatsCards的筛选是否正常工作
   - 验证订单列表的状态筛选

2. **状态显示**
   - 确认订单状态标签显示正确
   - 验证状态颜色映射正确

3. **状态转换**
   - 测试订单状态流转是否正常
   - 验证状态转换按钮的可用性

4. **API集成**
   - 确认前端发送的状态值与后端匹配
   - 验证后端返回的状态值前端能正确处理

### 📋 **检查清单**

- [ ] 类型定义已更新
- [ ] Mock数据状态值已修正
- [ ] 所有硬编码状态字符串已替换
- [ ] 状态筛选功能正常
- [ ] 状态显示正确
- [ ] 状态转换逻辑正常
- [ ] API集成测试通过
- [ ] 所有相关组件已测试

### 🚀 **完成后的好处**

1. **前后端状态一致** - 避免状态不匹配导致的bug
2. **类型安全** - TypeScript能提供更好的类型检查
3. **易于维护** - 统一的状态常量便于管理
4. **功能完整** - 支持完整的订单生命周期管理