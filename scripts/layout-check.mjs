import http from "node:http";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "out");
const SHOTS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", ".shots");
const EDGE = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const PORT = 3015;
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json", ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".mp4": "video/mp4", ".m4a": "audio/mp4", ".pdf": "application/pdf" };
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? "/", `http://127.0.0.1:${PORT}`);
    let file = path.join(ROOT, decodeURIComponent(url.pathname));
    if (file.endsWith(path.sep)) file = path.join(file, "index.html");
    if (!path.extname(file) && fs.existsSync(path.join(file, "index.html"))) file = path.join(file, "index.html");
    const data = await fsp.readFile(file);
    res.writeHead(200, { "content-type": MIME[path.extname(file)] ?? "application/octet-stream", "cache-control": "no-store" });
    res.end(data);
  } catch { res.writeHead(404); res.end("404"); }
});
await new Promise((resolve) => server.listen(PORT, "127.0.0.1", resolve));
const browser = await puppeteer.launch({ executablePath: EDGE, headless: "new", args: ["--no-sandbox", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1"] });
const page = await browser.newPage();
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const report = [];
for (const width of [1512, 1440, 1366, 1280, 1024]) {
  await page.setViewport({ width, height: 950, deviceScaleFactor: 1 });
  for (const route of ["/", "/image/", "/sound/", "/experience/"]) {
    await page.goto(`http://127.0.0.1:${PORT}${route}`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await wait(420);
    const rows = await page.evaluate(() => [...document.querySelectorAll(".section-head h2")].map((heading, index) => {
      const folds = [...heading.querySelectorAll(".fold-line > span")];
      return {
        index,
        text: heading.textContent,
        width: Math.round(heading.getBoundingClientRect().width),
        authoredLines: folds.length,
        wraps: folds.map((span) => {
          const node = span.firstChild;
          if (!node) return 0;
          const range = document.createRange();
          range.selectNodeContents(node);
          return range.getClientRects().length;
        }),
      };
    }));
    report.push({ width, route, rows });
  }
}
const issues = report.flatMap((entry) => entry.rows.filter((row) => row.wraps.some((count) => count > 1)).map((row) => ({ width: entry.width, route: entry.route, ...row })));
console.log(JSON.stringify({ widths: 5, routes: 4, headings: report.reduce((sum, entry) => sum + entry.rows.length, 0), issues }, null, 2));
await fsp.writeFile(path.join(SHOTS, "layout-report.json"), JSON.stringify({ report, issues }, null, 2), "utf8");
await browser.close();
await new Promise((resolve) => server.close(resolve));
process.exit(0);
