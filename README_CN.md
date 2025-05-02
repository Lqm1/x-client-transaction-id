# x-client-transaction-id

用于X（前身为Twitter）API请求的客户端交易ID生成库

[![jsr](https://jsr.io/badges/@lami/x-client-transaction-id)](https://jsr.io/@lami/x-client-transaction-id)
[![npm](https://img.shields.io/npm/v/x-client-transaction-id)](https://www.npmjs.com/package/x-client-transaction-id)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[English](README.md) | [日本語](README_JA.md) | [中文](README_CN.md)

## 概述

该库提供了生成X（前身为Twitter）API请求所需的`x-client-transaction-id`头部值的功能。在向X API发送验证请求时，此交易ID是必需的。

## 安装

### 包管理器

#### NPM / PNPM / Yarn
```bash
# NPM
npm i x-client-transaction-id

# PNPM
pnpm i x-client-transaction-id

# Yarn
yarn add x-client-transaction-id
```

#### Deno
```bash
deno add npm:x-client-transaction-id
```

#### Bun
```bash
bun add x-client-transaction-id
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
import { ClientTransaction, handleXMigration } from "x-client-transaction-id";

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
import { ClientTransaction } from "x-client-transaction-id";

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