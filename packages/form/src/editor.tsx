import type { ArrayEditor } from "./array";
import type { CommonEditor } from "./common";
import type { Path, Validator } from "./model";
import type { ObjectEditor } from "./object";
import type { TreeNode } from "./tree";
import { buildArrayEditor } from "./array"
import { buildObjectEditor } from "./object"
import { resolveEditorNode } from "./utils";
import { useContext, useEffect, useState } from "react";
import { FormContext, type IFormContext } from "./context";
// import { useFormData } from "./context";

export type Editor<Value = any, Parent = any> = CommonEditor<Value, Parent> | ArrayEditor<Value, Parent> | ObjectEditor<Value, Parent>

export type EditorNode<Value = any, Parent = any> = React.ReactNode | ((props: Omit<EditorProps<Value, Parent>, 'onChange'>) => React.ReactNode)

export type RequiredFn<Value = any, Parent = any> = ((props: BaseEditorProps<Value, Parent>) => boolean) | boolean

export interface BaseEditor<Value = any, Parent = any> {
    Title?: EditorNode<Value, Parent>
    Desc?: EditorNode<Value, Parent>
    required?: RequiredFn<Value, Parent> | boolean
    validator?: Validator<Value>
    valueHandler?: (currentValue: Value, lastValue: Value, parent?: TreeNode<Parent>) => Value | undefined
}

export interface BaseEditorProps<Value = any, Parent = any> {
    value?: Value
    parent?: TreeNode<Parent>
}

export interface EditorProps<Value = any, Parent = any> extends BaseEditorProps<Value, Parent> {
    ctx: IFormContext
    path: Path
    onChange?: (v?: Value) => void
}

export interface FormEditorConfig {
    editor?: Editor
    setFieldValue: (path: (number | string)[]) => void
}

// export interface FormEditorProps<Value = any, Parent = any> extends EditorProps<Value, Parent> {
//     addvalidpath?: (path: Path) => void
//     setfieldvalue?: (path: Path, value?: Value) => void
// }



export interface FormItemProps {
    children: React.ReactNode
    path: (string | number)[]
    editor?: Editor
    value: any
}

export type FormItem = React.FC<FormItemProps>


export function buildFormEditor(editor: Editor, FormItem: FormItem): React.FC<{ ctx: IFormContext, path: Path }> {
    const Children = buildCommonFormEditor(editor, FormItem)


    return props => {
        const { ctx, path } = props
        const [value, setValue] = useState<any>()
        useEffect(() => {
            const strPath = path.join('.')
            if (strPath) {
                ctx.registerHook({
                    type: 'field',
                    data: {
                        path,
                        handler: setValue
                    }
                })
            } else {
                ctx.registerHook({
                    type: 'data',
                    data: setValue
                })
            }
        }, [])

        return <Children value={value} ctx={ctx} path={path} />


    }
}


export function buildCommonFormEditor(editor: Editor | undefined, FormItem: FormItem): React.FC<EditorProps> {
    const Children = getEditorChildren(editor, FormItem);

    return (props) => {
        const { onChange, path, value, ctx } = props
        if (!editor) {
            return null
        }
        let newOnChange = onChange
        if (editor.valueHandler) {
            newOnChange = (v: any) => {
                ctx.setFieldValue(path, v)
            }
        }

        return (
            <FormItem value={value} path={path} editor={editor}>
                <Children {...props} onChange={newOnChange} />
            </FormItem>
        )
    }
}


function getEditorChildren(editor: Editor | undefined, FormItem: FormItem): React.FC<EditorProps> {
    if (!editor) return () => null;
    switch (editor.type) {
        case 'array':
            return buildArrayEditor(editor, e => buildCommonFormEditor(e, FormItem));
        case 'object':
            return buildObjectEditor(editor, e => buildCommonFormEditor(e, FormItem));
        case 'common':
            return (props) => {
                const { ...newProps } = props;
                return <editor.Component {...newProps} />;
            };
        default:
            return () => null;
    }
}

