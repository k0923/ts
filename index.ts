import { get, set } from 'lodash'


type Path = (string | number)[]

interface NodeConfig<T=any> {
    caches:Map<string,Node<T>>
    data:T
}


class Node<T = any>{
    constructor(private config:NodeConfig<T>,private path:Path){}
    
    get data() {
        return get(this.config.data,this.path.join('.'))
    }

    get parent():Node<T> | null {
        if (this.path.length === 0) {
            return null
        }
        const parentPath = this.path.slice(0, -1)
        let parentNode = this.config.caches.get(parentPath.join('.'))
        if(!parentNode) {
            parentNode = new Node(this.config,parentPath)
            this.config.caches.set(parentPath.join('.'),parentNode)
        } 
        return parentNode
    }

    next(segment: (string | number)): Node<T> {
        let node = this.config.caches.get([...this.path,segment].join('.'))
        if(node) {
            return node
        } else {
            node = new Node(this.config,[...this.path,segment])
            this.config.caches.set([...this.path,segment].join('.'),node)
        }
      
        return node
    }

}




const p = {
    "name": "123",
    "age": 12,
    "company": {
        "name": "hhh",
        "address": ["123", "345"]
    }
}


const parent = new Node({caches:new Map(),data:p}, ["company", "address", 1])
console.log(parent.data)
console.log(parent.parent?.parent?.parent)



