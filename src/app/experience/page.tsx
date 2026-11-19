import type { Metadata } from "next";
import "./experience.css";
import { ChapterNav } from "@/components/ChapterNav";
import { Cinema, type CinemaGroup } from "@/components/experience/Cinema";
import { DeckViewer } from "@/components/experience/DeckViewer";
import { FilmArtwork } from "@/components/experience/FilmArtwork";
import { ProgrammeRail, type ProgrammeItem } from "@/components/experience/ProgrammeRail";
import { ArrowRight, Play } from "@/components/Icons";
import { TransitionLink } from "@/components/TransitionLink";
import { DECKS, FILM_COVERS, filmVideos, vid, type ImageAsset, type VideoAsset } from "@/content/works";

export const metadata: Metadata = {
  title: "成境 · 影像与演示",
  description: "钢琴、古筝、绘画与演示文稿，11 段真实影像与 4 份演示文稿。",
};

const nav = [
  { id: "b-screenings", no: "一", label: "放映" },
  { id: "c-programme", no: "二", label: "节目" },
  { id: "d-decks", no: "三", label: "演示" },
];

const fmt = (value: number) => {
  const m = Math.floor(value / 60);
  const s = Math.round(value % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
};

const groups: CinemaGroup[] = [
  {
    key: "piano",
    label: "钢琴",
    cover: FILM_COVERS.piano,
    videos: filmVideos.piano,
  },
  {
    key: "guzheng",
    label: "古筝",
    cover: FILM_COVERS.guzheng,
    videos: filmVideos.guzheng,
  },
  {
    key: "painting",
    label: "画画",
    videos: filmVideos.painting,
  },
  {
    key: "ppt",
    label: "演示",
    videos: filmVideos.ppt,
  },
];

const allVideos = groups.flatMap((item) => item.videos);
const totalRuntime = allVideos.reduce((sum, video) => sum + video.duration, 0);
const totalDecks = DECKS.reduce((sum, deck) => sum + deck.slideCount, 0);
const heroPoster = vid("piano", "piano-wedding");
const heroCover = FILM_COVERS.piano;
const reel = groups.map((item) => ({
  key: item.key,
  label: item.label,
  src: item.cover?.thumb ?? item.cover?.src ?? item.videos[0]?.poster,
})).filter((item) => Boolean(item.src));

const programme: ProgrammeItem[] = groups.map((item) => {
  const stillAsset: ImageAsset | VideoAsset | undefined = item.cover ?? item.videos[0];
  const stillSrc = stillAsset ? ("poster" in stillAsset ? stillAsset.poster : stillAsset.src) : undefined;
  const tone = item.key === "guzheng" ? "#3a241b" : item.key === "painting" ? "#24312a" : item.key === "ppt" ? "#1b2b35" : "#2b241b";
  return {
    key: item.key,
    label: item.label,
    portrait: stillAsset ? stillAsset.height > stillAsset.width : false,
    ratio: stillAsset ? stillAsset.width / stillAsset.height : 0.75,
    still: stillSrc,
    tone,
    count: item.videos.length,
    total: item.videos.reduce((sum, video) => sum + video.duration, 0),
  };
});

export default function ExperienceChapterPage() {
  return (
    <div className="chapter-page experience-chapter">
      <section className="film-hero">
        <div className="wrap film-hero__grid">
          <div className="film-hero__copy">
            <div className="chapter-hero__label" data-reveal>
              <span className="mono">第三章 · 影像</span>
              <span className="status status--ready">{allVideos.length} 段影像 / {DECKS.length} 份演示</span>
            </div>

            <h1 className="chapter-hero__title serif" data-reveal>
              <span className="char">成</span><span className="char">境</span>
            </h1>

            <p className="chapter-hero__lead film-hero__lead" data-reveal style={{ "--d": "190ms" } as React.CSSProperties}>
              演奏 · 绘画 · 演示
            </p>

            <div className="film-hero__actions" data-reveal style={{ "--d": "250ms" } as React.CSSProperties}>
              <a href="#b-screenings" className="btn film-hero__enter">
                <Play size={14} /> 进入放映室
              </a>
            </div>

            <dl className="film-hero__meta" data-reveal style={{ "--d": "310ms" } as React.CSSProperties}>
              <div><dt className="mono">影像</dt><dd>{String(allVideos.length).padStart(2, "0")} / {String(allVideos.length).padStart(2, "0")}</dd></div>
              <div><dt className="mono">总时长</dt><dd>{fmt(totalRuntime)}</dd></div>
              <div><dt className="mono">演示</dt><dd>{String(DECKS.length).padStart(2, "0")} 份 / {totalDecks} 页</dd></div>
            </dl>
          </div>

          <div className="film-hero__screen-wrap" data-reveal="mask" style={{ "--d": "180ms" } as React.CSSProperties}>
            <div className="film-hero__screen">
              <span className="film-hero__perf film-hero__perf--top" aria-hidden="true" />
              <a href="#b-screenings" className="film-hero__frame" aria-label="进入数字放映室">
                <img src={heroCover?.src ?? heroPoster.poster} alt="钢琴演奏封面图" />
                <span className="film-hero__shade" aria-hidden="true" />
                <span className="film-hero__play"><Play size={24} /></span>
                <span className="film-hero__overlay mono">
                  <span>梦中的婚礼</span>
                  <span>{fmt(heroPoster.duration)}</span>
                </span>
                <span className="film-hero__scan" aria-hidden="true" />
              </a>
              <span className="film-hero__perf film-hero__perf--bottom" aria-hidden="true" />
            </div>

            <div className="film-hero__reel" aria-hidden="true">
              {reel.map((item, index) => (
                <span
                  key={item.key}
                  className={`film-hero__still film-hero__still--${index + 1}`}
                  data-group={item.key}
                  data-artwork={item.key}
                >
                  <FilmArtwork src={item.src ?? ""} alt="" loading="lazy" />
                </span>
              ))}
            </div>

            <p className="film-hero__caption mono">
              <span>{allVideos.length} 段影像 · 四类节目</span>
              <span>{DECKS.length} 份演示 · {totalDecks} 页</span>
            </p>
          </div>
        </div>
      </section>

      <ChapterNav items={nav} />

      <section className="screenings section" id="b-screenings">
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="eyebrow" data-reveal>二 · 放映</span>
              <h2 className="serif" data-reveal>放映</h2>
            </div>
            <div className="section-count" data-reveal>
              <b className="display">{String(allVideos.length).padStart(2, "0")}</b>
              <span className="mono">段影像</span>
              <i className="mono">四类</i>
            </div>
          </div>
          <div className="screenings__stage" data-reveal>
            <Cinema groups={groups} />
          </div>
        </div>
      </section>

      <section className="programme section" id="c-programme">
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="eyebrow" data-reveal>三 · 节目</span>
              <h2 className="serif" data-reveal>节目</h2>
            </div>
            <div className="section-count" data-reveal>
              <b className="display">{String(groups.length).padStart(2, "0")}</b>
              <span className="mono">类节目</span>
              <i className="mono">{fmt(totalRuntime)}</i>
            </div>
          </div>

          <div data-reveal>
            <ProgrammeRail items={programme} />
          </div>
        </div>
      </section>

      <section className="decks section" id="d-decks">
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="eyebrow" data-reveal>四 · 演示</span>
              <h2 className="serif" data-reveal>演示</h2>
            </div>
            <div className="section-count" data-reveal>
              <b className="display">{String(DECKS.length).padStart(2, "0")}</b>
              <span className="mono">份演示</span>
              <i className="mono">{totalDecks} 页</i>
            </div>
          </div>

          <div data-reveal>
            <DeckViewer decks={DECKS} />
          </div>
        </div>
      </section>

      <section className="experience-end">
        <div className="wrap experience-end__inner">
          <div className="experience-end__copy" data-reveal>
            <span className="mono">第三章结束</span>
            <h2 className="serif">回到原点。</h2>
            <div className="experience-end__actions">
              <TransitionLink href="/" className="btn">回到首页 <ArrowRight size={14} /></TransitionLink>
            </div>
          </div>
          <div className="experience-end__origin" aria-hidden="true" data-reveal="mask">
            <span className="experience-end__dot" />
            <span className="experience-end__ring experience-end__ring--1" />
            <span className="experience-end__ring experience-end__ring--2" />
            <span className="experience-end__ring experience-end__ring--3" />
          </div>
        </div>
      </section>
    </div>
  );
}

