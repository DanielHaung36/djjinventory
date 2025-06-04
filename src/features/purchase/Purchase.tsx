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
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { ResponsivePie, type ComputedDatum } from "@nivo/pie";

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

  // ----- 全量产品列表（mock 数据） -----
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

  // 当前选中的“状态筛选”：null 表示不按状态过滤，显示所有
  const [filterStatus, setFilterStatus] = useState<NewProduct["techStatus"] | null>(null);
  // 搜索关键字（用于卡片和表格的“搜索”功能）
  const [searchText, setSearchText] = useState("");
  // 卡片 / 表格 视图切换
  const [isCardView, setIsCardView] = useState(true);
  // “审核”对话框
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<NewProduct | null>(null);
  // “新增申请”对话框
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  // 新增表单字段
  const [formProductName, setFormProductName] = useState("");
  const [formDemandDate, setFormDemandDate] = useState("");
  const [formExpectedPrice, setFormExpectedPrice] = useState(0);
  const [formCustomerInfo, setFormCustomerInfo] = useState("");
  const [formSupplierName, setFormSupplierName] = useState("");
  const [formSupplierCode, setFormSupplierCode] = useState("");
  const [formProductDesc, setFormProductDesc] = useState("");

  // —— 1. 先根据 searchText 过滤出所有匹配的产品（仅供“表格视图”使用） ——
  const filteredBySearch = useMemo(() => {
    if (!searchText.trim()) return products;
    const lower = searchText.trim().toLowerCase();
    return products.filter(
      (p) =>
        p.productName.toLowerCase().includes(lower) ||
        p.customerInfo.toLowerCase().includes(lower)
    );
  }, [products, searchText]);

  // —— 2. “卡片视图”使用的双重过滤：先按状态，再按搜索 —— 
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

  // —— 饼图数据：仅根据“搜索后的结果” filteredBySearch 计算，不再包含状态筛选 —— 
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

  // 点击饼图 → 切换状态筛选 filterStatus；若重复点击则取消
  const handleStatusClick = (datum: ComputedDatum<any>) => {
    const clicked = datum.id as NewProduct["techStatus"];
    setFilterStatus((prev) => (prev === clicked ? null : clicked));
  };

  // 审核“通过”/“驳回”
  const handleStatusChange = (status: "已通过" | "已驳回") => {
    if (!selected) return;
    setProducts((prev) =>
      prev.map((p) =>
        p.id === selected.id
          ? { ...p, techStatus: status, techComment: selected.techComment }
          : p
      )
    );
    setDialogOpen(false);
  };

  // 提交“新增申请”
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

  // DataGrid 列配置（表格模式用）
  const columns: GridColDef[] = [
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
    <Box m={3} px={3} overflow={"auto"}>
      {/* —— 顶部：Title + 搜索 + 卡片/表格切换 + 新增 + 导出 —— */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="新品上线" subtitle="新品审核与流程管理" />
        <Box display="flex" alignItems="center" gap={2}>
          <TextField
            size="small"
            placeholder="搜索产品 / 客户"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            sx={{ width: 240 }}
          />
          <IconButton onClick={() => setIsCardView((prev) => !prev)}>
            {isCardView ? <TableViewIcon /> : <AppsIcon />}
          </IconButton>
          <Button
            sx={{
              backgroundColor: colors.greenAccent[600],
              color: colors.grey[100],
            }}
            onClick={() => setAddDialogOpen(true)}
          >
            <AddIcon sx={{ mr: 1 }} /> 新增申请
          </Button>
          <Button
            sx={{
              backgroundColor: colors.blueAccent[700],
              color: colors.grey[100],
            }}
          >
            <DownloadOutlinedIcon sx={{ mr: 1 }} /> 导出报表
          </Button>
        </Box>
      </Box>

      {/* —— 卡片视图：Responsive Grid + 饼图 + 卡片列表 —— */}
      <Fade in={isCardView} unmountOnExit>
        <Box>
          {/* —— 饼图：先按“搜索结果” filteredBySearch 过滤，再统计三种状态数量 —— */}
          <Box mt={2} height={220} width="100%">
            <ResponsivePie
              data={pieData}
              innerRadius={0.5}
              padAngle={1}
              cornerRadius={3}
              /** 颜色回调：从 datum.data.color 中读取 */
              colors={(datum) => datum.data.color as string}
              margin={{ top: 40, right: 60, bottom: 40, left: 60 }}
              arcLinkLabelsSkipAngle={10}
              arcLinkLabelsTextColor="#444"
              arcLabelsSkipAngle={10}
              arcLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }}
              onClick={(datum) => handleStatusClick(datum as ComputedDatum<any>)}
              // ❶ activeId / activeOuterRadiusOffset：高亮（拉出）被选中扇区
              activeId={filterStatus ?? undefined}
              activeOuterRadiusOffset={8}
            />
          </Box>

          {/* —— 卡片列表：三个状态列，响应式地分 1~3 列 —— */}
          <Box
            mt={2}
            sx={{
              display: "grid",
              gap: 3, // theme.spacing(2) = 16px
              gridTemplateColumns: {
                xs: "repeat(1, 1fr)", // <600px：一列
                sm: "repeat(2, 1fr)", // ≥600px：两列
                md: "repeat(3, 1fr)", // ≥900px：三列
              },
            }}
          >
            {(!filterStatus ? ["待审核", "已通过", "已驳回"] : [filterStatus]).map(
              (stat) => {
                // 只取当前状态的那部分
                const itemsThisStatus = filteredProducts.filter(
                  (p) => p.techStatus === stat
                );
                const count = itemsThisStatus.length;
                // 如果当前状态下没有任何记录，就直接不渲染这一列
                if (count === 0) return null;

                return (
                  <Box key={stat} sx={{ display: "flex", flexDirection: "column" }}>
                    {/* 标题：状态 + 数量（数字加粗） */}
                    <Typography
                      variant="h6"
                      mb={1}
                      sx={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: 1,
                      }}
                    >
                      <span>{stat}</span>
                      <span style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                        {count}
                      </span>
                    </Typography>

                    {/* 列内滚动区域：卡片较多时可以有限高度内滚动 */}
                    <Box sx={{ overflowY: "auto", maxHeight: 400 }}>
                      {itemsThisStatus.map((item) => (
                        <Card
                          key={item.id}
                          sx={{
                            mb: 2,
                            borderLeft: `6px solid ${statusColors[item.techStatus]}`,
                          }}
                        >
                          <CardContent>
                            <Typography variant="h6">
                              {item.productName}
                            </Typography>
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
              }
            )}
          </Box>
        </Box>
      </Fade>

      {/* —— 表格视图 —— */}
      <Fade in={!isCardView} unmountOnExit>
        <Box sx={{ height: 600, mt: 2 }}>
          <DataGrid
            rows={filteredBySearch}
            columns={columns}
            pageSize={8}
            rowsPerPageOptions={[8, 16, 32]}
            disableSelectionOnClick
            getRowId={(row) => row.id}
          />
        </Box>
      </Fade>

      {/* —— “技术审核” 对话框 —— */}
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

      {/* —— “新增申请” 对话框 —— */}
      <Dialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>新增新品申请</DialogTitle>
        <DialogContent>
          <Box
            component="form"
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              mt: 1,
            }}
          >
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
