import { CSSProperties } from 'react'
import { WidgetData } from './meta'
import { WidgetHub } from './WidgetList'
import { DragDropItem } from './DragDropItem'

export function WidgetItem({
    children,
    isOver,
    isDragging,
}: {
    children: React.ReactNode
    isOver: boolean
    isDragging: boolean
}) {
    const borderWidth = 3
    const style: CSSProperties = {
        width: `calc(100% - ${2 * borderWidth}px)`,
        height: `calc(100% - ${2 * borderWidth}px)`,
        border: isOver ? `${borderWidth}px solid blue` : `${borderWidth}px solid transparent`,
        opacity: isDragging ? 0.5 : 1,
    }
    return <div style={style}>{children}</div>
}

export function Widgets(props: { isOver: boolean; data: { items: WidgetData[]; hub: WidgetHub } }) {
    const { data, isOver } = props
    const { items, hub } = data
    const borderWidth = 3
    const style: CSSProperties = {
        backgroundColor: 'lightskyblue',
        width: `calc(100% - ${2 * borderWidth}px)`,
        height: `calc(100% - ${2 * borderWidth}px)`,
        border: isOver ? `${borderWidth}px solid blue` : `${borderWidth}px solid transparent`,
    }
    return (
        <div style={style}>
            {items.map((item, index) => {
                const widget = hub.getWidget(item.type)

                if (widget) {
                    return (
                        <DragDropItem id={item.id} key={index} style={{ padding: 10 }} data={item}>
                            {props => {
                                return (
                                    <WidgetItem isOver={props.isOver} isDragging={props.isDragging}>
                                        <widget.Design {...props.data} />
                                    </WidgetItem>
                                )
                            }}
                        </DragDropItem>
                    )
                }

                return null
            })}
        </div>
    )
}
