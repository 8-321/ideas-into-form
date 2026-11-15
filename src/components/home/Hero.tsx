import { ArrowRight } from "@/components/Icons";
import { TransitionLink } from "@/components/TransitionLink";
import { OriginArchive } from "./OriginArchive";

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
              <a href="#manifesto" className="hero__secondary">创作理念</a>
            </div>
          </div>

          <div className="hero__sculpture">
            <OriginArchive />
          </div>
        </div>

        <a className="hero__scroll" href="#manifesto" aria-label="向下浏览">
          <span>向下浏览</span>
          <i aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}