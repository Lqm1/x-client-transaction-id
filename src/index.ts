/**
 * Generates the `x-client-transaction-id` header value that X (formerly
 * Twitter) requires on requests to its web API.
 *
 * @example
 * ```ts
 * import { ClientTransaction, fetchXDocument } from "@lami/x-client-transaction-id";
 *
 * const document = await fetchXDocument();
 * const transaction = await ClientTransaction.create(document);
 * const transactionId = await transaction.generateTransactionId(
 *   "GET",
 *   "/1.1/jot/client_event.json",
 * );
 * ```
 *
 * @module
 */
import { ClientTransaction } from "./transaction.ts";

export { matrixNumbers } from "./animation.ts";
export { decodeBase64, encodeBase64 } from "./base64.ts";
export { Cubic } from "./cubic.ts";
export {
  AnimationFrameDataError,
  ClientTransactionError,
  ClientTransactionInitializationError,
  ClientTransactionNotInitializedError,
  HandleXMigrationError,
  IndicesNotInitializedError,
  InterpolationInputError,
  KeyByteIndicesExtractionError,
  OnDemandFileFetchError,
  OnDemandFileUrlResolutionError,
  SiteVerificationKeyNotFoundError,
  XHomePageFetchError,
  XMigrationFormError,
  XMigrationRedirectionError,
} from "./errors.ts";
export {
  convertRotationToMatrix,
  floatToHex,
  interpolate,
  interpolateNum,
  isOdd,
} from "./math.ts";
export {
  activateGuestToken,
  fetchXDocument,
  handleXMigration,
} from "./x-api.ts";
export { ClientTransaction };
export default ClientTransaction;
