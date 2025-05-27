import React, { useState } from "react";
import {
  Box,
  Card,
  Typography,
  Button,
  Breadcrumbs,
  Link,
  TextField,
  MenuItem,
  Chip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import BrokenImageIcon from "@mui/icons-material/BrokenImage";

import { useNavigate } from "react-router-dom";


// 字段 label 和顺序
const FIELD_LABELS: Record<string, string> = {
  product_name: "Product Name",
  djj_code: "DJJ Code",
  model: "Model",
  category: "Category",
  manufacturer: "Manufacturer",
  supplier: "Supplier",
  manufacturer_code: "Manufacturer Code",
  price: "Price",
  specs: "Specs",
  unit: "Unit",
  standards: "Standards",
  warranty: "Warranty",
  remarks: "Remarks",
  last_update: "Last Update",
  marketing_info: "Marketing Info",
};
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
];

// 可选项举例（可根据实际维护）
const categoryOptions = [
  { value: "Machine", label: "Machine" },
  { value: "搬运设备", label: "搬运设备" },
  { value: "液压", label: "液压" },
  // ...
];
const unitOptions = [
  { value: "台", label: "台" },
  { value: "件", label: "件" },
];

// 假数据
const defaultProduct = {
  photoUrl: "",
  djj_code: "DJJ-10086",
  product_name: "Hydraulic Forklift Pro",
  manufacturer: "Awesome Lift Co.",
  supplier: "澳洲叉车有限公司",
  manufacturer_code: "AUSFORK",
  model: "PRO-X2",
  last_update: "2025-05-27T09:12:00",
  category: "Machine",
  price: 32900,
  specs: "2吨 2.5米",
  standards: "ISO9001",
  unit: "台",
  warranty: "12 months",
  marketing_info: "Best seller of 2025",
  remarks: "Special discount available",
};

export default function ProductEditPage() {
  const [form, setForm] = useState({ ...defaultProduct });
  const [saving, setSaving] = useState(false);
  const navigate =  useNavigate()
  // 统一处理表单变化
  const handleChange = (key: string, value: any) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // 保存模拟
  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert("保存成功: \n" + JSON.stringify(form, null, 2));
      // 实际可跳转详情页/刷新等
    }, 1000);
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", my: 4, px: 2,overflow:'auto' }}>
      {/* 面包屑 & 返回 */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Breadcrumbs>
          <Link underline="hover" color="inherit" href="#">
            Inventory
          </Link>
          <Link underline="hover" color="inherit" href="#">
            Products
          </Link>
          <Typography color="text.primary">Edit Product</Typography>
        </Breadcrumbs>
        <Button startIcon={<ArrowBackIcon />} variant="outlined" onClick={()=>{
            navigate(-1)
        }}>
          Back
        </Button>
      </Box>

      {/* 主信息区 */}
      <Card sx={{ display: "flex", p: 3, mb: 3, borderRadius: 3, boxShadow: 2, alignItems: "center" }}>
        {/* 产品图片 */}
        <Box sx={{
          width: 180, height: 180, display: "flex", alignItems: "center",
          justifyContent: "center", bgcolor: "#f4f4f6", borderRadius: 2, mr: 3
        }}>
          {form.photoUrl ? (
            <img src={form.photoUrl} alt={form.product_name}
                 style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: 12 }} />
          ) : (
            <BrokenImageIcon sx={{ fontSize: 80, color: "#bbb" }} />
          )}
        </Box>
        {/* 主参数 */}
        <Box sx={{ flex: 1 }}>
          <TextField
            label="Product Name"
            value={form.product_name}
            onChange={e => handleChange("product_name", e.target.value)}
            size="small"
            sx={{ mb: 1 }}
            fullWidth
          />
          <TextField
            label="Model"
            value={form.model}
            onChange={e => handleChange("model", e.target.value)}
            size="small"
            sx={{ mb: 1 }}
            fullWidth
          />
          <Chip label={form.category} color="primary" size="small" sx={{ mr: 1, fontSize: 13 }} />
          <TextField
            label="Price"
            type="number"
            value={form.price}
            onChange={e => handleChange("price", e.target.value)}
            size="small"
            sx={{ mt: 2, fontWeight: 600 }}
            InputProps={{ startAdornment: <span style={{ color: "#16b157", marginRight: 4 }}>$</span> }}
            fullWidth
          />
        </Box>
        {/* 图片上传（演示版） */}
        {/* <Box>
          <Button component="label" variant="outlined" size="small">
            上传图片
            <input type="file" hidden accept="image/*"
                   onChange={...} />
          </Button>
        </Box> */}
      </Card>

      {/* 表单区域 */}
      <Card sx={{ p: 3, borderRadius: 3, boxShadow: 2 }}>
        <Typography variant="h6" gutterBottom>
          Edit Product Info
        </Typography>
        <Box
          display="grid"
          gridTemplateColumns={{
            xs: "1fr",
            sm: "1fr 1fr",
            md: "1fr 1fr 1fr"
          }}
          gap={2}
        >
          {FIELDS_TO_SHOW.map((key) => {
            // 分类和单位等下拉框
            if (key === "category") {
              return (
                <Box key={key} sx={{ display: "flex", flexDirection: "column", p: 1 }}>
                  <Typography variant="subtitle2" sx={{ color: "text.secondary", fontSize: 14, mb: 0.5 }}>
                    {FIELD_LABELS[key]}
                  </Typography>
                  <TextField
                    select
                    size="small"
                    value={form[key]}
                    onChange={e => handleChange(key, e.target.value)}
                    fullWidth
                  >
                    {categoryOptions.map(opt => (
                      <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                    ))}
                  </TextField>
                </Box>
              );
            }
            if (key === "unit") {
              return (
                <Box key={key} sx={{ display: "flex", flexDirection: "column", p: 1 }}>
                  <Typography variant="subtitle2" sx={{ color: "text.secondary", fontSize: 14, mb: 0.5 }}>
                    {FIELD_LABELS[key]}
                  </Typography>
                  <TextField
                    select
                    size="small"
                    value={form[key]}
                    onChange={e => handleChange(key, e.target.value)}
                    fullWidth
                  >
                    {unitOptions.map(opt => (
                      <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                    ))}
                  </TextField>
                </Box>
              );
            }
            // 时间类型
            if (key === "last_update") {
              return (
                <Box key={key} sx={{ display: "flex", flexDirection: "column", p: 1 }}>
                  <Typography variant="subtitle2" sx={{ color: "text.secondary", fontSize: 14, mb: 0.5 }}>
                    {FIELD_LABELS[key]}
                  </Typography>
                  <TextField
                    type="datetime-local"
                    size="small"
                    value={form[key]?.slice(0, 16) || ""}
                    onChange={e => handleChange(key, e.target.value)}
                    fullWidth
                  />
                </Box>
              );
            }
            // 价格
            if (key.includes("price")) {
              return (
                <Box key={key} sx={{ display: "flex", flexDirection: "column", p: 1 }}>
                  <Typography variant="subtitle2" sx={{ color: "text.secondary", fontSize: 14, mb: 0.5 }}>
                    {FIELD_LABELS[key]}
                  </Typography>
                  <TextField
                    type="number"
                    size="small"
                    value={form[key]}
                    onChange={e => handleChange(key, e.target.value)}
                    InputProps={{ startAdornment: <span style={{ color: "#16b157", marginRight: 4 }}>$</span> }}
                    fullWidth
                  />
                </Box>
              );
            }
            // 默认文本
            return (
              <Box key={key} sx={{ display: "flex", flexDirection: "column", p: 1 }}>
                <Typography variant="subtitle2" sx={{ color: "text.secondary", fontSize: 14, mb: 0.5 }}>
                  {FIELD_LABELS[key]}
                </Typography>
                <TextField
                  size="small"
                  value={form[key] || ""}
                  onChange={e => handleChange(key, e.target.value)}
                  fullWidth
                />
              </Box>
            );
          })}
        </Box>
        <Box sx={{ textAlign: "right", mt: 3 }}>
          <Button
            startIcon={<SaveIcon />}
            onClick={handleSave}
            variant="contained"
            size="large"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </Button>
        </Box>
      </Card>
    </Box>
  );
}
