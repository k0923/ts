import { ArrayEditorNode } from './array'
import { ObjectEditorNode } from './object'
import { CommonEditorNode } from './common'
import type { NodeConfig } from './base'

export function DefaultResolver(config: NodeConfig) {
    if (config.editor.type === 'object') {
        return new ObjectEditorNode(config)
    }
    if (config.editor.type === 'array') {
        return new ArrayEditorNode(config)
    }
    return new CommonEditorNode(config)
}
