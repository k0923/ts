
export abstract class BaseWidget {
    constructor() { }

    abstract get type(): string
}

export class WidgetHub {
    private _widgets = new Map<string, BaseWidget>()
    constructor(widgets?: Array<BaseWidget>) {
        widgets?.forEach(widget => {
            this.register(widget)
        })
    }

    register(widget: BaseWidget) {
        if (this._widgets.has(widget.type)) {
            throw new Error(`widget ${widget.type} already registered`)
        }
        this._widgets.set(widget.type, widget)
    }

    get widgets(): BaseWidget[] {
        return Array.from(this._widgets.values())
    }

    getWidget(type: string): BaseWidget | undefined {
        return this._widgets.get(type)
    }
}


