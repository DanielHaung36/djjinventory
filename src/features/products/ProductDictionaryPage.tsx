// src/components/ProductDictionaryPage.tsx
import React, { useMemo, useState,useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import type { InventoryRow } from "../inventory/data/InventoryData";
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_Row,
  useMaterialReactTable,
} from "material-react-table";
import {
  Box,
  Card,
  CardHeader,
  Button,
  Chip,
  CardContent,
  IconButton,
  useTheme,
  Typography,
  alpha,
  MenuItem,
  Stack,
  Backdrop,
  CircularProgress,
  Link as MuiLink,
} from "@mui/material";

import {
  AddBox as AddBoxIcon,
  RemoveCircle as RemoveCircleIcon,
  Info as InfoIcon,
  Storage
  
} from "@mui/icons-material";

import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { productData, type Product } from "../inventory/data/productData";
import Header from "../../components/Header";
type DialogMode = "in" | "out" | null;
// 假的异步获取函数
async function fetchInventory(): Promise<Product[]> {
  return new Promise((resolve) =>
    setTimeout(() => resolve(productData), 200)
  );
}


const ProductDictionaryPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [selectedRow, setSelectedRow] = useState<Product | null>(null);
  const columns = useMemo<MRT_ColumnDef<Product>[]>(
    () => [
      { accessorKey: "djj_code", header: "DJJ Code", size: 100 },
      { accessorKey: "status", header: "状态", size: 80 },
      { accessorKey: "supplier", header: "供货商", size: 120 },
      { accessorKey: "manufacturer_code", header: "厂家代码", size: 130 },
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
      { accessorKey: "subcategory", header: "子类", size: 120 },
      { accessorKey: "tertiary_category", header: "三级类", size: 120 },
      { accessorKey: "name_cn", header: "品名(中文)", size: 150 },
      { accessorKey: "name_en", header: "品名(英文)", size: 180 },
      { accessorKey: "specs", header: "规格/适配机型", size: 150 },
      { accessorKey: "standards", header: "标准", size: 120 },
      { accessorKey: "unit", header: "单位", size: 80 },
      { accessorKey: "currency", header: "货币", size: 80 },
      {
        accessorKey: "rrp_price",
        header: "RRP 价格",
        size: 100,
        Cell: ({ cell }) =>
          cell.getValue<number>().toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
          }),
      },
      { accessorKey: "standard_warranty", header: "保修", size: 120 },
      { accessorKey: "remarks", header: "备注", size: 150 },
      { accessorKey: "weight_kg", header: "重量(kg)", size: 100 },
      { accessorKey: "lift_capacity_kg", header: "起重(kg)", size: 110 },
      { accessorKey: "lift_height_mm", header: "起升高度(mm)", size: 120 },
      { accessorKey: "power_source", header: "动力源", size: 120 },
      { accessorKey: "other_specs", header: "其他配置", size: 150 },
      { accessorKey: "warranty", header: "质保", size: 100 },
      { accessorKey: "marketing_info", header: "营销信息", size: 180 },
      { accessorKey: "training_docs", header: "知识资料", size: 180 },
      { accessorKey: "syd_stock", header: "SYD 库存", size: 100 },
      { accessorKey: "per_stock", header: "PER 库存", size: 100 },
      { accessorKey: "bne_stock", header: "BNE 库存", size: 100 },
      {
        accessorKey: "last_update",
        header: "最后更新",
        size: 140,
        Cell: ({ cell }) => new Date(cell.getValue<string>()).toLocaleString(),
      },
      { accessorKey: "last_modified_by", header: "修改人", size: 100 },
      {
        accessorKey: "product_url",
        header: "链接",
        size: 100,
        Cell: ({ cell }) => (
          <MuiLink
            href={cell.getValue<string>()}
            target="_blank"
            rel="noopener"
            underline="hover"
          >
            打开
          </MuiLink>
        ),
      },
    ],
    []
  );
    const [currentProduct, setCurrentProduct] = useState<Product | null>(
      null
    );
    const [validationErrors, setValidationErrors] = useState<
      Record<string, string | undefined>
    >({});
 const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [data, setdata] = useState<Product[]>();
  
  const [loading, setLoading] = useState(true);
   useEffect(() => {
    fetchInventory()
      .then((data) => setdata(data))
      .finally(() => setLoading(false));
  }, []);

  const openDialog = (mode: DialogMode, product: Product) => {
    setDialogMode(mode);
    setCurrentProduct(product);
  };

    const openDeleteConfirmModal = (row: MRT_Row<Product>) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      //   deleteUser(row.original.id);
      console.log(row);
    }
  };


  const table = useMaterialReactTable({
    columns,
    data: data ?? [],
    enableRowActions: true,
    enableEditing: true,
    enableColumnOrdering: false, // 关闭列拖动
    editDisplayMode: "row", // 👈 只需加这句
    enableSorting: false, // 关闭全局排序
    enableColumnPinning: true,
    enableColumnActions: true,
    // enableRowVirtualization: true,
    enableRowSelection: true,
    enableColumnFilters: true, // ← 打开列过滤
    enableColumnFilterModes: true, // ← 打开多种过滤模式（=、≠、>、<…）
    enableStickyHeader: true,
    enableStickyFooter: true,
    // enableRowVirtualization: true,
    initialState: {
      showGlobalFilter: true,
      showColumnFilters: true,
      density: 'spacious',
      columnPinning: {
        // 把选择框列钉在左边，操作列钉在右边
        left: ["mrt-row-select"],
        right: ["mrt-row-actions"],
      },
    },
    muiExpandButtonProps:{
      sx:{
        CollapseProps: { timeout: 0 }
      }
    },
        muiExpandAllButtonProps:{
            sx:{
        CollapseProps: { timeout: 0 }
      }
        },
    muiSelectCheckboxProps:{
         disableRipple: true,
    },
    // 给每一行绑定点击事件
    muiTableBodyRowProps: ({ row }) => ({
      onClick: () => {
        setSelectedRow(row.original);
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
        flex: 1,
        // overflow: "hidden",
        boxShadow: theme.shadows[1],
        borderRadius: 1,
        height: "100%",
        "& .MuiTableRow-root:nth-of-type(odd)": {
          backgroundColor: alpha(theme.palette.primary.light, 0.13),
        },
        "& .MuiTableRow-root:hover": {
          backgroundColor: alpha(theme.palette.primary.light, 0.1),
        },
        "& .MuiTableHead-root th": {
          backgroundColor: "#F5F6FA",
          color: "rgba(90, 96, 127, 1)",
        },
        "& .MuiTableBody-root tr": {
          backgroundColor: "#fff !important",
          color: "rgba(19, 21, 35, 1)",
          fontSize: "3em",
        },
      },
    },
    muiTableContainerProps: {
      sx: {
        minHeight: 0,
        height: "100%",
        overflow: "auto",
        display: "flex",
        flexGrow: 1,
      },
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
        onClick={() => { closeMenu(); navigate(`/products/${row.original.djj_code}`); }}
      ><InfoIcon color="primary" sx={{ mr: 1 }} />详情</MenuItem>,
      <MenuItem
        key="in"
        onClick={() => { openDialog("in", row.original);  closeMenu();}}
      ><Storage color="info" sx={{ mr: 1 }} />入库</MenuItem>,
      <MenuItem
        key="out"
        onClick={() => { closeMenu(); openDialog("out", row.original); }}
      ><Storage color="success" sx={{ transform: "scaleX(-1)", mr: 1 }} />出库</MenuItem>,
      <MenuItem
        key="delete"
        onClick={() => { closeMenu(); openDeleteConfirmModal(row); }}
        sx={{ }}
      ><DeleteIcon color="error" sx={{ mr: 1 }} />删除</MenuItem>,
    ],
    renderTopToolbarCustomActions: ({ table }) => (
      <Button
        variant="outlined"
        onClick={() => {
          table.setCreatingRow(true); //simplest way to open the create row modal with no default values
          //or you can pass in a row object to set default values with the createRow helper function
          // table.setCreatingRow(
          //   createRow(table, {
          //     //optionally pass in default values for the new row, useful for nested data or other complex scenarios
          //   }),
          // );
        }}
      >
        + Create New Product
      </Button>
    ),
        onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: ({ values, table }) => {
      setdata((prev) => [
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
      setdata((prev) =>
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

  return (
    <>
        {/* 全局遮罩 in 前端加载时 */}
      <Backdrop
        open={loading}
        sx={{ zIndex: theme => theme.zIndex.drawer + 1 }}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

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
        
        <Header title="Product List" subtitle="Looking for the product information" ></Header>
        <MaterialReactTable table={table} />
      </Stack>
    </Box>
   </>
  );
};

export default ProductDictionaryPage;
ProductDictionaryPage.displayName = "ProductDictionaryPage";