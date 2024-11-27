import type { BaseEditor, EditorProps } from "./editor"

export interface CommonEditor<Value = any, Parent = any> extends BaseEditor<Value, Parent> {
    type: 'common'
    Component: React.FC<Omit<EditorProps<Value, Parent>, 'path'>>
}
