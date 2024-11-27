import { get } from 'lodash'
import type { BaseEditor, Editor } from './editor'
export type Key = string | number

export class TreeNode<T> {
    private children: Map<Key, TreeNode<T>>

    constructor(public readonly data: T, public readonly parent?: TreeNode<T>) {
        this.children = new Map()
    }

    addChild(key: Key, data: T): TreeNode<T> {
        const node = new TreeNode(data, this)
        this.children.set(key, node)
        return node
    }

    removeChild(key: Key) {
        this.children.delete(key)
    }
}

export interface FormNode extends BaseEditor {
   
}

export interface FormContext {

}

// function buildEditor(editor: Editor) {
// }






// export interface Test {
//     onChange: (v: any) => void
// }

// export class FormTreeNode<T extends Test> extends TreeNode<T> {
//     constructor(data: T, parent?: TreeNode<T>) {
//         super(data, parent)
//         this.data.onChange =
//     }
// }


