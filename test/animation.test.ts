/**
 * Regression tests for the animation key's browser parity (issue #25)
 *
 * X computes the animation key by running a CSS animation in the
 * browser, so the values to match are the ones Chromium produces.
 * These tests pin the three places where the computed key used to
 * diverge from the browser: colour channels are clamped to 0..255,
 * the easing is solved the way Chromium solves it, and matrix entries
 * are rounded from their printed form the way X's script reads them.
 */
import { afterEach, expect, mock, spyOn, test } from "bun:test";
import { parseHTML } from "linkedom";
import { ClientTransaction, matrixNumbers } from "../src/index.ts";
import { decodeBase64 } from "../src/base64.ts";

// A 48-byte verification key whose animation drives a colour channel
// to 293 before the browser's clamp (frame row and indices from the
// captured live page in testdata). Reported in issue #25.
const OVERFLOW_KEY =
  "82gCFB4o3UqR2UZV7LutHF1un2u45+FysCFgrRgyrep9mS9XJH14V2PvG0loA+Dr";
// The animation key Chromium computes for OVERFLOW_KEY when running
// X's own ondemand script on the captured page. Without the colour
// clamp the key starts with "125e60" instead of "ffe600".
const OVERFLOW_ANIMATION_KEY =
  "ffe600a8f5c28f5c28f80c28f5c28f5c290c28f5c28f5c290a8f5c28f5c28f800";

afterEach(() => {
  mock.restore();
});

test("animation key clamps colour channels to 0..255 like the browser", async () => {
  const fixture = await Bun.file(
    new URL("./fixtures/live_page.html", import.meta.url),
  ).text();
  const html = fixture.replace(
    /(<meta name="twitter-site-verification" content=")[^"]*(")/,
    `$1${OVERFLOW_KEY}$2`,
  );
  const document = parseHTML(html).window.document;

  // Serve the indices the captured ondemand file carries, in place of
  // fetching it: [rowIndex, ...keyByteIndices] = [14, 20, 19, 30].
  spyOn(globalThis, "fetch").mockResolvedValue(
    new Response("(t[14], 16)(t[20], 16)(t[19], 16)(t[30], 16)"),
  );

  const ct = await ClientTransaction.create(document);
  const keyBytes = Array.from(decodeBase64(OVERFLOW_KEY));
  const getAnimationKey = (
    ct as unknown as {
      getAnimationKey: (keyBytes: number[], response: Document) => string;
    }
  ).getAnimationKey.bind(ct);
  expect(getAnimationKey(keyBytes, document)).toBe(OVERFLOW_ANIMATION_KEY);
});

test("matrixNumbers reads the numbers X's script reads from a matrix entry", () => {
  // Expected values follow Chromium's printing of a computed matrix
  // entry (six significant digits) split on /[\d.-]+/g.
  const cases: [number, number[]][] = [
    [1, [1]],
    [0, [0]],
    [0.7190094, [0.719009]],
    [-0.69499999999, [-0.695]],
    // "5.68575e-05": the exponent is a second number
    [5.68575e-05, [5.68575, -5]],
    [-9.67769e-06, [-9.67769, -6]],
    [0.0001234567, [0.000123457]],
    [-0, [0]],
  ];
  for (const [input, expected] of cases) {
    expect(matrixNumbers(input)).toEqual(expected);
  }
});
