// src/pages/ProductDetailPage.tsx
import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Tabs,
  Tab,
  Grid,
  Button,
  Breadcrumbs,
  Link,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  Paper,
  Divider,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import BrokenImageIcon from "@mui/icons-material/BrokenImage";
import DownloadIcon from "@mui/icons-material/CloudDownload";
import DeleteIcon from "@mui/icons-material/Delete";
import WarningIcon from "@mui/icons-material/WarningAmber";
import { useNavigate } from "react-router-dom";
// 伪产品数据
const product = {
  photoUrl: "",
  djj_code: "DJJ-10086",
  product_name: "Hydraulic Forklift Pro",
  manufacturer: "Awesome Lift Co.",
  supplier: "澳洲叉车有限公司",
  manufacturer_code: "AUSFORK",
  model: "PRO-X2",
  last_update: "2025-05-27T09:12:00",
  category: "Machine",
  subcategory: "搬运设备",
  tertiary_category: "液压",
  price: 32900,
  regionStore: "Sydney – Warehouse 1",
  actualQty: 8,
  lockedQty: 2,
  availableQty: 6,
  specs: "2吨 2.5米",
  standards: "ISO9001",
  unit: "台",
  rrp_price: 32800,
  weight_kg: 980,
  lift_capacity_kg: 2000,
  lift_height_mm: 2500,
  power_source: "Manual",
  warranty: "12 months",
  marketing_info: "Best seller of 2025",
  remarks: "Special discount available",
  // 其他静态信息
};

// 格式化显示（可根据实际补充）
function formatValue(key: string, val: any) {
  if (key.includes("price")) return `$${Number(val).toLocaleString()}`;
  if (key === "last_update") return new Date(val).toLocaleString();
  if (typeof val === "boolean") return val ? "Yes" : "No";
  return val ?? "-";
}

// 建议自定义顺序，不要全量 Object.entries
const FIELDS_TO_SHOW = [
  "product_name",
  "djj_code",
  "model",
  "category",
  "manufacturer",
  "supplier",
  "manufacturer_code",
  "price",
  "specs",
  "unit",
  "standards",
  "warranty",
  "remarks",
  "last_update",
  "marketing_info",
  // ...你想展现的字段
];


// 字段 label 映射
const FIELD_LABELS: Record<string, string> = {
  product_name: "Product Name",
  model: "Model",
  category: "Category",
  manufacturer: "Manufacturer",
  supplier: "Supplier",
  manufacturer_code: "Manufacturer Code",
  djj_code: "DJJ Code",
  price: "Price",
  rrp_price: "RRP Price",
  specs: "Specs",
  standards: "Standards",
  unit: "Unit",
  warranty: "Warranty",
  remarks: "Remarks",
  last_update: "Last Update",
  tertiary_category: "Tertiary Category",
  subcategory: "Subcategory",
  weight_kg: "Weight (kg)",
  lift_capacity_kg: "Lift Capacity (kg)",
  lift_height_mm: "Lift Height (mm)",
  power_source: "Power Source",
  marketing_info: "Marketing Info",
  // ...补充需要显示的字段
};

// 多仓库存
const stockRecords = [
  {
    region_store: "Sydney – Warehouse 1",
    actualQty: 8,
    lockedQty: 2,
    availableQty: 6,
  },
  {
    region_store: "Brisbane – Warehouse A",
    actualQty: 74,
    lockedQty: 34,
    availableQty: 40,
  },
  {
    region_store: "Perth – Main",
    actualQty: 12,
    lockedQty: 2,
    availableQty: 10,
  },
];


// 日志伪数据
const logData = [
  {
    date: "2025/05/24 10:00",
    type: "Inbound",
    qty: 12,
    warehouse: "Sydney – Warehouse 1",
    operator: "Alice",
    reference: "PO-001",
    notes: "Restocked",
  },
  {
    date: "2025/05/26 17:30",
    type: "Outbound",
    qty: 6,
    warehouse: "Sydney – Warehouse 1",
    operator: "Bob",
    reference: "SO-123",
    notes: "Customer delivery",
  },
];

const approvalData = [
  {
    step: "Request",
    approver: "Manager",
    status: "Approved",
    time: "2025/05/24 11:00",
    comment: "Fast approval",
  },
  {
    step: "Finance",
    approver: "CFO",
    status: "Pending",
    time: "",
    comment: "",
  },
];

const attachmentData = [
  {
    name: "Forklift_Manual.pdf",
    type: "PDF",
    size: "2.5 MB",
    uploaded: "2025-05-25",
  },
  {
    name: "Warranty_Certificate.jpg",
    type: "Image",
    size: "1.2 MB",
    uploaded: "2025-05-26",
  },
];

// 页签名
const TAB_KEYS = [
  "basic",
  "inventory",
  "logs",
  "approvals",
  "attachments",
] as const;

const tabLabels = {
  basic: "Basic Info",
  inventory: "Inventory",
  logs: "Logs",
  approvals: "Approvals",
  attachments: "Attachments",
};

export default function ProductDetailPage() {
  const [tab, setTab] = useState<typeof TAB_KEYS[number]>("basic");
  const navigate =  useNavigate()
  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", my: 4, px: 2 ,overflow:'auto'}}>
      {/* 面包屑 & 返回 */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Breadcrumbs>
          <Link underline="hover" color="inherit" href="#">
            Inventory
          </Link>
          <Link underline="hover" color="inherit" href="#">
            Products
          </Link>
          <Typography color="text.primary">Product Detail</Typography>
        </Breadcrumbs>
        <Button startIcon={<ArrowBackIcon />} variant="outlined">
          Back
        </Button>
      </Box>

      {/* 主信息区 */}
      <Card sx={{ display: "flex", p: 3, mb: 3, borderRadius: 3, boxShadow: 2, alignItems: "center" }}>
        {/* 产品图片 */}
        <Box sx={{ width: 180, height: 180, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#f4f4f6", borderRadius: 2, mr: 3 }}>
          {product.photoUrl ? (
            <img src={product.photoUrl} alt={product.product_name} style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: 12 }} />
          ) : (
            <BrokenImageIcon sx={{ fontSize: 80, color: "#bbb" }} />
          )}
        </Box>
        {/* 主参数 */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>{product.product_name}</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>Model: {product.model}</Typography>
          <Chip label={product.category} color="primary" size="small" sx={{ mr: 1, fontSize: 13 }} />
          <Typography variant="h6" sx={{ mt: 2, fontWeight: 600, color: "success.main" }}>
            ${product.price.toLocaleString()}
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}><Typography variant="body2">DJJ Code: {product.djj_code}</Typography></Grid>
            <Grid item xs={6}><Typography variant="body2">Manufacturer: {product.manufacturer}</Typography></Grid>
            <Grid item xs={6}><Typography variant="body2">Region: {product.regionStore}</Typography></Grid>
            <Grid item xs={6}><Typography variant="body2">Last Update: {new Date(product.last_update).toLocaleString()}</Typography></Grid>
          </Grid>
        </Box>
        <Box>
          <Button startIcon={<EditIcon />} variant="contained" color="primary" sx={{ minWidth: 100 }} onClick={()=>{

             navigate(`/inventory/edit/${product.djj_code}`);
          }}>
            Edit
          </Button>
        </Box>
      </Card>

      {/* Tab 切换区 */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        {TAB_KEYS.map((key) => (
          <Tab key={key} label={tabLabels[key]} value={key} />
        ))}
      </Tabs>

      {/* 内容区 */}
      <Box>
        {tab === "basic" && (
          // 渲染
<Card sx={{ p: 3, mb: 2 }}>
  <Typography variant="h6" gutterBottom>
    Basic Info
  </Typography>
<Box
  display="grid"
  gridTemplateColumns={{
    xs: "1fr",        // 手机：一行一列
    sm: "1fr 1fr",    // 平板：一行两列
    md: "1fr 1fr 1fr" // 桌面：一行三列
  }}
  gap={2}
>
  {FIELDS_TO_SHOW.map((key) => (
    <Box
      key={key}
      sx={{
        display: "flex",
        flexDirection: "column",
        p: 1,
        borderRadius: 1,
        // 可选加点分割线/背景
        // bgcolor: "background.paper",
        // boxShadow: 1,
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{ color: "text.secondary", fontSize: 14, mb: 0.5 }}
      >
        {FIELD_LABELS[key] ?? key}
      </Typography>
      <Typography
        variant="body1"
        sx={{
          fontWeight: 500,
          color: key.includes("price") ? "success.main" : "text.primary",
        }}
      >
        {formatValue(key, product[key])}
      </Typography>
    </Box>
  ))}
</Box>
      </Card>
        )}

        {tab === "inventory" && (
           <Card sx={{ p: 3, mb: 2 }}>
            <Typography variant="h6" gutterBottom>Inventory</Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Region – Store</TableCell>
                  <TableCell>Actual Qty</TableCell>
                  <TableCell>Locked Qty</TableCell>
                  <TableCell>Available Qty</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stockRecords.map((rec, i) => (
                  <TableRow key={i}>
                    <TableCell>{rec.region_store}</TableCell>
                    <TableCell>{rec.actualQty}</TableCell>
                    <TableCell>{rec.lockedQty}</TableCell>
                    <TableCell>
                      {rec.availableQty < 5 && <WarningIcon color="error" sx={{ verticalAlign: "middle", mr: 1 }} />}
                      {rec.availableQty}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}

        {tab === "logs" && (
          <Card sx={{ p: 3, mb: 2 }}>
            <Typography variant="h6" gutterBottom>Logs</Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Qty</TableCell>
                  <TableCell>Warehouse</TableCell>
                  <TableCell>Operator</TableCell>
                  <TableCell>Reference</TableCell>
                  <TableCell>Notes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logData.map((log, i) => (
                  <TableRow key={i}>
                    <TableCell>{log.date}</TableCell>
                    <TableCell>
                      <Chip
                        label={log.type}
                        color={log.type === "Inbound" ? "success" : log.type === "Outbound" ? "warning" : "default"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{log.qty}</TableCell>
                    <TableCell>{log.warehouse}</TableCell>
                    <TableCell>{log.operator}</TableCell>
                    <TableCell>{log.reference}</TableCell>
                    <TableCell>{log.notes}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}

        {tab === "approvals" && (
          <Card sx={{ p: 3, mb: 2 }}>
            <Typography variant="h6" gutterBottom>Approvals</Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Step</TableCell>
                  <TableCell>Approver</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>Comment</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {approvalData.map((a, i) => (
                  <TableRow key={i}>
                    <TableCell>{a.step}</TableCell>
                    <TableCell>{a.approver}</TableCell>
                    <TableCell>{a.status}</TableCell>
                    <TableCell>{a.time}</TableCell>
                    <TableCell>{a.comment}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}

        {tab === "attachments" && (
          <Card sx={{ p: 3, mb: 2 }}>
            <Typography variant="h6" gutterBottom>Attachments</Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Size</TableCell>
                  <TableCell>Uploaded</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attachmentData.map((att, i) => (
                  <TableRow key={i}>
                    <TableCell>{att.name}</TableCell>
                    <TableCell>{att.type}</TableCell>
                    <TableCell>{att.size}</TableCell>
                    <TableCell>{att.uploaded}</TableCell>
                    <TableCell>
                      <IconButton size="small"><DownloadIcon /></IconButton>
                      <IconButton size="small" color="error"><DeleteIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </Box>
    </Box>
  );
}
