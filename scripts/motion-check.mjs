import http from "node:http";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "out");
const SHOTS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", ".shots");
const EDGE = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const PORT = 3014;
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json", ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".mp4": "video/mp4", ".m4a": "audio/mp4", ".pdf": "application/pdf" };

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
const goto = async (route) => {
  await page.goto(`http://127.0.0.1:${PORT}${route}`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; });
  await wait(500);
};
const scrollTo = async (selector) => {
  await page.evaluate((sel) => document.querySelector(sel)?.scrollIntoView({ block: "start", behavior: "instant" }), selector);
  await wait(80);
};
const readFold = () => page.evaluate(() => {
  const heading = document.querySelector(".section-head h2[data-fold='1']");
  if (!heading) return null;
  const lines = [...heading.querySelectorAll(".fold-line > span")];
  return {
    text: heading.textContent,
    fold: heading.dataset.fold,
    inView: heading.classList.contains("is-in"),
    lines: lines.length,
    first: lines[0] ? {
      transform: getComputedStyle(lines[0]).transform,
      opacity: getComputedStyle(lines[0]).opacity,
      filter: getComputedStyle(lines[0]).filter,
    } : null,
  };
});

const report = { fold: {}, magnet: null, glare: null, cursor: null, reduced: null, errors };

// 1. Home section heading folds line by line.
await goto("/");
await scrollTo(".selected");
const foldEarly = await readFold();
await wait(150);
const foldMid = await readFold();
await wait(1250);
const foldEnd = await readFold();
await page.screenshot({ path: path.join(SHOTS, "motion-fold.png") });
report.fold.home = { early: foldEarly, mid: foldMid, end: foldEnd };

// 2. Primary link magnetically follows the pointer.
const link = await page.$(".selected .link-line");
if (link) {
  const box = await link.boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width * 0.82, box.y + box.height * 0.42, { steps: 5 });
    await wait(160);
    report.magnet = await page.evaluate(() => {
      const el = document.querySelector(".selected .link-line");
      const style = getComputedStyle(el);
      return {
        magnet: el.hasAttribute("data-magnet"),
        active: el.classList.contains("is-magnet"),
        mx: style.getPropertyValue("--mx").trim(),
        my: style.getPropertyValue("--my").trim(),
        transform: style.transform,
      };
    });
    await page.mouse.move(10, 10);
    await wait(420);
    report.magnet.settled = await page.evaluate(() => {
      const el = document.querySelector(".selected .link-line");
      return { mx: getComputedStyle(el).getPropertyValue("--mx").trim(), transform: getComputedStyle(el).transform };
    });
  }
}

// 3. Work-card glare follows the pointer.
const card = await page.$(".selected .work-card__img");
if (card) {
  const box = await card.boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width * 0.23, box.y + box.height * 0.55, { steps: 6 });
    await wait(260);
    report.glare = await page.evaluate(() => {
      const el = document.querySelector(".selected .work-card__img");
      const after = getComputedStyle(el, "::after");
      return {
        glare: el.hasAttribute("data-glare"),
        active: el.classList.contains("is-glaring"),
        x: getComputedStyle(el).getPropertyValue("--glare-x").trim(),
        opacity: after.opacity,
        blend: after.mixBlendMode,
      };
    });
    await page.screenshot({ path: path.join(SHOTS, "motion-glare.png") });
    await page.mouse.move(10, 10);
    await wait(350);
    report.glare.settled = await page.evaluate(() => {
      const el = document.querySelector(".selected .work-card__img");
      return { active: el.classList.contains("is-glaring"), x: getComputedStyle(el).getPropertyValue("--glare-x").trim() };
    });
  }
}

// 4. Ink flecks appear on click and clean themselves up.
await page.evaluate(() => {
  document.dispatchEvent(new PointerEvent("pointerdown", { clientX: 760, clientY: 220, pointerType: "mouse", bubbles: true }));
});
report.cursor = await page.evaluate(() => ({ flecks: document.querySelectorAll(".cursor__fleck").length, ripples: document.querySelectorAll(".cursor__ripple").length }));
await wait(820);
report.cursor.after = await page.evaluate(() => ({ flecks: document.querySelectorAll(".cursor__fleck").length, ripples: document.querySelectorAll(".cursor__ripple").length }));

// 5. Image section keeps its authored two-line fold.
await goto("/image/");
await scrollTo("#a-covers");
const imageFoldEarly = await readFold();
await wait(1350);
const imageFoldEnd = await readFold();
report.fold.image = { early: imageFoldEarly, end: imageFoldEnd };
await page.screenshot({ path: path.join(SHOTS, "motion-image-fold.png") });

// 6. Reduced motion shows the final state without transforms or glare.
await page.evaluate(() => localStorage.setItem("iif-motion", "off"));
await goto("/");
await scrollTo(".selected");
await wait(300);
report.reduced = await page.evaluate(() => {
  const heading = document.querySelector(".section-head h2[data-fold='1']");
  const span = heading?.querySelector(".fold-line > span");
  const card = document.querySelector(".work-card__img");
  return {
    reduce: document.documentElement.dataset.reduce,
    foldTransform: span ? getComputedStyle(span).transform : null,
    foldOpacity: span ? getComputedStyle(span).opacity : null,
    foldFilter: span ? getComputedStyle(span).filter : null,
    glareDisplay: card ? getComputedStyle(card, "::after").display : null,
    magnetTransform: getComputedStyle(document.querySelector(".selected .link-line")).transform,
  };
});
await page.screenshot({ path: path.join(SHOTS, "motion-reduced.png") });
await page.evaluate(() => localStorage.setItem("iif-motion", "on"));

// 7. Client-side navigation still prepares the destination headings.
await page.evaluate(() => localStorage.setItem("iif-motion", "on"));
await goto("/");
await page.evaluate(() => document.querySelector('.nav__links a[href="/image/"]')?.click());
await page.waitForFunction(() => location.pathname === "/image/", { timeout: 6000 }).catch(() => {});
await wait(850);
await scrollTo("#a-covers");
const navFoldEarly = await readFold();
await wait(1300);
const navFoldEnd = await readFold();
report.navFold = { early: navFoldEarly, end: navFoldEnd, path: await page.evaluate(() => location.pathname) };

report.errors = [...new Set(errors)];
await fsp.writeFile(path.join(SHOTS, "motion-report.json"), JSON.stringify(report, null, 2), "utf8");
console.log(JSON.stringify(report, null, 2));
await browser.close();
await new Promise((resolve) => server.close(resolve));
process.exit(0);
