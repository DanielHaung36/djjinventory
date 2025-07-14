import React, { useMemo, useRef, useState, createRef, useEffect } from "react";
import Header from "../../components/Header";
import Grid from "@mui/material/Grid";
import { useWebSocket } from "../../hooks/useWebSocket";
import {
  Box,
  Button,
  Container,
  Stack,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableBody,
  Link,
  Backdrop,
  CircularProgress,
  Chip,
  alpha,
  MenuItem,
  useTheme,
  useMediaQuery,
  Avatar,
  Tooltip,
  Drawer,
} from "@mui/material";

import {
  Storage
} from "@mui/icons-material";

import { StockDialog } from "./StockDiaog";
import CloseIcon from "@mui/icons-material/Close";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import {
  useMaterialReactTable,
  type MRT_ColumnDef,
  type MRT_Row,
  MaterialReactTable,
  type MRT_Cell,
  flexRender,
} from "material-react-table";
import { data as mockData } from "./data/InventoryData";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import { useNavigate } from "react-router-dom";
import {
  AddBox as AddBoxIcon,
  RemoveCircle as RemoveCircleIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import type { InventoryRow } from "./components/InventoryModel";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import theme from "../../app/theme";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import DetailDrawer from "./components/InventoryDrawer";
export type InventoryOverview = {
  id: number;
  modelName: string;
  photoUrl?: string;
  costPrice: number;
  salePrice: number;
  targetCustomer?: string;
  barcode: string;
  barcodeUrl?: string;
  createdAt: string;
  actualQty: number;
  lockedQty: number;
  availableQty: number;
};

// 假的异步获取函数
async function fetchInventory(): Promise<InventoryRow[]> {
  return new Promise((resolve) => setTimeout(() => resolve(mockData), 200));
}

type DialogMode = "in" | "out" | null;
const ResponsiveTitle: React.FC = () => {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  return (
    <Typography
      variant={isMdUp ? "h4" : "h5"}
      sx={{ mb: { xs: 1, md: 2 }, px: { xs: 1, md: 0 } }}
    >
      Inventory Overview
    </Typography>
  );
};

const InventoryOverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tableData, setTableData] = useState<InventoryRow[]>(mockData);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [currentProduct, setCurrentProduct] =
    useState<InventoryRow | null>(null);

  // WebSocket监听库存更新
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}/ws/inventory`;
  const { isConnected, lastMessage } = useWebSocket(wsUrl);
  const [isFs, setIsFs] = useState(false);
  // 1) 用一个 map 来存每列头的 anchorEl
  const [columnAnchors, setColumnAnchors] = useState<
    Record<string, HTMLElement | null>
  >({});
  const setAnchorEl = (headerId: string, el: HTMLElement | null) =>
    setColumnAnchors((prev) => ({ ...prev, [headerId]: el }));
  const openDialog = (mode: DialogMode, product: InventoryRow) => {
    setDialogMode(mode);
    setCurrentProduct(product);
  };

  // Drawer 控制
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<InventoryRow | null>(null);
    const [validationErrors, setValidationErrors] = useState<
      Record<string, string | undefined>
    >({});
  const theme = useTheme();
  // 当屏幕宽度小于600px时，isSmUp = false
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));
  const openDeleteConfirmModal = (row: MRT_Row<InventoryRow>) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      //   deleteUser(row.original.id);
      console.log(row);
    }
  };

  const LOW_STOCK_THRESHOLD = 1;
  const closeDialog = () => setDialogMode(null);
  const columns = useMemo<MRT_ColumnDef<InventoryRow>[]>(
    () => [
      {
        accessorKey: "djj_code",
        header: "DJJ Code",
      },
      {
        accessorKey: "product_name",
        header: "Product Name",
      },
      {
        accessorKey: "manufacturer",
        header: "Manufacturer",
      },
      {
        accessorKey: "model",
        header: "Model",
      },
      {
        accessorKey: "last_update",
        header: "Last Update",
        Cell: ({ cell }) => new Date(cell.getValue<string>()).toLocaleString(),
      },
      {
        accessorKey: "category",
        header: "Category",
        enableColumnFilter: true,
        size: 120,
        Cell: ({ cell }) => {
          const val = cell.getValue<InventoryRow["category"]>();
          const colorMap: Record<
            typeof val,
            "warning" | "primary" | "success" | "info"
          > = {
            Machine: "warning",
            Parts: "primary",
            Tools: "success",
            Accessories: "info",
          };
          return (
            <Chip
              label={val}
              size="small"
              variant="filled"
              color={colorMap[val]}
            />
          );
        },
      },
      {
        accessorKey: "price",
        header: "Price",
        Cell: ({ cell }) => (
          <Typography>
            {cell.getValue<number>().toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
            })}
          </Typography>
        ),
      },
      {
        accessorKey: "regionStore",
        header: "Region – Store",
        size: 180,
        enableColumnFilter: true,
      },
      {
        accessorKey: "actualQty",
        header: "在库量",
        enableColumnFilter: true,
        size: 100,
      },
      {
        accessorKey: "lockedQty",
        header: "锁定量",
        enableColumnFilter: true,
        size: 100,
      },
      {
        accessorKey: "availableQty",
        header: "可用量",
        size: 100,
        enableColumnFilter: true,
        Cell: ({ cell }) => {
          const val = cell.getValue<number>();
          const isLow = val < LOW_STOCK_THRESHOLD;
          const bgColor = isLow ? "error.main" : "success.main";
          const contrastText = "#fff";

          return (
            <Tooltip
              arrow
              title={
                isLow
                  ? `⚠️ 库存低于 ${LOW_STOCK_THRESHOLD}，请尽快补货`
                  : `可用库存：${val}`
              }
            >
              <Avatar
                sx={{
                  bgcolor: bgColor,
                  color: contrastText,
                  width: 36,
                  height: 36,
                  fontSize: "1rem",
                  fontWeight: "bold",
                }}
              >
                {/* {isLow && <WarningAmberIcon sx={{ fontSize: '1rem' }} />} */}
                {val}
              </Avatar>
            </Tooltip>
          );
        },
      },
      // {
      //   accessorKey: "availableQty",
      //   header: "可用量",
      //   enableColumnFilter: true,
      //   size: 100,
      //   Cell: ({ cell }) => {
      //     const val = cell.getValue<number>();
      //     const color = val < 20 ? "error.main" : "success.main";
      //     return (
      //       <Box
      //         sx={{
      //           border: 2,
      //           borderColor: color,
      //           borderRadius: "50%",
      //           width: 32,
      //           height: 32,
      //           display: "flex",
      //           alignItems: "center",
      //           justifyContent: "center",
      //           mx: "auto",
      //         }}
      //       >
      //         <Typography sx={{ color, fontWeight: "bold" }}>{val}</Typography>
      //       </Box>
      //     );
      //   },
      // },
    ],
    []
  );

  useEffect(() => {
    fetchInventory()
      .then((data) => setTableData(data))
      .finally(() => setLoading(false));
  }, []);

  // WebSocket消息处理
  useEffect(() => {
    if (lastMessage) {
      console.log('📨 [库存页面] 收到WebSocket消息:', lastMessage);
      
      // 检查是否是库存更新消息 (后端发送的格式)
      if (lastMessage.data?.event === 'inventoryUpdated') {
        console.log('🔄 [库存页面] 库存已更新，刷新数据...');
        
        // 重新获取库存数据
        fetchInventory()
          .then((data) => {
            setTableData(data);
            console.log('✅ [库存页面] 库存数据已刷新');
          })
          .catch((error) => {
            console.error('❌ [库存页面] 刷新库存数据失败:', error);
          });
      }
    }
  }, [lastMessage]);

  const table = useMaterialReactTable({
    columns,
    data: tableData,
    enableColumnOrdering: false,
    enableRowActions: true,
    enableColumnPinning: true,
    enableEditing:true,
    editDisplayMode:'cell',
    enableColumnActions: true,
    enableRowSelection: true,
    enableColumnFilters: true, // ← 打开列过滤
    enableColumnFilterModes: true, // ← 打开多种过滤模式（=、≠、>、<…）
    enableStickyHeader: false,
    enableStickyFooter: false,
    initialState: {
      showGlobalFilter: true,
      showColumnFilters: true,
      columnPinning: {
        // 把选择框列钉在左边，操作列钉在右边
        left: ["mrt-row-select"],
        right: ["mrt-row-actions"],
      },
    },
    // 给每一行绑定点击事件
    muiTableBodyRowProps: ({ row }) => ({
      onClick: () => {
        setSelectedRow(row.original);
        setDrawerOpen(true);
      },
      sx: { cursor: "pointer" },
    }),
    paginationDisplayMode: "pages",
    muiPaginationProps: {
      showFirstButton: true,
      showLastButton: true,
      rowsPerPageOptions: [10, 20, 30],
      // no color prop
      sx: (theme) => ({
        ul: {
          // default items: very pale green text
          "& .MuiPaginationItem-root": {
            color: alpha(theme.palette.success.main, 0.88),
          },
          // selected page: a soft green pill
          "& .Mui-selected": {
            backgroundColor: alpha(theme.palette.success.main, 0.3),
            color: theme.palette.common.white,
          },
          // hover state: a slightly darker wash
          "& .MuiPaginationItem-root:hover": {
            backgroundColor: alpha(theme.palette.success.main, 0.15),
          },
        },
      }),
    },

    muiTablePaperProps: {
      sx: {
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        p: 0,
        overflow: "hidden",
        flexGrow: 1,
        td: {
          bgcolor: "#fff",
        },
      },
    },
    muiTableContainerProps: {
      sx: { minHeight: 0, height: "100%", p: 0 },
    },
  renderRowActionMenuItems: ({ row, closeMenu }) => [
        // <MenuItem
        //   key="edit"
        //   onClick={() => {
        //     closeMenu();
        //     table.setEditingRow(row); // 这句是核心，开启当前行的编辑模式
        //   }}
        // >
        //   <EditIcon color="primary" sx={{ mr: 1 }} />编辑
        // </MenuItem>,

      <MenuItem
        key="info"
        onClick={() => { closeMenu();

          // navigate(`/products/${row.original.djj_code}`);
            setSelectedRow(row.original);
            setDrawerOpen(true);
        }}
      ><InfoIcon color="primary" sx={{ mr: 1 }} />详情</MenuItem>,
      <MenuItem
        key="in"
        onClick={() => { 
          closeMenu();
          console.log('点击入库按钮, 产品信息:', row.original);
          const targetUrl = `/inventory/inbound/new?productId=${row.original.id}&productName=${encodeURIComponent(row.original.product_name)}`;
          console.log('跳转URL:', targetUrl);
          navigate(targetUrl);
        }}
      ><Storage color="info" sx={{ mr: 1 }} />入库</MenuItem>,
      <MenuItem
        key="out"
        onClick={() => { 
          closeMenu(); 
          navigate(`/inventory/outbound/new?productId=${row.original.id}&productName=${encodeURIComponent(row.original.product_name)}`);
        }}
      ><Storage color="success" sx={{ transform: "scaleX(-1)", mr: 1 }} />出库</MenuItem>,
      <MenuItem
        key="delete"
        onClick={() => { closeMenu(); openDeleteConfirmModal(row); }}
        sx={{ }}
      ><DeleteIcon color="error" sx={{ mr: 1 }} />删除</MenuItem>,
    ],
    // renderTopToolbarCustomActions: ({ table }) => (
    //   <Button
    //     variant="outlined"
    //     onClick={() => {
    //       table.setCreatingRow(true); //simplest way to open the create row modal with no default values
    //       //or you can pass in a row object to set default values with the createRow helper function
    //       // table.setCreatingRow(
    //       //   createRow(table, {
    //       //     //optionally pass in default values for the new row, useful for nested data or other complex scenarios
    //       //   }),
    //       // );
    //     }}
    //   >
    //     + Create New Inventory
    //   </Button>
    // ),
        onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: ({ values, table }) => {
      setTableData((prev) => [
        ...prev||[],
        {
          ...values,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);
      table.setCreatingRow(null); // 新建后关闭编辑行
    },
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: ({ row, table, values }) => {
      console.log(values);
      console.log(row);
      // table.setEditingRow(row); //exit editing mode
      setTableData((prev) =>
        prev?.map((row) => (row.djj_code === values.djj_code ? { ...row, ...values } : row))
      );
      table.setEditingRow(null); //exit editing mode
    },
    muiToolbarAlertBannerProps:{
      sx:{
        display:'none'
      }
    },
  });

  // // 给每行绑定 ref，以支持 MRT_TableBodyCell 的 sticky 计算
  // const rowRefs = useRef<Record<string, React.RefObject<HTMLTableRowElement>>>(
  //   {}
  // );

  // 抽出表格区域，方便复用
  const tableContent = (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        // px: 4,
        // py: 3,
        // m: 1,
        height: "100%",
        px:0,
        bgcolor: "background.paper",
      }}
    >
      <Stack sx={{ display: "flex", width: "100%",  }}>
        {/*<Header*/}
        {/*  title="Inventory Overview"*/}
        {/*  subtitle="Managing the Inventory items"*/}
        {/*></Header>*/}
        <MaterialReactTable table={table} />
      </Stack>
    </Box>
  );

  return (
    <>
      {/* 全局遮罩 in 前端加载时 */}
      <Backdrop
        open={loading}
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <Container
        disableGutters
        maxWidth={false}
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "auto",
          minHeight: 0,
          px:0,
        }}
      >
        {tableContent}
        <StockDialog
          mode={dialogMode}
          product={currentProduct||{} as InventoryRow}
          open={!!dialogMode}
          onClose={closeDialog}
          onSuccess={(updated) => {
            setTableData((old) =>
              old.map((r) => (r.id === updated.id ? { ...r, ...updated } : r))
            );
          }}
        />
      </Container>
      <DetailDrawer
        open={drawerOpen}
        row={selectedRow}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  );
};

export default InventoryOverviewPage;
