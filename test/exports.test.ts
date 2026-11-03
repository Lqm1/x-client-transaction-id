import { expect, test } from "bun:test";
import * as mod from "../src/index.ts";

test("the entry point keeps exporting the published API", () => {
  expect(Object.keys(mod).sort()).toEqual([
    "AnimationFrameDataError",
    "ClientTransaction",
    "ClientTransactionError",
    "ClientTransactionInitializationError",
    "ClientTransactionNotInitializedError",
    "Cubic",
    "HandleXMigrationError",
    "IndicesNotInitializedError",
    "InterpolationInputError",
    "KeyByteIndicesExtractionError",
    "OnDemandFileFetchError",
    "OnDemandFileUrlResolutionError",
    "SiteVerificationKeyNotFoundError",
    "XHomePageFetchError",
    "XMigrationFormError",
    "XMigrationRedirectionError",
    "activateGuestToken",
    "convertRotationToMatrix",
    "decodeBase64",
    "default",
    "encodeBase64",
    "fetchXDocument",
    "floatToHex",
    "handleXMigration",
    "interpolate",
    "interpolateNum",
    "isOdd",
    "matrixNumbers",
  ]);
  expect(mod.default).toBe(mod.ClientTransaction);
});
