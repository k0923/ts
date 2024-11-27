import type { ArrayEditor } from "./array";
import type { CommonEditor } from "./common";
import type { Path, Validator } from "./model";
import type { ObjectEditor } from "./object";
import type { TreeNode } from "./tree";
import { buildArrayEditor } from "./array"
import { buildObjectEditor } from "./object"

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
    path: Path
    onChange?: (v?: Value) => void
}

export interface FormEditorConfig {
    editor?: Editor
    setFieldValue: (path: (number | string)[]) => void
}

interface FormEditorProps<Value = any, Parent = any> extends EditorProps<Value, Parent> {
    addvalidpath?: (path: Path) => void
    setfieldvalue?: (path: Path, value?: Value) => void
}



export interface FormItemProps {
    children: React.ReactNode
    path: (string | number)[]
    required?: boolean
    title?: React.ReactNode
    desc?: React.ReactNode
    editor?: Editor
}

export type FormItem = React.FC<FormItemProps>


export function buildCommonFormEditor(editor: Editor | undefined, FormItem: FormItem): React.FC<FormEditorProps> {
    const Children = getEditorChildren(editor, FormItem);

    return (props) => {
        if (!editor) return null;
        const { path, value, parent, setfieldvalue, addvalidpath, onChange } = props;
        const Title = resolveEditorNode(editor.Title, props);
        const Desc = resolveEditorNode(editor.Desc, props);

        const required = typeof editor.required === 'function'
            ? editor.required({ value, parent })
            : editor.required;

        const newOnChange = setfieldvalue
            ? (v: any) => setfieldvalue(path, v)
            : onChange;

        // 如果editor有valueHandler，则不调用setFieldValue
        const sfv = editor.valueHandler ? undefined : setfieldvalue;

        if (editor.validator) {
            addvalidpath?.(path);
        }

        return (
            <FormItem
                editor={editor}
                title={Title}
                desc={Desc}
                path={path}
                required={required}
            >
                <Children {...props} setfieldvalue={sfv} onChange={newOnChange} />
            </FormItem>
        );
    };
}


function getEditorChildren(editor: Editor | undefined, FormItem: FormItem): React.FC<FormEditorProps> {
    if (!editor) return () => null;
    switch (editor.type) {
        case 'array':
            return buildArrayEditor(editor, e => buildCommonFormEditor(e, FormItem));
        case 'object':
            return buildObjectEditor(editor, e => buildCommonFormEditor(e, FormItem));
        case 'common':
            return (props) => {
                const { addvalidpath, setfieldvalue, ...newProps } = props;
                return <editor.Component {...newProps} />;
            };
        default:
            return () => null;
    }
}

function resolveEditorNode<T>(
    node: EditorNode<T, any> | undefined,
    props: FormEditorProps
): React.ReactNode {
    return typeof node === 'function' ? node(props) : node;
}

