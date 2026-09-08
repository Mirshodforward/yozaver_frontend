import { createRequire } from "node:module";
import assert from "node:assert/strict";
import { tmpdir } from "node:os";
import { join } from "node:path";
const load = createRequire(import.meta.url);
const { chromium } = load(process.env.PLAYWRIGHT_MODULE || "playwright");
const origin = process.env.TEST_ORIGIN || "http://localhost:3000";
const artifacts = process.env.TEST_ARTIFACTS || tmpdir();
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.route("**/words?**", (r) => r.abort());
  await page.goto(origin + "/settings", { waitUntil: "networkidle" });
  assert.equal(
    await page
      .getByRole("button", { name: /animatsiyali fonini tanlash/ })
      .count(),
    10,
  );
  await page.screenshot({
    path: join(artifacts, "yozaver-premium-settings.png"),
    fullPage: true,
  });
  for (const [id, name] of [
    ["aurora", "Aurora"],
    ["orbit", "Orbital"],
    ["waves", "Okean"],
    ["prism", "Prizma"],
    ["mercury", "Merkuriy"],
    ["tunnel", "Neon tunnel"],
    ["kinetic", "Kinetika"],
    ["matrix", "Raqamli yomg‘ir"],
    ["fireflies", "Yorug‘lik bog‘i"],
    ["stars", "Kosmos"],
  ]) {
    await page
      .getByRole("button", { name: name + " animatsiyali fonini tanlash" })
      .click();
    assert.equal(
      await page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("yozaver_settings")).backgroundEffect,
      ),
      id,
    );
    assert.equal(await page.locator(".theme-choice.selected").count(), 0);
    await page
      .getByRole("link", { name: "Yozish maydoniga", exact: true })
      .click();
    await page.locator(".scene-" + id).waitFor();
    await page.waitForTimeout(700);
    assert.equal(await page.locator(".premium-background").count(), 1);
    if (!["stars", "matrix", "fireflies"].includes(id))
      assert.ok(
        await page
          .locator(".premium-background")
          .evaluate((e) =>
            e
              .getAnimations({ subtree: true })
              .some((a) => a.playState === "running"),
          ),
      );
    await page.screenshot({
      path: join(artifacts, "yozaver-premium-" + id + ".png"),
    });
    if (["matrix", "fireflies"].includes(id)) {
      const signature = () =>
        page.locator(".atmosphere-canvas").evaluate((c) => {
          const data = c
            .getContext("2d")
            .getImageData(0, 0, c.width, c.height).data;
          let hash = 0;
          for (let i = 0; i < data.length; i += 37)
            hash = (Math.imul(hash, 31) ^ data[i]) >>> 0;
          return hash;
        });
      const before = await signature();
      await page.waitForTimeout(300);
      assert.notEqual(await signature(), before, id + " canvas must animate");
      await page.evaluate(() => {
        Object.defineProperty(document, "hidden", {
          value: true,
          configurable: true,
        });
        document.dispatchEvent(new Event("visibilitychange"));
      });
      await page.waitForFunction(
        () =>
          document.querySelector(".premium-background").dataset.paused ===
          "true",
      );
      await page.waitForTimeout(100);
      const frozen = await signature();
      await page.waitForTimeout(200);
      assert.equal(await signature(), frozen, id + " must stop while hidden");
      await page.evaluate(() => {
        delete document.hidden;
        document.dispatchEvent(new Event("visibilitychange"));
      });
    }
    if (["mercury", "tunnel", "kinetic", "matrix", "fireflies"].includes(id)) {
      await page.reload({ waitUntil: "networkidle" });
      await page.locator(".scene-" + id).waitFor();
      const input = page.getByRole("textbox", {
        name: "Yozish testi uchun matn kiritish",
      });
      await input.pressSequentially("a");
      assert.equal(
        await input.inputValue(),
        "a",
        "Background must allow typing",
      );
      await page.setViewportSize({ width: 390, height: 844 });
      await page.waitForTimeout(200);
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      );
      await page.screenshot({
        path: join(artifacts, "yozaver-new-mobile-" + id + ".png"),
      });
      await page.setViewportSize({ width: 1440, height: 900 });
    }

    await page.getByRole("link", { name: "Sozlamalar", exact: true }).click();
    await page.waitForFunction(
      () => !document.querySelector(".premium-background"),
    );
  }
  await page
    .getByRole("link", { name: "Yozish maydoniga", exact: true })
    .click();
  await page.locator(".starfield-canvas").waitFor();
  const pixels = () =>
    page.locator(".starfield-canvas").evaluate((c) => c.toDataURL());
  const first = await pixels();
  await page.waitForTimeout(300);
  assert.notEqual(
    await pixels(),
    first,
    "Starfield must animate projected depth",
  );
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      value: true,
      configurable: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await page.waitForFunction(
    () =>
      document.querySelector(".premium-background").dataset.paused === "true",
  );
  await page.waitForTimeout(100);
  const paused = await pixels();
  await page.waitForTimeout(160);
  assert.equal(await pixels(), paused, "Hidden tab must stop drawing");
  await page.evaluate(() => {
    delete document.hidden;
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.waitForFunction(
    () =>
      document.querySelector(".premium-background").dataset.paused === "true",
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(150);
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  await page.screenshot({
    path: join(artifacts, "yozaver-premium-mobile.png"),
  });
  await page.getByRole("link", { name: "Sozlamalar", exact: true }).click();
  await page.setViewportSize({ width: 320, height: 700 });
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  await page.getByRole("button", { name: "Moviy temasini tanlash" }).click();
  await page.getByRole("link", { name: "Yozish testi", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Yozish testi uchun matn kiritish" })
    .waitFor();
  assert.equal(await page.locator(".premium-background").count(), 0);
  // Exercise the deployment callback without sending any real Google credentials.
  await page.route("**/auth/me", (r) =>
    r.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        id: "callback-test",
        name: "Test",
        email: "test@example.test",
        role: "USER",
      }),
    }),
  );
  await page.goto(origin + "/auth/callback#token=test-fragment-token");
  await page.getByRole("link", { name: "Profilim", exact: true }).waitFor();
  assert.equal(
    await page.evaluate(() => localStorage.getItem("yozaver_token")),
    "test-fragment-token",
  );
  assert.equal(new URL(page.url()).hash, "");
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify(
      {
        status: "PASS",
        checks: [
          "ten selectable animated scenes",
          "selection persistence",
          "CSS 3D animations",
          "starfield changes depth",
          "route cleanup",
          "hidden-tab pause",
          "OS reduced motion",
          "390 and 320px layouts",
          "base theme removes animation",
          "Google token fragment callback",
        ],
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
