import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container, Box, TextField, Button, Typography, Link
} from '@mui/material';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 调用注册 API
    navigate('/registration-complete');
  };

  return (
        <Box
          sx={{
            height: '100vh',             // 撑满全屏高度
            display: 'flex',                 // flex 布局
            alignItems: 'center',            // 垂直居中
            justifyContent: 'center',        // 水平居中
            p: 2,
             overflow: 'hidden',        // 隐藏可能的溢出
          }}
        >
    <Container maxWidth="sm">
      <Box
        sx={{
          mt: 0, p: 4, boxShadow: 1, bgcolor: 'background.paper', borderRadius: 1
        }}
      >
        <Typography variant="h4" align="center" gutterBottom>
          Create an Account
        </Typography>
        <Typography variant="body2" align="center" color="text.secondary">
          Have an Account?{' '}
          <Link component={RouterLink} to="/login">
            Sign In
          </Link>
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3 }}>
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
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2, py: 1.5 }}
          >
            Create Account
          </Button>
        </Box>

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            By creating account, you agree to our{' '}
            <Link href="#" underline="hover">
              Terms of Service
            </Link>
          </Typography>
        </Box>
      </Box>
    </Container>
    </Box>
  );
};

export default RegisterPage;
