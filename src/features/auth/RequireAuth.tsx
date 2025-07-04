// src/features/auth/RequireAuth.tsx
import React ,{useEffect} from 'react'
import { useLocation, Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useGetProfileQuery } from './authApi'
import type { RootState } from '../../app/store'
import { Box, CircularProgress } from '@mui/material'  // ← 引入 MUI 组件
import { useAppDispatch,useAppSelector  } from '../../app/hooks'
import { setUser } from './authSlice'
const RequireAuth: React.FC = () => {
  const location = useLocation()
  const profile = useSelector((state: RootState) => state.auth.profile)
  const {
    isLoading,
    isError,
  } = useGetProfileQuery(undefined, {
    skip: Boolean(profile),
  })


  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',      // 或者根据你的布局改成 100% 等
          bgcolor: 'background.default',
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  if (!profile || isError) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}

export default RequireAuth
