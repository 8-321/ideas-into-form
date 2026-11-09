import http from "node:http";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "out");
const SHOTS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", ".shots");
const EDGE = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const PORT = 3012;
const MIME = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".json": "application/json", ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml", ".woff2": "font/woff2", ".mp4": "video/mp4", ".m4a": "audio/mp4", ".pdf": "application/pdf",
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
const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: "new",
  args: ["--no-sandbox", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1"],
  defaultViewport: { width: 1512, height: 950, deviceScaleFactor: 1 },
});
const page = await browser.newPage();
const errors = [];
page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });
page.on("pageerror", (err) => errors.push(`PAGEERROR: ${err.message}`));
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const url = (route) => `http://127.0.0.1:${PORT}${route}`;

async function activeInfo() {
  return page.evaluate(() => {
    const leaf = document.querySelector(".work-book__pages > [data-leaf].is-reader-active");
    if (!leaf) return null;
    const style = getComputedStyle(leaf);
    return {
      type: leaf.getAttribute("data-leaf-type"),
      label: leaf.getAttribute("data-leaf-label"),
      index: leaf.getAttribute("data-leaf-index"),
      classes: leaf.className,
      animation: style.animationName,
      opacity: style.opacity,
      visibility: style.visibility,
      ariaHidden: leaf.getAttribute("aria-hidden"),
      bodyOverflow: getComputedStyle(document.body).overflow,
    };
  });
}

async function openBook(route) {
  await page.goto(url(route), { waitUntil: "domcontentloaded", timeout: 60000 });
  await wait(900);
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
    document.querySelector(".book-intro")?.scrollIntoView({ block: "start", behavior: "instant" });
  });
  await wait(250);
  await page.click(".book-intro__launch");
  await wait(160);
}

async function turnAndCapture(name, key = "ArrowRight") {
  await page.keyboard.press(key);
  await wait(170);
  const mid = await activeInfo();
  await wait(900);
  const settled = await activeInfo();
  await page.screenshot({ path: path.join(SHOTS, `${name}.png`) });
  return { mid, settled };
}

const report = { reader: [], errors, types: {}, reduced: null, mobile: null, home: {} };

// Project 1: text, steps, gallery, note, placeholder
await page.goto(url("/work/panda-ip/"), { waitUntil: "domcontentloaded", timeout: 60000 });
await wait(900);
report.types.panda = await page.evaluate(() => Array.from(document.querySelectorAll("[data-leaf]")).map((el) => ({ type: el.getAttribute("data-leaf-type"), label: el.getAttribute("data-leaf-label") })));
report.reader.push({ step: "open", mid: await activeInfo() });
await openBook("/work/panda-ip/");
report.reader.push({ step: "panda-01", mid: await activeInfo() });
await wait(900);
await page.screenshot({ path: path.join(SHOTS, "book-panda-01.png") });
for (let index = 1; index < report.types.panda.length; index += 1) {
  report.reader.push({ step: `panda-${index + 1}`, ...(await turnAndCapture(`book-panda-${String(index + 1).padStart(2, "0")}`)) });
}
await page.evaluate(() => {
  const leaf = document.querySelector(".work-book__pages > [data-leaf].is-reader-active");
  leaf?.dispatchEvent(new WheelEvent("wheel", { deltaY: -120, bubbles: true, cancelable: true }));
});
await wait(170);
report.reader.push({ step: "wheel-prev", mid: await activeInfo() });
await wait(900);
await page.keyboard.press("Escape");
await wait(300);
report.reader.push({ step: "closed", closed: await page.evaluate(() => !document.querySelector(".book-reader__layer") && !document.querySelector(".work-book.is-reader")), bodyOverflow: await page.evaluate(() => getComputedStyle(document.body).overflow) });

// Audio leaf
await page.goto(url("/work/audio-collection/"), { waitUntil: "domcontentloaded", timeout: 60000 });
await wait(800);
const audioTypes = await page.evaluate(() => Array.from(document.querySelectorAll("[data-leaf]")).map((el) => el.getAttribute("data-leaf-type")));
report.types.audio = audioTypes;
await openBook("/work/audio-collection/");
const audioIndex = Math.max(0, audioTypes.indexOf("audio"));
if (audioIndex > 0) {
  await page.click(".book-reader__toc");
  await wait(120);
  await page.evaluate((idx) => document.querySelectorAll(".book-toc__list button")[idx]?.click(), audioIndex);
  await wait(320);
  await page.waitForFunction(() => document.querySelector(".work-book__pages > [data-leaf].is-reader-active")?.getAttribute("data-leaf-type") === "audio", { timeout: 2500 }).catch(() => {});
}
report.reader.push({ step: "audio", mid: await activeInfo() });
await wait(1000);
await page.screenshot({ path: path.join(SHOTS, "book-audio.png") });

// Film leaf
await page.goto(url("/work/film-archive/"), { waitUntil: "domcontentloaded", timeout: 60000 });
await wait(800);
const filmTypes = await page.evaluate(() => Array.from(document.querySelectorAll("[data-leaf]")).map((el) => el.getAttribute("data-leaf-type")));
report.types.film = filmTypes;
await openBook("/work/film-archive/");
const filmIndex = Math.max(0, filmTypes.indexOf("film"));
if (filmIndex > 0) {
  await page.click(".book-reader__toc");
  await wait(120);
  await page.evaluate((idx) => document.querySelectorAll(".book-toc__list button")[idx]?.click(), filmIndex);
  await wait(320);
  await page.waitForFunction(() => document.querySelector(".work-book__pages > [data-leaf].is-reader-active")?.getAttribute("data-leaf-type") === "film", { timeout: 2500 }).catch(() => {});
}
report.reader.push({ step: "film", mid: await activeInfo() });
await wait(1100);
await page.screenshot({ path: path.join(SHOTS, "book-film.png") });

// Reduced motion path
await page.evaluate(() => localStorage.setItem("iif-motion", "off"));
await openBook("/work/panda-ip/");
await wait(1100);
report.reduced = await activeInfo();
await page.screenshot({ path: path.join(SHOTS, "book-reduced.png") });
await page.evaluate(() => localStorage.setItem("iif-motion", "on"));

// Mobile reader
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await openBook("/work/panda-ip/");
await wait(1000);
report.mobile = await activeInfo();
await page.screenshot({ path: path.join(SHOTS, "book-mobile.png") });

// Home count + tilt + scroll progress
await page.setViewport({ width: 1512, height: 950, deviceScaleFactor: 1 });
await page.goto(url("/"), { waitUntil: "domcontentloaded", timeout: 60000 });
await wait(900);
await page.evaluate(() => document.querySelector(".manifesto__counts")?.scrollIntoView({ block: "center", behavior: "instant" }));
await wait(70);
report.home.countStart = await page.evaluate(() => Array.from(document.querySelectorAll("[data-count]")).map((el) => el.textContent));
await wait(1900);
report.home.countEnd = await page.evaluate(() => Array.from(document.querySelectorAll("[data-count]")).map((el) => el.textContent));
await page.evaluate(() => document.querySelector(".selected")?.scrollIntoView({ block: "start", behavior: "instant" }));
await wait(700);
const card = await page.$(".work-card");
if (card) {
  const box = await card.boundingBox();
  if (box) {
    await page.mouse.move(20, 20);
    await page.mouse.move(box.x + box.width * 0.74, box.y + box.height * 0.32, { steps: 6 });
    await wait(320);
    report.home.tilt = await page.evaluate(() => {
      const el = document.querySelector(".work-card");
      return { x: getComputedStyle(el).getPropertyValue("--tilt-x").trim(), y: getComputedStyle(el).getPropertyValue("--tilt-y").trim(), transform: getComputedStyle(el).transform };
    });
  }
}
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.55));
await wait(300);
report.home.progress = await page.evaluate(() => getComputedStyle(document.querySelector(".scroll-progress i")).transform);

await fsp.writeFile(path.join(SHOTS, "reader-report.json"), JSON.stringify(report, null, 2), "utf8");
console.log(JSON.stringify(report, null, 2));
await browser.close();
await new Promise((resolve) => server.close(resolve));
process.exit(0);
