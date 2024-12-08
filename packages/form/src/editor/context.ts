import { get, set } from "../utils/data"
export type PathSegment = string | number

export interface IFormContext {
    setValue(path: PathSegment[], value: any): void
    getValue(path: PathSegment[]): any
}

export class DefaultFormContext implements IFormContext {
    constructor(private data:any) {}

    setValue(path: PathSegment[], value: any) {
        this.data = set(this.data,path,value)
    }
    getValue(path: PathSegment[]) {
        return get(this.data,path)
    }
}


export class Path {
    constructor(private segments: (PathSegment | PathSegment[])[],private ctx:IFormContext) { }

    get path() {
        return this.segments.flat()
    }

    get value() {
        return this.ctx.getValue(this.path)
    }

    get parent():Path {
        if(this.segments.length > 0) {
            return new Path(this.segments.slice(0, -1),this.ctx)
        }
        return new Path([],this.ctx)
    }

    get last():PathSegment | PathSegment[] {
        if(this.segments.length > 0) {
            return this.segments[this.segments.length - 1]
        }
        return []
    }

    next(segment: PathSegment | PathSegment[]) {
        return new Path([...this.segments, segment],this.ctx)
    }

    setValue(value:any) {
        this.ctx.setValue(this.path,value)
    }
}