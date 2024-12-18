import { BaseEditor, FormNode } from './editor'
import { LRUCache } from '../utils/lru'
import { Path } from './context'
import { useEffect, useState } from 'react'

export interface FuncEditorConfig<Value> {
    cacheSize: number
    func: (value: Value, path: Path) => BaseEditor<Value> | undefined
}

export class FuncEditor<Value> extends BaseEditor<Value> {
    private fn: (value: Value, path: Path) => BaseEditor<Value> | undefined

    private cache: LRUCache<BaseEditor<Value>, FormNode>

    constructor({ func, cacheSize }: FuncEditorConfig<Value>) {
        super()
        this.fn = func
        this.cache = new LRUCache<BaseEditor<Value>, FormNode>(cacheSize)
    }

    build(): FormNode {
        const getNode = (path: Path) => {
            const value = path.value
            const editor = this.fn(value, path)
            if (!editor) {
                return null
            }
            if (this.parent) {
                editor.setParent(this.parent)
            }
            let node = this.cache.get(editor)
            if (!node) {
                node = editor.build()
                this.cache.set(editor, node)
            }
            const Node = node
            return <Node path={path} />
        }

        return ({ path }) => {
            const [node, setNode] = useState<React.ReactNode>(getNode(path))
            useEffect(() => {
                const handler = () => {
                    setNode(getNode(path))
                }
                path.context.registerHook(handler)
                return () => {
                    path.context.unregisterHook(handler)
                }
            }, [path.path.join('.')])
            return node
        }
    }
}
