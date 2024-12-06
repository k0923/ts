import type { Path } from '@/common/type'
import { createContext } from 'react'
import { get, set } from '../utils/data'

export interface IFormContext {
    setValue(path: Path, value: any): void
    getValue(path: Path): any
}

export class DefaultFormContext implements IFormContext {
    constructor(private data: any) {}

    setValue(path: Path, value: any) {
        this.data = set(this.data, path, value)
    }

    getValue(path: Path) {
        return get(this.data, path)
    }
}

export const FormContext = createContext<IFormContext>(new DefaultFormContext({}))
