import {
    Button,
    Form,
    Input,
    InputNumber,
    RulesProps,
} from '@arco-design/web-react'

import { Editor } from '@k0923/form'
import { TreeNode } from '@k0923/form/src/tree'
import { useMemo, useState } from 'react'

// export function BuildArcoForm(editor: Editor): React.FC<{ path: (string | number)[] }> {
//     const Comp = buildCommonFormEditor(editor, props => {
//         const { path, title, desc, children, required, editor } = props
//         const rules = useMemo(() => {
//             const rules: RulesProps[] = []
//             if (required) {
//                 rules.push({ required: true })
//             }
//             if (editor?.validator) {
//                 rules.push({
//                     validator: (v, cb) => {
//                         const err = editor.validator!(v)
//                         if (err) {
//                             if (err instanceof Promise) {
//                                 return new Promise<void>((resolve) => {
//                                     err.then(e => {
//                                         if (e) {
//                                             cb(e)
//                                         }
//                                         resolve()
//                                     })
//                                 })
//                             } else {
//                                 if (err) {
//                                     cb(err)
//                                 }
//                             }
//                         }
//                     }
//                 })
//             }
//             return rules
//         }, [editor?.validator, required])

//         if (editor?.type === 'object') {
//             return (
//                 <Form.Item field={path.join('.')} noStyle={{ showErrorTip: true }} rules={rules}>
//                     {children}
//                 </Form.Item>
//             )
//         }
//         return (
//             <Form.Item required={required} hasFeedback={required} rules={rules} labelCol={{ span: 8 }} wrapperCol={{ span: 15 }} label={title} field={path.join('.')} colon extra={desc} >
//                 {children}
//             </Form.Item>
//         )
//     })

//     return props => {
//         const { path } = props
//         const { form } = Form.useFormContext()
//         const data = Form.useWatch(path.join("."), form)

//         return (
//             <Comp value={data} path={path} onChange={v => {
//                 console.log(v)
//             }} />
//         )
//     }
// }

// function ProxyComp(props: { children: React.ReactNode }) {
//     return props.children
// }

// export function BuildForm(editor: Editor): React.FC<{ field: string }> {
//     const Comp = buildCommonFormEditor(editor, props => {
//         const { path, title, desc, children, required, editor } = props
//         console.log(required, title)

//         const rules: RulesProps[] = []
//         if (required) {
//             rules.push({ required: true })
//         }
//         if (editor?.validator) {
//             rules.push({
//                 validator: (v, cb) => {
//                     const err = editor.validator!(v)
//                     if (err) {
//                         if (err instanceof Promise) {
//                             return new Promise<void>((resolve) => {
//                                 err.then(e => {
//                                     if (e) {
//                                         cb(e)
//                                     }
//                                     resolve()
//                                 })
//                             })
//                         } else {
//                             if (err) {
//                                 cb(err)
//                             }
//                         }
//                     }
//                 }
//             })
//         }

//         if (editor?.type === 'object') {
//             return (
//                 <Form.Item field={path.join('.')} noStyle={{ showErrorTip: true }} rules={rules}>
//                     {children}
//                 </Form.Item>
//             )
//         }
//         return (
//             <Form.Item required={required} hasFeedback={required} rules={rules} labelCol={{ span: 8 }} wrapperCol={{ span: 15 }} label={title} field={path.join('.')} colon extra={desc} >
//                 {children}
//             </Form.Item>
//         )
//     })

//     const parent = new TreeNode({})

//     return props => {
//         const { field } = props
//         const [form] = Form.useForm()
//         const [data, setData] = useState<any>({})

//         // const d = Form.useWatch(field, form)
//         // console.log(d)
//         return (
//             <>
//                 <Form form={form} onValuesChange={(v, vs) => { console.log(v); setData(vs) }} onSubmit={(v) => {
//                     setData(v)
//                 }}>
//                     <Comp value={data} parent={parent} path={[]} addvalidpath={() => { }} />
//                     <Button type='primary' htmlType='submit'>提交</Button>
//                 </Form >
//                 <pre>{JSON.stringify(data, null, 2)}</pre>
//             </>

//         )
//     }
// }

export interface Class {
    students: User[]
}

export interface Company {
    name: string
    address: string
}

export interface User {
    name: string
    age: number
    company: Company
    Hobbies: string[]
}

export const userEditor: Editor<User> = {
    type: 'object',
    Title: '用户',
    // valueHandler: (c, l, p) => {
    //     let age = c?.age ?? 0
    //     return {
    //         name: c?.name,
    //         age: age++,
    //     }
    // },
    items: {
        name: {
            Title: '姓名',
            type: 'common',
            required: v => {
                console.log(v)
                const { value } = v
                if (!value || value.length < 5) {
                    return true
                }
                console.log('hit')
                return false
            },
            Component: props => {
                // console.log(props.value)
                // console.log(props.parent, props.value)
                return <Input {...props} />
            },
        },
        age: {
            Title: '年龄',
            type: 'common',
            required: v => {
                console.log(v)
                const { value } = v
                if (!value || value < 5) {
                    return true
                }
                console.log('hit')
                return false
            },
            Component: props => <InputNumber {...props} />,
        },
        company: {
            type: 'object',
            validator: c => {
                if (!c || c.name === '') {
                    return '公司信息不能为空'
                }
            },
            valueHandler: (c, l, p) => {
                if (c.name === 'abc') {
                    c.name = 'bcd'
                }
                return c
            },
            items: {
                name: {
                    Title: '公司',
                    type: 'common',
                    Component: props => {
                        // console.log(props.parent, props.value)
                        return <Input {...props} />
                    },
                    // validator: async (v) => {
                    //     await sleep(2000)
                    //     if (v && v.length > 5) {
                    //         return "长度不能大于5"
                    //     }
                    //     return undefined
                    // }
                },
                address: {
                    Title: '地址',
                    type: 'common',
                    Component: props => {
                        // console.log(props.parent, props.value)
                        return <Input {...props} />
                    },
                    validator: v => {
                        if (v && v.length > 5) {
                            return '长度不能大于5'
                        }
                        return undefined
                    },
                },
            },
        },
    },
}

export const sleep = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms))
}
