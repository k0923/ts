import { Input, InputNumber, Form, Grid } from "@arco-design/web-react"
import { buildFormEditor, DefaultFormContext, Editor, FormContext } from "@k0923/form"
// import { FormContext, FormContextInstance, FormContextV2, useFormDataV2 } from "@k0923/form"
import { Path } from "@k0923/form/src/model"
import { TreeNode } from "@k0923/form/src/tree"
import { useContext, cloneElement, useState, useMemo } from "react"
import { User } from "./Form"
import { resolveEditorNode } from "@k0923/form/src/utils"

// export function FormItem(props: { label: React.ReactNode, path: TreeNode<Path>, children: React.ReactElement }) {
//     const context = useContext(FormContextInstance)
//     const value = useFormDataV2(props.path)

//     const Node = cloneElement(props.children, { ...props.children.props, value: value, onChange: (v: any) => context.setFieldValue(props.path, v) })
//     return <Form.Item label={props.label}>
//         {Node}
//     </Form.Item>

// }

export default function (props: any) {
    const ctx = useMemo(() => new DefaultFormContext({}), [])

    const UserEditor = useMemo(() => {
        return buildFormEditor(userEditor, props => {
            const { path, children, editor, value } = props



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
                <Form.Item labelCol={{ span: 8 }} wrapperCol={{ span: 15 }} label={Title} colon extra={Desc} >
                    {children}
                </Form.Item>
            )
        })
    }, [])

    return <UserEditor path={["test"]} ctx={ctx} />



    // return (
    //     <FormContextInstance.Provider value={new FormContextV2({})}>
    //         <FormItem path={tree} label="人员">
    //             <People />
    //         </FormItem>
    //         <FormItem path={tree.addChild('name', ['people', 'name'])} label="姓名">
    //             <Input />
    //         </FormItem>
    //         <FormItem path={tree.addChild('age', ['people', 'age'])} label="年龄">
    //             <InputNumber />
    //         </FormItem>
    //     </FormContextInstance.Provider>
    // )
}

export function People(props: any) {
    const { value } = props
    console.log(value)
    const str = JSON.stringify(value)
    return <div>{str}</div>
}


export function TestForm() {
    const [form] = Form.useForm()

    form.setFieldValue = (f, v) => { console.log(f, v) }

    const people = Form.useWatch('people', form)
    console.log(people)

    form.setFieldValue('people.name', '李四')

    return (
        <Form form={form} initialValues={{ people: { name: '张三', age: 18 } }}>
            <Form.Item field="people" label="人员">
                <People />
            </Form.Item>
            <Form.Item field="people.name" label="姓名">
                <Input />
            </Form.Item>
            <Form.Item field="people.age" label="年龄">
                <InputNumber />
            </Form.Item>
        </Form>
    )
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
            required: (v) => {
                console.log(v)
                const { value } = v
                if (!value || value.length < 5) {
                    return true
                }
                console.log('hit')
                return false
            },
            Component: props => {

                return <Input {...props} />
            }
        },
        age: {
            Title: "年龄",
            type: 'common',
            required: (v) => {
                console.log(v)
                const { value } = v
                if (!value || value < 5) {
                    return true
                }
                console.log('hit')
                return false
            },
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
                if (c.name === "abc") {
                    c.name = "bcd"
                }
                return c
            },
            items: {
                name: {
                    Title: props => {

                        return `公司${props.value?.length ?? 0}`
                    },
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