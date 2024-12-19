interface Producer<out T = any> {
    produce(test:T):T | undefined
}

class Animal {}
class Dog extends Animal {
    hello() {
        console.log('hello')
    }
}

const fun = Dog.prototype.hello

Dog.prototype.hello = function() {
    fun.call(this)
    console.log(this)
}

let d = new Dog()
d.hello()
