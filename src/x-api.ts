/**
 * Requests to X's logged-out web endpoints.
 */
import { parseHTML } from "linkedom";
import { XHomePageFetchError } from "./errors.ts";

// The logged-out /home route redirects to x-web, which does not expose the
// responsive-web runtime used to locate ondemand.s.
const APP_SHELL_URL = "https://x.com/i/jf/";
const GUEST_ACTIVATE_URL = "https://api.x.com/1.1/guest/activate.json";

/** Bearer token of X's web client, accepted for logged-out API requests. */
export const BEARER_TOKEN: string =
  "AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA";

// Headers Chrome sends for a top-level navigation
const NAVIGATION_HEADERS: Record<string, string> = {
  accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
  "accept-language": "ja",
  "cache-control": "no-cache",
  pragma: "no-cache",
  priority: "u=0, i",
  "sec-ch-ua":
    '"Google Chrome";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"Windows"',
  "sec-fetch-dest": "document",
  "sec-fetch-mode": "navigate",
  "sec-fetch-site": "none",
  "sec-fetch-user": "?1",
  "upgrade-insecure-requests": "1",
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
};

/**
 * Fetches X's responsive web app shell and returns the HTML document.
 *
 * The `/i/jf/` route serves the responsive-web runtime and verification key
 * required for transaction ID generation without a logged-in session.
 *
 * @returns The parsed document of X's responsive web app
 * @throws {XHomePageFetchError} If the request to X's app shell fails.
 */
export async function fetchXDocument(): Promise<Document> {
  const response = await fetch(APP_SHELL_URL, { headers: NAVIGATION_HEADERS });
  if (!response.ok) {
    throw new XHomePageFetchError(response.status, response.statusText);
  }
  return parseHTML(await response.text()).document;
}

/**
 * Fetches X's responsive web app shell and returns the HTML document.
 *
 * @deprecated X no longer performs a domain migration step. Use {@link fetchXDocument}
 *             instead. This function is kept only for backward compatibility and
 *             simply delegates to {@link fetchXDocument}.
 *
 * @returns The parsed document of X's responsive web app
 * @throws {XHomePageFetchError} If the request to X's app shell fails.
 */
export function handleXMigration(): Promise<Document> {
  return fetchXDocument();
}

/**
 * Activates a guest token via the X guest activate API.
 *
 * @returns The guest token, or null if the request fails.
 */
export async function activateGuestToken(): Promise<string | null> {
  try {
    const response = await fetch(GUEST_ACTIVATE_URL, {
      method: "POST",
      headers: {
        authorization: `Bearer ${BEARER_TOKEN}`,
        "content-type": "application/json",
      },
    });
    if (!response.ok) {
      return null;
    }
    const data: { guest_token?: string } | null = await response.json();
    return data?.guest_token ?? null;
  } catch {
    return null;
  }
}
