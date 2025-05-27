import React, { useMemo, useRef, useState, createRef,useEffect } from "react";
import Header from "../../components/Header";
import Grid from "@mui/material/Grid";
import {
  Box,
  IconButton,
  Dialog,
  AppBar,
  Toolbar,
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

import { StockDialog } from "./StockDiaog";
import CloseIcon from "@mui/icons-material/Close";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import {
  useMaterialReactTable,
  type MRT_ColumnDef,
  MRT_GlobalFilterTextField,
  MRT_ToggleFiltersButton,
  MRT_ShowHideColumnsButton,
  MRT_ToggleDensePaddingButton,
  MRT_TablePagination,
  MRT_TableBodyCell,
  MRT_ToolbarAlertBanner,
  MRT_TableHeadCell,
  MRT_ColumnActionMenu,
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
  return new Promise((resolve) =>
    setTimeout(() => resolve(mockData), 200)
  );
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
    useState<InventoryOverview | null>(null);
  const [isFs, setIsFs] = useState(false);
  // 1) 用一个 map 来存每列头的 anchorEl
  const [columnAnchors, setColumnAnchors] = useState<
    Record<string, HTMLElement | null>
  >({});
  const setAnchorEl = (headerId: string, el: HTMLElement | null) =>
    setColumnAnchors((prev) => ({ ...prev, [headerId]: el }));
  const openDialog = (mode: DialogMode, product: InventoryOverview) => {
    setDialogMode(mode);
    setCurrentProduct(product);
  };

  
  // Drawer 控制
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<InventoryRow | null>(null);

  const theme = useTheme();
  // 当屏幕宽度小于600px时，isSmUp = false
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));

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



  const table = useMaterialReactTable({
    columns,
    data: tableData,
    enableColumnOrdering: true,
    enableRowActions: true,
    enableColumnPinning: true,
    enableColumnActions: true,
    enableRowSelection: true,
    enableColumnFilters: true, // ← 打开列过滤
    enableColumnFilterModes: true, // ← 打开多种过滤模式（=、≠、>、<…）
    enableStickyHeader: true,
    enableStickyFooter: true,
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
    renderRowActionMenuItems: ({ closeMenu, row }) => [
      <MenuItem
        sx={{ pl: 5, pr: 5 }}
        key="in"
        onClick={() => {
          openDialog("in", row.original);
          closeMenu();
        }}
      >
        入库
      </MenuItem>,
      <MenuItem
        sx={{ pl: 5, pr: 5 }}
        key="out"
        onClick={() => {
          openDialog("out", row.original);
          closeMenu();
        }}
      >
        出库
      </MenuItem>,
      <MenuItem
        sx={{ pl: 5, pr: 5 }}
        key="info"
        onClick={() => {
          /* 查看详情逻辑 */ closeMenu();
          navigate(`/inventory/${row.original.djj_code}`);
        }}
      >
        查看详情
      </MenuItem>,
    ],
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
        px: 4,
        py: 3,
        m: 1,
        height: "100%",
        bgcolor: "background.paper",
      }}
    >
      <Stack sx={{ display: "flex", width: "100%", height: "100%", flex: 1 }}>
        {/* <Typography sx={{ mb: 2 }}>
          Inventory Overview
        </Typography> */}

        <Header
          title="Inventory Overview"
          subtitle="Managing the Inventory items"
        ></Header>
        {/* <ResponsiveTitle /> */}
        {/* 顶部工具栏 */}
        {/* <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mb: 1,
            mt: 1,
          }}
        >
          <MRT_GlobalFilterTextField table={table} />
          <Box>
            <MRT_ToggleFiltersButton table={table} />
            <MRT_ShowHideColumnsButton table={table} />
            <MRT_ToggleDensePaddingButton table={table} />
            {!isFs && (
              <IconButton onClick={() => setIsFs(true)} title="全屏">
                <FullscreenIcon />
              </IconButton>
            )}
          </Box>
        </Box> */}

        {/* 表格 */}
        {/* <TableContainer sx={{ flex: 1, position: "relative" }}>
          <Table>
            <TableHead>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id}>
                  {hg.headers.map((header) => (
                    <MRT_TableHeadCell
                      key={header.id}
                      header={header}
                      table={table}
                      align="center"
                      colSpan={header.colSpan}
                      sx={{ whiteSpace: "nowrap" }}
                    >
                      {!header.isPlaceholder &&
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      <MRT_ColumnActionMenu
                        header={header}
                        table={table}
                        anchorEl={columnAnchors[header.id] ?? null}
                        setAnchorEl={(el) => setAnchorEl(header.id, el)}
                      />
                    </MRT_TableHeadCell>
                  ))}
                </TableRow>
              ))}
            </TableHead>
            <TableBody>
              {table.getRowModel().rows.map((row, rowIndex) => {
                if (!rowRefs.current[row.id]) {
                  rowRefs.current[row.id] = createRef<HTMLTableRowElement>();
                }
                const rowRef = rowRefs.current[row.id]!;
                return (
                  <TableRow
                    key={row.id}
                    ref={rowRef}
                    hover
                    selected={row.getIsSelected()}
                  >
                    {row.getVisibleCells().map((cell, colIndex) => (
                      <MRT_TableBodyCell
                        key={cell.id}
                        cell={cell}
                        rowRef={rowRef}
                        staticColumnIndex={colIndex}
                        staticRowIndex={rowIndex}
                        table={table}
                        // 这三个属性可以让超出的文本一行显示并用省略号
                        sx={{
                          whiteSpace: "nowrap",
                          textAlign: "center", // ← 这个让内容居中
                        }}
                      />
                    ))}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer> */}

        <MaterialReactTable table={table} />

        {/* 分页 & 警告栏 */}
        {/* <MRT_TablePagination table={table} /> */}
        {/* <Box sx={{ mt: 1 }}>
          <MRT_ToolbarAlertBanner table={table} />
        </Box> */}
      </Stack>
    </Box>
  );


 return ( 
   <>
    {/* 全局遮罩 in 前端加载时 */}
      <Backdrop
        open={loading}
        sx={{ zIndex: theme => theme.zIndex.drawer + 1 }}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

 <Container
          maxWidth={false}
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            minHeight: 0,
          }}
        >
          {tableContent}
          <StockDialog
            mode={dialogMode}
            product={currentProduct}
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
      <Dialog
        fullScreen
        open={isFs}
        onClose={() => setIsFs(false)}
        PaperProps={{ sx: { bgcolor: "background.paper" } }}
      >
        <AppBar position="sticky">
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => setIsFs(false)}
              title="退出全屏"
            >
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, fontSize: "1rem" }}>
              Inventory Overview
            </Typography>
          </Toolbar>
        </AppBar>
        <Container
          maxWidth={false}
          sx={{ display: "flex", flexDirection: "column", height: "100%" }}
        >
          {tableContent}
          <StockDialog
            mode={dialogMode}
            product={currentProduct}
            open={!!dialogMode}
            onClose={closeDialog}
            onSuccess={(updated) => {
              setTableData((old) =>
                old.map((r) => (r.id === updated.id ? { ...r, ...updated } : r))
              );
            }}
          />
        </Container>
      </Dialog>
      </>
)
}

export default InventoryOverviewPage;