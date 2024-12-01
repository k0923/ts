import type { EditorNode, EditorProps } from "./editor";

export function resolveEditorNode<T>(
    node: EditorNode<T> | undefined,
    props: T
): React.ReactNode {
    return typeof node === 'function' ? node(props as any) : node;
}

function set(obj: any, path: (string | number)[] | null | undefined, value: any): any {
    // 如果路径为 null、undefined 或空数组，直接返回 value
    if (!path || path.length === 0) {
        return value
    }

    // 如果对象为 null 或 undefined，或者类型与路径不匹配，根据第一个路径类型创建新的容器
    if (obj == null ||
        (typeof path[0] === 'number' && !Array.isArray(obj)) ||
        (typeof path[0] === 'string' && Array.isArray(obj))) {
        obj = typeof path[0] === 'number' ? [] : {}
    }

    let o = obj
    path.forEach((v, i) => {
        if (i === path.length - 1) {
            o[v] = value
        } else {
            const nextKey = path[i + 1]
            // 处理当前位置为 null 或 undefined 的情况
            if (o[v] == null) {
                o[v] = typeof nextKey === 'number' ? [] : {}
            } else if (Array.isArray(o[v]) !== (typeof nextKey === 'number')) {
                o[v] = typeof nextKey === 'number' ? [] : {}
            }
            o = o[v]
        }
    })
    return obj
}