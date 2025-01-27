import { DndContext, DragOverlay, Modifier, MouseSensor, rectIntersection, useSensor } from '@dnd-kit/core'
import './index.less'
import { Button, Layout } from '@arco-design/web-react'
import { WidgetData } from './meta'
import { BaseWidget, InputWidget, TabsWidget, WidgetHub, WidgetList } from './WidgetList'
import { DropItem } from './DropItem'
import { getEventCoordinates } from '@dnd-kit/utilities'
import { create } from 'zustand'
import { Widgets } from './Layer'

const hub = new WidgetHub([new InputWidget(), new TabsWidget()])

interface WidgetStore {
    items: WidgetData[]
    addItems: (item: WidgetData, target: string) => void
}

const useWidgets = create<WidgetStore>(set => ({
    items: [],
    addItems: (item: WidgetData, target: string) =>
        set(state => {
            if (target === 'main') {
                return { items: [...state.items.filter(it => it.id !== item.id), item] }
            }

            const items = state.items.filter(it => it.id !== item.id)
            const index = items.findIndex(it => it.id === target)

            return { items: [...items.slice(0, index), item, ...items.slice(index)] }
        }),
}))

function DragOverlayItem() {
    return (
        <DragOverlay dropAnimation={null}>
            <Button
                style={{
                    // transform: transform,
                    cursor: 'grabbing',
                    backgroundColor: 'red',
                }}
            >
                Dragging
            </Button>
        </DragOverlay>
    )
}

export function DndTest() {
    const items = useWidgets(state => state.items)
    const addItems = useWidgets(state => state.addItems)

    const mouseSensor = useSensor(MouseSensor, {
        activationConstraint: {
            distance: 5,
        },
    })
    return (
        <DndContext
            sensors={[mouseSensor]}
            modifiers={[snapCenterToCursor]}
            onDragMove={e => {}}
            collisionDetection={args => {
                const result = rectIntersection(args).filter(
                    it => (it.id as string).indexOf(args.active.id as string) === -1
                )
                // console.log(result)

                // console.log(result.map(it => it.id).join(':'), result.length)
                return result
            }}
            onDragEnd={args => {
                if (args.over) {
                    if (args.active.data.current instanceof BaseWidget) {
                        addItems(args.active.data.current.init(), args.over.id as string)
                    } else {
                        addItems(args.active.data.current as WidgetData, args.over.id as string)
                    }
                }
            }}
        >
            <Layout style={{ height: '100vh' }}>
                <Layout.Sider>
                    <WidgetList hub={hub} />
                </Layout.Sider>
                <Layout.Content>
                    <DropItem id="main" data={{ items: items, hub: hub }} style={{ height: '100%' }}>
                        {Widgets}
                    </DropItem>
                </Layout.Content>
                <Layout.Sider></Layout.Sider>
                <DragOverlayItem />
            </Layout>
        </DndContext>
    )
}

export const snapCenterToCursor: Modifier = ({ activatorEvent, draggingNodeRect, transform }) => {
    if (draggingNodeRect && activatorEvent) {
        const activatorCoordinates = getEventCoordinates(activatorEvent)

        if (!activatorCoordinates) {
            return transform
        }

        const offsetX = activatorCoordinates.x - draggingNodeRect.left
        const offsetY = activatorCoordinates.y - draggingNodeRect.top

        return {
            ...transform,
            x: transform.x + offsetX - draggingNodeRect.width / 2,
            y: transform.y + offsetY - draggingNodeRect.height / 2,
        }
    }

    return transform
}
