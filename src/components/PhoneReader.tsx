"use client";

import { useEffect, useRef, useState } from "react";
import { MediaImage } from "./MediaImage";
import type { ImageAsset } from "@/content/works";

export type PhoneSeries = {
  key: string;
  label: string;
  title: string;
  meta: string;
  pages: ImageAsset[];
};

export function PhoneReader({ series }: { series: PhoneSeries[] }) {
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const scroller = useRef<HTMLDivElement>(null);
  const current = series[active];

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    el.scrollTop = 0;
    setProgress(0);
  }, [active]);

  return (
    <div className="phone-reader">
      <div className="phone-reader__side">
        <div className="phone-reader__tabs" role="tablist" aria-label="图文系列">
          {series.map((item, index) => (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={active === index}
              className={active === index ? "is-active" : ""}
              onClick={() => setActive(index)}
            >
              <span className="mono">{String(index + 1).padStart(2, "0")}</span>
              {item.label}
            </button>
          ))}
        </div>
        <div className="phone-reader__info">
          <h3 className="serif">{current.title}</h3>
          <p className="mono muted">{current.meta}</p>
          <p>上下滚动模拟手机阅读。每一页都是一张完整长图，可点击放大查看细节。</p>
        </div>
      </div>

      <div className="phone">
        <div className="phone__notch" aria-hidden="true" />
        <div className="phone__status mono">
          <span>9:41</span>
          <span>公众号 / 图文</span>
          <span>•••</span>
        </div>
        <div
          className="phone__scroll"
          ref={scroller}
          onScroll={(event) => {
            const el = event.currentTarget;
            const max = el.scrollHeight - el.clientHeight;
            setProgress(max <= 0 ? 0 : el.scrollTop / max);
          }}
        >
          {current.pages.map((page, index) => (
            <div className="phone__page" key={page.key}>
              <MediaImage
                asset={page}
                alt={`${current.title} 第 ${index + 1} 页`}
                caption={`${current.title} · P${String(index + 1).padStart(2, "0")}`}
                gallery={current.pages.map((p, i) => ({ src: p.src, alt: `${current.title} 第 ${i + 1} 页`, caption: `${current.title} · P${String(i + 1).padStart(2, "0")}` }))}
                index={index}
                contain
              />
            </div>
          ))}
        </div>
        <div className="phone__progress" aria-hidden="true"><i style={{ transform: `scaleX(${Math.max(0.04, progress)})` }} /></div>
      </div>
    </div>
  );
}