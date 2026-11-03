import { parseHTML } from "linkedom";

/** Verification key in the captured page */
export const LIVE_PAGE_KEY =
  "DBvIZ0xwwkWXaB3H5ryhjd/137RFDskbsDZvRr6cG0uCWYCdxhOvMwV86MRGVP5m";
/** Animation key of the captured page, as computed before the move to Bun */
export const LIVE_PAGE_ANIMATION_KEY =
  "5eaf6b100ccccccccccccd00ccccccccccccd100";
/** URL of the ondemand.s chunk the captured page's runtime references */
export const LIVE_PAGE_ON_DEMAND_URL =
  "https://abs.twimg.com/responsive-web/client-web/ondemand.s.6f4d46a32a10fdcca.js";
/** The key byte index expressions the captured ondemand.s chunk carries */
export const LIVE_PAGE_ON_DEMAND_SOURCE =
  "(t[14], 16)(t[20], 16)(t[19], 16)(t[30], 16)";

export function createDocument(html: string): Document {
  return parseHTML(html).window.document;
}

/** Loads the captured X app shell, trimmed to what the library reads. */
export async function loadLivePage(): Promise<Document> {
  const html = await Bun.file(
    new URL("./fixtures/live_page.html", import.meta.url),
  ).text();
  return createDocument(html);
}
