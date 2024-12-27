interface User {
    name: string
    age: number
}

const u = new Proxy<User[]>([] as User[], {
    get(target, p) {
        console.log(typeof p)
        console.log(target, p)
    },
})

u[0]
