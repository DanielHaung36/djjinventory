// src/layouts/SideBar.tsx
import React, { useState, memo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Drawer,
  Toolbar,
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
  IconButton,
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
import UserAvatar from "../components/UserAvatar";
import {FileQuestion,Users } from "lucide-react"

const drawerWidth = 240;
const collapsedWidth = 64;

interface MenuItem {
  key: string;
  label: string;
  Icon?: React.ElementType;
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

// 侧边栏菜单配置
const menuSections: Section[] = [
  {
    items: [
      { key: "dashboard", label: "Dashboard", Icon: HomeIcon, path: "/dashboard" },
    {
      path: "/quotes",
      Icon: FileQuestion,
      key: "quotes",
      label: "Quotes",
       children: [
         { key: "quotes-overview", label: "Overview", Icon: StarBorder, path: "/quotes/overview" },
          { key: "quotesapproval", label: "Quote Approvals", path: "/quotes/approvals" },
        ],
    },
    { key: "customer", label: "Customer", Icon: Users, path: "/customer" },
      {
        key: "sales",
        label: "Sales",
        Icon: StarBorder,
        children: [
          { key: "sales-overview", label: "Overview", path: "/sales/overview" },
          { key: "sales-details", label: "Details",  path: "/sales/details" },
          { key: "sales-admin", label: "Manage",  path: "/sales/admin" },
        ],
      },
      {
        key: "inventory",
        label: "Inventory",
        Icon: Inventory2Icon,
        children: [
          { key: "inv-dashboard", label: "Dashboard", path: "/inventory/dashboard" },
          { key: "inv-overview", label: "Overview", path: "/inventory/overview" },
          { key: "inv-inbound", label: "InBound", path: "/inventory/inbound" },
          { key: "inv-outbound", label: "OutBound", path: "/inventory/outbound" },
        ],
      },
      { key: "products", label: "Products", Icon: CategoryIcon, path: "/products" },
      {
        key: "procure",
        label: "Procure",
        Icon: ShoppingCartIcon,
        children: [
          { key: "procure", label: "Dashboard", path: "/dashboard" },
          { key: "procurement ", label: "Procurement", path: "/dashboard/procurement" },
          { key: "procureproducts ", label: "Products ", path: "/dashboard/products" },
          { key: "productsnew ", label: "New Product", path: "/dashboard/products/new" },
          { key: "procureadmin ", label: "Admin Approvals", path: "/dashboard/admin" },
          { key: "procurereview ", label: "Product Reviews", path: "/dashboard/admin/products" },
          { key: "procurenewproduct", label: "NewProduct", path: "/purchases/newpurchase" },
        ],
      },
    ],
  },
  {
    title: "Other Information",
    items: [
      { key: "knowledge", label: "Knowledge Base", Icon: InboxIcon, path: "/knowledge" },
      { key: "faq", label: "FAQ", Icon: StarBorder, path: "/faq" },
    ],
  },
  {
    title: "Settings",
    items: [
      { key: "personal", label: "Team Settings", Icon: PeopleIcon, path: "/team" },
      { key: "global", label: "Global Settings", Icon: CategoryIcon, path: "/settings/global" },
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
  const userName = "Daniel Huang"; // 示例用户名
  const theme = useTheme();
  const { pathname } = useLocation();
  const [expandedKeys, setExpandedKeys] = useState<Record<string, boolean>>({});

  // Drawer 宽度
  const expandedW = theme.spacing(EXPANDED_DRAWER_UNITS);
  const collapsedW = theme.spacing(COLLAPSED_DRAWER_UNITS);

  const toggleExpand = (key: string) =>
    setExpandedKeys((prev) => ({ ...prev, [key]: !prev[key] }));

  // 递归渲染菜单项
  const renderMenuItems = (items: MenuItem[], level = 0) =>
    items.map((item) => {
      const hasChildren = Array.isArray(item.children) && item.children.length > 0;
      // 判断子路径中是否有当前 pathname
      const parentActive =
        item.path === pathname ||
        (hasChildren && item.children!.some((c) => c.path === pathname));

      if (hasChildren) {
        // 先拿父节点第一个子节点的 path 作为“默认跳转路径”
        const defaultChildPath = item.children![0].path || "#";

        return (
          <React.Fragment key={item.key}>
            {/*
              1. 外层用 StyledNavLink 包裹，使点击整个按钮时跳转到 defaultChildPath
              2. 但是 Expand 图标单独用 IconButton，使得点击图标只触发展开/收缩，不触发导航
            */}
            <StyledNavLink to={defaultChildPath} end>
              <ListItemButton
                selected={parentActive}
                sx={{
                  pl: open ? level * 2 + 1 : 0,
                  justifyContent: open ? undefined : "center",
                  borderRadius: 1,
                  mt: 0.5,
                  mb: 0.5,
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  },
                  backgroundColor: parentActive
                    ? theme.palette.primary.light
                    : "transparent",
                  "& .MuiListItemIcon-root, & .MuiListItemText-root": {
                    color: parentActive
                      ? theme.palette.primary.contrastText
                      : undefined,
                  },
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
                  {item.Icon && <item.Icon />}
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
                    {/* ① 将 Expand 图标单独放在 IconButton 中 */}
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleExpand(item.key);
                      }}
                      sx={{
                        color: parentActive
                          ? theme.palette.primary.contrastText
                          : undefined,
                      }}
                    >
                      {expandedKeys[item.key] ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                  </>
                )}
              </ListItemButton>
            </StyledNavLink>

            <Collapse in={expandedKeys[item.key]} timeout="auto" unmountOnExit>
              <List disablePadding>
                {renderMenuItems(item.children!, level + 1)}
              </List>
            </Collapse>
          </React.Fragment>
        );
      }

      // 普通子节点：直接导航到 item.path
      return (
        <StyledNavLink key={item.key} to={item.path!} end>
          <ListItemButton
            selected={item.path === pathname}
            sx={{
              pl: open ? level * 2 + 1 : 0,
              justifyContent: open ? undefined : "center",
              borderRadius: 1,
              mt: 0.5,
              mb: 0.5,
              "&:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: open ? undefined : 0,
                justifyContent: open ? undefined : "center",
              }}
            >
              {item.Icon && <item.Icon />}
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
          justifyContent: "center",
        }}
      >
        {open ? (
          <Box>
            <UserAvatar name={userName} size={48} />
          </Box>
        ) : (
          <Box>
            <UserAvatar name={userName} size={32} />
          </Box>
        )}
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
