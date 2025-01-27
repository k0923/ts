import { ReactiveProps } from '@k0923/react'
import { WidgetData } from './meta'
import { Button, Grid, Input, Tabs } from '@arco-design/web-react'
import { DragItem } from './DragItem'
import { IconAlipayCircle, IconNav } from '@arco-design/web-react/icon'
import { CSSProperties, useState } from 'react'
import { DropItem } from './DropItem'

export abstract class BaseWidget<T = any> {
    constructor() {}

    abstract get type(): string

    abstract Name(props: WidgetData<T>): React.ReactElement

    abstract init(): WidgetData<T>

    abstract Design(props: WidgetData<T>): React.ReactElement

    config(): React.FC<ReactiveProps<WidgetData<T>>> | null {
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

export function WidgetTemplate(props: { data: BaseWidget }) {
    const { data } = props
    const configData = data.init()
    return <data.Name {...configData} />
}

export function WidgetList(props: { hub: WidgetHub }) {
    const { hub } = props
    const widgets = hub.widgets
    return (
        <>
            <Grid.Row>
                {widgets.map(widget => {
                    return (
                        <Grid.Col span={12} key={widget.type}>
                            <DragItem id={widget.type} data={widget}>
                                {WidgetTemplate}
                            </DragItem>
                        </Grid.Col>
                    )
                })}
            </Grid.Row>
        </>
    )
}

export class InputWidget extends BaseWidget {
    init(): WidgetData<any> {
        return {
            id: `test_${Date.now()}`,
            name: '输入框',
            type: 'input',
        }
    }

    get type() {
        return 'input'
    }

    Name({ name }: WidgetData) {
        return <Button icon={<IconAlipayCircle />}>{name}</Button>
    }

    Design(props: WidgetData<any>): React.ReactElement {
        const { id } = props
        return <Input placeholder={id} readOnly />
    }

    config() {
        return null
    }
}

export class TabsWidget extends BaseWidget {
    init(): WidgetData<any> {
        return {
            id: `tabs_${Date.now()}`,
            name: '面板',
            type: 'tabs',
        }
    }

    get type() {
        return 'tabs'
    }

    Name({ name }: WidgetData) {
        return <Button icon={<IconNav />}>{name}</Button>
    }

    Design(props: WidgetData<any>): React.ReactElement {
        const [activeKey, setActiveKey] = useState('1')
        return (
            <Tabs
                style={{ backgroundColor: 'lightgray', minHeight: 200 }}
                activeTab={activeKey}
                onChange={setActiveKey}
            >
                <Tabs.TabPane key="1" title="Tab 1">
                    <DropItem id={`${props.id}_1`} data={{}}>
                        {props => {
                            const { isOver } = props
                            const style: CSSProperties = {
                                height: 100,
                                border: isOver ? '1px solid red' : '1px solid transparent',
                            }
                            return <div style={style} />
                        }}
                    </DropItem>
                </Tabs.TabPane>
                <Tabs.TabPane key="2" title="Tab 2">
                    Content of Tab Pane 2
                </Tabs.TabPane>
                <Tabs.TabPane key="3" title="Tab 3">
                    Content of Tab Pane 3
                </Tabs.TabPane>
            </Tabs>
        )
    }

    config() {
        return null
    }
}
