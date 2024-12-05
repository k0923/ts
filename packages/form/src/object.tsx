import type { FormItemWrapper, NodeConfig } from './base'
import type { ObjectEditor } from './editor'
import { BaseEditorNode, type FormNode } from './base'

export class ObjectEditorNode extends BaseEditorNode {
    private children: Map<string, BaseEditorNode> = new Map()

    constructor(config: NodeConfig) {
        super(config)
        const editor = this.editor as ObjectEditor
        Object.entries(editor.items).forEach(([key, editor]) => {
            if (editor && key) {
                const node = this.resolver({
                    parent: this,
                    resolver: this.resolver,
                    data: this.data,
                    editor: editor,
                    buildParentValue: (v, p) => {
                        const target = { ...p, [key]: v }
                        return target
                    },
                })
                this.children.set(key, node)
            }
        })
    }

    build(FormItem?: FormItemWrapper): FormNode {
        const items = Array.from(this.children).map(([k, n]) => {
            return {
                key: k,
                Item: n.build(FormItem),
            }
        })

        const editor = this.editor as ObjectEditor

        return ({ path }) => {
            this.useNode(path)

            const Components = items.reduce<{ [key: string]: React.ReactElement }>((p, c) => {
                p[c.key] = <c.Item key={c.key} path={[...path, c.key]} />
                return p
            }, {})

            const Node = () => {
                if (editor.Wrapper) {
                    return <editor.Wrapper Components={Components} update={() => {}} />
                }

                return Object.values(Components).map(c => c)
            }

            if (FormItem) {
                return (
                    <FormItem editor={this.editor} path={path} node={this}>
                        {Node()}
                    </FormItem>
                )
            }

            return Node()
        }
    }
}
