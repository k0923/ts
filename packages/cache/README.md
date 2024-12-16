# Frontend Cache

一个轻量级的前端缓存解决方案，提供内存存储，具有类型安全和可扩展的特性。

## 特性

- 🚀 内存缓存支持
- 💪 完整的 TypeScript 类型支持
- 🔄 支持自定义缓存过期策略
- 🎯 支持自定义键值转换
- 🛡️ 防止缓存穿透
- 🔌 可扩展的存储接口

## 安装

```bash
npm install @k0923/cache
```

## 快速开始

### 基础用法

```typescript
import { createCacheObj, NewMapStore } from '@k0923/cache';

// 定义缓存配置
const cacheHub = {
  user: {
    provider: async (last, key) => {
      // 获取用户数据的逻辑
      return await fetchUserData(key);
    },
    store: NewMapStore(new Map(), key => key)  // 使用内存存储
  },
  posts: {
    provider: async (last, key) => {
      // 获取文章数据的逻辑
      return await fetchPosts(key);
    },
    store: NewMapStore(new Map(), key => key)  // 使用内存存储
  }
};

// 创建缓存实例
const cache = createCacheObj(cacheHub);

// 使用缓存
await cache.user.get('123');  // 获取用户数据
await cache.posts.get('recent');  // 获取文章数据
```

### 缓存过期策略

```typescript
import { expireFetch } from '@k0923/cache';

const cacheHub = {
  user: {
    // 设置 5 分钟过期时间
    provider: expireFetch(async (last, key) => {
      return await fetchUserData(key);
    }, 5 * 60 * 1000),
    store: NewMapStore(new Map(), key => key)
  }
};
```

## API 文档

### createCacheObj(config: CacheHub)

创建一个缓存对象，返回一个代理对象，可以通过配置的 key 直接访问对应的缓存实例。

### Store 接口

- `get(key: string)`: 获取缓存数据
- `set(key: string, value: CacheData)`: 设置缓存数据
- `delete(key: string)`: 删除缓存数据
- `clear()`: 清空所有缓存
- `convert(key: IOKey)`: 转换缓存键

### 内置存储实现

#### NewMapStore(map: Map, convert: Function)

创建基于内存 Map 的存储实现。

- `map`: Map 实例
- `convert`: 键转换函数

### 工具函数

#### expireFetch(provider: Provider, milliseconds: number)

创建一个带有过期时间的提供者函数。

- `provider`: 原始提供者函数
- `milliseconds`: 过期时间（毫秒）

## 最佳实践

1. 对于需要在页面刷新后保持的数据，建议自行实现持久化存储
2. 合理设置缓存过期时间，避免数据过期问题
3. 使用 TypeScript 以获得更好的类型提示和安全性

## 许可证

MIT