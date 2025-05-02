# x-client-transaction-id

Client Transaction ID generator library for X (formerly Twitter) API requests

[![jsr](https://jsr.io/badges/@lami/x-client-transaction-id)](https://jsr.io/@lami/x-client-transaction-id)
[![npm](https://img.shields.io/npm/v/x-client-transaction-id)](https://www.npmjs.com/package/x-client-transaction-id)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[English](README.md) | [日本語](README_JA.md) | [中文](README_CN.md)

## Overview

This library provides functionality to generate the `x-client-transaction-id` header value required for X (formerly Twitter) API requests. This transaction ID is necessary when making authenticated requests to X APIs.

## Installation

### Package Managers

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

### Import

```ts
// import maps
import { ClientTransaction } from "jsr:@lami/x-client-transaction-id@0.1.0";
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
import { ClientTransaction, handleXMigration } from "x-client-transaction-id";

// Get the X homepage HTML document (using utility function)
const document = await handleXMigration();

// Create and initialize ClientTransaction instance
const transaction = await ClientTransaction.create(document);

// Generate a transaction ID
const transactionId = await transaction.generateTransactionId(
  "GET", // HTTP method
  "/1.1/jot/client_event.json" // API path
);

console.log("Transaction ID:", transactionId);

// Use as a header in API requests
const headers = {
  "x-client-transaction-id": transactionId,
  // Other required headers
};

const apiResponse = await fetch("https://api.twitter.com/1.1/jot/client_event.json", {
  method: "GET",
  headers
});
```

### Manual Document Retrieval

```ts
import { ClientTransaction } from "x-client-transaction-id";

// Get Twitter homepage HTML document
const response = await fetch("https://twitter.com/");
const html = await response.text();
const parser = new DOMParser();
const document = parser.parseFromString(html, "text/html");

// Create and initialize ClientTransaction instance
const transaction = new ClientTransaction(document);
await transaction.initialize();

// Generate a transaction ID
const transactionId = await transaction.generateTransactionId(
  "POST", // HTTP method
  "/graphql/abcdefg/TweetDetail" // API path
);
```

## Key Features

- `ClientTransaction`: Main class for generating transaction IDs for X API requests
- `handleXMigration`: Utility function to retrieve the DOM document from X (Twitter) homepage
- `Cubic`: Class for cubic interpolation calculations used in animation key generation
- `interpolate`/`interpolateNum`: Utility functions for value interpolation
- `convertRotationToMatrix`: Function to convert rotation values to matrices
- Other utility functions: `floatToHex`, `isOdd`, `encodeBase64`, `decodeBase64`

## API Reference

### `ClientTransaction`

Main class for handling X client transactions.

#### Constructor

```ts
constructor(homePageDocument: Document)
```

- `homePageDocument`: The DOM document from the Twitter homepage

#### Methods

- `async initialize()`: Initialize the instance (must be called after constructor)
- `static async create(homePageDocument: Document): Promise<ClientTransaction>`: Static factory method that creates an initialized instance
- `async generateTransactionId(method: string, path: string, ...): Promise<string>`: Generate a transaction ID for the specified HTTP method and API path

### `handleXMigration`

```ts
async function handleXMigration(): Promise<Document>
```

Retrieves the X (Twitter) homepage and returns a DOM-parsed Document object. This makes it easy to get the document needed for ClientTransaction initialization.

## Disclaimer

This library is provided "as is" without warranty of any kind, either express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose, and non-infringement. In no event shall the authors or copyright holders be liable for any claim, damages, or other liability, whether in an action of contract, tort or otherwise, arising from, out of, or in connection with the library or the use or other dealings in the library.

This is an unofficial library and is not affiliated with, endorsed, or sponsored by X Corp. (formerly Twitter, Inc.). All X/Twitter-related trademarks and copyrights belong to X Corp. This project is intended for educational and personal use only. Users of this library are responsible for ensuring their usage complies with X's terms of service and developer policies.

## License

MIT