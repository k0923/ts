import { get } from 'lodash'
import { useEffect, useState } from 'react'
import type { ArrayEditor } from './array'
import { type CommonEditor } from './common'
import type { DataHandler } from './context'
import type { Editor, FormItem } from './editor'
import type { Path } from './model'
import type { ObjectEditor } from './object'
import { set } from './utils'
export type Key = string | number


export class FormData {
    private _data: any

    constructor(initialValue?: any, private onChagne?: (v: any) => void) {
        this._data = initialValue
    }

    setValue(path: Path, value: any) {
        const v = path.flat()
        this._data = set(this._data, path.flat(), value)
        this.onChagne?.(this._data)
    }

    getValue(path: Path) {
        return get(this._data, path)
    }
}


export interface NodeConfig {
    parent?: BaseEditorNode
    path: Path
    data: FormData
    editor: Editor
    resolver: (editor: NodeConfig) => BaseEditorNode
    buildParentValue?: (value: any, parentValue: any) => any
}

export abstract class BaseEditorNode {
    protected parent?: BaseEditorNode

    // protected path: Path

    protected data: FormData

    protected editor: Editor

    protected resolver: (editor: NodeConfig) => BaseEditorNode

    protected buildParentValue?: (value: any, parentValue: any) => any

    constructor(config: NodeConfig) {
        this.parent = config.parent
        // this.path = config.path
        this.data = config.data
        this.editor = config.editor
        this.resolver = config.resolver
        this.buildParentValue = config.buildParentValue
    }

    abstract build(FormItem: FormItem): React.FC<any>

    protected hooks: Set<DataHandler> = new Set()

    protected useNode(): any {
        const [_, setValue] = useState<any>(this.getValue())
        useEffect(() => {
            this.hooks.add(setValue)
            return () => {
                this.hooks.delete(setValue)
            }
        }, [])
        return this.getValue()
    }

    protected setValue(path: Path, value: any) {
        let v = value
        if (this.editor.valueHandler) {
            v = this.editor.valueHandler(value, this.getValue())
        }
        if (this.parent && this.parent.editor.valueHandler && this.buildParentValue) {
            this.parent.setValue(path.slice(0, -1), this.buildParentValue?.(v, this.parent.getValue()))
        } else {
            this.data.setValue(path, v)
            this.hooks.forEach(fn => fn(v))
        }
    }

    protected getValue(): any {
        return this.data.getValue(this.path)
    }


}


export class ObjectEditorNode extends BaseEditorNode {
    private children: Map<string, BaseEditorNode> = new Map()

    constructor(config: NodeConfig) {
        super(config)
        const editor = this.editor as ObjectEditor
        Object.entries(editor.items).forEach(([key, editor]) => {
            if (editor && key) {
                const node = this.resolver({
                    path: [...this.path, key],
                    parent: this,
                    resolver: this.resolver,
                    data: this.data,
                    editor: editor,
                    buildParentValue: (v, p) => {
                        return { ...p, [key]: v }
                    }
                })
                this.children.set(key, node)
            }
        })
    }

    build(FormItem: FormItem): React.FC<any> {
        const item = Array.from(this.children).map(([k, n]) => {
            return {
                key: k,
                Item: n.build(FormItem)
            }
        })

        return () => {
            this.useNode()
            return (
                <FormItem editor={this.editor}>
                    {
                        item.map(({ key, Item }) => {
                            return <Item key={key} />
                        })
                    }
                </FormItem>
            )
        }
    }
}

export class ArrayEditorNode extends BaseEditorNode {
    private children: Map<number, React.FC<any>> = new Map()

    constructor(config: NodeConfig) {
        super(config)
    }

    build(FormItem: FormItem): React.FC<any> {
        const editor = this.editor as ArrayEditor

        const changeHandler = (data: any[]) => {
            this.setValue(data)
        }

        const add = (currentValue: any[], newValue?: any, index?: number) => {
            let newData = undefined
            if (index === undefined) {
                newData = [...(currentValue ?? []), newValue]
            } else {
                newData = [...(currentValue ?? []).slice(0, index), newValue, ...(currentValue ?? []).slice(index)]
            }
            changeHandler(newData)
        }

        const remove = (currentValue: any[], index: number) => {
            if (!currentValue) {
                return
            }
            currentValue.splice(index, 1)
            changeHandler([...currentValue])
        }

        const move = (currentValue: any[], oldIndex: number, newIndex: number) => {
            if (oldIndex === newIndex || !currentValue) {
                return
            }
            const newData = [...(currentValue ?? [])]
            if (newIndex >= newData.length) {
                newIndex = newData.length - 1
            }
            const removeData = newData.splice(oldIndex, 1)[0]
            newData.splice(newIndex, 0, removeData)
            changeHandler(newData)
        }



        return () => {
            const value = this.useNode() as any[]

            const Components: { index: number, value?: any; Comp: React.ReactElement }[] =
                (value as any[])?.map((itemV, index) => {
                    let Child = this.children.get(index)
                    if (!Child) {
                        const node = this.resolver({
                            editor: editor.editor,
                            data: this.data,
                            path: [...this.path, index],
                            resolver: this.resolver,
                            parent: this,
                        })
                        Child = node.build(FormItem)
                        this.children.set(index, Child)
                    }

                    return {
                        index: index,
                        value: itemV,
                        Comp: <Child />,
                    }
                }) ?? []



            return <FormItem editor={this.editor}>
                {
                    <editor.Wrapper Components={Components} add={(v, i) => add(value, v, i)} remove={(i) => remove(value, i)} move={(o, n) => move(value, o, n)} />
                }
            </FormItem>
        }
    }
}

export class IteratorEditorNode extends BaseEditorNode {
    private child: BaseEditorNode

    constructor(config: NodeConfig) {
        super(config)
        const editor = this.editor as ArrayEditor
        this.child = this.resolver(config)
    }

    FormNode: React.FC<any> = (props: any) => {

    }

    build(FormItem: FormItem): React.FC<any> {
        const editor = this.editor as ArrayEditor

        const changeHandler = (data: any[]) => {
            this.setValue(data)
        }

        const add = (currentValue: any[], newValue?: any, index?: number) => {
            let newData = undefined
            if (index === undefined) {
                newData = [...(currentValue ?? []), newValue]
            } else {
                newData = [...(currentValue ?? []).slice(0, index), newValue, ...(currentValue ?? []).slice(index)]
            }
            changeHandler(newData)
        }

        const remove = (currentValue: any[], index: number) => {
            if (!currentValue) {
                return
            }
            currentValue.splice(index, 1)
            changeHandler([...currentValue])
        }

        const move = (currentValue: any[], oldIndex: number, newIndex: number) => {
            if (oldIndex === newIndex || !currentValue) {
                return
            }
            const newData = [...(currentValue ?? [])]
            if (newIndex >= newData.length) {
                newIndex = newData.length - 1
            }
            const removeData = newData.splice(oldIndex, 1)[0]
            newData.splice(newIndex, 0, removeData)
            changeHandler(newData)
        }



        return () => {
            const value = this.useNode() as any[]

            const Components: { index: number, value?: any; Comp: React.ReactElement }[] =
                (value as any[])?.map((itemV, index) => {
                    let Child = this.children.get(index)
                    if (!Child) {
                        const node = this.resolver({
                            editor: editor.editor,
                            data: this.data,
                            path: [...this.path, index],
                            resolver: this.resolver,
                            parent: this,
                        })
                        Child = node.build(FormItem)
                        this.children.set(index, Child)
                    }

                    return {
                        index: index,
                        value: itemV,
                        Comp: <Child />,
                    }
                }) ?? []



            return <FormItem editor={this.editor}>
                {
                    <editor.Wrapper Components={Components} add={(v, i) => add(value, v, i)} remove={(i) => remove(value, i)} move={(o, n) => move(value, o, n)} />
                }
            </FormItem>
        }
    }
}

export class CommonEditorNode extends BaseEditorNode {
    constructor(config: NodeConfig) {
        super(config)
    }

    build(FormItem: FormItem): React.FC<any> {
        const handler = (v: any) => this.setValue(v)
        const editor = this.editor as CommonEditor
        return () => {
            const value = this.useNode()

            return <FormItem editor={this.editor}>
                <editor.Component value={value} onChange={handler} />
            </FormItem>
        }
    }
}
