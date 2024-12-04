import type { BaseEditor } from "./editor"



// export function FormNode(props: EditorProps) {
//     const { ctx } = props
//     useEffect(() => {
//         console.log("mount form node", props.editor.type)
//         return () => {
//             console.log("clean form node", props.editor.type, {
//                 ctx: !!ctx,
//                 props: props
//             })
//         }
//     }, [])

//     const Node = useMemo(() => {
//         console.log("memo recalculate", !!ctx)
//         if (ctx) {
//             return <ReactiveNode {...props} />
//         }
//         return <StaticNode {...props} />
//     }, [ctx])

//     return Node


// }

// export function buildCommonEditor<T extends EditorProps>(editor: CommonEditor): React.FC<T> {
//     return (props: T) => {
//         const { node, ctx, ...otherProps } = props
//         const handler = useCallback((v: any) => {
//             ctx.setFieldValue(node, v)
//         }, [ctx, node])
//         return <editor.Component {...otherProps} value={node.data} onChange={handler} />
//     }
// }




export interface CommonEditor<Value = any> extends BaseEditor<Value> {
    type: 'common'
    Component: React.FC<{ value: Value, onChange: (v: Value) => void }>
}

// export function useFormValue(ctx: DefaultFormContextV2, node: Node, editor: Editor): any {
//     const [value, setValue] = useState(node.data)
//     useEffect(() => {
//         const handler = (v: any) => {
//             let value = v
//             if (Array.isArray(value)) {
//                 value = [...value]
//             } else if (typeof value === 'object') {
//                 value = { ...value }
//             }
//             setValue(value)
//         }
//         ctx.registerEditor(node, editor)
//         ctx.registerHook(node, handler)
//         return () => {
//             ctx.unRegisterEditor(node)
//             ctx.unRegisterHook(node,handler)
//         }
//     }, [node, ctx])
//     return value
// }

