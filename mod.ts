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
import ClientTransaction from "./transaction.ts";
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
import { floatToHex, handleXMigration, isOdd } from "./utils.ts";
import { decodeBase64, encodeBase64 } from "@std/encoding";

export {
  AnimationFrameDataError,
  ClientTransaction,
  ClientTransactionError,
  ClientTransactionInitializationError,
  ClientTransactionNotInitializedError,
  convertRotationToMatrix,
  Cubic,
  decodeBase64,
  encodeBase64,
  floatToHex,
  handleXMigration,
  HandleXMigrationError,
  IndicesNotInitializedError,
  interpolate,
  interpolateNum,
  InterpolationInputError,
  isOdd,
  KeyByteIndicesExtractionError,
  OnDemandFileFetchError,
  OnDemandFileUrlResolutionError,
  SiteVerificationKeyNotFoundError,
  XHomePageFetchError,
  XMigrationFormError,
  XMigrationRedirectionError,
};

export default ClientTransaction;
