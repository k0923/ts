import type { BaseEditor, BaseEditorProps, Editor, EditorProps } from "./editor"
import type { KeyOf } from "./model"

export interface ObjectWrapperProps<Value = any> extends BaseEditorProps<Value> {
    Components: { [key in KeyOf<Value>]?: React.ReactElement }
    update: (newValue?: Value) => void
}

export interface ObjectEditor<Value = any> extends BaseEditor<Value> {
    type: 'object'
    items: {
        [key in KeyOf<Value>]?: Editor<Value[key]>
    }
    Wrapper?: React.FC<ObjectWrapperProps<Value>>
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
        const { path, value, onChange, node } = props
        const changeHandler = (newValue?: any, key?: string) => {
            const last = value
            let result: any
            if (key) {
                result = { ...value, [key]: newValue }
            } else {
                result = { ...newValue }
            }
            result = editor.valueHandler?.(result, last, node) ?? result
            onChange?.({ ...result })
        }

        // const parentNode = parent?.addChild(key, value)

        const buildComp = (item: { key: string; Editor: React.FC<T> }) => {
            const newPath = [...path, item.key]
            const subNode = node?.next(item.key)

            return (
                <item.Editor
                    {...props}
                    key={item.key}
                    path={newPath}
                    value={value?.[item.key]}
                    node={subNode}
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
                    node={node}
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