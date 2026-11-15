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
  args: ["--no-sandbox", "--hide-scrollbars", "--force-device-scale-factor=1"],
  defaultViewport: { width: 1512, height: 950, deviceScaleFactor: 1 },
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const report = { desktop: null, mobile: null, reduced: null, errors: [], mobileErrors: [], failures: [] };

const probe = () => {
  const box = (selector) => {
    const el = document.querySelector(selector);
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return { x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height), bottom: Math.round(rect.bottom) };
  };
  const title = box(".hero__title");
  const lead = box(".hero__lead");
  const board = box(".origin-archive__board");
  const images = [...document.querySelectorAll(".origin-archive__tile img")];
  return {
    title,
    lead,
    board,
    overlap: Boolean(title && lead && title.bottom > lead.y),
    images: images.map((image) => ({ ok: image.complete && image.naturalWidth > 0, src: image.getAttribute("src") })),
    transform: getComputedStyle(document.querySelector(".origin-archive__board")).transform,
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    english: [...new Set(document.body.innerText.split("\n").map((line) => line.trim()).filter((line) => line && /[A-Za-z]/.test(line)))],
    titleLines: title && lead ? Math.round(title.height / parseFloat(getComputedStyle(document.querySelector(".hero__title")).lineHeight)) : null,
  };
};

try {
  const page = await browser.newPage();
  page.on("console", (msg) => { if (msg.type() === "error") report.errors.push(msg.text()); });
  page.on("pageerror", (err) => report.errors.push(`PAGEERROR: ${err.message}`));
  page.on("requestfailed", (req) => report.failures.push(`${req.failure()?.errorText} ${req.url()}`));
  await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: "networkidle2", timeout: 45000 });
  await sleep(800);
  await page.mouse.move(1180, 240);
  await sleep(500);
  report.desktop = await page.evaluate(probe);
  await page.screenshot({ path: path.join(SHOTS, "home-archive-1512.png") });

  const mobile = await browser.newPage();
  await mobile.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  mobile.on("console", (msg) => { if (msg.type() === "error") report.mobileErrors.push(msg.text()); });
  mobile.on("pageerror", (err) => report.mobileErrors.push(`PAGEERROR: ${err.message}`));
  await mobile.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: "networkidle2", timeout: 45000 });
  await sleep(700);
  report.mobile = await mobile.evaluate(probe);
  await mobile.screenshot({ path: path.join(SHOTS, "home-archive-390.png") });

  const reduced = await browser.newPage();
  await reduced.setViewport({ width: 1280, height: 950, deviceScaleFactor: 1 });
  await reduced.evaluateOnNewDocument(() => localStorage.setItem("iif-motion", "off"));
  await reduced.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: "networkidle2", timeout: 45000 });
  await sleep(500);
  report.reduced = await reduced.evaluate(() => ({
    reduce: document.documentElement.dataset.reduce,
    mx: document.querySelector(".origin-archive")?.style.getPropertyValue("--mx") ?? "",
    my: document.querySelector(".origin-archive")?.style.getPropertyValue("--my") ?? "",
    images: [...document.querySelectorAll(".origin-archive__tile img")].filter((image) => image.complete && image.naturalWidth > 0).length,
  }));
  await reduced.screenshot({ path: path.join(SHOTS, "home-archive-reduced.png") });
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}

const checks = {
  "桌面标题与简介不重叠": report.desktop?.overlap === false,
  "桌面档案四图加载": report.desktop?.images?.length === 4 && report.desktop.images.every((image) => image.ok),
  "桌面立体倾斜生效": Boolean(report.desktop?.transform && report.desktop.transform !== "none"),
  "桌面无横向溢出": report.desktop?.overflowX === 0,
  "桌面无英文": report.desktop?.english?.length === 0,
  "桌面控制台干净": report.errors.length === 0,
  "桌面请求干净": report.failures.length === 0,
  "手机标题与简介不重叠": report.mobile?.overlap === false,
  "手机标题保持一行": report.mobile?.titleLines === 1,
  "手机档案四图加载": report.mobile?.images?.length === 4 && report.mobile.images.every((image) => image.ok),
  "手机无横向溢出": report.mobile?.overflowX === 0,
  "手机无英文": report.mobile?.english?.length === 0,
  "手机控制台干净": report.mobileErrors.length === 0,
  "减少动态时保持静态": report.reduced?.reduce === "true" && report.reduced?.mx === "" && report.reduced?.my === "" && report.reduced?.images === 4,
};

report.checks = checks;
report.failed = Object.entries(checks).filter(([, value]) => !value).map(([key]) => key);
await fsp.writeFile(path.join(SHOTS, "spatial-report.json"), JSON.stringify(report, null, 2), "utf8");
console.log(JSON.stringify({ checks, failed: report.failed, desktop: report.desktop, mobile: report.mobile, reduced: report.reduced, errors: report.errors, mobileErrors: report.mobileErrors, failures: report.failures }, null, 2));
if (report.failed.length) process.exitCode = 1;