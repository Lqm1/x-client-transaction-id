import { assertEquals } from "@std/assert";
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

Deno.test("encodeBase64 matches the RFC 4648 test vectors", () => {
  for (const [input, expected] of vectors) {
    assertEquals(encodeBase64(input), expected);
    assertEquals(encodeBase64(new TextEncoder().encode(input)), expected);
  }
});

Deno.test("decodeBase64 matches the RFC 4648 test vectors", () => {
  for (const [expected, input] of vectors) {
    assertEquals(decodeBase64(input), new TextEncoder().encode(expected));
  }
});

Deno.test("base64 round-trips every byte value", () => {
  const bytes = Uint8Array.from({ length: 256 }, (_, i) => i);
  assertEquals(decodeBase64(encodeBase64(bytes)), bytes);
  assertEquals(encodeBase64(bytes.buffer), encodeBase64(bytes));
});

Deno.test("encodeBase64 encodes strings as UTF-8", () => {
  assertEquals(encodeBase64("日本"), "5pel5pys");
});
