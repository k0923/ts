import { LRUCache } from '../utils/lru'
import { Path } from './context'
import { BaseEditor, BaseEditorConfig, FormNode, ValueHandler } from './editor'

export interface FuncEditorConfig<Value> extends BaseEditorConfig<Value> {
    cacheSize?: number
    func: (path: Path) => BaseEditor<Value> | undefined
}

export class FuncEditor<Value> extends BaseEditor<Value> {
    private fn: (path: Path) => BaseEditor<Value> | undefined

    private cache: LRUCache<BaseEditor<Value>, FormNode>

    private handler: ValueHandler<Value> | undefined

    constructor({ func, cacheSize = 10, valueHandler }: FuncEditorConfig<Value>) {
        super()
        this.fn = func
        this.handler = valueHandler
        this.cache = new LRUCache<BaseEditor<Value>, FormNode>(cacheSize)
    }

    processValue(value: Value, lastValue: Value): Value {
        if (this.handler) {
            return this.handler(value, lastValue)
        }
        return value
    }

    build(): FormNode {
        const EmptyNode: FormNode = () => null

        const getNode = (path: Path) => {
            const editor = this.fn(path)
            if (!editor) {
                return EmptyNode
            }
            editor.setParent(this)
            let node = this.cache.get(editor)
            if (!node) {
                node = editor.build()
                this.cache.set(editor, node)
            }
            return node
        }

        return ({ path }) => {
            this.useVersion(path)
            const Node = getNode(path)
            return <Node path={path.next([], (_p, c) => c)} />
        }
    }
}
