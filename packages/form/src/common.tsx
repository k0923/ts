import { useCallback } from 'react'
import type { FormItemWrapper, NodeConfig } from './base'
import { BaseEditorNode, type FormNode } from './base'
import type { CommonEditor } from './editor'

export class CommonEditorNode extends BaseEditorNode {
    constructor(config: NodeConfig) {
        super(config)
    }

    build(FormItem?: FormItemWrapper): FormNode {
        const editor = this.editor as CommonEditor
        return ({ path }) => {
            const handler = useCallback(
                (v: any) => this.setValue(path, v),
                [path.flat().join('.')]
            )
            const value = this.useNode(path)

            if (!FormItem) {
                return <editor.Component value={value} onChange={handler} />
            }

            return (
                <FormItem editor={this.editor} path={path} node={this}>
                    <editor.Component value={value} onChange={handler} />
                </FormItem>
            )
        }
    }
}
