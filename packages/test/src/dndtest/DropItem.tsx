import { Data, useDndContext, useDroppable } from '@dnd-kit/core'
import { useMemo } from 'react'
import { DragDropItemProps } from './meta'

export interface DropNodeProps<T> {
    isOver: boolean
    data: Data<T>
}

export function DropItem<T>({
    id,
    data,
    children,
    style,
    className,
    disabled,
}: DragDropItemProps<T, DropNodeProps<T>>) {
    const { setNodeRef, isOver } = useDroppable({
        id,
        data,
        disabled,
    })

    const Node = children

    const Item = useMemo(() => {
        return <Node isOver={isOver} data={data}></Node>
    }, [isOver, data])

    return (
        <div className={className} style={style} ref={setNodeRef}>
            {Item}
        </div>
    )
}
