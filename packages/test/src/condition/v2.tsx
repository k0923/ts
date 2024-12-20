import { Button, Form, Grid, Input, Select, Space } from '@arco-design/web-react'
import {
    BuildEditor,
    CommonEditor,
    DefaultFormContext,
    GroupWrapper,
    ItemWrapper,
    ObjectEditor,
    Path,
    SimpleCondition,
} from '@k0923/react'
import React, { useMemo, useRef } from 'react'
import { AcroFormContext, ArcoFormBody } from '../form/ArcoForm'
import './index.css'
import { ReactiveProps, ShowData } from '.'
function useCount() {
    const countRef = useRef(0)
    countRef.current += 1
    return countRef.current
}

const FormItem = Form.Item

Form.Item = props => {
    const { onChange, ...newProps } = props
    return <FormItem {...newProps} />
}

const itemEditor = new ObjectEditor<SimpleCondition<string, string, string>>({
    items: {
        data: new ObjectEditor<SimpleCondition['data']>({
            items: {
                x: new CommonEditor<string>({
                    Component: props => {
                        const count = useCount()
                        const { path, onChange } = props
                        return (
                            <Form.Item
                                field={path.path.join('.')}
                                noStyle={{ showErrorTip: true }}
                                rules={[{ required: true }]}
                            >
                                <Select value={path.value} placeholder={`${count}`} onChange={onChange}>
                                    <Select.Option value={'name'}>姓名</Select.Option>
                                    <Select.Option value={'age'}>年龄</Select.Option>
                                </Select>
                            </Form.Item>
                        )
                    },
                }),
                operator: new CommonEditor<string>({
                    Component: props => {
                        const count = useCount()
                        const { path, onChange } = props
                        return (
                            <Form.Item
                                field={path.path.join('.')}
                                noStyle={{ showErrorTip: true }}
                                rules={[{ required: true }]}
                            >
                                <Select value={path.value} placeholder={`${count}`} onChange={onChange}>
                                    <Select.Option value="=">等于</Select.Option>
                                    <Select.Option value="<>">不等于</Select.Option>
                                </Select>
                            </Form.Item>
                        )
                    },
                }),
                y: new CommonEditor<string>({
                    Component: props => {
                        const count = useCount()
                        const { path, onChange } = props
                        return (
                            <Form.Item
                                field={path.path.join('.')}
                                noStyle={{ showErrorTip: true }}
                                rules={[{ required: true }]}
                            >
                                <Input
                                    value={path.value}
                                    placeholder={`${count}`}
                                    onChange={v => {
                                        console.log(onChange)
                                        onChange(v)
                                    }}
                                />
                            </Form.Item>
                        )
                    },
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
                console.log(value, last)
                if (value && value.x && last && last.x) {
                    if (value.x !== last.x) {
                        // console.log('hit1')
                        return {
                            x: value.x,
                        }
                    }
                }
                if (value && value.operator && last && last.operator) {
                    if (value.operator !== last.operator) {
                        // console.log('hit2')
                        return {
                            x: value.x,
                            operator: value.operator,
                        }
                    }
                }
                // console.log('hit3', value)
                return value
            },
        }),
    },
})

const itemWrapper = (option: ItemWrapper) => {
    const { remove, index, Node, add, path } = option
    const value = path.value
    if (value && value.type === 'simple') {
        return (
            <Form.Item key={index} className="condition_item" wrapperCol={{ span: 24 }}>
                <Grid.Row gutter={4}>
                    <Grid.Col flex="auto">{Node}</Grid.Col>
                    <Grid.Col flex="24px">
                        <Space>
                            <Button onClick={remove}>删除</Button>
                            <Button
                                onClick={() => {
                                    add(
                                        {
                                            type: 'or',
                                            data: [{ type: 'simple', data: {} }],
                                        },
                                        index + 1
                                    )
                                }}
                            >
                                添加
                            </Button>
                        </Space>
                    </Grid.Col>
                </Grid.Row>
            </Form.Item>
        )
    } else {
        return (
            <div key={index} className="condition_item">
                {Node}
            </div>
        )
    }
}

const groupWrapper = (option: GroupWrapper) => {
    const divRef = useRef<HTMLDivElement>(null)
    const { add, level, remove, Node, path } = option
    const value = path.value
    if (!value || !value.data || value.data.length === 0) {
        return (
            <Button
                onClick={() => {
                    if (value) {
                        add({
                            type: 'simple',
                            data: {},
                        })
                    } else {
                        add({
                            type: 'or',
                            data: [
                                {
                                    type: 'simple',
                                    data: {},
                                },
                            ],
                        })
                    }
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
                    add({
                        type: 'simple',
                        data: {},
                    })
                }}
            >
                添加条件
            </Button>
            <Button
                type="primary"
                onClick={() => {
                    add({
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
                添加条件组
            </Button>
            {level > 0 && (
                <Button
                    status="danger"
                    onMouseEnter={() => {
                        divRef.current?.classList.add('hover')
                    }}
                    onMouseLeave={() => {
                        divRef.current?.classList.remove('hover')
                    }}
                    onClick={remove}
                >
                    删除条件组
                </Button>
            )}
        </Space>
    )

    let subContainerClass = ''

    if (level > 0) {
        subContainerClass = 'condition_sub_container'
    }

    if (value.data.length === 1) {
        return (
            <Form.Item noStyle field={path.path.join('.')}>
                <div ref={divRef} className={subContainerClass}>
                    <div className="condition_items_container single">{Node.data}</div>
                    <div>{btnGroups}</div>
                </div>
            </Form.Item>
        )
    }

    return (
        <Form.Item noStyle field={path.path.join('.')}>
            <div ref={divRef} className={subContainerClass}>
                <div className="condition_container">
                    <div className="condition_opt_container">{Node.type}</div>
                    <div className="condition_items_container">
                        <Form.Item noStyle>{Node.data}</Form.Item>
                    </div>
                </div>
                <div>{btnGroups}</div>
            </div>
        </Form.Item>
    )
}

const groupOptEditor = new CommonEditor<string>({
    Component: ({ path, onChange }) => {
        const value = path.value
        return (
            <span
                className="condition_opt"
                onClick={() => {
                    onChange(value === 'and' ? 'or' : 'and')
                }}
            >
                {value === 'or' ? '或' : '且'}
            </span>
        )
    },
})

export default function () {
    const [form] = Form.useForm()
    const ctx = useMemo(() => new AcroFormContext(form), [])
    const path = new Path(['a'], ctx)
    const Editor = useMemo(() => {
        const editor = BuildEditor({
            groupOptEditor: groupOptEditor,
            groupWrapper: groupWrapper,
            itemEditor: itemEditor,
            itemWrapper: itemWrapper,
        })
        return editor
    }, [])

    return (
        <>
            <Form
                scrollToFirstError
                form={form}
                onSubmit={v => {
                    console.log(form.getFieldsValue())
                    console.log(v)
                }}
                onValuesChange={(v, vs) => {
                    console.log(vs)
                }}
            >
                <ArcoFormBody path={path} editor={Editor} />
                <Button htmlType="submit">提交</Button>
            </Form>
            <ShowData ctx={ctx} />
        </>
    )
}
