type DiffPath = {
    path: (string | number)[]
    oldValue: any
    newValue: any
}

function diff(oldObj: any, newObj: any): DiffPath[] {
    const differences: DiffPath[] = []

    function compare(path: (string | number)[], oldValue: any, newValue: any) {
        // 如果值相等或都是 null/undefined，直接返回
        if (oldValue === newValue) return
        if (oldValue == null && newValue == null) return

        // 如果类型不同，记录整个路径的差异
        if (
            typeof oldValue !== typeof newValue ||
            Array.isArray(oldValue) !== Array.isArray(newValue)
        ) {
            differences.push({ path, oldValue, newValue })
            return
        }

        // 如果是基本类型且不相等
        if (typeof oldValue !== 'object') {
            differences.push({ path, oldValue, newValue })
            return
        }

        // 处理对象或数组
        const allKeys = new Set([...Object.keys(oldValue || {}), ...Object.keys(newValue || {})])

        for (const key of allKeys) {
            // 转换数组索引为数字类型
            const newPath = [...path]
            if (Array.isArray(oldValue) || Array.isArray(newValue)) {
                newPath.push(Number(key))
            } else {
                newPath.push(key)
            }

            compare(newPath, oldValue?.[key], newValue?.[key])
        }
    }

    compare([], oldObj, newObj)
    return differences
}

// 测试用例
const oldData = {
    name: 'John',
    age: 30,
    address: {
        city: 'New York',
        street: 'Broadway',
    },
    hobbies: ['reading', 'music'],
    scores: [
        { subject: 'math', score: 90 },
        { subject: 'english', score: 85 },
    ],
}

const newData = {
    name: 'John',
    age: 31,
    address: {
        city: 'Boston',
        street: 'Broadway',
    },
    hobbies: ['reading', 'gaming'],
    scores: [
        { subject: 'math', score: 95 },
        { subject: 'english', score: 85 },
    ],
}

console.log(diff(oldData, newData))
// 输出:
// [
//   { path: ['age'], oldValue: 30, newValue: 31 },
//   { path: ['address', 'city'], oldValue: 'New York', newValue: 'Boston' },
//   { path: ['hobbies', 1], oldValue: 'music', newValue: 'gaming' },
//   { path: ['scores', 0, 'score'], oldValue: 90, newValue: 95 }
// ]

// 测试特殊情况
console.log(diff({ a: [1, { b: 2 }] }, { a: [1, { b: 3 }] }))
// 输出: [{ path: ['a', 1, 'b'], oldValue: 2, newValue: 3 }]

console.log(diff({ a: { b: 1 } }, { a: [1, 2] }))
// 输出: [{ path: ['a'], oldValue: { b: 1 }, newValue: [1, 2] }]

console.log(diff({ arr: [1, 2, 3] }, { arr: [1, 4, 3] }))
// 现在输出的 path 中的数组索引是 number 类型
// [{ path: ['arr', 1], oldValue: 2, newValue: 4 }]

// 验证类型
const result = diff({ arr: [1, { x: 1 }] }, { arr: [1, { x: 2 }] })
console.log(typeof result[0].path[1] === 'number') // true
