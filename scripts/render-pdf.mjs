import fs from "node:fs/promises";
import path from "node:path";
import { createCanvas, DOMMatrix, Path2D, ImageData } from "@napi-rs/canvas";

globalThis.DOMMatrix = DOMMatrix;
globalThis.Path2D = Path2D;
globalThis.ImageData = ImageData;

const input = process.argv[2];
const outDir = process.argv[3];
const maxPages = Number(process.argv[4] || 10);
await fs.mkdir(outDir, { recursive: true });

const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
const data = new Uint8Array(await fs.readFile(input));
const doc = await pdfjs.getDocument({ data, useSystemFonts: false, disableFontFace: false }).promise;
console.log("pages", doc.numPages);
const factory = {
  create(w, h) { const canvas = createCanvas(Math.ceil(w), Math.ceil(h)); return { canvas, context: canvas.getContext("2d") }; },
  reset(cc, w, h) { cc.canvas.width = Math.ceil(w); cc.canvas.height = Math.ceil(h); },
  destroy(cc) { cc.canvas.width = 0; cc.canvas.height = 0; },
};
for (let p = 1; p <= Math.min(doc.numPages, maxPages); p++) {
  const page = await doc.getPage(p);
  const viewport = page.getViewport({ scale: 1.9 });
  const cc = factory.create(viewport.width, viewport.height);
  await page.render({ canvasContext: cc.context, viewport, canvasFactory: factory }).promise;
  const out = path.join(outDir, `slide-${String(p).padStart(2, "0")}.png`);
  await fs.writeFile(out, await cc.canvas.encode("png"));
  console.log("rendered", out);
}