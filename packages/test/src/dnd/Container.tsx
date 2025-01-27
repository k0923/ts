import { Button } from '@arco-design/web-react';
import { rectSortingStrategy, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { SortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities';
import './container.less'


export interface Item {
    id: string | number
}

export interface ContainerProps<T extends Item> {
    children: React.FC<T>
    items: T[]
    strategy?: SortingStrategy
    id: string | number
}

export function Container<T extends Item>(props: ContainerProps<T>) {
    const { items, children, strategy } = props
    const { setNodeRef, listeners } = useSortable({ id: props.id })
    return (
        <div className="container" ref={setNodeRef} >
            <SortableContext items={items} strategy={verticalListSortingStrategy}>
                {items.map(v => (
                    <SortableItem key={v.id} data={v}>
                        {children}
                    </SortableItem>
                ))}
            </SortableContext>
        </div>

    )
}

export interface SortableItemProps<T extends Item> {
    children: React.FC<T>
    data: T
}

export function SortableItem<T extends Item>(props: SortableItemProps<T>) {
    const { data, children } = props
    const { id } = data
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id, data })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }
    const Node = children
    console.log(id, transform)

    return (
        <div className='item1' ref={setNodeRef} style={style}  {...listeners}>
            <Node {...data} />
        </div>
    )
}

