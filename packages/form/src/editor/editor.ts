import { useState, useEffect } from 'react'
import { Path } from './context'

export type FormNode = React.FC<{ path: Path }>

export type DataHandler<T = any> = (v: T) => void

export type ValueHandler<Value = any> = (value: Value, last: Value) => Value

export interface BaseEditorConfig<Value = any> {
    valueHandler?: ValueHandler<Value>
}

export interface Editor<Value = any> {
    build(): FormNode
    readonly parent: Editor | null
    accept?: (valueFromChild: any, currentValue: Value) => Value | undefined
    valueHandler(): ValueHandler<Value> | undefined
}

export abstract class BaseEditor<Value = any> implements Editor<Value> {
    protected _parent: BaseEditor | null = null

    protected hooks: Map<string, DataHandler<Value>> = new Map()

    protected _reportHandler: ((value:any,childValue: any) => any) | undefined

    valueHandler(): ((value: Value, lastValue: Value) => Value) | undefined {
        return undefined
    }

    abstract build(): FormNode

    get parent(): BaseEditor | null {
        return this._parent
    }

    refresh(path: Path, value: any) {
        path.setValue(value)
        this.hooks.get(path.path.join('.'))?.(value)
    }

    protected setValue(path: Path, value: Value) {
        const targetEditor: { editor: BaseEditor; path: Path; value: Value } = {
            editor: this,
            path: path,
            value: value,
        }
        let currentEditor: BaseEditor = this
        let currentValue = value
        while (true) {
            const lastValue = path.value
            const handler = currentEditor.valueHandler()

            if (handler) {
                const v = handler(currentValue, lastValue)
                if (!Object.is(v, currentValue)) {
                    targetEditor.editor = currentEditor
                    targetEditor.path = path
                    targetEditor.value = v
                }
                currentValue = v
            }

            if (!currentEditor.parent || !path.parent) {
                break
            }
            const parentValue = path.parent.value
            currentValue = path.buildParent(parentValue,currentValue)
            path = path.parent
            currentEditor = currentEditor.parent
        }
        targetEditor.editor.refresh(targetEditor.path, targetEditor.value)
    }


    setParent(parent: BaseEditor): void {
        this._parent = parent
    }

    protected useNode(path: Path): any {
        const [_, setValue] = useState<any>(path.value)
        useEffect(() => {
            const pathStr = path.path.flat().join('.')
            this.hooks.set(pathStr, setValue)
            return () => {
                this.hooks.delete(pathStr)
            }
        }, [path.path.join('.')])
        return path.value
    }
}
