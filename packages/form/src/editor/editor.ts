import { useState, useEffect } from "react"
import type { Path } from "@/common/type"
import type { IFormContext } from "./context"


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

    protected setValue(path: Path, value: Value): boolean {
        if (!this.context) {
            return false
        }

        const lastValue = this.getValue(path)
        let v = value
        const handler = this.valueHandler()
        if (handler) {
            v = handler(value, lastValue)
        }

        if (Object.is(v, lastValue)) {
            return false
        }
        const parent = this.parent()
        if (parent && parent.valueHandler()) {
            const parentPath = path.slice(0, -1)
            const lastSegment = path[path.length - 1]
            let parentValue = parent.getValue(parentPath)
            switch (typeof lastSegment) {
                case 'number':
                    if (!parentValue) {
                        parentValue = []
                    }
                    parentValue[lastSegment] = v
                    break
                case 'string':
                    if (!parentValue) {
                        parentValue = {}
                    }
                    parentValue[lastSegment] = v
                    break
                default:
                    if (!parentValue) {
                        parentValue = {}
                    }
                    parentValue[lastSegment.join('.')] = v
                    break
            }
            if (parent.setValue(parentPath, parentValue) === true) {
                return true
            }
        }
        this.context?.setValue(path, v)
        this.hooks.get(path.flat().join('.'))?.(v)
        return true

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


