import http from "node:http";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ROOT = path.join(SITE, "out");
const PORT = 3013;
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".mp4": "video/mp4", ".m4a": "audio/mp4", ".pdf": "application/pdf", ".json": "application/json" };
const server = http.createServer(async (req, res) => {
  try {
    const u = new URL(req.url, "http://x");
    let f = path.join(ROOT, decodeURIComponent(u.pathname));
    if (f.endsWith(path.sep)) f = path.join(f, "index.html");
    if (!path.extname(f) && fs.existsSync(path.join(f, "index.html"))) f = path.join(f, "index.html");
    const d = await fsp.readFile(f);
    res.writeHead(200, { "content-type": MIME[path.extname(f)] ?? "application/octet-stream" });
    res.end(d);
  } catch { res.writeHead(404); res.end("404"); }
});
await new Promise((r) => server.listen(PORT, "127.0.0.1", r));

const browser = await puppeteer.launch({
  executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  headless: "new",
  args: ["--no-sandbox", "--hide-scrollbars", "--mute-audio", "--autoplay-policy=no-user-gesture-required"],
  defaultViewport: { width: 1440, height: 900 },
});
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e.message)));
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
const results = {};
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const go = async (p) => { await page.goto(`http://127.0.0.1:${PORT}${p}`, { waitUntil: "networkidle2" }); await page.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; }); await wait(500); };

// 1. audio
await go("/sound/");
await page.evaluate(() => document.querySelector("#c-player").scrollIntoView({ block: "center", behavior: "instant" }));
await wait(400);
await page.click(".issue .btn");
await wait(2200);
results.audioPlaying = await page.evaluate(() => {
  const a = document.querySelector("audio");
  return { paused: a?.paused, currentTime: +(a?.currentTime ?? 0).toFixed(2), duration: +(a?.duration ?? 0).toFixed(1), src: a?.currentSrc.split("/").pop() };
});
await page.screenshot({ path: path.join(SITE, ".shots", "audio-playing.png") });
await page.click(".player__play");
await wait(300);
results.audioPaused = await page.evaluate(() => document.querySelector("audio")?.paused);

// 2. cinema
await go("/experience/");
await page.evaluate(() => document.querySelector("#b-screenings").scrollIntoView({ block: "start", behavior: "instant" }));
await wait(500);
await page.click(".screening__screen");
await wait(1200);
results.cinemaOpen = await page.evaluate(() => {
  const v = document.querySelector(".cine-modal video");
  return { modal: !!document.querySelector(".cine-modal"), paused: v?.paused, duration: +(v?.duration ?? 0).toFixed(2), src: v?.currentSrc.split("/").pop(), title: document.querySelector(".cine-modal__bar b")?.textContent };
});
await page.screenshot({ path: path.join(SITE, ".shots", "cinema-modal.png") });
const before = await page.evaluate(() => document.querySelector(".cine-modal video")?.currentSrc);
await page.keyboard.press("ArrowRight");
await wait(900);
results.cinemaNext = await page.evaluate((b) => {
  const v = document.querySelector(".cine-modal video");
  return { changed: v?.currentSrc !== b, src: v?.currentSrc.split("/").pop(), title: document.querySelector(".cine-modal__bar b")?.textContent };
}, before);
await page.keyboard.press("Escape");
await wait(400);
results.cinemaClosed = await page.evaluate(() => !document.querySelector(".cine-modal"));

// 3. decks
await page.evaluate(() => document.querySelector("#d-decks").scrollIntoView({ block: "start", behavior: "instant" }));
await wait(500);
const deckSrc0 = await page.evaluate(() => document.querySelector(".deck-stage__image img")?.getAttribute("src"));
await page.evaluate(() => document.querySelectorAll(".deck-item")[3].click());
await wait(800);
results.deckSwitch = await page.evaluate((s0) => {
  const img = document.querySelector(".deck-stage__image img");
  return { changed: img?.getAttribute("src") !== s0, src: img?.getAttribute("src"), count: document.querySelector(".deck-stage__count")?.textContent };
}, deckSrc0);
for (let i = 0; i < 14; i++) { await page.evaluate(() => document.querySelector(".deck-stage__nav--next")?.click()); }
await wait(600);
results.deckGuard = await page.evaluate(() => ({ count: document.querySelector(".deck-stage__count")?.textContent, src: document.querySelector(".deck-stage__image img")?.getAttribute("src") }));
await page.evaluate(() => document.querySelectorAll(".deck-item")[0].click());
await wait(600);
await page.screenshot({ path: path.join(SITE, ".shots", "deck-viewer.png") });

// 4. lightbox
await go("/work/100-days/");
await page.evaluate(() => document.querySelector(".work-gallery")?.scrollIntoView({ block: "start", behavior: "instant" }));
await wait(500);
await page.evaluate(() => document.querySelector(".work-gallery .media-btn")?.click());
await wait(500);
results.lightbox = await page.evaluate(() => ({ open: !!document.querySelector(".lightbox"), count: document.querySelector(".lightbox__count")?.textContent }));
await page.keyboard.press("Escape");
await wait(300);
results.lightboxClosed = await page.evaluate(() => !document.querySelector(".lightbox"));

// 5. motion + menu
await go("/");
results.motionBefore = await page.evaluate(() => document.documentElement.dataset.reduce);
await page.click(".switch");
await wait(300);
results.motionAfter = await page.evaluate(() => document.documentElement.dataset.reduce);
await page.click(".switch");
await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
await wait(400);
await page.click(".menu-btn");
await wait(400);
results.mobileMenu = await page.evaluate(() => ({ open: document.querySelector("#site-menu")?.classList.contains("is-open"), items: document.querySelectorAll("#site-menu .menu__item").length }));
await page.screenshot({ path: path.join(SITE, ".shots", "m-menu.png") });

// 6. all work pages + internal links
const html = await page.content();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
const slugs = fs.readdirSync(path.join(ROOT, "work")).filter((d) => fs.existsSync(path.join(ROOT, "work", d, "index.html")));
const workAudit = [];
for (const slug of slugs) {
  await go(`/work/${slug}/`);
  await page.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.82);
    for (let y = 0; y < document.body.scrollHeight; y += step) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 35)); }
    window.scrollTo(0, 0);
  });
  await wait(350);
  workAudit.push(await page.evaluate(() => ({
    title: document.title,
    h1: document.querySelector(".work-hero h1")?.textContent,
    images: document.images.length,
    broken: [...document.images].filter((i) => i.complete && i.naturalWidth === 0).length,
    sections: document.querySelectorAll(".work-section").length,
    next: document.querySelectorAll(".work-end__card").length,
  })));
}
results.workPages = workAudit;

const hrefs = await page.evaluate(() => [...new Set([...document.querySelectorAll("a[href^='/']")].map((a) => a.getAttribute("href")))]);
const linkAudit = [];
for (const href of hrefs) {
  const url = `http://127.0.0.1:${PORT}${href}`;
  const status = await new Promise((resolve) => {
    http.get(url, (res) => { res.resume(); resolve(res.statusCode); }).on("error", () => resolve(0));
  });
  linkAudit.push({ href, status });
}
results.links = linkAudit;

// 7. media files
const media = JSON.parse(fs.readFileSync(path.join(SITE, "src", "content", "media.json"), "utf8"));
const refs = [
  ...media.audio.map((a) => a.src),
  ...Object.values(media.videos).flat().flatMap((v) => [v.src, v.poster]),
  ...media.files.flatMap((d) => [d.pdf, ...d.slides.map((s) => s.src)]),
].filter(Boolean);
results.media = refs.map((r) => {
  const f = path.join(ROOT, decodeURIComponent(r.replace(/^\//, "")));
  const ok = fs.existsSync(f);
  return { path: r, ok, bytes: ok ? fs.statSync(f).size : 0 };
});

results.errors = errors;
results.summary = {
  workPages: workAudit.length,
  brokenWorkImages: workAudit.filter((w) => w.broken).length,
  invalidLinks: linkAudit.filter((l) => l.status !== 200),
  missingMedia: results.media.filter((m) => !m.ok || !m.bytes),
  consoleErrors: errors,
};
await fsp.writeFile(path.join(SITE, ".shots", "interaction.json"), JSON.stringify(results, null, 2), "utf8");
console.log(JSON.stringify(results.summary, null, 2));
console.log("audio", JSON.stringify(results.audioPlaying), "paused", results.audioPaused);
console.log("cinema", JSON.stringify(results.cinemaOpen), "next", JSON.stringify(results.cinemaNext), "closed", results.cinemaClosed);
console.log("deck", JSON.stringify(results.deckSwitch), "guard", JSON.stringify(results.deckGuard));
console.log("lightbox", JSON.stringify(results.lightbox), "closed", results.lightboxClosed);
console.log("motion", results.motionBefore, "->", results.motionAfter, "menu", JSON.stringify(results.mobileMenu));
console.log("works", workAudit.length, "links", linkAudit.length, "media", results.media.length);
await browser.close();
await new Promise((r) => server.close(r));