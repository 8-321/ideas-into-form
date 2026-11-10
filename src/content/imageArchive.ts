import type { ImageAsset } from "./works";
import { group } from "./works";

export type ImageShape = "square" | "portrait" | "landscape" | "wide";
export type ArchivePageKind = "grid" | "orbit";

export type ArchivePage = {
  id: string;
  series: string;
  shape: ImageShape;
  kind: ArchivePageKind;
  items: ImageAsset[];
};

export type ImageFolder = {
  letter: string;
  slug: string;
  zh: string;
  en: string;
  count: number;
  cover: ImageAsset;
  previews: ImageAsset[];
  pages: ArchivePage[];
};

const shapeOf = (asset: ImageAsset): ImageShape => {
  const ratio = asset.width / asset.height;
  if (ratio >= 0.88 && ratio <= 1.12) return "square";
  if (ratio < 0.88) return "portrait";
  if (ratio <= 1.8) return "landscape";
  return "wide";
};

const chunk = <T,>(items: T[], size: number): T[][] => {
  const pages: T[][] = [];
  for (let index = 0; index < items.length; index += size) pages.push(items.slice(index, index + size));
  return pages;
};

const capacity: Record<ImageShape, number> = {
  square: 12,
  portrait: 12,
  landscape: 12,
  wide: 4,
};

const shapeOrder: ImageShape[] = ["square", "portrait", "landscape", "wide"];

const shapeTag: Record<ImageShape, string> = {
  square: "sq",
  portrait: "pt",
  landscape: "ls",
  wide: "wd",
};

function pagesFor(series: string, assets: ImageAsset[], orbit = false): ArchivePage[] {
  if (orbit) {
    return [{ id: `${series.replace(/\s+/g, "-").toLowerCase()}-orbit`, series, shape: "portrait", kind: "orbit", items: assets }];
  }

  const byShape = new Map<ImageShape, ImageAsset[]>();
  assets.forEach((asset) => {
    const shape = shapeOf(asset);
    const list = byShape.get(shape) ?? [];
    list.push(asset);
    byShape.set(shape, list);
  });

  const result: ArchivePage[] = [];
  shapeOrder.forEach((shape) => {
    const list = byShape.get(shape) ?? [];
    chunk(list, capacity[shape]).forEach((items, index) => {
      const slug = series.replace(/\s+/g, "-").toLowerCase();
      result.push({
        id: `${slug}-${shapeTag[shape]}-${index + 1}`,
        series,
        shape,
        kind: "grid",
        items,
      });
    });
  });
  return result;
}

function makeFolder(
  letter: string,
  slug: string,
  zh: string,
  en: string,
  series: { title: string; items: ImageAsset[]; orbit?: boolean }[]
): ImageFolder {
  const pages = series.flatMap((entry) => pagesFor(entry.title, entry.items, entry.orbit));
  const count = pages.reduce((total, page) => total + page.items.length, 0);
  const previewPool: ImageAsset[] = [];
  pages.forEach((page) => {
    page.items.forEach((asset) => {
      if (!previewPool.some((item) => item.key === asset.key || item.src === asset.src)) previewPool.push(asset);
    });
  });
  const cover = previewPool[0];
  if (!cover) throw new Error(`Folder ${letter} has no images`);
  const previews = [cover, ...previewPool.filter((item) => item.src !== cover.src).slice(0, 2)];
  return { letter, slug, zh, en, count, cover, previews, pages };
}

const days = group("days");
const mbti = group("mbti");
const subculture = group("subculture");
const bw = group("bw");
const talk = group("talk");
const panda = group("panda");
const drama = group("drama");
const wolf = group("wolf");
const interview = group("interview");
const campus = group("campus");
const redpacket = group("redpacket");
const fifteen = group("fifteen");
const child = group("xinlingChild");
const sword = group("xinlingSword");
const wisdom = group("xinlingWisdom");
const xiumi = group("xiumi");
const drawing = group("drawing");
const sketch = group("sketch");
const game = group("game");
const ui = group("ui");

export const IMAGE_FOLDERS: ImageFolder[] = [
  makeFolder("A", "covers", "封面与主题", "COVER & THEME", [
    { title: "100 DAYS", items: days, orbit: true },
    { title: "MBTI", items: mbti },
    { title: "SUBCULTURE", items: subculture },
    { title: "MONO", items: bw },
    { title: "TALK", items: talk },
  ]),
  makeFolder("B", "characters", "IP 与人物", "IP & CHARACTERS", [
    { title: "PANDA", items: panda },
    { title: "DRAMA", items: drama },
    { title: "WOLF", items: wolf },
    { title: "INTERVIEW", items: interview },
  ]),
  makeFolder("C", "spaces", "校园与空间", "CAMPUS & SPACE", [
    { title: "CAMPUS", items: campus },
    { title: "RED PACKET", items: redpacket },
    { title: "HORIZON", items: fifteen },
  ]),
  makeFolder("D", "editorial", "图文与编排", "EDITORIAL & TYPE", [
    { title: "CHILD", items: child },
    { title: "SWORD", items: sword },
    { title: "WISDOM", items: wisdom },
    { title: "XIUMI", items: xiumi },
  ]),
  makeFolder("E", "drawing", "绘画与造型", "DRAWING & FORM", [
    { title: "DRAWING", items: drawing },
    { title: "SKETCH", items: sketch },
  ]),
  makeFolder("F", "digital", "数字创意", "DIGITAL CREATIVE", [
    { title: "FAST WAVE", items: game },
  ]),
  makeFolder("G", "interface", "界面与系统", "INTERFACE & SYSTEM", [
    { title: "SUBCULTURE APP", items: ui },
  ]),
];

export const IMAGE_TOTAL = IMAGE_FOLDERS.reduce((total, folder) => total + folder.count, 0);
export const PAGE_TOTAL = IMAGE_FOLDERS.reduce((total, folder) => total + folder.pages.length + 1, 0);
