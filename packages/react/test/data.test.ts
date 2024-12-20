import { get } from '../src/utils/data'
import { describe, expect, test, beforeAll } from 'bun:test'

describe('get function', () => {
    // test('should return undefined for null/undefined paths', () => {
    //     expect(get({}, null as any)).toBe(undefined)
    //     expect(get({}, undefined as any)).toBe(undefined)
    //     expect(get({}, [])).toBe(undefined)
    // })

    test('should return undefined for null/undefined objects', () => {
        expect(get(null, ['a'])).toBe(undefined)
        expect(get(undefined, ['a'])).toBe(undefined)
    })

    test('should get value from simple object', () => {
        const obj = { a: 1, b: 2 }
        expect(get(obj, ['a'])).toBe(1)
        expect(get(obj, ['b'])).toBe(2)
        expect(get(obj, ['c'])).toBe(undefined)
    })

    test('should get value from nested object', () => {
        const obj = { a: { b: { c: 3 } } }
        expect(get(obj, ['a', 'b', 'c'])).toBe(3)
        expect(get(obj, ['a', 'b'])).toEqual({ c: 3 })
        expect(get(obj, ['a', 'x'])).toBe(undefined)
    })

    test('should get value from array', () => {
        const arr = [1, [2, 3], { a: 4 }]
        expect(get(arr, [0])).toBe(1)
        expect(get(arr, [1])).toEqual([2, 3])
        expect(get(arr, [1, 0])).toBe(2)
        expect(get(arr, [2, 'a'])).toBe(4)
    })

    test('should handle nested arrays and objects', () => {
        const complex = {
            users: [
                { id: 1, name: 'John' },
                { id: 2, name: 'Jane' },
            ],
        }
        expect(get(complex, ['users', 0, 'name'])).toBe('John')
        expect(get(complex, ['users', 1, 'id'])).toBe(2)
        expect(get(complex, ['users', 2])).toBe(undefined)
    })

    test('should handle flattened paths', () => {
        const obj = { a: { b: 1 } }
        expect(get(obj, [['a'], ['b']])).toBe(1)
        expect(get(obj, [['a', 'b']])).toBe(1)
    })
})
