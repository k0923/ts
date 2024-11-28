import type { EditorNode, EditorProps } from "./editor";

export function resolveEditorNode<T>(
    node: EditorNode<T, any> | undefined,
    props: EditorProps
): React.ReactNode {
    return typeof node === 'function' ? node(props) : node;
}