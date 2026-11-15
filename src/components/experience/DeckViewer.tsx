"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Download, Pause, Play } from "@/components/Icons";
import { useLightbox } from "@/components/Lightbox";
import type { Deck } from "@/content/works";

const zhTitle = (value: string) => value.replace(/\bAI\b/gi, "人工智能").replace(/\bPPT\b/gi, "演示").replace(/\bUI\b/gi, "界面");

export function DeckViewer({ decks }: { decks: Deck[] }) {
  const [active, setActive] = useState(0);
  const [slide, setSlide] = useState(0);
  const [playing, setPlaying] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const { open } = useLightbox();
  const deck = decks[active];
  const deckTitle = deck ? zhTitle(deck.title) : "";
  const total = deck?.slides.length ?? 0;
  const safe = total ? Math.min(slide, total - 1) : 0;

  const go = useCallback((index: number) => {
    if (!total) return;
    setSlide(((index % total) + total) % total);
  }, [total]);

  const step = useCallback((direction: number) => {
    if (!total) return;
    setSlide((value) => (((value + direction) % total) + total) % total);
  }, [total]);

  useEffect(() => {
    setSlide(0);
    setPlaying(false);
  }, [active]);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setSlide((value) => {
        if (value >= total - 1) {
          setPlaying(false);
          return value;
        }
        return value + 1;
      });
    }, 4200);
    return () => window.clearInterval(timer);
  }, [playing, total]);

  useEffect(() => {
    if (!playing) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPlaying(false);
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [playing, step]);

  if (!deck) return null;

  const gallery = deck.slides.map((item, index) => ({
    src: item.src,
    alt: `${deckTitle} 第 ${index + 1} 页`,
    caption: `${deckTitle} · 第 ${index + 1} 页 / ${deck.slideCount}`,
  }));

  return (
    <div className="deck-viewer">
      <aside className="deck-list" aria-label="演示文稿列表">
        <span className="mono deck-list__label">演示目录</span>
        {decks.map((item, index) => (
          <button
            type="button"
            key={item.key}
            className={`deck-item${index === active ? " is-active" : ""}`}
            onClick={() => setActive(index)}
            aria-pressed={index === active}
          >
            <span className="mono">{String(index + 1).padStart(2, "0")}</span>
            <span className="deck-item__copy">
              <b className="serif">{zhTitle(item.title)}</b>
              <em className="mono">{item.slideCount} 页 · {item.sizeMB.toFixed(1)} 兆</em>
            </span>
          </button>
        ))}
        <p className="deck-list__note mono muted">
          演示文稿以节选页与文档展示。<br />不包含演讲者备注或虚构数据。
        </p>
      </aside>

      <div className="deck-stage" ref={stage}>
        <div className="deck-stage__bar">
          <span className="mono">第 {String(active + 1).padStart(2, "0")} 份演示</span>
          <div className="deck-stage__tools">
            <button type="button" onClick={() => setPlaying((value) => !value)} aria-label={playing ? "暂停自动播放" : "自动播放"}>
              {playing ? <Pause size={12} /> : <Play size={12} />} <span>{playing ? "暂停" : "轮播"}</span>
            </button>
            <a href={deck.pdf} download aria-label={`下载 ${deckTitle} 文档`}>
              <Download size={12} /> <span>下载</span>
            </a>
          </div>
        </div>

        <div className="deck-stage__frame">
          <button
            type="button"
            className="deck-stage__image"
            onClick={() => open(gallery, safe)}
            aria-label={`放大查看第 ${safe + 1} 页`}
          >
            <img key={`${deck.key}-${safe}`} src={deck.slides[safe].src} alt={`${deckTitle} 第 ${safe + 1} 页`} />
          </button>
          <button type="button" className="deck-stage__nav deck-stage__nav--prev" onClick={() => step(-1)} aria-label="上一页">
            <ChevronLeft size={16} />
          </button>
          <button type="button" className="deck-stage__nav deck-stage__nav--next" onClick={() => step(1)} aria-label="下一页">
            <ChevronRight size={16} />
          </button>
          <span className="deck-stage__count mono">{String(safe + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
          {playing ? <span className="deck-stage__progress" aria-hidden="true"><i key={safe} /></span> : null}
        </div>

        <div className="deck-thumbs">
          {deck.slides.map((item, index) => (
            <button
              type="button"
              key={item.src}
              className={`deck-thumb${index === safe ? " is-active" : ""}`}
              onClick={() => go(index)}
              aria-label={`跳到第 ${index + 1} 页`}
              aria-pressed={index === safe}
            >
              <img src={item.src} alt="" loading="lazy" />
              <span className="mono">{String(index + 1).padStart(2, "0")}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}