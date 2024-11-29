import type { BaseEditor, EditorProps } from "./editor"

export interface CommonEditor<Value = any> extends BaseEditor<Value> {
    type: 'common'
    Component: React.FC<Omit<EditorProps<Value>, 'path'>>
}
