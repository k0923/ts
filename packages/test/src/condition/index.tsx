import React from 'react'
import { Button, Form, Grid, Input, Select, Space } from '@arco-design/web-react'
import {
    ArrayEditor,
    CommonEditor,
    DefaultFormContext,
    FuncEditor,
    IFormContext,
    ObjectEditor,
    Path,
} from '@k0923/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import './index.css'

export interface ReactiveProps<T> {
    path: Path
    onChange: (value: T) => void
}

export enum Operator {
    equals = 'equals', // 相等
    notEquals = 'notEquals', // 不等于

    include = 'include', // 包含
    exclude = 'exclude', // 不包含

    belongs = 'belongs', // 属于
    notBelongs = 'notBelongs', // 不属于

    greaterThan = 'greaterThan', // 大于
    lessThan = 'lessThan', // 小于

    empty = 'empty', // 为空
    nonEmpty = 'nonEmpty', // 不为空
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

export interface ConditionOptions<X = any, Opt = any, Y = any> {
    xPicker: React.FC<ReactiveProps<X>>
    operator: React.FC<ReactiveProps<Opt>>
    yPicker: React.FC<ReactiveProps<Y>>
}

export class TreeNode<Data> {
    constructor(
        private _parent: TreeNode<Data> | null,
        private _data: Data
    ) {}

    get data() {
        return this._data
    }

    get parent() {
        return this._parent
    }

    addChild(data: Data) {
        return new TreeNode(this, data)
    }
}

function getEditor<X, Opt, Y>(options: ConditionOptions<X, Opt, Y>) {
    const SimpleConditionEditor = new ObjectEditor<SimpleCondition<X, Opt, Y>>({
        items: {
            data: new ObjectEditor<SimpleCondition['data']>({
                items: {
                    x: new CommonEditor<X>({
                        Component: options.xPicker,
                    }),
                    operator: new CommonEditor<Opt>({
                        Component: options.operator,
                    }),
                    y: new CommonEditor<Y>({
                        Component: options.yPicker,
                    }),
                },
                Wrapper: props => {
                    return (
                        <Grid.Row gutter={4}>
                            <Grid.Col span={8}>{props.Components.x}</Grid.Col>
                            <Grid.Col span={6}>{props.Components.operator}</Grid.Col>
                            <Grid.Col span={10}>{props.Components.y}</Grid.Col>
                        </Grid.Row>
                    )
                },
                valueHandler: (value, last) => {
                    if (value && value.x && last && last.x) {
                        if (value.x !== last.x) {
                            return {
                                x: value.x,
                            }
                        }
                    }
                    if (value && value.operator && last && last.operator) {
                        if (value.operator !== last.operator) {
                            return {
                                x: value.x,
                                operator: value.operator,
                            }
                        }
                    }
                    return value
                },
            }),
        },

        valueHandler: (value, last) => {
            if (!value.type) {
                return {
                    type: 'simple',
                    data: value.data,
                }
            }
            return value
        },
    })

    let GroupConditionEditor: ObjectEditor<GroupCondition<X, Opt, Y>> | null = null

    const filterEmptyCondition = (value: GroupCondition<X, Opt, Y>, last: GroupCondition<X, Opt, Y>) => {
        if (value) {
            if (value.type === 'and' || value.type === 'or') {
                if (
                    value.data.some(
                        it => !it || ((it.type === 'and' || it.type === 'or') && (!it.data || it.data.length === 0))
                    )
                ) {
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

                if (last && value.data.length !== last.data.length) {
                    if (value.data.length === 0 || value.data.length === 1) {
                        return {
                            type: value.type,
                            data: value.data,
                        }
                    }
                }
            }
        }
        return value
    }

    const fn = (path?: Path) => {
        if (path?.value?.type === 'simple') {
            return SimpleConditionEditor
        } else {
            if (GroupConditionEditor === null) {
                GroupConditionEditor = new ObjectEditor<GroupCondition<X, Opt, Y>>({
                    items: {
                        type: new CommonEditor<'and' | 'or'>({
                            Component: ({ path, onChange }) => {
                                const value = path.value
                                if (!value) {
                                    return null
                                }
                                return (
                                    <span
                                        className="condition_opt"
                                        onClick={() => onChange(value === 'and' ? 'or' : 'and')}
                                    >
                                        {value === 'or' ? '或' : '且'}
                                    </span>
                                )
                            },
                        }),
                        data: new ArrayEditor<Condition<X, Opt, Y>[]>({
                            editor: new FuncEditor<Condition<X, Opt, Y>>({
                                cacheSize: 10,
                                func: fn,
                                // valueHandler: (value, last) => {
                                //     console.log(JSON.stringify(value, null, 4), JSON.stringify(last, null, 4))
                                //     console.log(value === last)
                                //     return last
                                // },
                            }),
                            // valueHandler: (value, last) => {
                            //     console.log(JSON.stringify(value, null, 4), JSON.stringify(last, null, 4))
                            //     console.log(value === last)
                            //     return last
                            // },
                            Wrapper: props => {
                                const { Components, remove } = props

                                return (
                                    <>
                                        {Components.map((item, index) => {
                                            if (item.value?.type === 'simple') {
                                                return (
                                                    <Form.Item
                                                        key={index}
                                                        className="condition_item"
                                                        wrapperCol={{ span: 24 }}
                                                    >
                                                        <Grid.Row gutter={4}>
                                                            <Grid.Col flex="auto">{item.Comp}</Grid.Col>
                                                            <Grid.Col flex="24px">
                                                                <Space>
                                                                    <Button
                                                                        onClick={() => {
                                                                            remove(index)
                                                                        }}
                                                                    >
                                                                        删除
                                                                    </Button>
                                                                </Space>
                                                            </Grid.Col>
                                                        </Grid.Row>
                                                    </Form.Item>
                                                )
                                            } else {
                                                return (
                                                    <div key={index} className="condition_item">
                                                        {item.Comp}
                                                    </div>
                                                )
                                            }
                                        })}
                                    </>
                                )
                            },
                        }),
                    },
                    Wrapper: ({ Components, update, path }) => {
                        const divRef = useRef<HTMLDivElement>(null)
                        const p = path as any
                        const [lv] = useState(() => {
                            return p.level++
                        })
                        const value = path.value

                        if (!value || !value.data || value.data.length === 0) {
                            return (
                                <Button
                                    onClick={() => {
                                        update({
                                            type: 'or',
                                            data: [
                                                {
                                                    type: 'simple',
                                                    data: {},
                                                },
                                            ],
                                        })
                                    }}
                                >
                                    添加条件
                                </Button>
                            )
                        }

                        const btnGroups = (
                            <Space>
                                <Button
                                    onClick={() => {
                                        update({
                                            ...value,
                                            data: [
                                                ...value.data,
                                                {
                                                    type: 'simple',
                                                    data: {},
                                                },
                                            ],
                                        })
                                    }}
                                >
                                    添加条件
                                </Button>
                                <Button
                                    type="primary"
                                    onClick={() => {
                                        update({
                                            ...value,
                                            data: [
                                                ...value.data,
                                                {
                                                    type: 'or',
                                                    data: [
                                                        {
                                                            type: 'simple',
                                                            data: {},
                                                        },
                                                    ],
                                                },
                                            ],
                                        })
                                    }}
                                >
                                    添加条件组
                                </Button>
                                {lv > 0 && (
                                    <Button
                                        status="danger"
                                        onMouseEnter={() => {
                                            divRef.current?.classList.add('hover')
                                        }}
                                        onMouseLeave={() => {
                                            divRef.current?.classList.remove('hover')
                                        }}
                                        onClick={() => {
                                            update(undefined as any)
                                        }}
                                    >
                                        删除条件组
                                    </Button>
                                )}
                            </Space>
                        )

                        let subContainerClass = ''

                        if (lv > 0) {
                            subContainerClass = 'condition_sub_container'
                        }

                        if (value.data.length === 1) {
                            return (
                                <div ref={divRef} className={subContainerClass}>
                                    <div className="condition_items_container single">{Components.data}</div>
                                    <div>{btnGroups}</div>
                                </div>
                            )
                        }

                        return (
                            <div ref={divRef} className={subContainerClass}>
                                <div className="condition_container">
                                    <div className="condition_opt_container">{Components.type}</div>
                                    <div className="condition_items_container">{Components.data}</div>
                                </div>
                                <div>{btnGroups}</div>
                            </div>
                        )
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

function useCount() {
    const countRef = useRef(0)
    countRef.current += 1
    return countRef.current
}

export default function () {
    const ctx = useMemo(() => new DefaultFormContext(undefined), [])
    const Node = useMemo(() => {
        const path = new Path(['a'], ctx)
        const options: ConditionOptions<string, string, string> = {
            xPicker: props => {
                const count = useCount()
                return (
                    <Select {...props} placeholder={`${count}`}>
                        <Select.Option value={'name'}>姓名</Select.Option>
                        <Select.Option value={'age'}>年龄</Select.Option>
                    </Select>
                )
            },
            operator: props => {
                const count = useCount()
                return (
                    <Select {...props} placeholder={`${count}`}>
                        <Select.Option value={Operator.equals}>等于</Select.Option>
                        <Select.Option value={Operator.notEquals}>不等于</Select.Option>
                    </Select>
                )
            },
            yPicker: props => {
                const count = useCount()
                return <Input {...props} placeholder={`${count}`} />
            },
        }

        const editor = getEditor(options)
        const Node = editor?.build()
        if (Node) {
            return <Node path={path} />
        }
        return null
    }, [])

    return (
        <>
            <div style={{ padding: '10px' }}>
                <ErrorBoundary>{Node}</ErrorBoundary>
            </div>

            <ShowData ctx={ctx} />
        </>
    )
}

export function ShowData(props: { ctx: IFormContext }) {
    const [data, setData] = useState(props.ctx.getValue([]))
    useEffect(() => {
        props.ctx.registerHook((_path, _value, totalValue) => {
            setData({ ...totalValue })
        })
    }, [props.ctx])

    return <pre>{JSON.stringify(data, null, 2)}</pre>
}

export interface ErrorBoundaryProps {
    children: React.ReactNode
    fallback?: (err: any) => React.ReactNode
}

interface ErrorBoundaryState {
    err?: any
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = {}
    }

    componentDidCatch(error: any, errorInfo: any) {
        this.setState({ err: error })
    }

    render() {
        if (this.state.err) {
            console.error(this.state.err)
            if (this.props.fallback) {
                return this.props.fallback(this.state.err)
            }
            return <h1>Something went wrong.</h1>
        }

        return this.props.children
    }
}
