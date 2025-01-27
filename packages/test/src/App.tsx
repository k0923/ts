import { Form, Input, InputNumber } from '@arco-design/web-react'
import { Builder, InputWidget, WidgetHub, WidgetList } from './cardbuilder/widget'
import Test from './dnd'
const hub = new WidgetHub()
hub.register(new InputWidget())
import { atom, useAtom, useAtomValue } from 'jotai'
import { SortTest } from './dnd/Sort'
import { DndTest, MultipleSortableContexts } from './dndtest'

const peopleAtom = atom({
    name: 'hello',
    age: 11,
})

const nameAtom = atom(
    get => get(peopleAtom).name,
    (get, set, newPrice) => {
        set(peopleAtom, d => {
            return {
                ...d,
                name: newPrice,
            }
        })
    }
)

const ageAtom = atom(
    get => get(peopleAtom).age,
    (get, set, newPrice) => {
        set(peopleAtom, d => {
            return {
                ...d,
                age: newPrice,
            }
        })
    }
)

function Name() {
    const [name, setName] = useAtom(nameAtom)
    console.log('hit name')
    return (
        <Form.Item label="Name">
            <Input value={name} onChange={setName} />
        </Form.Item>
    )
}

function Age() {
    console.log('hit age')
    const [value, setValue] = useAtom(ageAtom)
    return (
        <Form.Item label="Name">
            <InputNumber value={value} onChange={setValue} />
        </Form.Item>
    )
}

function Total() {
    console.log('hit total')
    const value = useAtomValue(peopleAtom)
    return <pre>{JSON.stringify(value)}</pre>
}
function App() {
    // return <Test />
    // return <MultipleSortableContexts />
    return <DndTest />
    return <SortTest />
    // return (
    //     <>
    //         <Name />
    //         <Age />
    //         <Total />
    //     </>
    // )
    // const [lowercaseText, setLowercaseText] = useAtom(textAtom)
    // const [uppercaseText] = useAtom(uppercase)
    // const handleChange = (e: any) => setLowercaseText(e.target.value)
    // return (
    //     <>
    //         <div className="app">
    //             <input value={lowercaseText} onChange={handleChange} />
    //             <h1>{uppercaseText}</h1>
    //         </div>
    //         <B />
    //     </>
    // )
}

function B() {
    const [uppercaseText] = useAtom(uppercase)
    return <h1>{uppercaseText}</h1>
}

export default App
