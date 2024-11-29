import { get, set } from 'lodash'


type Path = (string | number)[]

class Parent {
    constructor(private _root: any, private _path: Path) { }

    get data() {
        return get(this._root, this._path.join('.'))
    }

    get parent(): Parent | null {
        if (this._path.length === 0) {
            return null
        }
        return new Parent(this._root, this._path.slice(0, -1))
    }
}

interface ParentProxy {
    data: any
    Parent: ParentProxy
}

const p = {
    "name": "123",
    "age": 12,
    "company": {
        "name": "hhh",
        "address": ["123", "345"]
    }
}


const parent = new Parent(p, ["company", "address", 1])
console.log(parent.data)
console.log(parent.parent?.parent?.parent)

