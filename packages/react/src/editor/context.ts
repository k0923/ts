import { get, set } from '../utils/data'
export type PathSegment = string | number

export interface IFormContext {
    setValue(path: PathSegment[], value: any): void
    getValue(path: PathSegment[]): any
    registerHook(fn: ContextDataHandler): void
    unregisterHook(fn: ContextDataHandler): void
}

export type ContextDataHandler = (path: PathSegment[], value: any, totalValue: any) => void

export class DefaultFormContext implements IFormContext {
    private hooks: Set<ContextDataHandler> = new Set()

    constructor(private data: any) {}
    registerHook(fn: ContextDataHandler) {
        this.hooks.add(fn)
    }
    unregisterHook(fn: ContextDataHandler) {
        this.hooks.delete(fn)
    }
    setValue(path: PathSegment[], value: any) {
        this.data = set(this.data, path, value)
        this.hooks.forEach(fn => fn(path, value, this.data))
    }
    getValue(path: PathSegment[]) {
        return get(this.data, path)
    }
}

export class Path<Value = any> {
    constructor(
        private _segment: PathSegment | PathSegment[],
        private ctx: IFormContext,
        private _parent?: Path,
        private _buildParentValue?: (parentValue: any, value: any) => any
    ) {}

    get path(): PathSegment[] {
        return (this._parent?.path ?? []).concat(this._segment).flat()
    }

    get value(): Value | undefined {
        return this.ctx.getValue(this.path)
    }

    get parent(): Path | undefined {
        return this._parent
    }

    get segment() {
        return this._segment
    }

    get context() {
        return this.ctx
    }

    buildParent(parentValue: any, value: any) {
        if (this._buildParentValue) {
            return this._buildParentValue(parentValue, value)
        }
        return parentValue
    }

    next(segment: PathSegment | PathSegment[], fn?: (parentValue: any, value: any) => any): Path {
        return new Path(segment, this.ctx, this, fn)
    }

    setValue(value: any) {
        this.ctx.setValue(this.path, value)
    }

    getValue(segment: PathSegment[]) {
        return this.ctx.getValue(segment)
    }
}
