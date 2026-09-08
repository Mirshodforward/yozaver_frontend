/* Run with a local test server. Authentication fixtures are isolated to this browser. */
import { createRequire } from "node:module";
import assert from "node:assert/strict";
import { tmpdir } from "node:os";
import { join } from "node:path";
const loadModule = createRequire(import.meta.url);
const { chromium } = loadModule(process.env.PLAYWRIGHT_MODULE || "playwright");
const origin = process.env.TEST_ORIGIN || "http://localhost:3000";
const artifacts = process.env.TEST_ARTIFACTS || tmpdir();
(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 1050 },
    });
    const errors = [];
    const downloads = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("request", (r) => {
      if (r.url().includes("/audio/")) downloads.push(r.url());
    });
    await page.addInitScript(() => {
      window.__keySamples = [];
      window.__keyContexts = [];
      const Original = window.AudioContext;
      window.AudioContext = new Proxy(Original, {
        construct(target, args) {
          const c = new target(...args);
          window.__keyContexts.push(c);
          return c;
        },
      });
      const start = AudioBufferSourceNode.prototype.start;
      AudioBufferSourceNode.prototype.start = function (...args) {
        if (this.buffer) {
          const data = this.buffer.getChannelData(0);
          let power = 0,
            signature = 0;
          for (let i = 0; i < data.length; i++) {
            power += data[i] * data[i];
            signature += data[i] * (i % 37);
          }
          window.__keySamples.push({ power, length: data.length, signature });
        }
        return start.apply(this, args);
      };
    });
    await page.route("**/words?**", (r) => r.abort());
    await page.goto(origin + "/settings", { waitUntil: "networkidle" });
    assert.equal(downloads.length, 0, "Music must not preload all six files");
    assert.equal(
      await page.getByRole("button", { name: /temasini tanlash/ }).count(),
      6,
    );
    const themes = [
      ["cobalt", "Moviy"],
      ["paper", "Qog‘oz"],
      ["midnight", "Tun"],
      ["forest", "O‘rmon"],
      ["sunset", "Shafaq"],
      ["lavender", "Lavanda"],
    ];
    for (const [id, name] of themes) {
      await page
        .getByRole("button", { name: `${name} temasini tanlash` })
        .click();
      assert.equal(await page.locator("html").getAttribute("data-theme"), id);
      assert.equal(
        await page.evaluate(
          () => JSON.parse(localStorage.getItem("yozaver_settings")).theme,
        ),
        id,
      );
    }
    await page.screenshot({
      path: join(artifacts, "yozaver-settings-appearance.png"),
      fullPage: true,
    });
    await page.reload({ waitUntil: "networkidle" });
    assert.equal(
      await page.locator("html").getAttribute("data-theme"),
      "lavender",
    );
    await page
      .getByRole("button", { name: "Musiqa va tovush", exact: true })
      .click();
    const tracks = [
      ["sokin-ohang", "Sokin ohang"],
      ["tong", "Tong nafasi"],
      ["tun", "Tungi osmon"],
      ["yomgir", "Yomg‘ir"],
      ["dengiz", "Dengiz"],
      ["lofi", "Lo-fi ritm"],
    ];
    for (const [id, name] of tracks) {
      await page
        .getByRole("button", { name: `${name} musiqasini eshitish` })
        .click();
      await page.waitForFunction((id) => {
        const a = document.querySelector("audio[data-yozaver-music]");
        return a?.dataset.track === id && !a.paused && a.currentTime > 0.04;
      }, id);
      assert.equal(await page.locator("audio[data-yozaver-music]").count(), 1);
      assert.equal(
        await page.evaluate(
          () => JSON.parse(localStorage.getItem("yozaver_settings")).musicTrack,
        ),
        "sokin-ohang",
        "Preview must not apply a track",
      );
    }
    await page
      .getByRole("button", { name: "Tungi osmon musiqasini tanlash" })
      .click();
    assert.equal(
      await page.evaluate(
        () => JSON.parse(localStorage.getItem("yozaver_settings")).musicTrack,
      ),
      "tun",
    );
    await page.getByRole("button", { name: "To‘xtatish", exact: true }).click();
    const sounds = [
      ["soft", "Mayin"],
      ["mechanical", "Mexanik"],
      ["typewriter", "Yozuv mashinkasi"],
      ["wood", "Yog‘och"],
      ["bubble", "Pufakcha"],
      ["digital", "Raqamli"],
    ];
    for (const [, name] of sounds) {
      await page
        .getByRole("button", { name: `${name} tovushini eshitish` })
        .click();
      await page.waitForTimeout(140);
      assert.equal(
        await page.evaluate(
          () => JSON.parse(localStorage.getItem("yozaver_settings")).keySound,
        ),
        "soft",
        "Sound preview must not apply",
      );
    }
    const samples = await page.evaluate(() => window.__keySamples);
    assert.equal(samples.length, 6);
    assert.ok(samples.every((s) => s.power > 0.001));
    assert.equal(new Set(samples.map((s) => s.signature.toFixed(5))).size, 6);
    await page
      .getByRole("switch", { name: "Tugma tovushi", exact: true })
      .click();
    assert.equal(
      await page
        .getByRole("switch", { name: "Tugma tovushi", exact: true })
        .getAttribute("aria-checked"),
      "false",
    );
    await page
      .getByRole("button", { name: "Yog‘och tovushini o‘rnatish" })
      .click();
    assert.equal(
      await page
        .getByRole("switch", { name: "Tugma tovushi", exact: true })
        .getAttribute("aria-checked"),
      "true",
    );
    assert.equal(
      await page.evaluate(
        () => JSON.parse(localStorage.getItem("yozaver_settings")).keySound,
      ),
      "wood",
    );
    await page.evaluate(() => window.__keyContexts.at(-1).close());
    await page
      .getByRole("button", { name: "Yog‘och tovushini eshitish" })
      .click();
    await page.waitForTimeout(150);
    assert.equal(
      await page.evaluate(() => window.__keyContexts.at(-1).state),
      "running",
      "Closed key audio contexts must recover",
    );
    await page.screenshot({
      path: join(artifacts, "yozaver-settings-audio.png"),
      fullPage: true,
    });
    await page
      .getByRole("button", { name: "Yozish sozlamalari", exact: true })
      .click();
    await page.getByRole("button", { name: "English", exact: true }).click();
    await page.getByRole("button", { name: "So‘zlar", exact: true }).click();
    await page.getByRole("button", { name: "10", exact: true }).click();
    await page.getByRole("switch", { name: "Virtual klaviatura" }).click();
    await page.getByRole("button", { name: "Ko‘rinish", exact: true }).click();
    await page.getByRole("button", { name: "Monospace", exact: true }).click();
    await page.getByRole("button", { name: "Katta", exact: true }).click();
    await page
      .getByRole("switch", { name: "Animatsiyalarni kamaytirish" })
      .click();
    await page
      .getByRole("link", { name: "Yozish maydoniga", exact: true })
      .click();
    const input = page.getByRole("textbox", {
      name: "Yozish testi uchun matn kiritish",
    });
    await input.waitFor();
    assert.equal(await page.locator(".typing-word").count(), 10);
    assert.equal(
      await page
        .getByRole("button", { name: "English", exact: true })
        .getAttribute("aria-pressed"),
      "true",
    );
    assert.equal(await page.locator(".keyboard-preview").count(), 1);
    assert.equal(
      await page.locator("html").getAttribute("data-motion"),
      "reduced",
    );
    {
      const fonts = await page
        .locator(".typing-text")
        .evaluate((e) => ({
          actual: getComputedStyle(e).fontFamily,
          expected: getComputedStyle(document.documentElement)
            .getPropertyValue("--font-geist-mono")
            .trim(),
        }));
      assert.ok(
        fonts.actual
          .replaceAll(String.fromCharCode(34), "")
          .startsWith(fonts.expected.replaceAll(String.fromCharCode(34), "")),
      );
    }
    const before = await page.evaluate(() => window.__keySamples.length);
    await input.pressSequentially("ab");
    await page.waitForTimeout(150);
    assert.ok((await page.evaluate(() => window.__keySamples.length)) > before);
    await page.getByRole("button", { name: "Ovozni o‘chirish" }).click();
    const silent = await page.evaluate(() => window.__keySamples.length);
    await input.pressSequentially("c");
    await page.waitForTimeout(100);
    assert.equal(await page.evaluate(() => window.__keySamples.length), silent);
    await page.reload({ waitUntil: "networkidle" });
    assert.equal(
      await page
        .getByRole("button", { name: "Ovozni yoqish" })
        .getAttribute("aria-pressed"),
      "false",
    );
    await page.getByRole("link", { name: "Sozlamalar", exact: true }).click();
    await page
      .getByRole("button", { name: "Shaxsiy fon", exact: true })
      .click();
    assert.equal(
      await page
        .getByRole("button", { name: "Rasm tanlash", exact: true })
        .count(),
      0,
    );
    await page.getByRole("link", { name: "Google orqali kirish" }).waitFor();
    await page.getByRole("button", { name: "Ko‘rinish", exact: true }).click();
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({
      path: join(artifacts, "yozaver-settings-mobile.png"),
      fullPage: true,
    });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    await page.setViewportSize({ width: 320, height: 700 });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    // Simulate authenticated accounts only inside this isolated browser context.
    let account = "alice";
    await page.route("**/auth/me", (r) =>
      r.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          id: account,
          name: "Test " + account,
          email: account + "@example.test",
          avatarUrl: null,
          role: "USER",
          createdAt: new Date().toISOString(),
        }),
      }),
    );
    await page.evaluate(() =>
      localStorage.setItem("yozaver_token", "settings-test-fixture"),
    );
    await page.reload({ waitUntil: "networkidle" });
    await page
      .getByRole("button", { name: "Shaxsiy fon", exact: true })
      .click();
    const image = await page.evaluate(() => {
      const c = document.createElement("canvas");
      c.width = 2400;
      c.height = 1200;
      const ctx = c.getContext("2d");
      const g = ctx.createLinearGradient(0, 0, 2400, 1200);
      g.addColorStop(0, "#4e79a3");
      g.addColorStop(1, "#bde1b8");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 2400, 1200);
      return c.toDataURL("image/png").split(",")[1];
    });
    const upload = page.getByLabel("Galereyadan fon rasmini tanlash");
    await upload.setInputFiles({
      name: "gallery.png",
      mimeType: "image/png",
      buffer: Buffer.from(image, "base64"),
    });
    await page.waitForFunction(
      () => document.documentElement.dataset.customBackground === "true",
    );
    const data = await page.evaluate(async () => {
      const db = await new Promise((resolve, reject) => {
        const r = indexedDB.open("yozaver-personal");
        r.onsuccess = () => resolve(r.result);
        r.onerror = reject;
      });
      const saved = await new Promise((resolve) => {
        const r = db
          .transaction("backgrounds")
          .objectStore("backgrounds")
          .get("alice");
        r.onsuccess = () => resolve(r.result);
      });
      const bitmap = await createImageBitmap(saved.blob);
      const result = { width: bitmap.width, size: saved.blob.size };
      bitmap.close();
      db.close();
      return result;
    });
    assert.ok(data.width <= 1920);
    assert.ok(data.size < 500000);
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForFunction(
      () => document.documentElement.dataset.customBackground === "true",
    );
    account = "bob";
    await page.reload({ waitUntil: "networkidle" });
    await page
      .getByRole("button", { name: "Shaxsiy fon", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Rasm tanlash", exact: true })
      .waitFor();
    assert.equal(await page.locator(".custom-wallpaper").count(), 0);
    account = "alice";
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForFunction(
      () => document.documentElement.dataset.customBackground === "true",
    );
    await page
      .getByRole("button", { name: "Shaxsiy fon", exact: true })
      .click();
    await upload.setInputFiles({
      name: "fake.png",
      mimeType: "image/png",
      buffer: Buffer.from("not an image"),
    });
    await page
      .getByRole("alert")
      .filter({ hasText: "Rasm ochilmadi" })
      .waitFor();
    await page
      .getByRole("button", { name: "Rasmni o‘chirish", exact: true })
      .click();
    await page.waitForFunction(
      () => document.documentElement.dataset.customBackground === "false",
    );
    await page.getByRole("button", { name: "Hisobdan chiqish" }).click();
    assert.equal(await page.locator(".custom-wallpaper").count(), 0);
    assert.deepEqual(errors, []);
    console.log(
      JSON.stringify(
        {
          status: "PASS",
          checks: [
            "6 persistent themes",
            "6 independent music previews",
            "single media stream",
            "preview does not select",
            "track selection persistence",
            "6 distinct audible key buffers",
            "key sound install/mute/persistence",
            "closed audio recovery",
            "saved practice defaults",
            "font/motion/keyboard controls",
            "390 and 320px layouts",
            "guest upload gate",
            "image optimization",
            "image persistence",
            "account-isolated backgrounds",
            "invalid-image handling",
            "background removal/logout",
          ],
          image: data,
        },
        null,
        2,
      ),
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
