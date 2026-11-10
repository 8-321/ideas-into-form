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
  "100 DAYS": "#7c944f",
  MBTI: "#7c5a7f",
  SUBCULTURE: "#a8684b",
  MONO: "#6f6c64",
  TALK: "#59758f",
  PANDA: "#7696b7",
  DRAMA: "#8b514c",
  WOLF: "#98724e",
  INTERVIEW: "#6f8ca8",
  CAMPUS: "#8d806d",
  "RED PACKET": "#b35840",
  HORIZON: "#b06e3d",
  CHILD: "#8196b4",
  SWORD: "#98733f",
  WISDOM: "#a49245",
  XIUMI: "#7b917e",
  DRAWING: "#b08067",
  SKETCH: "#8e8479",
  "FAST WAVE": "#2e7f9c",
  "SUBCULTURE APP": "#4f635d",
};

export const paletteForFolder = (letter: string): ImagePalette =>
  IMAGE_PALETTES[letter] ?? IMAGE_PALETTES.A;

export const accentForSeries = (series: string): string =>
  SERIES_ACCENTS[series] ?? paletteForFolder("A").accent;
