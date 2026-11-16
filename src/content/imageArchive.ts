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

const chunk = <T,>(items: T[], size: number): T[][] => {
  const pages: T[][] = [];
  for (let index = 0; index < items.length; index += size) pages.push(items.slice(index, index + size));
  return pages;
};

function pagesFor(series: string, assets: ImageAsset[]): ArchivePage[] {
  const slug = series.replace(/\s+/g, "-").toLowerCase();
  return chunk(assets, 8).map((items, index) => ({
    id: `${slug}-plate-${index + 1}`,
    series,
    shape: "landscape" as const,
    kind: "grid" as const,
    items,
  }));
}

function makeFolder(
  letter: string,
  slug: string,
  zh: string,
  en: string,
  series: { title: string; items: ImageAsset[] }[]
): ImageFolder {
  const pages = series.flatMap((entry) => pagesFor(entry.title, entry.items));
  const count = pages.reduce((total, page) => total + page.items.length, 0);
  const previewPool: ImageAsset[] = [];
  pages.forEach((page) => {
    page.items.forEach((asset) => {
      if (!previewPool.some((item) => item.key === asset.key || item.src === asset.src)) previewPool.push(asset);
    });
  });
  const cover = previewPool[0];
  if (!cover) throw new Error(`Folder ${letter} has no images`);
  const previews = [cover, ...previewPool.filter((item) => item.src !== cover.src).slice(0, 3)];
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
const game = group("game").filter((item) => item.key !== "game-ball");
const ui = group("ui");

export const IMAGE_FOLDERS: ImageFolder[] = [
  makeFolder("A", "covers", "封面与主题", "COVERS", [
    { title: "100 天实验", items: days },
    { title: "人格封面", items: mbti },
    { title: "亚文化封面", items: subculture },
    { title: "黑白视觉", items: bw },
    { title: "口播封面", items: talk },
  ]),
  makeFolder("B", "characters", "角色与人物", "CHARACTERS", [
    { title: "熊猫角色", items: panda },
    { title: "角色视觉", items: drama },
    { title: "狼人杀形象", items: wolf },
    { title: "采访设计", items: interview },
  ]),
  makeFolder("C", "spaces", "校园与空间", "CAMPUS & SPACE", [
    { title: "校园建筑", items: campus },
    { title: "红包设计", items: redpacket },
    { title: "十五五视觉", items: fifteen },
  ]),
  makeFolder("D", "editorial", "图文与编排", "EDITORIAL & TYPE", [
    { title: "儿童插画", items: child },
    { title: "刀剑意象", items: sword },
    { title: "智慧主题", items: wisdom },
    { title: "图文编排", items: xiumi },
  ]),
  makeFolder("E", "drawing", "绘画与造型", "DRAWING & FORM", [
    { title: "绘画作品", items: drawing },
    { title: "速写手稿", items: sketch },
  ]),
  makeFolder("F", "digital", "数字创意", "DIGITAL CREATIVE", [
    { title: "快放声波", items: game },
  ]),
  makeFolder("G", "interface", "界面与系统", "INTERFACE & SYSTEM", [
    { title: "第二文化界面", items: ui },
  ]),
];

export const IMAGE_TOTAL = IMAGE_FOLDERS.reduce((total, folder) => total + folder.count, 0);
export const PAGE_TOTAL = IMAGE_FOLDERS.reduce((total, folder) => total + folder.pages.length + 1, 0);
