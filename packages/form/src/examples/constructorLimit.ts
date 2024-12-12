// Example of limiting constructor access in TypeScript

// Interface with private constructor pattern
interface Singleton {
    getValue(): string;
}

// Implementation with private constructor
class SingletonImpl implements Singleton {
    private static instance: SingletonImpl;
    private constructor() {} // Private constructor

    public static getInstance(): Singleton {
        if (!SingletonImpl.instance) {
            SingletonImpl.instance = new SingletonImpl();
        }
        return SingletonImpl.instance;
    }

    getValue(): string {
        return "I am a singleton!";
    }
}

// Example with protected constructor
interface BaseInterface {
    getData(): number;
}

abstract class BaseClass implements BaseInterface {
    protected constructor() {} // Protected constructor
    abstract getData(): number;
}

class DerivedClass extends BaseClass {
    constructor() {
        super();
    }

    getData(): number {
        return 42;
    }
}

// Usage examples
const singleton = SingletonImpl.getInstance();
console.log(singleton.getValue()); // "I am a singleton!"

const derived = new DerivedClass();
console.log(derived.getData()); // 42

// This would cause a compile error:
// const base = new BaseClass(); // Error: Cannot create an instance of an abstract class
// const singletonDirect = new SingletonImpl(); // Error: Constructor is private
