/**
 * Generation of the x-client-transaction-id header value.
 */
import { getAnimationKey } from "./animation.ts";
import { decodeBase64, encodeBase64 } from "./base64.ts";
import { ClientTransactionNotInitializedError } from "./errors.ts";
import {
  fetchKeyByteIndices,
  getAnimationFrameRows,
  getVerificationKey,
} from "./home-page.ts";

// Constants X's script mixes into every transaction ID
const KEYWORD = "obfiowerehiring";
const ADDITIONAL_RANDOM_NUMBER = 3;
// Transaction ID timestamps count seconds from 2023-05-01T07:00:00Z
const EPOCH_SECONDS = 1682924400;

interface TransactionKeys {
  keyBytes: number[];
  animationKey: string;
}

/**
 * Main class responsible for generating client transaction IDs
 * used in authenticated API requests to X
 */
export class ClientTransaction {
  private readonly homePageDocument: Document;
  private keys: TransactionKeys | null = null;

  /**
   * Creates a new ClientTransaction instance. Call {@link initialize}
   * before generating transaction IDs, or use
   * {@link ClientTransaction.create} to do both.
   * @param homePageDocument DOM Document object from X's responsive web app
   */
  constructor(homePageDocument: Document) {
    this.homePageDocument = homePageDocument;
  }

  /**
   * Static factory method that creates and initializes a ClientTransaction instance
   * @param homePageDocument DOM Document object from X's responsive web app
   * @returns Initialized ClientTransaction instance
   */
  static async create(homePageDocument: Document): Promise<ClientTransaction> {
    const instance = new ClientTransaction(homePageDocument);
    await instance.initialize();
    return instance;
  }

  /**
   * Reads the verification key and animation from the document, fetching
   * the ondemand chunk they depend on. Does nothing once it has succeeded.
   * @throws {ClientTransactionInitializationError} If the document or the
   *         ondemand chunk lacks the expected data.
   */
  async initialize(): Promise<void> {
    if (this.keys) {
      return;
    }
    const document = this.homePageDocument;
    const keyBytes = Array.from(decodeBase64(getVerificationKey(document)));
    const indices = await fetchKeyByteIndices(document);
    const frameRows = getAnimationFrameRows(document, keyBytes);
    this.keys = {
      keyBytes,
      animationKey: getAnimationKey(keyBytes, indices, frameRows),
    };
  }

  /**
   * Generates a transaction ID for X API requests
   * @param method HTTP method (GET, POST, etc.)
   * @param path API endpoint path
   * @param _response Unused; the document passed to the constructor is
   *                  always used. Kept for backward compatibility.
   * @param key Base64 verification key to use instead of the document's
   * @param animationKey Animation key to use instead of the document's
   * @param timeNow Seconds since 2023-05-01T07:00:00Z (defaults to now)
   * @returns Base64 encoded transaction ID with padding removed
   * @throws {ClientTransactionNotInitializedError} If called before
   *         {@link initialize}.
   */
  async generateTransactionId(
    method: string,
    path: string,
    _response?: Document,
    key?: string,
    animationKey?: string,
    timeNow?: number,
  ): Promise<string> {
    if (!this.keys) {
      throw new ClientTransactionNotInitializedError();
    }

    const time =
      timeNow ?? Math.floor((Date.now() - EPOCH_SECONDS * 1000) / 1000);
    const keyBytes = key ? Array.from(decodeBase64(key)) : this.keys.keyBytes;
    const data = `${method}!${path}!${time}${KEYWORD}${animationKey || this.keys.animationKey}`;
    const hash = new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(data)),
    );

    const randomByte = Math.floor(Math.random() * 256);
    const bytes = [
      ...keyBytes,
      ...[0, 8, 16, 24].map((shift) => (time >> shift) & 0xff),
      ...hash.slice(0, 16),
      ADDITIONAL_RANDOM_NUMBER,
    ];
    const out = Uint8Array.from([
      randomByte,
      ...bytes.map((byte) => byte ^ randomByte),
    ]);
    return encodeBase64(out).replace(/=/g, "");
  }
}
