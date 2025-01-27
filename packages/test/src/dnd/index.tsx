import { closestCenter, DndContext, DragOverlay, useDndContext } from '@dnd-kit/core'
import { forwardRef, useState } from 'react'
import { Draggable } from './Draggable'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { Droppable } from './Droppable'
import './index.less'
import { Button } from '@arco-design/web-react'

export const dragOverlayItem = atom<React.ReactNode>(null)

function DragOverlayItem() {
    const item = useAtomValue(dragOverlayItem)
    return <DragOverlay dropAnimation={null}>{item}</DragOverlay>
}

export default function () {
    const setItem = useSetAtom(dragOverlayItem)
    const [items, setItems] = useState<string[]>([])

    return (
        <DndContext
            // collisionDetection={args => {
            //     const result = closestCenter(args)
            //     console.log(result)
            //     return result
            // }}
            onDragStart={e => {
                setItem(<Button>Drag Me</Button>)
            }}
            // onDragOver={e => {
            //     console.log(e)
            // }}
            onDragEnd={e => {
                if (e.over) {
                    setItems(last => {
                        return [...last, `test${last.length}`]
                    })
                }
            }}
        >
            <div className="main">
                <div className="draggable">
                    <Draggable id="draggable1" data={{}}>
                        <Button>Drag Me</Button>
                    </Draggable>
                </div>
                <div className="dropable">
                    <Droppable id="draggable" data={{}}>
                        {items.map(it => {
                            return (
                                <Button className={'item'} style={{ width: '100%' }} key={it}>
                                    {it}
                                </Button>
                            )
                        })}
                    </Droppable>
                </div>
            </div>
            <DragOverlayItem />
        </DndContext>
    )
}
