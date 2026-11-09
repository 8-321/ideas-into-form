import { ArrowRight, ArrowUpRight } from "@/components/Icons";
import { Hero } from "@/components/home/Hero";
import { TransitionLink } from "@/components/TransitionLink";
import "./home.css";
import { CHAPTERS, filmVideos, STATS, workBySlug, worksByChapter } from "@/content/works";

const selected = [
  { slug: "panda-ip", cls: "wk-1", note: "IP / 角色一致性" },
  { slug: "fast-wave-game", cls: "wk-2", note: "GAME UI / 视觉系统" },
  { slug: "campus-architecture", cls: "wk-3", note: "CAMPUS / 线稿档案" },
  { slug: "drawing", cls: "wk-4", note: "DRAWING / 原作" },
  { slug: "audio-collection", cls: "wk-5", note: "SOUND / 唱片档案" },
  { slug: "100-days", cls: "wk-6", note: "COVERS / 98 张" },
];

const previews: Record<string, { src: string; alt: string }[]> = {
  image: [
    { src: "/media/image/panda/panda-original@thumb.webp", alt: "小含熊猫" },
    { src: "/media/image/campus/arch-01@thumb.webp", alt: "长理建筑线稿" },
    { src: "/media/image/mbti/enfj-land@thumb.webp", alt: "ENFJ 封面" },
  ],
  sound: [
    { src: "/media/image/soundCovers/cover-main@thumb.webp", alt: "万丈红尘封面" },
    { src: "/media/image/soundCovers/cover-e03@thumb.webp", alt: "体验为王封面" },
    { src: "/media/image/soundCovers/cover-e05@thumb.webp", alt: "红尘手记封面" },
  ],
  experience: [
    { src: "/media/video/piano/piano-wedding-poster.webp", alt: "钢琴演奏" },
    { src: "/media/video/guzheng/guzheng-sea-poster.webp", alt: "古筝演奏" },
    { src: "/media/video/painting/paint-day-poster.webp", alt: "绘画过程" },
  ],
};

const counts: Record<string, string> = {
  image: `${worksByChapter("image").length} 组项目`,
  sound: `${STATS.audio} 条音频`,
  experience: `${filmVideos.piano.length + filmVideos.guzheng.length + filmVideos.painting.length + filmVideos.ppt.length} 段影像`,
};

export default function HomePage() {
  return (
    <>
      <Hero />

      <section className="manifesto" id="manifesto">
        <div className="wrap">
          <div className="manifesto__top mono" data-reveal>
            <span>( 创作理念 / THE IDEA )</span>
            <span>01 — 03</span>
          </div>

          <div className="manifesto__stage">
            <div className="manifesto__circle" aria-hidden="true" data-parallax="0.06">
              <span />
            </div>
            <h2 className="manifesto__title serif" data-reveal>
              <span className="split-line"><span>万物有形，</span></span>
              <span className="split-line manifesto__line2"><span>创意无界。</span></span>
            </h2>
            <div className="manifesto__aside">
              <svg className="manifesto__draw" viewBox="0 0 180 260" aria-hidden="true" data-reveal>
                <circle cx="90" cy="60" r="28" pathLength="1" />
                <path d="M90 88v116" pathLength="1" />
                <path d="M90 204 32 238M90 204l58 34M90 204v34" pathLength="1" />
                <circle cx="90" cy="204" r="3" className="fill" />
              </svg>
              <p className="mono muted">A DOT BECOMES<br />A LINE, THEN A FORM.</p>
            </div>
          </div>

          <div className="manifesto__body">
            <div className="manifesto__kicker mono" data-reveal>
              <span>IDEAS ARE INVISIBLE.</span>
              <span>FORM MAKES THEM REAL.</span>
            </div>
            <div className="manifesto__text">
              <p data-reveal style={{ "--d": "80ms" } as React.CSSProperties}>每一个作品都始于一个想法。</p>
              <p data-reveal style={{ "--d": "160ms" } as React.CSSProperties}>有人将它画出来，有人写下来，有人赋予它声音，也有人让它成为一种体验。</p>
              <p data-reveal style={{ "--d": "240ms" } as React.CSSProperties}><strong>创作，就是让无形拥有形态。</strong></p>
            </div>
            <div className="manifesto__counts mono" data-reveal>
              <div><b data-count>{STATS.images}</b><span>IMAGES / 素材</span></div>
              <div><b data-count>{STATS.videos}</b><span>FILMS / 影像</span></div>
              <div><b data-count>{STATS.audio}</b><span>AUDIO / 声音</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="selected" id="selected">
        <div className="wrap">
          <div className="section-head">
            <div>
              <div className="section-head__index"><b>01</b><span>SELECTED WORKS</span></div>
              <h2>从封面、角色，<br />到屏幕里的世界。</h2>
            </div>
            <div>
              <p className="section-head__note">这里不是一张张孤立的图。每一个项目都保留完整的视觉逻辑：它为什么长成这样，以及它还能继续长成什么。</p>
              <TransitionLink href="/image/" className="link-line" style={{ marginTop: 22 }}>
                查看全部作品 <ArrowRight size={14} />
              </TransitionLink>
            </div>
          </div>

          <div className="selected__grid">
            {selected.map((item, index) => {
              const work = workBySlug(item.slug);
              if (!work) return null;
              return (
                <TransitionLink key={item.slug} href={`/work/${work.slug}/`} className={`work-card ${item.cls}`} ariaLabel={`查看项目：${work.title}`} data-tilt data-cursor-label="VIEW">
                  <div className="work-card__img" data-parallax={index % 2 === 0 ? "0.035" : "0.055"}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={work.cover.thumb || work.cover.src} alt={work.coverAlt} loading={index < 2 ? "eager" : "lazy"} decoding="async" />
                    <span className="work-card__shade" aria-hidden="true" />
                    <span className="work-card__index mono">{String(index + 1).padStart(2, "0")}</span>
                    <span className="work-card__open mono">VIEW PROJECT <ArrowUpRight size={12} /></span>
                  </div>
                  <div className="work-card__meta">
                    <div>
                      <h3>{work.title}</h3>
                      <span className="mono">{item.note}</span>
                    </div>
                    <span className="work-card__cat mono">{work.year}</span>
                  </div>
                </TransitionLink>
              );
            })}
          </div>
        </div>
      </section>

      <section className="chapters" id="chapters">
        <div className="wrap">
          <div className="chapters__top mono" data-reveal>
            <span>三个章节 / THREE CHAPTERS</span>
            <span>IMAGE · SOUND · EXPERIENCE</span>
          </div>
          <div className="chapters__list">
            {CHAPTERS.map((chapter, index) => (
              <TransitionLink key={chapter.id} href={chapter.href} className="chapter-row" ariaLabel={`进入 ${chapter.zh} ${chapter.en}`} style={{ "--i": index } as React.CSSProperties}>
                <span className="chapter-row__no mono">{chapter.no}</span>
                <span className="chapter-row__zh serif">{chapter.zh}</span>
                <span className="chapter-row__en display">{chapter.en}</span>
                <span className="chapter-row__desc">
                  <b>{chapter.title}</b>
                  <em className="mono">{counts[chapter.id]}</em>
                </span>
                <span className="chapter-row__arrow"><ArrowUpRight size={26} /></span>
                <span className="chapter-row__preview" aria-hidden="true">
                  {previews[chapter.id].map((preview, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={preview.src} src={preview.src} alt="" loading="lazy" style={{ "--i": i } as React.CSSProperties} />
                  ))}
                </span>
              </TransitionLink>
            ))}
          </div>
        </div>
      </section>

      <section className="closing">
        <div className="wrap">
          <div className="closing__mark" aria-hidden="true">
            <span className="closing__ring" />
            <span className="closing__dot" />
          </div>
          <p className="closing__text serif" data-reveal>
            一个想法，可以成为图像、文字、声音，<br />也可以成为一次体验。
          </p>
          <TransitionLink href="/image/" className="closing__enter">
            <span className="mono">ENTER THE ARCHIVE / 进入作品档案</span>
            <ArrowRight size={30} />
          </TransitionLink>
        </div>
        <div className="closing__marquee marquee" aria-hidden="true">
          <div className="marquee__track">
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i} className="display">IDEAS INTO FORM. <em>由意成形</em> — </span>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}