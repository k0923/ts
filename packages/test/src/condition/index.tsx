import { Button, Form, Grid, Input, Select, Space } from '@arco-design/web-react'
import {
    ArrayEditor,
    CommonEditor,
    DefaultFormContext,
    FuncEditor,
    ObjectEditor,
    Path,
} from '@k0923/react'
import { useEffect, useMemo, useState } from 'react'
import './index.css'

export interface ReactiveProps<T> {
    value: T
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

export type Condition<X = any, Opt = any, Y = any> =
    | GroupCondition<X, Opt, Y>
    | SimpleCondition<X, Opt, Y>

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

    const filterEmptyCondition = (value: GroupCondition<X, Opt, Y>) => {
        if (value) {
            if (value.type === 'and' || value.type === 'or') {
                if (
                    value.data.some(
                        it =>
                            !it ||
                            ((it.type === 'and' || it.type === 'or') &&
                                (!it.data || it.data.length === 0))
                    )
                ) {
                    return {
                        type: value.type,
                        data: value.data.filter(it => {
                            if(!it) {
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

    const fn = (value: Condition) => {
        if (value?.type === 'simple') {
            return SimpleConditionEditor
        } else {
            if (GroupConditionEditor === null) {
                GroupConditionEditor = new ObjectEditor<GroupCondition<X, Opt, Y>>({
                    items: {
                        type: new CommonEditor<typeof value.type>({
                            Component: ({ value, onChange }) => {
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
                            }),
                            Wrapper: props => {
                                const { add, Components, remove } = props

                                return (
                                    <>
                                        {Components.map((item, index) => {
                                            if (item.value?.type === 'simple') {
                                                return (
                                                    <Form.Item
                                                        className="condition_item"
                                                        wrapperCol={{ span: 24 }}
                                                    >
                                                        <Grid.Row>
                                                            <Grid.Col span={20}>
                                                                {item.Comp}
                                                            </Grid.Col>
                                                            <Grid.Col span={4}>
                                                                <Space>
                                                                    {/* <Button
                                                                        onClick={() => {
                                                                            add(
                                                                                {
                                                                                    type: 'simple',
                                                                                    data: {},
                                                                                },
                                                                                index + 1
                                                                            )
                                                                        }}
                                                                    >
                                                                        添加
                                                                    </Button> */}
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
                                                    <div className="condition_item">
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
                    Wrapper: ({ value, Components, update }) => {
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
                                        console.log('hit')
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
                                <Button
                                    onClick={() => {
                                        update(undefined as any)
                                    }}
                                >
                                    删除条件组
                                </Button>
                            </Space>
                        )

                        if (value.data.length === 1) {
                            return (
                                <div>
                                    <div style={{ padding: '10px' }}>{Components.data}</div>
                                    <div>{btnGroups}</div>
                                </div>
                            )
                        }

                        return (
                            <div>
                                <div className="condition_container">
                                    <div className="condition_opt_container">{Components.type}</div>
                                    <div className="condition_items_container">
                                        {Components.data}
                                    </div>
                                </div>
                                <div>{btnGroups}</div>
                            </div>
                        )
                    },
                    valueHandler: (value, last) => {
                        return filterEmptyCondition(value)
                    },
                })
            }
            return GroupConditionEditor
        }
    }

    return new FuncEditor<Condition<X, Opt, Y>>({
        cacheSize: 10,
        func: fn,
    })
}

export default function () {
    const ctx = useMemo(() => new DefaultFormContext(undefined), [])
    const Node = useMemo(() => {
        const path = new Path([], ctx)
        const options: ConditionOptions<string, string, string> = {
            xPicker: props => {
                return (
                    <Select {...props}>
                        <Select.Option value={'name'}>姓名</Select.Option>
                        <Select.Option value={'age'}>年龄</Select.Option>
                    </Select>
                )
            },
            operator: props => {
                return (
                    <Select {...props}>
                        <Select.Option value={Operator.equals}>等于</Select.Option>
                        <Select.Option value={Operator.notEquals}>不等于</Select.Option>
                    </Select>
                )
            },
            yPicker: props => {
                return <Input {...props} />
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
            {Node}
            <ShowData ctx={ctx} />
        </>
    )
}

function ShowData(props: { ctx: DefaultFormContext }) {
    const [data, setData] = useState(props.ctx.getValue([]))
    useEffect(() => {
        props.ctx.registerHook((_path, _value, totalValue) => {
            setData({ ...totalValue })
        })
    }, [props.ctx])

    return <pre>{JSON.stringify(data, null, 2)}</pre>
}
