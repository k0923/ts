import { ReactiveProps } from '@k0923/react'
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

class WidgetHub {
    constructor() {}
}
