import type { BaseEditor, Editor } from "./editor"
import type { KeyOf } from "./model"
import type { TreeNode } from "./tree"

export interface ObjectWrapperProps<Value = any, Parent = any> {
    node?: TreeNode<Value, Parent>
    Components: { [key in KeyOf<Value>]?: React.ReactElement }
    update: <K extends KeyOf<Value>>(key: K, defaultValue?: Value[K]) => void
}

export interface ObjectEditor<Value = any, Parent = any> extends BaseEditor<Value, Parent> {
    type: 'object'
    items: {
        [key in KeyOf<Value>]?: Editor<Value[key], Value>
    }
    Wrapper?: React.FC<ObjectWrapperProps<Value, Parent>>
}