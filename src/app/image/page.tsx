import type { Metadata } from "next";
import "./image.css";
import { ChapterNav } from "@/components/ChapterNav";
import { ArrowRight, ArrowUpRight } from "@/components/Icons";
import { MediaImage } from "@/components/MediaImage";
import { PhoneReader, type PhoneSeries } from "@/components/PhoneReader";
import { Rail } from "@/components/Rail";
import { TransitionLink } from "@/components/TransitionLink";
import { filmVideos, group, img, STATS, worksByChapter } from "@/content/works";

export const metadata: Metadata = {
  title: "01 成象 / IMAGE",
  description: "让想法成为看得见的作品。封面与主题、IP 与人物、校园与空间、图文与编排、绘画与造型、数字创意、界面与系统。",
};

const chapterNav = [
  { id: "a-covers", no: "A", label: "封面与主题" },
  { id: "b-ip", no: "B", label: "IP 与人物" },
  { id: "c-campus", no: "C", label: "校园与空间" },
  { id: "d-editorial", no: "D", label: "图文与编排" },
  { id: "e-drawing", no: "E", label: "绘画与造型" },
  { id: "f-digital", no: "F", label: "数字创意" },
  { id: "g-ui", no: "G", label: "界面与系统" },
];

const mbtiCards = [
  { land: "enfj-land", port: "enfj-port", code: "ENFJ", zh: "温柔理想暴君", tone: "理想主义 × 情感共鸣" },
  { land: "intp-land", port: "intp-port", code: "INTP", zh: "理性的囚徒", tone: "逻辑 × 自我囚禁" },
  { land: "intj-land", port: "intj-port", code: "INTJ", zh: "你根本不懂 INTJ", tone: "冷静 × 长期主义" },
  { land: "enfp-land", port: "enfp-port", code: "ENFP", zh: "把情绪价值当毒品", tone: "热情 × 情绪浓度" },
  { land: "wolf-land", port: "wolf-port", code: "WOLF", zh: "为什么狼人杀凉了", tone: "社交游戏 × 群体心理" },
];

const subCards = [
  { key: "goth-land", title: "哥特文化正在网红化", tag: "GOTHIC / 16:9" },
  { key: "lookism-land43", title: "外貌歧视，困住多少亚文化爱好者", tag: "LOOKISM / 4:3" },
  { key: "majority-land", title: "为什么亚文化占 85%", tag: "MAJORITY / 16:9" },
  { key: "rise-port", title: "为什么亚文化必然崛起", tag: "RISE / 16:9" },
];

const days = group("days");
const dayPreview = days.slice(0, 18);
const dayGallery = days.map((item) => ({ src: item.src, alt: `100 天实验 ${item.day} 封面`, caption: `${item.day} · 2026` }));

const bwPreview = group("bw").filter((_, index) => index % 2 === 0).slice(0, 12);
const bwGallery = group("bw").map((item) => ({ src: item.src, alt: "黑白视觉影像", caption: "黑白视觉 / MONOCHROME" }));

const talk = group("talk");
const dramaKeys = ["drama-03", "drama-18", "drama-21", "drama-20", "drama-16", "drama-09"];
const dramaItems = dramaKeys.map((key) => img("drama", key));
const dramaLabels = ["一致性参考板", "人物参考页", "成人三视图", "细节网格", "儿童三视图", "封面主视觉"];
const dramaGallery = dramaItems.map((item, index) => ({ src: item.src, alt: dramaLabels[index], caption: dramaLabels[index] }));

const panda = group("panda");
const pandaOriginal = img("panda", "panda-original");
const pandaPosters = panda.filter((item) => item.key !== "panda-original").slice(0, 4);

const campus = group("campus");
const drawing = group("drawing");
const sketch = group("sketch");
const game = group("game");
const gameGallery = game.map((item) => ({ src: item.src, alt: item.label, caption: item.label }));

const uiScreens = group("ui");
const uiVideo = filmVideos.ui[0];
const uiGallery = uiScreens.map((item) => ({ src: item.src, alt: "第二文化小程序界面", caption: "第二文化 / UI SCREEN" }));

const phoneSeries: PhoneSeries[] = [
  {
    key: "child",
    label: "童年动画的温柔暴击",
    title: "童年动画的温柔暴击",
    meta: "6 PAGES / 心灵故事 01",
    pages: group("xinlingChild"),
  },
  {
    key: "sword",
    label: "以杀为刃，护我所执",
    title: "以杀为刃，护我所执！",
    meta: "6 PAGES / 心灵故事 02",
    pages: group("xinlingSword"),
  },
  {
    key: "wisdom",
    label: "智慧的低语，心灵的启迪",
    title: "智慧的低语，心灵的启迪",
    meta: "6 PAGES / 心灵故事 03",
    pages: group("xinlingWisdom"),
  },
  {
    key: "xiumi",
    label: "现状剖析：四重迷雾",
    title: "现状剖析：大学生的四重迷雾",
    meta: "4 PAGES / 秀米排版",
    pages: group("xiumi"),
  },
];

const imageWorks = worksByChapter("image");

export default function ImageChapterPage() {
  return (
    <div className="chapter-page image-chapter">
      <section className="chapter-hero image-hero">
        <div className="wrap chapter-hero__grid">
          <div className="image-hero__copy">
            <div className="chapter-hero__label" data-reveal>
              <span className="mono">CHAPTER 01 / IMAGE</span>
              <span className="status status--ready">{imageWorks.length} PROJECTS</span>
            </div>
            <h1 className="chapter-hero__title serif" data-reveal>
              <span className="char">成</span><span className="char">象</span>
            </h1>
            <p className="chapter-hero__en display" data-reveal style={{ "--d": "120ms" } as React.CSSProperties}>
              THE FORM OF <em>THOUGHT.</em>
            </p>
            <p className="chapter-hero__lead" data-reveal style={{ "--d": "180ms" } as React.CSSProperties}>
              让想法成为看得见的作品。<br />
              从一张封面、一个角色、一条线稿，到一套完整的视觉系统。
            </p>
            <div className="chapter-hero__meta" data-reveal style={{ "--d": "240ms" } as React.CSSProperties}>
              <div><b data-count>{imageWorks.length}</b><span className="mono">PROJECTS / 项目</span></div>
              <div><b data-count>{STATS.images}</b><span className="mono">ASSETS / 素材</span></div>
              <div><b>98</b><span className="mono">COVERS / 日更</span></div>
            </div>
          </div>
          <div className="chapter-hero__aside image-hero__collage" aria-hidden="true">
            <figure className="collage-a" data-parallax="0.04"><img src={img("panda", "panda-original").src} alt="" /></figure>
            <figure className="collage-b" data-parallax="0.08"><img src={img("game", "game-cover").thumb} alt="" /></figure>
            <figure className="collage-c" data-parallax="0.12"><img src={img("days", "02-14").src} alt="" /></figure>
            <figure className="collage-d" data-parallax="0.06"><img src={img("campus", "arch-01").thumb} alt="" /></figure>
            <span className="collage-caption mono">A DOT → A LINE → A FORM → AN IMAGE</span>
          </div>
        </div>
      </section>

      <ChapterNav items={chapterNav} />

      <section id="a-covers" className="section image-section">
        <div className="wrap">
          <div className="section-head">
            <div>
              <div className="section-head__index"><b>A</b><span>COVERS &amp; THEMES</span></div>
              <h2>封面不是单张图，<br />而是一套可持续的<br />视觉语法。</h2>
            </div>
            <div>
              <p className="section-head__note">日更系列、人格主题、亚文化议题、黑白影像与短视频封面。它们看起来各不相同，但都在回答同一个问题：怎样让一个想法在第一眼被看见。</p>
            </div>
          </div>

          <div className="image-subhead" data-reveal>
            <span className="mono">A.01 / 100 DAYS</span>
            <h3 className="serif">98 张日更封面，按时间排成一条轴。</h3>
            <TransitionLink href="/work/100-days/" className="link-line">查看全部 98 张 <ArrowRight size={13} /></TransitionLink>
          </div>
          <Rail className="days-rail" label="100 天实验封面时间轴">
            {dayPreview.map((item, index) => (
              <div className="day-card" key={item.key}>
                <MediaImage
                  asset={item}
                  alt={`100 天实验 ${item.day} 封面`}
                  caption={`${item.day} · 2026`}
                  badge={item.day}
                  gallery={dayGallery}
                  index={index}
                />
                <span className="day-card__date mono">{item.day}</span>
              </div>
            ))}
            <TransitionLink href="/work/100-days/" className="day-more">
              <span className="mono">ALL 98<br />COVERS</span>
              <ArrowUpRight size={22} />
            </TransitionLink>
          </Rail>

          <div className="cover-matrix">
            <div className="mbti-block">
              <div className="image-subhead" data-reveal>
                <span className="mono">A.02 / MBTI</span>
                <h3 className="serif">五个人格，五种情绪温度。</h3>
                <TransitionLink href="/work/mbti-covers/" className="link-line">案例详情 <ArrowRight size={13} /></TransitionLink>
              </div>
              <div className="mbti-grid">
                {mbtiCards.map((card, index) => (
                  <TransitionLink key={card.code} href="/work/mbti-covers/" className={`mbti-card mbti-card--${index + 1}`} ariaLabel={`查看 MBTI 系列：${card.zh}`}>
                    <div className="mbti-card__frame">
                      <img src={img("mbti", card.land).thumb} alt={`${card.code} ${card.zh}`} loading="lazy" />
                      <img className="mbti-card__port" src={img("mbti", card.port).thumb} alt="" loading="lazy" aria-hidden="true" />
                      <span className="mbti-card__code mono">{card.code}</span>
                      <span className="mbti-card__open mono">VIEW <ArrowUpRight size={11} /></span>
                    </div>
                    <div className="mbti-card__caption">
                      <b>{card.zh}</b>
                      <span className="mono">{card.tone}</span>
                    </div>
                  </TransitionLink>
                ))}
              </div>
            </div>

            <div className="sub-block">
              <div className="image-subhead" data-reveal>
                <span className="mono">A.03 / SUBCULTURE</span>
                <h3 className="serif">用亚文化的语法，讨论亚文化。</h3>
                <TransitionLink href="/work/subculture-covers/" className="link-line">案例详情 <ArrowRight size={13} /></TransitionLink>
              </div>
              <div className="sub-grid">
                {subCards.map((card, index) => (
                  <TransitionLink key={card.key} href="/work/subculture-covers/" className={`sub-card sub-card--${index + 1}`} ariaLabel={`查看亚文化封面：${card.title}`}>
                    <img src={img("subculture", card.key).thumb} alt={card.title} loading="lazy" />
                    <span className="sub-card__shade" aria-hidden="true" />
                    <span className="sub-card__tag mono">{card.tag}</span>
                    <b className="sub-card__title serif">{card.title}</b>
                  </TransitionLink>
                ))}
              </div>
            </div>
          </div>

          <div className="bw-block">
            <div className="image-subhead" data-reveal>
              <span className="mono">A.04 / MONOCHROME</span>
              <h3 className="serif">去掉颜色之后，只剩下光、结构和呼吸。</h3>
              <TransitionLink href="/work/bw-archive/" className="link-line">全部 30 张 <ArrowRight size={13} /></TransitionLink>
            </div>
            <div className="bw-wall">
              {bwPreview.map((item, index) => (
                <MediaImage
                  key={item.key}
                  asset={item}
                  alt={`黑白影像 ${index + 1}`}
                  className="bw-item"
                  gallery={bwGallery}
                  index={group("bw").findIndex((asset) => asset.key === item.key)}
                />
              ))}
            </div>
          </div>

          <div className="story-talk">
            <div className="story-block">
              <div className="image-subhead" data-reveal>
                <span className="mono">A.05 / 心灵故事</span>
                <h3 className="serif">把台词、记忆和情绪，编成可以向下阅读的章节。</h3>
                <TransitionLink href="/work/editorial/" className="link-line">进入图文案例 <ArrowRight size={13} /></TransitionLink>
              </div>
              <div className="story-cards">
                {[
                  { img: img("xinlingChild", "xl-child-01"), title: "童年动画的温柔暴击", en: "CHILDHOOD / 6P" },
                  { img: img("xinlingSword", "xl-sword-01"), title: "以杀为刃，护我所执", en: "BLADE / 6P" },
                  { img: img("xinlingWisdom", "xl-wisdom-01"), title: "智慧的低语，心灵的启迪", en: "WISDOM / 6P" },
                ].map((story, index) => (
                  <TransitionLink key={story.en} href="/work/editorial/" className="story-card" ariaLabel={`查看图文：${story.title}`}>
                    <div className="story-card__stack">
                      <img src={story.img.thumb} alt={story.title} loading="lazy" />
                      <span className="story-card__page" aria-hidden="true" />
                      <span className="story-card__page" aria-hidden="true" />
                    </div>
                    <div className="story-card__meta">
                      <span className="mono">0{index + 1} / {story.en}</span>
                      <b className="serif">{story.title}</b>
                    </div>
                  </TransitionLink>
                ))}
              </div>
            </div>

            <div className="talk-block">
              <div className="image-subhead" data-reveal>
                <span className="mono">A.06 / 口播封面</span>
                <h3 className="serif">三张竖版封面，三种注意力入口。</h3>
                <TransitionLink href="/work/talk-covers/" className="link-line">案例详情 <ArrowRight size={13} /></TransitionLink>
              </div>
              <div className="talk-phones">
                {talk.map((item, index) => (
                  <div className="talk-phone" key={item.key}>
                    <span className="talk-phone__bar mono" aria-hidden="true">9:41 · 短视频</span>
                    <MediaImage
                      asset={item}
                      alt={`口播封面 ${index + 1}`}
                      badge="9:16"
                      gallery={talk.map((asset, i) => ({ src: asset.src, alt: `口播封面 ${i + 1}`, caption: "口播封面 / 9:16" }))}
                      index={index}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <TransitionLink href="/work/wolf-design/" className="wolf-band" ariaLabel="查看狼人杀形象设计">
            <div className="wolf-band__copy">
              <span className="mono">A.07 / WOLF POSTER</span>
              <h3 className="serif">把游戏身份，<br />变成一张脸。</h3>
              <span className="link-line">狼人杀形象设计 <ArrowUpRight size={13} /></span>
            </div>
            <div className="wolf-band__img">
              <img src={img("wolf", "wolf-poster").thumb} alt="狼人杀形象设计海报" loading="lazy" />
            </div>
          </TransitionLink>
        </div>
      </section>

      <section id="b-ip" className="section image-section image-section--ip">
        <div className="wrap">
          <div className="section-head">
            <div>
              <div className="section-head__index"><b>B</b><span>IP &amp; CHARACTERS</span></div>
              <h2>角色不是一张图，<br />是一条可以反复使用的<br />视觉线索。</h2>
            </div>
            <div>
              <p className="section-head__note">从原形象、角色一致性到不同场景的应用。这里展示的是「同一个人」如何在不同画面里被认出来。</p>
            </div>
          </div>

          <div className="panda-feature">
            <div className="panda-feature__visual">
              <span className="panda-feature__halo" aria-hidden="true" />
              <img src={pandaOriginal.src} alt="小含熊猫原始标准形象" loading="lazy" />
              <span className="panda-feature__label mono">ORIGINAL / 标准形象</span>
              <span className="panda-feature__rule mono">NO REDESIGN · 保留原形象</span>
            </div>
            <div className="panda-feature__copy">
              <span className="mono">B.01 / XIAOHAN PANDA</span>
              <h3 className="serif">小含熊猫 IP</h3>
              <p>保留原始角色的头部比例、身体轮廓、眼睛与五官、粗黑描边和圆润可爱的形象特征。变化的不是角色，而是它出现的场景。</p>
              <p className="muted">原始标准形象 + 8 张内容应用海报。角色本身不做重新设计。</p>
              <TransitionLink href="/work/panda-ip/" className="btn">查看 IP 案例 <ArrowRight size={14} /></TransitionLink>
            </div>
            <div className="panda-feature__thumbs">
              {pandaPosters.map((item, index) => (
                <MediaImage
                  key={item.key}
                  asset={item}
                  alt={`小含熊猫应用海报 ${index + 1}`}
                  gallery={panda.map((asset, i) => ({ src: asset.src, alt: `小含熊猫素材 ${i + 1}`, caption: "小含熊猫 / IP APPLICATION" }))}
                  index={panda.findIndex((asset) => asset.key === item.key)}
                />
              ))}
            </div>
          </div>

          <div className="drama-block">
            <div className="image-subhead" data-reveal>
              <span className="mono">B.02 / CHARACTER SHEETS</span>
              <h3 className="serif">从参考板、三视图到细节网格。</h3>
              <TransitionLink href="/work/drama-characters/" className="link-line">查看角色设定 <ArrowRight size={13} /></TransitionLink>
            </div>
            <Rail className="drama-rail" label="短剧角色设定">
              {dramaItems.map((item, index) => (
                <div className="drama-card" key={item.key}>
                  <MediaImage asset={item} alt={dramaLabels[index]} caption={dramaLabels[index]} badge={dramaLabels[index]} gallery={dramaGallery} index={index} />
                  <span className="drama-card__no mono">{String(index + 1).padStart(2, "0")}</span>
                </div>
              ))}
            </Rail>
          </div>

          <TransitionLink href="/work/interview-design/" className="interview-band" ariaLabel="查看大学生采访视觉">
            <img src={img("interview", "interview-cover").src} alt="大学生又在搞钱了 采访主视觉" loading="lazy" />
            <span className="interview-band__shade" aria-hidden="true" />
            <span className="interview-band__copy">
              <span className="mono">B.03 / CAMPUS INTERVIEW</span>
              <b className="serif">大学生又在搞钱了</b>
              <em className="mono">采访主视觉 / 16:9 · VIEW CASE ↗</em>
            </span>
          </TransitionLink>
        </div>
      </section>

      <section id="c-campus" className="section image-section">
        <div className="wrap">
          <div className="section-head">
            <div>
              <div className="section-head__index"><b>C</b><span>CAMPUS &amp; SPACE</span></div>
              <h2>用线，把校园留下来。</h2>
            </div>
            <div>
              <p className="section-head__note">建筑线稿负责记录结构，节庆视觉负责转译场景。同一组校园轮廓，可以进入线稿、红包与主题顶图。</p>
            </div>
          </div>

          <Rail className="campus-rail" label="长理建筑线稿">
            {campus.map((item, index) => (
              <div className="campus-card" key={item.key}>
                <MediaImage
                  asset={item}
                  alt={`长理建筑线稿 ${index + 1}`}
                  caption={`建筑线稿 ${String(index + 1).padStart(2, "0")}`}
                  badge={`ARCHIVE / ${String(index + 1).padStart(2, "0")}`}
                  gallery={campus.map((asset, i) => ({ src: asset.src, alt: `长理建筑线稿 ${i + 1}`, caption: `建筑线稿 ${String(i + 1).padStart(2, "0")}` }))}
                  index={index}
                />
                <span className="campus-card__no display">{String(index + 1).padStart(2, "0")}</span>
              </div>
            ))}
          </Rail>

          <div className="campus-duo">
            <TransitionLink href="/work/red-packet/" className="redpacket-card" ariaLabel="查看长理红包封图">
              <div className="redpacket-card__copy">
                <span className="mono">C.02 / RED PACKET</span>
                <h3 className="serif">三种风格，<br />同一套校园符号。</h3>
                <span className="link-line">查看封图 <ArrowUpRight size={13} /></span>
              </div>
              <img src={img("redpacket", "red-packet").thumb} alt="长理红包封图三款设计" loading="lazy" />
            </TransitionLink>
            <TransitionLink href="/work/fifteen-five/" className="fifteen-card" ariaLabel="查看十五五顶图">
              <div className="fifteen-card__copy">
                <span className="mono">C.03 / HORIZON BANNER</span>
                <h3 className="serif">让一行标题，<br />撑住一整条地平线。</h3>
              </div>
              <img src={img("fifteen", "fifteen-five").src} alt="聚焦十五五 喜迎党代会顶图" loading="lazy" />
              <span className="fifteen-card__scroll mono">LONG FORMAT / 横向长画幅 →</span>
            </TransitionLink>
          </div>
        </div>
      </section>

      <section id="d-editorial" className="section image-section image-section--editorial">
        <div className="wrap">
          <div className="section-head">
            <div>
              <div className="section-head__index"><b>D</b><span>EDITORIAL</span></div>
              <h2>排版，也是一种叙事。</h2>
            </div>
            <div>
              <p className="section-head__note">把手机屏幕当成版面：每屏一个主要信息，用章节页、引语、留白和图片切换控制阅读节奏。</p>
            </div>
          </div>
          <PhoneReader series={phoneSeries} />
          <div className="editorial-foot">
            <span className="mono">3 组心灵故事 / 1 组秀米排版 / 22 页长图文</span>
            <TransitionLink href="/work/editorial/" className="link-line">查看完整案例 <ArrowRight size={13} /></TransitionLink>
          </div>
        </div>
      </section>

      <section id="e-drawing" className="section image-section image-section--drawing">
        <div className="wrap">
          <div className="section-head">
            <div>
              <div className="section-head__index"><b>E</b><span>DRAWING</span></div>
              <h2>绘画是视觉能力的<br />底层训练。</h2>
            </div>
            <div>
              <p className="section-head__note">原作的笔触、纸张与光影被完整保留。不套滤镜，不做 AI 风格化，也不把素描处理成另一种东西。</p>
            </div>
          </div>

          <div className="art-wall">
            {drawing.map((item, index) => (
              <figure className={`art-piece art-piece--${index + 1}`} key={item.key}>
                <MediaImage
                  asset={item}
                  alt={`板绘作品 ${index + 1}`}
                  caption={`板绘作品 ${String(index + 1).padStart(2, "0")} / 原作`}
                  gallery={drawing.map((asset, i) => ({ src: asset.src, alt: `板绘作品 ${i + 1}`, caption: `板绘作品 ${String(i + 1).padStart(2, "0")}` }))}
                  index={index}
                />
                <figcaption>
                  <span className="mono">DIGITAL / {String(index + 1).padStart(2, "0")}</span>
                  <span className="mono muted">原作导出 · 未加滤镜</span>
                </figcaption>
              </figure>
            ))}
            {sketch.map((item, index) => (
              <figure className="art-piece art-piece--sketch" key={item.key}>
                <MediaImage asset={item} alt="素描作品" caption="素描作品 / 原作扫描" gallery={[{ src: item.src, alt: "素描作品", caption: "素描作品 / 原作扫描" }]} index={0} />
                <figcaption>
                  <span className="mono">GRAPHITE / 01</span>
                  <span className="mono muted">纸本素描 · 原作扫描</span>
                </figcaption>
              </figure>
            ))}
          </div>
          <div className="art-note mono">
            <span>ORIGINAL SCAN</span>
            <span>保留纸张纹理、笔触边缘与原始色偏</span>
          </div>
        </div>
      </section>

      <section id="f-digital" className="section image-section image-section--game">
        <div className="wrap">
          <div className="section-head">
            <div>
              <div className="section-head__index"><b>F</b><span>DIGITAL CREATIVE</span></div>
              <h2>让声音，<br />变成看得见的界面。</h2>
            </div>
            <div>
              <p className="section-head__note">游戏设计归入成象。这里展示的是游戏视觉、界面与组件，不虚构可玩版本。</p>
            </div>
          </div>

          <div className="game-panel">
            <div className="game-panel__top">
              <div className="game-panel__copy">
                <span className="mono">F.01 / FAST WAVE</span>
                <h3 className="serif">快放电波</h3>
                <p>深蓝底、青蓝霓虹、声波网格与玻璃拟态按钮。把「声音」变成一种可见的界面材质。</p>
                <ul className="game-panel__list mono">
                  <li>TITLE SCREEN</li>
                  <li>IN-GAME HUD</li>
                  <li>UI KIT / 8 PIECES</li>
                </ul>
                <TransitionLink href="/work/fast-wave-game/" className="btn">查看游戏视觉 <ArrowRight size={14} /></TransitionLink>
              </div>
              <div className="game-panel__cover">
                <MediaImage asset={img("game", "game-cover")} alt="快放电波标题界面" caption="快放电波 / 标题界面" gallery={gameGallery} index={0} priority />
              </div>
            </div>
            <div className="game-kit">
              {["game-inner", "game-play", "game-start", "game-rocker", "game-rule", "game-tell"].map((key, index) => (
                <MediaImage
                  key={key}
                  asset={img("game", key)}
                  alt={`快放电波界面组件 ${index + 1}`}
                  className="game-kit__item"
                  gallery={gameGallery}
                  index={game.findIndex((asset) => asset.key === key)}
                />
              ))}
            </div>
            <p className="game-panel__note mono">VISUAL DESIGN CASE · 不包含可运行的游戏版本 / NO PLAYABLE BUILD</p>
          </div>
        </div>
      </section>

      <section id="g-ui" className="section image-section">
        <div className="wrap">
          <div className="section-head">
            <div>
              <div className="section-head__index"><b>G</b><span>INTERFACE &amp; SYSTEM</span></div>
              <h2>把现场感，<br />带进产品界面。</h2>
            </div>
            <div>
              <p className="section-head__note">第二文化小程序 UI：黑白影像、荧光绿点缀与大字号标题，同时保留卡片圆角、底部导航与清晰的阅读层级。</p>
            </div>
          </div>
          <div className="ui-feature">
            <div className="ui-feature__intro">
              <span className="mono">G.01 / SUBCULTURE APP</span>
              <h3 className="serif">第二文化</h3>
              <p>8 个核心界面 + 1 段界面演示。展示为 UI 设计稿与演示，不代表线上产品状态。</p>
              <TransitionLink href="/work/second-culture/" className="link-line">查看界面案例 <ArrowRight size={13} /></TransitionLink>
            </div>
            <Rail className="ui-rail" label="第二文化界面">
              {uiScreens.map((item, index) => (
                <div className="ui-phone" key={item.key}>
                  <MediaImage asset={item} alt={`第二文化界面 ${index + 1}`} caption={`第二文化 / SCREEN ${String(index + 1).padStart(2, "0")}`} gallery={uiGallery} index={index} />
                  <span className="ui-phone__no mono">{String(index + 1).padStart(2, "0")}</span>
                </div>
              ))}
            </Rail>
            <div className="ui-video">
              <div className="ui-video__meta">
                <span className="mono">SCREEN RECORDING / 12.5S</span>
                <span className="status status--ready">真实视频</span>
              </div>
              <video controls preload="metadata" poster={uiVideo.poster} playsInline>
                <source src={uiVideo.src} type="video/mp4" />
                你的浏览器不支持视频播放。
              </video>
            </div>
          </div>
        </div>
      </section>

      <div className="wrap">
        <div className="chapter-foot">
          <TransitionLink href="/sound/" className="chapter-foot__next">
            <div>
              <span className="mono muted">NEXT CHAPTER / 02</span>
              <h2 className="serif">成声 <em className="display">SOUND</em></h2>
            </div>
            <span className="arrow">→</span>
          </TransitionLink>
        </div>
      </div>
    </div>
  );
}