import React from 'react';
import { Data, useDraggable } from '@dnd-kit/core';

export interface DraggableProps<T = any> {
    id: string | number
    children: React.ReactElement
    disabled?: boolean
    data: Data<T>
}

export function Draggable<T = any>(props: DraggableProps<T>) {
    const { id, children, disabled, data } = props
    const { attributes, listeners, setNodeRef } = useDraggable({
        id: id,
        disabled: disabled,
        data: data,
    });


    // const style = transform ? {
    //     transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    // } : undefined


    return (
        <div ref={setNodeRef} style={undefined} {...listeners} {...attributes}>
            {children}
        </div>
    )
}