import { BaseEditor, FormNode } from './editor'
import { LRUCache } from '../utils/lru'
import { Path, PathSegment } from './context'
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
        const EmptyNode: FormNode = () => null

        const getNode = (path: Path) => {
            const value = path.value
            const editor = this.fn(value, path)
            if (!editor) {
                return EmptyNode
            }
            if (this.parent) {
                editor.setParent(this.parent)
            }
            let node = this.cache.get(editor)
            if (!node) {
                node = editor.build()
                this.cache.set(editor, node)
            }
            return node
        }

        return ({ path }) => {
            const [Node, setNode] = useState<FormNode>(() => getNode(path))
            useEffect(() => {
                const handler = (seg: PathSegment[], v: Value) => {
                    const updatePath = seg.join('.')
                    const currentPath = path.path.join('.')
                    // console.log({
                    //     updatePath,
                    //     currentPath,
                    //     match: updatePath.indexOf(currentPath),
                    // })

                    // if (updatePath !== '' && currentPath.indexOf(updatePath) < 0) {
                    //     console.log('return')
                    //     return
                    // }

                    // if (Object.is(value, v)) {
                    //     return
                    // }
                    // console.log('reset')
                    // setNode(getNode(path))
                }
                path.context.registerHook(handler)
                return () => {
                    path.context.unregisterHook(handler)
                }
            }, [path.path.join('.')])
            return <Node path={path} />
        }
    }
}
