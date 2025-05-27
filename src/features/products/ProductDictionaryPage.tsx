// src/components/ProductDictionaryPage.tsx
import React, { useMemo, useState,useEffect } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  useMaterialReactTable,
} from "material-react-table";
import {
  Box,
  Card,
  CardHeader,
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
import CloseIcon from "@mui/icons-material/Close";
import { productData, type Product } from "../inventory/data/productData";
import Header from "../../components/Header";

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
      { accessorKey: "category", header: "类别", size: 100 },
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

  const [data, setdata] = useState<Product[]>();
  const [loading, setLoading] = useState(true);
   useEffect(() => {
    fetchInventory()
      .then((data) => setdata(data))
      .finally(() => setLoading(false));
  }, []);


  const table = useMaterialReactTable({
    columns,
    data: data ?? [],
    enableRowActions: true,
     enableColumnOrdering: false, // 关闭列拖动
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
    renderRowActionMenuItems: ({ closeMenu, row }) => [
      <MenuItem
        sx={{ pl: 5, pr: 5 }}
        key="in"
        onClick={() => {
          closeMenu();
        }}
      >
        入库
      </MenuItem>,
      <MenuItem
        sx={{ pl: 5, pr: 5 }}
        key="out"
        onClick={() => {
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