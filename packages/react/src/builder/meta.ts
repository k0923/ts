import { ReactiveProps } from '@/common'
import { CSSProperties } from 'react'

interface WidgetData<T = any> {
    id: string
    name: string
    type: string
    style?: CSSProperties
    children?: WidgetData[]
    options?: T
}

export abstract class Widget<T = any> {
    abstract design(): React.FC<WidgetData<T>>
    abstract config(): React.FC<ReactiveProps<WidgetData<T>>>
}

