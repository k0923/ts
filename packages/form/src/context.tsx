import { useState, useContext, useEffect, createContext } from "react";
import type { Path } from "./model";
import { get } from 'lodash'
import { Node, type NodeConfig } from "./tree";
import type { Editor } from "./editor";

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
    registerHook(path: Path, handler: DataHandler): void
    unRegisterHook(path: Path, handler: DataHandler): void
}

// export class DefaultFormContext<T extends object = any> {
//     private _data: T = {} as T

//     private _dataHandlers = new Map<Node,DataHandler>()

//     private _fieldHooks = new Map<string, Set<DataHandler>>()

//     private _dataHooks = new Set<DataHandler>()

//     constructor(data: T) {
//         this._data = data
//     }

//     getFieldValue(path: Path): any {
//         if (path && path.length > 0) {
//             const pathStr = path.join('.')
//             return get(this._data, pathStr)
//         }
//         return this._data
//     }

//     getPath(path:Path):string {
//         return path.join('.')
//     }

//     registerHook(path:Path,handler:DataHandler) {
//         const pathStr = this.getPath(path)
//         const handlers = this._fieldHooks.get(pathStr) ?? new Set()
//         handlers.add(handler)
//         this._fieldHooks.set(pathStr,handlers)
//     }

//     unRegisterHook(path:Path,handler:DataHandler) {
//         const pathStr = this.getPath(path)
//         const handlers = this._fieldHooks.get(pathStr)
//         if(handlers) {
//             handlers.delete(handler)
//             if(handlers.size === 0) {
//                 this._fieldHooks.delete(pathStr)
//             }
//         }
//     }

//     // registerHook(hook: Hook) {
//     //     if (hook.type === 'field') {
//     //         const strPath = hook.data.path.join('.')
//     //         const handlers = this._fieldHooks.get(strPath)
//     //         if (!handlers) {
//     //             this._fieldHooks.set(strPath, new Set([hook.data.handler]))
//     //         } else {
//     //             handlers.add(hook.data.handler)
//     //         }
//     //     } else if (hook.type === 'data') {
//     //         this._dataHooks.add(hook.data)
//     //     }

//     // }

//     // unRegisterHook(hook: Hook) {
//     //     if (hook.type === 'field') {
//     //         const strPath = hook.data.path.join('.')
//     //         const handlers = this._fieldHooks.get(strPath)
//     //         if (handlers) {
//     //             handlers.delete(hook.data.handler)
//     //             if (handlers.size === 0) {
//     //                 this._fieldHooks.delete(strPath)
//     //             }
//     //         }
//     //     } else if (hook.type === "data") {
//     //         this._dataHooks.delete(hook.data)
//     //     }
//     // }

//     setFieldValue(path: Path, value: any) {
//         const pathStr = this.getPath(path)
//         if(pathStr) {
//             set(this._data,pathStr,value)
//         } else {
//             this._data = value
//         }
//         for (const handler of this._fieldHooks.get(pathStr) ?? []) {
//             handler(value)
//         }



//     }

//     validFields(pathlist:Path[]) {

//     }

// }

// export const FormContext = createContext<IFormContext>(new DefaultFormContext({}))


export class DefaultFormContextV2<T extends object = any> {
    private _data: T = {} as T

    private _dataHandlers = new Map<Node, Set<DataHandler>>()

    private _editors = new Map<Node, Editor>()

    private _root: Node

    private _nodeConfig: NodeConfig

    constructor(data: T) {
        this._data = data
        this._nodeConfig = { caches: new Map(), data }
        this._root = new Node(this._nodeConfig, [])
    }

    get Root(): Node {
        return this._root
    }

    getFieldValue(node: Node): any {
        if (node.Path.length > 0) {
            return get(this._data, this.getPath(node.Path))
        }
        return this._data
    }

    getPath(path: Path): string {
        return path.join('.')
    }

    registerHook(node: Node, handler: DataHandler) {
        let handlers = this._dataHandlers.get(node)
        if (!handlers) {
            handlers = new Set()
            this._dataHandlers.set(node, handlers)
        }
        handlers.add(handler)
    }

    unRegisterHook(node: Node, handler: DataHandler) {
        const handlers = this._dataHandlers.get(node)
        if (handlers) {
            handlers.delete(handler)
            if (handlers.size === 0) {
                this._dataHandlers.delete(node)
                this._editors.delete(node)
            }
        }
    }

    registerEditor(node: Node, editor: Editor) {
        this._editors.set(node, editor)
    }

    // private set(node:Node,value:any) {
    //     let v = value
    //     const editor = this._editors.get(node)
    //     if(editor && editor.valueHandler) {
    //         v = editor.valueHandler(v,this.getFieldValue(node))
    //     }
    //     this._data = set(this._data,node.Path,v)
    //     this._nodeConfig.data = this._data

    //     const parent = node.parent
    //     if(parent) {

    //     }
    //     if(pathStr) {
    //         set(this._data,pathStr,v)
    //     } else {
    //         this._data = v
    //     }

    // }





    setFieldValue(node: Node, value: any) {
        this._data = set(this._data, node.Path, value)
        let finalNode = node




        const subFn = (node: Node, value: any) => {
            let v = value
            const editor = this._editors.get(node)
            if (editor && editor.valueHandler) {
                v = editor.valueHandler(v, this.getFieldValue(node))
                this._data = set(this._data, node.Path, v)
                finalNode = node
            }
           
            const parent = node.parent
            if (parent) {
                const parentValue = this.getFieldValue(parent)
                const newValue = {[node.Path[node.Path.length - 1]]:v}
                subFn(parent, { ...parentValue, ...newValue })
            }
        }
        subFn(node,value)
        this._nodeConfig.data = this._data





        for (const handler of this._dataHandlers.get(finalNode) ?? []) {
            handler(value)
        }
    }

}

function set(obj: any, path: (string | number)[] | null | undefined, value: any): any {
    // 如果路径为 null、undefined 或空数组，直接返回 value
    if (!path || path.length === 0) {
        return value
    }

    // 如果对象为 null 或 undefined，或者类型与路径不匹配，根据第一个路径类型创建新的容器
    if (obj == null ||
        (typeof path[0] === 'number' && !Array.isArray(obj)) ||
        (typeof path[0] === 'string' && Array.isArray(obj))) {
        obj = typeof path[0] === 'number' ? [] : {}
    }

    let o = obj
    path.forEach((v, i) => {
        if (i === path.length - 1) {
            o[v] = value
        } else {
            const nextKey = path[i + 1]
            // 处理当前位置为 null 或 undefined 的情况
            if (o[v] == null) {
                o[v] = typeof nextKey === 'number' ? [] : {}
            } else if (Array.isArray(o[v]) !== (typeof nextKey === 'number')) {
                o[v] = typeof nextKey === 'number' ? [] : {}
            }
            o = o[v]
        }
    })
    return obj
}