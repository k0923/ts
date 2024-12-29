import { BaseEditor, type BaseEditorConfig, type FormNode } from './editor'
import { Path } from './context'

export interface ObjectWrapperProps<Value = any, Ctx = any> {
    Components: Partial<{ [key in keyof Value]: React.ReactElement }>
    update: (newValue: Value) => void
    path: Path
    ctx: Ctx
}

export interface ObjectEditorConfig<Value = any> extends BaseEditorConfig<Value> {
    items: Partial<{
        [key in keyof Value]: BaseEditor<Value[key]>
    }>
    Wrapper?: React.FC<ObjectWrapperProps<Value>>
}

export class ObjectEditor<Value = any> extends BaseEditor<Value> {
    private children: Partial<{ [key in keyof Value]: BaseEditor<Value[key]> }> = {}

    private Wrapper?: React.FC<ObjectWrapperProps<Value>>

    private handler: ((value: Value, last: Value) => Value) | undefined = undefined

    constructor({ items, Wrapper, valueHandler }: ObjectEditorConfig<Value>) {
        super()
        this.Wrapper = Wrapper
        this.handler = valueHandler
        this.children = items
    }

    processValue(value: Value, lastValue: Value): Value {
        if (this.handler) {
            return this.handler(value, lastValue)
        }
        return super.processValue(value, lastValue)
    }

    build(): FormNode {
        const items = new Map<string, FormNode>()

        Object.entries(this.children).forEach(([key, editor]) => {
            if (editor && key) {
                const E = (editor as BaseEditor<any>)
                E.setParent(this)
                const node = E.build()
                items.set(key, node)
            }
        })

        return props => {
            const { path } = props
            this.useVersion(path)

            const Node = () => {
                if (this.Wrapper) {
                    /*
            为什么要使用Proxy,是因为希望希望子元素的path的next方法可以在Wrapper结束后执行
            */
                    const proxy = new Proxy<
                        Partial<{
                            [key in keyof Value]: React.ReactElement
                        }>
                    >(
                        {},
                        {
                            get: (target, p) => {
                                const key = p as string
                                const Element = items.get(key)
                                if (Element) {
                                    return (
                                        <Element
                                            {...props}
                                            path={path.next(key, (parent, child) => {
                                                return { ...parent, [key]: child }
                                            })}
                                        />
                                    )
                                }
                                return null
                            },
                        }
                    )

                    return (
                        <this.Wrapper
                            ctx={props}
                            path={path}
                            Components={proxy}
                            update={(v: Value) => {
                                this.setValue(path, v)
                            }}
                        />
                    )
                }

                return Array.from(items).map(([key, Item]) => <Item key={key} {...props} path={path.next(key)} />)
            }

            return Node()
        }
    }
}
