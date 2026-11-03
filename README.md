# x-client-transaction-id

Client Transaction ID generator library for X (formerly Twitter) API requests

[![jsr](https://jsr.io/badges/@lami/x-client-transaction-id)](https://jsr.io/@lami/x-client-transaction-id)
[![npm](https://img.shields.io/npm/v/x-client-transaction-id)](https://www.npmjs.com/package/x-client-transaction-id)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[English](README.md) | [日本語](README_JA.md) | [中文](README_CN.md)

## Overview

This library provides functionality to generate the `x-client-transaction-id`
header value required for X (formerly Twitter) API requests. This transaction ID
is necessary when making authenticated requests to X APIs.

## Installation

### npm

```bash
npm i x-client-transaction-id
pnpm i x-client-transaction-id
yarn add x-client-transaction-id
bun add x-client-transaction-id
```

### JSR

```bash
deno add jsr:@lami/x-client-transaction-id
npx jsr add @lami/x-client-transaction-id
bunx jsr add @lami/x-client-transaction-id
```

When installed from JSR, import the package as
`@lami/x-client-transaction-id`. Deno can also import it without installing:

```ts
import { ClientTransaction } from "jsr:@lami/x-client-transaction-id";
```

## Runtime Compatibility

This library has been tested and confirmed to work with the following runtimes:

- Node.js
- Deno
- Bun
- Cloudflare Workers

## Usage

### Basic Example

```ts
import { ClientTransaction, fetchXDocument } from "x-client-transaction-id";

// Get the X responsive web app document (using utility function)
const document = await fetchXDocument();

// Create and initialize ClientTransaction instance
const transaction = await ClientTransaction.create(document);

// Generate a transaction ID
const transactionId = await transaction.generateTransactionId(
  "GET", // HTTP method
  "/1.1/jot/client_event.json", // API path
);

console.log("Transaction ID:", transactionId);

// Use as a header in API requests
const headers = {
  "x-client-transaction-id": transactionId,
  // Other required headers
};

const apiResponse = await fetch(
  "https://api.twitter.com/1.1/jot/client_event.json",
  {
    method: "GET",
    headers,
  },
);
```

### Manual Document Retrieval

```ts
import { ClientTransaction } from "x-client-transaction-id";

// Get the X responsive web app document
const response = await fetch("https://x.com/i/jf/");
const html = await response.text();
const parser = new DOMParser();
const document = parser.parseFromString(html, "text/html");

// Create and initialize ClientTransaction instance
const transaction = new ClientTransaction(document);
await transaction.initialize();

// Generate a transaction ID
const transactionId = await transaction.generateTransactionId(
  "POST", // HTTP method
  "/graphql/abcdefg/TweetDetail", // API path
);
```

## Key Features

- `ClientTransaction`: Main class for generating transaction IDs for X API
  requests
- `fetchXDocument`: Utility function to retrieve the DOM document from the X
  responsive web app
- `handleXMigration` *(deprecated)*: Alias for `fetchXDocument`, retained for
  backward compatibility
- `Cubic`: Class for cubic interpolation calculations used in animation key
  generation
- `interpolate`/`interpolateNum`: Utility functions for value interpolation
- `convertRotationToMatrix`: Function to convert rotation values to matrices
- Other utility functions: `floatToHex`, `isOdd`, `matrixNumbers`,
  `encodeBase64`, `decodeBase64`

## API Reference

### `ClientTransaction`

Main class for handling X client transactions.

#### Constructor

```ts
constructor(homePageDocument: Document)
```

- `homePageDocument`: The DOM document from the X responsive web app

#### Methods

- `async initialize()`: Initialize the instance (must be called after
  constructor)
- `static async create(homePageDocument: Document): Promise<ClientTransaction>`:
  Static factory method that creates an initialized instance
- `async generateTransactionId(method: string, path: string, ...): Promise<string>`:
  Generate a transaction ID for the specified HTTP method and API path

### `fetchXDocument`

```ts
async function fetchXDocument(): Promise<Document>;
```

Retrieves the X responsive web app and returns a DOM-parsed Document object.
This makes it easy to get the document needed for ClientTransaction
initialization.

> [!NOTE]
> `handleXMigration` is a deprecated alias for `fetchXDocument` and is retained
> only for backward compatibility. Prefer `fetchXDocument` in new code.

## Development

This repository uses [Bun](https://bun.sh).

```bash
bun install
bun run test:unit  # unit tests
bun test           # unit tests plus a live test against X's API
bun run lint       # Biome
bun run typecheck
bun run build      # builds the npm package into dist/
```

To release, run `bun pm version <patch|minor|major>`. It bumps the version in
both `package.json` and `jsr.json`, then commits and tags the change. The JSR
workflow publishes each new version that reaches `main`, and pushing the tag
publishes it to npm.

## Disclaimer

This library is provided "as is" without warranty of any kind, either express or
implied, including but not limited to the warranties of merchantability, fitness
for a particular purpose, and non-infringement. In no event shall the authors or
copyright holders be liable for any claim, damages, or other liability, whether
in an action of contract, tort or otherwise, arising from, out of, or in
connection with the library or the use or other dealings in the library.

This is an unofficial library and is not affiliated with, endorsed, or sponsored
by X Corp. (formerly Twitter, Inc.). All X/Twitter-related trademarks and
copyrights belong to X Corp. This project is intended for educational and
personal use only. Users of this library are responsible for ensuring their
usage complies with X's terms of service and developer policies.

## License

MIT
