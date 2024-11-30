import { useEffect, useMemo, useState } from "react";
import type { ArrayEditor } from "./array";
import { buildArrayEditor } from "./array";
import type { CommonEditor } from "./common";
import { type IFormContext } from "./context";
import type { Path, Validator } from "./model";
import type { ObjectEditor } from "./object";
import { buildObjectEditor } from "./object";
import { Node } from "./tree";

export type Editor<Value = any> = CommonEditor<Value> | ArrayEditor<Value> | ObjectEditor<Value>

export type EditorNode<Value = any> = React.ReactNode | ((props: Omit<EditorProps<Value>, 'onChange'>) => React.ReactNode)

export type RequiredFn<Value = any> = ((props: BaseEditorProps<Value>) => boolean) | boolean

export interface BaseEditor<Value = any> {
    Title?: EditorNode<Value>
    Desc?: EditorNode<Value>
    required?: RequiredFn<Value> | boolean
    validator?: Validator<Value>
    valueHandler?: (currentValue: Value, lastValue: Value, node?: Node) => Value | undefined
}

export interface BaseEditorProps<Value = any> {
    value?: Value
    node?: Node
}

export interface EditorProps<Value = any> extends BaseEditorProps<Value> {
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
    node?: Node
}

export type FormItem = React.FC<FormItemProps>


export function buildFormEditor(editor: Editor, FormItem: FormItem): React.FC<{ ctx: IFormContext, path?: Path }> {
    const Children = buildCommonFormEditor(editor, FormItem)


    return props => {
        const { ctx, path } = props
        const [value, setValue] = useState<any>()
        const newPath = path ?? []
        const config = useMemo(() => ({ caches: new Map<string, Node>(), data: ctx.getFieldValue(newPath) }), [newPath.join('.')])
        const node = useMemo(() => {
            return new Node(config, newPath)
        }, [config, newPath.join('.')])

        console.log(config.caches.size)


        useEffect(() => {
            ctx.registerHook({
                type: 'data',
                data: v => {
                    let value = ctx.getFieldValue(newPath)
                    if (Array.isArray(value)) {
                        value = [...value]
                    } else if (typeof value === 'object') {
                        value = { ...value }
                    }
                    config.data = ctx.getFieldValue([])
                    setValue(value)
                }
            })

            return () => {
                ctx.unRegisterHook({ type: 'data', data: setValue })
            }
        }, [...newPath])

        return <Children value={value} ctx={ctx} path={newPath} node={node} onChange={v => {
            
            ctx.setFieldValue(newPath, v)
        }} />


    }
}


export function buildCommonFormEditor(editor: Editor | undefined, FormItem: FormItem): React.FC<EditorProps> {
    const Children = getEditorChildren(editor, FormItem);

    return (props) => {
        const { onChange, path, value, ctx,node } = props
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
            <FormItem value={value} path={path} node={node} editor={editor}>
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