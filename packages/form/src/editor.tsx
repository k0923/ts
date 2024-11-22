import type { ArrayEditor } from "./array";
import type { CommonEditor } from "./common";
import type { RequiredFn, ReactEditor, Validator } from "./model";
import type { ObjectEditor } from "./object";
import type { TreeNode } from "./tree";

export type Editor<Value = any, Parent = any> = CommonEditor<Value, Parent> | ArrayEditor<Value, Parent> | ObjectEditor<Value, Parent>

export interface BaseEditor<Value = any, Parent = any> {
    Title?: ReactEditor<Value, Parent> | string
    Desc?: ReactEditor<Value, Parent> | string
    required?: RequiredFn<Value, Parent> | boolean
    validator?: Validator<Value, Parent>
    valueHandler?: (currentValue: Value, lastValue: Value, parent?: TreeNode<Value, Parent>) => Value | undefined
}

export interface EditorProps<Value = any, Parent = any> {
    parent?: TreeNode<Parent>
    path: string[]
    value?: Value
    onChange?: (v?: Value) => void
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

        const Components: { value?: any; comp: React.ReactElement }[] =
            (value as any[])?.map((itemV, index) => {
                const newPath = [...path, index]

                return {
                    value: itemV,
                    comp: (
                        <Comp
                            {...props}
                            key={index}
                            path={newPath}
                            value={itemV}
                            parent={parentNode}
                            index={index}
                            onChange={(newV) => {
                                const newData = [...value]
                                newData[index] = newV
                                changeHandler(newData)
                            }
                            }
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
                node={node}
                value={value}
            />
        )
    }

    return Children
}