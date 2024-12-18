import { ReactiveProps } from '@/common/type'
import { ArrayEditor, BaseEditor, CommonEditor, FormNode, FuncEditor, ObjectEditor } from '@/editor'
import { Filter, LV, Widget } from '@/widget/core'
import { Operator } from './operator'

export type ICondition = IGroupCondition | ISimpleCondition

export interface IGroupCondition {
    type: 'and' | 'or'
}

export interface ISimpleCondition {
    type: 'simple'
    data: {
        x: any
        operator: Operator
        y: any
    }
}

export interface Condition<Context> {
    isMatch(ctx: Context): boolean
}

export interface Picker<Context> {
    getValue(ctx: Context): any
    equals(picker: Picker<Context>): boolean
}

export class GroupCondition<Context> implements Condition<Context> {
    public conditions: Condition<Context>[] = []

    public type: 'and' | 'or' = 'or'

    constructor() {}

    isMatch(ctx: Context): boolean {
        if (this.type === 'and') {
            return this.conditions.every(c => c.isMatch(ctx))
        } else {
            return this.conditions.some(c => c.isMatch(ctx))
        }
    }
}

export interface ConditionItem<Context> {
    isMatch(ctx: Context): boolean
}

export interface ConditionOptions<Context> {
    xPicker: React.FC<ReactiveProps<Picker<Context>>>
    operator: React.FC<ReactiveProps<Operator>>
    yPicker: React.FC<ReactiveProps<Picker<Context>>>
}

export class SimpleCondition<Context> implements Condition<Context> {
    public x: Picker<Context> | null = null
    public y: Picker<Context> | null = null
    public operator: Operator | null = null

    constructor(public condition: ConditionItem<Context> = {} as ConditionItem<Context>) {}

    isMatch(ctx: Context): boolean {
        return true
    }
}

function getEditor<Context>(condition: Condition<Context>, options: ConditionOptions<Context>) {
    const fn = (value: Condition<Context>) => {
        if (value instanceof SimpleCondition) {
            return new ObjectEditor<SimpleCondition<Context>>({
                items: {
                    x: new CommonEditor<Picker<Context>>({
                        Component: options.xPicker,
                    }),
                    operator: new CommonEditor<Operator>({
                        Component: options.operator,
                    }),
                    y: new CommonEditor<Picker<Context>>({
                        Component: options.yPicker,
                    }),
                },
                Wrapper: props => {
                    return (
                        <div className="condition_item">
                            <div className="condition_x">{props.Components.x}</div>
                            <div className="condition_opt">{props.Components.operator}</div>
                            <div className="condition_y">{props.Components.y}</div>
                        </div>
                    )
                },
                valueHandler: (value, last) => {
                    if (value && last && value.x && last.x) {
                    }
                    return value
                },
            })
        } else if (value instanceof GroupCondition) {
            return new ObjectEditor<GroupCondition<Context>>({
                items: {
                    conditions: new ArrayEditor<Condition<Context>[]>({
                        Wrapper: props => {
                            return null
                        },
                        editor: new FuncEditor<Condition<Context>>({
                            cacheSize: 10,
                            func: fn,
                        }),
                    }),
                },
            })
        }
    }

    return fn(condition)
}
