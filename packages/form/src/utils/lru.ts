export class LRUCache<K, V> {
    private cache: Map<K, V> = new Map()

    constructor(private max: number = 1000) {
        if (max <= 0) throw new Error('Cache size must be greater than 0')
    }

    /**
     * 获取缓存项，同时将该项移动到最近使用
     */
    get(key: K): V | undefined {
        const value = this.cache.get(key)
        if (value) {
            // 删除后重新插入，使其成为最近使用的项
            this.cache.delete(key)
            this.cache.set(key, value)
        }
        return value
    }

    /**
     * 设置缓存项
     */
    set(key: K, value: V): void {
        // 如果键已存在，先删除
        if (this.cache.has(key)) {
            this.cache.delete(key)
        }
        // 如果缓存已满，删除最久未使用的项（第一个）
        else if (this.cache.size >= this.max) {
            const firstKey = this.cache.keys().next().value
            this.cache.delete(firstKey)
        }
        // 添加新项到末尾（最近使用）
        this.cache.set(key, value)
    }

    /**
     * 删除缓存项
     */
    delete(key: K): boolean {
        return this.cache.delete(key)
    }

    /**
     * 清空缓存
     */
    clear(): void {
        this.cache.clear()
    }

    /**
     * 获取缓存大小
     */
    size(): number {
        return this.cache.size
    }

    /**
     * 检查键是否存在
     */
    has(key: K): boolean {
        return this.cache.has(key)
    }

    /**
     * 获取所有缓存的键
     */
    keys(): K[] {
        return Array.from(this.cache.keys())
    }

    /**
     * 获取所有缓存的值
     */
    values(): V[] {
        return Array.from(this.cache.values())
    }

    /**
     * 获取缓存的最大容量
     */
    getMaxSize(): number {
        return this.max
    }
}
