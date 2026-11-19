import type { Metadata } from "next";
import "./sound.css";
import { Play } from "@/components/Icons";
import { CoverAtlas } from "@/components/sound/CoverAtlas";
import { SoundArchive } from "@/components/sound/SoundArchive";
import { TransitionLink } from "@/components/TransitionLink";
import { AUDIO, group } from "@/content/works";

export const metadata: Metadata = {
  title: "成声 · 声音档案",
  description: "五条音轨与五张同系列封面，同一个主题。",
};

const covers = group("soundCovers");
const tracks = AUDIO;
const total = tracks.reduce((sum, track) => sum + track.duration, 0);
const mm = Math.floor(total / 60);
const ss = Math.round(total % 60);
const totalLabel = `${mm}:${String(ss).padStart(2, "0")}`;

const coverCaptions = [
  "万丈红尘，体验为王 / 主封面",
  "你只是经历了，却从来没有成长",
  "你很敢体验，却不懂筛选体验",
  "你总想体验高光，却容不下普通",
  "你太想要结果，所以体验不到生活",
];

const coverGallery = covers.map((cover, index) => ({
  src: cover.src,
  alt: `${coverCaptions[index]} 封面`,
  caption: `${String(index + 1).padStart(2, "0")} / ${coverCaptions[index]} · 1:1`,
}));

const floor = Array.from({ length: 64 }, (_, index) => {
  const a = Math.abs(Math.sin(index * 0.33) * 0.56 + Math.sin(index * 0.11 + 2.1) * 0.44);
  return Math.max(6, Math.round(a * 100));
});

export default function SoundChapterPage() {
  return (
    <div className="chapter-page sound-chapter">
      <section className="sound-hero">
        <div className="wrap sound-hero__grid">
          <div className="sound-hero__copy">
            <div className="chapter-hero__label" data-reveal>
              <span className="mono">第二章 · 成声</span>
              <span className="status status--ready">{tracks.length} 条音轨 / {totalLabel}</span>
            </div>

            <h1 className="chapter-hero__title serif" data-reveal>
              <span className="char">成</span><span className="char">声</span>
            </h1>

            <p className="chapter-hero__lead sound-hero__album" data-reveal style={{ "--d": "190ms" } as React.CSSProperties}>
              万丈红尘，体验为王
            </p>

            <div className="sound-hero__actions" data-reveal style={{ "--d": "260ms" } as React.CSSProperties}>
              <a href="#c-player" className="btn sound-hero__listen">
                <Play size={14} /> 播放
              </a>
            </div>

          </div>

          <div className="sound-hero__aside" data-reveal="mask" style={{ "--d": "200ms" } as React.CSSProperties}>
            <div className="sound-hero__disc-wrap" data-tilt="0.4" data-glare>
              <div className="sound-hero__disc">
                <img src={covers[0]?.src} alt="万丈红尘体验为王封面" />
              </div>
              <span className="sound-hero__hole" aria-hidden="true" />
              <span className="sound-hero__orbit sound-hero__orbit--a" aria-hidden="true"><i /></span>
              <span className="sound-hero__orbit sound-hero__orbit--b" aria-hidden="true"><i /></span>
            </div>
          </div>
        </div>
      </section>

      <section className="sound-archive section" id="c-player">
        <div className="wrap sound-archive__stage">
          <SoundArchive tracks={tracks} />
        </div>

        <div className="wrap sound-archive__covers">
          <CoverAtlas covers={covers} captions={coverCaptions} gallery={coverGallery} />
        </div>

        <div className="sound-archive__floor" aria-hidden="true">
          {floor.map((height, index) => (
            <span key={index} style={{ "--i": `${index}`, "--h": `${height}%` } as React.CSSProperties} />
          ))}
        </div>
      </section>

      <div className="wrap">
        <div className="chapter-foot">
          <TransitionLink href="/experience/" className="chapter-foot__next">
            <div>
              <span className="mono muted">下一章 · 03</span>
              <h2 className="serif">成境</h2>
            </div>
            <span className="arrow">→</span>
          </TransitionLink>
        </div>
      </div>
    </div>
  );
}



