/**
 * Tests for the ClientTransaction class
 *
 * This file contains test cases to verify the functionality of the
 * ClientTransaction class and transaction ID generation.
 */
import { assertEquals } from "@std/assert";
import { handleXMigration, ClientTransaction } from "./mod.ts";

/**
 * Test to verify the transaction ID generation process with default keys
 *
 * This test performs the following steps:
 * 1. Fetches the X homepage and extracts guest token
 * 2. Creates a ClientTransaction instance
 * 3. Generates a transaction ID for a specific API endpoint using default keys
 * 4. Verifies the transaction ID works by making an API request
 */
Deno.test(
  "Generate and verify transaction ID for X API UserByScreenName endpoint with default keys",
  async () => {
    // Arrange: Set up necessary data and objects
    const document = await handleXMigration();
    const guestToken =
      document.documentElement.outerHTML.match(/gt=([0-9]+);/)?.[1] || null;

    if (!guestToken) {
      throw new Error("Failed to extract guest token from the document");
    }

    const ct = await ClientTransaction.create(document);

    const request = new Request(
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
      }
    );

    // Act: Generate transaction ID and apply it to the request
    const transactionId = await ct.generateTransactionId(
      request.method,
      new URL(request.url).pathname
    );
    request.headers.set("x-client-transaction-id", transactionId);

    // Execute the request
    const response = await fetch(request);
    await response.text();

    // Assert: Verify the response is successful
    assertEquals(
      response.ok,
      true,
      "X API should return a successful response with a valid transaction ID"
    );
  }
);

/**
 * Test to verify the transaction ID generation process with fixed key pairs
 *
 * This test performs the following steps:
 * 1. Fetches the X homepage and extracts guest token
 * 2. Creates a ClientTransaction instance
 * 3. Fetches a random key pair from an external repository
 * 4. Generates a transaction ID using the fixed key pair
 * 5. Verifies the transaction ID works by making an API request
 */
Deno.test(
  "Generate and verify transaction ID for X API UserByScreenName endpoint with fixed key pairs",
  async () => {
    // Arrange: Set up necessary data and objects
    const document = await handleXMigration();
    const guestToken =
      document.documentElement.outerHTML.match(/gt=([0-9]+);/)?.[1] || null;

    if (!guestToken) {
      throw new Error("Failed to extract guest token from the document");
    }

    const ct = await ClientTransaction.create(document);

    const request = new Request(
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
      }
    );

    const keyPairs: { verification: string; animationKey: string }[] = await (
      await fetch(
        "https://raw.githubusercontent.com/Lqm1/x-client-transaction-id-pair-dict/refs/heads/main/pair.json"
      )
    ).json();
    const keyPair = keyPairs[Math.floor(Math.random() * keyPairs.length)];

    // Act: Generate transaction ID and apply it to the request
    const transactionId = await ct.generateTransactionId(
      request.method,
      new URL(request.url).pathname,
      undefined,
      keyPair.verification,
      keyPair.animationKey
    );
    request.headers.set("x-client-transaction-id", transactionId);

    // Execute the request
    const response = await fetch(request);
    await response.text();

    // Assert: Verify the response is successful
    assertEquals(
      response.ok,
      true,
      "X API should return a successful response with a valid transaction ID"
    );
  }
);
