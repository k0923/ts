import type { BaseEditor, BaseEditorProps, Editor, EditorProps, FormItem } from "./editor"
import type { UnArray } from "./model"

export interface ArrayEditorWrapperProps<Value = any, Parent = any> extends BaseEditorProps<Value, Parent> {
    add: (defaultValue?: UnArray<Value>, index?: number) => void
    remove: (index: number) => void
    move: (oldIndex: number, newIndex: number) => void
    Components: { index: number, value?: UnArray<Value>, Comp: React.ReactElement }[]
}

export interface ArrayEditor<Value = any, Parent = any> extends BaseEditor<Value, Parent> {
    type: 'array'
    editor: Editor<Value, Parent>
    Wrapper: React.FC<ArrayEditorWrapperProps<Value, Parent>>
}

export function buildArrayEditor<T extends EditorProps>(editor: ArrayEditor, fetcher: (editor: Editor) => React.FC<T>): React.FC<T> {
    const Comp = fetcher(editor.editor)
    const Children = (props: T) => {
        const { path, onChange, value, parent } = props
        const changeHandler = (data: any) => {
            let result = data
            if (editor.valueHandler) {
                result = editor.valueHandler(result, value, parent)
            }
            onChange?.(result)
        }

        const add = (defaultValue?: any, index?: number) => {
            let newData = undefined
            if (index === undefined) {
                newData = [...(value ?? []), defaultValue]
            } else {
                newData = [...(value ?? []).slice(0, index), defaultValue as any, ...(value ?? []).slice(index)]
            }
            changeHandler(newData)
        }

        const remove = (index: number) => {
            const newData = [...(value ?? [])]
            newData.splice(index, 1)
            changeHandler(newData)
        }

        const move = (oldIndex: number, newIndex: number) => {
            if (oldIndex === newIndex) {
                return
            }
            const newData = [...(value ?? [])]
            if (newIndex >= newData.length) {
                newIndex = newData.length - 1
            }
            const removeData = newData.splice(oldIndex, 1)[0]
            newData.splice(newIndex, 0, removeData)
            changeHandler(newData)
        }

        const parentNode = parent?.addChild(value)

        const Components: { index: number, value?: any; Comp: React.ReactElement }[] =
            (value as any[])?.map((itemV, index) => {
                const newPath = [...path, index]
                return {
                    index: index,
                    value: itemV,
                    Comp: (
                        <Comp
                            {...props}
                            key={index}
                            path={newPath}
                            value={itemV}
                            parent={parentNode}
                            onChange={(newV) => {
                                const newData = [...value]
                                newData[index] = newV
                                changeHandler(newData)
                            }}
                        />
                    ),
                }
            }) ?? []
        return (
            <editor.Wrapper
                Components={Components}
                add={add}
                remove={remove}
                move={move}
                parent={parent}
                value={value}
            />
        )
    }

    return Children
}