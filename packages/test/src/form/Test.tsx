import { Button, Form, Input, InputNumber } from "@arco-design/web-react"
import { buildFormEditor, DefaultFormContextV2, Editor } from "@k0923/form"
// import { FormContext, FormContextInstance, FormContextV2, useFormDataV2 } from "@k0923/form"
import { Node } from "@k0923/form/src/tree"
import { resolveEditorNode } from "@k0923/form/src/utils"
import { useEffect, useMemo } from "react"
import { User } from "./Form"

// export function FormItem(props: { label: React.ReactNode, path: TreeNode<Path>, children: React.ReactElement }) {
//     const context = useContext(FormContextInstance)
//     const value = useFormDataV2(props.path)

//     const Node = cloneElement(props.children, { ...props.children.props, value: value, onChange: (v: any) => context.setFieldValue(props.path, v) })
//     return <Form.Item label={props.label}>
//         {Node}
//     </Form.Item>

// }

function YoungForm() {
    const [ctx,node] = useMemo(() => {
        
        return [new DefaultFormContextV2({"company":{name:"abc",address:"123"}}),new Node({data:{},caches:new Map()},[])]
    }, [])

    const UserEditor = useMemo(() => {
        return buildFormEditor(userEditor, props => {
            const {  children, editor, node } = props
            const Title = resolveEditorNode(editor?.Title, props);
            const Desc = resolveEditorNode(editor?.Desc, props);
            if (editor?.type === 'object') {
                return (
                    <Form.Item noStyle={{ showErrorTip: true }}>
                        {children}
                    </Form.Item>
                )
            }
            return (
                <Form.Item labelCol={{ span: 8 }} wrapperCol={{ span: 15 }} label={Title} colon extra={Desc}>
                    {children}
                </Form.Item>
            )
        })
    }, [])

    return <UserEditor ctx={ctx} />
}

export default function (props: any) {

    return <YoungForm />

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
                <InputNumber/>
            </Form.Item>
            <Button onClick={() => {
                form.setFieldValue('people', { age: 19 })
                console.log(form.getFieldsValue())
            }}>测试</Button>
        </Form>
    )
}

function getLargeSizeEditor(): Editor<any> {
    const editor: Editor<any> = {
        type: 'object',
        items: {}
    }


    for (let i = 0; i < 1000; i++) {
        editor.items[`name${i}`] = {
            Title: `名称${i}`,
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
            }
        }
    }
    return editor
}

export const userEditor: Editor<User> = {
    type: 'object',
    Title: "用户",
    // valueHandler: (c, l, p) => {
    //     let age = c?.age ?? 0
    //     return {
    //         name: c?.name,
    //         age: age++,
    //     }
    // },
    items: {
        name: {
            Title: "姓名",
            type: 'common',
            // required: (v) => {
            //     console.log(v)
            //     const { value } = v
            //     if (!value || value.length < 5) {
            //         return true
            //     }
            //     console.log('hit')
            //     return false
            // },
            Component: props => {

                return <Input {...props} />
            }
        },
        age: {
            Title: "年龄",
            type: 'common',
            // required: (v) => {
            //     console.log(v)
            //     const { value } = v
            //     if (!value || value < 5) {
            //         return true
            //     }
            //     console.log('hit')
            //     return false
            // },
            Component: props => (< InputNumber {...props} />)
        },
        company: {
            type: 'object',
            validator: (c) => {
                if (!c || c.name === "") {
                    return "公司信息不能为空"
                }

            },
            valueHandler: (c, l, p) => {
                if (c.name === "bcd") {
                    c.name = "abc"
                }
                return c
            },
            items: {
                name: {
                    valueHandler:(c,l) => {
                       
                        if(c === "abc") {
                            return "bcd"
                        }
                        return c
                    },
                    Title: props => {
                        
                        return `公司${props.node.data?.length ?? 0}`
                    },
                    Desc: props=> {
                        return props.node.data
                    },
                    type: 'common',
                    Component: props => {
                        useEffect(()=>{
                            return () => {
                                console.log("clean company")
                            }
                        },[])
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
                    Title: "地址",
                    type: 'common',
                    Component: props => {
                        // console.log(props.parent, props.value)
                        return <Input {...props} />
                    },
                    validator: (v) => {

                        if (v && v.length > 5) {
                            return "长度不能大于5"
                        }
                        return undefined
                    }
                }
            }
        }
    }
}