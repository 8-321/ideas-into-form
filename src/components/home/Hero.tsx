import { ArrowRight } from "@/components/Icons";
import { TransitionLink } from "@/components/TransitionLink";
import { DECKS, STATS } from "@/content/works";
import { OriginArchive } from "./OriginArchive";

const deckPages = DECKS.reduce((sum, deck) => sum + deck.slideCount, 0);
const disciplines = ["封面系统", "角色形象", "界面设计", "建筑线稿", "黑白摄影", "影像与声音"];

export function Hero() {
  return (
    <section className="hero" id="top" aria-label="由意成形 首页">
      <div className="hero__stage">
        <div className="hero__inner wrap">
          <div className="hero__copy">
            <p className="hero__eyebrow">个人作品集 · 2026</p>
            <h1 className="hero__title">由意成形</h1>
            <p className="hero__lead">
              把想法，做成可以看见、<br />
              听见、走进去的作品。
            </p>
            <div className="hero__actions">
              <TransitionLink href="/image/" className="hero__primary" data-magnet data-cursor-label="进入">
                浏览作品 <ArrowRight size={15} />
              </TransitionLink>
            </div>

            <div className="hero__quick" aria-label="作品数量">
              <div className="hero__quick-head">
                <b className="serif">{STATS.works} 组项目</b>
                <span>六个方向 · 真实作品</span>
              </div>
              <dl>
                <div><dt>图像</dt><dd><b>{STATS.images}</b></dd></div>
                <div><dt>影像</dt><dd><b>{STATS.videos}</b></dd></div>
                <div><dt>声音</dt><dd><b>{STATS.audio}</b></dd></div>
                <div><dt>演示</dt><dd><b>{deckPages}</b></dd></div>
              </dl>
            </div>
          </div>

          <div className="hero__sculpture">
            <OriginArchive />
          </div>
        </div>

        <div className="hero__proof">
          <div className="wrap hero__proof-inner">
            <div className="hero__proof-label">
              <b className="serif">{STATS.works} 组项目</b>
              <span>六个方向 · 真实作品</span>
            </div>
            <dl className="hero__proof-stats" aria-label="作品数量">
              <div><dt>图像</dt><dd><b data-count>{STATS.images}</b><span>件</span></dd></div>
              <div><dt>影像</dt><dd><b data-count>{STATS.videos}</b><span>段</span></dd></div>
              <div><dt>声音</dt><dd><b data-count>{STATS.audio}</b><span>条</span></dd></div>
              <div><dt>演示</dt><dd><b data-count>{deckPages}</b><span>页</span></dd></div>
            </dl>
            <ul className="hero__proof-domains" aria-label="创作方向">
              {disciplines.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
