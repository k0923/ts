// 1. Symbol 的基本创建和唯一性
const sym1 = Symbol('my symbol');
const sym2 = Symbol('my symbol');
console.log('Symbol 唯一性测试:', sym1 === sym2);  // false
console.log('Symbol 描述:', sym1.description);     // 'my symbol'

// 2. 作为对象的唯一键
const PRIVATE_PROPERTY = Symbol('privateData');
const CONFIG_KEY = Symbol('config');

class MyClass {
    constructor(publicData, privateData) {
        this.publicData = publicData;
        this[PRIVATE_PROPERTY] = privateData;  // 使用 Symbol 作为属性键
    }

    getPrivateData() {
        return this[PRIVATE_PROPERTY];
    }
}

const obj = new MyClass('public', 'secret');
console.log('\n对象的 Symbol 属性:');
console.log('公开数据:', obj.publicData);
console.log('私有数据:', obj.getPrivateData());
console.log('直接枚举不会显示 Symbol 属性:', Object.keys(obj));
console.log('获取包含 Symbol 的所有属性:', Object.getOwnPropertySymbols(obj));

// 3. Symbol.for() - 全局 Symbol 注册表
const globalSym1 = Symbol.for('globalSymbol');
const globalSym2 = Symbol.for('globalSymbol');
console.log('\n全局 Symbol 测试:', globalSym1 === globalSym2);  // true

// 4. 内置 Symbol 值的使用
const myIterable = {
    // 使用 Symbol.iterator 定义自定义迭代行为
    [Symbol.iterator]: function* () {
        yield 1;
        yield 2;
        yield 3;
    }
};

console.log('\n自定义迭代器:');
for (const value of myIterable) {
    console.log(value);
}

// 5. Symbol 用于防止属性名冲突
const lib1 = {
    [Symbol('id')]: 1,
    process() { console.log('lib1 processing'); }
};

const lib2 = {
    [Symbol('id')]: 2,
    process() { console.log('lib2 processing'); }
};

// 6. Symbol 在元编程中的应用
const myObject = {
    [Symbol.toPrimitive](hint) {
        if (hint === 'number') return 42;
        if (hint === 'string') return 'Hello';
        return true;
    }
};

console.log('\n元编程示例:');
console.log('转换为数字:', +myObject);    // 42
console.log('转换为字符串:', String(myObject));  // "Hello"
console.log('转换为布尔:', Boolean(myObject));   // true
