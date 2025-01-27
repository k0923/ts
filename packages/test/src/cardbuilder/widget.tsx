import { ReactiveProps } from '@k0923/react'
import { CSSProperties } from 'react'
import { atom, useAtom } from 'jotai'
import { Button, Grid, Input, Space } from '@arco-design/web-react'
import { IconAlipayCircle } from '@arco-design/web-react/icon'
import { DndContext, useDraggable, useDroppable, DragOverlay, DropAnimation } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers'

import './widget.less'
const langAtom = atom<'zh-CN' | 'en-US'>('zh-CN')
export interface I18n<T = any> {
    'zh-CN'?: T
    'en-US'?: T
    default: T
}

function WidgetName(props: { name: I18n<string>; icon?: React.ReactNode }) {
    const { name, icon } = props
    const [lang] = useAtom(langAtom)
    return (
        <Button className="widget item" icon={icon}>
            {name[lang] || name.default}
        </Button>
    )
}

interface WidgetData<T = any> {
    id: string
    name: string
    type: string
    style?: CSSProperties
    children?: WidgetData[]
    options?: T
}

export abstract class BaseWidget<T = any> {
    constructor() {}

    abstract get type(): string
    abstract get name(): React.ReactNode

    design(): React.FC<WidgetData<T>> | null {
        return null
    }
    config(): React.FC<ReactiveProps<WidgetData<T>>> | null {
        return null
    }
}

export class InputWidget extends BaseWidget {
    get type() {
        return 'input'
    }
    get name() {
        return <WidgetName name={{ default: '输入框' }} icon={<IconAlipayCircle />} />
    }
    design() {
        return () => {
            return <Input />
        }
    }
    config() {
        return null
    }
}

export class WidgetHub {
    private _widgets = new Map<string, BaseWidget>()
    constructor(widgets?: Array<BaseWidget>) {
        widgets?.forEach(widget => {
            this.register(widget)
        })
    }

    register(widget: BaseWidget) {
        if (this._widgets.has(widget.type)) {
            throw new Error(`widget ${widget.type} already registered`)
        }
        this._widgets.set(widget.type, widget)
    }

    get widgets(): BaseWidget[] {
        return Array.from(this._widgets.values())
    }

    getWidget(type: string): BaseWidget | undefined {
        return this._widgets.get(type)
    }
}

function Draggable(props: { children: React.ReactNode }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: 'draggable',
    })
    const style: CSSProperties = {
        opacity: isDragging ? 0.5 : 1,
    }

    return (
        <>
            <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
                {props.children}
            </div>
            <DragOverlay modifiers={[restrictToWindowEdges]}>
                <WidgetName name={{ default: '输入框' }} icon={<IconAlipayCircle />} />
            </DragOverlay>
        </>
    )
}

export function WidgetList(props: { hub: WidgetHub }) {
    const { hub } = props
    const widgets = hub.widgets.filter(w => w.design() != null)
    return (
        <>
            <Grid.Row className="panel">
                {widgets.map(widget => {
                    return (
                        <Grid.Col span={12} key={widget.type}>
                            <Draggable>{widget.name}</Draggable>
                        </Grid.Col>
                    )
                })}
            </Grid.Row>
        </>
    )
}

export function PageBuilder(props: { hub: WidgetHub }) {
    const { isOver, setNodeRef } = useDroppable({
        id: 'draggable',
    })

    const style = {
        border: isOver ? '5px solid green' : undefined,
        width: isOver ? 'calc(100% - 5px)' : '100%',
        height: isOver ? 'calc(100% - 5px)' : '100%',
    }

    console.log('hit')
    return (
        <div className="panel" ref={setNodeRef} style={style}>
            <div></div>
        </div>
    )
}

export function Builder(props: { hub: WidgetHub }) {
    return (
        <DndContext>
            <div className="builder">
                <div className="item">
                    <WidgetList hub={props.hub} />
                </div>

                <div className="item item2">
                    <PageBuilder hub={props.hub}></PageBuilder>
                </div>
            </div>
        </DndContext>
    )
}

const dropAnimationConfig: DropAnimation = {
    keyframes({ transform }) {
        return [
            { transform: CSS.Transform.toString(transform.initial) },
            {
                transform: CSS.Transform.toString({
                    ...transform.final,
                    scaleX: 0.94,
                    scaleY: 0.94,
                }),
            },
        ]
    },
    sideEffects({ active, dragOverlay }) {
        active.node.style.opacity = '0'

        const button = dragOverlay.node.querySelector('button')

        if (button) {
            button.animate(
                [
                    {
                        boxShadow: '-1px 0 15px 0 rgba(34, 33, 81, 0.01), 0px 15px 15px 0 rgba(34, 33, 81, 0.25)',
                    },
                    {
                        boxShadow: '-1px 0 15px 0 rgba(34, 33, 81, 0), 0px 15px 15px 0 rgba(34, 33, 81, 0)',
                    },
                ],
                {
                    duration: 250,
                    easing: 'ease',
                    fill: 'forwards',
                }
            )
        }

        return () => {
            active.node.style.opacity = ''
        }
    },
}
