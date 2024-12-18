import { FormNode, BaseEditor, BaseEditorConfig, ValueHandler } from './editor'
import { Path } from './context'

export type UnArray<T> = T extends Array<infer U> ? U : T

export interface ArrayEditorWrapperProps<Value = any> {
    add: (defaultValue?: UnArray<Value>, index?: number) => void
    remove: (index: number) => void
    move: (oldIndex: number, newIndex: number) => void
    Components: {
        index: number
        value: UnArray<Value>
        Comp: React.ReactElement
    }[]
    value?: Value
    path: Path
}

export interface ArrayEditorConfig<Value = any>
    extends BaseEditorConfig<Value> {
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

        const add = (path: Path, currentValue: any[], newValue?: any, index?: number) => {
            let newData = undefined
            if (index === undefined) {
                newData = [...(currentValue ?? []), newValue]
            } else {
                newData = [
                    ...(currentValue ?? []).slice(0, index),
                    newValue,
                    ...(currentValue ?? []).slice(index),
                ]
            }
            changeHandler(path, newData)
        }

        const remove = (path: Path, currentValue: any[], index: number) => {
            if (!currentValue) {
                return
            }
            currentValue.splice(index, 1)
            changeHandler(path, [...currentValue])
        }

        const move = (path: Path, currentValue: any[], oldIndex: number, newIndex: number) => {
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

        return (props) => {
            const { path } = props
            const value = this.useNode(path)

            const Components: {
                index: number
                value: UnArray<Value>
                Comp: React.ReactElement
            }[] =
                (value as UnArray<Value>[])?.map((itemV, index) => {
                    return {
                        index: index,
                        value: itemV,
                        Comp: (
                            <Child
                                path={path.next(index, (p, c) => {
                                    const newP = [...p]
                                    newP[index] = c
                                    return newP
                                })}
                            />
                        ),
                    }
                }) ?? []

            return (
                <Wrapper
                    path={path}
                    value={value}
                    Components={Components}
                    add={(v, i) => add(path, value, v, i)}
                    remove={i => remove(path, value, i)}
                    move={(o, n) => move(path, value, o, n)}
                />
            )
        }
    }
}
