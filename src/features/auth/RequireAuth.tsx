// src/features/auth/RequireAuth.tsx
import React, { useEffect, useRef } from 'react'
import { useLocation, Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useGetProfileQuery } from './authApi'
import type { RootState } from '../../app/store'
import { Box, CircularProgress } from '@mui/material'
import { useAppDispatch } from '../../app/hooks'
import { setUser, logoutLocal } from './authSlice'
import { clearAllCookies } from '../../lib/auth-utils'

const RequireAuth: React.FC = () => {
  const location = useLocation()
  const dispatch = useAppDispatch()
  const user = useSelector((state: RootState) => state.auth.user)
  
  // 用于跟踪上次验证的用户ID，避免重复验证
  const lastValidatedUserId = useRef<number | null>(null)
  
  // ✅ 智能验证cookie：优化跳过逻辑，确保用户状态一致性
  const {
    data: profileData,
    isLoading,
    isError,
    refetch,
  } = useGetProfileQuery(undefined, {
    // 只在需要时重新验证cookie
    refetchOnMountOrArgChange: 300, // 5分钟内不重复验证
    // ✅ 修复：避免循环依赖，使用ref跟踪验证状态
    skip: Boolean(user && lastValidatedUserId.current === user.id),
  })

  // 处理用户状态同步
  useEffect(() => {
    if (profileData) {
      // 记录已验证的用户ID
      lastValidatedUserId.current = profileData.id
      
      // ✅ 如果cookie验证成功，但Redux中的用户信息不匹配，需要更新
      if (!user || user.id !== profileData.id) {
        console.log('RequireAuth: 用户状态不匹配，更新Redux状态:', { 
          redux: user?.id, 
          cookie: profileData.id 
        })
        dispatch(setUser(profileData))
      } else {
        console.log('RequireAuth: 用户状态已同步:', profileData.email);
      }
    }
  }, [profileData, user, dispatch])

  // 显示加载状态
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  // 如果获取用户信息失败，说明用户未登录或 cookie 已过期
  if (isError) {
    // ✅ 清理可能残留的无效cookie和localStorage
    console.log('RequireAuth: Cookie验证失败，清理所有认证状态')
    clearAllCookies();
    dispatch(logoutLocal());
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // 如果没有用户信息且不在加载中
  if (!user && !isLoading) {
    // 如果cookie验证已完成但没有用户信息，跳转到登录
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}

export default RequireAuth
