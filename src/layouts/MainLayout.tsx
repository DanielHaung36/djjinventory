import {memo} from "react"
import type { FC, ReactNode } from "react"

export interface IProps {
    children?:ReactNode;
    //...这里定义相关类型
    //扩展相关属性
}

const MainLayout:FC<IProps> = memo(function ({ children }) {
    return (
        <div className="mainlayout">
            {children}
        </div>
    )
})

export default MainLayout
MainLayout.displayName = "MainLayout" //方便以后调试使用