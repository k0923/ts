import { useCallback, type FC } from 'react'
import { BaseEditor, type FormNode } from './editor'

export class CommonEditor<T = any> extends BaseEditor {
    private Comp: FC<{ value: T; onChange: (v: T) => void }>
    constructor({ Component }: { Component: FC<{ value: T; onChange: (v: T) => void }> }) {
        super()
        this.Comp = Component
    }
    build(): FormNode {
        return ({ path }) => {
            const handler = useCallback(
                (v: any) => {
                    this.setValue(path, v)
                },
                [path.path.flat().join('.')]
            )
            const value = this.useNode(path)
            const Comp = this.Comp
            return <Comp value={value} onChange={handler} />
        }
    }
}
