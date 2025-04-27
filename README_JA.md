# @lami/x-client-transaction-id

X（旧Twitter）APIリクエスト用のクライアントトランザクションID生成ライブラリ

[![jsr](https://jsr.io/badges/@lami/x-client-transaction-id)](https://jsr.io/@lami/x-client-transaction-id)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 概要

このライブラリは、X（旧Twitter）のAPIリクエストで必要となる`x-client-transaction-id`ヘッダーの値を生成するための機能を提供します。このトランザクションIDは、X APIに対する認証済みリクエストを行う際に必要となります。

## インストール

### JSR（Deno）

```ts
// import maps
import { ClientTransaction } from "jsr:@lami/x-client-transaction-id@0.1.0";
```

## 使用方法

### 基本的な使用例

```ts
import { ClientTransaction, handleXMigration } from "@lami/x-client-transaction-id";

// XのホームページのHTMLドキュメントを取得（ユーティリティ関数を使用）
const document = await handleXMigration();

// ClientTransactionのインスタンスを作成と初期化
const transaction = await ClientTransaction.create(document);

// トランザクションIDを生成
const transactionId = await transaction.generateTransactionId(
  "GET", // HTTPメソッド
  "/1.1/jot/client_event.json" // APIパス
);

console.log("Transaction ID:", transactionId);

// APIリクエスト時にヘッダーとして使用
const headers = {
  "x-client-transaction-id": transactionId,
  // その他の必要なヘッダー
};

const apiResponse = await fetch("https://api.twitter.com/1.1/jot/client_event.json", {
  method: "GET",
  headers
});
```

### 手動でのドキュメント取得

```ts
import { ClientTransaction } from "@lami/x-client-transaction-id";

// TwitterのホームページのHTMLドキュメントを取得
const response = await fetch("https://twitter.com/");
const html = await response.text();
const parser = new DOMParser();
const document = parser.parseFromString(html, "text/html");

// ClientTransactionのインスタンスを作成と初期化
const transaction = new ClientTransaction(document);
await transaction.initialize();

// トランザクションIDを生成
const transactionId = await transaction.generateTransactionId(
  "POST", // HTTPメソッド
  "/i/api/graphql/abcdefg/TweetDetail" // APIパス
);
```

## 主要な機能

- `ClientTransaction`: X APIリクエスト用のトランザクションIDを生成するメインクラス
- `handleXMigration`: X（Twitter）のホームページのDOMドキュメントを取得するユーティリティ関数
- `Cubic`: アニメーションキー生成のための3次補間計算を行うクラス
- `interpolate`/`interpolateNum`: 値の補間を行うユーティリティ関数
- `convertRotationToMatrix`: 回転値を行列に変換する関数
- その他ユーティリティ関数: `floatToHex`, `isOdd`, `encodeBase64`, `decodeBase64`

## APIリファレンス

### `ClientTransaction`

Xのクライアントトランザクションを処理するメインクラスです。

#### コンストラクタ

```ts
constructor(homePageDocument: Document)
```

- `homePageDocument`: TwitterのホームページのDOMドキュメント

#### メソッド

- `async initialize()`: インスタンスを初期化します（コンストラクタ後に必ず呼び出す必要があります）
- `static async create(homePageDocument: Document): Promise<ClientTransaction>`: 初期化済みのインスタンスを作成する静的ファクトリメソッド
- `async generateTransactionId(method: string, path: string, ...): Promise<string>`: 指定されたHTTPメソッドとAPIパスに対するトランザクションIDを生成

### `handleXMigration`

```ts
async function handleXMigration(): Promise<Document>
```

X（Twitter）のホームページを取得し、DOMパースしたDocumentオブジェクトを返します。ClientTransactionの初期化に必要なドキュメントを簡単に取得できます。

## ライセンス

MIT