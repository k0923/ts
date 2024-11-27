import type { BaseEditor, BaseEditorProps, Editor, EditorProps } from "./editor"
import type { KeyOf } from "./model"
import type { TreeNode } from "./tree"

export interface ObjectWrapperProps<Value = any, Parent = any> extends BaseEditorProps<Value, Parent> {
    Components: { [key in KeyOf<Value>]?: React.ReactElement }
    update: (newValue?: Value) => void
}

export interface ObjectEditor<Value = any, Parent = any> extends BaseEditor<Value, Parent> {
    type: 'object'
    items: {
        [key in KeyOf<Value>]?: Editor<Value[key], Value>
    }
    Wrapper?: React.FC<ObjectWrapperProps<Value, Parent>>
}

export function buildObjectEditor<T extends EditorProps>(editor: ObjectEditor, fetcher: (editor?: Editor) => React.FC<T>): React.FC<T> {
    const allComponents = Object.entries(editor.items).map(([key, value]) => {
        const Editor = fetcher(value)
        return {
            key: key,
            Editor: Editor,
        }
    })



    const Children = (props: T) => {
        const { path, value, onChange, parent } = props
        const changeHandler = (newValue?: any, key?: string) => {
            const last = value
            let result: any
            if (key) {
                result = { ...value, [key]: newValue }
            } else {
                result = { ...newValue }
            }
            result = editor.valueHandler?.(result, last, parent) ?? result
            onChange?.(result)
        }

        // const parentNode = parent?.addChild(key, value)

        const buildComp = (item: { key: string; Editor: React.FC<T> }) => {
            const newPath = [...path, item.key]
            const node = parent?.addChild(item.key, value?.[item.key])

            return (
                <item.Editor
                    {...props}
                    key={item.key}
                    path={newPath}
                    value={value?.[item.key]}
                    parent={node}
                    onChange={(v) => changeHandler(v, item.key)}
                />
            )
        }

        if (editor.Wrapper) {
            const comps: { [key: string]: React.ReactElement } = {}

            allComponents.forEach((item) => {
                comps[item.key] = buildComp(item)
            })

            return (
                <editor.Wrapper
                    value={value}
                    parent={parent}
                    Components={comps}
                    update={changeHandler}
                />
            )
        }
        return (
            <>
                {allComponents.map((item) => {
                    return buildComp(item)
                })}
            </>
        )
    }

    return Children
}