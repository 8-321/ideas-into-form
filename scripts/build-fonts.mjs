import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import subsetFont from "subset-font";

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(SITE, "src");
const OUT = path.join(SITE, "public", "fonts");
await fs.mkdir(OUT, { recursive: true });

async function walk(dir) {
  const out = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(p)));
    else if (/\.(tsx?|json|mdx?)$/.test(entry.name)) out.push(p);
  }
  return out;
}

const files = await walk(SRC);
let text = "";
for (const file of files) text += await fs.readFile(file, "utf8");
text += "上一件下一件关闭播放暂停全屏查看返回章节作品精选音频视频待上传素材减少动态开启更多收起展开目录索引年份类型尺寸真实音轨封面设计创作理念最终成果设计复盘过程概述创意构思项目封面播放中已暂停加载失败请稍候左右方向键可切换图片点击放大缩小重置浏览放映室唱片档案声音视觉影像体验图文编排校园空间绘画造型数字创意界面系统人物采访角色设定红包封图顶图建筑线稿";

const chars = Array.from(new Set(Array.from(text))).sort().join("");
console.log("unique chars", Array.from(chars).length);

async function make(src, out, opts = {}) {
  const buf = await fs.readFile(src);
  const woff = await subsetFont(buf, chars, { targetFormat: "woff2", ...opts });
  await fs.writeFile(path.join(OUT, out), woff);
  console.log(out, (woff.length / 1024).toFixed(1) + "KB");
}

const SERIF = process.env.NOTO_SERIF ?? "C:/Windows/Fonts/NotoSerifSC-VF.ttf";
const SANS = process.env.NOTO_SANS ?? "C:/Windows/Fonts/NotoSansSC-VF.ttf";
await make(SERIF, "noto-serif-sc.woff2");
await make(SANS, "noto-sans-sc.woff2");

const latin = [
  ["node_modules/@fontsource/instrument-serif/files/instrument-serif-latin-400-normal.woff2", "instrument-serif.woff2"],
  ["node_modules/@fontsource/instrument-serif/files/instrument-serif-latin-400-italic.woff2", "instrument-serif-italic.woff2"],
  ["node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2", "plex-mono-400.woff2"],
  ["node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2", "plex-mono-500.woff2"],
];
for (const [from, to] of latin) {
  const src = path.join(SITE, from);
  if (!existsSync(src)) { console.log("MISS", from); continue; }
  await fs.copyFile(src, path.join(OUT, to));
  console.log(to, "copied");
}