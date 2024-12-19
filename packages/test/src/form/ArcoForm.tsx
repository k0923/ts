import {
    Button,
    Form,
    Grid,
    Input,
    InputNumber,
    Radio,
    Checkbox,
    Divider,
    FormInstance,
} from '@arco-design/web-react'
import {
    ArrayEditor,
    BaseEditor,
    CommonEditor,
    ContextDataHandler,
    FuncEditor,
    IFormContext,
    ObjectEditor,
    Path,
    PathSegment,
} from '@k0923/react'
import { useEffect, useMemo, useState } from 'react'

export interface Company {
    name: string
    address: string
    Employees: User[]
}

export interface User {
    name: string
    age: number
    gender: 'male' | 'female'
    Hobbies: GameHobby[]
}

export interface MobileGameHobby {
    type: 'mobile'
    data?: string[]
}

export interface ConsoleGameHobby {
    type: 'console'
    data?: {
        platform: 'xbox' | 'ps' | 'switch'
        games: string[]
    }
}

const CommonGameEditor = new CommonEditor<string[]>({
    Component: props => {
        return <Checkbox.Group {...props} options={['游戏1', '游戏2', '游戏3']} />
    },
})

const ConsoleGameEditor = new ObjectEditor<ConsoleGameHobby['data']>({
    items: {
        platform: new CommonEditor<string>({
            Component: props => {
                return <Input {...props} />
            },
        }),
        games: CommonGameEditor,
    },
})

export type GameHobby = MobileGameHobby | ConsoleGameHobby

const GameEditor = new ObjectEditor<GameHobby>({
    valueHandler: (value, last) => {
        console.log(JSON.stringify(last), JSON.stringify(value))
        if (value?.type !== last?.type) {
            return {
                ...value,
                data: undefined,
            }
        }
        return value
    },
    items: {
        type: new CommonEditor<'console' | 'mobile'>({
            Component: props => {
                return (
                    <Radio.Group {...props}>
                        <Radio value="console">Console</Radio>
                        <Radio value="mobile">mobile</Radio>
                    </Radio.Group>
                )
            },
        }),
        data: new FuncEditor<any>({
            cacheSize: 10,
            func: (value, path) => {
                const parentValue = path.parent?.value
                if (parentValue?.type === 'console') {
                    return ConsoleGameEditor
                }
                if (parentValue?.type === 'mobile') {
                    return CommonGameEditor
                }
                return
            },
        }),
    },
    Wrapper: props => {
        const { path } = props
        return (
            <>
                <Form.Item
                    field={[...path.path, 'type'].join('.')}
                    label="类型"
                    required
                    rules={[{ required: true }]}
                >
                    {props.Components.type}
                </Form.Item>
                <Form.Item label="数据">{props.Components.data}</Form.Item>
                <Button
                    onClick={() => {
                        props.update(undefined as any)
                    }}
                >
                    Reset
                </Button>
            </>
        )
    },
})

const UserEditor = new ObjectEditor<User>({
    valueHandler: (value, last) => {
        if (value?.name === 'abc') {
            return {
                ...value,
                name: 'bcd',
            }
        }
        return value
    },
    items: {
        name: new CommonEditor<string>({
            Component: props => {
                return <Input {...props} />
            },
        }),
        age: new CommonEditor<number>({
            Component: props => {
                return <InputNumber {...props} />
            },
        }),
        gender: new CommonEditor({
            Component: props => {
                return (
                    <Radio.Group {...props}>
                        <Radio value="male">男</Radio>
                        <Radio value="female">女</Radio>
                    </Radio.Group>
                )
            },
        }),
        Hobbies: new ArrayEditor<GameHobby[]>({
            editor: GameEditor,
            Wrapper: props => {
                const { add, Components, remove, move, value } = props
                if (!value || value.length === 0) {
                    return (
                        <Form.Item label=" ">
                            <Button onClick={() => add(undefined, 0)}>添加爱好</Button>
                        </Form.Item>
                    )
                }
                return (
                    <>
                        {Components.map((item, index) => {
                            return (
                                <Form.Item key={index} label={`爱好${index}`}>
                                    <Grid.Row>
                                        <Grid.Col span={10}>{item.Comp}</Grid.Col>
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
        }),
    },
    Wrapper: props => {
        const [count, setCount] = useState(0)
        const { path } = props
        useEffect(() => {
            setCount(count + 1)
        }, [props.value])
        return (
            <>
                <Divider>{count}</Divider>
                <Form.Item
                    required
                    validateTrigger="onChange"
                    rules={[
                        {
                            validator: (v, cb) => {
                                console.log(v)
                            },
                        },
                        {
                            required: true,
                        },
                    ]}
                    field={[...path.path, 'name'].join('.')}
                    label="姓名"
                >
                    {props.Components.name}
                </Form.Item>
                <Form.Item label="年龄" required>
                    {props.Components.age}
                </Form.Item>
                <Form.Item label="性别">{props.Components.gender}</Form.Item>
                {props.Components.Hobbies}
            </>
        )
    },
})

const CompanyEditor = new ObjectEditor<Company>({
    Wrapper: props => {
        const { path } = props
        return (
            <>
                <Form.Item
                    field={[...path.path, 'name'].join('.')}
                    rules={[{ required: true }]}
                    label="名称"
                >
                    {props.Components.name}
                </Form.Item>
                <Form.Item label="地址">{props.Components.address}</Form.Item>
                {props.Components.Employees}
            </>
        )
    },
    items: {
        name: new CommonEditor<string>({
            Component: props => {
                return <Input {...props} />
            },
        }),
        address: new CommonEditor<string>({
            Component: props => {
                return <Input {...props} />
            },
        }),
        Employees: new ArrayEditor<User[]>({
            valueHandler: (value, last) => {
                // if(value.length > 1) {
                //     const newV = value.map(v=>({...v,name:'abcd'}))
                //     return newV
                // }
                return value
            },
            Wrapper: ({ value, add, remove, Components }) => {
                const [count, setCount] = useState(0)
                useEffect(() => {
                    setCount(count + 1)
                }, [value])
                if (!value || value.length == 0) {
                    return (
                        <Form.Item label=" ">
                            <Button onClick={() => add(undefined, 0)}>添加员工</Button>
                        </Form.Item>
                    )
                }
                return Components.map((item, index) => {
                    return (
                        <Form.Item key={index} label={`员工${index}_${count}`}>
                            <Grid.Row>
                                <Grid.Col span={20}>{item.Comp}</Grid.Col>
                                <Grid.Col span={4}>
                                    <Button onClick={() => remove(index)}>删除</Button>
                                    <Button onClick={() => add(undefined, index + 1)}>添加</Button>
                                </Grid.Col>
                            </Grid.Row>
                        </Form.Item>
                    )
                })
            },
            editor: UserEditor,
        }),
    },
})

export class AcroFormContext implements IFormContext {
    private hooks: Set<ContextDataHandler> = new Set()

    constructor(private form: FormInstance) {}
    registerHook(fn: ContextDataHandler) {
        this.hooks.add(fn)
    }
    unregisterHook(fn: ContextDataHandler) {
        this.hooks.delete(fn)
    }
    setValue(path: PathSegment[], value: any) {
        this.form.setFieldValue(path.join('.'), value)
        this.hooks.forEach(fn => fn(path, value, this.form.getFieldsValue()))
    }
    getValue(path: PathSegment[]) {
        return this.form.getFieldValue(path.join('.'))
    }
}

export function ArcoFormBody(props: { path: Path; editor: BaseEditor }) {
    const Editor = useMemo(() => props.editor.build(), [])
    const { path } = props
    return <Editor path={path} />
}

export default function () {
    const [form] = Form.useForm()
    const path = new Path([], new AcroFormContext(form))
    return (
        <Form
            scrollToFirstError
            form={form}
            onSubmit={v => {
                console.log(form.getFieldsValue())
                console.log(v)
            }}
            onValuesChange={(v, vs) => {
                console.log(v)
            }}
        >
            <ArcoFormBody path={path} editor={CompanyEditor} />
            <Button htmlType="submit">提交</Button>
        </Form>
    )
}
