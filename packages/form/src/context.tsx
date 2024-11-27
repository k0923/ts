import { useState, useContext, useEffect } from "react";
import type { Path } from "./model";
import { set, get } from 'lodash'

type dataHandler = (data: any) => void

export class FormContext<T extends object = any> {
    private _data: T

    private _hooks: Map<string, Set<dataHandler>> = new Map()

    constructor(initialData: T) {
        this._data = initialData
    }

    getFieldValue(path: Path): any {
        const pathStr = path.join('.')
        return get(this._data, pathStr)
    }

    registerHook(path: Path, handler: dataHandler) {
        const strPath = path.join('.')
        const handlers = this._hooks.get(strPath)
        if (!handlers) {
            this._hooks.set(strPath, new Set([handler]))
        } else {
            handlers.add(handler)
        }
    }

    unregisterHook(path: Path, handler: dataHandler) {
        const strPath = path.join('.')
        const handlers = this._hooks.get(strPath)
        if (handlers) {
            handlers.delete(handler)
            if (handlers.size === 0) {
                this._hooks.delete(strPath)
            }
        }

    }

    setFieldValue(path: Path, value: any) {
        const pathStr = path.join('.')
        set(this._data, pathStr, value)
        for (const handler of this._hooks.get(pathStr) ?? []) {
            handler(value)
        }
    }
}

function useFormData(path: Path, ctx: FormContext) {
    const [state, setState] = useState<any>(ctx.getFieldValue(path))
    useEffect(() => {
        ctx.registerHook(path, setState)
        return () => {
            ctx.unregisterHook(path, setState)
        }
    }, [])


    return state
}