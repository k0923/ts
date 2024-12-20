import { useRef } from 'react'
import { ArrayEditor, BaseEditor, FuncEditor, ObjectEditor, Path } from '../editor'

const next = Path.prototype.next
Path.prototype.next = function (s, fn) {
    const t = this as any
    if (!t.level) {
        t.level = 0
    }
    const result = next.call(this, s, fn)
    const t1 = result as any
    t1.level = t.level

    return result
}
export type Condition<X = any, Opt = any, Y = any> = GroupCondition<X, Opt, Y> | SimpleCondition<X, Opt, Y>

export interface GroupCondition<X, Opt, Y> {
    type: 'and' | 'or'
    data: Condition<X, Opt, Y>[]
}

export interface SimpleCondition<X = any, Opt = any, Y = any> {
    type: 'simple'
    data: {
        x?: X
        operator?: Opt
        y?: Y
    }
}

export interface ItemWrapper<X = any, Opt = any, Y = any> {
    Node: React.ReactElement
    path: Path<Condition<X, Opt, Y>>
    add: (condition: Condition<X, Opt, Y>, index?: number) => void
    remove: () => void
    index: number
}

export interface GroupWrapper<X = any, Opt = any, Y = any> {
    Node: {
        type?: React.ReactElement
        data?: React.ReactElement
    }
    add: (condition: Condition<X, Opt, Y>, index?: number) => void
    remove: () => void
    path: Path<GroupCondition<X, Opt, Y>>
    level: number
}

export interface ConditionOptions<X = any, Opt = any, Y = any> {
    itemEditor: BaseEditor<SimpleCondition<X, Opt, Y>>
    itemWrapper: (option: ItemWrapper<X, Opt, Y>) => React.ReactElement
    groupWrapper: (option: GroupWrapper<X, Opt, Y>) => React.ReactElement
    groupOptEditor: BaseEditor<'and' | 'or'>
}

export function BuildEditor<X = any, Opt = any, Y = any>(
    options: ConditionOptions<X, Opt, Y>
): BaseEditor<Condition<X, Opt, Y>> {
    let GroupConditionEditor: ObjectEditor<GroupCondition<X, Opt, Y>> | null = null

    const filterEmptyCondition = (value: GroupCondition<X, Opt, Y>, last: GroupCondition<X, Opt, Y>) => {
        if (value) {
            if (value.type === 'and' || value.type === 'or') {
                if (last && value.data.length !== last.data.length) {
                    return {
                        type: value.type,
                        data: value.data.filter(it => {
                            if (!it) {
                                return false
                            }
                            if (it.type === 'simple') {
                                return true
                            }
                            return it.data && it.data.length > 0
                        }),
                    }
                }
                if (value.data.some(it => !it || (it.type !== 'simple' && (!it.data || it.data.length === 0)))) {
                    return {
                        type: value.type,
                        data: value.data.filter(it => {
                            if (!it) {
                                return false
                            }
                            if (it.type === 'simple') {
                                return true
                            }
                            return it.data && it.data.length > 0
                        }),
                    }
                }
            }
        }
        return value
    }

    const fn = (path?: Path) => {
        if (path?.value?.type === 'simple') {
            return options.itemEditor
        } else {
            if (GroupConditionEditor === null) {
                GroupConditionEditor = new ObjectEditor<GroupCondition<X, Opt, Y>>({
                    items: {
                        type: options.groupOptEditor,
                        data: new ArrayEditor<Condition<X, Opt, Y>[]>({
                            editor: new FuncEditor<Condition<X, Opt, Y>>({
                                cacheSize: 10,
                                func: fn,
                            }),
                            Wrapper: props => {
                                const { Components, remove, add, path } = props

                                return (
                                    <>
                                        {Components.map((item, index) => {
                                            const Child = options.itemWrapper({
                                                Node: item.Comp,
                                                add: add,
                                                index: index,
                                                path: item.path,
                                                remove: () => {
                                                    remove(index)
                                                },
                                            })

                                            return Child
                                        })}
                                    </>
                                )
                            },
                        }),
                    },
                    Wrapper: ({ Components, update, path }) => {
                        const p = path as any
                        const level = useRef(p.level++)
                        return options.groupWrapper({
                            Node: {
                                type: Components.type,
                                data: Components.data,
                            },
                            path: path,
                            level: level.current ?? 0,
                            add: (condition: Condition) => {
                                const value = path.value
                                if (!value) {
                                    if (condition.type === 'simple') {
                                        console.error('value is undefined')
                                    } else {
                                        update(condition)
                                    }
                                    return
                                }
                                update({
                                    ...value,
                                    data: [...value?.data, condition],
                                })
                            },
                            remove: () => update(undefined as any),
                        })
                    },
                    valueHandler: (value, last) => {
                        return filterEmptyCondition(value, last)
                    },
                })
            }
            return GroupConditionEditor
        }
    }

    return fn(null as any)
}
