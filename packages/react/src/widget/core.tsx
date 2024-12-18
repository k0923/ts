import { ReactiveProps } from '@/common/type'
import { Operator } from '@/logic/operator'
import React from 'react'

export interface Filter<V = any, L extends { [K in Operator]: any } = any> {
    filter(): Filters<V, L>
}

export interface Editor<Value = any> {
    editor(): React.FC<ReactiveProps<Value>>
}

export interface FilterItem<Value = any, LogicValue = any> {
    compare: (value: Value, target: LogicValue) => boolean
    editor: NullableFC<ReactiveProps<LogicValue>>
    operator: React.ReactNode
}

export type Filters<V, T extends { [K in Operator]: any }> = {
    [key in keyof T]: FilterItem<V, T[key]>
}

export interface Widget<Value = any, LogicValue extends { [K in Operator]: any } = any> {
    viewer(): React.FC<{ value: Value }>
    editor(): NullableFC<ReactiveProps<Value>>
    filter(): Filters<Value, LogicValue>
}

type NullableFC<T> = React.FC<T> | null

export type LV<T extends { [K in Operator]: any }> = {
    [key in keyof T]: React.FC<ReactiveProps<T[key]>>
}

// export abstract class Widget<
//     Value = any,
//     LogicValue extends { [K in Operator]: any } = any,
// > {
//     viewer(): React.FC<{ value: Value }> {
//         return ({ value }) => {
//             if (!value) {
//                 return null
//             }
//             switch (typeof value) {
//                 case 'object':
//                     return <span>{JSON.stringify(value)}</span>
//                 case 'string':
//                     return <span>{value}</span>
//                 case 'boolean':
//                     return <span>{value ? 'true' : 'false'}</span>
//                 case 'number':
//                     return <span>{value}</span>
//                 default:
//                     return null
//             }
//         }
//     }

//     editor(): NullableFC<ReactiveProps<Value>> {
//         return null
//     }

//     filter(): LV<LogicValue> | null {
//         return null
//     }
// }
