export type UnArray<T> = T extends Array<infer U> ? U : T

export type KeyOf<T> = Extract<keyof T, string>
