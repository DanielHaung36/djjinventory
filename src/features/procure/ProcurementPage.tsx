// src/pages/ProcurementPage.tsx
import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  Fade,
  CircularProgress,
} from "@mui/material";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import AddIcon from "@mui/icons-material/Add";
import TableViewIcon from "@mui/icons-material/TableView";
import AppsIcon from "@mui/icons-material/Apps";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { ResponsivePie } from "@nivo/pie";
import { tokens } from "../../theme";
import Header from "../../components/Header";

// —— 一、配色字典：将“货品性质”映射到具体颜色 ——
const natureColors: Record<string, string> = {
  合同件: "#FF9800", // 橙色
  质保件: "#4CAF50", // 绿色
  赠送件: "#2196F3", // 蓝色
  自购件: "#9C27B0", // 紫色
  待发件: "#F44336", // 红色
};

// —— 二、采购单接口定义 ——
interface PurchaseOrder {
  id: string; // 唯一 ID
  contractNumber: string; // 合同号
  djjCode: string; // DJJ Code
  supplierCode: string; // 厂家唯一代码
  orderNumber?: string; // 订单号
  purchaseCategory: string; // 采购性质
  productNature: // 货品性质
  "合同件" | "质保件" | "赠送件" | "自购件" | "待发件";
  currency: "人民币" | "美金" | "澳币"; // 货币
  usdAudRate: number; // 美元→AUD 汇率
  rmbAudRate: number; // 人民币→AUD 汇率
  unitPrice: number; // 单价
  discount: number; // 折扣
  vinCode: string; // 车架号
  engineNo: string; // 发动机号
  productionDate: string; // 生产日期
  certificateFile: File | null; // 合格证附件
  warehouse: string; // 仓库/门店
  remark: string; // 备注
  inStockApproval: // 入库审核选项
  "同意入库" | "不同意入库" | "待定";
  inStockStatus: "已入库" | "未入库"; // 当前入库状态
  inStockTime: string; // 系统自动入库时间
}

// —— 三、示例 mockData ——
const MOCK_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: "P001",
    contractNumber: "JH240411AULG",
    djjCode: "DJJ00001",
    supplierCode: "LM930",
    purchaseCategory: "买断",
    productNature: "合同件",
    currency: "澳币",
    usdAudRate: 0,
    rmbAudRate: 0,
    unitPrice: 14491,
    discount: 0,
    vinCode: "VIN123456",
    engineNo: "ENG654321",
    productionDate: "2024-01-15",
    certificateFile: null,
    warehouse: "悉尼仓库A",
    remark: "按合同条款执行",
    inStockApproval: "同意入库",
    inStockStatus: "已入库",
    inStockTime: "2024-06-17T15:36:09",
  },
  {
    id: "P007",
    contractNumber: "JH240411AULG",
    djjCode: "DJJ00001",
    supplierCode: "LM930",
    purchaseCategory: "买断",
    productNature: "合同件",
    currency: "澳币",
    usdAudRate: 0,
    rmbAudRate: 0,
    unitPrice: 14491,
    discount: 0,
    vinCode: "VIN123456",
    engineNo: "ENG654321",
    productionDate: "2024-01-15",
    certificateFile: null,
    warehouse: "悉尼仓库A",
    remark: "按合同条款执行",
    inStockApproval: "同意入库",
    inStockStatus: "已入库",
    inStockTime: "2024-06-17T15:36:09",
  },
  {
    id: "P002",
    contractNumber: "JH240412AULG",
    djjCode: "DJJ00002",
    supplierCode: "LM932",
    purchaseCategory: "买断",
    productNature: "质保件",
    currency: "美金",
    usdAudRate: 1.35,
    rmbAudRate: 0,
    unitPrice: 1200,
    discount: 50,
    vinCode: "VIN223344",
    engineNo: "ENG332211",
    productionDate: "2024-02-10",
    certificateFile: null,
    warehouse: "悉尼仓库B",
    remark: "质保件，小批量测试",
    inStockApproval: "同意入库",
    inStockStatus: "已入库",
    inStockTime: "2024-07-01T10:20:30",
  },
  {
    id: "P003",
    contractNumber: "JH240413AULG",
    djjCode: "DJJ00003",
    supplierCode: "LM940",
    purchaseCategory: "买断",
    productNature: "赠送件",
    currency: "人民币",
    usdAudRate: 0,
    rmbAudRate: 0.2,
    unitPrice: 0,
    discount: 0,
    vinCode: "VIN998877",
    engineNo: "ENG887766",
    productionDate: "2024-03-05",
    certificateFile: null,
    warehouse: "悉尼仓库A",
    remark: "厂家赠送，费用已扣除",
    inStockApproval: "待定",
    inStockStatus: "未入库",
    inStockTime: "",
  },
  {
    id: "P004",
    contractNumber: "JH240414AULG",
    djjCode: "DJJ00004",
    supplierCode: "LM950",
    purchaseCategory: "买断",
    productNature: "自购件",
    currency: "人民币",
    usdAudRate: 0,
    rmbAudRate: 0.2,
    unitPrice: 8000,
    discount: 0,
    vinCode: "VIN556644",
    engineNo: "ENG446655",
    productionDate: "2024-04-20",
    certificateFile: null,
    warehouse: "悉尼仓库C",
    remark: "自淘宝购买，含税",
    inStockApproval: "不同意入库",
    inStockStatus: "未入库",
    inStockTime: "",
  },
  {
    id: "P005",
    contractNumber: "JH240415AULG",
    djjCode: "DJJ00005",
    supplierCode: "LM960",
    purchaseCategory: "买断",
    productNature: "待发件",
    currency: "澳币",
    usdAudRate: 0,
    rmbAudRate: 0,
    unitPrice: 2200,
    discount: 0,
    vinCode: "VIN334411",
    engineNo: "ENG114433",
    productionDate: "2024-05-12",
    certificateFile: null,
    warehouse: "悉尼仓库B",
    remark: "客户已付款，待发",
    inStockApproval: "同意入库",
    inStockStatus: "未入库",
    inStockTime: "",
  },
];

const ProcurementPage = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // 采购单列表 state
  const [orders, setOrders] = useState<PurchaseOrder[]>(MOCK_PURCHASE_ORDERS);

  // 卡片视图 状态筛选 (货品性质)
  const [filterNature, setFilterNature] = useState<
    PurchaseOrder["productNature"] | null
  >(null);

  // 搜索关键字 (按 合同号 / DJJ Code / VIN 查询)
  const [searchText, setSearchText] = useState("");

  // 卡片/表格 切换
  const [isCardView, setIsCardView] = useState(true);

  // “审核”对话框
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<PurchaseOrder | null>(null);

  // “新增采购”对话框
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  // —— 新增表单字段 state ——
  const [formContractNumber, setFormContractNumber] = useState("");
  const [formDjjCode, setFormDjjCode] = useState("");
  const [formSupplierCode, setFormSupplierCode] = useState("");
  const [formPurchaseCategory, setFormPurchaseCategory] = useState("");
  const [formProductNature, setFormProductNature] =
    useState<PurchaseOrder["productNature"]>("合同件");
  const [formCurrency, setFormCurrency] =
    useState<PurchaseOrder["currency"]>("澳币");
  const [formUsdAudRate, setFormUsdAudRate] = useState(0);
  const [formRmbAudRate, setFormRmbAudRate] = useState(0);
  const [formUnitPrice, setFormUnitPrice] = useState<number>(0);
  const [formDiscount, setFormDiscount] = useState<number>(0);
  const [formVinCode, setFormVinCode] = useState("");
  const [formEngineNo, setFormEngineNo] = useState("");
  const [formProductionDate, setFormProductionDate] = useState("");
  const [formCertificateFile, setFormCertificateFile] = useState<File | null>(
    null
  );
  const [formWarehouse, setFormWarehouse] = useState("");
  const [formRemark, setFormRemark] = useState("");
  const [formInStockApproval, setFormInStockApproval] =
    useState<PurchaseOrder["inStockApproval"]>("待定");

  // —— 数据过滤 ——
  // 1. 先按 searchText 过滤 （表格视图使用）
  const filteredBySearch = useMemo(() => {
    if (!searchText.trim()) return orders;
    const lower = searchText.trim().toLowerCase();
    return orders.filter(
      (o) =>
        o.contractNumber.toLowerCase().includes(lower) ||
        o.djjCode.toLowerCase().includes(lower) ||
        o.vinCode.toLowerCase().includes(lower)
    );
  }, [orders, searchText]);

  // 2. 再在卡片视图中按 productNature + search 过滤
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchNature = !filterNature || o.productNature === filterNature;
      const matchSearch =
        !searchText ||
        o.contractNumber.includes(searchText) ||
        o.djjCode.includes(searchText) ||
        o.vinCode.includes(searchText);
      return matchNature && matchSearch;
    });
  }, [orders, filterNature, searchText]);

  // —— 环形图数据，统计五种货品性质下的数量 ——
  const pieData = useMemo(() => {
    const countMap: Record<string, number> = {};
    filteredOrders.forEach((o) => {
      countMap[o.productNature] = (countMap[o.productNature] || 0) + 1;
    });
    return Object.entries(countMap).map(([nature, value]) => ({
      id: nature,
      label: nature,
      value,
      color: natureColors[nature], // 改用 natureColors
    }));
  }, [filteredOrders]);

  // 点击环形图 → 切换对应的 productNature 筛选
  const handlePieClick = (datum: any) => {
    const clicked = datum.id as PurchaseOrder["productNature"];
    setFilterNature((prev) => (prev === clicked ? null : clicked));
  };

  // 点击“通过”/“驳回”审核
  const handleStatusChange = (status: "已通过" | "已驳回") => {
    if (!selected) return;
    setOrders((prev) =>
      prev.map((o) =>
        o.id === selected.id ? { ...o /* 根据实际需求更新对应字段 */ } : o
      )
    );
    setDialogOpen(false);
  };

  // 提交“新增采购”表单
  const handleAddSubmit = () => {
    if (!formContractNumber.trim()) return;
    const newItem: PurchaseOrder = {
      id: Date.now().toString(),
      contractNumber: formContractNumber,
      djjCode: formDjjCode,
      supplierCode: formSupplierCode,
      purchaseCategory: formPurchaseCategory,
      productNature: formProductNature,
      currency: formCurrency,
      usdAudRate: formUsdAudRate,
      rmbAudRate: formRmbAudRate,
      unitPrice: formUnitPrice,
      discount: formDiscount,
      vinCode: formVinCode,
      engineNo: formEngineNo,
      productionDate: formProductionDate,
      certificateFile: formCertificateFile,
      warehouse: formWarehouse,
      remark: formRemark,
      inStockApproval: formInStockApproval,
      inStockStatus: "未入库",
      inStockTime: "",
    };
    setOrders((prev) => [newItem, ...prev]);
    // 重置表单
    setFormContractNumber("");
    setFormDjjCode("");
    setFormSupplierCode("");
    setFormPurchaseCategory("");
    setFormProductNature("合同件");
    setFormCurrency("澳币");
    setFormUsdAudRate(0);
    setFormRmbAudRate(0);
    setFormUnitPrice(0);
    setFormDiscount(0);
    setFormVinCode("");
    setFormEngineNo("");
    setFormProductionDate("");
    setFormCertificateFile(null);
    setFormWarehouse("");
    setFormRemark("");
    setFormInStockApproval("待定");
    setAddDialogOpen(false);
  };

  // DataGrid 表格列定义 (表格视图)
  const columns: GridColDef[] = [
    { field: "contractNumber", headerName: "合同号", flex: 1 },
    { field: "djjCode", headerName: "DJJ Code", flex: 1 },
    { field: "supplierCode", headerName: "厂家代码", flex: 1 },
    { field: "orderNumber", headerName: "订单编号", flex: 1 },
    { field: "productNature", headerName: "货品性质", flex: 1 },
    { field: "currency", headerName: "货币", flex: 1 },
    { field: "unitPrice", headerName: "单价", flex: 1 },
    {
      field: "inStockApproval",
      headerName: "入库审核",
      flex: 1,
    },
    {
      field: "inStockStatus",
      headerName: "入库状态",
      flex: 1,
    },
    {
      field: "actions",
      headerName: "操作",
      sortable: false,
      flex: 1,
      renderCell: (params) => (
        <Button
          size="small"
          onClick={() => {
            setSelected(params.row as PurchaseOrder);
            setDialogOpen(true);
          }}
        >
          审核
        </Button>
      ),
    },
  ];

  return (
    <Box m={3} overflow={"auto"} px={"2rem"}>
      <Box>
        {/* —— 头部：标题 + 搜索 + 视图切换 + 新增 + 导出 —— */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Header title="合同类采购管理" subtitle="采购录入与流程" />
          <Box display="flex" alignItems="center" gap={2}>
            {/* 搜索框：按 合同号 / DJJ Code / VIN 过滤 */}
            <TextField
              size="small"
              placeholder="搜索 合同号 / DJJ / VIN"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              sx={{ width: 280 }}
            />

            {/* 卡片/表格 切换，切换时清空 productNature 筛选 */}
            <IconButton
              onClick={() => {
                setIsCardView(!isCardView);
                setFilterNature(null);
                setSearchText("");
              }}
            >
              {isCardView ? <TableViewIcon /> : <AppsIcon />}
            </IconButton>

            {/* 新增采购按钮 */}
            <Button
              sx={{
                backgroundColor: colors.greenAccent[600],
                color: colors.grey[100],
              }}
              onClick={() => setAddDialogOpen(true)}
            >
              <AddIcon sx={{ mr: 1 }} /> 新增采购
            </Button>

            {/* 导出报表按钮 (仅示意，不实现文件下载) */}
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

        {/* —— 卡片视图 —— */}
        <Fade in={isCardView} unmountOnExit>
          <Box>
            {/* 饼图区保持不变 */}
            <Box mt={2} height={240} width="100%">
              <ResponsivePie
                data={pieData}
                innerRadius={0.5}
                padAngle={1}
                cornerRadius={3}
                colors={(datum) => datum.data.color as string}
                margin={{ top: 40, right: 80, bottom: 40, left: 80 }}
                arcLinkLabelsSkipAngle={10}
                arcLinkLabelsTextColor="#444"
                arcLabelsSkipAngle={10}
                arcLabelsTextColor={{
                  from: "color",
                  modifiers: [["darker", 2]],
                }}
                onClick={handlePieClick}
              />
            </Box>

            {/* —— 卡片列表：一律 4 列，宽度自动分配 —— */}
            <Box
              mt={2}
              sx={{
                display: "grid",
                gap: 2, // 每列、每行之间 16px 间距
                gridTemplateColumns: "repeat(4, 1fr)", // 固定 4 列，1fr 会随着容器宽度自动拉伸/缩小
                alignItems: "stretch", // 关键：让 grid 单元格都 “撑满” 相同高度
              }}
            >
              {["合同件", "质保件", "赠送件", "自购件", "待发件"].map(
                (nature) => {
                  const itemsThisNature = filteredOrders.filter(
                    (o) => o.productNature === nature
                  );
                  const count = itemsThisNature.length;
                  if (count === 0) return null;

                  return (
                    <Box
                      key={nature}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                      }}
                    >
                      {/* 标题 */}
                      <Typography
                        variant="h6"
                        mb={1}
                        sx={{
                          display: "flex",
                          alignItems: "baseline",
                          gap: 1,
                        }}
                      >
                        <span>{nature}</span>
                        <span
                          style={{ fontSize: "1.5rem", fontWeight: "bold" }}
                        >
                          {count}
                        </span>
                      </Typography>

                      {/* 卡片列表 */}
                      <Box sx={{ overflowY: "auto", flexGrow: 1,maxHeight:550 }}>
                        {itemsThisNature.map((item) => (
                          <Card
                            key={item.id}
                            sx={{
                              // 让每张卡片都撑满父 Box：
                              display: "flex",
                              flexDirection: "column",
                              height: "100%",                      // 固定高度 300px，你可以改成 maxHeight
                              mb: 2,
                              borderLeft: `6px solid ${
                                natureColors[item.productNature]
                              }`,
                            }}
                          >
                            <CardContent sx={{ flexGrow: 1, p: 2 ,
                                   overflowY: "auto",               // 只让 CardContent 部分滚动
                            }}>
                              {/* ===== 优化后的分块展示 ===== */}

                              {/* 1) 标题区：合同号 + DJJ */}
                              <Typography variant="subtitle1" gutterBottom>
                                合同号：<strong>{item.contractNumber}</strong>
                              </Typography>

                              {/* 2) 基础信息区（两列 Grid） */}
                              <Box
                                display="grid"
                                gridTemplateColumns="repeat(2, 1fr)"
                                gap={1}
                                mb={1}
                              >
                                <Typography variant="body2">
                                  <strong>DJJ Code：</strong>
                                  {item.djjCode}
                                </Typography>
                                <Typography variant="body2">
                                  <strong>厂家代码：</strong>
                                  {item.supplierCode}
                                </Typography>
                                <Typography variant="body2">
                                  <strong>采购性质：</strong>
                                  {item.purchaseCategory}
                                </Typography>
                                <Typography variant="body2">
                                  <strong>订单号：</strong>
                                  {item.orderNumber || "-"}
                                </Typography>
                                <Typography variant="body2">
                                  <strong>货品性质：</strong>
                                  {item.productNature}
                                </Typography>
                                <Typography variant="body2">
                                  <strong>仓库/门店：</strong>
                                  {item.warehouse}
                                </Typography>
                              </Box>

                              {/* 3) 价格区：货币 / 单价 / 折扣 / （汇率） / 澳元小计 */}
                              {(() => {
                                let subtotalAUD: number;
                                if (item.currency === "澳币") {
                                  subtotalAUD = item.unitPrice;
                                } else if (item.currency === "美金") {
                                  subtotalAUD =
                                    item.unitPrice * item.usdAudRate;
                                } else {
                                  subtotalAUD =
                                    item.unitPrice * item.rmbAudRate;
                                }
                                return (
                                  <Box
                                    display="grid"
                                    gridTemplateColumns="repeat(2, 1fr)"
                                    gap={1}
                                    mb={1}
                                  >
                                    <Typography variant="body2" mb={1}>
                                      <strong>货币：</strong>
                                      {item.currency} 
                                    </Typography>
                                    <Typography variant="body2">
                                      <strong>单价：</strong>
                                      {item.unitPrice} 
                                    </Typography>
                                    <Typography variant="body2">
                                      <strong>折扣：</strong>
                                      {item.discount}{" "}
                                    </Typography>
                                    <Typography variant="body2">
                                      {item.currency !== "澳币" && (
                                        <>
                                          <strong>汇率：</strong>
                                          {item.currency === "美金"
                                            ? item.usdAudRate
                                            : item.rmbAudRate}{" "}
                                        </>
                                      )}
                                    </Typography>
                                    <Typography variant="body2">
                                      <strong>澳元小计：</strong>
                                      {subtotalAUD.toFixed(2)}
                                    </Typography>
                                  </Box>
                                );
                              })()}

                              {/* 4) 车辆信息区：VIN / Eng / 生产日期 */}
                              <Box
                                display="grid"
                                gridTemplateColumns="repeat(2, 1fr)"
                                gap={1}
                                mb={1}
                              >
                                <Typography variant="body2">
                                  <strong>VIN：</strong>
                                  {item.vinCode}
                                </Typography>
                                <Typography variant="body2">
                                  <strong>Eng：</strong>
                                  {item.engineNo}
                                </Typography>
                                <Typography variant="body2">
                                  <strong>生产日期：</strong>
                                  {item.productionDate}
                                </Typography>
                              </Box>

                              {/* 5) 合格证附件区 */}
                              <Typography variant="body2" mb={1}>
                                <strong>合格证：</strong>
                                {item.certificateFile ? (
                                  <a
                                    href={URL.createObjectURL(
                                      item.certificateFile
                                    )}
                                    download={item.certificateFile.name}
                                  >
                                    {item.certificateFile.name}
                                  </a>
                                ) : (
                                  "—"
                                )}
                              </Typography>

                              {/* 6) 备注区 */}
                              <Box my={2}>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  mb={1}
                                >
                                  <strong>备注：</strong>
                                  {item.remark || "—"}
                                </Typography>
                              </Box>
                              {/* 7) 入库信息区 */}
                              <Box
                                display="grid"
                                gridTemplateColumns="repeat(2, 1fr)"
                                gap={1}
                                mb={1}
                              >
                                <Typography variant="body2" mb={1}>
                                  <strong>入库审核：</strong>
                                  {item.inStockApproval}
                                </Typography>
                                <Typography variant="body2" mb={1}>
                                  <strong>入库状态：</strong>
                                  <Box
                                    component="span"
                                    sx={{
                                      color:
                                        item.inStockStatus === "已入库"
                                          ? theme.palette.success.main
                                          : theme.palette.error.main,
                                      fontWeight: "500",
                                    }}
                                  >
                                    {item.inStockStatus}
                                  </Box>
                                </Typography>
                                <Typography variant="body2" mb={1}>
                                  {item.inStockTime
                                    ? `入库时间：${new Date(
                                        item.inStockTime
                                      ).toLocaleDateString()}`
                                    : ""}
                                </Typography>
                              </Box>

                              {/* 8) Stepper 区 */}
                              <Box mt={1}>
                                <Stepper
                                  activeStep={
                                    item.inStockApproval === "同意入库"
                                      ? 1
                                      : item.inStockApproval === "不同意入库"
                                      ? 2
                                      : 0
                                  }
                                  alternativeLabel
                                >
                                  <Step>
                                    <StepLabel>入库审批</StepLabel>
                                  </Step>
                                  <Step>
                                    <StepLabel>待入库</StepLabel>
                                  </Step>
                                  <Step>
                                    <StepLabel>已完成</StepLabel>
                                  </Step>
                                </Stepper>
                              </Box>
                            </CardContent>

                            <CardActions sx={{display:'flex',justifyContent:'center'}}>
                              <Button
                                size="small"
                                variant="outlined"
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
          <Box sx={{ height: "70vh", mt: 2 }}>
            <DataGrid
              rows={filteredBySearch}
              columns={columns}
              getRowId={(row) => row.id}
              showToolbar
            />
          </Box>
        </Fade>
      </Box>

      {/* —— “采购入库 审核” 对话框 —— */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>采购入库 审核</DialogTitle>
        <DialogContent>
          {selected ? (
            <Box
              component="form"
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                mt: 1,
              }}
            >
              <Typography variant="body2">
                合同号：<strong>{selected.contractNumber}</strong> | DJJ：
                <strong>{selected.djjCode}</strong>
              </Typography>
              <FormControl fullWidth>
                <InputLabel>入库审批</InputLabel>
                <Select
                  value={selected.inStockApproval}
                  label="入库审批"
                  onChange={(e) =>
                    setSelected({
                      ...selected,
                      inStockApproval: e.target.value as any,
                    })
                  }
                >
                  <MenuItem value="同意入库">同意入库</MenuItem>
                  <MenuItem value="不同意入库">不同意入库</MenuItem>
                  <MenuItem value="待定">待定</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="备注"
                multiline
                rows={3}
                fullWidth
                value={selected.remark}
                onChange={(e) =>
                  setSelected({ ...selected, remark: e.target.value })
                }
              />
            </Box>
          ) : (
            <CircularProgress />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>取消</Button>
          <Button color="error" onClick={() => handleStatusChange("已驳回")}>
            驳回
          </Button>
          <Button
            variant="contained"
            onClick={() => handleStatusChange("已通过")}
          >
            通过
          </Button>
        </DialogActions>
      </Dialog>

      {/* —— “新增采购” 对话框 —— */}
      <Dialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>新增采购订单</DialogTitle>
        <DialogContent>
          <Box
            component="form"
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 2,
              mt: 1,
            }}
          >
            <TextField
              label="合同号"
              fullWidth
              value={formContractNumber}
              onChange={(e) => setFormContractNumber(e.target.value)}
            />
            <TextField
              label="DJJ Code"
              fullWidth
              value={formDjjCode}
              onChange={(e) => setFormDjjCode(e.target.value)}
            />
            <TextField
              label="厂家唯一代码"
              fullWidth
              value={formSupplierCode}
              onChange={(e) => setFormSupplierCode(e.target.value)}
            />
            <TextField
              label="采购类别"
              fullWidth
              value={formPurchaseCategory}
              onChange={(e) => setFormPurchaseCategory(e.target.value)}
            />
            <FormControl fullWidth>
              <InputLabel>货品性质</InputLabel>
              <Select
                value={formProductNature}
                label="货品性质"
                onChange={(e) =>
                  setFormProductNature(
                    e.target.value as PurchaseOrder["productNature"]
                  )
                }
              >
                <MenuItem value="合同件">合同件</MenuItem>
                <MenuItem value="质保件">质保件</MenuItem>
                <MenuItem value="赠送件">赠送件</MenuItem>
                <MenuItem value="自购件">自购件</MenuItem>
                <MenuItem value="待发件">待发件</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>货币</InputLabel>
              <Select
                value={formCurrency}
                label="货币"
                onChange={(e) =>
                  setFormCurrency(e.target.value as PurchaseOrder["currency"])
                }
              >
                <MenuItem value="人民币">人民币</MenuItem>
                <MenuItem value="美金">美金</MenuItem>
                <MenuItem value="澳币">澳币</MenuItem>
              </Select>
            </FormControl>
            {formCurrency === "美金" && (
              <TextField
                label="USD → AUD 汇率"
                type="number"
                fullWidth
                value={formUsdAudRate}
                onChange={(e) => setFormUsdAudRate(Number(e.target.value))}
              />
            )}
            {formCurrency === "人民币" && (
              <TextField
                label="RMB → AUD 汇率"
                type="number"
                fullWidth
                value={formRmbAudRate}
                onChange={(e) => setFormRmbAudRate(Number(e.target.value))}
              />
            )}
            <TextField
              label="单价"
              type="number"
              fullWidth
              value={formUnitPrice}
              onChange={(e) => setFormUnitPrice(Number(e.target.value))}
            />
            <TextField
              label="折扣"
              type="number"
              fullWidth
              value={formDiscount}
              onChange={(e) => setFormDiscount(Number(e.target.value))}
            />
            <TextField
              label="车架号 (VIN)"
              fullWidth
              value={formVinCode}
              onChange={(e) => setFormVinCode(e.target.value)}
            />
            <TextField
              label="发动机号"
              fullWidth
              value={formEngineNo}
              onChange={(e) => setFormEngineNo(e.target.value)}
            />
            <TextField
              label="生产日期"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={formProductionDate}
              onChange={(e) => setFormProductionDate(e.target.value)}
            />
            <Button variant="outlined" component="label" fullWidth>
              上传合格证
              <input
                type="file"
                hidden
                accept="image/*,application/pdf"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    setFormCertificateFile(e.target.files[0]);
                  }
                }}
              />
            </Button>
            <TextField
              label="仓库/门店"
              fullWidth
              value={formWarehouse}
              onChange={(e) => setFormWarehouse(e.target.value)}
            />
            <TextField
              label="备注"
              multiline
              rows={2}
              fullWidth
              value={formRemark}
              onChange={(e) => setFormRemark(e.target.value)}
            />
            <FormControl fullWidth >
              <InputLabel>入库审核</InputLabel>
              <Select
                value={formInStockApproval}
                label="入库审核"
                onChange={(e) =>
                  setFormInStockApproval(
                    e.target.value as PurchaseOrder["inStockApproval"]
                  )
                }
              >
                <MenuItem value="同意入库">同意入库</MenuItem>
                <MenuItem value="不同意入库">不同意入库</MenuItem>
                <MenuItem value="待定">待定</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>取消</Button>
          <Button variant="contained" onClick={handleAddSubmit}>
            提交
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProcurementPage;
