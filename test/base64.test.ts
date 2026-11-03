import { expect, test } from "bun:test";
import { decodeBase64, encodeBase64 } from "../src/index.ts";

// RFC 4648 section 10 test vectors
const vectors: [string, string][] = [
  ["", ""],
  ["f", "Zg=="],
  ["fo", "Zm8="],
  ["foo", "Zm9v"],
  ["foob", "Zm9vYg=="],
  ["fooba", "Zm9vYmE="],
  ["foobar", "Zm9vYmFy"],
];

test("encodeBase64 matches the RFC 4648 test vectors", () => {
  for (const [input, expected] of vectors) {
    expect(encodeBase64(input)).toBe(expected);
    expect(encodeBase64(new TextEncoder().encode(input))).toBe(expected);
  }
});

test("decodeBase64 matches the RFC 4648 test vectors", () => {
  for (const [expected, input] of vectors) {
    expect(decodeBase64(input)).toEqual(new TextEncoder().encode(expected));
  }
});

test("base64 round-trips every byte value", () => {
  const bytes = Uint8Array.from({ length: 256 }, (_, i) => i);
  expect(decodeBase64(encodeBase64(bytes))).toEqual(bytes);
  expect(encodeBase64(bytes.buffer)).toBe(encodeBase64(bytes));
});

test("encodeBase64 encodes strings as UTF-8", () => {
  expect(encodeBase64("日本")).toBe("5pel5pys");
});
