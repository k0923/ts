import { Form } from "@arco-design/web-react"
import React from 'react'
import { RulesProps } from "@arco-design/web-react"
import { buildCommonFormEditor } from "@k0923/form"

import { Editor } from "@k0923/form"
import { useMemo } from "react"
import { resolveEditorNode } from "@k0923/form/src/utils"

function ProxyComp(props: any & { children: React.ReactElement }) {
    const { children, onChange, ...newProps } = props
    const node = React.cloneElement(props.children, { ...newProps })
    return node
}

function ReactFormItem(props: any & { children: React.ReactElement }) {
    const { form } = Form.useFormContext()
    const data = Form.useWatch(props.path.join('.'), form)
    console.log(data)
    return props.children
}

export function BuildArcoForm(editor: Editor): React.FC<{ path: (string | number)[] }> {
    const Comp = buildCommonFormEditor(editor, props => {
        const { path, children, editor, value } = props
        const required = typeof editor?.required === 'function'
            ? editor.required?.({ value })
            : editor?.required;
        const rules = useMemo(() => {
            const rules: RulesProps[] = []
            if (required) {
                rules.push({ required: true })
            }
            if (editor?.validator) {
                rules.push({
                    validator: (v, cb) => {
                        const err = editor.validator!(v)
                        if (err) {
                            if (err instanceof Promise) {
                                return new Promise<void>((resolve) => {
                                    err.then(e => {
                                        if (e) {
                                            cb(e)
                                        }
                                        resolve()
                                    })
                                })
                            } else {
                                if (err) {
                                    cb(err)
                                }
                            }
                        }
                    }
                })
            }
            return rules
        }, [editor?.validator, required])

        const Title = resolveEditorNode(editor?.Title, props);
        const Desc = resolveEditorNode(editor?.Desc, props);





        if (editor?.type === 'object') {
            return (
                <Form.Item field={path.join('.')} noStyle={{ showErrorTip: true }} rules={rules}>
                    <ProxyComp>
                        {children}
                    </ProxyComp>
                </Form.Item>
            )
        }
        return (
            <ReactFormItem path={path}>
                <Form.Item required={required} hasFeedback={required} rules={rules} labelCol={{ span: 8 }} wrapperCol={{ span: 15 }} label={title} field={path.join('.')} colon extra={desc} >
                    <ProxyComp>
                        {children}
                    </ProxyComp>
                </Form.Item>
            </ReactFormItem>

        )
    })

    return props => {
        const { path } = props
        const { form } = Form.useFormContext()
        const data = Form.useWatch(path.join("."), form)

        return (
            <Comp value={data} path={path}
                setfieldvalue={(p, v) => {
                    console.log(p)
                    form.setFieldValue(p.join('.'), v)
                }}
            />
        )
    }
}