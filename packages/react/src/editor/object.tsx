import type { KeyOf } from '@/common/type'
import { BaseEditor, type BaseEditorConfig, type FormNode } from './editor'
import { Path } from './context'

export interface ObjectWrapperProps<Value = any> {
    Components: Partial<{ [key in keyof Value]: React.ReactElement }>
    update: (newValue: Value) => void
    value: Value
    path: Path
}

export interface ObjectEditorConfig<Value = any> extends BaseEditorConfig<Value> {
    items: Partial<{
        [key in keyof Value]: BaseEditor<Value[key]>
    }>
    Wrapper?: React.FC<ObjectWrapperProps<Value>>
}

export class ObjectEditor<Value = any> extends BaseEditor<Value> {
    private children: Map<string, BaseEditor> = new Map()

    private Wrapper?: React.FC<ObjectWrapperProps<Value>>

    private handler: ((value: Value, last: Value) => Value) | undefined = undefined

    constructor({ items, Wrapper, valueHandler }: ObjectEditorConfig<Value>) {
        super()
        this.Wrapper = Wrapper
        this.handler = valueHandler
        Object.entries(items).forEach(([key, editor]) => {
            if (editor && key) {
                const E = editor as BaseEditor
                E.setParent(this)
                this.children.set(key, editor as BaseEditor)
            }
        })
    }

    processValue(value: Value, lastValue: Value): Value {
        if (this.handler) {
            return this.handler(value, lastValue)
        }
        return super.processValue(value, lastValue)
    }


    build(): FormNode {
        const items = Array.from(this.children).map(([k, n]) => {
            return {
                key: k,
                Item: n.build(),
            }
        })

        return ({ path }) => {
            const value = this.useNode(path)
            const Components = items.reduce<{
                [key: string]: React.ReactElement
            }>((p, c) => {
                p[c.key as KeyOf<Value>] = (
                    <c.Item
                        key={c.key}
                        path={path.next(c.key, (parent, child) => {
                            return { ...parent, [c.key]: child }
                        })}
                    />
                )
                return p
            }, {})

            const Node = () => {
                if (this.Wrapper) {
                    return (
                        <this.Wrapper
                            path={path}
                            value={value}
                            Components={Components as any}
                            update={(v: Value) => {
                                this.setValue(path, v)
                            }}
                        />
                    )
                }

                return Object.values(Components).map(c => c)
            }

            return Node()
        }
    }
}
