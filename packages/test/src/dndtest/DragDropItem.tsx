import { Data, useDndContext, useDraggable, useDroppable } from '@dnd-kit/core'
import { useCallback, useMemo, useState } from 'react'
import { DragDropItemProps } from './meta'

export interface DragDropNodeProps<T> {
    isOver: boolean
    isDragging: boolean
    data: Data<T>
}

export function DragDropItem<T>({ id, data, children, className, style }: DragDropItemProps<T, DragDropNodeProps<T>>) {
    const {
        listeners,
        attributes,
        setNodeRef: setDraggableNodeRef,
        isDragging,
    } = useDraggable({
        id,
        data,
    })

    const { setNodeRef: setDroppableNodeRef, isOver } = useDroppable({
        id,
        data,
    })

    const setNodeRef = useCallback(
        (node: HTMLDivElement) => {
            setDraggableNodeRef(node)
            setDroppableNodeRef(node)
        },
        [setDraggableNodeRef, setDroppableNodeRef]
    )

    const Node = children

    const over = isOver && isDragging === false

    const Item = useMemo(() => {
        return <Node isDragging={isDragging} isOver={isOver && isDragging === false} data={data}></Node>
    }, [over, isDragging, data])

    return (
        <div id={id as string} className={className} style={style} ref={setNodeRef} {...listeners} {...attributes}>
            {Item}
        </div>
    )
}
