import { BaseEditor, FormNode } from './editor'
import { LRUCache } from '../utils/lru'
import { IFormContext, Path } from './context'

export interface FuncEditorConfig<Value> {
    cacheSize: number
    func: (value: Value, path: Path) => BaseEditor<Value>
}

export class FuncEditor<Value> extends BaseEditor<Value> {
    private fn: (value: Value, path: Path) => BaseEditor<Value>

    private cache: LRUCache<BaseEditor<Value>, FormNode>

    constructor({ func, cacheSize }: FuncEditorConfig<Value>) {
        super()
        this.fn = func
        this.cache = new LRUCache<BaseEditor<Value>, FormNode>(cacheSize)
    }

    processValue(value: Value, lastValue: Value): Value {
        if (value) {
            console.log(JSON.stringify(value))
            if (Array.isArray(value)) {
                return [...value] as Value
            } else if (typeof value === 'object') {
                return { ...value } as Value
            }
        }
        return value
    }

    valueHandler(): ((value: Value, lastValue: Value) => Value) | undefined {
        return this.processValue
    }

    build(): FormNode {
        return ({ path }) => {
            console.log(path.path)
            const value = this.useNode(path)
            const editor = this.fn(value, path)
            let Node = this.cache.get(editor)
            if (!Node) {
                editor.setParent(this)
                Node = editor.build()
                this.cache.set(editor, Node)
            }
            return <Node path={path.next(undefined)} />
        }
    }
}
