import { Decorator } from 'typescript'
import { WidgetHub, BaseWidget } from './index'

const groupKey = Symbol('group')

function Group(name: string): ClassDecorator {
    return function (target: Function) {
        target.prototype[groupKey] = name
    }
}

@Group('hello')
export class Panel extends BaseWidget {
    constructor() {
        super()
    }

    get type() {
        return 'panel'
    }
}

const hub = new WidgetHub([new Panel()])
hub.widgets.forEach(w => {
    console.log(Object.getPrototypeOf(w)[groupKey])
})


