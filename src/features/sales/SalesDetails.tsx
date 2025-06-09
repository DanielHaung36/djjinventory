// ========================
// 4. 详情页（src/pages/sales/[id].tsx）
// ========================
import { useParams, useNavigate } from "react-router-dom"
import {SalesOrderDetail} from "./Salesorderdetail"
import { mockOrders } from "./SalesDashboard"
export default function SalesDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const mockOrder = getOrderById(id || "") // 你可以基于 mockOrders 或从 API 拉数据

  return <SalesOrderDetail order={mockOrder} onBack={() => navigate("/sales/overview")} />
}

// 辅助函数
function getOrderById(orderId: string) {
  return mockOrders.find((o) => o.orderNumber === orderId)
}
