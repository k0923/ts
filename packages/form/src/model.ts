import type { TreeNode } from "./tree"

export type UnArray<T> = T extends Array<infer U> ? U : T

export type KeyOf<T> = Extract<keyof T, string>



export type Validator<Value = any> = (currentValue?: Value) => any


export type Path = (string | number)[]

