import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import sharp from "sharp";

const ROOT = "E:/整体的作品集/由意成形";
const SITE = path.join(ROOT, "site");
const PUBLIC = path.join(SITE, "public");
const MEDIA = path.join(PUBLIC, "media");
const WORK = path.join(SITE, ".work");
const OUT = { images: {}, videos: {}, audio: [], files: [] };

const ensure = async (p) => fs.mkdir(p, { recursive: true });
const clean = (s) => s.replace(/[\\/:*?"<>|]/g, "-").replace(/\s+/g, " ").trim();
const rel = (p) => "/" + path.relative(PUBLIC, p).split(path.sep).join("/");

async function image({ group, key, src, maxW = 1800, thumbW = 760, quality = 84, label }) {
  const dir = path.join(MEDIA, "image", group);
  await ensure(dir);
  const dest = path.join(dir, `${key}.webp`);
  const thumbDest = path.join(dir, `${key}@thumb.webp`);
  if (!process.env.FORCE && existsSync(dest)) {
    const om = await sharp(dest).metadata();
    return {
      key,
      label: label ?? path.basename(src, path.extname(src)),
      src: rel(dest),
      thumb: existsSync(thumbDest) ? rel(thumbDest) : rel(dest),
      width: om.width,
      height: om.height,
      ratio: +(om.width / om.height).toFixed(3),
    };
  }
  const pipeline = sharp(src, { failOn: "none" }).rotate();
  const meta = await pipeline.metadata();
  let full = pipeline.clone();
  if (meta.width && meta.width > maxW) full = full.resize({ width: maxW, withoutEnlargement: true });
  const buf = await full.webp({ quality, effort: 5 }).toBuffer();
  await fs.writeFile(dest, buf);
  const outMeta = await sharp(buf).metadata();
  let thumb = dest;
  if (thumbW && outMeta.width > thumbW) {
    await sharp(buf).resize({ width: thumbW, withoutEnlargement: true }).webp({ quality: 78, effort: 4 }).toFile(thumbDest);
    thumb = thumbDest;
  }
  const item = {
    key,
    label: label ?? path.basename(src, path.extname(src)),
    src: rel(dest),
    thumb: rel(thumb),
    width: outMeta.width,
    height: outMeta.height,
    ratio: +(outMeta.width / outMeta.height).toFixed(3),
  };
  return item;
}

async function addGroup(name, files, opts) {
  const items = [];
  for (const f of files) {
    const item = await image({ group: opts.group ?? name, key: f.key, src: f.src, label: f.label, maxW: opts.maxW, thumbW: opts.thumbW, quality: opts.quality });
    items.push(item);
    process.stdout.write(".");
  }
  OUT.images[name] = items;
  return items;
}

const list = async (dir) => (await fs.readdir(dir, { withFileTypes: true })).filter((d) => d.isFile()).map((d) => d.name).sort();

function probe(file) {
  const raw = execFileSync("ffprobe", ["-v", "error", "-print_format", "json", "-show_format", "-show_streams", file], { encoding: "utf8" });
  return JSON.parse(raw);
}

async function video({ group, key, src, label, crf = 23 }) {
  const dir = path.join(MEDIA, "video", group);
  await ensure(dir);
  const info = probe(src);
  const v = info.streams.find((s) => s.codec_type === "video");
  const w = Number(v.width), h = Number(v.height);
  const long = Math.max(w, h);
  const s = long > 1280 ? 1280 / long : 1;
  const tw = Math.max(2, Math.round((w * s) / 2) * 2);
  const th = Math.max(2, Math.round((h * s) / 2) * 2);
  const dest = path.join(dir, `${key}.mp4`);
  const poster = path.join(dir, `${key}-poster.webp`);
  if (!process.env.FORCE && existsSync(dest) && existsSync(poster)) {
    return { key, label: label ?? path.basename(src, path.extname(src)), src: rel(dest), poster: rel(poster), width: tw, height: th, duration: +Number(info.format.duration).toFixed(2), sizeMB: +(Number((await fs.stat(dest)).size) / 1048576).toFixed(1) };
  }
  const args = ["-y", "-i", src, "-map", "0:v:0", "-map", "0:a:0?", "-vf", `scale=${tw}:${th}:flags=lanczos`, "-c:v", "libx264", "-preset", "veryfast", "-crf", String(crf), "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", dest];
  execFileSync("ffmpeg", args, { stdio: "ignore" });
  const posterPng = path.join(dir, `${key}-poster.png`);
  const at = Math.min(1.2, Number(info.format.duration) * 0.12);
  execFileSync("ffmpeg", ["-y", "-ss", String(at), "-i", src, "-frames:v", "1", "-vf", `scale=${tw}:${th}:flags=lanczos`, posterPng], { stdio: "ignore" });
  const meta = await sharp(posterPng).webp({ quality: 82, effort: 5 }).toFile(poster);
  await fs.unlink(posterPng).catch(() => {});
  const item = {
    key,
    label: label ?? path.basename(src, path.extname(src)),
    src: rel(dest),
    poster: rel(poster),
    width: tw,
    height: th,
    duration: +Number(info.format.duration).toFixed(2),
    sizeMB: +(Number((await fs.stat(dest)).size) / 1048576).toFixed(1),
  };
  return item;
}

async function addVideos(name, files) {
  const items = [];
  for (const f of files) {
    const item = await video({ group: name, ...f });
    items.push(item);
    process.stdout.write("v");
  }
  OUT.videos[name] = items;
}

async function main() {
  await ensure(MEDIA);
  await ensure(path.join(SITE, "src", "content"));
  const src = (p) => path.join(ROOT, p);
  const imgRoot = src("成象 IMAGE");
  console.log("images...");

  // 100 days
  const dayDir = path.join(imgRoot, "封面与主题", "100天实验公众号封图系列");
  const dayFiles = (await list(dayDir)).filter((n) => /^\d{1,2}\.\d{1,2}\.png$/.test(n));
  const days = dayFiles.map((n) => {
    const [m, d] = n.replace(".png", "").split(".").map((x) => x.padStart(2, "0"));
    return { key: `${m}-${d}`, label: `${m}.${d}`, src: path.join(dayDir, n), date: `2026-${m}-${d}` };
  }).sort((a, b) => a.date.localeCompare(b.date));
  const dayItems = await addGroup("days", days, { maxW: 560, thumbW: 260, quality: 84 });
  dayItems.forEach((it, i) => { it.date = days[i].date; it.day = days[i].label; });

  // MBTI
  const mbtiDir = path.join(imgRoot, "封面与主题", "MBTI系列", "kele说MBTI视频封面设计");
  const mbtiFiles = (await list(mbtiDir)).filter((n) => /\.(png|jpg)$/i.test(n));
  const mbti = mbtiFiles.map((n) => {
    const code = /ENFP/.test(n) ? "enfp" : /INTJ/.test(n) ? "intj" : /ENFJ/.test(n) ? "enfj" : /INTP/.test(n) ? "intp" : "wolf";
    const ratio = /16：9/.test(n) ? "land" : "port";
    return { key: `${code}-${ratio}`, label: n, src: path.join(mbtiDir, n) };
  });
  await addGroup("mbti", mbti, { maxW: 1900, thumbW: 760, quality: 84 });

  // Subculture
  const subDir = path.join(imgRoot, "封面与主题", "亚文化系列");
  const subFiles = await list(subDir);
  const sub = subFiles.map((n) => {
    const code = /哥特/.test(n) ? "goth" : /外貌/.test(n) ? "lookism" : /崛起/.test(n) ? "rise" : "majority";
    const ratio = /16：9/.test(n) ? "land" : /4：3/.test(n) ? "land43" : "port";
    return { key: `${code}-${ratio}`, label: n, src: path.join(subDir, n) };
  });
  await addGroup("subculture", sub, { maxW: 1900, thumbW: 760 });

  // black & white
  const bwDir = path.join(imgRoot, "封面与主题", "黑白视觉贴图");
  const bwFiles = (await list(bwDir)).filter((n) => /\.(jpg|png)$/i.test(n));
  const bw = bwFiles.map((n, i) => ({ key: `bw-${String(i + 1).padStart(2, "0")}`, label: n, src: path.join(bwDir, n) }));
  await addGroup("bw", bw, { maxW: 1900, thumbW: 700 });

  // talk covers
  const talkDir = path.join(imgRoot, "封面与主题", "口播封图系列");
  const talkFiles = (await list(talkDir)).filter((n) => /\.(jpg|png)$/i.test(n));
  const talkKeys = ["ai-value", "million", "weird"];
  const talk = talkFiles.map((n, i) => ({ key: `talk-${talkKeys[i] ?? i + 1}`, label: n, src: path.join(talkDir, n) }));
  await addGroup("talk", talk, { maxW: 1500, thumbW: 700 });

  // wolf
  const wolfDir = path.join(imgRoot, "封面与主题", "狼人杀形象设计");
  const wolfFiles = (await list(wolfDir)).filter((n) => /\.(jpg|png)$/i.test(n));
  await addGroup("wolf", [{ key: "wolf-poster", label: wolfFiles[0], src: path.join(wolfDir, wolfFiles[0]) }], { maxW: 1700 });

  // panda
  const pandaDir = path.join(imgRoot, "IP与人物", "小含熊猫IP");
  const pandaFiles = (await list(pandaDir)).filter((n) => /\.(jpg|png)$/i.test(n));
  const panda = pandaFiles.map((n) => ({ key: /^小含熊猫/.test(n) ? "panda-original" : `panda-poster-${n.match(/(\d+)/)?.[1] ?? "a"}`, label: n, src: path.join(pandaDir, n) }));
  await addGroup("panda", panda, { maxW: 1700, thumbW: 800 });

  // drama
  const dramaDir = path.join(imgRoot, "IP与人物", "真人短剧男女主");
  const dramaFiles = (await list(dramaDir)).filter((n) => /\.(jpg|png)$/i.test(n));
  const drama = dramaFiles.map((n, i) => ({ key: `drama-${String(i + 1).padStart(2, "0")}`, label: n, src: path.join(dramaDir, n) }));
  await addGroup("drama", drama, { maxW: 1700, thumbW: 700 });

  // interview
  const interviewDir = path.join(imgRoot, "IP与人物", "大学生采访设计");
  const interviewFiles = (await list(interviewDir)).filter((n) => /\.(jpg|png)$/i.test(n));
  await addGroup("interview", [{ key: "interview-cover", label: interviewFiles[0], src: path.join(interviewDir, interviewFiles[0]) }], { maxW: 1900 });

  // campus architecture
  const campusDir = path.join(imgRoot, "校园与空间", "长理典型建筑设计");
  const campusFiles = (await list(campusDir)).filter((n) => /\.(jpg|png)$/i.test(n));
  const campus = campusFiles.map((n, i) => ({ key: `arch-${String(i + 1).padStart(2, "0")}`, label: n, src: path.join(campusDir, n) }));
  await addGroup("campus", campus, { maxW: 2100, thumbW: 800 });

  // red packet + fifteen
  const rpDir = path.join(imgRoot, "校园与空间", "长理红包封图设计");
  const rpFiles = (await list(rpDir)).filter((n) => /\.(jpg|png)$/i.test(n));
  await addGroup("redpacket", [{ key: "red-packet", label: rpFiles[0], src: path.join(rpDir, rpFiles[0]) }], { maxW: 2200, thumbW: 1000 });
  const ffDir = path.join(imgRoot, "校园与空间", "长理十五五顶图设计");
  const ffFiles = (await list(ffDir)).filter((n) => /\.(jpg|png)$/i.test(n));
  await addGroup("fifteen", [{ key: "fifteen-five", label: ffFiles[0], src: path.join(ffDir, ffFiles[0]) }], { maxW: 2400, thumbW: 1000 });

  // editorial
  const xlRoot = path.join(imgRoot, "图文与编排", "心灵故事系列公众号封图");
  const xlDefs = [
    ["xinlingChild", "童年动画的温柔暴击", "xl-child"],
    ["xinlingSword", "以杀为刃，护我所执！5 句动漫台词里的绝境坚守", "xl-sword"],
    ["xinlingWisdom", "智慧的低语，心灵的启迪", "xl-wisdom"],
  ];
  for (const [name, folder, prefix] of xlDefs) {
    const d = path.join(xlRoot, folder);
    const files = (await list(d)).filter((n) => /\.(jpg|png)$/i.test(n)).sort((a, b) => parseInt(a.match(/\d+/)?.[0] ?? "0") - parseInt(b.match(/\d+/)?.[0] ?? "0"));
    await addGroup(name, files.map((n, i) => ({ key: `${prefix}-${String(i + 1).padStart(2, "0")}`, label: n, src: path.join(d, n) })), { maxW: 1400, thumbW: 560, quality: 82 });
  }
  const xmDir = path.join(imgRoot, "图文与编排", "公众号秀米制作系列", "现状剖析：大学生的【四重迷雾】");
  const xmFiles = (await list(xmDir)).filter((n) => /\.(jpg|png)$/i.test(n));
  const xm = xmFiles.map((n, i) => ({ key: `xm-${String(i + 1).padStart(2, "0")}`, label: n, src: path.join(xmDir, n) }));
  await addGroup("xiumi", xm, { maxW: 1100, thumbW: 500, quality: 84 });

  // drawing
  const drawDir = path.join(imgRoot, "绘画与造型", "板绘作品");
  const drawFiles = (await list(drawDir)).filter((n) => /\.(jpg|png)$/i.test(n) && !/ScreenShot/.test(n));
  const draw = drawFiles.map((n, i) => ({ key: `draw-${String(i + 1).padStart(2, "0")}`, label: n, src: path.join(drawDir, n) }));
  await addGroup("drawing", draw, { maxW: 1800, thumbW: 800, quality: 86 });
  const sketchDir = path.join(imgRoot, "绘画与造型", "素描作品");
  const sketchFiles = (await list(sketchDir)).filter((n) => /\.(jpg|png)$/i.test(n));
  await addGroup("sketch", sketchFiles.map((n, i) => ({ key: `sketch-${String(i + 1).padStart(2, "0")}`, label: n, src: path.join(sketchDir, n) })), { maxW: 1600, thumbW: 700, quality: 88 });

  // game
  const gameDir = path.join(imgRoot, "数字创意", "快放电波游戏设计");
  const gameKey = (n) => /封面/.test(n) ? "game-cover" : /里页/.test(n) ? "game-inner" : /玩法/.test(n) ? "game-play" : /ball/.test(n) ? "game-ball" : /button/.test(n) ? "game-button" : /close/.test(n) ? "game-close" : /^image/.test(n) ? "game-image" : /name/.test(n) ? "game-name" : /range/.test(n) ? "game-range" : /rocker/.test(n) ? "game-rocker" : /rule/.test(n) ? "game-rule" : /start/.test(n) ? "game-start" : /tell/.test(n) ? "game-tell" : "game-volume";
  const gameFiles = (await list(gameDir)).filter((n) => /\.(jpg|png)$/i.test(n));
  const game = gameFiles.map((n) => ({ key: gameKey(n), label: n, src: path.join(gameDir, n) }));
  await addGroup("game", game, { maxW: 2400, thumbW: 900, quality: 86 });

  // mini program UI
  const uiDir = path.join(imgRoot, "封面与主题", "小程序第二文化设计UI");
  const uiFiles = (await list(uiDir)).filter((n) => /\.(jpg|png)$/i.test(n) && !/04b-report-2\.png$/.test(n));
  const uiOrder = ["01-home", "02-test-intro", "02-tests", "03-question", "04b-report-2", "04c-report-3", "05b-filter", "07-register"];
  const ui = uiOrder.map((n) => {
    const f = uiFiles.find((x) => x.replace(/\.(jpg|png)$/i, "") === n);
    return f ? { key: n, label: n, src: path.join(uiDir, f) } : null;
  }).filter(Boolean);
  await addGroup("ui", ui, { maxW: 1100, thumbW: 560, quality: 86 });

  // sound covers
  const sndDir = path.join(ROOT, "成声 SOUND", "万丈红尘 体验为王播客封图+音频");
  const covMap = [
    ["4c8107d2801b35fda653ff1ba1ada56e.jpg", "cover-main"],
    ["493eb0a9423d08e3bf73f722e5371dee.jpg", "cover-e02"],
    ["a5723d214e0e5bda2032d4c026d5f15a.jpg", "cover-e03"],
    ["71c4e1c53d234f1cb6ecbc7a77546ca3.jpg", "cover-e04"],
    ["a18b50093362935baf400b8fa6789093.jpg", "cover-e05"],
  ];
  const covers = covMap.map(([f, key]) => ({ key, label: f, src: path.join(sndDir, f) }));
  await addGroup("soundCovers", covers, { maxW: 1700, thumbW: 720, quality: 86 });

  console.log("\naudio...");
  const audioMap = [
    ["万丈红尘，体验为王.m4a", "red-dust-main", "万丈红尘，体验为王"],
    ["你只是经历了，却从来没有成长.m4a", "red-dust-e02", "你只是经历了，却从来没有成长"],
    ["你很敢体验，却不懂筛选体验.m4a", "red-dust-e03", "你很敢体验，却不懂筛选体验"],
    ["你总想体验高光，却容不下普通.m4a", "red-dust-e04", "你总想体验高光，却容不下普通"],
    ["你太想要结果，所以体验不到生活.m4a", "red-dust-e05", "你太想要结果，所以体验不到生活"],
  ];
  const audioDir = path.join(MEDIA, "audio");
  await ensure(audioDir);
  const coversByKey = Object.fromEntries(OUT.images.soundCovers.map((c) => [c.key, c]));
  for (const [file, key, title] of audioMap) {
    const s = path.join(sndDir, file);
    const d = path.join(audioDir, `${key}.m4a`);
    if (existsSync(d)) await fs.chmod(d, 0o666).catch(() => {});
    await fs.copyFile(s, d);
    const info = probe(s);
    const coverKey = key === "red-dust-main" ? "cover-main" : `cover-${key.slice(-3)}`;
    OUT.audio.push({ key, title, src: rel(d), duration: +Number(info.format.duration).toFixed(1), sizeMB: +(Number((await fs.stat(d)).size) / 1048576).toFixed(1), cover: coversByKey[coverKey]?.src, coverThumb: coversByKey[coverKey]?.thumb });
  }

  console.log("\nvideos...");
  const expRoot = path.join(ROOT, "成境 EXPERIENCE", "影像创作");
  const vid = (folder, n, key) => ({ key, src: path.join(expRoot, folder, n), label: n.replace(/\.mp4$/i, "") });
  const pianoCoverFile = (await list(path.join(expRoot, "钢琴"))).find((n) => /封面/.test(n));
  const guzhengCoverFile = (await list(path.join(expRoot, "古筝"))).find((n) => /封面/.test(n));
  if (pianoCoverFile && guzhengCoverFile) {
    await addGroup("filmCovers", [
      { key: "piano-cover", label: "钢琴封面图", src: path.join(expRoot, "钢琴", pianoCoverFile) },
      { key: "guzheng-cover", label: "古筝封面", src: path.join(expRoot, "古筝", guzhengCoverFile) },
    ], { maxW: 1800, thumbW: 900, quality: 88 });
  }
  await addVideos("piano", [
    vid("钢琴", "钢琴-花之舞前奏之后奏.mp4", "piano-flower"),
    vid("钢琴", "来杯好茶摇一摇.mp4", "piano-tea"),
    vid("钢琴", "梦中的婚礼.mp4", "piano-wedding"),
    vid("钢琴", "天空之子幻.mp4", "piano-sky"),
    vid("钢琴", "雨爱.mp4", "piano-rain"),
  ]);
  await addVideos("guzheng", [
    vid("古筝", "爱情讯息.mp4", "guzheng-love"),
    vid("古筝", "沧海一声笑.mp4", "guzheng-sea"),
  ]);
  await addVideos("painting", [
    vid("画画", "大学牲的一天.mp4", "paint-day"),
    vid("画画", "领导来了吐槽停了.mp4", "paint-boss"),
    vid("画画", "另类上课扮演-随便画画篇.mp4", "paint-class"),
  ]);
  await addVideos("ppt", [vid("PPT", "向阳而生野蛮生长.mp4", "ppt-growth")]);
  await addVideos("ui", [{ key: "ui-demo", src: path.join(imgRoot, "封面与主题", "小程序第二文化设计UI", "视频1.mp4"), label: "第二文化小程序界面演示" }]);

  console.log("\nppt exports...");
  const pptDefs = [
    { slug: "zengguofan", title: "曾国藩传阅读分享", src: path.join(expRoot, "PPT", "曾国藩传阅读分享.pptx") },
    { slug: "ai-product", title: "敢接、敢做、敢上线：零基础大学生如何做出第一个 AI 产品", src: path.join(expRoot, "PPT", "敢接、敢做、敢上线：零基础大学生如何做出第一个 AI 产品.pptx") },
    { slug: "defense", title: "个人答辩作品集", src: path.join(expRoot, "PPT", "个人答辩作品集——柯孟含.pptx") },
    { slug: "growth", title: "化学与医药工程学院 · 成长赛道", src: path.join(expRoot, "PPT", "化学与医药工程学院-成长赛道-柯孟含.pdf"), pdf: true },
  ];
  for (const deck of pptDefs) {
    const exportDir = path.join(WORK, deck.pdf ? "pdf-render" : "ppt", deck.slug);
    const slides = [];
    if (existsSync(exportDir)) {
      const files = (await list(exportDir)).filter((n) => /\.(png|jpg|jpeg)$/i.test(n)).sort((a, b) => parseInt(a.match(/\d+/)?.[0] ?? "0") - parseInt(b.match(/\d+/)?.[0] ?? "0"));
      const outDir = path.join(MEDIA, "ppt", deck.slug);
      await ensure(outDir);
      for (const [i, f] of files.slice(0, 12).entries()) {
        const dest = path.join(outDir, `slide-${String(i + 1).padStart(2, "0")}.webp`);
        await sharp(path.join(exportDir, f)).resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 82, effort: 5 }).toFile(dest);
        const m = await sharp(dest).metadata();
        slides.push({ src: rel(dest), width: m.width, height: m.height });
      }
    }
    let pdfHref;
    if (!deck.pdf) {
      const pdfSrc = path.join(WORK, "pdfout", `${deck.slug}.pdf`);
      if (existsSync(pdfSrc)) {
        const sz = (await fs.stat(pdfSrc)).size / 1048576;
        if (sz < 18) {
          const outDir = path.join(MEDIA, "files");
          await ensure(outDir);
          await fs.copyFile(pdfSrc, path.join(outDir, `${deck.slug}.pdf`));
          pdfHref = `/media/files/${deck.slug}.pdf`;
        }
      }
    }
    if (deck.pdf) {
      const outDir = path.join(MEDIA, "files");
      await ensure(outDir);
      await fs.copyFile(deck.src, path.join(outDir, `${deck.slug}.pdf`));
      pdfHref = `/media/files/${deck.slug}.pdf`;
    }
    OUT.files.push({
      key: deck.slug,
      title: deck.title,
      format: deck.pdf ? "PDF" : "PPTX",
      sizeMB: +(Number((await fs.stat(deck.src)).size) / 1048576).toFixed(1),
      slideCount: slides.length,
      slides,
      pdf: pdfHref,
      sourceName: path.basename(deck.src),
    });
  }

  await fs.writeFile(path.join(SITE, "src", "content", "media.json"), JSON.stringify(OUT, null, 2), "utf8");
  const count = Object.values(OUT.images).reduce((a, b) => a + b.length, 0);
  const vs = Object.values(OUT.videos).reduce((a, b) => a + b.length, 0);
  console.log(`\nDONE images=${count} videos=${vs} audio=${OUT.audio.length} decks=${OUT.files.length}`);
}

main().catch((e) => { console.error(e); process.exit(1); });