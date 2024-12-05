import { useEffect, useState } from 'react'
import { get } from 'lodash'
import { set } from './utils'
import type { Editor } from './editor'

type PathSegment = string | number

export type Path = (PathSegment | PathSegment[])[]

export type DataHandler = (v: any) => void

export class FormData {
    private _data: any

    constructor(
        initialValue?: any,
        private onChagne?: (v: any) => void
    ) {
        this._data = initialValue
    }

    setValue(path: Path, value: any) {
        const v = path.flat()
        this._data = set(this._data, path.flat(), value)
        this.onChagne?.(this._data)
    }

    getValue(path: Path) {
        return get(this._data, path.flat())
    }
}

export type FormNode = React.FC<{ path: Path }>

export type FormItemWrapper = React.FC<{
    editor: Editor
    path: Path
    node: BaseEditorNode
    children: React.ReactElement | React.ReactElement[]
}>

export interface NodeConfig {
    parent?: BaseEditorNode
    data: FormData
    editor: Editor
    resolver: (editor: NodeConfig) => BaseEditorNode
    buildParentValue?: (value: any, parentValue: any) => any
}

export abstract class BaseEditorNode {
    protected parent?: BaseEditorNode

    protected hooks: Map<string, DataHandler> = new Map()

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

    abstract build(FormItem?: FormItemWrapper): FormNode

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

    protected setValue(path: Path, value: any) {
        let v = value
        if (this.editor.valueHandler) {
            v = this.editor.valueHandler(value, this.getValue(path))
        }
        if (this.parent && this.parent.editor.valueHandler && this.buildParentValue) {
            const parentPath = path.slice(0, -1)
            this.parent.setValue(
                parentPath,
                this.buildParentValue?.(v, this.parent.getValue(parentPath))
            )
        } else {
            this.data.setValue(path, v)
            const handler = this.hooks.get(path.flat().join('.'))
            handler?.(v)
        }
    }

    protected getValue(path: Path): any {
        return this.data.getValue(path)
    }
}
