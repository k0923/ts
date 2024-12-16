import { useMemo } from 'react'
import { type FormItemWrapper, type Path, FormData } from './base'
import type { KeyOf, UnArray, Validator } from './model'
import { DefaultResolver } from './resolver'

export interface BaseEditor<Value = any> {
    validator?: Validator<Value>
    valueHandler?: (
        currentValue: Value,
        lastValue: Value,
        node?: Node
    ) => Value | undefined
}

export interface CommonEditor<Value = any> extends BaseEditor<Value> {
    type: 'common'
    Component: React.FC<{ value: Value; onChange: (v: Value) => void }>
}

export interface ObjectWrapperProps<Value = any> {
    Components: { [key in KeyOf<Value>]?: React.ReactElement }
    update: (newValue?: Value) => void
}

export interface ObjectEditor<Value = any> extends BaseEditor<Value> {
    type: 'object'
    items: Partial<{
        [key in KeyOf<Value>]: Editor<Value[key]>
    }>
    Wrapper?: React.FC<ObjectWrapperProps<Value>>
}

export interface ArrayEditorWrapperProps<Value = any> {
    add: (defaultValue?: UnArray<Value>, index?: number) => void
    remove: (index: number) => void
    move: (oldIndex: number, newIndex: number) => void
    Components: {
        index: number
        value?: UnArray<Value>
        Comp: React.ReactElement
    }[]
    value?: Value
}

export interface ArrayEditor<Value = any> extends BaseEditor<Value> {
    type: 'array'
    editor: Editor<UnArray<Value>>
    Wrapper: React.FC<ArrayEditorWrapperProps<Value>>
}

export type Editor<Value = any> =
    | CommonEditor<Value>
    | ObjectEditor<Value>
    | ArrayEditor<Value>

export function BuildEditor(
    editor: Editor,
    FormItemWrapper?: FormItemWrapper
): React.FC<{ initialData?: any; path: Path }> {
    return ({ initialData, path }) => {
        const node = useMemo(
            () =>
                DefaultResolver({
                    editor: editor,
                    data: new FormData(initialData),
                    resolver: DefaultResolver,
                }),
            [editor]
        )

        const Children = useMemo(() => node.build(FormItemWrapper), [node])

        return <Children path={path} />
    }
}
