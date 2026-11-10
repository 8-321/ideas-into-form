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
    const stage = document.querySelector(".catalog-stage");
    const folders = [...document.querySelectorAll(".catalog-feature")];
    const slides = [...document.querySelectorAll(".catalog-slide")];
    const folder = folders[0];
    const box = folder ? { width: folder.offsetWidth, height: folder.offsetHeight } : null;
    const nav = document.querySelector(".catalog-nav");
    const navBox = nav?.getBoundingClientRect();
    const images = [...document.images];
    return {
      total: Number(stage?.getAttribute("data-total") ?? 0),
      active: stage?.getAttribute("data-active"),
      slides: slides.length,
      folders: folders.length,
      accents: folders.map((node) => node.getAttribute("data-accent")),
      boxes: box ? [{ width: box.width, height: box.height }] : [],
      defaultReveal: folders.map((node) => getComputedStyle(node).getPropertyValue("--reveal").trim()),
      defaultColorOpacity: folders.map((node) => getComputedStyle(node.querySelector(".catalog-feature__color")).opacity),
      baseFit: folders.map((node) => getComputedStyle(node.querySelector(".catalog-feature__base")).objectFit),
      colorFit: folders.map((node) => getComputedStyle(node.querySelector(".catalog-feature__color")).objectFit),
      echoes: [...document.querySelectorAll(".catalog-echo")].map((node) => ({
        display: getComputedStyle(node).display,
        fit: getComputedStyle(node.querySelector("img")).objectFit,
      })),
      railTicks: document.querySelectorAll(".catalog-rail__tick").length,
      railActive: document.querySelector(".catalog-rail__tick.is-active span")?.textContent?.trim(),
      legacy: document.querySelectorAll(".catalog-grid, .image-folder").length,
      broken: images.filter((image) => image.complete && image.naturalWidth === 0).map((image) => image.currentSrc || image.src),
      overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      navBottom: navBox ? +navBox.bottom.toFixed(1) : null,
      viewportHeight: window.innerHeight,
      pageHeight: document.documentElement.scrollHeight,
      text: document.body.innerText,
    };
  });
}

async function stageState() {
  return page.evaluate(() => {
    const stage = document.querySelector(".catalog-stage");
    const folder = document.querySelector(".catalog-feature");
    const color = folder?.querySelector(".catalog-feature__color");
    const box = folder ? { width: folder.offsetWidth, height: folder.offsetHeight } : null;
    const root = document.querySelector(".image-catalog");
    return {
      active: stage?.getAttribute("data-active"),
      folderCount: document.querySelectorAll(".catalog-feature").length,
      slideCount: document.querySelectorAll(".catalog-slide").length,
      accent: folder?.getAttribute("data-accent"),
      pageAccent: root ? getComputedStyle(root).getPropertyValue("--page-accent").trim() : null,
      box,
      baseFit: folder ? getComputedStyle(folder.querySelector(".catalog-feature__base")).objectFit : null,
      colorFit: color ? getComputedStyle(color).objectFit : null,
      echoCount: document.querySelectorAll(".catalog-echo").length,
      railActive: document.querySelector(".catalog-rail__tick.is-active span")?.textContent?.trim(),
    };
  });
}

async function clickNextFolder() {
  const clicked = await page.evaluate(() => {
    const button = document.querySelector('.catalog-nav button[aria-label="下一个文件夹"]');
    if (!button) return false;
    button.click();
    return true;
  });
  if (!clicked) throw new Error("Missing next folder button");
  await wait(1040);
  return stageState();
}

async function hoverFolder() {
  const folder = await page.$(".catalog-feature");
  if (!folder) throw new Error("Missing image folder");
  const box = await folder.boundingBox();
  if (!box) throw new Error("Image folder has no box");
  await page.mouse.move(box.x + box.width * 0.64, box.y + box.height * 0.42, { steps: 8 });
  await wait(650);
  return page.evaluate(() => {
    const folder = document.querySelector(".catalog-feature");
    const color = folder?.querySelector(".catalog-feature__color");
    const root = document.querySelector(".image-catalog");
    return {
      reveal: folder ? getComputedStyle(folder).getPropertyValue("--reveal").trim() : null,
      opacity: color ? getComputedStyle(color).opacity : null,
      accent: folder?.getAttribute("data-accent"),
      pageAccent: root ? root.style.getPropertyValue("--page-accent").trim() : null,
      echoFilter: document.querySelector(".catalog-echo img") ? getComputedStyle(document.querySelector(".catalog-echo img")).filter : null,
      stackTransform: document.querySelector(".catalog-cover-stack") ? getComputedStyle(document.querySelector(".catalog-cover-stack")).transform : null,
    };
  });
}

async function rightClickNextFolder() {
  await page.evaluate(() => {
    window.__catalogContextPrevented = null;
    document.addEventListener("contextmenu", (event) => {
      window.__catalogContextPrevented = event.defaultPrevented;
    }, { once: true });
  });
  const stage = await page.$(".catalog-stage");
  if (!stage) throw new Error("Missing catalog stage");
  const box = await stage.boundingBox();
  if (!box) throw new Error("Catalog stage has no box");
  await page.mouse.click(box.x + box.width * 0.58, box.y + box.height * 0.48, { button: "right" });
  await wait(1040);
  return page.evaluate(() => ({
    prevented: window.__catalogContextPrevented,
    active: document.querySelector(".catalog-stage")?.getAttribute("data-active"),
  }));
}

async function openFolder(selector = ".catalog-feature") {
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

// Image desktop: one folder at a time, seven palettes, grey by default, colour on hover.
await go("/image/");
report.image.desktop = await imageState();
await page.mouse.move(2, 2);
await wait(300);
await shot("check-image-stage-1512");
report.image.hover = await hoverFolder();
await shot("check-image-hover-1512");
report.image.motion = await page.evaluate(() => ({
  coverAnimation: getComputedStyle(document.querySelector(".catalog-cover-stage")).animationName,
  detailAnimation: getComputedStyle(document.querySelector(".catalog-detail")).animationName,
  tilt: getComputedStyle(document.querySelector(".image-catalog")).getPropertyValue("--tilt-x").trim(),
}));
report.image.reduced = await page.evaluate(() => {
  document.documentElement.dataset.reduce = "true";
  const stage = document.querySelector(".catalog-cover-stage");
  const detail = document.querySelector(".catalog-detail");
  const stack = document.querySelector(".catalog-cover-stack");
  const result = {
    coverAnimation: stage ? getComputedStyle(stage).animationName : null,
    detailAnimation: detail ? getComputedStyle(detail).animationName : null,
    stackTransform: stack ? getComputedStyle(stack).transform : null,
  };
  document.documentElement.dataset.reduce = "false";
  return result;
});

const tour = [await stageState()];
tour.push(await clickNextFolder());
await page.keyboard.press("ArrowRight");
await wait(1040);
tour.push(await stageState());
report.image.rightClick = await rightClickNextFolder();
tour.push(await stageState());
while (tour.length < 7) tour.push(await clickNextFolder());
await shot("check-image-stage-G-1512");
report.image.tour = {
  states: tour,
  wrap: await clickNextFolder(),
};

// Folder book: cover collage, page turn, 98-item 100 DAYS orbit.
await openFolder(".catalog-feature");
report.image.cover = await readerState();
await shot("check-image-cover-1512");
await page.keyboard.press("ArrowRight");
await wait(950);
report.image.orbit = await readerState();
await shot("check-image-orbit-1512");
await closeOverlay();

report.removedCopy.image = ["所有画面", "HONESTY", "视觉档案", "长理建筑线稿", "MATERIAL NOTE", "01 / VIDEO", "02 / DECK"].filter((copy) => report.image.desktop.text.includes(copy));

// Image mobile: one folder at a time, no horizontal overflow, overlay still complete.
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
await go("/image/");
report.responsive.image390 = await imageState();
await shot("check-image-stage-390");
await openFolder(".catalog-feature");
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
await shot("check-image-stage-1280");
await go("/experience/");
report.responsive.experience1280 = await experienceState();

const checks = [
  ["image folder total", report.image.desktop.total === 7],
  ["image one folder per stage", report.image.desktop.folders === 1 && report.image.desktop.slides === 1],
  ["image echo stack present", report.image.desktop.echoes.length === 2 && report.image.desktop.echoes.every((echo) => echo.display !== "none" && echo.fit === "contain")],
  ["image folder rail present", report.image.desktop.railTicks === 7 && report.image.desktop.railActive === "A"],
  ["image legacy grid removed", report.image.desktop.legacy === 0],
  ["image tour reaches all folders", report.image.tour.states.map((state) => state.active).join("") === "ABCDEFG"],
  ["image tour wraps", report.image.tour.wrap.active === "A"],
  ["image right click advances", report.image.rightClick.prevented === true && report.image.rightClick.active === "D"],
  ["image one folder after navigation", report.image.tour.states.every((state) => state.folderCount === 1 && state.slideCount === 1 && state.echoCount === 2)],
  ["image rail follows folder", report.image.tour.states.every((state) => state.railActive === state.active)],
  ["image unique palettes", new Set(report.image.tour.states.map((state) => state.accent)).size === 7],
  ["image palette follows folder", report.image.tour.states.every((state) => state.pageAccent === state.accent)],
  ["image uniform card size", report.image.tour.states.every((state) => state.box && same([state.box.width, report.image.desktop.boxes[0].width])) && same(report.image.tour.states.map((state) => state.box?.height ?? 0))],
  ["image starts grey", report.image.desktop.defaultColorOpacity.every((value) => value === "0")],
  ["image contains originals", report.image.tour.states.every((state) => state.baseFit === "contain" && state.colorFit === "contain")],
  ["image hover reveals colour", report.image.hover.reveal === "1" && Number(report.image.hover.opacity) > 0.95 && report.image.hover.pageAccent === report.image.hover.accent],
  ["image hover chroma echoes", String(report.image.hover.echoFilter).includes("grayscale(0)")],
  ["image cover follows pointer", report.image.motion.tilt !== "" && report.image.hover.stackTransform !== "none"],
  ["image stage animates", String(report.image.motion.coverAnimation).includes("catalog-cover-in") && String(report.image.motion.detailAnimation).includes("catalog-detail-in")],
  ["image motion off is static", report.image.reduced.coverAnimation === "none" && report.image.reduced.detailAnimation === "none" && report.image.reduced.stackTransform === "none"],
  ["image no overflow desktop", report.image.desktop.overflowX === 0],
  ["image no overflow mobile", report.responsive.image390.overflowX === 0],
  ["image no overflow 1280", report.responsive.image1280.overflowX === 0],
  ["image mobile stays minimal", report.responsive.image390.echoes.every((echo) => echo.display === "none")],
  ["image stage fits first viewport", [report.image.desktop, report.responsive.image390, report.responsive.image1280].every((state) => state.navBottom <= state.viewportHeight + 0.5)],
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
  folders: report.image.desktop.total,
  visibleFolders: report.image.desktop.folders,
  tour: report.image.tour.states.map((state) => state.active).join(""),
  rightClick: report.image.rightClick,
  palettes: new Set(report.image.tour.states.map((state) => state.accent)).size,
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
