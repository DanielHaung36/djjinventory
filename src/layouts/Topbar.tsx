// src/layouts/TopBar.tsx
import React, { memo } from 'react';
import type { FC } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import AccountCircle from '@mui/icons-material/AccountCircle';

export interface TopBarProps {
  open: boolean;
  onToggle: () => void;
}

const drawerWidth = 240;
const collapsedWidth = 64;

const TopBar: FC<TopBarProps> = memo(({ open, onToggle }) => {
  // 根据 open 决定 AppBar 的宽度和左侧间距
  const offset = open ? drawerWidth : collapsedWidth;

  return (
    <AppBar
      position="fixed"
      color="inherit"
      elevation={1}
      sx={{
        width: `calc(100% - ${offset}px)`,
        ml: `${offset}px`,
      }}
    >
      <Toolbar>
        {/* 菜单折叠按钮 */}
        <IconButton
          edge="start"
          color="inherit"
          onClick={onToggle}
          sx={{ mr: 2 }}
        >
          {open ? <MenuOpenIcon /> : <MenuIcon />}
        </IconButton>

        {/* 标题或 Logo */}
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
          DJJ
        </Typography>

        {/* 右侧操作 */}
        <IconButton size="large" color="inherit">
          <SearchOutlinedIcon />
        </IconButton>
        <IconButton size="large" color="inherit">
          <NotificationsOutlinedIcon />
        </IconButton>
        <IconButton size="large" color="inherit">
          <AccountCircle />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
});

TopBar.displayName = 'TopBar';
export default TopBar;
    