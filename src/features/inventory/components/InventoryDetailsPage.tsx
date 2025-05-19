import {memo} from "react"
import type { FC, ReactNode } from "react"

export interface IProps {
    children?:ReactNode;
    //...这里定义相关类型
    //扩展相关属性
}

const InventoryDetailsPage:FC<IProps> = memo(function ({ children }) {
    return (
        <div className="inventoryDetailsPage">
            <div>InventoryDetailsPage</div>
        </div>
    )
})

export default InventoryDetailsPage
InventoryDetailsPage.displayName = "InventoryDetailsPage" //方便以后调试使用