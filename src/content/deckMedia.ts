export type DeckClip = {
  id: string;
  label: string;
  src: string;
  poster: string;
  duration: number;
  width: number;
  height: number;
};

export type DeckVideoPage = {
  slide: number;
  clips: DeckClip[];
};

type ClipOptions = {
  folder: string;
  id: string;
  label: string;
  duration: number;
  width: number;
  height: number;
};

const clip = ({ folder, id, label, duration, width, height }: ClipOptions): DeckClip => ({
  id,
  label,
  src: `/media/ppt/${folder}/${id}.mp4`,
  poster: `/media/ppt/${folder}/${id}@poster.webp`,
  duration,
  width,
  height,
});

const aiClip = (id: string, label: string, duration: number, width: number, height: number) =>
  clip({ folder: "ai-product/video", id, label, duration, width, height });

const defenseClip = (id: string, label: string, duration: number, width: number, height: number) =>
  clip({ folder: "defense/video", id, label, duration, width, height });

export const DECK_VIDEO_PAGES: Record<string, DeckVideoPage[]> = {
  "ai-product": [
    { slide: 1, clips: [aiClip("slide-02-intro", "文字开场", 12.17, 1920, 1082)] },
    { slide: 4, clips: [aiClip("slide-05-buff", "五重身份", 15.07, 1280, 720)] },
    {
      slide: 5,
      clips: [
        aiClip("slide-06-award", "证书", 10.67, 720, 896),
        aiClip("slide-06-docs", "手记", 25.43, 720, 960),
        aiClip("slide-06-stage", "领奖", 14.37, 1280, 720),
        aiClip("slide-06-desk", "现场", 31, 1280, 720),
      ],
    },
    {
      slide: 9,
      clips: [
        aiClip("slide-10-collage", "剪影", 30.81, 960, 720),
        aiClip("slide-10-circuit", "电路", 7.21, 1280, 720),
        aiClip("slide-10-toys", "物件", 5.57, 1280, 720),
        aiClip("slide-10-scenes", "片段", 18.65, 1280, 720),
      ],
    },
    { slide: 15, clips: [aiClip("slide-16-presentation", "生成演示", 18, 1280, 720)] },
    { slide: 20, clips: [aiClip("slide-21-interface", "界面演示", 12.52, 1280, 720)] },
  ],
  defense: [
    {
      slide: 10,
      clips: [
        defenseClip("clip-01", "作品片段一", 44.53, 720, 896),
        defenseClip("clip-02", "作品片段二", 19.78, 660, 774),
      ],
    },
  ],
};

export const deckVideoPage = (deckKey: string, slide: number) =>
  DECK_VIDEO_PAGES[deckKey]?.find((page) => page.slide === slide);

export const deckVideoCount = (deckKey: string) =>
  DECK_VIDEO_PAGES[deckKey]?.reduce((total, page) => total + page.clips.length, 0) ?? 0;
