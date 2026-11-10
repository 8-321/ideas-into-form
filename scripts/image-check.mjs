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
};

await fsp.mkdir(SHOTS, { recursive: true });
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
const url = (route) => `http://127.0.0.1:${PORT}${route}`;
const same = (values) => new Set(values.map((value) => Math.round(value * 10) / 10)).size <= 1;
const report = { image: {}, experience: {}, responsive: {}, removedCopy: {}, errors, failed };

async function go(route) {
  await page.goto(url(route), { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForNetworkIdle({ idleTime: 450, timeout: 12000 }).catch(() => {});
  await page.evaluate(async () => {
    document.documentElement.style.scrollBehavior = "auto";
    await document.fonts.ready;
  });
  await wait(650);
}

async function shot(name) {
  await page.screenshot({ path: path.join(SHOTS, `${name}.png`) });
}

async function imageState() {
  return page.evaluate(() => {
    const folders = [...document.querySelectorAll(".image-folder")];
    const boxes = folders.map((node) => {
      const rect = node.getBoundingClientRect();
      return { width: +rect.width.toFixed(1), height: +rect.height.toFixed(1) };
    });
    const images = [...document.images];
    return {
      folders: folders.length,
      accents: folders.map((node) => node.getAttribute("data-accent")),
      boxes,
      defaultReveal: folders.map((node) => getComputedStyle(node).getPropertyValue("--reveal").trim()),
      defaultColorOpacity: folders.map((node) => getComputedStyle(node.querySelector(".image-folder__color")).opacity),
      baseFit: folders.map((node) => getComputedStyle(node.querySelector(".image-folder__base")).objectFit),
      colorFit: folders.map((node) => getComputedStyle(node.querySelector(".image-folder__color")).objectFit),
      broken: images.filter((image) => image.complete && image.naturalWidth === 0).map((image) => image.currentSrc || image.src),
      overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      text: document.body.innerText,
    };
  });
}

async function hoverThirdFolder() {
  const folder = await page.$(".image-folder:nth-child(3)");
  if (!folder) throw new Error("Missing third image folder");
  const box = await folder.boundingBox();
  if (!box) throw new Error("Image folder has no box");
  await page.mouse.move(box.x + box.width * 0.64, box.y + box.height * 0.42, { steps: 8 });
  await wait(650);
  return page.evaluate(() => {
    const folder = document.querySelector(".image-folder:nth-child(3)");
    const color = folder?.querySelector(".image-folder__color");
    const root = document.querySelector(".image-catalog");
    return {
      reveal: folder ? getComputedStyle(folder).getPropertyValue("--reveal").trim() : null,
      opacity: color ? getComputedStyle(color).opacity : null,
      accent: folder?.getAttribute("data-accent"),
      pageAccent: root ? root.style.getPropertyValue("--page-accent").trim() : null,
    };
  });
}

async function openFolder(selector = ".image-folder:nth-child(1)") {
  const trigger = await page.$(selector);
  if (!trigger) throw new Error(`Missing folder trigger ${selector}`);
  await trigger.click();
  await wait(850);
}

async function closeOverlay() {
  await page.keyboard.press("Escape");
  await wait(350);
}

async function readerState() {
  return page.evaluate(() => {
    const overlay = document.querySelector(".archive-overlay");
    const photos = [...document.querySelectorAll(".archive-cover__photo")];
    const photoBoxes = photos.map((node) => {
      const rect = node.getBoundingClientRect();
      return { width: +rect.width.toFixed(1), height: +rect.height.toFixed(1) };
    });
    const tiles = [...document.querySelectorAll(".archive-tile img")];
    const art = document.querySelector(".archive-cover__art");
    const artRect = art?.getBoundingClientRect();
    return {
      open: Boolean(overlay),
      folder: overlay?.getAttribute("data-folder"),
      photos: photoBoxes,
      photoFit: photos.map((node) => getComputedStyle(node.querySelector("img")).objectFit),
      page: document.querySelector(".archive-nav__progress span")?.textContent?.trim(),
      tiles: tiles.length,
      tileFit: tiles.map((node) => getComputedStyle(node).objectFit),
      series: document.querySelector(".archive-page__title h2")?.textContent?.trim(),
      orbit: Boolean(document.querySelector(".cover-orbit")),
      orbitTotal: Number(document.querySelector(".cover-orbit")?.getAttribute("data-total") ?? 0),
      orbitFit: document.querySelector(".cover-orbit__image img") ? getComputedStyle(document.querySelector(".cover-orbit__image img")).objectFit : null,
      art: artRect ? { width: +artRect.width.toFixed(1), height: +artRect.height.toFixed(1), position: getComputedStyle(art).position, opacity: getComputedStyle(art).opacity } : null,
      overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
}

async function experienceState() {
  return page.evaluate(() => {
    const reel = [...document.querySelectorAll(".film-hero__still")];
    const reelBoxes = reel.map((node) => {
      const rect = node.getBoundingClientRect();
      return { width: +rect.width.toFixed(1), height: +rect.height.toFixed(1), group: node.getAttribute("data-group") };
    });
    const screen = document.querySelector(".screening__screen");
    const screenRect = screen?.getBoundingClientRect();
    const frames = [...document.querySelectorAll(".film-frame")];
    return {
      overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      text: document.body.innerText,
      reel: reelBoxes,
      reelFit: reel.map((node) => getComputedStyle(node.querySelector(".film-artwork__image")).objectFit),
      heroCoverFit: getComputedStyle(document.querySelector(".film-hero__frame img")).objectFit,
      titleTop: document.querySelector(".film-hero__copy h1")?.getBoundingClientRect().top,
      screenTop: document.querySelector(".film-hero__screen-wrap")?.getBoundingClientRect().top,
      screen: screenRect ? {
        width: +screenRect.width.toFixed(1),
        height: +screenRect.height.toFixed(1),
        ratio: +(screenRect.width / screenRect.height).toFixed(3),
        group: screen?.getAttribute("data-group"),
        artwork: screen?.getAttribute("data-artwork"),
        className: screen?.className,
        imageFit: getComputedStyle(screen.querySelector(".film-artwork__image")).objectFit,
      } : null,
      frames: frames.map((node) => {
        const rect = node.getBoundingClientRect();
        const img = node.querySelector(".film-frame__img")?.getBoundingClientRect();
        return {
          group: node.getAttribute("data-group"),
          artwork: node.getAttribute("data-artwork"),
          width: +rect.width.toFixed(1),
          imageHeight: img ? +img.height.toFixed(1) : null,
          imageFit: getComputedStyle(node.querySelector(".film-artwork__image")).objectFit,
        };
      }),
      programme: [...document.querySelectorAll(".programme-row__still")].map((node) => {
        const rect = node.getBoundingClientRect();
        return {
          group: node.getAttribute("data-group"),
          artwork: node.getAttribute("data-artwork"),
          width: +rect.width.toFixed(1),
          height: +rect.height.toFixed(1),
          imageFit: getComputedStyle(node.querySelector(".film-artwork__image")).objectFit,
        };
      }),
    };
  });
}

async function selectTab(label) {
  const clicked = await page.evaluate((needle) => {
    const button = [...document.querySelectorAll(".cinema__tabs button")].find((node) => node.textContent?.includes(needle));
    if (!button) return false;
    button.click();
    return true;
  }, label);
  if (!clicked) throw new Error(`Missing cinema tab ${label}`);
  await wait(650);
}

// Image desktop: one frame size, seven palettes, grey by default, colour on hover.
await go("/image/");
report.image.desktop = await imageState();
report.image.hover = await hoverThirdFolder();
await page.evaluate(() => document.querySelector(".catalog-grid")?.scrollIntoView({ block: "start", behavior: "instant" }));
await wait(500);
await shot("check-image-grid-1512");
await hoverThirdFolder();
await shot("check-image-hover-1512");

// Folder book: cover collage, page turn, 98-item 100 DAYS orbit.
await openFolder(".image-folder:nth-child(1)");
report.image.cover = await readerState();
await shot("check-image-cover-1512");
await page.keyboard.press("ArrowRight");
await wait(950);
report.image.orbit = await readerState();
await shot("check-image-orbit-1512");
await closeOverlay();

report.removedCopy.image = ["所有画面", "HONESTY", "视觉档案", "长理建筑线稿", "MATERIAL NOTE", "01 / VIDEO", "02 / DECK"].filter((copy) => report.image.desktop.text.includes(copy));

// Image mobile: two columns, last card centred, no horizontal overflow, overlay still complete.
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
await go("/image/");
report.responsive.image390 = await imageState();
await page.evaluate(() => document.querySelector(".catalog-grid")?.scrollIntoView({ block: "start", behavior: "instant" }));
await wait(350);
await shot("check-image-grid-390");
await openFolder(".image-folder:nth-child(1)");
report.responsive.image390Cover = await readerState();
await shot("check-image-cover-390");
await closeOverlay();

// Experience desktop: shared covers, portrait guzheng, uniform poster frames.
await page.setViewport({ width: 1512, height: 950, deviceScaleFactor: 1 });
await go("/experience/");
report.experience.desktop = await experienceState();
await shot("check-experience-1512");
await page.evaluate(() => document.querySelector("#b-screenings")?.scrollIntoView({ block: "start", behavior: "instant" }));
await wait(500);
await selectTab("古筝");
report.experience.guzheng = await experienceState();
await shot("check-experience-guzheng-1512");

// Player poster uses the group cover, not an individual video poster.
await page.click(".screening__screen");
await wait(500);
report.experience.guzhengPoster = await page.evaluate(() => document.querySelector(".cine-modal video")?.getAttribute("poster"));
await page.keyboard.press("Escape");
await wait(350);
await selectTab("钢琴");
report.experience.piano = await experienceState();
await page.click(".screening__screen");
await wait(500);
report.experience.pianoPoster = await page.evaluate(() => document.querySelector(".cine-modal video")?.getAttribute("poster"));
await page.keyboard.press("Escape");
await wait(300);
await page.evaluate(() => document.querySelector("#c-programme")?.scrollIntoView({ block: "start", behavior: "instant" }));
await wait(500);
await shot("check-experience-programme-1512");

report.removedCopy.experience = ["所有画面", "HONESTY", "视觉档案", "长理建筑线稿", "MATERIAL NOTE", "01 / VIDEO", "02 / DECK", "03 / HONESTY"].filter((copy) => report.experience.desktop.text.includes(copy));

// Experience mobile: title first, then image; portrait guzheng stays 9:16.
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
await go("/experience/");
report.responsive.experience390 = await experienceState();
await shot("check-experience-390");
await page.evaluate(() => document.querySelector("#b-screenings")?.scrollIntoView({ block: "start", behavior: "instant" }));
await wait(400);
await selectTab("古筝");
report.responsive.experience390Guzheng = await experienceState();
await shot("check-experience-guzheng-390");

// 1280 sanity check.
await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });
await go("/image/");
report.responsive.image1280 = await imageState();
await go("/experience/");
report.responsive.experience1280 = await experienceState();

const checks = [
  ["image folder count", report.image.desktop.folders === 7],
  ["image unique palettes", new Set(report.image.desktop.accents).size === 7],
  ["image uniform card size", same(report.image.desktop.boxes.map((box) => box.width)) && same(report.image.desktop.boxes.map((box) => box.height))],
  ["image starts grey", report.image.desktop.defaultColorOpacity.every((value) => value === "0")],
  ["image contains originals", [...report.image.desktop.baseFit, ...report.image.desktop.colorFit].every((value) => value === "contain")],
  ["image hover reveals colour", report.image.hover.reveal === "1" && report.image.hover.opacity === "1" && report.image.hover.pageAccent === report.image.hover.accent],
  ["image no overflow desktop", report.image.desktop.overflowX === 0],
  ["image no overflow mobile", report.responsive.image390.overflowX === 0],
  ["image no overflow 1280", report.responsive.image1280.overflowX === 0],
  ["cover collage complete", report.image.cover.photos.length === 4 && report.image.cover.photoFit.every((value) => value === "contain")],
  ["cover collage uniform", same(report.image.cover.photos.map((box) => box.width)) && same(report.image.cover.photos.map((box) => box.height))],
  ["100 DAYS orbit complete", report.image.orbit.orbit && report.image.orbit.orbitTotal === 98],
  ["100 DAYS orbit contains originals", report.image.orbit.orbitFit === "contain"],
  ["archive tiles contain originals", report.image.orbit.tileFit.every((value) => value === "contain")],
  ["mobile book art visible", report.responsive.image390Cover.art?.position === "relative" && report.responsive.image390Cover.art?.opacity === "1"],
  ["mobile book no overflow", report.responsive.image390Cover.overflowX === 0],
  ["removed image copy absent", report.removedCopy.image.length === 0],
  ["experience hero has four equal posters", report.experience.desktop.reel.length === 4 && same(report.experience.desktop.reel.map((box) => box.width)) && same(report.experience.desktop.reel.map((box) => box.height))],
  ["experience hero contains covers", report.experience.desktop.reelFit.every((value) => value === "contain")],
  ["experience hero hero contains cover", report.experience.desktop.heroCoverFit === "contain"],
  ["experience no overflow", report.experience.desktop.overflowX === 0 && report.responsive.experience390.overflowX === 0 && report.responsive.experience1280.overflowX === 0],
  ["experience mobile title first", report.responsive.experience390.titleTop < report.responsive.experience390.screenTop],
  ["guzheng is portrait", report.experience.guzheng.screen?.group === "guzheng" && report.experience.guzheng.screen?.ratio < 0.6 && report.experience.guzheng.screen?.className.includes("is-portrait")],
  ["guzheng cover reused", report.experience.guzheng.screen?.artwork.endsWith("/guzheng-cover.webp") && report.experience.guzheng.frames.length === 2 && new Set(report.experience.guzheng.frames.map((frame) => frame.artwork)).size === 1],
  ["guzheng strip contains original", report.experience.guzheng.frames.every((frame) => frame.imageFit === "contain")],
  ["guzheng player poster", report.experience.guzhengPoster?.endsWith("/guzheng-cover.webp")],
  ["piano cover reused", report.experience.piano.frames.length === 5 && new Set(report.experience.piano.frames.map((frame) => frame.artwork)).size === 1 && report.experience.piano.frames[0]?.artwork.includes("piano-cover")],
  ["piano player poster", report.experience.pianoPoster?.endsWith("/piano-cover.webp")],
  ["programme posters uniform", report.experience.piano.programme.length === 4 && same(report.experience.piano.programme.map((box) => box.width)) && same(report.experience.piano.programme.map((box) => box.height))],
  ["programme contains originals", report.experience.piano.programme.every((box) => box.imageFit === "contain")],
  ["removed experience copy absent", report.removedCopy.experience.length === 0],
  ["no broken images", report.image.desktop.broken.length === 0 && report.responsive.image390.broken.length === 0],
  ["no browser errors", errors.length === 0 && failed.filter((item) => !item.includes("ERR_ABORTED")).length === 0],
];

const failures = checks.filter(([, ok]) => !ok).map(([name]) => name);
report.checks = Object.fromEntries(checks);
report.failures = failures;
await fsp.writeFile(path.join(SHOTS, "image-check.json"), JSON.stringify(report, null, 2), "utf8");

console.log(JSON.stringify({
  failures,
  folders: report.image.desktop.folders,
  palettes: new Set(report.image.desktop.accents).size,
  coverPhotos: report.image.cover.photos.length,
  orbit: report.image.orbit.orbitTotal,
  guzhengScreen: report.experience.guzheng.screen,
  guzhengFrames: report.experience.guzheng.frames.length,
  pianoFrames: report.experience.piano.frames.length,
  programmeSize: report.experience.piano.programme[0],
  errors: errors.length,
  failedRequests: failed.filter((item) => !item.includes("ERR_ABORTED")).length,
}, null, 2));

await browser.close();
await new Promise((resolve) => server.close(resolve));
process.exitCode = failures.length ? 1 : 0;
