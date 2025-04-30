# @lami/x-client-transaction-id

用于X（前身为Twitter）API请求的客户端交易ID生成库

[![jsr](https://jsr.io/badges/@lami/x-client-transaction-id)](https://jsr.io/@lami/x-client-transaction-id)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[English](README.md) | [日本語](README_JA.md) | [中文](README_CN.md)

## 概述

该库提供了生成X（前身为Twitter）API请求所需的`x-client-transaction-id`头部值的功能。在向X API发送验证请求时，此交易ID是必需的。

## 安装

### 包管理器

#### NPM / PNPM / Yarn
```bash
# NPM
npx jsr add @lami/x-client-transaction-id

# PNPM
pnpm i jsr:@lami/x-client-transaction-id

# Yarn
yarn add jsr:@lami/x-client-transaction-id
```

#### Deno
```bash
deno add jsr:@lami/x-client-transaction-id
```

#### Bun
```bash
bunx jsr add @lami/x-client-transaction-id
```

### 导入

```ts
// import maps
import { ClientTransaction } from "jsr:@lami/x-client-transaction-id@0.1.0";
```

## 运行时兼容性

该库已在以下运行时环境中测试并确认可用：
- Node.js
- Deno
- Bun
- Cloudflare Workers

## 使用方法

### 基本示例

```ts
import { ClientTransaction, handleXMigration } from "@lami/x-client-transaction-id";

// 获取X主页HTML文档（使用实用函数）
const document = await handleXMigration();

// 创建并初始化ClientTransaction实例
const transaction = await ClientTransaction.create(document);

// 生成交易ID
const transactionId = await transaction.generateTransactionId(
  "GET", // HTTP方法
  "/1.1/jot/client_event.json" // API路径
);

console.log("Transaction ID:", transactionId);

// 在API请求中用作头部
const headers = {
  "x-client-transaction-id": transactionId,
  // 其他必需的头部
};

const apiResponse = await fetch("https://api.twitter.com/1.1/jot/client_event.json", {
  method: "GET",
  headers
});
```

### 手动获取文档

```ts
import { ClientTransaction } from "@lami/x-client-transaction-id";

// 获取Twitter主页HTML文档
const response = await fetch("https://twitter.com/");
const html = await response.text();
const parser = new DOMParser();
const document = parser.parseFromString(html, "text/html");

// 创建并初始化ClientTransaction实例
const transaction = new ClientTransaction(document);
await transaction.initialize();

// 生成交易ID
const transactionId = await transaction.generateTransactionId(
  "POST", // HTTP方法
  "/graphql/abcdefg/TweetDetail" // API路径
);
```

## 高级用法：稳定化交易ID生成

### 使用预生成的密钥对

您可以通过使用来自外部源的预生成密钥对（验证密钥和动画密钥）来稳定交易ID的生成：

```ts
import { ClientTransaction, handleXMigration } from "@lami/x-client-transaction-id";

// 获取X主页HTML文档
const document = await handleXMigration();

// 创建并初始化ClientTransaction实例
const transaction = await ClientTransaction.create(document);

// 从外部源获取预生成的密钥对
const keyPairs = await (
  await fetch(
    "https://raw.githubusercontent.com/Lqm1/x-client-transaction-id-pair-dict/refs/heads/main/pair.json"
  )
).json();
const keyPair = keyPairs[Math.floor(Math.random() * keyPairs.length)];

// 使用固定密钥对生成交易ID
const transactionId = await transaction.generateTransactionId(
  "GET",
  "/1.1/jot/client_event.json",
  undefined,
  keyPair.verification,
  keyPair.animationKey
);
```

### 风险警告

使用预生成或固定的密钥对存在潜在风险：
- 密钥和动画密钥是在浏览器内部计算的值，共享或使用固定值可能会使您面临被列入黑名单的风险。
- 如果共享或固定的密钥对被X列入黑名单，可能会导致账户暂停或锁定。
- X可能随时更改其验证系统，可能会使预生成的密钥失效。

### 建议

1. **更安全的选择**：分叉密钥对生成仓库并生成您自己的唯一密钥对。
2. **默认选择**：不指定密钥，使用包的内置生成过程（如基本示例中所示）。

### 方法比较

| 方法 | 优势 | 劣势 |
|----------|------------|---------------|
| 使用预生成密钥 | 更稳定的x-client-transaction-id生成 | 如果密钥被广泛共享，则有被列入黑名单的风险 |
| 内置生成 | 完全唯一的密钥和动画密钥 | 方法可能不太稳定，可能降低请求成功率 |

### 为什么包内部生成不稳定？

包内部生成方法的不稳定主要是由于animationKey的生成过程可能不稳定。animationKey的生成依赖于浏览器中的动画计算，这些计算可能会因环境、运行时或其他因素而变化，导致生成的密钥对不一致或无效。这可能会导致API请求失败（通常是404错误）。

如果在使用内置生成方法时遇到404错误，建议实现重试机制。

**我们欢迎您对改进animationKey生成算法的贡献！如果您有任何想法或改进，请随时提交拉取请求（PR）。**

## 主要功能

- `ClientTransaction`：用于生成X API请求交易ID的主类
- `handleXMigration`：从X（Twitter）主页检索DOM文档的实用函数
- `Cubic`：用于动画键生成的三次插值计算类
- `interpolate`/`interpolateNum`：值插值的实用函数
- `convertRotationToMatrix`：将旋转值转换为矩阵的函数
- 其他实用函数：`floatToHex`, `isOdd`, `encodeBase64`, `decodeBase64`

## API参考

### `ClientTransaction`

处理X客户端交易的主类。

#### 构造函数

```ts
constructor(homePageDocument: Document)
```

- `homePageDocument`：Twitter主页的DOM文档

#### 方法

- `async initialize()`：初始化实例（必须在构造函数之后调用）
- `static async create(homePageDocument: Document): Promise<ClientTransaction>`：创建已初始化实例的静态工厂方法
- `async generateTransactionId(method: string, path: string, ...): Promise<string>`：为指定的HTTP方法和API路径生成交易ID

### `handleXMigration`

```ts
async function handleXMigration(): Promise<Document>
```

检索X（Twitter）主页并返回DOM解析的Document对象。这使得获取ClientTransaction初始化所需的文档变得容易。

## 免责声明

本库按"原样"提供，不提供任何形式的明示或暗示的保证，包括但不限于对适销性、特定目的的适用性和非侵权性的保证。在任何情况下，作者或版权所有者均不对任何索赔、损害或其他责任负责，无论是在合同诉讼、侵权行为或其他方面，由库或库的使用或其他交易引起或与之相关。

这是一个非官方库，未与X Corp.（前身为Twitter, Inc.）关联、认可或赞助。所有与X/Twitter相关的商标和版权均归X Corp.所有。本项目仅供教育和个人使用。本库的用户有责任确保其使用符合X的服务条款和开发者政策。

## 许可证

MIT