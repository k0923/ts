import type { ArrayEditor } from "./array";
import { type CommonEditor } from "./common";
import { DefaultFormContextV2 } from "./context";
import type { Validator } from "./model";
import type { ObjectEditor } from "./object";
import { buildObjectEditor } from "./object";

export type Editor<Value = any> = CommonEditor<Value> | ObjectEditor<Value> | ArrayEditor<Value>

export type EditorNode<Value = any> = React.ReactNode | ((props: Omit<EditorProps<Value>, 'onChange'>) => React.ReactNode)

export type RequiredFn<Value = any> = ((props: BaseEditorProps) => boolean) | boolean

export interface BaseEditor<Value = any> {
    Title?: EditorNode<Value>
    Desc?: EditorNode<Value>
    required?: RequiredFn<Value> | boolean
    validator?: Validator<Value>
    valueHandler?: (currentValue: Value, lastValue: Value, node?: Node) => Value | undefined
}

export interface EditorProps<Value = any> extends BaseEditorProps {
    ctx: DefaultFormContextV2
}

export interface FormEditorConfig {
    editor?: Editor
    setFieldValue: (path: (number | string)[]) => void
}

export interface FormItemProps {
    children: React.ReactNode
    editor?: Editor
    node?: Node
}

export type FormItem = React.FC<FormItemProps>




export function buildFormEditor(editor: Editor, FormItem: FormItem): React.FC<{ ctx: DefaultFormContextV2 }> {
    const Editor = buildEditor(editor, FormItem);

    return (props) => {
        const { ctx } = props
        return <Editor ctx={ctx} node={ctx.Root} />
    }
}

function buildEditor(editor: Editor, FormItem: FormItem): React.FC<EditorProps> {
    const Children = getEditorChildren(editor, FormItem);

    return (props) => {
        const { node, ctx } = props
        useFormValue(ctx, node, editor)
        return <FormItem node={node} editor={editor}>
            <Children {...props} />
        </FormItem>
    }
}


function getEditorChildren(editor: Editor, FormItem: FormItem): React.FC<EditorProps> {
    if (!editor) return () => null;
    switch (editor.type) {
        // case 'array':
        //     return buildArrayEditor(editor, e => buildCommonFormEditor(e, FormItem));
        case 'object':
            return buildObjectEditor(editor, e => buildEditor(e, FormItem));
        case 'common':
            return buildCommonEditor(editor)
        default:
            return () => null;
    }
}