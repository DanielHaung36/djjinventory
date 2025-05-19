// src/layouts/SideBar.tsx
import React, { useState, memo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Drawer,
  Toolbar,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  styled,
  useTheme,
  alpha,
  ListSubheader,
  Box,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import HomeIcon from "@mui/icons-material/Home";
import StarBorder from "@mui/icons-material/StarBorder";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import CategoryIcon from "@mui/icons-material/Category";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PeopleIcon from "@mui/icons-material/People";
import InboxIcon from "@mui/icons-material/Inbox";
import { Avatar } from '@mui/material';
import UserAvatar from '../components/UserAvatar';
const drawerWidth = 240;
const collapsedWidth = 64;



interface MenuItem {
  key: string;
  label: string;
  Icon: React.ElementType;
  path?: string;
  children?: MenuItem[];
}

interface Section {
  title?: string;
  items: MenuItem[];
}

const EXPANDED_DRAWER_UNITS = 30;  // 30 * 8px = 240px
const COLLAPSED_DRAWER_UNITS = 8;  //  8 * 8px =  64px


// 使用主题的 primary.light/primary.main 代替硬编码灰色
const StyledNavLink = styled(NavLink)(({ theme }) => ({
  textDecoration: "none",
  color: "inherit",
  "&.active > .MuiListItemButton-root": {
    backgroundColor: theme.palette.primary.light,        // 选中态浅蓝
    color: theme.palette.primary.contrastText,           // 白色文字
    "& .MuiListItemIcon-root": {
      color: theme.palette.primary.contrastText,         // 白色图标
    },
  },
  "&.active > .MuiListItemButton-root:hover": {
    backgroundColor: theme.palette.primary.main,         // 悬停时主色
  },
}));


const menuSections: Section[] = [
  {
    items: [
      { key: "dashboard", label: "Dashboard", Icon: HomeIcon, path: "/dashboard" },
      {
        key: "sales",
        label: "Sales",
        Icon: StarBorder,
        children: [
          { key: "sales-overview", label: "Overview", Icon: StarBorder, path: "/sales/overview" },
          { key: "sales-details", label: "Details",  Icon: StarBorder, path: "/sales/details" },
        ],
      },
      {
        key: "inventory",
        label: "Inventory",
        Icon: Inventory2Icon,
        children: [
          { key: "inv-overview",  label: "Overview", Icon: Inventory2Icon, path: "/inventory/overview" },
          { key: "inv-details",   label: "Details",  Icon: Inventory2Icon, path: "/inventory/details" },
          { key: "inv-shipping",  label: "Shipping", Icon: Inventory2Icon, path: "/inventory/shipping" },
        ],
      },
      { key: "products",  label: "Products",  Icon: CategoryIcon,     path: "/products" },
      { key: "purchases", label: "Purchases", Icon: ShoppingCartIcon, path: "/purchases" },
    ],
  },
  {
    title: "Other Information",
    items: [
      { key: "knowledge", label: "Knowledge Base",  Icon: InboxIcon,     path: "/knowledge" },
      { key: "updates",   label: "Product Updates", Icon: StarBorder,    path: "/updates" },
    ],
  },
  {
    title: "Settings",
    items: [
      { key: "personal", label: "Personal Settings", Icon: PeopleIcon,   path: "/settings/personal" },
      { key: "global",   label: "Global Settings",   Icon: CategoryIcon, path: "/settings/global" },
    ],
  },
];

export default memo(function SideBar({
  open,
  onToggle,
}: {
  open: boolean;
  onToggle: () => void;
}) {

  const userName = "Daniel Huang"; // 从上下文或者 Redux/Context 拿到  
  const theme = useTheme();
  const { pathname } = useLocation();
  const [expandedKeys, setExpandedKeys] = useState<Record<string, boolean>>({});

  
  const expandedW = theme.spacing(EXPANDED_DRAWER_UNITS);
  const collapsedW = theme.spacing(COLLAPSED_DRAWER_UNITS);
  const toggleExpand = (key: string) =>
    setExpandedKeys((prev) => ({ ...prev, [key]: !prev[key] }));

  const renderMenuItems = (items: MenuItem[], level = 0) =>
    items.map((item) => {
      const hasChildren = Boolean(item.children);
      const parentActive =
        item.path === pathname ||
        (hasChildren && item.children!.some((c) => c.path === pathname));

      if (hasChildren) {
        return (
          <React.Fragment key={item.key}>
            <ListItemButton
              onClick={() => toggleExpand(item.key)}
            //   selected={parentActive}
              sx={{
                pl: level * 2 + 1,
                minWidth: open ? undefined : 0,
                justifyContent: open ? undefined : "center",
                "&:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                },
                 // ✅ 手动给父级“激活”状态加背景色 和 白字
                backgroundColor: parentActive
                  ?  "inherit"
                  : 'transparent',
                '& .MuiListItemIcon-root, & .MuiListItemText-root': {
                  color: parentActive
                    ? "#333333"
                    : undefined,
                },
                borderRadius: 1,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: open ? undefined : 0,
                  justifyContent: open ? undefined : "center",
                  color: parentActive
                    ? theme.palette.primary.contrastText
                    : undefined,
                }}
              >
                <item.Icon />
              </ListItemIcon>
              {open && (
                <>
                  <ListItemText
                    primary={item.label}
                    sx={{
                      color: parentActive
                        ? theme.palette.primary.contrastText
                        : undefined,
                    }}
                  />
                  {expandedKeys[item.key] ? <ExpandLess /> : <ExpandMore />}
                </>
              )}
            </ListItemButton>
            <Collapse in={expandedKeys[item.key]} timeout="auto" unmountOnExit>
              <List disablePadding>
                {renderMenuItems(item.children!, level + 1)}
              </List>
            </Collapse>
          </React.Fragment>
        );
      }

      return (
        <StyledNavLink key={item.key} to={item.path!} end>
          <ListItemButton
            selected={item.path === pathname}
            sx={{
              pl: level * 2 + 1,
              minWidth: open ? undefined : 0,
              justifyContent: open ? undefined : "center",
              borderRadius: 1,
              "&:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
              },
            
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: open ? undefined : 0,
                justifyContent: open ? undefined : "center",
              }}
            >
              <item.Icon />
            </ListItemIcon>
            {open && <ListItemText primary={item.label} />}
          </ListItemButton>
        </StyledNavLink>
      );
    });

  return (
    <Drawer
      variant="permanent"
      open={open}
      sx={{
        width: { xs: collapsedW, sm: open ? expandedW : collapsedW },
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          boxSizing: "border-box",
          width: { xs: collapsedW, sm: open ? expandedW : collapsedW },
          overflowX: "hidden",
          transition: theme.transitions.create("width", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        },
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: open ? "center" : "center",
        }}
      >
        {open ? <Box sx={{justifyContent:'center'}}><UserAvatar  name={userName} size={48} /></Box>: <Box sx={{justifyContent:'center'}}><UserAvatar  name={userName} size={32} /></Box>}
        {/* 如果需要折叠按钮可解开下面这一行 */}
        {/* <IconButton onClick={onToggle}><MenuIcon /></IconButton> */}
      </Toolbar>

      <List disablePadding>
        {menuSections.map((section, idx) => (
          <Box key={idx}>
            {section.title && open && (
              <ListSubheader
                disableSticky
                sx={{
                  bgcolor: "inherit",
                  py: 1,
                  pl: 2,
                  fontSize: 12,
                  color: theme.palette.text.secondary,
                }}
              >
                {section.title}
              </ListSubheader>
            )}
            {renderMenuItems(section.items)}
          </Box>
        ))}
      </List>
    </Drawer>
  );
});
