import { memo,useState } from "react";
import type { FC, ReactNode } from "react";
import { Outlet } from "react-router-dom";
import {
  Box,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Toolbar,
} from "@mui/material";
import TopBar from "./Topbar";
import SideBar from "./Sidebar";

export interface IProps {
  children?: ReactNode;
  //...这里定义相关类型
  //扩展相关属性
}
const theme = createTheme({
  typography: {
    fontFamily: "Inter, Arial, sans-serif",
    h4: {
      fontSize: 32,
      lineHeight: "44px",
      fontWeight: 700,
    },
    body1: {
      fontSize: 16,
      lineHeight: "24px",
    },
  },
  palette: {
    background: {
      default: "#F5F6FA",
      paper: "#FFFFFF",
    },
    primary: {
      main: "#1E5EFF",
      dark: "#154FCC",           // 你也可以自定义 dark
      contrastText: "#FFFFFF",   // 选中后文字/图标颜色
    },
  },
  components: {
    MuiListItemButton: {
      styleOverrides: {
        root: {
          // 当 ListItemButton 的 `selected` prop 为 true 时，Mui 会自动加 .Mui-selected
          '&.Mui-selected': {
            backgroundColor: '#1E5EFF',          // 选中背景，等同于 theme.palette.primary.main
            color: '#FFFFFF',                    // 选中文本
            '& .MuiListItemIcon-root': {
              color: '#FFFFFF',                  // 选中图标
            },
          },
          '&.Mui-selected:hover': {
            backgroundColor: '#154FCC',          // 选中悬停更深，等同于 theme.palette.primary.dark
          },
          // 非选中项悬停
          '&:not(.Mui-selected):hover': {
            backgroundColor: 'rgba(30, 94, 255, 0.08)', // 可用 theme.palette.primary.main + alpha
          },
        },
      },
    },
  },
});

const MainLayout = memo(() => {
  const [open, setOpen] = useState(true);
  const drawerWidth = 240;
  const collapsedWidth = 64;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {/* 用一个全屏 flex 容器包住整个布局 */}
      <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
        <TopBar open={open} onToggle={() => setOpen(o => !o)} />
        <SideBar open={open} onToggle={() => setOpen(o => !o)} />

        {/* 主区：flexGrow 撑满剩余 */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            // 顶部偏移
            // 左侧偏移
            // ml: open ? `${drawerWidth}px` : `${collapsedWidth}px`,
            p: 3,
            display: "flex",
            flexDirection: "column",
            height: '100vh',      
          }}
        >
          {/* 可选占位 AppBar */}
          <Toolbar sx={{ display: { xs: "none", md: "block" } }} />

          {/* 这个区域才真正滚动 */}
          <Box sx={{ flexGrow: 1, overflow: "auto" }}>
            <Outlet />
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
});


export default MainLayout;
MainLayout.displayName = "MainLayout"; //方便以后调试使用
