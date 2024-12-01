import { useCallback, useEffect, useMemo } from "react"
import type { BaseEditor, BaseEditorProps, Editor, EditorProps } from "./editor"
import type { KeyOf } from "./model"


export interface ObjectWrapperProps<Value = any> extends BaseEditorProps {
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

// export function buildObjectEditor1<T extends EditorProps>(editor: ObjectEditor, fetcher: (editor?: Editor) => React.FC<T>): React.FC<T> {
//     const allComponents = Object.entries(editor.items).map(([key, value]) => {
//         const Editor = fetcher(value)
//         return {
//             key: key,
//             Editor: Editor,
//         }
//     })



//     const Children = (props: T) => {
//         const { value, onChange, node } = props
//         // const lastValue = useRef(value)

//         const changeHandler = (newValue?: any, key?: string) => {
//             const last = value
//             let result: any
//             if (key) {
//                 result = { ...value, [key]: newValue }
//             } else {
//                 result = { ...newValue }
//             }
//             result = editor.valueHandler?.(result, last, node) ?? result
//             onChange?.({ ...result })
//         }

//         const SubComp = useCallback((props: { id: string, Editor: React.FC<any>, value: any }) => {
//             const { id, Editor, value } = props
//             const subNode = node?.next(id)
//             return (
//                 <Editor value={value} node={subNode} onChange={(v: any) => changeHandler(v, id)} />
//             )
//         }, [node])

//         const cache = useMemo(() => new Map<string, { comp: React.ReactNode, data: any }>(), [])



//         // const buildComp = (item: { key: string; Editor: React.FC<T> }) => {
//         //     const subNode = node?.next(item.key)
//         //     return (
//         //         <item.Editor
//         //             {...props}
//         //             key={item.key}
//         //             value={value?.[item.key]}
//         //             node={subNode}
//         //             onChange={(v) => changeHandler(v, item.key)}
//         //         />
//         //     )
//         // }

//         // if (editor.Wrapper) {
//         //     const comps: { [key: string]: React.ReactElement } = {}

//         //     allComponents.forEach((item) => {
//         //         comps[item.key] = buildComp(item)
//         //     })

//         //     return (
//         //         <editor.Wrapper
//         //             value={value}
//         //             node={node}
//         //             Components={comps}
//         //             update={changeHandler}
//         //         />
//         //     )
//         // }
//         return (
//             <>
//                 {allComponents.map((item) => {
//                     let cacheData = cache.get(item.key)
//                     if (!cacheData || !Object.is(cacheData.data, value?.[item.key])) {
//                         cacheData = {
//                             comp: <SubComp key={item.key} id={item.key} Editor={item.Editor} value={value?.[item.key]} />,
//                             data: value?.[item.key]
//                         }
//                         cache.set(item.key, cacheData)
//                     }
//                     return cacheData.comp
//                 })}
//                 {/* {allComponents.map((item) => {
//                     let cacheData = cache.get(item.key)
//                     if(!cacheData || !Object.is(cacheData.data,value?.[item.key])) {
//                         cacheData = {
//                             comp:buildComp(item),
//                             data:value?.[item.key]
//                         }
//                         cache.set(item.key,cacheData)
//                     }
//                     return cacheData.comp

                    
//                     // return buildComp(item)
//                 })} */}
//             </>
//         )
//     }

//     return Children
// }


export function buildObjectEditor(editor: ObjectEditor, fetcher: (editor: Editor) => React.FC<EditorProps>): React.FC<EditorProps> {
    const allComponents = Object.entries(editor.items).map(([key, value]) => {
        const Editor = fetcher(value as Editor)
        return {
            key: key,
            Editor: Editor,
        }
    })
    
    

    return (props: EditorProps) => {
        const {node,ctx} = props
        return allComponents.map(({key,Editor})=>{
            return (
                <Editor  key={key} node={node.next(key)} ctx={ctx}/>
            )
        })
    }
}