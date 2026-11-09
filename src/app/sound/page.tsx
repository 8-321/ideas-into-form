import type { Metadata } from "next";
import "./sound.css";
import { ChapterNav } from "@/components/ChapterNav";
import { ArrowRight, ArrowUpRight, Play } from "@/components/Icons";
import { MediaImage } from "@/components/MediaImage";
import { SoundArchive } from "@/components/sound/SoundArchive";
import { TransitionLink } from "@/components/TransitionLink";
import { AUDIO, group, worksByChapter } from "@/content/works";

export const metadata: Metadata = {
  title: "02 成声 / SOUND",
  description: "让思想拥有自己的声音。一条长音频、四段红尘手记与五张同系列封面，真实音频与真实频谱。",
};

const nav = [
  { id: "a-statement", no: "A", label: "声音立场" },
  { id: "b-archive", no: "B", label: "唱片档案" },
  { id: "c-player", no: "C", label: "完整播放" },
  { id: "d-covers", no: "D", label: "封面系统" },
  { id: "e-notes", no: "E", label: "素材说明" },
];

const covers = group("soundCovers");
const tracks = AUDIO;
const total = tracks.reduce((sum, track) => sum + track.duration, 0);
const mm = Math.floor(total / 60);
const ss = Math.round(total % 60);
const totalLabel = `${mm}:${String(ss).padStart(2, "0")}`;
const soundWorks = worksByChapter("sound");

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

const wave = Array.from({ length: 58 }, (_, index) => {
  const a = Math.abs(Math.sin(index * 0.51) * 0.62 + Math.sin(index * 0.17 + 1.2) * 0.38);
  return Math.max(9, Math.round(a * 100));
});

export default function SoundChapterPage() {
  return (
    <div className="chapter-page sound-chapter">
      <section className="sound-hero">
        <div className="wrap sound-hero__grid">
          <div className="sound-hero__copy">
            <div className="chapter-hero__label" data-reveal>
              <span className="mono">CHAPTER 02 / SOUND</span>
              <span className="status status--ready">{tracks.length} TRACKS / {totalLabel}</span>
            </div>

            <h1 className="chapter-hero__title serif" data-reveal>
              <span className="char">成</span><span className="char">声</span>
            </h1>

            <p className="chapter-hero__en display" data-reveal style={{ "--d": "120ms" } as React.CSSProperties}>
              THE VOICE OF <em>IDEAS.</em>
            </p>

            <p className="chapter-hero__lead" data-reveal style={{ "--d": "190ms" } as React.CSSProperties}>
              让思想拥有自己的声音。<br />
              一条 7 分 42 秒的长音频、四段手记，<br className="desk" />以及五张共享同一扇窗的封面。
            </p>

            <div className="sound-hero__actions" data-reveal style={{ "--d": "260ms" } as React.CSSProperties}>
              <a href="#c-player" className="btn sound-hero__listen">
                <Play size={12} /> 进入完整播放
              </a>
              <TransitionLink href="/work/audio-collection/" className="link-line">
                查看声音档案 <ArrowUpRight size={13} />
              </TransitionLink>
            </div>

            <dl className="sound-hero__meta" data-reveal style={{ "--d": "320ms" } as React.CSSProperties}>
              <div><dt className="mono">FORMAT</dt><dd>LONG FORM + NOTES</dd></div>
              <div><dt className="mono">SOURCE</dt><dd>ORIGINAL AUDIO</dd></div>
              <div><dt className="mono">COVERS</dt><dd>05 / 1:1</dd></div>
            </dl>
          </div>

          <div className="sound-hero__aside" data-reveal="mask" style={{ "--d": "200ms" } as React.CSSProperties}>
            <div className="sound-hero__disc-wrap">
              <div className="sound-hero__orbit sound-hero__orbit--a" aria-hidden="true"><i /></div>
              <div className="sound-hero__orbit sound-hero__orbit--b" aria-hidden="true"><i /></div>
              <div className="sound-hero__disc" aria-hidden="true">
                <img src={covers[0].src} alt="" />
                <span className="sound-hero__hole" />
              </div>
              <span className="sound-hero__stamp mono">SIDE A<br />33 ⅓ RPM</span>
              <span className="sound-hero__serial mono">IIF–SND–001<br />RED DUST / 2026</span>
            </div>
            <p className="sound-hero__caption mono muted">
              <span>01 / 万丈红尘，体验为王</span>
              <span>07:42</span>
            </p>
          </div>
        </div>

        <div className="sound-hero__wave" aria-hidden="true">
          {wave.map((height, index) => (
            <span key={index} style={{ "--h": `${height}%`, "--i": `${index}` } as React.CSSProperties} />
          ))}
        </div>
      </section>

      <ChapterNav items={nav} />

      <section className="sound-statement section" id="a-statement">
        <div className="wrap sound-statement__grid">
          <div className="sound-statement__title">
            <span className="eyebrow" data-reveal>A.01 / POSITION</span>
            <h2 className="serif" data-reveal>
              <span className="split-line"><span>声音，是思想的</span></span>
              <span className="split-line"><span>另一种形态。</span></span>
            </h2>
            <div className="sound-statement__rings" aria-hidden="true">
              <span /><span /><span />
            </div>
          </div>

          <div className="sound-statement__body">
            <p data-reveal>
              《万丈红尘，体验为王》是一组围绕「经历」与「成长」的音频内容。主音频 7 分 42 秒，
              四段手记分别讨论复盘、筛选、普通与结果。
            </p>
            <p data-reveal style={{ "--d": "90ms" } as React.CSSProperties}>
              封面与声音共享同一个夜晚：窗、台灯、耳机、纸页和城市的光。
              五张 1:1 封面不是配图，而是同一套语气在不同光线下的五次显影。
            </p>
            <p data-reveal style={{ "--d": "160ms" } as React.CSSProperties}>
              这里没有模拟播放器。按下播放，听到的是原始音频文件；
              频谱来自当前声音本身，暂停时它就安静下来。
            </p>

            <div className="sound-statement__stats stagger">
              <div style={{ "--i": 0 } as React.CSSProperties}><b className="display" data-count>{tracks.length}</b><span className="mono">TRACKS / 音轨</span></div>
              <div style={{ "--i": 1 } as React.CSSProperties}><b className="display">{totalLabel}</b><span className="mono">TOTAL / 总时长</span></div>
              <div style={{ "--i": 2 } as React.CSSProperties}><b className="display" data-count>01</b><span className="mono">LONG FORM / 长音频</span></div>
              <div style={{ "--i": 3 } as React.CSSProperties}><b className="display" data-count>04</b><span className="mono">NOTES / 手记</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="sound-archive section" id="b-archive">
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="eyebrow" data-reveal>B / DIGITAL RECORD</span>
              <h2 className="serif" data-reveal>数字唱片档案</h2>
            </div>
            <p className="section-head__note" data-reveal>
              两张 ISSUE，五条音轨。封面保持原始比例，播放器读取真实文件；
              以下所有时长均来自音频元数据。
            </p>
          </div>
        </div>

        <div className="wrap sound-archive__stage" id="c-player">
          <SoundArchive tracks={tracks} />
        </div>
      </section>

      <section className="sound-covers section" id="d-covers">
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="eyebrow" data-reveal>D / COVER SYSTEM</span>
              <h2 className="serif" data-reveal>五张封面，同一扇窗。</h2>
            </div>
            <p className="section-head__note" data-reveal>
              1:1 方形封面，标题压在留白上。点击任意一张可进入灯箱，按 ← → 连续翻阅。
            </p>
          </div>

          <div className="cover-wall">
            {covers.map((cover, index) => (
              <figure className={`cover-card cover-card--${index + 1}`} key={cover.key} data-reveal style={{ "--d": `${index * 70}ms` } as React.CSSProperties}>
                <MediaImage
                  asset={cover}
                  alt={coverCaptions[index]}
                  caption={`${String(index + 1).padStart(2, "0")} / ${coverCaptions[index]} · 1:1`}
                  gallery={coverGallery}
                  index={index}
                />
                <figcaption>
                  <span className="mono">{String(index + 1).padStart(2, "0")}</span>
                  <span className="serif">{coverCaptions[index].split(" / ")[0]}</span>
                  <span className="mono muted">{index === 0 ? "LONG FORM" : "NOTE"}</span>
                </figcaption>
              </figure>
            ))}
          </div>

          <p className="cover-wall__note mono" data-reveal>
            <span>COVER RATIO 1:1</span>
            <span>SOURCE: ORIGINAL JPG / 1100–1194 PX</span>
            <span>NO CROP / NO FILTER</span>
          </p>
        </div>
      </section>

      <section className="sound-notes section" id="e-notes">
        <div className="wrap">
          <div className="sound-notes__grid">
            <div className="sound-notes__head">
              <span className="eyebrow" data-reveal>E / MATERIAL NOTE</span>
              <h2 className="serif" data-reveal>真实，是这组作品的<br />最低要求。</h2>
            </div>

            <div className="sound-notes__list stagger">
              <article style={{ "--i": 0 } as React.CSSProperties}>
                <span className="mono">01 / AUDIO</span>
                <h3 className="serif">原始音频，不模拟。</h3>
                <p>5 条 m4a 原文件，总时长 {totalLabel}。播放器使用 HTMLAudioElement，不生成、不替换、不循环伪造时长。</p>
              </article>
              <article style={{ "--i": 1 } as React.CSSProperties}>
                <span className="mono">02 / SPECTRUM</span>
                <h3 className="serif">频谱来自声音本身。</h3>
                <p>Web Audio AnalyserNode 读取当前音轨的频域数据，驱动 56 根对称柱。暂停时归为静止的低电平。</p>
              </article>
              <article style={{ "--i": 2 } as React.CSSProperties}>
                <span className="mono">03 / COVERS</span>
                <h3 className="serif">封面保持原样。</h3>
                <p>五张封面按原始比例展示，不裁切、不加滤镜。它们与音频同属一组内容，不做跨项目混用。</p>
              </article>
            </div>
          </div>

          <div className="sound-quote" data-reveal>
            <span className="mono">ON LISTENING</span>
            <p className="serif">「先听见，再理解。<br />声音比观点更早抵达。」</p>
            <TransitionLink href="/work/audio-collection/" className="link-line">
              展开这组声音档案 <ArrowRight size={13} />
            </TransitionLink>
          </div>
        </div>
      </section>

      <div className="wrap">
        <div className="chapter-foot">
          <TransitionLink href="/experience/" className="chapter-foot__next">
            <div>
              <span className="mono muted">NEXT CHAPTER / 03 · {soundWorks.length} PROJECT</span>
              <h2 className="serif">成境 <em className="display">EXPERIENCE</em></h2>
            </div>
            <span className="arrow">→</span>
          </TransitionLink>
        </div>
      </div>
    </div>
  );
}