class Person {
    constructor(name, age, birthDate) {
        this.name = name;
        this.age = age;
        this.birthDate = new Date(birthDate);
        this._privateData = "This should not be serialized";
    }

    // 自定义 JSON 序列化方法
    toJSON() {
        return {
            name: this.name,
            age: this.age,
            birthDate: this.birthDate.toISOString(),
            // 注意这里没有包含 _privateData
        };
    }
}

// 创建实例并测试
const person = new Person("Alice", 30, "1994-01-15");

// 测试 JSON 序列化
console.log("JSON 序列化结果:");
console.log(JSON.stringify(person, null, 2));

// 如果不实现 toJSON，默认会序列化所有可枚举属性
class SimpleClass {
    constructor(name) {
        this.name = name;
        this._private = "private";
    }
}

const simpleObj = new SimpleClass("Bob");
console.log("\n默认序列化结果:");
console.log(JSON.stringify(simpleObj, null, 2));
