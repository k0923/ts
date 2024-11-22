import type { BaseEditor } from "./editor"
import type { ReactEditor } from "./model"

export interface CommonEditor<Value = any, Parent = any> extends BaseEditor<Value, Parent> {
    type: 'common'
    Component: ReactEditor<Value, Parent>
}
