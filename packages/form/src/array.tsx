import type { FormItemWrapper, FormNode, Path } from './base'

import type { ArrayEditor } from './editor'
import { BaseEditorNode, type NodeConfig } from './base'

export class ArrayEditorNode extends BaseEditorNode {
    constructor(config: NodeConfig) {
        super(config)
    }

    build(FormItem?: FormItemWrapper): FormNode {
        const editor = this.editor as ArrayEditor

        const changeHandler = (path: Path, data: any[]) => {
            this.setValue(path, data)
        }

        const add = (
            path: Path,
            currentValue: any[],
            newValue?: any,
            index?: number
        ) => {
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

        const move = (
            path: Path,
            currentValue: any[],
            oldIndex: number,
            newIndex: number
        ) => {
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

        const child = this.resolver({
            editor: editor.editor,
            data: this.data,
            resolver: this.resolver,
            parent: this,
        })
        const Child = child.build(FormItem)

        return ({ path }) => {
            const value = this.useNode(path) as any[]

            const Components: {
                index: number
                value?: any
                Comp: React.ReactElement
            }[] =
                (value as any[])?.map((itemV, index) => {
                    return {
                        index: index,
                        value: itemV,
                        Comp: <Child path={[...path, index]} />,
                    }
                }) ?? []

            if (!FormItem) {
                return (
                    <editor.Wrapper
                        value={value}
                        Components={Components}
                        add={(v, i) => add(path, value, v, i)}
                        remove={i => remove(path, value, i)}
                        move={(o, n) => move(path, value, o, n)}
                    />
                )
            }

            return (
                <FormItem editor={this.editor} path={path} node={this}>
                    {
                        <editor.Wrapper
                            value={value}
                            Components={Components}
                            add={(v, i) => add(path, value, v, i)}
                            remove={i => remove(path, value, i)}
                            move={(o, n) => move(path, value, o, n)}
                        />
                    }
                </FormItem>
            )
        }
    }
}
