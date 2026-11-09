import media from "./media.json";

export type Chapter = "image" | "sound" | "experience";

export type ImageAsset = {
  key: string;
  label: string;
  src: string;
  thumb: string;
  width: number;
  height: number;
  ratio: number;
  date?: string;
  day?: string;
};

export type VideoAsset = {
  key: string;
  label: string;
  src: string;
  poster: string;
  width: number;
  height: number;
  duration: number;
  sizeMB: number;
};

export type AudioAsset = {
  key: string;
  title: string;
  src: string;
  duration: number;
  sizeMB: number;
  cover: string;
  coverThumb: string;
};

export type Deck = {
  key: string;
  title: string;
  format: string;
  sizeMB: number;
  slideCount: number;
  slides: { src: string; width: number; height: number }[];
  pdf?: string;
  sourceName: string;
};

const IMG = media.images as unknown as Record<string, ImageAsset[]>;
const VID = media.videos as unknown as Record<string, VideoAsset[]>;
export const AUDIO = media.audio as unknown as AudioAsset[];
export const DECKS = media.files as unknown as Deck[];

export function img(group: string, key: string): ImageAsset {
  const found = IMG[group]?.find((item) => item.key === key);
  if (!found) throw new Error(`Missing image ${group}/${key}`);
  return found;
}

export function pick(group: string, needle: string): ImageAsset {
  const found = IMG[group]?.find((item) => item.label.includes(needle));
  if (!found) throw new Error(`Missing image ${group}/~${needle}`);
  return found;
}

export function vid(group: string, key: string): VideoAsset {
  const found = VID[group]?.find((item) => item.key === key);
  if (!found) throw new Error(`Missing video ${group}/${key}`);
  return found;
}

export function group(name: string): ImageAsset[] {
  return IMG[name] ?? [];
}

const cap = (asset: ImageAsset, caption?: string) => ({ ...asset, caption });

export type TextSection = {
  type: "text";
  eyebrow: string;
  title: string;
  paragraphs: string[];
};

export type GallerySection = {
  type: "gallery";
  eyebrow: string;
  title: string;
  note?: string;
  layout?: "grid" | "wall" | "strip" | "wide";
  items: (ImageAsset & { caption?: string })[];
};

export type StepsSection = {
  type: "steps";
  eyebrow: string;
  title: string;
  items: { no: string; title: string; body: string }[];
};

export type NoteSection = { type: "note"; title: string; body: string };

export type PlaceholderSection = {
  type: "placeholder";
  title: string;
  body: string;
  items: string[];
};

export type AudioSection = { type: "audio"; eyebrow: string; title: string; note?: string };
export type FilmSection = { type: "film"; eyebrow: string; title: string; note?: string };

export type Section =
  | TextSection
  | GallerySection
  | StepsSection
  | NoteSection
  | PlaceholderSection
  | AudioSection
  | FilmSection;

export type Work = {
  slug: string;
  no: string;
  chapter: Chapter;
  title: string;
  titleEn: string;
  category: string;
  year: string;
  summary: string;
  tags: string[];
  cover: ImageAsset;
  coverAlt: string;
  sections: Section[];
  featured?: boolean;
  order: number;
};

export const CHAPTERS = [
  {
    id: "image" as Chapter,
    no: "01",
    zh: "成象",
    en: "IMAGE",
    title: "让想法成为看得见的作品。",
    enSub: "THE FORM OF THOUGHT.",
    href: "/image/",
    tone: "成象 / 视觉与图形表达",
  },
  {
    id: "sound" as Chapter,
    no: "02",
    zh: "成声",
    en: "SOUND",
    title: "让思想拥有自己的声音。",
    enSub: "THE VOICE OF IDEAS.",
    href: "/sound/",
    tone: "成声 / 声音与内容表达",
  },
  {
    id: "experience" as Chapter,
    no: "03",
    zh: "成境",
    en: "EXPERIENCE",
    title: "让创意成为可以感受的体验。",
    enSub: "BEYOND THE FRAME.",
    href: "/experience/",
    tone: "成境 / 影像与体验表达",
  },
];

const days = group("days");
const pandaPosters = group("panda").filter((item) => item.key !== "panda-original");
const filmCoverGroup = group("filmCovers");

export const FILM_COVERS: Record<string, ImageAsset | undefined> = {
  piano: filmCoverGroup.find((item) => item.key === "piano-cover"),
  guzheng: filmCoverGroup.find((item) => item.key === "guzheng-cover"),
};

const filmCover = FILM_COVERS.piano ?? (() => {
  const v = vid("piano", "piano-wedding");
  return { key: "film-cover", label: v.label, src: v.poster, thumb: v.poster, width: v.width, height: v.height, ratio: +(v.width / v.height).toFixed(3) };
})();

export const WORKS: Work[] = [
  {
    slug: "100-days",
    no: "01",
    chapter: "image",
    title: "100 天实验",
    titleEn: "100 DAYS",
    category: "封面系列 / COVER SERIES",
    year: "2026",
    summary:
      "98 张日更封面，从 1 月 8 日到 4 月 16 日，把「100 天实验」做成一条可以横向翻阅的视觉时间轴。",
    tags: ["日更封面", "时间轴", "系列设计"],
    cover: img("days", "02-14"),
    coverAlt: "100 天实验系列 2 月 14 日封面",
    featured: true,
    order: 1,
    sections: [
      {
        type: "text",
        eyebrow: "OVERVIEW / 概述",
        title: "把每一天，做成同一套语言里的一页。",
        paragraphs: [
          "这是一组围绕「小柯的成长实验室」日更内容展开的封面系列。每张封面对应一个日期与一个主题，用同一套版式骨架承载不同的情绪、物件与标题。",
          "系列感来自重复：固定的日期标记、栏目名与中心标题层，让 98 张封面在快速浏览时仍然被识别为同一个实验。变化来自每一天的素材与色彩——书桌、月亮、城市、纸张与手绘元素轮流进入画面。",
        ],
      },
      {
        type: "steps",
        eyebrow: "PROCESS / 过程",
        title: "先建立骨架，再允许每天不同。",
        items: [
          { no: "01", title: "版式骨架", body: "固定日期、栏目与标题的层级关系，让系列在第一时间被识别。" },
          { no: "02", title: "每日素材", body: "围绕当天主题选择主图、色温与手绘元素，保留日更的呼吸感。" },
          { no: "03", title: "时间轴回看", body: "按月份回看色彩与构图的重复和偏移，检查系列是否仍然成立。" },
        ],
      },
      {
        type: "gallery",
        eyebrow: "ARCHIVE / 封面墙",
        title: "98 张，按时间排列。",
        note: "点击任意封面放大；左右方向键可连续翻阅。",
        layout: "wall",
        items: days.map((item) => cap(item, `${item.day} · 2026`)),
      },
      {
        type: "note",
        title: "MATERIAL NOTE",
        body: "页面收录的是已归档的 98 张日更封面，按原始日期排序；未重新绘制封面内容。系列名称「100 天实验」来自原始栏目。",
      },
      {
        type: "text",
        eyebrow: "REFLECTION / 复盘",
        title: "系列的下一种形态。",
        paragraphs: [
          "下一步可以把 98 张封面按主题聚类，形成可检索的视觉索引；同时补齐尚未归档的日期，让时间轴完整闭合。",
          "系列设计真正困难的不是单张好看，而是第 37 张、第 68 张仍然愿意被看。重复提供识别，变化提供继续翻阅的理由。",
        ],
      },
    ],
  },
  {
    slug: "mbti-covers",
    no: "02",
    chapter: "image",
    title: "MBTI 系列",
    titleEn: "MBTI COVERS",
    category: "视频封面 / VIDEO COVERS",
    year: "2025",
    summary: "五个人格关键词，五种情绪温度。同一主题同时输出横版与竖版两套构图。",
    tags: ["视频封面", "双比例", "人格主题"],
    cover: img("mbti", "enfj-land"),
    coverAlt: "ENFJ 温柔理想暴君封面",
    order: 2,
    sections: [
      {
        type: "text",
        eyebrow: "OVERVIEW / 概述",
        title: "先用一张脸，建立一个人格。",
        paragraphs: [
          "围绕 ENFJ、INTP、INTJ、ENFP 与「狼人杀为什么凉了」五个主题制作的视频封面，每个主题同时输出 16:9 与 9:16 两个版本。",
          "五张封面共享电影剧照式的黑白影像与高对比手写标题，但各自用不同的道具、光线与色彩温度区分人格气质。",
        ],
      },
      {
        type: "steps",
        eyebrow: "PROCESS / 过程",
        title: "从关键词到一张脸。",
        items: [
          { no: "01", title: "关键词", body: "把人格类型拆成可被看见的词：理性、温柔、理想、情绪价值。" },
          { no: "02", title: "人物与场景", body: "选择能承载关键词的人物状态、光线与道具。" },
          { no: "03", title: "标题字形", body: "用手写笔触与高对比色制造冲突，让标题成为画面主体。" },
          { no: "04", title: "双比例适配", body: "横版保留环境，竖版重新组织人物与标题，而不是简单裁切。" },
        ],
      },
      {
        type: "gallery",
        eyebrow: "WORKS / 封面",
        title: "五个主题，十个比例。",
        layout: "grid",
        items: group("mbti").map((item) => cap(item, item.key.includes("port") ? "9:16" : "16:9")),
      },
      {
        type: "note",
        title: "MATERIAL NOTE",
        body: "封面中的人物与场景为原始作品的视觉素材；标题、人格关键词与版式为该系列的设计内容。",
      },
    ],
  },
  {
    slug: "subculture-covers",
    no: "03",
    chapter: "image",
    title: "亚文化封面",
    titleEn: "SUBCULTURE",
    category: "议题封面 / EDITORIAL COVERS",
    year: "2025",
    summary: "四组亚文化议题，用拼贴、噪点与高饱和色讨论「小众」。",
    tags: ["议题封面", "拼贴", "亚文化"],
    cover: img("subculture", "majority-land"),
    coverAlt: "为什么亚文化占85%封面",
    order: 3,
    sections: [
      {
        type: "text",
        eyebrow: "OVERVIEW / 概述",
        title: "用亚文化自己的语法，讨论亚文化。",
        paragraphs: [
          "围绕哥特文化、外貌歧视、亚文化占比与亚文化崛起四个议题制作的横竖双版本封面。",
          "画面把杂志剪贴、票根、黑胶、涂鸦、手写标注与高饱和色堆叠在一起，让封面本身就像一张亚文化现场的海报。",
        ],
      },
      {
        type: "gallery",
        eyebrow: "WORKS / 封面",
        title: "四个议题，八张画面。",
        layout: "grid",
        items: group("subculture").map((item) => cap(item, item.width >= item.height ? "横版" : "竖版")),
      },
      {
        type: "note",
        title: "MATERIAL NOTE",
        body: "封面上的标题、数据与观点来自原始作品，未改动文字内容。",
      },
    ],
  },
  {
    slug: "bw-archive",
    no: "04",
    chapter: "image",
    title: "黑白视觉",
    titleEn: "MONOCHROME",
    category: "影像档案 / PHOTO ARCHIVE",
    year: "2025",
    summary: "30 张黑白影像，一次关于光、结构与呼吸的练习。",
    tags: ["黑白", "摄影", "视觉贴图"],
    cover: img("bw", "bw-01"),
    coverAlt: "黑白影像：云层与地平线",
    order: 4,
    sections: [
      {
        type: "text",
        eyebrow: "OVERVIEW / 概述",
        title: "去掉颜色之后，剩下什么。",
        paragraphs: [
          "一组以黑白为共同语言的照片与视觉贴图。云层、地平线、建筑与身体在去除颜色之后，留下更直接的结构。",
          "不依赖色彩，用大面积的灰阶、低对比的天空和一条清晰的地平线建立安静的画面。",
        ],
      },
      {
        type: "gallery",
        eyebrow: "ARCHIVE / 影像墙",
        title: "30 张，保持黑白。",
        layout: "wall",
        items: group("bw").map((item) => cap(item, "黑白影像")),
      },
      {
        type: "note",
        title: "MATERIAL NOTE",
        body: "原图保留黑白影调，未额外套滤镜；页面仅做尺寸压缩以适配网页。",
      },
    ],
  },
  {
    slug: "talk-covers",
    no: "05",
    chapter: "image",
    title: "口播封面",
    titleEn: "TALK COVERS",
    category: "短视频封面 / SHORT VIDEO",
    year: "2025",
    summary: "三张竖版口播封面，三种注意力入口。",
    tags: ["竖版封面", "标题设计", "口播"],
    cover: img("talk", "talk-ai-value"),
    coverAlt: "光会用AI反而不值钱封面",
    order: 5,
    sections: [
      {
        type: "text",
        eyebrow: "OVERVIEW / 概述",
        title: "第一眼，就要给出理由。",
        paragraphs: [
          "为口播内容制作的三张竖版封面，分别用人物表情、数字承诺与情绪化标题建立点击理由。",
          "把标题当成画面主体：超粗描边字、荧光色块、人物近景与手势共同构成短视频封面的第一眼。",
        ],
      },
      {
        type: "gallery",
        eyebrow: "WORKS / 封面",
        title: "三种语气。",
        layout: "strip",
        items: group("talk").map((item) => cap(item, "9:16 竖版")),
      },
      {
        type: "note",
        title: "MATERIAL NOTE",
        body: "封面文字与人物为原始作品内容，未重新撰写标题。",
      },
    ],
  },
  {
    slug: "wolf-design",
    no: "04A",
    chapter: "image",
    title: "狼人杀形象设计",
    titleEn: "WOLF POSTER",
    category: "主视觉 / KEY VISUAL",
    year: "—",
    summary: "一张方形角色群像海报：15 个角色，用色彩、姿态与红色标记建立狼人杀的身份感。",
    tags: ["角色群像", "社交游戏", "方形海报"],
    cover: img("wolf", "wolf-poster"),
    coverAlt: "狼人杀形象设计主视觉",
    order: 4.5,
    sections: [
      {
        type: "text",
        eyebrow: "OVERVIEW / 概述",
        title: "把社交游戏，做成一张先声夺人的画面。",
        paragraphs: [
          "狼人杀形象设计主视觉，方形构图，由 15 个角色画面组成。每个角色独立成格，用色彩、姿态与道具区分身份，让「谁在说谎」成为第一眼的关键词。",
          "现有素材只有这一张角色群像海报，因此这里不补造草图、过程稿或使用场景。",
        ],
      },
      {
        type: "gallery",
        eyebrow: "FINAL / 主视觉",
        title: "一张画面，一种气氛。",
        layout: "wide",
        items: [cap(img("wolf", "wolf-poster"), "角色群像主视觉 / 1:1 / 1254 × 1254")],
      },
      {
        type: "note",
        title: "MATERIAL NOTE",
        body: "单张角色群像海报为原始素材；未虚构客户、投放数据或使用场景。",
      },
    ],
  },
  {
    slug: "panda-ip",
    no: "06",
    chapter: "image",
    title: "小含熊猫 IP",
    titleEn: "XIAOHAN PANDA",
    category: "IP 与角色 / CHARACTER IP",
    year: "2026",
    summary: "保留原角色的比例、粗描边与圆润轮廓，只改变它出现的场景。",
    tags: ["IP", "角色一致性", "社媒应用"],
    cover: img("panda", "panda-original"),
    coverAlt: "小含熊猫原始标准形象",
    featured: true,
    order: 6,
    sections: [
      {
        type: "text",
        eyebrow: "OVERVIEW / 概述",
        title: "先守住角色，再谈延展。",
        paragraphs: [
          "以小含熊猫原始形象为标准，延展到小红书与 PPT 教学内容的封面、场景海报与账号视觉。角色本身不做重新设计，变化发生在道具、版式与叙事场景。",
          "原形象的关键特征被固定下来：圆润的头部比例、粗黑描边、浅色身体、低饱和蓝底与橙色点缀。每次应用只替换它手里的物件与所处的场景。",
        ],
      },
      {
        type: "steps",
        eyebrow: "PROCESS / 过程",
        title: "从一张原图，到一组应用。",
        items: [
          { no: "01", title: "确认标准形象", body: "以原始熊猫图作为唯一角色依据，锁定比例、描边、五官与配色。" },
          { no: "02", title: "提取视觉规则", body: "记录主色、辅助色、线条粗细与圆形底盘的构成方式。" },
          { no: "03", title: "延展应用场景", body: "把角色放进 PPT 教学、社媒封面与内容栏目，保持同一张脸。" },
          { no: "04", title: "统一版式", body: "用固定的标题位置与账号信息，让不同内容看起来仍属于同一个 IP。" },
        ],
      },
      {
        type: "gallery",
        eyebrow: "WORKS / 已完成应用",
        title: "同一张脸，不同的场景。",
        note: "原始标准形象与 8 张内容应用海报。",
        layout: "grid",
        items: [cap(img("panda", "panda-original"), "原始标准形象 / ORIGINAL"), ...pandaPosters.map((item) => cap(item, "内容应用 / APPLICATION"))],
      },
      {
        type: "note",
        title: "MATERIAL NOTE",
        body: "角色标准形象以原始图为唯一依据；场景海报为 IP 应用与 AI 辅助延展，不作为新的角色设定，也不改变原 IP 的外观。",
      },
      {
        type: "placeholder",
        title: "IP 延展 / 待上传",
        body: "以下为计划中的延展内容，目前没有对应的真实成品素材，因此以占位方式呈现。",
        items: ["九宫格表情包", "角色三视图", "书包 / 帆布袋 / 手机壳 / 贴纸", "IP 视觉规范页"],
      },
      {
        type: "text",
        eyebrow: "REFLECTION / 复盘",
        title: "让角色成为可复用的资产。",
        paragraphs: [
          "下一步优先补齐三视图与表情包，让角色从「单张形象」变成可复用的 IP 资产；再把颜色、描边与版式写成一份可交付的视觉规范。",
          "延展的难点不在画一个新动作，而在每一次新动作里仍然让人认出是同一个角色。",
        ],
      },
    ],
  },
  {
    slug: "drama-characters",
    no: "07",
    chapter: "image",
    title: "短剧角色设定",
    titleEn: "CHARACTER SHEETS",
    category: "角色视觉 / CHARACTER DESIGN",
    year: "2026",
    summary: "从参考板、三视图到细节网格，建立角色在不同镜头里的连续性。",
    tags: ["角色设定", "三视图", "一致性"],
    cover: img("drama", "drama-03"),
    coverAlt: "短剧男女主角色一致性参考板",
    featured: true,
    order: 7,
    sections: [
      {
        type: "text",
        eyebrow: "OVERVIEW / 概述",
        title: "让角色在每个角度都成立。",
        paragraphs: [
          "一组真人短剧男女主角色视觉设定，包含成年/儿童、民国红与现代绿两套造型方向，以及三视图、细节网格与封面应用。",
          "用同一张参考板锁定脸型、发型、服装结构与配色，再通过三视图和细节网格检查每个角度是否仍然成立。",
        ],
      },
      {
        type: "steps",
        eyebrow: "PROCESS / 过程",
        title: "一致性是被检查出来的。",
        items: [
          { no: "01", title: "参考板", body: "先确定人物关系、时代气质与色彩方向，形成可对照的视觉锚点。" },
          { no: "02", title: "全身与三视图", body: "把正面、侧面、背面放在同一张图上，检查比例与服装结构。" },
          { no: "03", title: "细节网格", body: "拆解发型、领口、纹样、鞋履与配饰，减少不同角度之间的漂移。" },
          { no: "04", title: "封面应用", body: "把角色放回社媒比例与标题版式中，验证它在真实使用场景里的识别度。" },
        ],
      },
      {
        type: "gallery",
        eyebrow: "WORKS / 设定节选",
        title: "参考板、三视图与细节。",
        layout: "grid",
        items: [
          cap(img("drama", "drama-03"), "一致性参考板"),
          cap(img("drama", "drama-18"), "人物参考页"),
          cap(img("drama", "drama-21"), "成人角色三视图"),
          cap(img("drama", "drama-20"), "细节网格"),
          cap(img("drama", "drama-16"), "儿童角色三视图"),
          cap(img("drama", "drama-13"), "儿童全身"),
          cap(img("drama", "drama-09"), "封面主视觉"),
          cap(img("drama", "drama-27"), "现代绿封面"),
        ],
      },
      {
        type: "note",
        title: "MATERIAL NOTE",
        body: "该组素材为 AI 辅助角色视觉设定与概念图，用于展示角色一致性与视觉开发流程；不代表已经完成的影视成片。",
      },
      {
        type: "text",
        eyebrow: "REFLECTION / 复盘",
        title: "从静态设定走向连续镜头。",
        paragraphs: [
          "下一步需要把静态设定转成连续镜头测试，验证角色在运动、不同光线与不同景别下的稳定性。",
          "三视图解决的是「看起来像」，连续镜头解决的才是「一直是同一个人」。",
        ],
      },
    ],
  },
  {
    slug: "interview-design",
    no: "08",
    chapter: "image",
    title: "大学生采访视觉",
    titleEn: "CAMPUS INTERVIEW",
    category: "采访主视觉 / KEY VISUAL",
    year: "2026",
    summary: "把「大学生做生意」做成一个有行动感的视觉封面。",
    tags: ["采访视觉", "手写标题", "校园"],
    cover: img("interview", "interview-cover"),
    coverAlt: "大学生又在搞钱了采访主视觉",
    order: 8,
    sections: [
      {
        type: "text",
        eyebrow: "OVERVIEW / 概述",
        title: "把一个题目，变成一张有动作的封面。",
        paragraphs: [
          "为大学生创业采访内容制作的横版主视觉，以手写标题、校园建筑与行动符号构成画面。",
          "用蓝白撕纸底、黄色手写重点与校园建筑剪影，把「搞钱」这个轻话题放回校园现场。",
        ],
      },
      {
        type: "gallery",
        eyebrow: "WORK / 主视觉",
        title: "大学生又在搞钱了。",
        layout: "wide",
        items: [cap(img("interview", "interview-cover"), "采访主视觉 / 16:9")],
      },
      {
        type: "note",
        title: "MATERIAL NOTE",
        body: "标题与栏目信息来自原始作品；页面未改写采访内容或人物身份。",
      },
    ],
  },
  {
    slug: "campus-architecture",
    no: "09",
    chapter: "image",
    title: "长理建筑线稿",
    titleEn: "CAMPUS IN LINE",
    category: "校园视觉 / CAMPUS",
    year: "2025",
    summary: "用线稿记录校园建筑的结构，再把它转译为节庆与传播场景里的视觉资产。",
    tags: ["建筑线稿", "校园", "视觉档案"],
    cover: img("campus", "arch-01"),
    coverAlt: "长理典型建筑线稿",
    featured: true,
    order: 9,
    sections: [
      {
        type: "text",
        eyebrow: "OVERVIEW / 概述",
        title: "用线，把建筑留下来。",
        paragraphs: [
          "长理校园视觉项目，包含 6 张典型建筑线稿、红包封图与党代会顶图。",
          "建筑线稿负责「记录」：用密集排线保留结构、材质与光影；节庆视觉负责「转译」：把同一组建筑轮廓放进红金配色与横向版式里。",
        ],
      },
      {
        type: "steps",
        eyebrow: "PROCESS / 过程",
        title: "从取景到排线。",
        items: [
          { no: "01", title: "建筑取景", body: "选择能代表校园性格的角度，保留主体与环境的比例关系。" },
          { no: "02", title: "线稿结构", body: "先确定体块、透视与主要轮廓，再进入细节。" },
          { no: "03", title: "排线与光影", body: "用不同密度的排线区分材质、明暗与前后关系。" },
          { no: "04", title: "节庆转译", body: "把建筑轮廓放进红金配色与横向版式，形成另一套应用语言。" },
        ],
      },
      {
        type: "gallery",
        eyebrow: "ARCHIVE / 建筑档案",
        title: "六张线稿。",
        layout: "grid",
        items: group("campus").map((item, index) => cap(item, `建筑线稿 ${String(index + 1).padStart(2, "0")}`)),
      },
      {
        type: "text",
        eyebrow: "REFLECTION / 复盘",
        title: "一套可以继续生长的校园语言。",
        paragraphs: [
          "同一组建筑语言可以继续扩展到导视、文创与招生视觉；线稿提供结构，色彩与版式提供场景。",
          "下一步会把 6 张线稿整理成可复用的矢量资产，并补上建筑名称与使用规范。",
        ],
      },
    ],
  },
  {
    slug: "red-packet",
    no: "10",
    chapter: "image",
    title: "长理红包封图",
    titleEn: "RED PACKET",
    category: "文创视觉 / MERCH",
    year: "2026",
    summary: "三种风格，同一套校园符号。",
    tags: ["红包", "文创", "节庆"],
    cover: img("redpacket", "red-packet"),
    coverAlt: "长理红包封图三款设计",
    order: 10,
    sections: [
      {
        type: "text",
        eyebrow: "OVERVIEW / 概述",
        title: "把校园装进一个红包。",
        paragraphs: [
          "长理 IP 红包封图设计，以校园建筑、马年纹样与卡通形象组成三张可展开的红包封面。",
          "把校门、图书馆与主楼做成可识别的剪影，再用红金、线稿与卡通三套语言分别对应传统、雅致与年轻三种气质。",
        ],
      },
      {
        type: "gallery",
        eyebrow: "WORK / 封图",
        title: "三款并置。",
        layout: "wide",
        items: [cap(img("redpacket", "red-packet"), "红包封图 / 三款")],
      },
      {
        type: "note",
        title: "MATERIAL NOTE",
        body: "画面中的校园建筑与年份信息来自原始作品；页面未虚构使用场景或发放数据。",
      },
    ],
  },
  {
    slug: "fifteen-five",
    no: "11",
    chapter: "image",
    title: "十五五顶图",
    titleEn: "HORIZON BANNER",
    category: "主题顶图 / BANNER",
    year: "2026",
    summary: "横向长画幅里的信息层级与城市轮廓。",
    tags: ["长画幅", "主题视觉", "版式"],
    cover: img("fifteen", "fifteen-five"),
    coverAlt: "聚焦十五五 喜迎党代会顶图",
    order: 11,
    sections: [
      {
        type: "text",
        eyebrow: "OVERVIEW / 概述",
        title: "让一行标题，撑住一整条地平线。",
        paragraphs: [
          "「聚焦十五五 喜迎党代会」主题顶图，用横向长画幅承载标题、校园建筑群与节庆氛围。",
          "标题占据上半部的绝对主位，建筑线稿沿地平线展开，红金渐变把视线从中心推向两侧。",
        ],
      },
      {
        type: "gallery",
        eyebrow: "WORK / 顶图",
        title: "横向长画幅。",
        layout: "wide",
        items: [cap(img("fifteen", "fifteen-five"), "主题顶图 / 横版")],
      },
    ],
  },
  {
    slug: "editorial",
    no: "12",
    chapter: "image",
    title: "图文与编排",
    titleEn: "EDITORIAL",
    category: "编辑设计 / EDITORIAL",
    year: "2025",
    summary: "从标题、留白到图片节奏，排版也是一种叙事。",
    tags: ["公众号", "长图文", "秀米"],
    cover: img("xinlingChild", "xl-child-01"),
    coverAlt: "童年动画的温柔暴击封面",
    featured: true,
    order: 12,
    sections: [
      {
        type: "text",
        eyebrow: "OVERVIEW / 概述",
        title: "把手机屏幕，当成一张版面。",
        paragraphs: [
          "两组公众号图文：心灵故事系列长图文与秀米排版练习。前者以台词与情绪为线索，后者以校园议题为内容。",
          "把手机屏幕当作版面：每屏只保留一个主要信息，用章节页、引语、留白和图片切换控制向下阅读的节奏。",
        ],
      },
      {
        type: "steps",
        eyebrow: "PROCESS / 过程",
        title: "先分段，再排版。",
        items: [
          { no: "01", title: "内容分段", body: "把长文拆成可以被一屏承接的段落与章节。" },
          { no: "02", title: "章节页", body: "用标题、引语与留白建立阅读的停顿。" },
          { no: "03", title: "图文关系", body: "让图片承担情绪，文字承担信息，避免互相打断。" },
          { no: "04", title: "手机端节奏", body: "按真实屏幕高度检查每一屏的信息密度与滚动节奏。" },
        ],
      },
      {
        type: "gallery",
        eyebrow: "SERIES 01 / 心灵故事",
        title: "童年动画的温柔暴击。",
        note: "6 页长图文，按原始顺序排列。",
        layout: "strip",
        items: group("xinlingChild").map((item, index) => cap(item, `P${String(index + 1).padStart(2, "0")}`)),
      },
      {
        type: "gallery",
        eyebrow: "SERIES 02 / 心灵故事",
        title: "以杀为刃，护我所执。",
        note: "6 页长图文，按原始顺序排列。",
        layout: "strip",
        items: group("xinlingSword").map((item, index) => cap(item, `P${String(index + 1).padStart(2, "0")}`)),
      },
      {
        type: "gallery",
        eyebrow: "SERIES 03 / 心灵故事",
        title: "智慧的低语，心灵的启迪。",
        note: "6 页长图文，按原始顺序排列。",
        layout: "strip",
        items: group("xinlingWisdom").map((item, index) => cap(item, `P${String(index + 1).padStart(2, "0")}`)),
      },
      {
        type: "gallery",
        eyebrow: "SERIES 04 / 秀米排版",
        title: "现状剖析：大学生的四重迷雾。",
        note: "4 页手机端排版，按原始顺序排列。",
        layout: "strip",
        items: group("xiumi").map((item, index) => cap(item, `P${String(index + 1).padStart(2, "0")}`)),
      },
      {
        type: "note",
        title: "MATERIAL NOTE",
        body: "长图按原始顺序展示，可在灯箱中放大阅读；页面未改写文章内容。",
      },
    ],
  },
  {
    slug: "drawing",
    no: "13",
    chapter: "image",
    title: "绘画与造型",
    titleEn: "DRAWN BY HAND",
    category: "绘画 / DRAWING",
    year: "2025",
    summary: "绘画是视觉能力的底层训练。这里保留原作的笔触、纸张与光影。",
    tags: ["板绘", "素描", "原作"],
    cover: img("drawing", "draw-04"),
    coverAlt: "板绘作品：绿色植物与石头",
    featured: true,
    order: 13,
    sections: [
      {
        type: "text",
        eyebrow: "OVERVIEW / 概述",
        title: "先用手，理解形状。",
        paragraphs: [
          "板绘与素描作品选。板绘包含角色、植物与场景练习；素描以人物结构为主。",
          "不套滤镜、不做 AI 风格化，保留纸张纹理、笔触边缘与原始扫描的色偏。",
        ],
      },
      {
        type: "gallery",
        eyebrow: "WORKS / 板绘",
        title: "数字笔触。",
        layout: "grid",
        items: group("drawing").map((item, index) => cap(item, `板绘作品 ${String(index + 1).padStart(2, "0")}`)),
      },
      {
        type: "gallery",
        eyebrow: "WORKS / 素描",
        title: "纸上的结构。",
        layout: "wide",
        items: group("sketch").map((item) => cap(item, "素描作品 / 原作扫描")),
      },
      {
        type: "note",
        title: "MATERIAL NOTE",
        body: "展示为原作扫描/导出，未进行风格化处理，也未把素描处理成 AI 风格。后续若补充草图、线稿与深入刻画的过程文件，会按真实顺序加入。",
      },
    ],
  },
  {
    slug: "fast-wave-game",
    no: "14",
    chapter: "image",
    title: "快放电波",
    titleEn: "FAST WAVE",
    category: "游戏视觉 / GAME UI",
    year: "2025",
    summary: "用声波、霓虹和玻璃质感，建立一套节奏游戏的界面语言。",
    tags: ["游戏界面", "声波", "UI 组件"],
    cover: img("game", "game-cover"),
    coverAlt: "快放电波游戏标题界面",
    featured: true,
    order: 14,
    sections: [
      {
        type: "text",
        eyebrow: "OVERVIEW / 概述",
        title: "让声音，变成看得见的界面。",
        paragraphs: [
          "快放电波游戏视觉设计，包含标题页、玩法说明、游戏内界面与一套可复用的 UI 组件。",
          "深蓝底、青蓝霓虹、声波网格与玻璃拟态按钮，把「声音」变成可见的界面材质。",
        ],
      },
      {
        type: "steps",
        eyebrow: "PROCESS / 过程",
        title: "从氛围到组件。",
        items: [
          { no: "01", title: "情绪板", body: "收集声波、示波器、霓虹与玻璃材质，确定冷暖对比。" },
          { no: "02", title: "标题页", body: "用超大字标与声波环形阵列建立第一眼的节奏感。" },
          { no: "03", title: "游戏内 HUD", body: "把分数、提示、摇杆与音量控件放进同一套发光边框。" },
          { no: "04", title: "组件拆分", body: "把按钮、摇杆、滑块与弹窗拆成可复用组件。" },
        ],
      },
      {
        type: "gallery",
        eyebrow: "SCREENS / 界面",
        title: "标题、玩法与游戏内。",
        layout: "wide",
        items: [cap(img("game", "game-cover"), "标题页"), cap(img("game", "game-inner"), "游戏内界面"), cap(img("game", "game-play"), "玩法示例")],
      },
      {
        type: "gallery",
        eyebrow: "KIT / 组件",
        title: "一套可复用的 UI 零件。",
        layout: "grid",
        items: [
          cap(img("game", "game-start"), "开始按钮"),
          cap(img("game", "game-rocker"), "摇杆"),
          cap(img("game", "game-range"), "滑块"),
          cap(img("game", "game-volume"), "音量"),
          cap(img("game", "game-rule"), "规则"),
          cap(img("game", "game-tell"), "提示"),
          cap(img("game", "game-button"), "按钮"),
          cap(img("game", "game-close"), "关闭"),
        ],
      },
      {
        type: "note",
        title: "MATERIAL NOTE",
        body: "本站展示的是游戏视觉与界面设计案例，不包含可运行的游戏版本，也不虚构试玩功能。",
      },
      {
        type: "text",
        eyebrow: "REFLECTION / 复盘",
        title: "下一步，验证手感。",
        paragraphs: [
          "下一步可以把 UI 组件做成可交互的视觉原型，验证按钮、摇杆与音量控件的手感。",
          "游戏视觉的完成度不只在截图里，还在按下按钮之后的那 0.2 秒。",
        ],
      },
    ],
  },
  {
    slug: "second-culture",
    no: "15",
    chapter: "image",
    title: "第二文化 UI",
    titleEn: "SUBCULTURE APP",
    category: "界面设计 / PRODUCT UI",
    year: "2025",
    summary: "把亚文化测试产品，做成一套可浏览、可分享的界面。",
    tags: ["小程序", "UI", "亚文化"],
    cover: img("ui", "01-home"),
    coverAlt: "第二文化小程序首页",
    order: 15,
    sections: [
      {
        type: "text",
        eyebrow: "OVERVIEW / 概述",
        title: "把现场感带进产品。",
        paragraphs: [
          "第二文化小程序 UI 设计，包含首页、测试介绍、题库、报告、筛选与注册等 8 个核心界面，以及一段界面演示。",
          "黑白影像、荧光绿点缀与大字号标题，把亚文化的「现场感」带进产品界面；卡片圆角与底部导航保证可用性。",
        ],
      },
      {
        type: "gallery",
        eyebrow: "SCREENS / 界面",
        title: "八个核心屏幕。",
        layout: "strip",
        items: group("ui").map((item) => cap(item, "375 × 812")),
      },
      {
        type: "note",
        title: "MATERIAL NOTE",
        body: "展示为 UI 设计稿与界面演示，不代表线上产品状态；页面未虚构用户数据或运营结果。",
      },
    ],
  },
  {
    slug: "audio-collection",
    no: "01",
    chapter: "sound",
    title: "音频与封面设计",
    titleEn: "AUDIO COLLECTION",
    category: "声音档案 / AUDIO ARCHIVE",
    year: "2026",
    summary: "五张封面，五段声音。关于经历、筛选与成长的音频档案。",
    tags: ["播客", "封面", "声音"],
    cover: img("soundCovers", "cover-main"),
    coverAlt: "万丈红尘体验为王音频封面",
    featured: true,
    order: 1,
    sections: [
      {
        type: "text",
        eyebrow: "OVERVIEW / 概述",
        title: "声音，是思想的另一种形态。",
        paragraphs: [
          "《万丈红尘》与《体验为王》音频系列，包含 1 条长音频与 4 段手记，以及 5 张同系列封面。",
          "封面共享同一组视觉母题：窗、台灯、耳机、纸页与城市的光。标题用细画线宋体压在大面积留白上，像在夜里写下的一页手记。",
        ],
      },
      { type: "audio", eyebrow: "LISTEN / 试听", title: "真实音频，真实波形。", note: "点击播放；波形由当前音频的频谱数据驱动。" },
      {
        type: "gallery",
        eyebrow: "COVERS / 封面",
        title: "五张封面，同一扇窗。",
        layout: "grid",
        items: group("soundCovers").map((item) => cap(item, "1:1 封面")),
      },
      {
        type: "note",
        title: "MATERIAL NOTE",
        body: "五条音频与五张封面均为原始素材；播放器读取真实音频文件，不使用模拟播放。",
      },
      {
        type: "text",
        eyebrow: "REFLECTION / 复盘",
        title: "把「听」变成一种空间。",
        paragraphs: [
          "这一组作品的重点不是把封面做得更响，而是让人愿意在夜里停下来听几分钟。",
          "下一步可以把五期内容做成一条可连续播放的声音时间轴，并补齐每期的文字摘要与章节标记。",
        ],
      },
    ],
  },
  {
    slug: "film-archive",
    no: "01",
    chapter: "experience",
    title: "影像档案",
    titleEn: "FILM ARCHIVE",
    category: "影像 / FILM",
    year: "2026",
    summary: "钢琴、古筝、画画与 PPT——四种内容，四种节奏。",
    tags: ["视频", "演奏", "演示"],
    cover: filmCover,
    coverAlt: "钢琴演奏封面图",
    featured: true,
    order: 1,
    sections: [
      {
        type: "text",
        eyebrow: "OVERVIEW / 概述",
        title: "每一段影像，都是一次表达。",
        paragraphs: [
          "公众号影像作品档案，收录 11 段视频与 4 份演示文稿节选。",
          "把视频按内容类型而不是时间顺序排列：演奏看手与弦，画画看线条生长，PPT 看信息如何被组织成叙事。",
        ],
      },
      { type: "film", eyebrow: "SCREENING / 放映", title: "按类型进入放映室。" },
      {
        type: "note",
        title: "MATERIAL NOTE",
        body: "视频为原始素材转码，保留原声；PPT 以节选页与 PDF 形式展示，未虚构演示内容。",
      },
    ],
  },
];

export const workBySlug = (slug: string) => WORKS.find((work) => work.slug === slug);
export const worksByChapter = (chapter: Chapter) => WORKS.filter((work) => work.chapter === chapter).sort((a, b) => a.order - b.order);

export const STATS = {
  images: Object.values(IMG).reduce((sum, items) => sum + items.length, 0),
  videos: Object.values(VID).reduce((sum, items) => sum + items.length, 0),
  audio: AUDIO.length,
  works: WORKS.length,
};

export const filmVideos = {
  piano: VID.piano ?? [],
  guzheng: VID.guzheng ?? [],
  painting: VID.painting ?? [],
  ppt: VID.ppt ?? [],
  ui: VID.ui ?? [],
};