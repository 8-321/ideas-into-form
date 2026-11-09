import type { Metadata } from "next";
import "./experience.css";
import { ChapterNav } from "@/components/ChapterNav";
import { Cinema, type CinemaGroup } from "@/components/experience/Cinema";
import { DeckViewer } from "@/components/experience/DeckViewer";
import { ArrowRight, ArrowUpRight, Play } from "@/components/Icons";
import { TransitionLink } from "@/components/TransitionLink";
import { DECKS, FILM_COVERS, filmVideos, group as imageGroup, vid } from "@/content/works";

export const metadata: Metadata = {
  title: "03 成境 / EXPERIENCE",
  description: "让创意成为可以感受的体验。钢琴、古筝、画画与 PPT，11 段真实影像与 4 份演示文稿。",
};

const nav = [
  { id: "a-statement", no: "A", label: "影像主张" },
  { id: "b-screenings", no: "B", label: "数字放映室" },
  { id: "c-programme", no: "C", label: "四类节目" },
  { id: "d-decks", no: "D", label: "演示文稿" },
  { id: "e-notes", no: "E", label: "素材说明" },
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
    en: "PIANO",
    note: "手指落下，声音有了时间。钢琴部分保留完整演奏段落，不做剪辑替身。",
    cover: FILM_COVERS.piano,
    videos: filmVideos.piano,
  },
  {
    key: "guzheng",
    label: "古筝",
    en: "GUZHENG",
    note: "竖屏记录弦与手的关系。两支短片，两种情绪：爱情讯息与沧海一声笑。",
    cover: FILM_COVERS.guzheng,
    videos: filmVideos.guzheng,
  },
  {
    key: "painting",
    label: "画画",
    en: "PAINTING",
    note: "线条不是结果，是过程。三段竖屏记录把「画」还原成时间里的动作。",
    videos: filmVideos.painting,
  },
  {
    key: "ppt",
    label: "PPT",
    en: "DECK FILM",
    note: "信息如何被组织成叙事。演示视频与 4 份演示文稿节选互为证据。",
    videos: filmVideos.ppt,
  },
];

const allVideos = groups.flatMap((item) => item.videos);
const totalRuntime = allVideos.reduce((sum, video) => sum + video.duration, 0);
const totalDecks = DECKS.reduce((sum, deck) => sum + deck.slideCount, 0);
const heroPoster = vid("piano", "piano-wedding");
const heroCover = FILM_COVERS.piano;
const reel = [vid("piano", "piano-wedding"), vid("piano", "piano-flower"), vid("guzheng", "guzheng-sea"), vid("painting", "paint-day"), vid("ppt", "ppt-growth")];
const campus = imageGroup("campus");

const programme = groups.map((item) => ({
  ...item,
  total: item.videos.reduce((sum, video) => sum + video.duration, 0),
  stills: [
    ...(item.cover
      ? [{ key: `${item.key}-cover`, label: `${item.label}封面`, src: item.cover.src, width: item.cover.width, height: item.cover.height }]
      : []),
    ...item.videos.map((video) => ({ key: video.key, label: video.label, src: video.poster, width: video.width, height: video.height })),
  ].slice(0, 3),
}));

export default function ExperienceChapterPage() {
  return (
    <div className="chapter-page experience-chapter">
      <section className="film-hero">
        <div className="wrap film-hero__grid">
          <div className="film-hero__copy">
            <div className="chapter-hero__label" data-reveal>
              <span className="mono">CHAPTER 03 / EXPERIENCE</span>
              <span className="status status--ready">{allVideos.length} FILMS / {DECKS.length} DECKS</span>
            </div>

            <h1 className="chapter-hero__title serif" data-reveal>
              <span className="char">成</span><span className="char">境</span>
            </h1>

            <p className="chapter-hero__en display" data-reveal style={{ "--d": "120ms" } as React.CSSProperties}>
              BEYOND THE <em>FRAME.</em>
            </p>

            <p className="chapter-hero__lead" data-reveal style={{ "--d": "190ms" } as React.CSSProperties}>
              让创意成为可以感受的体验。<br />
              演奏、绘画与演示——把时间本身，做成作品。
            </p>

            <div className="film-hero__actions" data-reveal style={{ "--d": "250ms" } as React.CSSProperties}>
              <a href="#b-screenings" className="btn film-hero__enter">
                <Play size={12} /> 进入放映室
              </a>
              <TransitionLink href="/work/film-archive/" className="link-line">
                查看影像档案 <ArrowUpRight size={13} />
              </TransitionLink>
            </div>

            <dl className="film-hero__meta" data-reveal style={{ "--d": "310ms" } as React.CSSProperties}>
              <div><dt className="mono">FILMS</dt><dd>{String(allVideos.length).padStart(2, "0")} / 11</dd></div>
              <div><dt className="mono">RUNTIME</dt><dd>{fmt(totalRuntime)}</dd></div>
              <div><dt className="mono">CATEGORIES</dt><dd>PIANO · GUZHENG · PAINTING · PPT</dd></div>
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
                  <span>REEL 01 / 梦中的婚礼</span>
                  <span>{fmt(heroPoster.duration)}</span>
                </span>
                <span className="film-hero__scan" aria-hidden="true" />
              </a>
              <span className="film-hero__perf film-hero__perf--bottom" aria-hidden="true" />
            </div>

            <div className="film-hero__reel" aria-hidden="true">
              {reel.map((video, index) => (
                <span key={video.key} className={`film-hero__still film-hero__still--${index + 1}`}>
                  <img src={index === 0 ? (heroCover?.thumb ?? video.poster) : video.poster} alt="" loading="lazy" />
                </span>
              ))}
            </div>

            <p className="film-hero__caption mono muted">
              <span>FRAME 001 / COVER / PIANO</span>
              <span>SCROLL TO SCREEN</span>
            </p>
          </div>
        </div>
      </section>

      <ChapterNav items={nav} />

      <section className="film-statement section" id="a-statement">
        <div className="wrap film-statement__grid">
          <div className="film-statement__title">
            <span className="eyebrow" data-reveal>A.01 / POSITION</span>
            <h2 className="serif" data-reveal>
              <span className="split-line"><span>每一段影像，</span></span>
              <span className="split-line"><span>都是一次表达。</span></span>
            </h2>
            <div className="film-statement__marks" aria-hidden="true">
              <span /><span /><span /><span /><span />
            </div>
          </div>

          <div className="film-statement__body">
            <p data-reveal>
              成境收录 11 段真实影像：5 段钢琴、2 段古筝、3 段画画、1 段 PPT 演示视频。
              总时长 {fmt(totalRuntime)}，全部保留原声与原始画幅。
            </p>
            <p data-reveal style={{ "--d": "90ms" } as React.CSSProperties}>
              排列不按时间顺序，而按「观看方式」：演奏看手与弦，画画看线条生长，
              PPT 看信息如何被组织成叙事。三种时间感，共用一间放映室。
            </p>
            <p data-reveal style={{ "--d": "160ms" } as React.CSSProperties}>
              另有 4 份演示文稿，共 {totalDecks} 页节选。它们不是视频的附属品，
              而是另一种把想法组织成结构的方式。
            </p>

            <div className="film-statement__stats stagger">
              <div style={{ "--i": 0 } as React.CSSProperties}><b className="display" data-count>{allVideos.length}</b><span className="mono">FILMS / 影像</span></div>
              <div style={{ "--i": 1 } as React.CSSProperties}><b className="display">{fmt(totalRuntime)}</b><span className="mono">RUNTIME / 总时长</span></div>
              <div style={{ "--i": 2 } as React.CSSProperties}><b className="display" data-count>{groups.length}</b><span className="mono">CATEGORIES / 类型</span></div>
              <div style={{ "--i": 3 } as React.CSSProperties}><b className="display" data-count>{DECKS.length}</b><span className="mono">DECKS / 演示</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="screenings section" id="b-screenings">
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="eyebrow" data-reveal>B / SCREENING ROOM</span>
              <h2 className="serif" data-reveal>数字放映室</h2>
            </div>
            <p className="section-head__note" data-reveal>
              点击主画面进入全屏播放器；下方胶片可选择任意一段。
              键盘 ← → 切换影像，ESC 退出。
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
              <span className="eyebrow" data-reveal>C / PROGRAMME</span>
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
                  <span className="mono">PROGRAMME</span>
                  <b className="display">{String(index + 1).padStart(2, "0")}</b>
                </div>
                <div className="programme-row__title">
                  <span className="mono">{item.en} / {item.videos.length} FILMS</span>
                  <h3 className="serif">{item.label}</h3>
                  <p>{item.note}</p>
                  <a href="#b-screenings" className="link-line">进入放映室 <ArrowRight size={12} /></a>
                </div>
                <div className="programme-row__stills">
                  {item.stills.map((still) => (
                    <span key={still.key} className={still.height > still.width ? "is-tall" : ""}>
                      <img src={still.src} alt={`${still.label} 画面`} loading="lazy" />
                    </span>
                  ))}
                </div>
                <div className="programme-row__runtime">
                  <span className="mono">TOTAL</span>
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
              <span className="eyebrow" data-reveal>D / PRESENTATION</span>
              <h2 className="serif" data-reveal>信息，也需要被导演。</h2>
            </div>
            <p className="section-head__note" data-reveal>
              4 份演示文稿，共 {totalDecks} 页节选。可逐页翻阅、自动播放，或下载完整 PDF。
            </p>
          </div>

          <div data-reveal>
            <DeckViewer decks={DECKS} />
          </div>

          <div className="decks__strip" aria-hidden="true">
            {DECKS.map((deck) => (
              <span key={deck.key}>
                <img src={deck.slides[0].src} alt="" loading="lazy" />
                <em className="mono">{deck.format} / {deck.slideCount} P</em>
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="film-notes section" id="e-notes">
        <div className="wrap">
          <div className="film-notes__grid">
            <div className="film-notes__head">
              <span className="eyebrow" data-reveal>E / MATERIAL NOTE</span>
              <h2 className="serif" data-reveal>所有画面，<br />都来自真实文件。</h2>
            </div>

            <div className="film-notes__list stagger">
              <article style={{ "--i": 0 } as React.CSSProperties}>
                <span className="mono">01 / VIDEO</span>
                <h3 className="serif">原始视频转码，不生成。</h3>
                <p>11 段视频均来自原始素材，统一转码为 720p MP4 并保留原声；钢琴、古筝使用专门制作的封面图，其余封面由视频关键帧抽取。</p>
              </article>
              <article style={{ "--i": 1 } as React.CSSProperties}>
                <span className="mono">02 / DECK</span>
                <h3 className="serif">演示文稿逐页导出。</h3>
                <p>4 份演示文稿共 {totalDecks} 页，由原始 PPTX / PDF 导出为图片；页面不补写演讲者备注或虚构数据。</p>
              </article>
              <article style={{ "--i": 2 } as React.CSSProperties}>
                <span className="mono">03 / HONESTY</span>
                <h3 className="serif">没有网络视频冒充。</h3>
                <p>页面不使用图库视频或生成式影像替代作品。缺失素材会以「待上传作品素材」占位，而不是补一张看起来相似的作品。</p>
              </article>
            </div>
          </div>

          <div className="film-notes__aside" data-reveal>
            <div className="film-notes__still">
              <img src={campus[0]?.thumb ?? heroPoster.poster} alt="长理建筑线稿" loading="lazy" />
            </div>
            <p className="mono">
              <span>STILL / 视觉档案</span>
              <span>成象 · 校园与空间 / 线稿</span>
            </p>
          </div>
        </div>
      </section>

      <section className="experience-end">
        <div className="wrap experience-end__inner">
          <div className="experience-end__copy" data-reveal>
            <span className="mono">END OF CHAPTER / 03</span>
            <h2 className="serif">看过之后，<br />回到原点。</h2>
            <p>三种形态并不是终点。它们只是同一个想法，在不同媒介里留下的三种证据。</p>
            <div className="experience-end__actions">
              <TransitionLink href="/" className="btn">回到首页 <ArrowRight size={13} /></TransitionLink>
              <TransitionLink href="/work/film-archive/" className="link-line">展开影像档案 <ArrowUpRight size={13} /></TransitionLink>
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