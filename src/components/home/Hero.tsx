"use client";

import { useEffect, useState } from "react";
import { OriginArchive } from "./OriginArchive";

export function Hero() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setLoaded(true), 80);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <section className={`hero${loaded ? " is-loaded" : ""}`} id="top" aria-label="由意成形 首屏">
      <div className="hero__stage">
        <div className="hero__sculpture" aria-hidden="true">
          <OriginArchive />
        </div>
        <div className="hero__grid" aria-hidden="true" />
        <div className="hero__content wrap">
          <div className="hero__top mono">
            <span>PERSONAL PORTFOLIO</span>
            <span>VOL. 01 / 2026</span>
          </div>

          <h1 className="hero__title serif" aria-label="由意成形">
            <span className="hero__line">
              <span className="hero__char" style={{ "--i": 0 } as React.CSSProperties}>由</span>
              <span className="hero__char" style={{ "--i": 1 } as React.CSSProperties}>意</span>
            </span>
            <span className="hero__line hero__line--indent">
              <span className="hero__char" style={{ "--i": 2 } as React.CSSProperties}>成</span>
              <span className="hero__char" style={{ "--i": 3 } as React.CSSProperties}>形</span>
            </span>
          </h1>

          <p className="hero__en display">IDEAS INTO <em>FORM.</em></p>

          <div className="hero__bottom">
            <p className="hero__sub serif">从想法出发，<br />让创造拥有形态。</p>
            <p className="hero__aux">一个想法，可以成为图像、文字、声音，<br />也可以成为一次体验。</p>
          </div>

          <div className="hero__side mono" aria-hidden="true">
            <span>由意成形</span>
            <span>IDEAS INTO FORM.</span>
          </div>

          <div className="hero__scroll mono" aria-hidden="true">
            <span>SCROLL</span><i />
          </div>

          <div className="hero__caption mono" aria-hidden="true">
            <span>REAL FILES / 05</span>
            <span>SPATIAL ARCHIVE</span>
          </div>
        </div>
      </div>
    </section>
  );
}