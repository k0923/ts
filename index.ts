function Test({ name, age }: { name: string; age: number }) {
    console.log(name, age)
}

Test({ name: 'hello', age: 12 })

function Test1({ name, age }: { name: string; age: number }) {
    Test({ name, age: 0 })
}

Test1({ name: 'hello', age: 12 })
