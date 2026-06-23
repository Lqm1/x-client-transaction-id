/**
 * Utility functions for X client transaction ID generation
 *
 * This module provides helper functions for fetching X's web app shell,
 * number conversions, and other utility operations.
 */
import { parseHTML } from "linkedom";
import { XHomePageFetchError } from "./errors.ts";

const X_HOME_URL = "https://x.com/home";

/**
 * Fetches X's responsive web app shell and returns the HTML document.
 *
 * The `/home` route serves the full client bundle whose inline runtime
 * exposes the ondemand chunk map and guest token required for transaction
 * ID generation, even when the request is unauthenticated.
 *
 * @returns Promise resolving to the Document object from X's responsive web app
 * @throws {XHomePageFetchError} If the request to X's home route fails.
 */
async function fetchXDocument(): Promise<Document> {
  // Set headers to mimic a browser request
  const headers = {
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

  // Fetch the responsive web app shell. The bare x.com homepage can serve a
  // separate logged-out app that no longer includes the ondemand chunk map.
  const response = await fetch(X_HOME_URL, {
    headers,
  });

  if (!response.ok) {
    throw new XHomePageFetchError(response.status, response.statusText);
  }

  const htmlText = await response.text();

  // Parse HTML using linkedom
  const dom = parseHTML(htmlText);
  const document = dom.window.document;

  // Return the DOM document
  return document;
}

/**
 * Fetches X's responsive web app shell and returns the HTML document.
 *
 * @deprecated X no longer performs a domain migration step. Use {@link fetchXDocument}
 *             instead. This function is kept only for backward compatibility and
 *             simply delegates to {@link fetchXDocument}.
 *
 * @returns Promise resolving to the Document object from X's responsive web app
 * @throws {XHomePageFetchError} If the request to X's home route fails.
 */
function handleXMigration(): Promise<Document> {
  return fetchXDocument();
}

/**
 * Activates a guest token via the X guest activate API.
 *
 * @returns Promise resolving to the guest token string, or null on failure.
 */
async function activateGuestToken(): Promise<string | null> {
  try {
    const response = await fetch(
      "https://api.x.com/1.1/guest/activate.json",
      {
        method: "POST",
        headers: {
          authorization:
            "Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA",
          "content-type": "application/json",
        },
      },
    );
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data?.guest_token ?? null;
  } catch {
    return null;
  }
}

/**
 * Converts a floating point number to hexadecimal string representation
 *
 * @param x Floating point number to convert
 * @returns Hexadecimal string representation of the number
 */
function floatToHex(x: number): string {
  const result: string[] = [];
  let quotient = Math.floor(x);
  let fraction = x - quotient;

  // Convert integer part to hex
  while (quotient > 0) {
    quotient = Math.floor(x / 16);
    const remainder = Math.floor(x - quotient * 16);

    if (remainder > 9) {
      result.unshift(String.fromCharCode(remainder + 55)); // Convert to A-F
    } else {
      result.unshift(remainder.toString());
    }

    x = quotient;
  }

  if (fraction === 0) {
    return result.join("");
  }

  // Add decimal point for fractional part
  result.push(".");

  // Convert fractional part to hex
  while (fraction > 0) {
    fraction *= 16;
    const integer = Math.floor(fraction);
    fraction -= integer;

    if (integer > 9) {
      result.push(String.fromCharCode(integer + 55)); // Convert to A-F
    } else {
      result.push(integer.toString());
    }
  }

  return result.join("");
}

/**
 * Determines if a number is odd and returns a specific value
 *
 * @param num Number to check
 * @returns -1.0 if odd, 0.0 if even
 */
function isOdd(num: number): number {
  if (num % 2) {
    return -1.0;
  }
  return 0.0;
}

export {
  activateGuestToken,
  fetchXDocument,
  floatToHex,
  handleXMigration,
  isOdd,
};
