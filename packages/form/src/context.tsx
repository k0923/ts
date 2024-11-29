import { useState, useContext, useEffect, createContext } from "react";
import type { Path } from "./model";
import { set, get } from 'lodash'

export type Hook = FieldHook | DataHook

type FieldHook = {
    type: 'field'
    data: {
        path: Path
        handler: DataHandler
    }
}

type DataHook = {
    type: 'data'
    data: DataHandler
}


export type DataHandler<T = any> = (data: T) => void



export interface IFormContext {
    getFieldValue(path: Path): any
    setFieldValue(path: Path, value: any): void
    registerHook(hook: Hook): void
    unRegisterHook(hook: Hook): void
    validFields(pathlist: Path[]): void
}

export class DefaultFormContext<T extends object = any> {
    private _data: T = {} as T

    private _fieldHooks = new Map<string, Set<DataHandler>>()

    private _dataHooks = new Set<DataHandler>()

    constructor(data: T) {
        this._data = data
    }

    getFieldValue(path: Path): any {
        if (path && path.length > 0) {
            const pathStr = path.join('.')
            return get(this._data, pathStr)
        }
        return this._data
    }

    registerHook(hook: Hook) {
        if (hook.type === 'field') {
            const strPath = hook.data.path.join('.')
            const handlers = this._fieldHooks.get(strPath)
            if (!handlers) {
                this._fieldHooks.set(strPath, new Set([hook.data.handler]))
            } else {
                handlers.add(hook.data.handler)
            }
        } else if (hook.type === 'data') {
            this._dataHooks.add(hook.data)
        }

    }

    unRegisterHook(hook: Hook) {
        if (hook.type === 'field') {
            const strPath = hook.data.path.join('.')
            const handlers = this._fieldHooks.get(strPath)
            if (handlers) {
                handlers.delete(hook.data.handler)
                if (handlers.size === 0) {
                    this._fieldHooks.delete(strPath)
                }
            }
        } else if (hook.type === "data") {
            this._dataHooks.delete(hook.data)
        }
    }

    setFieldValue(path: Path, value: any) {
        if (path && path.length > 0) {
            const pathStr = path.join('.')
            set(this._data, pathStr, value)
            for (const handler of this._fieldHooks.get(pathStr) ?? []) {
                handler(value)
            }
        } else {
            this._data = value
        }
        for (const handler of this._dataHooks) {
            handler(this._data)
        }
    }

    validFields(pathlist:Path[]) {
        
    }

}

export const FormContext = createContext<IFormContext>(new DefaultFormContext({}))


// export function useFormData(path: Path) {
//     const formCtx = useContext(FormContext)
//     const [state, setState] = useState<any>(formCtx.getFieldValue(path))
//     useEffect(() => {
//         formCtx.registerHook('field',)
//         formCtx.registerHook(path, setState)
//         return () => {
//             formCtx.unRegisterHook(path, setState)
//         }
//     }, [])


//     return state
// }