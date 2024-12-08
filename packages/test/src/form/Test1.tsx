import { Button, Form, Grid, Input, InputNumber, Radio, Checkbox, Divider } from '@arco-design/web-react'
import {
    ArrayEditor,
    CommonEditor,
    DefaultFormContext,
    FuncEditor,
    ObjectEditor,
} from '@k0923/form'
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
        platform: new CommonEditor<'xbox' | 'ps' | 'switch'>({
            Component: props => {
                return <Radio.Group {...props} options={['xbox', 'ps', 'switch']} />
            },
        }),
        games: CommonGameEditor,
    },
})

export type GameHobby = MobileGameHobby | ConsoleGameHobby

const GameEditor = new ObjectEditor<GameHobby>({
    // valueHandler: (value, last) => {
    //     // console.log('hit', value?.type, last?.type)
    //     // if (value?.type === last?.type) {
    //     //     return value
    //     // }
    //     if (value) {
    //         console.log('hit2')
    //         const { type } = value
    //         return {
    //             type,
    //             data: undefined,
    //         }
    //     }
    //     return value
    // },
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
            func: value => {
                console.log(value)
                if (Array.isArray(value)) {
                    console.log('hit3')
                    return CommonGameEditor as any
                }
                console.log('hit4')
                return ConsoleGameEditor as any
            },
        }),
    },
})

const UserEditor = new ObjectEditor<User>({
    valueHandler: (value, last) => {
        console.log(value,last)
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
        // Hobbies: new ArrayEditor({
        //     Wrapper: props => {
        //         const { add, Components, remove, move, value } = props
        //         if (!value || value.length === 0) {
        //             return (
        //                 <Form.Item label=" ">
        //                     <Button onClick={() => add(undefined, 0)}>添加爱好</Button>
        //                 </Form.Item>
        //             )
        //         }
        //         return (
        //             <>
        //                 {Components.map((item, index) => {
        //                     return (
        //                         <Form.Item key={index} label={`爱好${index}`}>
        //                             <Grid.Row>
        //                                 <Grid.Col span={10}>{item.Comp}</Grid.Col>
        //                                 <Grid.Col span={10}>
        //                                     <Button
        //                                         onClick={() => {
        //                                             add(undefined, index + 1)
        //                                         }}
        //                                     >
        //                                         添加
        //                                     </Button>

        //                                     <Button
        //                                         onClick={() => {
        //                                             remove(index)
        //                                         }}
        //                                     >
        //                                         删除
        //                                     </Button>
        //                                 </Grid.Col>
        //                             </Grid.Row>
        //                         </Form.Item>
        //                     )
        //                 })}
        //             </>
        //         )
        //     },
        //     editor: new CommonEditor({
        //         Component: props => {
        //             return <Input {...props} />
        //         },
        //     }),
        // }),
    },
    Wrapper: props => {
        const [count,setCount] = useState(0)
        useEffect(()=>{setCount(count+1)},[props.value])
        return (
            <>
                <Divider>{count}</Divider>
                <Form.Item label="姓名">{props.Components.name}</Form.Item>
                <Form.Item label="年龄">{props.Components.age}</Form.Item>
                <Form.Item label="性别">{props.Components.gender}</Form.Item>
                {props.Components.Hobbies}
            </>
        )
    },
})

const CompanyEditor = new ObjectEditor<Company>({
    Wrapper: props => {
        return (
            <>
                <Form.Item label="姓名">{props.Components.name}</Form.Item>
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
        Employees: new ArrayEditor({
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

export default function () {
    CompanyEditor.setContext(new DefaultFormContext({}))
    const Editor = useMemo(() => CompanyEditor.build(), [])
    return <Editor path={[]} />
}
