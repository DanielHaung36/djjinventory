import {memo} from "react"
import type { FC, ReactNode } from "react"

export interface IProps {
    children?:ReactNode;
    //...这里定义相关类型
    //扩展相关属性
}

const InventoryShippingPage:FC<IProps> = memo(function ({ children }) {
    return (
        <div className="inventoryShippingPage">
            <div>InventoryShippingPage</div>
        </div>
    )
})

export default InventoryShippingPage
InventoryShippingPage.displayName = "InventoryShippingPage" //方便以后调试使用