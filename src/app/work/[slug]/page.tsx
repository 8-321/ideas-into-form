import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "../../work.css";
import "../../sound/sound.css";
import "../../experience/experience.css";
import { Cinema, type CinemaGroup } from "@/components/experience/Cinema";
import { DeckViewer } from "@/components/experience/DeckViewer";
import { ArrowRight, ArrowUpRight, Play } from "@/components/Icons";
import { MediaImage } from "@/components/MediaImage";
import { Rail } from "@/components/Rail";
import { SoundArchive } from "@/components/sound/SoundArchive";
import { TransitionLink } from "@/components/TransitionLink";
import {
  AUDIO,
  CHAPTERS,
  DECKS,
  FILM_COVERS,
  filmVideos,
  workBySlug,
  worksByChapter,
  WORKS,
  type GallerySection,
  type Work,
} from "@/content/works";

export const dynamicParams = false;

export function generateStaticParams() {
  return WORKS.map((work) => ({ slug: work.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const work = workBySlug(slug);
  if (!work) return { title: "作品未找到" };
  return {
    title: `${work.no} ${work.title} / ${work.titleEn}`,
    description: work.summary,
    openGraph: { title: `${work.title} · 由意成形`, description: work.summary, images: [work.cover.src] },
  };
}

const filmGroups: CinemaGroup[] = [
  { key: "piano", label: "钢琴", en: "PIANO", note: "手指落下，声音有了时间。演奏段落保留原声与完整画幅。", cover: FILM_COVERS.piano, videos: filmVideos.piano },
  { key: "guzheng", label: "古筝", en: "GUZHENG", note: "竖屏记录弦与手的关系，两支短片两种情绪。", cover: FILM_COVERS.guzheng, videos: filmVideos.guzheng },
  { key: "painting", label: "画画", en: "PAINTING", note: "线条不是结果，是过程。三段竖屏记录把「画」还原成时间里的动作。", videos: filmVideos.painting },
  { key: "ppt", label: "PPT", en: "DECK FILM", note: "信息如何被组织成叙事。演示视频与演示文稿节选互为证据。", videos: filmVideos.ppt },
];

function GalleryBlock({ section }: { section: GallerySection }) {
  const gallery = section.items.map((item) => ({
    src: item.src,
    alt: item.caption || item.label,
    caption: item.caption || item.label,
  }));
  const layout = section.layout ?? "grid";

  return (
    <section className="work-section work-gallery-block">
      <div className="wrap">
        <div className="work-section__head">
          <span className="eyebrow">{section.eyebrow}</span>
          <h2 className="serif">{section.title}</h2>
          {section.note ? <p className="work-section__note mono">{section.note}</p> : null}
        </div>

        {layout === "strip" ? (
          <Rail className="work-gallery work-gallery--strip" label={section.title}>
            {section.items.map((item, index) => (
              <figure className="work-strip__item" key={item.key}>
                <MediaImage asset={item} alt={item.caption || item.label} caption={item.caption} gallery={gallery} index={index} />
                <figcaption className="mono">{String(index + 1).padStart(2, "0")} / {item.caption || item.label}</figcaption>
              </figure>
            ))}
          </Rail>
        ) : (
          <div className={`work-gallery work-gallery--${layout}`}>
            {section.items.map((item, index) => (
              <div className={`work-gallery__item work-gallery__item--${index + 1}`} key={item.key}>
                <MediaImage
                  asset={item}
                  alt={item.caption || item.label}
                  caption={item.caption}
                  badge={`${String(index + 1).padStart(2, "0")} / ${String(section.items.length).padStart(2, "0")}`}
                  gallery={gallery}
                  index={index}
                  priority={index === 0}
                />
                {item.caption ? <p className="work-gallery__cap mono">{item.caption}</p> : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function WorkBody({ work }: { work: Work }) {
  return (
    <>
      {work.sections.map((section, index) => {
        if (section.type === "text") {
          return (
            <section className="work-section work-text" key={`text-${index}`}>
              <div className="wrap work-text__grid">
                <div className="work-text__side">
                  <span className="eyebrow">{section.eyebrow}</span>
                  <span className="mono work-text__index">{String(index + 1).padStart(2, "0")}</span>
                </div>
                <div className="work-text__body">
                  <h2 className="serif">{section.title}</h2>
                  {section.paragraphs.map((paragraph, pIndex) => (
                    <p key={pIndex}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </section>
          );
        }

        if (section.type === "steps") {
          return (
            <section className="work-section work-steps" key={`steps-${index}`}>
              <div className="wrap">
                <div className="work-section__head">
                  <span className="eyebrow">{section.eyebrow}</span>
                  <h2 className="serif">{section.title}</h2>
                </div>
                <ol className="work-steps__list">
                  {section.items.map((item) => (
                    <li key={item.no}>
                      <span className="mono work-steps__no">{item.no}</span>
                      <div>
                        <h3 className="serif">{item.title}</h3>
                        <p>{item.body}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </section>
          );
        }

        if (section.type === "gallery") return <GalleryBlock section={section} key={`gallery-${index}`} />;

        if (section.type === "note") {
          return (
            <section className="work-section work-note" key={`note-${index}`}>
              <div className="wrap work-note__inner">
                <span className="mono">NOTE / 素材说明</span>
                <div>
                  <h3 className="serif">{section.title}</h3>
                  <p>{section.body}</p>
                </div>
              </div>
            </section>
          );
        }

        if (section.type === "placeholder") {
          return (
            <section className="work-section work-placeholder" key={`placeholder-${index}`}>
              <div className="wrap">
                <div className="work-section__head">
                  <span className="eyebrow">PENDING MATERIAL / 占位</span>
                  <h2 className="serif">{section.title}</h2>
                  <p className="work-section__note">{section.body}</p>
                </div>
                <div className="work-placeholder__grid">
                  {section.items.map((item, itemIndex) => (
                    <div className="work-placeholder__slot" key={item}>
                      <span className="mono">SLOT {String(itemIndex + 1).padStart(2, "0")}</span>
                      <b className="serif">{item}</b>
                      <em className="mono">待上传作品素材</em>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        }

        if (section.type === "audio") {
          return (
            <section className="work-section work-audio" key={`audio-${index}`}>
              <div className="wrap">
                <div className="work-section__head">
                  <span className="eyebrow">{section.eyebrow}</span>
                  <h2 className="serif">{section.title}</h2>
                  {section.note ? <p className="work-section__note">{section.note}</p> : null}
                </div>
                <SoundArchive tracks={AUDIO} />
              </div>
            </section>
          );
        }

        if (section.type === "film") {
          return (
            <section className="work-section work-film" key={`film-${index}`}>
              <div className="wrap">
                <div className="work-section__head">
                  <span className="eyebrow">{section.eyebrow}</span>
                  <h2 className="serif">{section.title}</h2>
                  {section.note ? <p className="work-section__note">{section.note}</p> : null}
                </div>
                <Cinema groups={filmGroups} />
                <div className="work-film__decks">
                  <div className="work-film__decks-head">
                    <span className="mono">DECK SELECTION / 演示文稿节选</span>
                    <TransitionLink href="/experience/#d-decks" className="link-line">在成境中查看 <ArrowRight size={12} /></TransitionLink>
                  </div>
                  <DeckViewer decks={DECKS} />
                </div>
              </div>
            </section>
          );
        }

        return null;
      })}
    </>
  );
}

export default async function WorkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const work = workBySlug(slug);
  if (!work) notFound();

  const chapter = CHAPTERS.find((item) => item.id === work.chapter);
  const siblings = worksByChapter(work.chapter);
  const index = siblings.findIndex((item) => item.slug === work.slug);
  const prev = index > 0 ? siblings[index - 1] : siblings[siblings.length - 1];
  const next = index < siblings.length - 1 ? siblings[index + 1] : siblings[0];

  return (
    <article className={`chapter-page work-page work-page--${work.chapter}`}>
      <header className="work-hero">
        <div className="wrap">
          <div className="work-hero__top" data-reveal>
            <TransitionLink href={`/${work.chapter}/`} className="mono work-hero__back">
              ← 返回{chapter?.zh} / {chapter?.en}
            </TransitionLink>
            <span className="mono work-hero__no">PROJECT {work.no} / {String(siblings.length).padStart(2, "0")}</span>
          </div>

          <div className="work-hero__grid">
            <div className="work-hero__title">
              <span className="eyebrow" data-reveal>{work.category} / {work.year}</span>
              <h1 className="serif" data-reveal>{work.title}</h1>
              <p className="work-hero__en display" data-reveal style={{ "--d": "110ms" } as React.CSSProperties}>
                {work.titleEn}
              </p>
            </div>

            <div className="work-hero__intro">
              <p className="serif" data-reveal style={{ "--d": "150ms" } as React.CSSProperties}>{work.summary}</p>
              <ul className="work-hero__tags stagger">
                {work.tags.map((tag, tagIndex) => (
                  <li key={tag} style={{ "--i": tagIndex } as React.CSSProperties} className="mono">{tag}</li>
                ))}
              </ul>
              <dl className="work-hero__meta" data-reveal style={{ "--d": "240ms" } as React.CSSProperties}>
                <div><dt className="mono">CHAPTER</dt><dd>{chapter?.no} {chapter?.zh}</dd></div>
                <div><dt className="mono">YEAR</dt><dd>{work.year}</dd></div>
                <div><dt className="mono">SECTIONS</dt><dd>{String(work.sections.length).padStart(2, "0")}</dd></div>
              </dl>
            </div>
          </div>
        </div>
      </header>

      <section className="work-cover">
        <div className="wrap">
          <figure className="work-cover__frame" data-reveal="mask">
            <img src={work.cover.src} alt={work.coverAlt} />
            <span className="work-cover__badge mono">PROJECT COVER / {work.no}</span>
          </figure>
          <div className="work-cover__bar mono">
            <span>{work.coverAlt}</span>
            <span>{work.cover.width} × {work.cover.height} / ORIGINAL</span>
          </div>
        </div>
      </section>

      <WorkBody work={work} />

      <section className="work-end">
        <div className="wrap">
          <div className="work-end__top">
            <span className="mono">END OF PROJECT / {work.no}</span>
            <TransitionLink href={`/${work.chapter}/`} className="link-line">回到{chapter?.zh}章节 <ArrowUpRight size={12} /></TransitionLink>
          </div>

          <div className="work-end__nav">
            <TransitionLink href={`/work/${prev.slug}/`} className="work-end__card">
              <span className="mono">PREVIOUS / 上一个</span>
              <b className="serif">{prev.title}</b>
              <em className="mono">{prev.titleEn}</em>
            </TransitionLink>
            <TransitionLink href={`/work/${next.slug}/`} className="work-end__card work-end__card--next">
              <span className="mono">NEXT / 下一个</span>
              <b className="serif">{next.title}</b>
              <em className="mono">{next.titleEn}</em>
            </TransitionLink>
          </div>

          <TransitionLink href={`/${work.chapter === "experience" ? "" : work.chapter + "/"}`} className="work-end__return">
            <span className="mono">RETURN TO</span>
            <span className="serif">{work.chapter === "experience" ? "首页 / HOME" : `${chapter?.zh} / ${chapter?.en}`}</span>
            <ArrowRight size={18} />
          </TransitionLink>
        </div>
      </section>
    </article>
  );
}