// src/layouts/TopBar.tsx
import React, { memo } from 'react';
import type { FC } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  useTheme,
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

const EXPANDED_DRAWER_UNITS = 30;  // 30 * 8px = 240px
const COLLAPSED_DRAWER_UNITS = 8;  // 8  * 8px =  64px

const TopBar: FC<TopBarProps> = memo(({ open, onToggle }) => {
  // 根据 open 决定 AppBar 的宽度和左侧间距
  const theme = useTheme();
 // 通过 theme.spacing 计算出实际像素值（字符串带单位）
  const expandedW = theme.spacing(EXPANDED_DRAWER_UNITS);
  const collapsedW = theme.spacing(COLLAPSED_DRAWER_UNITS);
  return (
    <AppBar
      position="fixed"
      color="inherit"
      elevation={1}
      sx={{
       // xs 小屏幕下全宽；sm 以上根据 open 计算 left margin 和 width
        ml: { xs: 0, sm: open ? expandedW : collapsedW },
       width: {
          xs: '100%',
          sm: `calc(100% - ${open ? expandedW : collapsedW})`,
        },
        // 整个 Bar 高度 4rem
        height: '4rem',
        transition: theme.transitions.create(['width', 'margin'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
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
    