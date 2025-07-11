// src/features/auth/LoginPage.tsx

import React, { useState } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import {
  Container, Box, TextField, Button, Typography, Link, Checkbox, FormControlLabel, Divider, CircularProgress,
} from '@mui/material';
// import LarkIcon from '@mui/icons-material'; // 这里用一个占位图标，替换成你自己的 Lark 图标
import { useLoginMutation } from "./authApi.ts";
import { useToast } from "@/hooks/use-toast"
import { useAppSelector, useAppDispatch } from "@/app/hooks"
import { loginSuccess, logoutLocal } from "./authSlice"
import { useLogoutMutation } from "./authApi"
const LoginPage: React.FC = () => {
  const { toast } = useToast()
  const navigate = useNavigate();
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'
  const [email, setEmail] = useState('sales_leader_per_store@example.com');
  const [password, setPassword] = useState('qq123456');
  const [loading, setLoading] = React.useState(false) 
  const [login] = useLoginMutation()
  const [logout] = useLogoutMutation()
  const dispatch = useAppDispatch()
  
  // 检查Redux状态
  const user = useAppSelector(state => state.auth.user)
  console.log('Current user in Redux:', user)

  const [keepSignedIn, setKeepSignedIn] = useState(false);

  // 强制登出功能
  const handleForceLogout = async () => {
    try {
      await logout().unwrap();
    } catch (err) {
      console.log('强制登出失败:', err)
    }
    dispatch(logoutLocal());
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true)
    
    try {
      // 步骤1: 检查是否需要清理旧状态（只在切换用户时清理）
      const currentUser = user;
      const shouldClearOldState = currentUser && currentUser.email !== email;
      
      if (shouldClearOldState) {
        console.log('检测到用户切换，清理旧状态...', { from: currentUser.email, to: email })
        try {
          await logout().unwrap(); // 调用后端清理cookie
        } catch (err) {
          console.log('旧状态清理失败，继续登录:', err)
        }
        dispatch(logoutLocal()); // 清理Redux和localStorage
      } else {
        console.log('同一用户登录，无需清理状态')
      }
      
      // 步骤2: 执行登录
      console.log('执行登录...')
      const response = await login({ email, password }).unwrap();
      console.log('Login response:', response);
      
      // 步骤3: 设置新的认证状态
      dispatch(loginSuccess(response));
      
      // 登录成功提示
      toast({
        title: "Login Success",
        description: `Welcome back, ${response.user?.email || response.user?.username || 'User'}!`,
        variant: "default",
      })
   
      // 给Redux状态更新一点时间
      setTimeout(() => {
        console.log('Navigating to:', from);
        navigate(from, { replace: true })
      }, 100);
    } catch (err) {
      // 错误信息会通过 `error` 反映到 UI
      console.error('登录失败:', err)
      const msg = err?.data?.error || err.message || "Unknown error"
      toast({
        title: "Login Failed",
        description: msg,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  };
  const handleLarkLogin = () => {
    // 发起 Lark OAuth 登录
    window.location.href = `${process.env.REACT_APP_API_URL}/auth/lark`;
  };

  return (
        <Box
        sx={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, rgba(19,21,35,0.8) 0%, rgba(60,62,68,0.8) 0%), url(/assets/background/2.webp)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2,
        }}
>
    <Container maxWidth="sm">
      <Box
        sx={{
          mt: 8, p: 4, boxShadow: 1, bgcolor: 'background.paper', borderRadius: 2
        }}
      >
        {/* DJJ Logo */}
        <Box
          component="img"
          src="/assets/logo.png"
          alt="DJJ LOGO"
          sx={{ display: 'block', width: 120, mx: 'auto', mb: 3 }}
        />

        <Typography variant="h4" align="center" gutterBottom>
          Sign In
        </Typography>

        {/* 显示当前用户状态 */}
        {user && (
          <Box sx={{ mb: 2, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
            <Typography variant="body2" color="info.contrastText">
              当前已登录用户: {user.email || user.username}
            </Typography>
            <Button 
              size="small" 
              onClick={handleForceLogout}
              sx={{ mt: 1 }}
            >
              强制登出
            </Button>
          </Box>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={keepSignedIn}
                onChange={e => setKeepSignedIn(e.target.checked)}
              />
            }
            label="Keep me signed in"
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2, py: 1.5 }}
          >
            Sign In
          </Button>
        </Box>
      {loading && (
                <CircularProgress
                  size={24}
                  sx={{
                    color: "primary.main",
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    marginTop: "-12px",
                    marginLeft: "-12px",
                  }}
                />
              )}
        {/* 分割线和 Lark 登录 按钮 */}
        <Box sx={{ my: 3, display: 'flex', alignItems: 'center' }}>
          <Divider sx={{ flex: 1 }} />
          <Typography variant="body2" sx={{ mx: 2, color: 'text.secondary' }}>
            OR
          </Typography>
          <Divider sx={{ flex: 1 }} />
        </Box>

        <Button
          variant="outlined"
          fullWidth
        //   startIcon={<LarkIcon />}
          onClick={handleLarkLogin}
          sx={{ py: 1.5 }}
        >
          Sign in with Lark
        </Button>

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Link component={RouterLink} to="/reset-password">
            Forgot your password?
          </Link>
        </Box>
        <Box sx={{ mt: 1, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            New to DJJ?{' '}
            <Link component={RouterLink} to="/register">
              Create an Account
            </Link>
          </Typography>
        </Box>
      </Box>
    </Container>
    </Box>
  );
};

export default LoginPage;
