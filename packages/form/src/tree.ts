export class TreeNode<T, Parent = any> {
    private children: TreeNode<any>[]

    parent?: TreeNode<Parent, any>

    constructor(public data?: T) {
        this.children = []
    }

    addChild<Child>(data?: Child) {
        const node = new TreeNode<Child, T>(data)
        this.children.push(node)
        node.parent = this
        return node
    }

    removeChild(node: TreeNode<any>) {
        this.children = this.children.filter((item) => item !== node)
    }
}

