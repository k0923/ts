import { useState, useEffect } from "react"
import type { Path, PathSegment } from "@/common/type"
import type { IFormContext } from "./context"
import { set } from "../utils/data"


export type FormNode = React.FC<{ path: Path }>

export type DataHandler<T = any> = (v: T) => void

export type ValueHandler<Value = any> = (value: Value, last: Value) => Value

export interface BaseEditorConfig<Value = any> {
    valueHandler?: ValueHandler<Value>
}


export interface Editor<Value = any> {
    build(): FormNode
    parent(): Editor | null
    accept?: (valueFromChild: any, currentValue: Value) => Value | undefined
    valueHandler(): ValueHandler<Value> | undefined
}

export abstract class BaseEditor<Value = any> implements Editor<Value> {

    protected _parent: BaseEditor | null = null

    protected hooks: Map<string, DataHandler<Value>> = new Map()

    protected context: IFormContext | null = null

    valueHandler(): ((value: Value, lastValue: Value) => Value) | undefined {
        return undefined
    }

    abstract build(): FormNode

    parent(): BaseEditor | null {
        return this._parent
    }

    setContext(context: IFormContext) {
        this.context = context
    }

    refresh(path: Path, value: any) {
        console.log(this, path, value)
        this.context?.setValue(path, value)

        this.hooks.get(path.flat().join('.'))?.(value)
    }



    protected setValue(path: Path, value: Value) {
        const targetEditor:{ editor: BaseEditor, path: Path, value: Value} = {
            editor: this,
            path: path,
            value: value,
        }

        let currentEditor: BaseEditor = this

        while (true) {
            const lastValue = currentEditor.getValue(path)
            const handler = currentEditor.valueHandler()

            if (handler) {
                const v = handler(value, lastValue)
                if (!Object.is(v, value)) {
                    targetEditor.editor = currentEditor
                    targetEditor.path = path
                    targetEditor.value = v
                }
            }

            const parent = currentEditor.parent()
            if (!parent) break

            const parentPath = path.slice(0, -1)
            const lastSegment = path[path.length - 1]
            let parentValue = parent.getValue(parentPath)

            parentValue = this.updateParentValue(parentValue, lastSegment, value)

            path = parentPath
            value = parentValue
            currentEditor = parent
        }
        targetEditor.editor.refresh(targetEditor.path,targetEditor.value)

       
    }

    private updateParentValue(parentValue: any, lastSegment: PathSegment | PathSegment[], value: any): any {
        if (typeof lastSegment === 'number') {
            const newArray = Array.isArray(parentValue) ? [...parentValue] : []
            newArray[lastSegment] = value
            return newArray
        } else if (typeof lastSegment === 'string') {
            return { ...parentValue, [lastSegment]: value }
        } else {
            return set(parentValue, lastSegment, value)
        }
    }

    protected getValue(path: Path) {
        return this.context?.getValue(path)
    }

    setParent(parent: BaseEditor): void {
        this._parent = parent
    }

    protected useNode(path: Path): any {
        const [_, setValue] = useState<any>(this.getValue(path))
        useEffect(() => {
            const pathStr = path.flat().join('.')
            this.hooks.set(pathStr, setValue)
            return () => {
                this.hooks.delete(pathStr)
            }
        }, [])
        return this.getValue(path)
    }
}


