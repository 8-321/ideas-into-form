import http from "node:http";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "out");
const SHOTS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", ".shots");
const EDGE = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const PORT = 3011;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".mp4": "video/mp4",
  ".m4a": "audio/mp4",
  ".pdf": "application/pdf",
  ".txt": "text/plain; charset=utf-8",
};

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? "/", `http://127.0.0.1:${PORT}`);
    let file = path.join(ROOT, decodeURIComponent(url.pathname));
    if (file.endsWith(path.sep)) file = path.join(file, "index.html");
    if (!path.extname(file) && fs.existsSync(path.join(file, "index.html"))) file = path.join(file, "index.html");
    const data = await fsp.readFile(file);
    res.writeHead(200, { "content-type": MIME[path.extname(file)] ?? "application/octet-stream", "cache-control": "no-store" });
    res.end(data);
  } catch {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("404");
  }
});

await fsp.mkdir(SHOTS, { recursive: true });
await new Promise((resolve) => server.listen(PORT, "127.0.0.1", resolve));
console.log("server", PORT);

const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: "new",
  args: ["--no-sandbox", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1"],
  defaultViewport: { width: 1512, height: 950, deviceScaleFactor: 1 },
});

const report = { pages: [], consoleErrors: [], requestFailures: [] };

async function settle(page, ms = 700) {
  await new Promise((r) => setTimeout(r, ms));
}

async function scrollThrough(page) {
  await page.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.72);
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 55));
    }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 240));
  });
}

async function audit(page, label, opts = {}) {
  const errors = [];
  const failed = [];
  page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });
  page.on("pageerror", (err) => errors.push(`PAGEERROR: ${err.message}`));
  page.on("requestfailed", (req) => failed.push(`${req.failure()?.errorText} ${req.url()}`));

  const url = `http://127.0.0.1:${PORT}${opts.path}`;
  await page.goto(url, { waitUntil: "networkidle2", timeout: 45000 });
  await settle(page, 900);
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; });
  await scrollThrough(page);
  await settle(page, 500);

  const stats = await page.evaluate(() => {
    const imgs = Array.from(document.images);
    return {
      title: document.title,
      images: imgs.length,
      broken: imgs.filter((img) => img.complete && img.naturalWidth === 0).map((img) => img.currentSrc || img.src).slice(0, 12),
      pending: imgs.filter((img) => !img.complete).length,
      fonts: document.fonts.status,
      serif: document.fonts.check('16px "Noto Serif SC"'),
      bodyHeight: document.body.scrollHeight,
      links: document.querySelectorAll("a").length,
    };
  });

  if (opts.y !== undefined) {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), opts.y);
    await settle(page, 450);
  }
  if (opts.selector) {
    await page.evaluate((sel) => { const el = document.querySelector(sel); el?.scrollIntoView({ block: "start", behavior: "instant" }); }, opts.selector);
    await settle(page, 650);
  }
  await page.screenshot({ path: path.join(SHOTS, `${label}.png`), fullPage: false });

  report.pages.push({ label, path: opts.path, ...stats, errors: [...new Set(errors)], failed: [...new Set(failed)] });
  console.log(label, JSON.stringify({ title: stats.title, images: stats.images, broken: stats.broken.length, errors: errors.length, failed: failed.length }));

  page.removeAllListeners("console");
  page.removeAllListeners("pageerror");
  page.removeAllListeners("requestfailed");
}

const page = await browser.newPage();

const desktop = [
  ["home-top", "/", { y: 0 }],
  ["home-selected", "/", { selector: ".selected" }],
  ["home-chapters", "/", { selector: ".chapters" }],
  ["image-top", "/image/", { y: 0 }],
  ["sound-top", "/sound/", { y: 0 }],
  ["sound-archive", "/sound/", { selector: "#c-player" }],
  ["experience-top", "/experience/", { y: 0 }],
  ["experience-screen", "/experience/", { selector: "#b-screenings" }],
  ["experience-decks", "/experience/", { selector: "#d-decks" }],
  ["work-panda", "/work/panda-ip/", { y: 0 }],
  ["work-panda-body", "/work/panda-ip/", { selector: ".work-text" }],
  ["work-audio", "/work/audio-collection/", { selector: "#main" }],
  ["work-film", "/work/film-archive/", { y: 0 }],
  ["work-wolf", "/work/wolf-design/", { y: 0 }],
];

for (const [label, p, opts] of desktop) {
  await audit(page, label, { path: p, ...opts });
}

await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const mobile = [
  ["m-home", "/", {}],
  ["m-sound", "/sound/", {}],
  ["m-experience", "/experience/", {}],
  ["m-work", "/work/100-days/", {}],
];
for (const [label, p, opts] of mobile) {
  await audit(page, label, { path: p, ...opts });
}

await fsp.writeFile(path.join(SHOTS, "audit.json"), JSON.stringify(report, null, 2), "utf8");
console.log("REPORT", JSON.stringify({
  pages: report.pages.length,
  withBrokenImages: report.pages.filter((p) => p.broken.length).map((p) => [p.label, p.broken.length]),
  withErrors: report.pages.filter((p) => p.errors.length).map((p) => [p.label, p.errors]),
  withFailed: report.pages.filter((p) => p.failed.length).map((p) => [p.label, p.failed.slice(0, 5)]),
}, null, 2));

await browser.close();
await new Promise((resolve) => server.close(resolve));