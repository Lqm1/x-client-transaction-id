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
import { interpolate, interpolateNum } from "./interpolate.ts";
import { convertRotationToMatrix } from "./rotation.ts";
import { handleXMigration, floatToHex, isOdd } from "./utils.ts";
import { encodeBase64, decodeBase64 } from "@std/encoding";

export {
  ClientTransaction,
  Cubic,
  interpolate,
  interpolateNum,
  convertRotationToMatrix,
  handleXMigration,
  floatToHex,
  isOdd,
  encodeBase64,
  decodeBase64,
};

export default ClientTransaction;
