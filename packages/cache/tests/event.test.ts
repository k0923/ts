import { test } from 'vitest'
import { CreateEventHub } from '../src/event'


interface MentionEvent<T> {
    onSearch: string
    confirm: T
}

interface User {
    name: string
    age: number
}

export const myEvent = CreateEventHub<MentionEvent<User>>()

test('test event', () => {
    const myEvent = CreateEventHub<MentionEvent<User>>()

    myEvent.confirm.add((user) => {
        console.log(user)
    })

    myEvent.confirm({
        name: 'hello',
        age: 12,
    })

    myEvent.onSearch.add((search) => {
        console.log(search)
    })

    myEvent.onSearch('test 123')
})
