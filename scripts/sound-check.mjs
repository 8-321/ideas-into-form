import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";

const ROOT = path.resolve("out");
const SHOTS = path.resolve(".shots");
const PORT = 3017;
const MIME = { ".html":"text/html; charset=utf-8", ".js":"text/javascript", ".css":"text/css", ".webp":"image/webp", ".png":"image/png", ".jpg":"image/jpeg", ".svg":"image/svg+xml", ".woff2":"font/woff2", ".m4a":"audio/mp4", ".mp4":"video/mp4", ".json":"application/json" };
const server = http.createServer((req, res) => {
  try {
    const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
    let file = path.join(ROOT, decodeURIComponent(url.pathname));
    if (file.endsWith(path.sep)) file = path.join(file, "index.html");
    if (!path.extname(file) && fs.existsSync(path.join(file, "index.html"))) file = path.join(file, "index.html");
    const stat = fs.statSync(file);
    const type = MIME[path.extname(file)] ?? "application/octet-stream";
    const range = req.headers.range;
    if (range) {
      const m = /bytes=(\d*)-(\d*)/.exec(range);
      const start = m && m[1] ? Number(m[1]) : 0;
      const end = m && m[2] ? Math.min(Number(m[2]), stat.size - 1) : stat.size - 1;
      res.writeHead(206, { "content-type": type, "content-range": `bytes ${start}-${end}/${stat.size}`, "accept-ranges": "bytes", "content-length": end - start + 1 });
      fs.createReadStream(file, { start, end }).pipe(res);
    } else {
      res.writeHead(200, { "content-type": type, "content-length": stat.size, "accept-ranges": "bytes" });
      fs.createReadStream(file).pipe(res);
    }
  } catch { res.writeHead(404); res.end("404"); }
});
await new Promise((resolve) => server.listen(PORT, "127.0.0.1", resolve));

const browser = await puppeteer.launch({ executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", headless: "new", args: ["--no-sandbox", "--hide-scrollbars", "--mute-audio", "--autoplay-policy=no-user-gesture-required"], defaultViewport: { width: 1512, height: 950, deviceScaleFactor: 1 } });
const page = await browser.newPage();
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", (e) => errors.push(String(e)));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const go = async (reduced = false) => {
  if (reduced) await page.evaluateOnNewDocument(() => localStorage.setItem("iif-motion", "off"));
  await page.goto(`http://127.0.0.1:${PORT}/sound/`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; });
  await wait(1200);
};
const at = async (sel, block = "start") => { await page.mouse.move(1, 1); await page.evaluate((s, b) => document.querySelector(s)?.scrollIntoView({ block: b, behavior: "instant" }), sel, block); await wait(900); };

await go();
const base = await page.evaluate(() => ({
  tracks: document.querySelectorAll(".sound-track").length,
  covers: document.querySelectorAll(".cover-atlas__layer").length,
  ticker: getComputedStyle(document.querySelector(".sound-ticker__track")).animationName,
  rings: getComputedStyle(document.querySelector(".sound-statement__rings span:nth-child(1)")).animationName,
  disc: getComputedStyle(document.querySelector(".sound-deck__disc")).animationName,
  sleeve: getComputedStyle(document.querySelector(".sound-deck__sleeve")).animationName,
  orb: (() => { const c = document.querySelector(".sound-deck__orb"); return { w: c.width, h: c.height }; })(),
  orbit: document.querySelectorAll(".sound-orbit__item").length,
  orbitAnim: getComputedStyle(document.querySelector(".sound-orbit__ring")).animationName,
  strip: document.querySelectorAll(".cover-strip__tile").length,
  floorAnim: getComputedStyle(document.querySelector(".sound-archive__floor span")).animationName,
  overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  broken: [...document.images].filter((i) => i.complete && i.naturalWidth === 0).length,
}));
await at("#a-statement");
const stats = await page.evaluate(() => ({ values: [...document.querySelectorAll(".sound-statement__stats b")].map((e) => e.textContent), inView: document.querySelector(".sound-statement__stats").classList.contains("is-in") }));
await at("#c-player");
await page.screenshot({ path: path.join(SHOTS, "check-sound-console.png") });
await page.click(".sound-track");
await wait(1800);
const playing = await page.evaluate(() => { const a = document.querySelector("audio"); return { paused: a.paused, time: +a.currentTime.toFixed(2), duration: +a.duration.toFixed(1), src: a.currentSrc.split("/").pop(), live: document.querySelector(".sound-now__top span:last-child")?.textContent }; });
await page.screenshot({ path: path.join(SHOTS, "check-sound-playing.png") });
await page.click(".sound-track:nth-of-type(2)").catch(() => {});
await wait(900);
const switched = await page.evaluate(() => ({ title: document.querySelector(".sound-now h3")?.textContent, badge: document.querySelector(".sound-deck__badge")?.textContent, index: document.querySelector(".sound-now__top span")?.textContent }));
await at(".cover-atlas__frame");
await page.screenshot({ path: path.join(SHOTS, "check-sound-covers.png") });
await page.hover(".cover-atlas__row:nth-of-type(4)");
await wait(700);
await page.evaluate(() => document.querySelector(".cover-strip")?.scrollIntoView({ block: "center", behavior: "instant" }));
await wait(600);
const tile = await page.$(".cover-strip__tile");
const tileBox = await tile.boundingBox();
await page.mouse.move(tileBox.x + tileBox.width * 0.62, tileBox.y + tileBox.height * 0.45);
await wait(500);
const chroma = await page.evaluate(() => { const t = document.querySelector(".cover-strip__tile"); const c = t.querySelector(".cover-strip__color"); return { on: t.style.getPropertyValue("--on"), mx: t.style.getPropertyValue("--mx"), opacity: +getComputedStyle(c).opacity }; });
const coverHover = await page.evaluate(() => ({ active: [...document.querySelectorAll(".cover-atlas__row")].findIndex((e) => e.classList.contains("is-active")), layer: [...document.querySelectorAll(".cover-atlas__layer")].findIndex((e) => e.classList.contains("is-active")), read: document.querySelector(".cover-atlas__read")?.textContent }));
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
await go();
await page.screenshot({ path: path.join(SHOTS, "check-sound-mobile.png") });
const mobile = await page.evaluate(() => ({ overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth, order: [...document.querySelectorAll(".sound-hero__copy,.sound-hero__aside")].map((e) => ({ cls: e.className, order: getComputedStyle(e).order })) }));
await page.setViewport({ width: 1512, height: 950, deviceScaleFactor: 1 });
await go(true);
const reduced = await page.evaluate(() => ({ reduce: document.documentElement.dataset.reduce, ticker: getComputedStyle(document.querySelector(".sound-ticker__track")).animationName, disc: getComputedStyle(document.querySelector(".sound-deck__disc")).animationName, sleeve: getComputedStyle(document.querySelector(".sound-deck__sleeve")).animationName, orbit: getComputedStyle(document.querySelector(".sound-orbit__ring")).animationName, floor: getComputedStyle(document.querySelector(".sound-archive__floor span")).animationName, eq: getComputedStyle(document.querySelector(".eq") ?? document.body).animationName }));

const checks = {
  tracks5: base.tracks === 5,
  covers5: base.covers === 5,
  tickerRuns: base.ticker === "ticker-slide",
  ringsRun: base.rings === "ring-spin",
  discRuns: base.disc === "vinyl-spin",
  sleeveIn: base.sleeve === "sleeve-in",
  orbSized: base.orb.w > 300 && base.orb.h > 300,
  noOverflow: base.overflow === 0,
  noBroken: base.broken === 0,
  statsVisible: stats.inView && stats.values[0] === "5" && stats.values[1] === "21:24",
  audioPlays: playing.paused === false && playing.time > 0.5 && playing.duration > 400,
  trackSwitches: switched.index?.includes("02"),
  coverHoverWorks: coverHover.active === 3 && coverHover.layer === 3,
  orbitCovers5: base.orbit === 5,
  orbitRuns: base.orbitAnim === "orbit-spin",
  coverStrip5: base.strip === 5,
  floorRuns: base.floorAnim === "floor-breathe",
  chromaReveals: chroma.on === "1" && chroma.opacity > 0.5 && chroma.mx !== "",
  mobileNoOverflow: mobile.overflow === 0,
  mobileTitleFirst: mobile.order[0]?.cls.includes("copy") && mobile.order[0]?.order === "1",
  reducedStops: reduced.reduce === "true" && reduced.ticker === "none" && reduced.disc === "none" && reduced.sleeve === "none" && reduced.orbit === "none" && reduced.floor === "none",
  noErrors: errors.length === 0,
};
const failed = Object.entries(checks).filter(([, ok]) => !ok).map(([name]) => name);
const report = { checks, failed, base, stats, playing, switched, coverHover, chroma, mobile, reduced, errors };
fs.writeFileSync(path.join(SHOTS, "sound-report.json"), JSON.stringify(report, null, 2), "utf8");
console.log(JSON.stringify(report, null, 2));
await browser.close();
server.closeAllConnections();
await new Promise((resolve) => server.close(resolve));
if (failed.length) process.exitCode = 1;
