import { afterEach, expect, mock, spyOn, test } from "bun:test";
import {
  activateGuestToken,
  fetchXDocument,
  XHomePageFetchError,
} from "../src/index.ts";

afterEach(() => {
  mock.restore();
});

test("fetchXDocument fetches the responsive web app document", async () => {
  const fetchSpy = spyOn(globalThis, "fetch").mockResolvedValue(
    new Response("<html><body><main>ok</main></body></html>"),
  );

  const document = await fetchXDocument();

  expect(fetchSpy.mock.calls[0]?.[0]).toBe("https://x.com/i/jf/");
  expect(document.querySelector("main")?.textContent).toBe("ok");
});

test("fetchXDocument throws a typed error when the request fails", async () => {
  spyOn(globalThis, "fetch").mockResolvedValue(
    new Response("", { status: 403, statusText: "Forbidden" }),
  );

  const error = await fetchXDocument().catch((e: unknown) => e);
  expect(error).toBeInstanceOf(XHomePageFetchError);
  expect((error as XHomePageFetchError).status).toBe(403);
});

test("activateGuestToken returns the activated guest token", async () => {
  const fetchSpy = spyOn(globalThis, "fetch").mockResolvedValue(
    Response.json({ guest_token: "1234567890" }),
  );

  expect(await activateGuestToken()).toBe("1234567890");
  expect(fetchSpy.mock.calls[0]?.[1]?.method).toBe("POST");
});

test("activateGuestToken returns null when the request fails", async () => {
  spyOn(globalThis, "fetch").mockResolvedValue(
    new Response("", { status: 429 }),
  );
  expect(await activateGuestToken()).toBeNull();

  spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("offline"));
  expect(await activateGuestToken()).toBeNull();
});
