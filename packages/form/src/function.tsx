import type { Editor } from './editor'

export interface FunctionEditor<Value = any> {
    type: 'function'
    func: (value: any) => Editor<Value>
}
