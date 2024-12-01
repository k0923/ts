import { get } from 'lodash'
import type { Path } from './model'
import type { Editor } from './editor'
export type Key = string | number

export class TreeNode<T> {
    private children: Set<TreeNode<T>>

    constructor(public readonly data: T, public readonly parent?: TreeNode<T>) {
        this.children = new Set()
    }

    addChild(data: T): TreeNode<T> {
        const node = new TreeNode(data, this)
        this.children.add(node)
        return node
    }

    removeChild(key: Key) {
        this.children.delete(key)
    }
}


export interface NodeConfig<T=any> {
    caches:Map<string,Node<T>>
    data:T
}


export class Node<T=any> {
    private getPathKey(path: Path): string {
        return path.join('.')
    }
    
    constructor(private config:NodeConfig<T>,private path:Path){}

    get Path():Path {
        return [...this.path]
    }
    
    get data() {
        return get(this.config.data, this.getPathKey(this.path))
    }

    get parent():Node<T> | null {
        if (this.path.length === 0) {
            return null
        }
        const parentPath = this.path.slice(0, -1)
        let parentNode = this.config.caches.get(parentPath.join('.'))
        if(!parentNode) {
            parentNode = new Node(this.config,parentPath)
            this.config.caches.set(parentPath.join('.'),parentNode)
        } 
        return parentNode
    }

    next(...segment: Path): Node<T> {
        const newPath = [...this.path, ...segment]
        const pathKey = this.getPathKey(newPath)
        
        let node = this.config.caches.get(pathKey)
        if (!node) {
            node = new Node(this.config, newPath)
            this.config.caches.set(pathKey, node)
        }
        return node
    }

}

export class EditorNode extends TreeNode<{editor:Editor}> { 

    constructor(editor:Editor,parent?:EditorNode) {
        super({editor},parent)
    }

}

function test() {
   
}