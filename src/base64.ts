/**
 * Standard base64 encoding built on the `btoa`/`atob` globals, which every
 * supported runtime provides. Signatures match the `@std/encoding`
 * functions this module replaces.
 */

/**
 * Encodes data as a base64 string with padding.
 * @param data Bytes to encode; a string is UTF-8 encoded first
 * @returns The base64-encoded string
 */
export function encodeBase64(data: ArrayBuffer | Uint8Array | string): string {
  const bytes =
    typeof data === "string"
      ? new TextEncoder().encode(data)
      : new Uint8Array(data);
  return btoa(Array.from(bytes, (byte) => String.fromCharCode(byte)).join(""));
}

/**
 * Decodes a base64 string into bytes.
 * @param b64 The base64-encoded string
 * @returns The decoded bytes
 */
export function decodeBase64(b64: string): Uint8Array<ArrayBuffer> {
  return Uint8Array.from(atob(b64), (char) => char.charCodeAt(0));
}
