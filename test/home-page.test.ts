import { afterEach, expect, mock, spyOn, test } from "bun:test";
import {
  KeyByteIndicesExtractionError,
  OnDemandFileUrlResolutionError,
} from "../src/errors.ts";
import {
  fetchKeyByteIndices,
  getAnimationFrameRows,
  getOnDemandFileUrl,
  getVerificationKey,
} from "../src/home-page.ts";
import {
  createDocument,
  LIVE_PAGE_KEY,
  LIVE_PAGE_ON_DEMAND_SOURCE,
  LIVE_PAGE_ON_DEMAND_URL,
  loadLivePage,
} from "./fixture.ts";

afterEach(() => {
  mock.restore();
});

test("getVerificationKey reads the twitter-site-verification meta tag", async () => {
  expect(getVerificationKey(await loadLivePage())).toBe(LIVE_PAGE_KEY);
});

test("getOnDemandFileUrl resolves the chunk URL from the webpack runtime", async () => {
  expect(getOnDemandFileUrl(await loadLivePage())).toBe(
    LIVE_PAGE_ON_DEMAND_URL,
  );
});

test("getOnDemandFileUrl throws when no runtime maps the chunk", () => {
  expect(() =>
    getOnDemandFileUrl(createDocument("<html><body></body></html>")),
  ).toThrow(OnDemandFileUrlResolutionError);
});

test("fetchKeyByteIndices separates the row index from the frame time indices", async () => {
  const fetchSpy = spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(LIVE_PAGE_ON_DEMAND_SOURCE),
  );

  expect(await fetchKeyByteIndices(await loadLivePage())).toEqual({
    rowIndex: 14,
    keyBytesIndices: [20, 19, 30],
  });
  expect(fetchSpy).toHaveBeenCalledWith(LIVE_PAGE_ON_DEMAND_URL);
});

test("fetchKeyByteIndices throws when the chunk has no indices", async () => {
  spyOn(globalThis, "fetch").mockResolvedValue(new Response("nothing here"));

  const error = await fetchKeyByteIndices(await loadLivePage()).catch(
    (e: unknown) => e,
  );
  expect(error).toBeInstanceOf(KeyByteIndicesExtractionError);
});

test("getAnimationFrameRows returns no rows without animation frames", () => {
  expect(
    getAnimationFrameRows(createDocument("<html></html>"), [0, 0, 0, 0, 0, 0]),
  ).toEqual([]);
});
