import React, { CSSProperties, useMemo } from 'react';
import { useDroppable, Data } from '@dnd-kit/core';
import { Draggable } from './Draggable';

export interface DroppableProps<T = any> {
    id: string | number
    disabled?: boolean
    data: Data<T>
    children?: React.ReactElement[]
}

export function Droppable<T = any>(props: DroppableProps<T>) {
    const { id, disabled, data, children } = props

    const { isOver, setNodeRef } = useDroppable({
        id: id,
        disabled: disabled,
        data: data,
    });



    const Node = useMemo(() => {
        if (children && children.length > 0) {
            return children.map((it, index) => {
                return <DropEdge id={index}>{it}</DropEdge>
            })
        }
        return <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
        }}>请将元素添加到这里</div>
    }, [children])

    const style: CSSProperties = {
        color: isOver ? 'green' : undefined,
        border: isOver ? '2px solid green' : undefined,
        height: '100%',
        backgroundColor: 'darkgray',
        position: 'relative'
    };

    return (
        <div ref={setNodeRef} style={style}>
            {Node}
        </div>
    );
}


export interface DropEdgeProps {
    children: React.ReactElement
}


export function DropEdge(props: any) {
    const { id, children } = props
    const { isOver, setNodeRef } = useDroppable({
        id: id,
    });

    const style: CSSProperties = {


        width: 'calc(100%-10px)',
        padding: '8px',
    }

    return (
        <Draggable id={id} data={{}}>
            <div ref={setNodeRef} style={style} >
                <div style={{
                    borderTop: isOver ? '3px solid blue' : undefined,
                    height: isOver ? 'calc(100%-3px)' : '100%',
                }}>
                    {children}
                </div>

            </div>
        </Draggable>
    )
}
