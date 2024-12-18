class MathUtils {
    // 静态属性
    static PI = 3.14159;
    static version = '1.0.0';

    // 静态方法
    static add(x: number, y: number): number {
        return x + y;
    }

    // 静态方法可以访问其他静态成员
    static calculateCircleArea(radius: number): number {
        return MathUtils.PI * radius * radius;
    }

    // 静态工厂方法
    static createPoint(x: number, y: number): Point {
        return new Point(x, y);
    }

    // 普通实例方法（不能在静态方法中直接访问）
    multiply(x: number): number {
        return x * MathUtils.PI; // 实例方法可以访问静态成员
    }
}

class Point {
    constructor(public x: number, public y: number) {}

    // 静态方法用于对象创建
    static origin(): Point {
        return new Point(0, 0);
    }

    // 静态方法用于对象操作
    static distance(p1: Point, p2: Point): number {
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // 实例方法
    distanceTo(other: Point): number {
        // 实例方法可以调用静态方法
        return Point.distance(this, other);
    }
}

// 使用示例
console.log('静态属性访问:');
console.log('PI:', MathUtils.PI);
console.log('Version:', MathUtils.version);

console.log('\n静态方法调用:');
console.log('Add:', MathUtils.add(5, 3));
console.log('Circle Area:', MathUtils.calculateCircleArea(2));

// 使用静态工厂方法创建对象
const point1 = MathUtils.createPoint(3, 4);
const point2 = Point.origin();

console.log('\n点操作:');
console.log('Point 1:', point1);
console.log('Origin:', point2);
console.log('Distance:', Point.distance(point1, point2));
console.log('Distance (instance method):', point1.distanceTo(point2));

// 继承中的静态方法
class AdvancedMath extends MathUtils {
    static multiply(x: number, y: number): number {
        // 可以访问父类的静态方法
        return super.add(x, 0) * y;
    }
}

console.log('\n继承静态方法:');
console.log('Advanced Math PI:', AdvancedMath.PI); // 继承静态属性
console.log('Advanced Math Multiply:', AdvancedMath.multiply(2, 3));
