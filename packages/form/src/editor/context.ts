import { get, set } from '../utils/data'
export type PathSegment = string | number

export interface IFormContext {
    setValue(path: PathSegment[], value: any): void
    getValue(path: PathSegment[]): any
}

export class DefaultFormContext implements IFormContext {
    constructor(private data: any) {}
    setValue(path: PathSegment[], value: any) {
        this.data = set(this.data, path, value)
    }
    getValue(path: PathSegment[]) {
        return get(this.data, path)
    }
}

export interface IPath {
    readonly path: PathSegment[]
    readonly value: any
    readonly parent: IPath
    readonly last: PathSegment | PathSegment[]
    next(segment: PathSegment | PathSegment[]): IPath
}

export class Path {
    constructor(
        private segments: (PathSegment | PathSegment[])[],
        private ctx: IFormContext
    ) {}

    get path() {
        return this.segments.flat().filter(it => it !== undefined)
    }

    get value() {
        return this.ctx.getValue(this.path)
    }

    get parent(): Path {
        if (this.segments.length > 0) {
            return new Path(this.segments.slice(0, -1), this.ctx)
        }
        return new Path([], this.ctx)
    }

    get last(): PathSegment | PathSegment[] {
        const last = this.segments.filter(it => it !== undefined)
        if (last.length > 0) {
            const lastSegment = last[last.length - 1]
            switch (typeof lastSegment) {
                case 'number':
                    return lastSegment
                case 'string':
                    return lastSegment
                default:
                    return lastSegment.filter(it => it !== undefined)
            }
        }

        return []
    }

    next(segment: PathSegment | PathSegment[]) {
        return new Path([...this.segments, segment], this.ctx)
    }

    setValue(value: any) {
        this.ctx.setValue(this.path, value)
    }
}
