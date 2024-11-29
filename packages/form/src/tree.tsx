import { get } from 'lodash'
import type { Path } from './model'
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




export class Parent {
    constructor(private _root: any, private _path: Path) { }

    get data() {
        return get(this._root, this._path.join('.'))
    }

    get parent(): Parent | null {
        if (this._path.length === 0) {
            return null
        }
        return new Parent(this._root, this._path.slice(0, -1))
    }

    next(path: Path): Parent {
        return new Parent(this._root, path)
    }
}



