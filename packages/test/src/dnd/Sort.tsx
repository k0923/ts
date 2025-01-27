import { closestCenter, CollisionDetection, DndContext, DragEndEvent, DragOverlay, MeasuringStrategy, rectIntersection } from "@dnd-kit/core";
import { act, CSSProperties, useCallback, useRef, useState } from "react";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import './sort.less'
import { CSS } from '@dnd-kit/utilities';
import { Button, Input } from "@arco-design/web-react";
import { Container, SortableItem } from "./Container";

interface WidgetData<T = any> {
    id: string
    name?: string
    type: 'container' | 'item'
    style?: CSSProperties
    children?: WidgetData[]
    options?: T
}

function getContainer(items: WidgetData[], id: string): [WidgetData[], number] {
    const index = items.findIndex(it => it.id === id)
    if (index > -1) {
        return [items, index]
    }
    for (const item of items) {
        const [newItems, index] = getContainer(item.children ?? [], id)
        if (index > -1) {
            return [newItems, index]
        }
    }
    return [items, index]
}

function move(items: WidgetData[], from: string, to: string): WidgetData[] {
    const [fromContainer, fIndex] = getContainer(items, from)
    const [toContainer, tIndex] = getContainer(items, to)
    const item = fromContainer.splice(fIndex, 1)[0]
    toContainer.splice(tIndex, 0, item)







    return items
}

function get(items: WidgetData[], id: string): WidgetData | undefined {
    // 在当前层级查找
    const item = items.find((it) => it.id === id);
    if (item) {
        return item;
    }

    // 递归查找子节点
    for (const widget of items) {
        if (widget.children) {
            const found = get(widget.children, id);
            if (found) {
                return found;
            }
        }
    }

    // 未找到
    return undefined;
}

function remove(items: WidgetData[], id: string): WidgetData[] {
    if (items.findIndex(it => it.id === id) > -1) {
        return items.filter(it => it.id !== id)
    }
    items.forEach(item => item.children = remove(item.children ?? [], id))
    return items
}



const testData: WidgetData[] = [
    {
        id: "2",
        name: "Header",
        type: "item",
        style: {
            fontSize: "24px",
            fontWeight: "bold",
            color: "#333",
        },
        options: {
            text: "Welcome to the Dashboard",
        },
    },
    {
        id: "3",
        name: "Content Container",
        type: "container",
        style: {
            display: "flex",
            gap: "10px",
            marginTop: "10px",
        },
        children: [
            {
                id: "4",
                name: "Left Panel",
                type: "item",
                style: {
                    flex: 1,
                    backgroundColor: "#fff",
                    padding: "10px",
                    borderRadius: "5px",
                },
                options: {
                    content: "This is the left panel content.",
                },
            },
            {
                id: "5",
                name: "Right Panel",
                type: "item",
                style: {
                    flex: 1,
                    backgroundColor: "#fff",
                    padding: "10px",
                    borderRadius: "5px",
                },
                options: {
                    content: "This is the right panel content.",
                },
            },
        ],
    },
    {
        id: "6",
        name: "Footer",
        type: "item",
        style: {
            marginTop: "10px",
            textAlign: "center",
            color: "#666",
        },
        options: {
            text: "© 2023 My Company",
        },
    },
]





export function Node(props: WidgetData) {
    const { id, type } = props
    if (type === 'item') {
        return <Button style={{ width: 100, margin: 10 }}>{id}</Button>
    }
    return <Container id={id} items={props.children ?? []}>{Node}</Container>
}









export function SortTest(props: any) {
    const [items, setItems] = useState(testData)
    const [data, setData] = useState<WidgetData | null>(null)

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const newItems = move(items, active.id as string, over.id as string)
            setItems(JSON.parse(JSON.stringify(newItems)))
            overID.current = null
        }
    }, [setItems])

    const overID = useRef<string | null>(null)

    return (
        <>
            <DndContext
                onDragStart={args => {
                    setData(args.active.data.current as WidgetData)

                }}
                collisionDetection={args => {

                    const result = closestCenter(args)
                    return result

                    if (!overID.current) {
                        return [result[0]]
                    }
                    // console.log(result)
                    // return result

                    const [container, _] = getContainer(items, overID.current)
                    return result.filter(it => container.some(c => c.id === it.id))
                }} onDragMove={args => {
                    overID.current = args.over?.id as string
                    if (args.over?.id) {

                        const [activeContainer] = getContainer(items, args.active.id as string)
                        const [overContainer] = getContainer(items, args.over.id as string)
                        console.log(args.over.id)
                        if (activeContainer === overContainer) {

                            return
                        }
                        console.log('hit')
                        const newItems = move(items, args.active.id as string, args.over.id as string)
                        setItems(JSON.parse(JSON.stringify(newItems)))
                        overID.current = null
                    }
                }} onDragEnd={handleDragEnd} measuring={{
                    droppable: {
                        strategy: MeasuringStrategy.Always
                    }
                }}>
                <Container id="test" items={items}>{Node}</Container>
                <DragOverlay><Node  {...data} /></DragOverlay>
            </DndContext>
            <pre>{JSON.stringify(items, null, 4)}</pre>
        </>
    )
}


// export function SortableItem({ id, children }: any) {
//     const {
//         attributes,
//         listeners,
//         setNodeRef,
//         transform,
//         transition,
//     } = useSortable({ id });

//     const style = {
//         transform: CSS.Transform.toString(transform),
//         transition,
//     };

//     const Node = children

//     return (
//         <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
//             <Node id={id}></Node>
//             {/* <Button style={{ width: 100, margin: 10 }}>{id}</Button> */}
//         </div>
//     );
// }