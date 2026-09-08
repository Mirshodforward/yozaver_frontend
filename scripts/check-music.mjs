/* Run against a local dev server with Playwright installed, or set PLAYWRIGHT_MODULE. */
import { createRequire } from "node:module";
import assert from "node:assert/strict";
const loadModule = createRequire(import.meta.url);
const { chromium } = loadModule(process.env.PLAYWRIGHT_MODULE || "playwright");
const origin = process.env.TEST_ORIGIN || "http://localhost:3000";
(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(origin, { waitUntil: "networkidle" });
    const play = () =>
      page.getByRole("button", { name: "Fon musiqasini yoqish" }).click();
    const stop = () =>
      page.getByRole("button", { name: "Fon musiqasini o‘chirish" }).click();
    const audio = "audio[data-yozaver-music]";
    await play();
    await page.getByRole("slider", { name: "Musiqa balandligi" }).waitFor();
    await page.waitForTimeout(600);
    assert.ok(
      await page
        .locator(audio)
        .evaluate((a) => !a.paused && a.currentTime > 0 && a.readyState >= 3),
    );
    assert.equal(await page.locator(audio).evaluate((a) => a.volume), 0.45);
    assert.equal(await page.locator(audio).evaluate((a) => a.loop), true);
    // Measure decoded samples on the actual playback graph, not just a UI flag.
    await page.evaluate(async () => {
      const media = document.querySelector("audio[data-yozaver-music]");
      const context = new AudioContext();
      const source = context.createMediaElementSource(media);
      const analyser = context.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      analyser.connect(context.destination);
      await context.resume();
      window.musicMeter = { context, analyser, media };
    });
    const rms = () =>
      page.evaluate(async () => {
        const analyser = window.musicMeter.analyser;
        let maximum = 0;
        for (let i = 0; i < 12; i++) {
          const data = new Float32Array(analyser.fftSize);
          analyser.getFloatTimeDomainData(data);
          maximum = Math.max(
            maximum,
            Math.sqrt(data.reduce((sum, x) => sum + x * x, 0) / data.length),
          );
          await new Promise((resolve) => setTimeout(resolve, 50));
        }
        return maximum;
      });
    const normal = await rms();
    assert.ok(
      normal > 0.02,
      `Actual default audio signal too quiet: ${normal}`,
    );
    await page.getByRole("slider", { name: "Musiqa balandligi" }).fill("0");
    await page.waitForTimeout(250);
    assert.equal(
      await page
        .getByRole("slider", { name: "Musiqa balandligi" })
        .inputValue(),
      "0",
    );
    assert.ok((await rms()) < 0.0001, "Mute must produce silence");
    await page.getByRole("slider", { name: "Musiqa balandligi" }).fill("80");
    assert.ok((await rms()) > normal, "Volume increase must increase output");
    await stop();
    assert.equal(await page.locator(audio).evaluate((a) => a.paused), true);
    await play();
    await page.getByRole("slider", { name: "Musiqa balandligi" }).waitFor();
    await page.locator(audio).evaluate((a) => {
      a.currentTime = a.duration - 0.2;
    });
    await page.waitForTimeout(800);
    assert.ok(
      await page.locator(audio).evaluate((a) => a.currentTime < 2 && !a.paused),
      "Track must loop",
    );
    await page.locator(audio).evaluate((a) => a.pause());
    await page.getByRole("button", { name: "Fon musiqasini yoqish" }).waitFor();
    await play();
    await page.getByRole("slider", { name: "Musiqa balandligi" }).waitFor();
    await page.getByRole("link", { name: "Analitika", exact: true }).click();
    await page
      .getByRole("heading", { name: "Har bir mashq hisobda." })
      .waitFor();
    assert.equal(await page.locator(audio).count(), 1);
    assert.equal(
      await page.evaluate(() => window.musicMeter.media.paused),
      false,
    );
    await page.evaluate(() => window.musicMeter.context.close());
    // A canceled load must not start playback when the response eventually arrives.
    await page.goto(origin, { waitUntil: "networkidle" });
    await page.route("**/audio/sokin-ohang.wav", async (route) => {
      await new Promise((r) => setTimeout(r, 700));
      await route.continue();
    });
    await play();
    await stop();
    await page.waitForTimeout(1000);
    assert.equal(await page.locator(audio).evaluate((a) => a.paused), true);
    assert.equal(
      await page.getByRole("slider", { name: "Musiqa balandligi" }).count(),
      0,
    );
    await page.unroute("**/audio/sokin-ohang.wav");
    // Retry after a missing media file and after a rejected browser play request.
    await page.goto(origin, { waitUntil: "networkidle" });
    await page.route("**/audio/sokin-ohang.wav", (route) =>
      route.fulfill({ status: 404, body: "missing" }),
    );
    await play();
    await page
      .getByRole("status")
      .filter({ hasText: "Musiqa yuklanmadi" })
      .waitFor();
    assert.equal(
      await page.getByRole("slider", { name: "Musiqa balandligi" }).count(),
      0,
    );
    await page.unroute("**/audio/sokin-ohang.wav");
    await play();
    await page.getByRole("slider", { name: "Musiqa balandligi" }).waitFor();
    await page.goto(origin, { waitUntil: "networkidle" });
    await page.evaluate(() => {
      const original = HTMLMediaElement.prototype.play;
      HTMLMediaElement.prototype.play = function () {
        HTMLMediaElement.prototype.play = original;
        return Promise.reject(
          new DOMException("Blocked by test", "NotAllowedError"),
        );
      };
    });
    await play();
    await page
      .getByRole("status")
      .filter({ hasText: "Brauzer ovozni to‘xtatdi" })
      .waitFor();
    await play();
    await page.getByRole("slider", { name: "Musiqa balandligi" }).waitFor();
    await stop();
    assert.deepEqual(errors, []);
    console.log(
      JSON.stringify(
        {
          status: "PASS",
          defaultOutputRms: normal,
          checks: [
            "decoded audible output",
            "45% default volume",
            "mute and volume amplitude",
            "pause/resume",
            "looping",
            "native interruption UI",
            "continuous playback across navigation",
            "cancel while loading",
            "404 and blocked-play retry",
            "no browser exceptions",
          ],
        },
        null,
        2,
      ),
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
