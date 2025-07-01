/**
 * Utility functions for X client transaction ID generation
 *
 * This module provides helper functions for handling X domain migration,
 * number conversions, and other utility operations.
 */
import { parseHTML } from "linkedom";

/**
 * Handles X.com domain migration process and returns the HTML document
 *
 * This function navigates through X's migration redirects and forms
 * to obtain the final HTML document needed for transaction ID generation.
 *
 * @returns Promise resolving to the Document object from X's homepage
 */
async function handleXMigration(): Promise<Document> {
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

  // Fetch X.com homepage
  const response = await fetch("https://x.com", {
    headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch X homepage: ${response.statusText}`);
  }

  const htmlText = await response.text();

  // Parse HTML using linkedom
  let dom = parseHTML(htmlText);
  let document = dom.window.document;

  // Check for migration redirection links
  const migrationRedirectionRegex = new RegExp(
    "(http(?:s)?://(?:www\\.)?(twitter|x){1}\\.com(/x)?/migrate([/?])?tok=[a-zA-Z0-9%\\-_]+)+",
    "i",
  );

  const metaRefresh = document.querySelector("meta[http-equiv='refresh']");
  const metaContent = metaRefresh
    ? metaRefresh.getAttribute("content") || ""
    : "";

  const migrationRedirectionUrl = migrationRedirectionRegex.exec(metaContent) ||
    migrationRedirectionRegex.exec(htmlText);

  if (migrationRedirectionUrl) {
    // Follow redirection URL
    const redirectResponse = await fetch(migrationRedirectionUrl[0]);

    if (!redirectResponse.ok) {
      throw new Error(
        `Failed to follow migration redirection: ${redirectResponse.statusText}`,
      );
    }

    const redirectHtml = await redirectResponse.text();
    dom = parseHTML(redirectHtml);
    document = dom.window.document;
  }

  // Handle migration form if present
  const migrationForm = document.querySelector("form[name='f']") ||
    document.querySelector("form[action='https://x.com/x/migrate']");

  if (migrationForm) {
    const url = migrationForm.getAttribute("action") ||
      "https://x.com/x/migrate";
    const method = migrationForm.getAttribute("method") || "POST";

    // Collect form input fields
    const requestPayload = new FormData();

    const inputFields = migrationForm.querySelectorAll("input");
    for (const element of Array.from(inputFields)) {
      const name = element.getAttribute("name");
      const value = element.getAttribute("value");
      if (name && value) {
        requestPayload.append(name, value);
      }
    }

    // Submit form using POST request
    const formResponse = await fetch(url, {
      method: method,
      body: requestPayload,
      headers,
    });

    if (!formResponse.ok) {
      throw new Error(
        `Failed to submit migration form: ${formResponse.statusText}`,
      );
    }

    const formHtml = await formResponse.text();
    dom = parseHTML(formHtml);
    document = dom.window.document;
  }

  // Return final DOM document
  return document;
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

export { floatToHex, handleXMigration, isOdd };
