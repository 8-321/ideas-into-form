import http from "node:http";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ROOT = path.join(SITE, "out");
const SHOTS = path.join(SITE, ".shots");
const PORT = 3017;
const EDGE = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".mp4": "video/mp4", ".m4a": "audio/mp4", ".pdf": "application/pdf", ".json": "application/json" };

await fsp.mkdir(SHOTS, { recursive: true });
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://x");
    let file = path.join(ROOT, decodeURIComponent(url.pathname));
    if (file.endsWith(path.sep)) file = path.join(file, "index.html");
    if (!path.extname(file) && fs.existsSync(path.join(file, "index.html"))) file = path.join(file, "index.html");
    const data = await fsp.readFile(file);
    res.writeHead(200, { "content-type": MIME[path.extname(file)] ?? "application/octet-stream" });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end("404");
  }
});
await new Promise((resolve) => server.listen(PORT, "127.0.0.1", resolve));

const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: "new",
  args: ["--no-sandbox", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1"],
  defaultViewport: { width: 1512, height: 950, deviceScaleFactor: 1 },
});

const page = await browser.newPage();
const errors = [];
const failed = [];
page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
page.on("pageerror", (error) => errors.push(`PAGEERROR: ${error.message}`));
page.on("requestfailed", (request) => failed.push(`${request.failure()?.errorText} ${request.url()}`));

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const report = {};

async function go(pathname = "/image/") {
  await page.goto(`http://127.0.0.1:${PORT}${pathname}`, { waitUntil: "networkidle2", timeout: 45000 });
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; });
  await page.evaluate(() => document.fonts.ready);
  await wait(800);
}

async function shot(name) {
  await page.screenshot({ path: path.join(SHOTS, `${name}.png`), fullPage: false });
}

async function settleImages(selector) {
  await page.evaluate(async (query) => {
    const images = Array.from(document.querySelectorAll(query));
    await Promise.all(images.map((image) => new Promise((resolve) => {
      if (image.complete) {
        resolve();
        return;
      }
      const done = () => resolve();
      image.addEventListener("load", done, { once: true });
      image.addEventListener("error", done, { once: true });
      window.setTimeout(done, 5000);
    })));
  }, selector);
}

await go();
await settleImages(".image-masthead img");
report.desktop = await page.evaluate(() => {
  const folders = Array.from(document.querySelectorAll(".image-folder"));
  const boxes = folders.map((node) => {
    const rect = node.getBoundingClientRect();
    return { width: +rect.width.toFixed(2), height: +rect.height.toFixed(2) };
  });
  const images = Array.from(document.images);
  const heroTitle = document.querySelector(".image-masthead h1")?.getBoundingClientRect();
  const heroEn = document.querySelector(".image-masthead__en")?.getBoundingClientRect();
  const heroCollage = document.querySelector(".image-masthead__collage")?.getBoundingClientRect();
  const titleRight = Math.max(heroTitle?.right ?? 0, heroEn?.right ?? 0);
  return {
    folders: folders.length,
    boxes,
    uniqueWidths: [...new Set(boxes.map((box) => box.width))].length,
    uniqueHeights: [...new Set(boxes.map((box) => box.height))].length,
    images: images.length,
    broken: images.filter((image) => image.complete && image.naturalWidth === 0).map((image) => image.currentSrc),
    heroPhotos: document.querySelectorAll(".image-masthead__photo").length,
    heroIncomplete: Array.from(document.querySelectorAll(".image-masthead__photo img")).filter((image) => !image.complete || image.naturalWidth === 0).length,
    heroGap: heroCollage ? +(heroCollage.left - titleRight).toFixed(1) : null,
    decorCount: document.querySelectorAll(".image-masthead__geometry, .image-folder__crease, .image-folders__seal, .archive-mark, .archive-book__spine, .archive-book__edge").length,
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    rails: document.querySelectorAll(".rail, .rail__viewport, .days-rail").length,
    heroText: document.querySelector(".image-masthead h1")?.textContent,
    counts: document.querySelector(".image-masthead__counts")?.textContent?.replace(/\s+/g, " ").trim(),
  };
});
await shot("image-top");
await page.evaluate(() => document.querySelector(".image-folders")?.scrollIntoView({ block: "start", behavior: "instant" }));
await wait(450);
await shot("image-folders");

await page.$eval(".image-folder", (element) => element.click());
await wait(950);
await settleImages(".archive-overlay img");
report.cover = await page.evaluate(() => ({
  open: Boolean(document.querySelector(".archive-overlay")),
  letter: document.querySelector(".archive-cover__letter")?.textContent,
  markCount: document.querySelectorAll(".archive-mark path, .archive-mark circle, .archive-mark rect").length,
  photos: document.querySelectorAll(".archive-cover__photo img").length,
  incomplete: Array.from(document.querySelectorAll(".archive-cover__photo img")).filter((image) => !image.complete || image.naturalWidth === 0).length,
  overlayGrid: getComputedStyle(document.querySelector(".archive-overlay"), "::before").backgroundImage,
  bookBefore: getComputedStyle(document.querySelector(".archive-book"), "::before").content,
  bookAfter: getComputedStyle(document.querySelector(".archive-book"), "::after").content,
  pageLabel: document.querySelector(".archive-nav__progress .mono")?.textContent?.replace(/\s+/g, " ").trim(),
  bodyOverflow: document.body.style.overflow,
}));
await shot("image-archive-cover");

await page.keyboard.press("ArrowRight");
await wait(1000);
await settleImages(".cover-orbit img");
report.orbit = await page.evaluate(() => ({
  exists: Boolean(document.querySelector(".cover-orbit")),
  auto: document.querySelector(".cover-orbit")?.getAttribute("data-auto"),
  active: document.querySelector(".cover-orbit")?.getAttribute("data-active"),
  cards: document.querySelectorAll(".cover-orbit__card").length,
  counter: document.querySelector(".cover-orbit__counter")?.textContent?.replace(/\s+/g, " ").trim(),
  label: document.querySelector(".archive-page__shape")?.textContent?.replace(/\s+/g, " ").trim(),
  incomplete: Array.from(document.querySelectorAll(".cover-orbit img")).filter((image) => !image.complete || image.naturalWidth === 0).length,
  turnDone: !document.querySelector(".archive-turn"),
}));
await shot("image-days-carousel");

await page.$eval(".cover-orbit__card.is-active", (element) => element.click());
await wait(650);
report.lightbox = await page.evaluate(() => ({
  open: Boolean(document.querySelector(".lightbox")),
  count: document.querySelector(".lightbox__count")?.textContent?.replace(/\s+/g, " ").trim(),
  archiveInert: document.querySelector(".archive-overlay")?.hasAttribute("inert"),
}));
await page.keyboard.press("Escape");
await wait(420);
report.lightboxClosed = await page.evaluate(() => ({
  lightbox: Boolean(document.querySelector(".lightbox")),
  archive: Boolean(document.querySelector(".archive-overlay")),
  bodyOverflow: document.body.style.overflow,
}));

await page.keyboard.press("ArrowRight");
await wait(950);
await settleImages(".archive-page img");
report.grid = await page.evaluate(() => ({
  shape: document.querySelector(".archive-page")?.getAttribute("data-shape"),
  rows: document.querySelector(".archive-page__grid")?.getAttribute("data-rows"),
  tiles: document.querySelectorAll(".archive-tile").length,
  title: document.querySelector(".archive-page__title h2")?.textContent,
  shapeLabel: document.querySelector(".archive-page__shape")?.textContent?.replace(/\s+/g, " ").trim(),
  incomplete: Array.from(document.querySelectorAll(".archive-page img")).filter((image) => !image.complete || image.naturalWidth === 0).length,
}));
await shot("image-archive-grid");

await page.$eval(".archive-tile", (element) => element.click());
await wait(500);
report.gridLightbox = await page.evaluate(() => ({
  open: Boolean(document.querySelector(".lightbox")),
  count: document.querySelector(".lightbox__count")?.textContent?.replace(/\s+/g, " ").trim(),
}));
await page.keyboard.press("Escape");
await wait(350);
await page.keyboard.press("Escape");
await wait(500);
report.closed = await page.evaluate(() => ({
  archive: Boolean(document.querySelector(".archive-overlay")),
  bodyOverflow: document.body.style.overflow,
  focus: document.activeElement?.className,
}));

report.folderSweep = [];
for (let folderIndex = 0; folderIndex < 7; folderIndex += 1) {
  await page.evaluate((index) => document.querySelectorAll(".image-folder")[index]?.click(), folderIndex);
  await wait(650);
  const label = await page.evaluate(() => document.querySelector(".archive-nav__progress .mono")?.textContent?.replace(/\s+/g, " ").trim());
  const total = Number(label?.split("/")[1]?.trim() ?? 0);
  const pages = [];
  for (let pageNumber = 1; pageNumber < total; pageNumber += 1) {
    await page.keyboard.press("ArrowRight");
    await wait(860);
    await settleImages(".archive-page img, .cover-orbit img");
    const info = await page.evaluate(() => {
      const book = document.querySelector(".archive-book")?.getBoundingClientRect();
      const pageNode = document.querySelector(".archive-page");
      const tiles = Array.from(document.querySelectorAll(".archive-tile"));
      const tileRects = tiles.map((node) => node.getBoundingClientRect());
      const pageImages = Array.from(pageNode?.querySelectorAll("img") ?? []);
      const broken = pageImages.filter((image) => image.complete && image.naturalWidth === 0).length;
      const incomplete = pageImages.filter((image) => !image.complete || image.naturalWidth === 0).length;
      return {
        title: document.querySelector(".archive-page__title h2")?.textContent,
        shape: pageNode?.getAttribute("data-shape"),
        orbit: Boolean(document.querySelector(".cover-orbit")),
        tiles: tiles.length,
        rows: document.querySelector(".archive-page__grid")?.getAttribute("data-rows"),
        overflow: Boolean(book) && tileRects.some((rect) => rect.left < book.left - 2 || rect.right > book.right + 2 || rect.top < book.top - 2 || rect.bottom > book.bottom + 2),
        broken,
        incomplete,
        pageScroll: pageNode ? pageNode.scrollHeight - pageNode.clientHeight : 0,
      };
    });
    pages.push({ pageNumber: pageNumber + 1, ...info });
    if (folderIndex === 2 && pageNumber === 1) await shot("image-archive-landscape");
    if (folderIndex === 5 && pageNumber === 2) await shot("image-archive-wide");
  }
  report.folderSweep.push({ letter: String.fromCharCode(65 + folderIndex), label, total, pages });
  await page.keyboard.press("Escape");
  await wait(350);
}

await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await go();
report.mobile = await page.evaluate(() => {
  const folders = Array.from(document.querySelectorAll(".image-folder"));
  const boxes = folders.map((node) => {
    const rect = node.getBoundingClientRect();
    return { x: +rect.x.toFixed(1), width: +rect.width.toFixed(1) };
  });
  return {
    folders: folders.length,
    columns: getComputedStyle(document.querySelector(".image-folders")).gridTemplateColumns.split(" ").length,
    boxes: boxes.slice(0, 3),
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    bodyHeight: document.body.scrollHeight,
  };
});
await shot("image-mobile");
await page.$eval(".image-folder", (element) => element.click());
await wait(700);
await page.keyboard.press("ArrowRight");
await wait(850);
report.mobileOrbit = await page.evaluate(() => ({
  exists: Boolean(document.querySelector(".cover-orbit")),
  cards: document.querySelectorAll(".cover-orbit__card").length,
  overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
}));
await shot("image-days-carousel-mobile");
await page.keyboard.press("ArrowRight");
await wait(900);
report.mobileGrid = await page.evaluate(() => ({
  shape: document.querySelector(".archive-page")?.getAttribute("data-shape"),
  tiles: document.querySelectorAll(".archive-tile").length,
  overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  scrollHeight: document.querySelector(".archive-page")?.scrollHeight,
  clientHeight: document.querySelector(".archive-page")?.clientHeight,
}));
await shot("image-archive-grid-mobile");
await page.keyboard.press("Escape");
await wait(400);

await page.evaluate(() => localStorage.setItem("iif-motion", "off"));
await page.setViewport({ width: 1512, height: 950, deviceScaleFactor: 1, isMobile: false, hasTouch: false });
await go();
await page.$eval(".image-folder", (element) => element.click());
await wait(600);
await page.keyboard.press("ArrowRight");
await wait(700);
const before = await page.evaluate(() => document.querySelector(".cover-orbit")?.getAttribute("data-active"));
await wait(4000);
report.motionOff = await page.evaluate((previous) => ({
  auto: document.querySelector(".cover-orbit")?.getAttribute("data-auto"),
  before: previous,
  after: document.querySelector(".cover-orbit")?.getAttribute("data-active"),
  turn: Boolean(document.querySelector(".archive-turn")),
}), before);
await page.keyboard.press("Escape");
await wait(300);

report.errors = [...new Set(errors)];
report.failed = [...new Set(failed)];
report.summary = {
  folderCount: report.desktop.folders,
  uniformWidth: Math.max(...report.desktop.boxes.map((box) => box.width)) - Math.min(...report.desktop.boxes.map((box) => box.width)) < 0.1,
  uniformHeight: Math.max(...report.desktop.boxes.map((box) => box.height)) - Math.min(...report.desktop.boxes.map((box) => box.height)) < 0.1,
  noRail: report.desktop.rails === 0,
  noOverflow: [report.desktop, report.mobile, report.mobileOrbit, report.mobileGrid].every((item) => item.overflowX === 0),
  heroClear: report.desktop.heroGap > 12,
  heroRealPhotos: report.desktop.heroPhotos === 6 && report.desktop.heroIncomplete === 0,
  noSimpleDecor: report.desktop.decorCount === 0 && report.cover.markCount === 0,
  cleanPaper: report.cover.overlayGrid === "none" && report.cover.bookBefore === "none" && report.cover.bookAfter === "none",
  coverPhotos: report.cover.photos === 5 && report.cover.incomplete === 0,
  coverOpens: report.cover.open,
  orbit98: report.orbit.counter?.includes("098"),
  lightbox98: report.lightbox.count?.includes("98"),
  lightboxCloseKeepsArchive: !report.lightboxClosed.lightbox && report.lightboxClosed.archive,
  motionOffPaused: report.motionOff.auto === "off" && report.motionOff.before === report.motionOff.after,
  allPagesClean: report.folderSweep.every((folder) => folder.pages.every((entry) => !entry.overflow && entry.broken === 0 && entry.incomplete === 0)),
  allImagesLoaded: report.orbit.incomplete === 0 && report.grid.incomplete === 0,
  folderPageTotal: report.folderSweep.reduce((sum, folder) => sum + folder.total, 0),
  errors: report.errors.length,
  failed: report.failed.length,
};

console.log(JSON.stringify(report, null, 2));
await fsp.writeFile(path.join(SHOTS, "image-check.json"), JSON.stringify(report, null, 2), "utf8");
await browser.close();
await new Promise((resolve) => server.close(resolve));
