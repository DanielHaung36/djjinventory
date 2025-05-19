// src/features/auth/LoginPage.tsx

import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container, Box, TextField, Button, Typography, Link, Checkbox, FormControlLabel, Divider
} from '@mui/material';
// import LarkIcon from '@mui/icons-material'; // 这里用一个占位图标，替换成你自己的 Lark 图标

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keepSignedIn, setKeepSignedIn] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: dispatch(login({ email, password })).unwrap();
    navigate('/dashboard');
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
