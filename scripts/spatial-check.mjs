import http from "node:http";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ROOT = path.join(SITE, "out");
const SHOTS = path.join(SITE, ".shots");
const EDGE = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const PORT = 3021;
const MIME = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json", ".webp": "image/webp",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".svg": "image/svg+xml",
  ".woff2": "font/woff2", ".mp4": "video/mp4", ".m4a": "audio/mp4", ".pdf": "application/pdf",
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
    res.writeHead(404, { "content-type": "text/plain" });
    res.end("404");
  }
});

await fsp.mkdir(SHOTS, { recursive: true });
await new Promise((resolve) => server.listen(PORT, "127.0.0.1", resolve));

const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: "new",
  args: ["--no-sandbox", "--hide-scrollbars", "--force-device-scale-factor=1", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
  defaultViewport: { width: 1512, height: 950, deviceScaleFactor: 1 },
});

const report = { checks: {}, desktop: null, mobile: null, reduced: null, fallback: null, errors: [], mobileErrors: [], failures: [] };

try {
  const page = await browser.newPage();
  page.on("console", (msg) => { if (msg.type() === "error") report.errors.push(msg.text()); });
  page.on("pageerror", (err) => report.errors.push(`PAGEERROR: ${err.message}`));
  page.on("requestfailed", (req) => report.failures.push(`${req.failure()?.errorText} ${req.url()}`));
  await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: "networkidle2", timeout: 45000 });
  await new Promise((r) => setTimeout(r, 2600));
  report.desktop = await page.evaluate(() => {
    const probe = document.createElement("canvas");
    const gl = probe.getContext("webgl2") || probe.getContext("webgl");
    const archive = document.querySelector(".origin-archive");
    const canvas = document.querySelector(".origin-archive__canvas");
    const rect = canvas?.getBoundingClientRect();
    return {
      webgl: Boolean(gl),
      renderer: gl ? gl.getParameter(gl.RENDERER) : null,
      live: archive?.classList.contains("is-live"),
      canvas: rect ? { width: rect.width, height: rect.height } : null,
      overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      loaded: Number(archive?.dataset.loaded ?? 0),
      reduced: document.documentElement.dataset.reduce,
    };
  });
  await page.screenshot({ path: path.join(SHOTS, "origin-3d-top.png") });
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 0.58));
  await new Promise((r) => setTimeout(r, 900));
  await page.screenshot({ path: path.join(SHOTS, "origin-3d-mid.png") });
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 1.1));
  await new Promise((r) => setTimeout(r, 900));
  await page.screenshot({ path: path.join(SHOTS, "origin-3d-end.png") });

  const mobile = await browser.newPage();
  await mobile.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  mobile.on("console", (msg) => { if (msg.type() === "error") report.mobileErrors.push(msg.text()); });
  mobile.on("pageerror", (err) => report.mobileErrors.push(`PAGEERROR: ${err.message}`));
  await mobile.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: "networkidle2", timeout: 45000 });
  await new Promise((r) => setTimeout(r, 2200));
  report.mobile = await mobile.evaluate(() => {
    const archive = document.querySelector(".origin-archive");
    const canvas = document.querySelector(".origin-archive__canvas")?.getBoundingClientRect();
    const sculpture = document.querySelector(".hero__sculpture")?.getBoundingClientRect();
    const bottom = document.querySelector(".hero__bottom")?.getBoundingClientRect();
    return {
      live: archive?.classList.contains("is-live"),
      overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      canvas: canvas ? { width: canvas.width, height: canvas.height } : null,
      sculptureBottom: sculpture?.bottom ?? null,
      copyTop: bottom?.top ?? null,
      copyClearance: sculpture && bottom ? bottom.top - sculpture.bottom : null,
    };
  });
  await mobile.screenshot({ path: path.join(SHOTS, "origin-3d-mobile.png") });

  const reduced = await browser.newPage();
  await reduced.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });
  await reduced.evaluateOnNewDocument(() => localStorage.setItem("iif-motion", "off"));
  await reduced.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: "networkidle2", timeout: 45000 });
  await new Promise((r) => setTimeout(r, 1600));
  report.reduced = await reduced.evaluate(() => ({
    reduce: document.documentElement.dataset.reduce,
    live: document.querySelector(".origin-archive")?.classList.contains("is-live"),
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }));
  await reduced.screenshot({ path: path.join(SHOTS, "origin-3d-reduced.png") });

  const fallback = await browser.newPage();
  await fallback.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });
  await fallback.evaluateOnNewDocument(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      if (String(type).startsWith("webgl")) return null;
      return original.call(this, type, ...args);
    };
  });
  await fallback.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: "networkidle2", timeout: 45000 });
  await new Promise((r) => setTimeout(r, 1600));
  report.fallback = await fallback.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll(".origin-archive__still img"));
    return {
      live: document.querySelector(".origin-archive")?.classList.contains("is-live") ?? false,
      fallbackImages: imgs.length,
      loaded: imgs.filter((img) => img.complete && img.naturalWidth > 0).length,
      fallbackOpacity: getComputedStyle(document.querySelector(".origin-archive__fallback")).opacity,
      overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
  await fallback.screenshot({ path: path.join(SHOTS, "origin-3d-fallback.png") });
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}

report.checks = {
  "desktop WebGL available": report.desktop?.webgl === true,
  "desktop scene live": report.desktop?.live === true,
  "5 real textures loaded": report.desktop?.loaded === 5,
  "desktop no horizontal overflow": report.desktop?.overflowX === 0,
  "desktop console clean": report.errors.length === 0,
  "desktop requests clean": report.failures.length === 0,
  "mobile scene live": report.mobile?.live === true,
  "mobile no horizontal overflow": report.mobile?.overflowX === 0,
  "mobile copy clear of sculpture": (report.mobile?.copyClearance ?? -1) >= 0,
  "mobile console clean": report.mobileErrors.length === 0,
  "reduced motion static": report.reduced?.reduce === "true" && report.reduced?.live === true,
  "WebGL fallback keeps real images": report.fallback?.live === false && report.fallback?.fallbackImages === 3 && report.fallback?.loaded === 3,
};
report.failed = Object.entries(report.checks).filter(([, value]) => !value).map(([key]) => key);

await fsp.writeFile(path.join(SHOTS, "spatial-report.json"), JSON.stringify(report, null, 2), "utf8");
console.log(JSON.stringify(report, null, 2));
if (report.failed.length) process.exitCode = 1;