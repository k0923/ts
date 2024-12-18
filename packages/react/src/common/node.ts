export interface TreeNode<T extends TreeNode<T>> {
    children: T[]
}
