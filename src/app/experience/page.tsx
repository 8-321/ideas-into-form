import type { Metadata } from "next";
import "./experience.css";
import { ChapterNav } from "@/components/ChapterNav";
import { Cinema, type CinemaGroup } from "@/components/experience/Cinema";
import { DeckViewer } from "@/components/experience/DeckViewer";
import { FilmArtwork } from "@/components/experience/FilmArtwork";
import { ArrowRight, Play } from "@/components/Icons";
import { TransitionLink } from "@/components/TransitionLink";
import { DECKS, FILM_COVERS, filmVideos, vid } from "@/content/works";

export const metadata: Metadata = {
  title: "成境 · 影像与演示",
  description: "让创意成为可以感受的体验。钢琴、古筝、绘画与演示文稿，11 段真实影像与 4 份演示文稿。",
};

const nav = [
  { id: "b-screenings", no: "一", label: "数字放映室" },
  { id: "c-programme", no: "二", label: "四类节目" },
  { id: "d-decks", no: "三", label: "演示文稿" },
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
    note: "手指落下，声音有了时间。钢琴部分保留完整演奏段落，不做剪辑替身。",
    cover: FILM_COVERS.piano,
    videos: filmVideos.piano,
  },
  {
    key: "guzheng",
    label: "古筝",
    note: "竖屏记录弦与手的关系。两支短片，两种情绪：爱情讯息与沧海一声笑。",
    cover: FILM_COVERS.guzheng,
    videos: filmVideos.guzheng,
  },
  {
    key: "painting",
    label: "画画",
    note: "线条不是结果，是过程。三段竖屏记录把「画」还原成时间里的动作。",
    videos: filmVideos.painting,
  },
  {
    key: "ppt",
    label: "演示",
    note: "信息如何被组织成叙事。演示视频与 4 份演示文稿节选互为证据。",
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

const programme = groups.map((item) => ({
  ...item,
  total: item.videos.reduce((sum, video) => sum + video.duration, 0),
  still: item.cover?.src ?? item.videos[0]?.poster,
}));

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

            <p className="chapter-hero__lead" data-reveal style={{ "--d": "190ms" } as React.CSSProperties}>
              让创意成为可以感受的体验。<br />
              演奏、绘画与演示——把时间本身，做成作品。
            </p>

            <div className="film-hero__actions" data-reveal style={{ "--d": "250ms" } as React.CSSProperties}>
              <a href="#b-screenings" className="btn film-hero__enter">
                <Play size={12} /> 进入放映室
              </a>
            </div>

            <dl className="film-hero__meta" data-reveal style={{ "--d": "310ms" } as React.CSSProperties}>
              <div><dt className="mono">影像</dt><dd>{String(allVideos.length).padStart(2, "0")} / 11</dd></div>
              <div><dt className="mono">总时长</dt><dd>{fmt(totalRuntime)}</dd></div>
              <div><dt className="mono">类型</dt><dd>钢琴 · 古筝 · 绘画 · 演示</dd></div>
            </dl>
          </div>

          <div className="film-hero__screen-wrap" data-reveal="mask" style={{ "--d": "180ms" } as React.CSSProperties}>
            <div className="film-hero__screen">
              <span className="film-hero__perf film-hero__perf--top" aria-hidden="true" />
              <a href="#b-screenings" className="film-hero__frame" aria-label="进入数字放映室">
                <img src={heroCover?.src ?? heroPoster.poster} alt="钢琴演奏封面图" />
                <span className="film-hero__shade" aria-hidden="true" />
                <span className="film-hero__play"><Play size={22} /></span>
                <span className="film-hero__overlay mono">
                  <span>第一段 · 梦中的婚礼</span>
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

            <p className="film-hero__caption mono muted">
              <span>11 段影像 · 四类节目</span>
              <span>钢琴 · 系列封面</span>
            </p>
          </div>
        </div>
      </section>

      <ChapterNav items={nav} />

      <section className="screenings section" id="b-screenings">
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="eyebrow" data-reveal>二 · 数字放映室</span>
              <h2 className="serif" data-reveal>数字放映室</h2>
            </div>
            <p className="section-head__note" data-reveal>
              点击主画面进入全屏播放器；下方胶片可选择任意一段。
              键盘左右方向键切换影像，退出键关闭播放器。
            </p>
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
              <span className="eyebrow" data-reveal>三 · 四类节目</span>
              <h2 className="serif" data-reveal>四类节目，四种时间。</h2>
            </div>
            <p className="section-head__note" data-reveal>
              节目单按类型排列。每一段影像都对应真实文件，时长来自视频元数据。
            </p>
          </div>

          <div className="programme-list">
            {programme.map((item, index) => (
              <article className="programme-row" key={item.key} data-reveal style={{ "--d": `${index * 60}ms` } as React.CSSProperties}>
                <div className="programme-row__no">
                  <span className="mono">节目</span>
                  <b className="display">{String(index + 1).padStart(2, "0")}</b>
                </div>
                <div className="programme-row__title">
                  <span className="mono">{item.videos.length} 段影像</span>
                  <h3 className="serif">{item.label}</h3>
                  <p>{item.note}</p>
                  <a href="#b-screenings" className="link-line">进入放映室 <ArrowRight size={12} /></a>
                </div>
                <div className="programme-row__still" data-group={item.key} data-artwork={item.still}>
                  {item.still ? <FilmArtwork src={item.still} alt={`${item.label}封面`} loading="lazy" /> : null}
                </div>
                <div className="programme-row__runtime">
                  <span className="mono">合计</span>
                  <b className="display">{fmt(item.total)}</b>
                  <ul>
                    {item.videos.map((video) => (
                      <li key={video.key}><span>{video.label}</span><em className="mono">{fmt(video.duration)}</em></li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="decks section" id="d-decks">
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="eyebrow" data-reveal>四 · 演示文稿</span>
              <h2 className="serif" data-reveal>信息，也需要被导演。</h2>
            </div>
            <p className="section-head__note" data-reveal>
              4 份演示文稿，共 {totalDecks} 页节选。可逐页翻阅、自动播放，或下载完整文档。
            </p>
          </div>

          <div data-reveal>
            <DeckViewer decks={DECKS} />
          </div>

          <div className="decks__strip" aria-hidden="true">
            {DECKS.map((deck) => (
              <span key={deck.key}>
                <img src={deck.slides[0].src} alt="" loading="lazy" />
                <em className="mono">{deck.slideCount} 页</em>
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="experience-end">
        <div className="wrap experience-end__inner">
          <div className="experience-end__copy" data-reveal>
            <span className="mono">第三章结束</span>
            <h2 className="serif">看过之后，<br />回到原点。</h2>
            <p>三种形态并不是终点。它们只是同一个想法，在不同媒介里留下的三种证据。</p>
            <div className="experience-end__actions">
              <TransitionLink href="/" className="btn">回到首页 <ArrowRight size={13} /></TransitionLink>
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
