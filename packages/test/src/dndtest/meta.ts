import { Data } from "@dnd-kit/core"
import { CSSProperties } from "react"

export interface DragDropItemProps<T, ChildProps> {
    id: string | number
    data: Data<T>
    children: React.FC<ChildProps>
    className?: string
    style?: CSSProperties
    disabled?: boolean
}

export interface WidgetData<T = any> {
    id: string
    name: string
    type: string
    style?: CSSProperties
    children?: WidgetData[]
    options?: T
}