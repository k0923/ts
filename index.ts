interface Producer<out T = any> {
    produce(test:T):T | undefined
}

class Animal {}
class Dog extends Animal {}

let dogProducer: Producer<Dog> = {
    produce: () => new Dog()
};
let animalProducer: Producer<Animal> = dogProducer;