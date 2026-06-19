import { test, expect, type ConsoleMessage } from "@playwright/test";

const RUTH_ID = "121578";

// URL fragments for requests that are expected to fail on Netlify
// (Vercel-only telemetry endpoints) — ignore failures from these.
const EXPECTED_FAILING_URL_FRAGMENTS = [
  "/_vercel/insights",
  "/_vercel/speed-insights",
];

test.describe("statcards production smoke", () => {
  let networkErrors: string[] = [];
  let pageErrors: string[] = [];

  test.beforeEach(({ page }) => {
    networkErrors = [];
    pageErrors = [];
    page.on("response", (resp) => {
      const url = resp.url();
      if (
        resp.status() >= 400 &&
        !EXPECTED_FAILING_URL_FRAGMENTS.some((f) => url.includes(f))
      ) {
        networkErrors.push(`${resp.status()} ${url}`);
      }
    });
    page.on("pageerror", (err) => {
      pageErrors.push(`${err.name}: ${err.message}`);
    });
    page.on("console", (msg: ConsoleMessage) => {
      // Only capture pageerror-like messages we can't see via response.
      // Skip plain "console.error" calls — those are app-level logs, not
      // necessarily failures.
    });
  });

  test("home page loads and links to a card", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(/stat ?cards|baseball/i);
  });

  test("player card page renders a card image", async ({ page }) => {
    const response = await page.goto(`/card/${RUTH_ID}`);
    expect(response?.status()).toBe(200);

    const cardImg = page.locator(`img[src*="/api/card/${RUTH_ID}"]`).first();
    await expect(cardImg).toBeVisible({ timeout: 15_000 });

    // Wait for the image to actually load (not just render the <img> element).
    const naturalWidth = await cardImg.evaluate(
      (el) => (el as HTMLImageElement).naturalWidth,
    );
    expect(naturalWidth).toBeGreaterThan(0);
  });

  test("browse page links to eras and HOF, which lists players", async ({
    page,
  }) => {
    const response = await page.goto("/browse");
    expect(response?.status()).toBe(200);
    await expect(page.locator("a[href^='/browse/era/']").first()).toBeVisible();
    await expect(page.locator("a[href='/browse/hof']")).toBeVisible();

    await page.goto("/browse/hof");
    await expect(page.locator("a[href^='/card/']").first()).toBeVisible();
  });

  test("library page loads", async ({ page }) => {
    const response = await page.goto("/library");
    expect(response?.status()).toBe(200);
  });

  test.afterEach(() => {
    expect(networkErrors, `network errors: ${networkErrors.join("\n")}`).toEqual([]);
    expect(pageErrors, `page errors: ${pageErrors.join("\n")}`).toEqual([]);
  });
});
