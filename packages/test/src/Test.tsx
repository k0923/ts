import { Button, Divider, Form, Grid, Input, InputNumber, Radio } from '@arco-design/web-react'
import { ArrayEditor, CommonEditor, DefaultFormContext, ObjectEditor, Path } from '@k0923/react'
import { useCount } from './form/ArcoForm'
import { useEffect, useMemo, useRef, useState } from 'react'

const next = Path.prototype.next
Path.prototype.next = function (s, fn) {
    // console.log('build path', this.path.join('.'), (this as any).level)
    const t = this as any
    if (!t.level) {
        t.level = 0
    }

    const result = next.call(this, s, fn)
    const t1 = result as any
    t1.level = t.level
    return result
}

export interface Company {
    name: string
    address: string
    Employees: User[]
}

export interface User {
    name: string
    age: number
    gender: 'male' | 'female'
}

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
            Component: ({ path, onChange, ...props }) => {
                const v = `${path.value}_${path.level}`
                return <Input {...props} value={v} onChange={onChange} />
            },
        }),
        age: new CommonEditor<number>({
            Component: ({ path, onChange, ...props }) => {
                return <InputNumber {...props} value={path.value} onChange={onChange} />
            },
        }),
        gender: new CommonEditor({
            Component: ({ path, onChange, ...props }) => {
                return (
                    <Radio.Group {...props} value={path.value} onChange={onChange}>
                        <Radio value="male">男</Radio>
                        <Radio value="female">女</Radio>
                    </Radio.Group>
                )
            },
        }),
    },
    Wrapper: props => {
        const count = useCount()
        return (
            <>
                <Divider>{count}</Divider>
                <Form.Item label="姓名">{props.Components.name}</Form.Item>
                <Form.Item label="年龄">{props.Components.age}</Form.Item>
                <Form.Item label="性别">{props.Components.gender}</Form.Item>
            </>
        )
    },
})

const CompanyEditor = new ObjectEditor<Company>({
    Wrapper: ({ path, Components }) => {
        const p = path as any

        useState(() => {
            p.level = (p.level ?? 0) + 1
            return p
        })
        return (
            <>
                <Form.Item label="姓名">{Components.name}</Form.Item>
                <Form.Item label="地址">{Components.address}</Form.Item>
                {Components.Employees}
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
            Wrapper: ({ add, remove, Components, path }) => {
                const count = useCount()
                const value = path.value
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

const defaultData = {
    name: 'qwq',
    address: '323',
    Employees: [
        {
            name: 'abc1',
        },
    ],
}

export default function () {
    const path = useMemo(() => {
        return new Path([], new DefaultFormContext(defaultData))
    }, [])
    const [count, setCount] = useState(0)

    const Editor = useMemo(() => CompanyEditor.build(), [])
    return (
        <>
            <Editor path={path} />
            <Button onClick={() => setCount(count + 1)}>提交</Button>
            <pre>{JSON.stringify(path.value, null, 2)}</pre>
        </>
    )
}
