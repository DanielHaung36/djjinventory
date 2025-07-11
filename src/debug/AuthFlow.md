# 认证流程说明

## 页面刷新时的认证流程

```
页面刷新
    ↓
Redux store重置 (user = null)
    ↓
RequireAuth组件渲染
    ↓
user为null，所以skip=false
    ↓
useGetProfileQuery开始调用API
    ↓
判断：if (!user) → true
    ↓
判断：if (isLoading) → true
    ↓
显示加载状态 🔄
    ↓
等待API调用完成...
    ↓
两种情况：
    ├─ API成功 → profileData有值
    │   ↓
    │   useEffect触发 → dispatch(setUser(profileData))
    │   ↓
    │   user更新为profileData
    │   ↓
    │   重新渲染 → user不为null
    │   ↓
    │   return <Outlet /> ✅
    │
    └─ API失败 → isError=true
        ↓
        if (isError) → true
        ↓
        清理cookie + 跳转登录页 🔄
```

## 正常登录时的认证流程

```
用户提交登录表单
    ↓
login API调用
    ↓
登录成功，收到response
    ↓
手动dispatch(setUser(response.user))
    ↓
Redux state更新 (user = response.user)
    ↓
navigate(from) - 跳转到目标页面
    ↓
RequireAuth组件渲染
    ↓
user不为null，所以skip=true
    ↓
不调用useGetProfileQuery
    ↓
return <Outlet /> ✅
```

## 登出时的认证流程

```
用户点击登出
    ↓
performLogout(dispatch)
    ↓
调用logout API + 清理Redux + 清理cookie
    ↓
navigate("/login")
    ↓
用户回到登录页面 ✅
```