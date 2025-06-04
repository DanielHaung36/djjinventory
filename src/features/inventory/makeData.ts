// makeData.ts

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
// KPI 数值
export const totalInventoryValue = 1250000; // 总库存价值（元）
export const inventoryUsageRate = 0.65; // 库存占用率（0~1）
export const lastInventoryUsageRate = 0.60; // 上期库存占用率

export const monthlySalesOrders = 320; // 本月销售订单数
export const salesOrderCompletionRate = 0.85; // 本月订单完成率
export const lastSalesOrderRate = 0.80; // 上月订单完成率

export const lowStockSKUCount = 15; // 待补货 SKU 数量
export const lastPeriodLowStockSKUCount = 20; // 上期待补货 SKU 数量

export const weeklyProcurementCost = 450000; // 本周采购支出（元）
export const lastWeekProcurementCost = 400000; // 上周采购支出
export const goalProcurement = 500000; // 本周采购目标

// 趋势与分布数据
export const inventoryTrend = [
  { week: 'Wk1', value: 1100000 },
  { week: 'Wk2', value: 1200000 },
  { week: 'Wk3', value: 1150000 },
  { week: 'Wk4', value: 1250000 },
];

export const salesByCategory = [
  { category: '电子产品', value: 200000 },
  { category: '家用电器', value: 150000 },
  { category: '办公用品', value: 80000 },
  { category: '耗材', value: 60000 },
];

// 订单与 SKU 排行
export const recentOrders = [
  { id: 'SO-1001', partner: '客户 A', date: '2025-05-28', type: 'sale', amount: 5600 },
  { id: 'PO-2002', partner: '供应商 B', date: '2025-05-27', type: 'procurement', amount: 12000 },
  { id: 'SO-1003', partner: '客户 C', date: '2025-05-26', type: 'sale', amount: 7800 },
  { id: 'PO-2004', partner: '供应商 D', date: '2025-05-25', type: 'procurement', amount: 15000 },
  { id: 'SO-1005', partner: '客户 E', date: '2025-05-24', type: 'sale', amount: 4300 },
];

export const topSellingSKUs = [
  { sku: 'SKU-001', value: 150 },
  { sku: 'SKU-002', value: 120 },
  { sku: 'SKU-003', value: 100 },
  { sku: 'SKU-004', value: 90 },
  { sku: 'SKU-005', value: 80 },
];

// 采购 vs 销售
export const procurementVsSales = [
  { date: '2025-05-01', procurement: 80000, sales: 70000 },
  { date: '2025-05-08', procurement: 90000, sales: 85000 },
  { date: '2025-05-15', procurement: 75000, sales: 80000 },
  { date: '2025-05-22', procurement: 90000, sales: 95000 },
  { date: '2025-05-29', procurement: 85000, sales: 88000 },
];
export const data: InventoryOverview[] = [
  {
    id: 1,
    modelName: '盘式变压器油泵（Pump）',
    photoUrl: '',
    costPrice: 6804,
    salePrice: 8164.8,
    targetCustomer: '',
    barcode: 'PR20250514000050',
    barcodeUrl: '',
    createdAt: '2024-08-16T08:00:00+08:00',
    actualQty: 10,
    lockedQty: 1,
    availableQty: 9,
  },
  {
    id: 2,
    modelName: '变压器油泵(Pump)',
    photoUrl: '',
    costPrice: 6804,
    salePrice: 8164.8,
    targetCustomer: '',
    barcode: 'PR20250514000051',
    barcodeUrl: '',
    createdAt: '2024-08-16T08:00:00+08:00',
    actualQty: 20,
    lockedQty: 2,
    availableQty: 18,
  },
  {
    id: 3,
    modelName: '夹管阀(Pinch valve)',
    photoUrl: '',
    costPrice: 3,
    salePrice: 3,
    targetCustomer: '',
    barcode: 'PR20250514000052',
    barcodeUrl: '',
    createdAt: '2024-08-16T08:00:00+08:00',
    actualQty: 30,
    lockedQty: 3,
    availableQty: 27,
  },
  {
    id: 4,
    modelName: '横梁（方孔）',
    photoUrl: '',
    costPrice: 4,
    salePrice: 3,
    targetCustomer: '',
    barcode: 'PR20250514000053',
    barcodeUrl: '',
    createdAt: '2024-08-16T08:00:00+08:00',
    actualQty: 40,
    lockedQty: 4,
    availableQty: 36,
  },
  {
    id: 5,
    modelName: '横梁（圆孔）',
    photoUrl: '',
    costPrice: 5,
    salePrice: 3,
    targetCustomer: '',
    barcode: 'PR20250514000054',
    barcodeUrl: '',
    createdAt: '2024-08-16T08:00:00+08:00',
    actualQty: 50,
    lockedQty: 5,
    availableQty: 45,
  },
  {
    id: 6,
    modelName: '拉力圆盘（焊接在横梁上）',
    photoUrl: '',
    costPrice: 19387,
    salePrice: 22295.05,
    targetCustomer: '',
    barcode: 'PR20250514000055',
    barcodeUrl: '',
    createdAt: '2024-08-16T08:00:00+08:00',
    actualQty: 60,
    lockedQty: 6,
    availableQty: 54,
  },
  {
    id: 7,
    modelName: '拉杆棒（焊接在横梁上）',
    photoUrl: '',
    costPrice: 11072,
    salePrice: 12732.8,
    targetCustomer: '',
    barcode: 'PR20250514000056',
    barcodeUrl: '',
    createdAt: '2024-08-16T08:00:00+08:00',
    actualQty: 70,
    lockedQty: 7,
    availableQty: 63,
  },
  {
    id: 8,
    modelName: '板式换热器（Plate heat exchanger）',
    photoUrl: '',
    costPrice: 19387,
    salePrice: 22295.05,
    targetCustomer: '',
    barcode: 'PR20250514000057',
    barcodeUrl: '',
    createdAt: '2024-08-16T08:00:00+08:00',
    actualQty: 80,
    lockedQty: 8,
    availableQty: 72,
  },
  {
    id: 9,
    modelName: '主动端轴承座（Drive Bearing housing)',
    photoUrl: '',
    costPrice: 11072,
    salePrice: 12732.8,
    targetCustomer: '',
    barcode: 'PR20250514000058',
    barcodeUrl: '',
    createdAt: '2024-08-16T08:00:00+08:00',
    actualQty: 90,
    lockedQty: 9,
    availableQty: 81,
  },
  {
    id: 10,
    modelName: '从动端轴承座（Driven Bearing Housing）',
    photoUrl: '',
    costPrice: 11072,
    salePrice: 12732.8,
    targetCustomer: '',
    barcode: 'PR20250514000059',
    barcodeUrl: '',
    createdAt: '2024-08-16T08:00:00+08:00',
    actualQty: 100,
    lockedQty: 10,
    availableQty: 90,
  },
  {
    id: 11,
    modelName: '溢流斗',
    photoUrl: '',
    costPrice: 0,
    salePrice: 0,
    targetCustomer: '',
    barcode: 'PR20250514000060',
    barcodeUrl: '',
    createdAt: '2025-03-09T08:00:00+08:00',
    actualQty: 110,
    lockedQty: 11,
    availableQty: 99,
  },
  {
    id: 12,
    modelName: '溢流斗',
    photoUrl: '',
    costPrice: 0,
    salePrice: 0,
    targetCustomer: '',
    barcode: 'PR20250514000061',
    barcodeUrl: '',
    createdAt: '2025-03-10T08:00:00+08:00',
    actualQty: 120,
    lockedQty: 12,
    availableQty: 108,
  },
  {
    id: 13,
    modelName: '不锈钢垫片',
    photoUrl: '',
    costPrice: 0,
    salePrice: 0,
    targetCustomer: '',
    barcode: 'PR20250514000062',
    barcodeUrl: '',
    createdAt: '2025-03-11T08:00:00+08:00',
    actualQty: 130,
    lockedQty: 13,
    availableQty: 117,
  },
  {
    id: 14,
    modelName: '排料块',
    photoUrl: '',
    costPrice: 0,
    salePrice: 0,
    targetCustomer: '',
    barcode: 'PR20250514000063',
    barcodeUrl: '',
    createdAt: '2025-03-12T08:00:00+08:00',
    actualQty: 140,
    lockedQty: 14,
    availableQty: 126,
  },
];
