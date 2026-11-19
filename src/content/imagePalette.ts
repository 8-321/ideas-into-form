export type ImagePalette = {
  accent: string;
  deep: string;
  wash: string;
  paper: string;
};

export const IMAGE_PALETTES: Record<string, ImagePalette> = {
  A: { accent: "#927c58", deep: "#67563b", wash: "#eae3d5", paper: "#f1eee6" },
  B: { accent: "#707c7d", deep: "#505a5b", wash: "#e8e7e2", paper: "#f1eee6" },
  C: { accent: "#8c7a61", deep: "#635644", wash: "#eae3d6", paper: "#f1eee6" },
  D: { accent: "#7a7164", deep: "#564f45", wash: "#e9e4da", paper: "#f1eee6" },
  E: { accent: "#727c75", deep: "#525a55", wash: "#e9e8e2", paper: "#f1eee6" },
  F: { accent: "#6e797d", deep: "#4f595c", wash: "#e8e7e3", paper: "#f1eee6" },
  G: { accent: "#83745f", deep: "#5c5141", wash: "#e9e3d8", paper: "#f1eee6" },
};

export const SERIES_ACCENTS: Record<string, string> = {
  "100 天实验": "#8f7752",
  "人格封面": "#7a7062",
  "亚文化封面": "#96715a",
  "黑白视觉": "#6f6c64",
  "口播封面": "#6e7b80",
  "熊猫角色": "#76858a",
  "角色视觉": "#876b62",
  "狼人杀形象": "#8f7c5f",
  "采访设计": "#71838a",
  "校园建筑": "#8a7d6b",
  "红包设计": "#9a6b52",
  "十五五视觉": "#9a7a50",
  "儿童插画": "#788a90",
  "刀剑意象": "#8c7858",
  "智慧主题": "#95845c",
  "图文编排": "#71817a",
  "绘画作品": "#9a7d66",
  "速写手稿": "#877f73",
  "快放声波": "#66777d",
  "第二文化界面": "#5f6d68",
};

export const paletteForFolder = (letter: string): ImagePalette =>
  IMAGE_PALETTES[letter] ?? IMAGE_PALETTES.A;

export const accentForSeries = (series: string): string =>
  SERIES_ACCENTS[series] ?? paletteForFolder("A").accent;

