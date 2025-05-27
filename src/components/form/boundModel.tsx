// -------- Type Definitions --------

// 单条入库项
export interface InboundItem {
  id: string;
  name: string;
  type: "Host" | "Accessory";
  qty: number;
  price: number;
  remark?: string;
  vin?: string;
  serial?: string;
  addLoan?: boolean;
}
