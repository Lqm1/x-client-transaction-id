/**
 * Reading the inputs of the transaction ID from X's responsive web app
 * document and from the ondemand.s chunk its webpack runtime loads.
 */
import type { KeyByteIndices } from "./animation.ts";
import {
  KeyByteIndicesExtractionError,
  OnDemandFileFetchError,
  OnDemandFileUrlResolutionError,
  SiteVerificationKeyNotFoundError,
} from "./errors.ts";

const ON_DEMAND_CHUNK_NAME = "ondemand.s";
// Matches the webpack runtime's chunk URL builder: captures the chunk id
// mapped to "ondemand.s", then the file hash mapped to that same id
const ON_DEMAND_FILE_HASH_REGEX =
  /(\d+):\s*["']ondemand\.s["'][\s\S]*?\}\)\[e\]\s*\|\|\s*e\)\s*\+\s*["']\.["']\s*\+\s*\(\{[\s\S]*?\b\1:\s*["']([a-zA-Z0-9_-]+)["']/;
const KEY_BYTE_INDEX_REGEX = /\(\w\[(\d{1,2})\],\s*16\)/g;

/**
 * Reads the base64 verification key from the twitter-site-verification
 * meta tag.
 * @throws {SiteVerificationKeyNotFoundError} If the tag is missing or empty.
 */
export function getVerificationKey(document: Document): string {
  const key = document
    .querySelector("[name='twitter-site-verification']")
    ?.getAttribute("content");
  if (!key) {
    throw new SiteVerificationKeyNotFoundError();
  }
  return key;
}

/**
 * Resolves the URL of the ondemand.s chunk from the webpack runtime,
 * looking at inline scripts first and the whole document last.
 * @throws {OnDemandFileUrlResolutionError} If no runtime maps the chunk.
 */
export function getOnDemandFileUrl(document: Document): string {
  const runtimeSources = Array.from(
    document.querySelectorAll("script"),
    (script) => script.textContent ?? "",
  ).filter((source) => source.includes(ON_DEMAND_CHUNK_NAME));
  runtimeSources.push(document.documentElement.outerHTML);

  for (const source of runtimeSources) {
    const hash = ON_DEMAND_FILE_HASH_REGEX.exec(source)?.[2];
    if (hash) {
      return `https://abs.twimg.com/responsive-web/client-web/${ON_DEMAND_CHUNK_NAME}.${hash}a.js`;
    }
  }
  throw new OnDemandFileUrlResolutionError();
}

/**
 * Fetches the ondemand.s chunk and extracts the key byte indices from its
 * `(x[i], 16)` expressions, in order of appearance.
 * @throws {OnDemandFileFetchError} If the chunk cannot be fetched.
 * @throws {KeyByteIndicesExtractionError} If the chunk has no indices.
 */
export async function fetchKeyByteIndices(
  document: Document,
): Promise<KeyByteIndices> {
  const url = getOnDemandFileUrl(document);
  const response = await fetch(url);
  if (!response.ok) {
    throw new OnDemandFileFetchError(url, response.status, response.statusText);
  }

  const source = await response.text();
  const indices = Array.from(source.matchAll(KEY_BYTE_INDEX_REGEX), (match) =>
    Number(match[1]),
  );
  if (indices.length === 0) {
    throw new KeyByteIndicesExtractionError();
  }
  const [rowIndex, ...keyBytesIndices] = indices;
  return { rowIndex, keyBytesIndices };
}

/**
 * Reads the frame rows of the loading animation the key selects: key
 * byte 5 picks one of the four `loading-x-anim-*` SVGs, whose path data
 * holds one row of numbers per cubic segment.
 * @returns The rows, or an empty array if the frame or its path is missing
 */
export function getAnimationFrameRows(
  document: Document,
  keyBytes: number[],
): number[][] {
  const frames = document.querySelectorAll("[id^='loading-x-anim']");
  const path =
    frames[keyBytes[5] % 4]?.children[0]?.children[1]?.getAttribute("d");
  if (!path) {
    return [];
  }
  return path
    .substring(9)
    .split("C")
    .map((segment) => (segment.match(/\d+/g) ?? []).map(Number));
}
