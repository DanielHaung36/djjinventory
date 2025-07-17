// 订单状态常量
export const ORDER_STATUS = {
  DRAFT: 'draft',
  ORDERED: 'ordered',
  DEPOSIT_RECEIVED: 'deposit_received',
  FINAL_PAYMENT_RECEIVED: 'final_payment_received',
  PRE_DELIVERY_INSPECTION: 'pre_delivery_inspection',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  ORDER_CLOSED: 'order_closed',
  CANCELLED: 'cancelled',
} as const;

// 状态显示名称映射
export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.DRAFT]: '草稿',
  [ORDER_STATUS.ORDERED]: '已下单',
  [ORDER_STATUS.DEPOSIT_RECEIVED]: '已收定金',
  [ORDER_STATUS.FINAL_PAYMENT_RECEIVED]: '已收尾款',
  [ORDER_STATUS.PRE_DELIVERY_INSPECTION]: '发货前检验',
  [ORDER_STATUS.SHIPPED]: '已发货',
  [ORDER_STATUS.DELIVERED]: '已送达',
  [ORDER_STATUS.ORDER_CLOSED]: '订单关闭',
  [ORDER_STATUS.CANCELLED]: '已取消',
} as const;

// 状态颜色映射
export const ORDER_STATUS_COLORS = {
  [ORDER_STATUS.DRAFT]: '#9e9e9e',
  [ORDER_STATUS.ORDERED]: '#f57c00',
  [ORDER_STATUS.DEPOSIT_RECEIVED]: '#2196f3',
  [ORDER_STATUS.FINAL_PAYMENT_RECEIVED]: '#4caf50',
  [ORDER_STATUS.PRE_DELIVERY_INSPECTION]: '#9c27b0',
  [ORDER_STATUS.SHIPPED]: '#607d8b',
  [ORDER_STATUS.DELIVERED]: '#4caf50',
  [ORDER_STATUS.ORDER_CLOSED]: '#795548',
  [ORDER_STATUS.CANCELLED]: '#f44336',
} as const;

// 状态流转顺序
export const ORDER_STATUS_FLOW = [
  ORDER_STATUS.DRAFT,
  ORDER_STATUS.ORDERED,
  ORDER_STATUS.DEPOSIT_RECEIVED,
  ORDER_STATUS.FINAL_PAYMENT_RECEIVED,
  ORDER_STATUS.PRE_DELIVERY_INSPECTION,
  ORDER_STATUS.SHIPPED,
  ORDER_STATUS.DELIVERED,
  ORDER_STATUS.ORDER_CLOSED,
] as const;

// 可以取消的状态
export const CANCELLABLE_STATUSES = [
  ORDER_STATUS.DRAFT,
  ORDER_STATUS.ORDERED,
  ORDER_STATUS.DEPOSIT_RECEIVED,
  ORDER_STATUS.FINAL_PAYMENT_RECEIVED,
  ORDER_STATUS.PRE_DELIVERY_INSPECTION,
] as const;

// 状态转换规则
export const STATUS_TRANSITIONS = {
  [ORDER_STATUS.DRAFT]: [ORDER_STATUS.ORDERED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.ORDERED]: [ORDER_STATUS.DEPOSIT_RECEIVED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.DEPOSIT_RECEIVED]: [ORDER_STATUS.FINAL_PAYMENT_RECEIVED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.FINAL_PAYMENT_RECEIVED]: [ORDER_STATUS.PRE_DELIVERY_INSPECTION, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.PRE_DELIVERY_INSPECTION]: [ORDER_STATUS.SHIPPED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.SHIPPED]: [ORDER_STATUS.DELIVERED],
  [ORDER_STATUS.DELIVERED]: [ORDER_STATUS.ORDER_CLOSED],
  [ORDER_STATUS.ORDER_CLOSED]: [],
  [ORDER_STATUS.CANCELLED]: [],
} as const;

// 检查状态转换是否有效
export const isValidStatusTransition = (fromStatus: string, toStatus: string): boolean => {
  const validTransitions = STATUS_TRANSITIONS[fromStatus as keyof typeof STATUS_TRANSITIONS];
  return validTransitions ? validTransitions.includes(toStatus as any) : false;
};

// 获取状态显示名称
export const getStatusLabel = (status: string): string => {
  return ORDER_STATUS_LABELS[status as keyof typeof ORDER_STATUS_LABELS] || status;
};

// 获取状态颜色
export const getStatusColor = (status: string): string => {
  return ORDER_STATUS_COLORS[status as keyof typeof ORDER_STATUS_COLORS] || '#9e9e9e';
};

// 检查状态是否可以取消
export const isCancellable = (status: string): boolean => {
  return CANCELLABLE_STATUSES.includes(status as any);
};