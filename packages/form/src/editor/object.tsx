import type { KeyOf } from '@/common/type'
import { BaseEditor, type BaseEditorConfig, type Editor, type FormNode } from './editor'
import type { IFormContext } from './context'

export interface ObjectWrapperProps<Value = any> {
    Components: Partial<{ [key in keyof Value]: React.ReactElement }>
    update: (newValue?: Value) => void
}

export interface ObjectEditorConfig<Value = any> extends BaseEditorConfig<Value> {
    items: Partial<{
        [key in keyof Value]: Editor<Value[key]>
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

    valueHandler(): ((value: Value, lastValue: Value) => Value) | undefined {
        return this.handler
    }

    override setContext(context: IFormContext) {
        super.setContext(context)
        this.children.forEach(c => c.setContext(context))
    }

    build(): FormNode {
        const items = Array.from(this.children).map(([k, n]) => {
            return {
                key: k,
                Item: n.build(),
            }
        })

        return ({ path }) => {
            this.useNode(path)

            const Components = items.reduce<{ [key: string]: React.ReactElement }>((p, c) => {
                p[c.key as KeyOf<Value>] = <c.Item key={c.key} path={[...path, c.key]} />
                return p
            }, {})

            const Node = () => {
                if (this.Wrapper) {
                    return <this.Wrapper Components={Components as any} update={() => {}} />
                }

                return Object.values(Components).map(c => c)
            }

            return Node()
        }
    }
}
