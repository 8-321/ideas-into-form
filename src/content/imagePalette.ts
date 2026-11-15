export type ImagePalette = {
  accent: string;
  deep: string;
  wash: string;
  paper: string;
};

export const IMAGE_PALETTES: Record<string, ImagePalette> = {
  A: { accent: "#81975a", deep: "#52613b", wash: "#e8ecd9", paper: "#f2f0e7" },
  B: { accent: "#607f9f", deep: "#3f5469", wash: "#e3eaf0", paper: "#f0f2f3" },
  C: { accent: "#b3714d", deep: "#75462e", wash: "#f1e3d9", paper: "#f4eee8" },
  D: { accent: "#a99346", deep: "#6e5e2a", wash: "#eee9d5", paper: "#f3f0e4" },
  E: { accent: "#b17d6d", deep: "#754e43", wash: "#f0e4df", paper: "#f4efeb" },
  F: { accent: "#2e7f9c", deep: "#195269", wash: "#deedf2", paper: "#ebf1f3" },
  G: { accent: "#526660", deep: "#34443f", wash: "#e1e8e5", paper: "#edf1ef" },
};

export const SERIES_ACCENTS: Record<string, string> = {
  "100 天实验": "#7c944f",
  "人格封面": "#7c5a7f",
  "亚文化封面": "#a8684b",
  "黑白视觉": "#6f6c64",
  "口播封面": "#59758f",
  "熊猫角色": "#7696b7",
  "角色视觉": "#8b514c",
  "狼人杀形象": "#98724e",
  "采访设计": "#6f8ca8",
  "校园建筑": "#8d806d",
  "红包设计": "#b35840",
  "十五五视觉": "#b06e3d",
  "儿童插画": "#8196b4",
  "刀剑意象": "#98733f",
  "智慧主题": "#a49245",
  "图文编排": "#7b917e",
  "绘画作品": "#b08067",
  "速写手稿": "#8e8479",
  "快放声波": "#2e7f9c",
  "第二文化界面": "#4f635d",
};

export const paletteForFolder = (letter: string): ImagePalette =>
  IMAGE_PALETTES[letter] ?? IMAGE_PALETTES.A;

export const accentForSeries = (series: string): string =>
  SERIES_ACCENTS[series] ?? paletteForFolder("A").accent;
