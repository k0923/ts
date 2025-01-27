import { Data, useDraggable } from '@dnd-kit/core'
import { useMemo } from 'react'
import { DragDropItemProps } from './meta'

export interface DragNodeProps<T> {
    isDragging: boolean
    data: Data<T>
}

export function DragItem<T>({
    id,
    data,
    children,
    style,
    className,
    disabled,
}: DragDropItemProps<T, DragNodeProps<T>>) {
    const { listeners, attributes, setNodeRef, isDragging } = useDraggable({
        id,
        data,
        disabled,
    })

    const Node = children

    const Item = useMemo(() => {
        return <Node isDragging={isDragging} data={data}></Node>
    }, [Node, isDragging, data])

    return (
        <div className={className} style={style} ref={setNodeRef} {...listeners} {...attributes}>
            {Item}
        </div>
    )
}
