# 🔄 用户切换问题解决方案

## 问题描述

当切换不同用户登录时，localStorage中仍然保存着之前用户的信息，导致新用户登录后显示的还是旧用户的状态。

## 解决方案

### 1. 新增 `loginSuccess` Action

```typescript
// 专门用于处理登录的action，确保完全替换用户状态
loginSuccess(state, action: PayloadAction<LoginResponse>) {
    // 先清理所有旧状态
    state.token = null
    state.user = null
    state.profile = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    
    // 设置新状态
    state.token = action.payload.token
    state.user = action.payload.user
    
    // 保存到localStorage
    localStorage.setItem('token', action.payload.token)
    localStorage.setItem('user', JSON.stringify(action.payload.user))
}
```

### 2. 修改登录页面逻辑

```typescript
// LoginPage.tsx
try {
  const response = await login({ email, password }).unwrap();
  
  // 使用专门的loginSuccess action，确保完全替换用户状态
  dispatch(loginSuccess(response));
  
  // 登录成功，跳转到目标页面
  navigate(from, { replace: true });
}
```

## 用户切换流程

### 场景1：用户A登录后，用户B登录

```
用户A已登录 (localStorage: userA信息)
↓
用户B在登录页面输入凭据
↓
调用login API
↓
登录成功，调用loginSuccess(responseB)
↓
清理localStorage中的userA信息
↓
保存userB信息到localStorage
↓
Redux状态更新为userB
↓
页面显示userB信息 ✅
```

### 场景2：用户A登录后，刷新页面

```
页面刷新
↓
从localStorage读取userA信息
↓
初始化Redux状态为userA
↓
显示userA信息 ✅
```

### 场景3：用户A登出后，用户B登录

```
用户A点击登出
↓
调用performLogout()
↓
清理Redux状态 + localStorage + cookies
↓
跳转到登录页面
↓
用户B登录
↓
loginSuccess(responseB)
↓
保存userB信息
↓
显示userB信息 ✅
```

## 关键改进点

1. **完全清理旧状态** - 每次登录都先清理localStorage
2. **原子性操作** - 清理和设置在同一个action中完成
3. **双重保障** - 手动dispatch + addMatcher备选方案
4. **一致性** - 注册和登录都使用相同的清理逻辑

## 测试checklist

- [ ] 用户A登录 → 显示A的信息
- [ ] 不登出，直接用户B登录 → 应该显示B的信息，不是A的
- [ ] 刷新页面 → 应该仍然显示B的信息
- [ ] 用户B登出 → 应该清理所有状态
- [ ] 用户A重新登录 → 应该显示A的信息

## 注意事项

1. **登录时必须清理** - 不能假设用户会先登出
2. **数据一致性** - Redux和localStorage必须同步
3. **错误处理** - 即使localStorage操作失败，也要更新Redux
4. **安全性** - 敏感信息仍然依赖Cookie验证