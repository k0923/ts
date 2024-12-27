import { FormNode, BaseEditor, BaseEditorConfig, ValueHandler } from './editor'
import { Path } from './context'

export type UnArray<T> = T extends Array<infer U> ? U : T

export class ArrayItem {
    private _path: Path | null = null

    constructor(
        private _index: number,
        private parentPath: Path,
        private Node: FormNode
    ) {}

    get index() {
        return this._index
    }

    get path() {
        if (!this._path) {
            this._path = this.parentPath.next(this.index, (p, c) => {
                const newP = [...p]
                newP[this.index] = c
                return newP
            })
        }
        return this._path
    }

    get Comp(): React.ReactElement {
        return <this.Node path={this.path} />
    }
}

export interface ArrayEditorWrapperProps<Value = any> {
    add: (defaultValue?: UnArray<Value>, index?: number) => void
    remove: (index: number) => void
    move: (oldIndex: number, newIndex: number) => void
    Components: {
        path: Path
        index: number
        Comp: React.ReactElement
    }[]
    path: Path
}

export interface ArrayEditorConfig<Value = any> extends BaseEditorConfig<Value> {
    editor: BaseEditor<UnArray<Value>>
    Wrapper: React.FC<ArrayEditorWrapperProps<Value>>
}

export class ArrayEditor<Value = any> extends BaseEditor<Value> {
    private child: BaseEditor<UnArray<Value>>

    private handler: ValueHandler<Value> | undefined

    private Wrapper: React.FC<ArrayEditorWrapperProps<Value>>

    processValue(value: Value, lastValue: Value): Value {
        if (this.handler) {
            return this.handler(value, lastValue)
        } else {
            return super.processValue(value, lastValue)
        }
    }

    constructor({ editor, valueHandler, Wrapper }: ArrayEditorConfig<Value>) {
        super()
        this.child = editor
        this.handler = valueHandler
        this.Wrapper = Wrapper
        this.child.setParent(this)
    }

    build(): FormNode {
        const changeHandler = (path: Path, data: any[]) => {
            this.setValue(path, data as any)
        }

        const add = (path: Path, newValue?: any, index?: number) => {
            const currentValue = path.value as any[]
            let newData = undefined
            if (index === undefined) {
                newData = [...(currentValue ?? []), newValue]
            } else {
                newData = [...(currentValue ?? []).slice(0, index), newValue, ...(currentValue ?? []).slice(index)]
            }
            changeHandler(path, newData)
        }

        const remove = (path: Path, index: number) => {
            const currentValue = path.value as any[]
            if (!currentValue) {
                return
            }
            const removedData = [...currentValue]
            removedData.splice(index, 1)
            changeHandler(path, removedData)
        }

        const move = (path: Path, oldIndex: number, newIndex: number) => {
            const currentValue = path.value as any[]
            if (oldIndex === newIndex || !currentValue) {
                return
            }
            const newData = [...(currentValue ?? [])]
            if (newIndex >= newData.length) {
                newIndex = newData.length - 1
            }
            const removeData = newData.splice(oldIndex, 1)[0]
            newData.splice(newIndex, 0, removeData)
            changeHandler(path, newData)
        }

        const Child = this.child.build()

        const Wrapper = this.Wrapper

        return props => {
            const { path } = props
            this.useVersion(path)

            const Components =
                (path.value as UnArray<Value>[])?.map((_itemV, index) => {
                    return new ArrayItem(index, path, Child)
                }) ?? []

            return (
                <Wrapper
                    path={path}
                    Components={Components}
                    add={(v, i) => {
                        add(path, v, i)
                    }}
                    remove={i => {
                        remove(path, i)
                    }}
                    move={(o, n) => move(path, o, n)}
                />
            )
        }
    }
}
