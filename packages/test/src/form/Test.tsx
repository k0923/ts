import {
    Button,
    Form,
    Grid,
    Input,
    InputNumber,
    Radio,
} from '@arco-design/web-react'
import { BuildEditor, Editor } from '@k0923/form'

import { useEffect, useState } from 'react'

export interface Company {
    name: string
    address: string
    Employees: User[]
}

export interface User {
    name: string
    age: number
    gender: 'male' | 'female'
    Hobbies: string[]
}

export const userEditor: Editor<User> = {
    type: 'object',
    Wrapper: props => {
        const { Components } = props
        return (
            <>
                <Form.Item label="姓名">{Components.name}</Form.Item>
                <Form.Item label="年龄">{Components.age}</Form.Item>
                <Form.Item label="性别">{Components.gender}</Form.Item>
                {Components.Hobbies}
            </>
        )
    },
    items: {
        name: {
            type: 'common',
            Component: props => {
                return <Input {...props} />
            },
        },
        age: {
            type: 'common',
            Component: props => <InputNumber {...props} />,
        },
        gender: {
            type: 'common',
            Component: props => {
                return (
                    <Radio.Group value={props.value} onChange={props.onChange}>
                        <Radio value="male">男性</Radio>
                        <Radio value="female">女性</Radio>
                    </Radio.Group>
                )
            },
        },
        Hobbies: {
            type: 'array',
            editor: {
                type: 'common',

                Component: props => {
                    return <Input {...props} />
                },
            },
            Wrapper: props => {
                const { add, Components, remove, move, value } = props
                if (!value || value.length === 0) {
                    return (
                        <Form.Item label=" ">
                            <Button onClick={() => add(undefined, 0)}>
                                添加爱好
                            </Button>
                        </Form.Item>
                    )
                }
                return (
                    <>
                        {Components.map((item, index) => {
                            return (
                                <Form.Item key={index} label={`爱好${index}`}>
                                    <Grid.Row>
                                        <Grid.Col span={10}>
                                            {item.Comp}
                                        </Grid.Col>
                                        <Grid.Col span={10}>
                                            <Button
                                                onClick={() => {
                                                    add(undefined, index + 1)
                                                }}
                                            >
                                                添加
                                            </Button>

                                            <Button
                                                onClick={() => {
                                                    remove(index)
                                                }}
                                            >
                                                删除
                                            </Button>
                                        </Grid.Col>
                                    </Grid.Row>
                                </Form.Item>
                            )
                        })}
                    </>
                )
            },
        },
    },
}

export const companyEditor: Editor<Company> = {
    type: 'object',
    Wrapper: props => {
        return (
            <>
                <Form.Item label="公司">{props.Components.name}</Form.Item>
                <Form.Item label="地址">{props.Components.address}</Form.Item>
                {props.Components.Employees}
            </>
        )
    },
    items: {
        name: {
            valueHandler: (c, l) => {
                if (c === 'abc') {
                    return 'bcd'
                }
                return c
            },

            type: 'common',
            Component: props => {
                return <Input {...props} />
            },
        },
        address: {
            type: 'common',
            Component: props => {
                return <Input {...props} />
            },
            validator: v => {
                if (v && v.length > 5) {
                    return '长度不能大于5'
                }
                return undefined
            },
        },
        Employees: {
            type: 'array',
            editor: userEditor,
            Wrapper: ({ value, add, remove, Components }) => {
                if (!value || value.length == 0) {
                    return (
                        <Form.Item label=" ">
                            <Button onClick={() => add(undefined, 0)}>
                                添加员工
                            </Button>
                        </Form.Item>
                    )
                }
                return Components.map((item, index) => {
                    return (
                        <Form.Item key={index} label={`员工${index}`}>
                            <Grid.Row>
                                <Grid.Col span={20}>{item.Comp}</Grid.Col>
                                <Grid.Col span={4}>
                                    <Button onClick={() => remove(index)}>
                                        删除
                                    </Button>
                                    <Button
                                        onClick={() =>
                                            add(undefined, index + 1)
                                        }
                                    >
                                        添加
                                    </Button>
                                </Grid.Col>
                            </Grid.Row>
                        </Form.Item>
                    )
                })
            },
        },
    },
}

function YoungFormV2() {
    const [data, setData] = useState<any>()

    const Editor = BuildEditor(companyEditor)

    return (
        <>
            <Editor path={[]} />
            <pre>{JSON.stringify(data, null, 4)}</pre>
        </>
    )
}

export default function (props: any) {
    return <YoungFormV2 />
}

export function People(props: any) {
    const { value } = props
    console.log(value)
    const str = JSON.stringify(value)
    return <div>{str}</div>
}

export function TestForm() {
    const [form] = Form.useForm()

    return (
        <Form form={form} initialValues={{ people: { name: '张三', age: 18 } }}>
            {/* {
                Array.from({ length: 1000 }).map((_, i) => {
                    return <Form.Item key={`name${i}`} field={`name${i}`} label={`名称${i}`}>
                        <Input />
                    </Form.Item>
                })
            } */}
            <Form.Item field="people.age" label="年龄">
                <InputNumber />
            </Form.Item>
            <Button
                onClick={() => {
                    form.setFieldValue('people', { age: 19 })
                    console.log(form.getFieldsValue())
                }}
            >
                测试
            </Button>
        </Form>
    )
}

function getLargeSizeEditor(): Editor<any> {
    const editor: Editor<any> = {
        type: 'object',
        items: {},
    }

    for (let i = 0; i < 1000; i++) {
        editor.items[`name${i}`] = {
            type: 'common',
            // required: (v) => {
            //     const { value } = v
            //     if (!value || value.length < 5) {
            //         return true
            //     }
            //     console.log('hit')
            //     return false
            // },
            Component: props => {
                // console.log(props.value)
                return <Input {...props} />
            },
        }
    }
    return editor
}
