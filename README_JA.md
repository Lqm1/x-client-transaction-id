# @lami/x-client-transaction-id

X（旧Twitter）APIリクエスト用のクライアントトランザクションID生成ライブラリ

[![jsr](https://jsr.io/badges/@lami/x-client-transaction-id)](https://jsr.io/@lami/x-client-transaction-id)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[English](README.md) | [日本語](README_JA.md) | [中文](README_CN.md)

## 概要

このライブラリは、X（旧Twitter）のAPIリクエストで必要となる`x-client-transaction-id`ヘッダーの値を生成するための機能を提供します。このトランザクションIDは、X APIに対する認証済みリクエストを行う際に必要となります。

## インストール

### パッケージマネージャー

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

### インポート

```ts
// import maps
import { ClientTransaction } from "jsr:@lami/x-client-transaction-id@0.1.0";
```

## ランタイム互換性

このライブラリは以下のランタイムでの動作が確認されています：
- Node.js
- Deno
- Bun
- Cloudflare Workers

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
  "/graphql/abcdefg/TweetDetail" // APIパス
);
```

## 高度な使用方法：トランザクションID生成の安定化

### 事前生成されたキーペアの使用

外部ソースから事前生成されたキーペア（検証キーとアニメーションキー）を使用して、トランザクションIDの生成を安定化させることができます：

```ts
import { ClientTransaction, handleXMigration } from "@lami/x-client-transaction-id";

// XのホームページのHTMLドキュメントを取得
const document = await handleXMigration();

// ClientTransactionのインスタンスを作成と初期化
const transaction = await ClientTransaction.create(document);

// 外部ソースから事前生成されたキーペアを取得
const keyPairs = await (
  await fetch(
    "https://raw.githubusercontent.com/Lqm1/x-client-transaction-id-pair-dict/refs/heads/main/pair.json"
  )
).json();
const keyPair = keyPairs[Math.floor(Math.random() * keyPairs.length)];

// 固定キーペアでトランザクションIDを生成
const transactionId = await transaction.generateTransactionId(
  "GET",
  "/1.1/jot/client_event.json",
  undefined,
  keyPair.verification,
  keyPair.animationKey
);
```

### リスクに関する警告

事前生成された、または固定されたキーペアを使用することには潜在的なリスクが伴います：
- キーとアニメーションキーはブラウザ内で計算される値であり、これらの値を共有したり固定化したりすることでブラックリストに登録される可能性があります。
- 共有または固定化されたキーペアがXによってブラックリストに登録された場合、アカウントの停止やロックを引き起こす場合があります。
- Xは検証システムをいつでも変更する可能性があり、事前生成されたキーが無効になる可能性があります。

### 推奨事項

1. **より安全なオプション**：キーペア生成リポジトリをフォークして、独自の一意のキーペアを生成する。
2. **デフォルトオプション**：キーを指定せず、パッケージの組み込み生成プロセスを使用する（基本的な使用例に示されているとおり）。

### アプローチの比較

| アプローチ | メリット | デメリット |
|----------|------------|---------------|
| 事前生成されたキーの使用 | より安定したx-client-transaction-idの生成 | キーが広く共有された場合、ブラックリスト登録のリスク |
| 組み込み生成 | 完全に一意のキーとアニメーションキー | メソッドの安定性が低く、リクエストの成功率が下がる可能性がある |

### なぜパッケージ内部での生成が不安定なのか？

組み込み生成方法の不安定性は、主にanimationKeyの生成プロセスにおける潜在的な不整合によるものです。animationKeyの生成はブラウザ内のアニメーション計算に依存しており、これらは環境、ランタイム、またはその他の要因によって異なる場合があり、不整合または無効なキーペアが生成される可能性があります。これによりAPIリクエストの失敗（一般的に404エラー）が発生する場合があります。

組み込み生成方法を使用して404エラーが発生した場合は、リトライメカニズムの実装をお勧めします。

**animationKey生成アルゴリズムの改善に関する貢献を歓迎します！アイデアや改善点がありましたら、プルリクエストを提出してください。**

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

## 免責事項

このライブラリは、明示または黙示を問わず、商品性、特定目的への適合性、および非侵害性の保証を含むがこれに限定されない、いかなる種類の保証もなく「現状のまま」提供されています。著者または著作権所有者は、契約行為、不法行為、またはそれ以外であっても、ライブラリまたはライブラリの使用またはその他の取引から生じる、いかなるクレーム、損害、またはその他の責任について責任を負いません。

これは非公式のライブラリであり、X Corp.（旧Twitter, Inc.）と提携、承認、またはスポンサーされているものではありません。X/Twitterに関連するすべての商標および著作権はX Corp.に帰属します。このプロジェクトは教育および個人使用のみを目的としています。このライブラリのユーザーは、使用がXの利用規約および開発者ポリシーに準拠していることを確認する責任があります。

## ライセンス

MIT