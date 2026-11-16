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

      <section className="home-works" id="selected">
        <div className="wrap">
          <header className="home-section-head">
            <div>
              <span className="home-section-head__no">01</span>
              <h2>精选作品</h2>
            </div>
            <TransitionLink href="/image/" className="home-section-head__link">
              浏览成象 <ArrowRight size={14} />
            </TransitionLink>
          </header>

          <div className="home-works__grid">
            {selected.map((item, index) => {
              const work = workBySlug(item.slug);
              if (!work) return null;
              const total = work.sections.reduce((sum, section) => {
                if (section.type === "gallery" || section.type === "placeholder") return sum + section.items.length;
                if (section.type === "audio") return sum + STATS.audio;
                return sum;
              }, 0);
              return (
                <TransitionLink
                  key={item.slug}
                  href={`/work/${work.slug}/`}
                  className="home-work"
                  ariaLabel={`查看项目：${work.title}`}
                  data-cursor-label="查看"
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
                    <em className="home-work__count">{String(total).padStart(2, "0")} 件</em>
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

    </>
  );
}