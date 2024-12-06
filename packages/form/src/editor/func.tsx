import { BaseEditor, FormNode } from './editor'
import { LRUCache } from '../utils/lru'
import { IFormContext } from './context'

export interface FuncEditorConfig<Value> {
    cacheSize: number
    func: (value: Value) => BaseEditor<Value>
}

export class FuncEditor<Value> extends BaseEditor<Value> {
    private fn: (value: Value) => BaseEditor<Value>

    private cache: LRUCache<BaseEditor<Value>, FormNode>

    constructor({ func, cacheSize }: FuncEditorConfig<Value>) {
        super()
        this.fn = func
        this.cache = new LRUCache<BaseEditor<Value>, FormNode>(cacheSize)
    }

    setContext(context: IFormContext) {
        super.setContext(context)
        this.cache.keys().forEach(editor => {
            editor.setContext(context)
        })
    }

    build(): FormNode {
        return ({ path }) => {
            const value = this.useNode(path)
            const editor = this.fn(value)
            let Node = this.cache.get(editor)
            if (!Node) {
                if (this.context) {
                    editor.setContext(this.context)
                }
                editor.setParent(this)
                Node = editor.build()
                this.cache.set(editor, Node)
            }
            return <Node path={path} />
        }
    }
}
