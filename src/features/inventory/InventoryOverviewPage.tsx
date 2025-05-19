// src/pages/InventoryOverviewPage.tsx
import React, { useMemo, useRef, useState } from 'react';
import {
  Box,
  Container,
  Stack,
  Typography,
  TextField,
  MenuItem,
  Button,
  IconButton,
  Breadcrumbs,
  Link,
  Paper,
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/SearchOutlined';
import { useReactToPrint } from 'react-to-print';
import * as XLSX from 'xlsx';
// —— 一定要命名导入！
import { MaterialReactTable, type MRT_ColumnDef } from 'material-react-table';

// 定义表格行类型
interface InventoryItem {
  code: string;
  productName: string;
  totalStock: number;
  syd: number;
  bne: number;
  mel: number;
  per: number;
  category: 'Machine' | 'Accessories' | 'Parts';
  price: number;
}

// 一点示例数据
const sampleData: InventoryItem[] = [
  { code: '#12512B', productName: 'LM946', totalStock: 883, syd: 400, bne: 200, mel: 100, per: 183, category: 'Machine',    price: 49.9 },
  { code: '#12523C', productName: 'LM930', totalStock: 738, syd: 350, bne: 180, mel: 120, per: 88,  category: 'Machine',    price: 34.36 },
  { code: '#51232A', productName: 'Ruffles', totalStock: 492, syd: 200, bne: 50,  mel: 150, per: 92,  category: 'Accessories', price: 29.74 },
  { code: '#23534D', productName: 'Paper Clip', totalStock: 922, syd: 300, bne: 400, mel: 100, per: 122, category: 'Accessories', price: 23.06 },
  { code: '#35622A', productName: 'Doritos', totalStock: 177, syd: 50,  bne: 30,  mel: 20,  per: 77,  category: 'Parts',      price: 87.44 },
  // …你可以随意再 push 更多行
];

const InventoryOverviewPage: React.FC = () => {
  // 1. 数据
  const [data] = useState<InventoryItem[]>(sampleData);

  // 2. 列定义
  const columns = useMemo<MRT_ColumnDef<InventoryItem>[]>(
    () => [
      { accessorKey: 'code',        header: 'DJJ Code' },
      { accessorKey: 'productName', header: 'Product Name' },
      { accessorKey: 'totalStock',  header: 'Total Stock' },
      { accessorKey: 'syd',         header: 'SYD' },
      { accessorKey: 'bne',         header: 'BNE' },
      { accessorKey: 'mel',         header: 'MEL' },
      { accessorKey: 'per',         header: 'PER' },
      {
        accessorKey: 'category',
        header: 'Category',
        Cell: ({ cell }) => {
          const val = cell.getValue<string>();
          const color = val === 'Machine' ? 'warning.main' : val === 'Parts' ? 'info.main' : 'grey.500';
          return (
            <Box
              component="span"
              sx={{
                px: 1.2,
                py: 0.3,
                borderRadius: 1,
                bgcolor: color,
                color: 'common.white',
                fontSize: '0.75rem',
                fontWeight: 500,
              }}
            >
              {val}
            </Box>
          );
        },
      },
      {
        accessorKey: 'price',
        header: 'Price',
        Cell: ({ cell }) => `$${cell.getValue<number>().toFixed(2)}`,
      },
      {
        id: 'actions',
        header: 'Actions',
        enableSorting: false,
        enableColumnActions: false,
        Cell: ({ row }) => (
          <Button size="small" onClick={() => alert(`查看 ${row.getValue('code')}`)}>
            View ▼
          </Button>
        ),
      },
    ],
    []
  );

  // 3. 过滤 & 打印 & 导出
  const [globalFilter, setGlobalFilter]     = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
    // 1) Create a ref
    const tableRef = useRef<HTMLDivElement>(null);

    // 2) Pass it as `contentRef`
    const handlePrint = useReactToPrint({
        contentRef: tableRef,
        documentTitle: 'Inventory Overview',
        // optionally suppress console errors if you want:
        suppressErrors: true,
    });
  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inventory');
    XLSX.writeFile(wb, 'inventory.xlsx');
  };

  return (
    <Container
      maxWidth="xl"
      sx={{
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',    
      }}
    >
    <Paper
        ref={tableRef}
        elevation={1}
        sx={{ flexGrow: 1, overflow: 'hidden', p: 2 }}
      >
      {/* 面包屑 + 标题 + 操作 */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
       <Breadcrumbs
        component="nav"
        aria-label="breadcrumb"
        separator="›"
        sx={{ fontSize: '0.875rem', mb: 1 }}
        >
        <Link underline="hover" color="inherit" href="/dashboard">
            Dashboard
        </Link>
        <Typography color="text.primary">Inventory Overview</Typography>
        </Breadcrumbs>
          <Typography variant="h4" mt={1}>Inventory Overview</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />}>+ Ship</Button>
      </Stack>

      {/* 筛选行 */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2} alignItems="center">
        <TextField
          select label="Filter Category" size="small"
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="Machine">Machine</MenuItem>
          <MenuItem value="Accessories">Accessories</MenuItem>
          <MenuItem value="Parts">Parts</MenuItem>
        </TextField>
        <TextField
          size="small" placeholder="Search…"
          value={globalFilter}
          onChange={e => setGlobalFilter(e.target.value)}
          InputProps={{ startAdornment: <SearchIcon color="action" /> }}
          sx={{ flexGrow: 1, maxWidth: 360 }}
        />
        <Stack direction="row" spacing={1}>
          <IconButton onClick={handlePrint}><PrintIcon /></IconButton>
          <IconButton onClick={handleExport}><DownloadIcon /></IconButton>
        </Stack>
      </Stack>

      {/* 白底卡片 + 表格 */}

        <MaterialReactTable<InventoryItem>
          columns={columns}
          data={data}
          enableGlobalFilter={false}
          manualFiltering
          initialState={{ pagination: { pageSize: 10, pageIndex: 0 } }}
          state={{
            globalFilter,
            columnFilters: categoryFilter ? [{ id: 'category', value: categoryFilter }] : [],
          }}
          renderTopToolbarCustomActions={() => null}
          renderBottomToolbar={() => null}
          muiTableBodyRowProps={({ row }) => ({
            onClick: () => console.log(row.original),
            sx: { cursor: 'pointer' },
          })}
        />
      </Paper>
    </Container>
  );
};



export default InventoryOverviewPage
InventoryOverviewPage.displayName = "InventoryOverviewPage" //方便以后调试使用