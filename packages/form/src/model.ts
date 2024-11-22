import type { TreeNode } from "./tree"

export type UnArray<T> = T extends Array<infer U> ? U : T

export type KeyOf<T> = Extract<keyof T, string>

export type RequiredFn<Value = any, Parent = any> = (node: TreeNode<Value, Parent>) => boolean

export type Validator<Value = any, Parent = any> = (callback: (node: React.ReactNode) => void, para: TreeNode<Value, Parent>) => void

export interface EditableWidgetProps<Value = any, Parent = any> {
    node?: TreeNode<Value, Parent>
    onChange?: (value?: Value) => void
}

export type ReactEditor<Value = any, Parent = any> = React.FC<EditableWidgetProps<Value, Parent>>
