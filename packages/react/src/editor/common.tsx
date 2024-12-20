import { useCallback, type FC } from 'react'
import { BaseEditor, type FormNode } from './editor'
import { Path } from './context'

export interface CommonEditorProps<T> {
    onChange: (v: T) => void
    path: Path
}

export class CommonEditor<T = any> extends BaseEditor {
    private Comp: FC<CommonEditorProps<T>>
    constructor({ Component }: { Component: FC<CommonEditorProps<T>> }) {
        super()
        this.Comp = Component
    }
    build(): FormNode {
        return props => {
            const { path } = props
            const handler = useCallback(
                (v: any) => {
                    this.setValue(path, v)
                },
                [path.path.flat().join('.')]
            )
            this.useVersion(path)
            const Comp = this.Comp
            return <Comp onChange={handler} path={path} />
        }
    }
}
