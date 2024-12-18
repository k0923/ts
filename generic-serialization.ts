// 定义一个序列化接口
interface Serializable<T> {
    serialize(): string;
    deserialize(data: string): T;
}

// 创建一个泛型序列化基类
abstract class SerializableBase<T> implements Serializable<T> {
    serialize(): string {
        return JSON.stringify(this.toJSON());
    }

    abstract deserialize(data: string): T;

    protected abstract toJSON(): any;
}

// 示例：使用泛型序列化的用户类
class User extends SerializableBase<User> {
    constructor(
        public name: string,
        public age: number,
        public email: string
    ) {
        super();
    }

    protected toJSON() {
        return {
            name: this.name,
            age: this.age,
            email: this.email
        };
    }

    deserialize(data: string): User {
        const obj = JSON.parse(data);
        return new User(obj.name, obj.age, obj.email);
    }
}

// 示例：使用泛型序列化的配置类
class Config<T> extends SerializableBase<Config<T>> {
    constructor(
        public settings: T,
        public version: string
    ) {
        super();
    }

    protected toJSON() {
        return {
            settings: this.settings,
            version: this.version
        };
    }

    deserialize(data: string): Config<T> {
        const obj = JSON.parse(data);
        return new Config<T>(obj.settings, obj.version);
    }
}

// 使用示例
const user = new User("Alice", 30, "alice@example.com");
const serializedUser = user.serialize();
console.log("序列化的用户:", serializedUser);

const newUser = new User("", 0, "").deserialize(serializedUser);
console.log("反序列化的用户:", newUser);

// 使用泛型配置类示例
interface AppSettings {
    theme: string;
    language: string;
}

const config = new Config<AppSettings>(
    { theme: "dark", language: "zh-CN" },
    "1.0.0"
);

const serializedConfig = config.serialize();
console.log("序列化的配置:", serializedConfig);

const newConfig = new Config<AppSettings>({ theme: "", language: "" }, "").deserialize(serializedConfig);
console.log("反序列化的配置:", newConfig);
