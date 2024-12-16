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
        return ({ path }) => {
            const [node, setNode] = useState<React.ReactNode>(null)

            useEffect(() => {
                const handler = () => {
                    const value = path.value
                    const editor = this.fn(value, path)
                    if (!editor) {
                        setNode(null)
                        return
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
                    setNode(
                        <Node
                            path={path}
                        />
                    )
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
