/**
 * Tests for the ClientTransaction class
 *
 * This file contains test cases to verify the functionality of the
 * ClientTransaction class and transaction ID generation.
 */
import { assertEquals } from "@std/assert";
import { ClientTransaction, handleXMigration } from "./mod.ts";

/**
 * Test to verify the transaction ID generation process
 *
 * This test performs the following steps:
 * 1. Fetches the X homepage and extracts guest token for each request
 * 2. Creates a new ClientTransaction instance for each request
 * 3. Generates a transaction ID for a specific API endpoint
 * 4. Makes 25 API requests and verifies all of them are successful (100% success rate)
 *
 * Note: Rate limiting may occur. Rate limiting produces the same 404 errors
 * as an invalid x-client-transaction-id. If more than 50% of requests return 404
 * or if all requests fail with 404, try opening any user profile page in Chrome
 * in private to check. If rate limiting is in effect, Chrome will also show errors.
 */
Deno.test(
  "Generate and verify transaction ID for X API UserByScreenName endpoint",
  async () => {
    const totalRequests = 25;
    let successfulRequests = 0;
    let notFoundErrors = 0;

    // Create a base request function
    const createRequest = (guestToken: string) =>
      new Request(
        "https://api.x.com/graphql/1VOOyvKkiI3FMmkeDNxM9A/UserByScreenName?variables=%7B%22screen_name%22%3A%22elonmusk%22%7D&features=%7B%22hidden_profile_subscriptions_enabled%22%3Atrue%2C%22profile_label_improvements_pcf_label_in_post_enabled%22%3Atrue%2C%22rweb_tipjar_consumption_enabled%22%3Atrue%2C%22verified_phone_label_enabled%22%3Afalse%2C%22subscriptions_verification_info_is_identity_verified_enabled%22%3Atrue%2C%22subscriptions_verification_info_verified_since_enabled%22%3Atrue%2C%22highlights_tweets_tab_ui_enabled%22%3Atrue%2C%22responsive_web_twitter_article_notes_tab_enabled%22%3Atrue%2C%22subscriptions_feature_can_gift_premium%22%3Atrue%2C%22creator_subscriptions_tweet_preview_api_enabled%22%3Atrue%2C%22responsive_web_graphql_skip_user_profile_image_extensions_enabled%22%3Afalse%2C%22responsive_web_graphql_timeline_navigation_enabled%22%3Atrue%7D&fieldToggles=%7B%22withAuxiliaryUserLabels%22%3Atrue%7D",
        {
          headers: {
            accept: "*/*",
            "accept-language": "ja",
            authorization:
              "Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA",
            "cache-control": "no-cache",
            "content-type": "application/json",
            origin: "https://x.com",
            pragma: "no-cache",
            priority: "u=1, i",
            referer: "https://x.com/",
            "sec-ch-ua":
              '"Google Chrome";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site",
            "user-agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
            "x-guest-token": guestToken,
            "x-twitter-active-user": "yes",
            "x-twitter-client-language": "ja",
          },
        },
      );

    // Act: Generate multiple transaction IDs and test them
    console.log(`Running ${totalRequests} API requests...`);

    for (let i = 0; i < totalRequests; i++) {
      console.log(`Request ${i + 1}/${totalRequests}: Fetching X homepage...`);

      // Create new document and ClientTransaction instance for each request
      const document = await handleXMigration();
      const guestToken =
        document.documentElement.outerHTML.match(/gt=([0-9]+);/)?.[1] || null;

      if (!guestToken) {
        console.error(
          `Request ${i + 1}: Failed to extract guest token from the document`,
        );
        continue;
      }

      // Create a new ClientTransaction instance
      const ct = await ClientTransaction.create(document);

      // Create request with fresh guest token
      const request = createRequest(guestToken);

      // Generate transaction ID with the fresh ClientTransaction instance
      const transactionId = await ct.generateTransactionId(
        request.method,
        new URL(request.url).pathname,
      );
      request.headers.set("x-client-transaction-id", transactionId);

      // Execute the request
      try {
        console.log(`Request ${i + 1}/${totalRequests}: Executing API call...`);
        const response = await fetch(request);
        await response.text();

        if (response.ok) {
          successfulRequests++;
          console.log(`Request ${i + 1}/${totalRequests}: Success`);
        } else {
          console.error(
            `Request ${
              i + 1
            }/${totalRequests}: Failed with status: ${response.status}`,
          );
          if (response.status === 404) {
            notFoundErrors++;
          }
        }
      } catch (error) {
        console.error(`Request ${i + 1}/${totalRequests}: Error:`, error);
      }

      // Small delay between requests to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    console.log(
      `Successful requests: ${successfulRequests}/${totalRequests} (${
        (
          (successfulRequests / totalRequests) *
          100
        ).toFixed(2)
      }%)`,
    );
    console.log(
      `404 Not Found errors: ${notFoundErrors}/${totalRequests} (${
        (
          (notFoundErrors / totalRequests) *
          100
        ).toFixed(2)
      }%)`,
    );

    if (
      notFoundErrors > totalRequests / 2 ||
      notFoundErrors === totalRequests
    ) {
      console.warn(
        "Possible rate limiting detected. Try opening any user profile page in Chrome to verify.",
      );
      console.warn(
        "If rate limiting is occurring, errors will also appear in the browser.",
      );
    }

    // Assert: Verify all requests were successful (100% success rate)
    assertEquals(
      successfulRequests,
      totalRequests,
      `All ${totalRequests} requests must succeed. Only ${successfulRequests} succeeded.`,
    );
  },
);
