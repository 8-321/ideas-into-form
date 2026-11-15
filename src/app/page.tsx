import { ArrowRight } from "@/components/Icons";
import { Hero } from "@/components/home/Hero";
import { TransitionLink } from "@/components/TransitionLink";
import { CHAPTERS, filmVideos, STATS, workBySlug, worksByChapter } from "@/content/works";
import "./home.css";

const selected = [
  { slug: "panda-ip", note: "角色设计", title: "小含熊猫" },
  { slug: "fast-wave-game", note: "游戏界面", title: "快放声波" },
  { slug: "campus-architecture", note: "建筑线稿", title: "长理建筑线稿" },
  { slug: "drawing", note: "绘画作品", title: "绘画作品" },
  { slug: "audio-collection", note: "声音档案", title: "音频与封面设计" },
  { slug: "100-days", note: "封面系列", title: "100 天实验" },
];

const previews: Record<string, { src: string; alt: string }> = {
  image: { src: "/media/image/panda/panda-original@thumb.webp", alt: "小含熊猫角色" },
  sound: { src: "/media/image/soundCovers/cover-main@thumb.webp", alt: "万丈红尘声音封面" },
  experience: { src: "/media/video/guzheng/guzheng-sea-poster.webp", alt: "古筝演奏画面" },
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

      <section className="home-intro" id="manifesto">
        <div className="wrap home-intro__grid">
          <h2 className="home-intro__title" data-reveal>
            万物有形，<br />创意无界。
          </h2>
          <div className="home-intro__copy">
            <p data-reveal style={{ "--d": "90ms" } as React.CSSProperties}>
              每一个作品都始于一个想法。有人将它画出来，有人写下来，有人赋予它声音，也有人让它成为一种体验。
            </p>
            <p data-reveal style={{ "--d": "170ms" } as React.CSSProperties}>
              创作，就是让无形拥有形态。
            </p>
            <dl className="home-intro__stats" data-reveal style={{ "--d": "240ms" } as React.CSSProperties}>
              <div><dt>图像</dt><dd><b data-count>{STATS.images}</b><span>件</span></dd></div>
              <div><dt>影像</dt><dd><b data-count>{STATS.videos}</b><span>段</span></dd></div>
              <div><dt>声音</dt><dd><b data-count>{STATS.audio}</b><span>条</span></dd></div>
            </dl>
          </div>
        </div>
      </section>

      <section className="home-works" id="selected">
        <div className="wrap">
          <header className="home-section-head">
            <div>
              <span className="home-section-head__no">01</span>
              <h2>精选作品</h2>
            </div>
            <TransitionLink href="/image/" className="home-section-head__link">
              查看全部作品 <ArrowRight size={14} />
            </TransitionLink>
          </header>

          <div className="home-works__grid">
            {selected.map((item, index) => {
              const work = workBySlug(item.slug);
              if (!work) return null;
              return (
                <TransitionLink
                  key={item.slug}
                  href={`/work/${work.slug}/`}
                  className="home-work"
                  ariaLabel={`查看项目：${work.title}`}
                  data-cursor-label="查看"
                  data-reveal
                  style={{ "--d": `${(index % 3) * 70}ms` } as React.CSSProperties}
                >
                  <figure className="home-work__frame">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={work.cover.thumb || work.cover.src}
                      alt={work.coverAlt}
                      loading="eager"
                      decoding="async"
                    />
                  </figure>
                  <div className="home-work__meta">
                    <h3>{item.title}</h3>
                    <span>{item.note}</span>
                  </div>
                </TransitionLink>
              );
            })}
          </div>
        </div>
      </section>

      <section className="home-chapters" id="chapters">
        <div className="wrap">
          <header className="home-section-head">
            <div>
              <span className="home-section-head__no">02</span>
              <h2>三个章节</h2>
            </div>
          </header>

          <div className="home-chapters__grid">
            {CHAPTERS.map((chapter, index) => (
              <TransitionLink
                key={chapter.id}
                href={chapter.href}
                className="home-chapter"
                ariaLabel={`进入${chapter.zh}`}
                data-cursor-label="进入"
                data-reveal
                style={{ "--d": `${index * 80}ms` } as React.CSSProperties}
              >
                <figure className="home-chapter__frame">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previews[chapter.id].src} alt={previews[chapter.id].alt} loading="eager" decoding="async" />
                </figure>
                <div className="home-chapter__meta">
                  <span className="home-chapter__no">{chapter.no}</span>
                  <div>
                    <h3>{chapter.zh}</h3>
                    <p>{chapter.title}</p>
                    <em>{counts[chapter.id]}</em>
                  </div>
                  <ArrowRight size={18} />
                </div>
              </TransitionLink>
            ))}
          </div>
        </div>
      </section>

      <section className="home-close">
        <div className="wrap home-close__inner">
          <p className="home-close__text" data-reveal>
            一个想法，可以成为图像、文字、声音，<br />也可以成为一次体验。
          </p>
          <TransitionLink href="/image/" className="home-close__link" data-magnet data-cursor-label="进入">
            进入作品档案 <ArrowRight size={22} />
          </TransitionLink>
        </div>
      </section>
    </>
  );
}