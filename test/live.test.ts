/**
 * End-to-end check against X: the UserByScreenName endpoint must accept
 * the generated transaction IDs.
 *
 * Rate limiting produces the same 404 errors as an invalid
 * x-client-transaction-id. If most requests return 404, open any user
 * profile page in a private Chrome window; when rate limiting is in
 * effect, Chrome shows errors too.
 */
import { expect, test } from "bun:test";
import { ClientTransaction, fetchXDocument } from "../src/index.ts";
import { BEARER_TOKEN } from "../src/x-api.ts";

const TOTAL_REQUESTS = 5;
const USER_BY_SCREEN_NAME_URL =
  "https://api.x.com/graphql/1VOOyvKkiI3FMmkeDNxM9A/UserByScreenName?variables=%7B%22screen_name%22%3A%22elonmusk%22%7D&features=%7B%22hidden_profile_subscriptions_enabled%22%3Atrue%2C%22profile_label_improvements_pcf_label_in_post_enabled%22%3Atrue%2C%22rweb_tipjar_consumption_enabled%22%3Atrue%2C%22verified_phone_label_enabled%22%3Afalse%2C%22subscriptions_verification_info_is_identity_verified_enabled%22%3Atrue%2C%22subscriptions_verification_info_verified_since_enabled%22%3Atrue%2C%22highlights_tweets_tab_ui_enabled%22%3Atrue%2C%22responsive_web_twitter_article_notes_tab_enabled%22%3Atrue%2C%22subscriptions_feature_can_gift_premium%22%3Atrue%2C%22creator_subscriptions_tweet_preview_api_enabled%22%3Atrue%2C%22responsive_web_graphql_skip_user_profile_image_extensions_enabled%22%3Afalse%2C%22responsive_web_graphql_timeline_navigation_enabled%22%3Atrue%7D&fieldToggles=%7B%22withAuxiliaryUserLabels%22%3Atrue%7D";

function createRequest(guestToken: string): Request {
  return new Request(USER_BY_SCREEN_NAME_URL, {
    headers: {
      accept: "*/*",
      "accept-language": "ja",
      authorization: `Bearer ${BEARER_TOKEN}`,
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
  });
}

test(
  "X accepts generated transaction IDs on UserByScreenName",
  async () => {
    const statuses: number[] = [];

    for (let i = 1; i <= TOTAL_REQUESTS; i++) {
      // Every request starts from a fresh document and guest token
      const document = await fetchXDocument();
      const guestToken =
        document.documentElement.outerHTML.match(/gt=([0-9]+);/)?.[1];
      if (!guestToken) {
        console.error(`Request ${i}: no guest token in the document`);
        continue;
      }

      const transaction = await ClientTransaction.create(document);
      const request = createRequest(guestToken);
      request.headers.set(
        "x-client-transaction-id",
        await transaction.generateTransactionId(
          request.method,
          new URL(request.url).pathname,
        ),
      );

      const response = await fetch(request);
      await response.text();
      statuses.push(response.status);
      console.log(`Request ${i}/${TOTAL_REQUESTS}: ${response.status}`);

      await Bun.sleep(200);
    }

    const notFound = statuses.filter((status) => status === 404).length;
    if (notFound > TOTAL_REQUESTS / 2) {
      console.warn(
        "Most requests returned 404, which rate limiting also causes. Open any user profile page in Chrome to check.",
      );
    }
    expect(statuses).toEqual(Array(TOTAL_REQUESTS).fill(200));
  },
  { timeout: 60_000 },
);
