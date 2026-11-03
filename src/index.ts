/**
 * @lami/x-client-transaction-id
 *
 * A library for generating client transaction IDs required for
 * authenticated API requests to X (formerly Twitter).
 *
 * This module exports the main ClientTransaction class and utility functions
 * needed to generate valid x-client-transaction-id headers for X API requests.
 *
 * @module
 */

import { decodeBase64, encodeBase64 } from "./base64.ts";
import Cubic from "./cubic.ts";
import {
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
import { interpolate, interpolateNum } from "./interpolate.ts";
import { convertRotationToMatrix } from "./rotation.ts";
import ClientTransaction from "./transaction.ts";
import {
  activateGuestToken,
  fetchXDocument,
  floatToHex,
  handleXMigration,
  isOdd,
  matrixNumbers,
} from "./utils.ts";

export {
  AnimationFrameDataError,
  activateGuestToken,
  ClientTransaction,
  ClientTransactionError,
  ClientTransactionInitializationError,
  ClientTransactionNotInitializedError,
  Cubic,
  convertRotationToMatrix,
  /** Decodes a base64-encoded string into a Uint8Array. */
  decodeBase64,
  /** Encodes data to a base64-encoded string. */
  encodeBase64,
  fetchXDocument,
  floatToHex,
  HandleXMigrationError,
  handleXMigration,
  IndicesNotInitializedError,
  InterpolationInputError,
  interpolate,
  interpolateNum,
  isOdd,
  KeyByteIndicesExtractionError,
  matrixNumbers,
  OnDemandFileFetchError,
  OnDemandFileUrlResolutionError,
  SiteVerificationKeyNotFoundError,
  XHomePageFetchError,
  XMigrationFormError,
  XMigrationRedirectionError,
};

export default ClientTransaction;
