// src/pages/NewProductPage.tsx
import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  useTheme,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  Fade,
} from "@mui/material";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import AddIcon from "@mui/icons-material/Add";
import TableViewIcon from "@mui/icons-material/TableView";
import AppsIcon from "@mui/icons-material/Apps";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { ResponsivePie, type ComputedDatum } from "@nivo/pie";
import { tokens } from "../../theme";
import Header from "../../components/Header";

interface NewProduct {
  id: string;
  productName: string;
  demandDate: string;
  expectedPrice: number;
  customerInfo: string;
  supplierName: string;
  supplierCode: string;
  productDesc: string;
  techStatus: "待审核" | "已通过" | "已驳回";
  techComment: string;
  deliveryDate: string;
  purchaseComment: string;
  financeCost: number;
  financePrice: number;
  financeComment: string;
  djjCode: string;
  finalStatus: "待上线" | "已上线" | "已驳回";
}

const statusColors: Record<NewProduct["techStatus"], string> = {
  待审核: "#FF9800",
  已通过: "#4CAF50",
  已驳回: "#F44336",
};

const NewProductPage: React.FC = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // —— 假数据与状态定义（可替换成真实业务） —— 
  const [products, setProducts] = useState<NewProduct[]>([
    {
      id: "1",
      productName: "智能水表",
      demandDate: "2025-06-03",
      expectedPrice: 180,
      customerInfo: "张三 / 杭州某安装公司",
      supplierName: "杭州恒仪",
      supplierCode: "HY-2108X",
      productDesc: "支持NB-IoT上传，内置锂电池",
      techStatus: "待审核",
      techComment: "",
      deliveryDate: "2025-07-10",
      purchaseComment: "初步承诺交期较长",
      financeCost: 100,
      financePrice: 150,
      financeComment: "按行业标准利润核定",
      djjCode: "",
      finalStatus: "待上线",
    },
    {
      id: "2",
      productName: "工业插座箱",
      demandDate: "2025-06-01",
      expectedPrice: 220,
      customerInfo: "李四 / 深圳工业园",
      supplierName: "苏州强电",
      supplierCode: "QD-CB300",
      productDesc: "多规格防水工业插座盒",
      techStatus: "已通过",
      techComment: "结构合规",
      deliveryDate: "2025-06-20",
      purchaseComment: "供应商交期稳定",
      financeCost: 120,
      financePrice: 190,
      financeComment: "加价适中，具竞争力",
      djjCode: "DJJ0620A01",
      finalStatus: "已上线",
    },
    {
      id: "3",
      productName: "防爆箱",
      demandDate: "2025-05-28",
      expectedPrice: 650,
      customerInfo: "王五 / 中石油西部项目",
      supplierName: "重庆安控",
      supplierCode: "AK-FB890",
      productDesc: "II类防爆等级，定制接线配置",
      techStatus: "已驳回",
      techComment: "内部布局不符项目要求",
      deliveryDate: "2025-06-25",
      purchaseComment: "原厂暂无优化计划",
      financeCost: 400,
      financePrice: 580,
      financeComment: "如通过后可议价",
      djjCode: "",
      finalStatus: "已驳回",
    },
    {
      id: "4",
      productName: "室外温湿度采集终端",
      demandDate: "2025-06-02",
      expectedPrice: 320,
      customerInfo: "陈六 / 智慧农业",
      supplierName: "南京气传",
      supplierCode: "NQ-THS33",
      productDesc: "带太阳能供电，数据可上传云平台",
      techStatus: "待审核",
      techComment: "",
      deliveryDate: "2025-07-01",
      purchaseComment: "需核实是否支持LTE模块",
      financeCost: 190,
      financePrice: 310,
      financeComment: "根据竞品定价",
      djjCode: "",
      finalStatus: "待上线",
    },
    {
      id: "5",
      productName: "户外防雷盒",
      demandDate: "2025-05-25",
      expectedPrice: 120,
      customerInfo: "赵七 / 国网项目",
      supplierName: "苏州强电",
      supplierCode: "QD-FL22",
      productDesc: "铝合金壳体，适配电杆安装",
      techStatus: "已通过",
      techComment: "性能稳定",
      deliveryDate: "2025-06-15",
      purchaseComment: "交期无风险",
      financeCost: 60,
      financePrice: 95,
      financeComment: "略微上浮，便于促销",
      djjCode: "DJJ0615B02",
      finalStatus: "已上线",
    },
  ]);

  // 当前状态筛选 & 搜索文本 & 视图切换
  const [filterStatus, setFilterStatus] = useState<NewProduct["techStatus"] | null>(null);
  const [searchText, setSearchText] = useState("");
  const [isCardView, setIsCardView] = useState(true);

  // 对话框 & 表单状态
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<NewProduct | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [formProductName, setFormProductName] = useState("");
  const [formDemandDate, setFormDemandDate] = useState("");
  const [formExpectedPrice, setFormExpectedPrice] = useState(0);
  const [formCustomerInfo, setFormCustomerInfo] = useState("");
  const [formSupplierName, setFormSupplierName] = useState("");
  const [formSupplierCode, setFormSupplierCode] = useState("");
  const [formProductDesc, setFormProductDesc] = useState("");

  // —— 1. 根据 searchText 过滤（表格视图用） —— 
  const filteredBySearch = useMemo(() => {
    if (!searchText.trim()) return products;
    const lower = searchText.trim().toLowerCase();
    return products.filter(
      (p) =>
        p.productName.toLowerCase().includes(lower) ||
        p.customerInfo.toLowerCase().includes(lower)
    );
  }, [products, searchText]);

  // —— 2. 卡片视图双重过滤：先按状态，再按搜索 —— 
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchStatus = !filterStatus || p.techStatus === filterStatus;
      const matchSearch =
        !searchText ||
        p.productName.includes(searchText) ||
        p.customerInfo.includes(searchText);
      return matchStatus && matchSearch;
    });
  }, [products, filterStatus, searchText]);

  // —— 3. 饼图数据（只用“搜索后”结果） —— 
  const pieData = useMemo(() => {
    const countMap: Record<NewProduct["techStatus"], number> = {
      待审核: 0,
      已通过: 0,
      已驳回: 0,
    };
    filteredBySearch.forEach((p) => {
      countMap[p.techStatus] = (countMap[p.techStatus] || 0) + 1;
    });
    return (["待审核", "已通过", "已驳回"] as const).map((status) => ({
      id: status,
      label: status,
      value: countMap[status],
      color: statusColors[status],
    }));
  }, [filteredBySearch]);

  // 点击饼图切换状态
  const handleStatusClick = (datum: ComputedDatum<any>) => {
    const clicked = datum.id as NewProduct["techStatus"];
    setFilterStatus((prev) => (prev === clicked ? null : clicked));
  };

  // 技术审核“通过/驳回”
  const handleStatusChange = (status: "已通过" | "已驳回") => {
    if (!selected) return;
    setProducts((prev) =>
      prev.map((p) => (p.id === selected.id ? { ...p, techStatus: status, techComment: selected.techComment } : p))
    );
    setDialogOpen(false);
  };

  // “新增申请”提交
  const handleAddProduct = () => {
    if (!formProductName.trim()) return;
    const newItem: NewProduct = {
      id: Date.now().toString(),
      productName: formProductName,
      demandDate: formDemandDate || new Date().toISOString().slice(0, 10),
      expectedPrice: formExpectedPrice,
      customerInfo: formCustomerInfo,
      supplierName: formSupplierName,
      supplierCode: formSupplierCode,
      productDesc: formProductDesc,
      techStatus: "待审核",
      techComment: "",
      deliveryDate: new Date().toISOString().slice(0, 10),
      purchaseComment: "",
      financeCost: 0,
      financePrice: 0,
      financeComment: "",
      djjCode: "",
      finalStatus: "待上线",
    };
    setProducts((prev) => [newItem, ...prev]);
    // 清空表单
    setFormProductName("");
    setFormDemandDate("");
    setFormExpectedPrice(0);
    setFormCustomerInfo("");
    setFormSupplierName("");
    setFormSupplierCode("");
    setFormProductDesc("");
    setAddDialogOpen(false);
  };

  // DataGrid 列配置 (表格视图用)
  const tableColumns: GridColDef[] = [
    { field: "productName", headerName: "产品名称", flex: 1 },
    { field: "customerInfo", headerName: "客户信息", flex: 1.5 },
    { field: "expectedPrice", headerName: "预期售价", flex: 1 },
    { field: "supplierName", headerName: "供应商", flex: 1 },
    { field: "demandDate", headerName: "需求日期", flex: 1 },
    { field: "techStatus", headerName: "状态", flex: 1 },
    {
      field: "actions",
      headerName: "操作",
      sortable: false,
      flex: 1,
      renderCell: (params) => (
        <Button
          size="small"
          onClick={() => {
            setSelected(params.row as NewProduct);
            setDialogOpen(true);
          }}
        >
          审核
        </Button>
      ),
    },
  ];

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "grid",
        gridTemplateRows: "auto auto 1fr", // ① 三行布局：Header / Toolbar / 主内容
      }}
    >
      {/* ──── 第 1 行：Header 区 ──── */}
      <Box
        sx={{
          px: 2,
          py: 1,
          // borderBottom: `1px solid ${colors.grey[200]}`,
        }}
      >
        <Header title="新品上线" subtitle="新品审核与流程管理" />
      </Box>

      {/* ──── 第 2 行：搜索 + 切换 + 新增 + 导出 区 ──── */}
      <Box
        sx={{
          px: 2,
          py: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          // borderBottom: `1px solid ${colors.grey[100]}`,
        }}
      >
        <TextField
          size="small"
          placeholder="搜索产品 / 客户"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          sx={{ width: 300 }}
        />
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton size="small" onClick={() => setIsCardView((prev) => !prev)}>
            {isCardView ? <TableViewIcon /> : <AppsIcon />}
          </IconButton>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddDialogOpen(true)}
            sx={{ backgroundColor: colors.greenAccent[600], color: colors.grey[100] }}
          >
            新增申请
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadOutlinedIcon />}
            sx={{ backgroundColor: colors.blueAccent[700], color: colors.grey[100] }}
          >
            导出报表
          </Button>
        </Box>
      </Box>

      {/* ──── 第 3 行：主内容区 (卡片/表格) ──── */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr", // 这里先是单列，内部再用条件渲染
          minHeight: 0,               // 必须加，否则内部子项无法正确 scroll
        }}
      >
        {/* —— 卡片视图 —— */}
        <Fade in={isCardView} unmountOnExit>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 3fr", // 左 1 份 → 饼图；右 3 份 → 卡片列表
              gap: 2,
              height: "100%",    // 填满父容器剩余高度
              minHeight: 0,
              p: 1,
            }}
          >
            {/* —— 左侧：ResponsivePie 饼图区 —— */}
            <Box
              sx={{
                height: "100%",
                minHeight: 0,
                overflow: "hidden",
              }}
            >
              <ResponsivePie
                data={pieData}
                innerRadius={0.5}
                padAngle={1}
                cornerRadius={3}
                colors={(datum) => datum.data.color as string}
                margin={{ top: 40, right: 20, bottom: 40, left: 20 }}
                arcLinkLabelsSkipAngle={10}
                arcLinkLabelsTextColor="#444"
                arcLabelsSkipAngle={10}
                arcLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }}
                onClick={(datum) => handleStatusClick(datum as ComputedDatum<any>)}
                activeId={filterStatus ?? undefined}
                activeOuterRadiusOffset={8}
                style={{ height: "100%", width: "100%" }}
              />
            </Box>

            {/* —— 右侧：卡片列表区 —— */}
            <Box
              sx={{
                height: "100%",
                minHeight: 0,
                overflowY: "auto", // 如果卡片很多，就滚动这部分
                pr: 1,
              }}
            >
              <Box
                sx={{
                  display: "grid",
                  gap: 2,
                  // 响应式列数：xs=1 列，sm=2 列，md=3 列
                  gridTemplateColumns: {
                    xs: "repeat(1, 1fr)",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(3, 1fr)",
                  },
                }}
              >
                {(!filterStatus ? ["待审核", "已通过", "已驳回"] : [filterStatus]).map((stat) => {
                  const itemsThisStatus = filteredProducts.filter((p) => p.techStatus === stat);
                  if (itemsThisStatus.length === 0) return null;
                  return (
                    <Box key={stat} sx={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          display: "flex",
                          alignItems: "baseline",
                          gap: 1,
                        }}
                      >
                        <span>{stat}</span>
                        <span style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                          {itemsThisStatus.length}
                        </span>
                      </Typography>
                      <Box
                        sx={{
                          overflowY: "auto",
                          // 计算出“标题 + Stepper”占据了大约 64px 左右，把剩余区域让卡片滚动
                          maxHeight: "calc(100% - 64px)",
                        }}
                      >
                        {itemsThisStatus.map((item) => (
                          <Card
                            key={item.id}
                            sx={{
                              mb: 2,
                              borderLeft: `6px solid ${statusColors[item.techStatus]}`,
                            }}
                          >
                            <CardContent>
                              <Typography variant="h6">{item.productName}</Typography>
                              <Typography>客户：{item.customerInfo}</Typography>
                              <Typography>预期售价：¥{item.expectedPrice}</Typography>
                              <Typography>
                                供应商：{item.supplierName} ({item.supplierCode})
                              </Typography>
                              <Typography>需求日期：{item.demandDate}</Typography>
                              <Box mt={1}>
                                <Stepper
                                  activeStep={
                                    item.techStatus === "待审核"
                                      ? 0
                                      : item.techStatus === "已通过"
                                      ? 1
                                      : 2
                                  }
                                  alternativeLabel
                                >
                                  <Step>
                                    <StepLabel>技术审核</StepLabel>
                                  </Step>
                                  <Step>
                                    <StepLabel>采购确认</StepLabel>
                                  </Step>
                                  <Step>
                                    <StepLabel>财务定价</StepLabel>
                                  </Step>
                                  <Step>
                                    <StepLabel>完成上线</StepLabel>
                                  </Step>
                                </Stepper>
                              </Box>
                            </CardContent>
                            <CardActions>
                              <Button
                                size="small"
                                onClick={() => {
                                  setSelected(item);
                                  setDialogOpen(true);
                                }}
                              >
                                审核
                              </Button>
                            </CardActions>
                          </Card>
                        ))}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>
        </Fade>

        {/* —— 表格视图 —— */}
        <Fade in={!isCardView} unmountOnExit>
          <Box
            sx={{
              height: "100%",
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box sx={{ flex: 1, minHeight: 0 }}>
              <DataGrid
                rows={filteredBySearch}
                columns={tableColumns}
                getRowId={(row) => row.id}
                pageSize={8}
                rowsPerPageOptions={[8, 16, 32]}
                disableSelectionOnClick
                sx={{
                  "& .MuiDataGrid-root": {
                    border: "none",
                  },
                  "& .MuiDataGrid-cell": {
                    outline: "none !important",
                  },
                }}
              />
            </Box>
          </Box>
        </Fade>
      </Box>

      {/* —— 技术审核对话框 —— */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>技术审核</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="审核意见"
            multiline
            rows={3}
            value={selected?.techComment || ""}
            onChange={(e) => {
              if (selected) {
                setSelected({ ...selected, techComment: e.target.value });
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>取消</Button>
          <Button color="error" onClick={() => handleStatusChange("已驳回")}>
            驳回
          </Button>
          <Button variant="contained" onClick={() => handleStatusChange("已通过")}>
            通过
          </Button>
        </DialogActions>
      </Dialog>

      {/* —— 新增申请对话框 —— */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>新增新品申请</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="产品名称"
              fullWidth
              value={formProductName}
              onChange={(e) => setFormProductName(e.target.value)}
            />
            <TextField
              label="客户信息"
              fullWidth
              value={formCustomerInfo}
              onChange={(e) => setFormCustomerInfo(e.target.value)}
            />
            <TextField
              label="需求日期"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={formDemandDate}
              onChange={(e) => setFormDemandDate(e.target.value)}
            />
            <TextField
              label="预期售价"
              type="number"
              fullWidth
              value={formExpectedPrice}
              onChange={(e) => setFormExpectedPrice(Number(e.target.value))}
            />
            <TextField
              label="供应商名称"
              fullWidth
              value={formSupplierName}
              onChange={(e) => setFormSupplierName(e.target.value)}
            />
            <TextField
              label="供应商代码"
              fullWidth
              value={formSupplierCode}
              onChange={(e) => setFormSupplierCode(e.target.value)}
            />
            <TextField
              label="产品描述"
              multiline
              rows={3}
              fullWidth
              value={formProductDesc}
              onChange={(e) => setFormProductDesc(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>取消</Button>
          <Button variant="contained" onClick={handleAddProduct}>
            提交
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NewProductPage;
