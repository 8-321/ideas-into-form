"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { ChevronLeft, ChevronRight, Download, Pause, Play } from "@/components/Icons";
import { useLightbox } from "@/components/Lightbox";
import type { Deck } from "@/content/works";
import { deckVideoCount, deckVideoPage, type DeckVideoPage } from "@/content/deckMedia";

const zhTitle = (value: string) => value.replace(/\bAI\b/gi, "人工智能").replace(/\bPPT\b/gi, "演示").replace(/\bUI\b/gi, "界面");

const fmt = (value: number) => {
  const m = Math.floor(value / 60);
  const s = Math.floor(value % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
};

function DeckVideoStage({ deckKey, page, title }: { deckKey: string; page: DeckVideoPage; title: string }) {
  const [active, setActive] = useState(0);
  const clip = page.clips[Math.min(active, page.clips.length - 1)];

  useEffect(() => {
    setActive(0);
  }, [deckKey, page.slide]);

  if (!clip) return null;

  const portrait = clip.height > clip.width;
  const ratio = `${clip.width} / ${clip.height}`;

  return (
    <div className={`deck-video-page${portrait ? " is-portrait" : ""}`}>
      <div className="deck-video-page__head mono">
        <span><Play size={12} /> 视频</span>
        <span>{String(page.clips.length).padStart(2, "0")} 段</span>
      </div>
      <div
        className="deck-video-page__frame"
        style={{ "--clip-ratio": ratio } as CSSProperties}
      >
        <video
          key={clip.id}
          src={clip.src}
          poster={clip.poster}
          controls
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-label={`${title}：${clip.label}`}
        >
          你的浏览器不支持视频播放。
        </video>
        <span className="deck-video-page__caption mono">{clip.label} · {fmt(clip.duration)}</span>
      </div>
      {page.clips.length > 1 ? (
        <div className="deck-video-page__clips" aria-label="本页视频">
          {page.clips.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={index === active ? "is-active" : ""}
              onClick={() => setActive(index)}
              aria-pressed={index === active}
              aria-label={`播放视频：${item.label}`}
            >
              <span className="deck-video-page__thumb">
                <img src={item.poster} alt="" loading="lazy" decoding="async" />
                <Play size={14} />
              </span>
              <span className="deck-video-page__name mono">{item.label}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function DeckViewer({ decks }: { decks: Deck[] }) {
  const [active, setActive] = useState(0);
  const [slide, setSlide] = useState(0);
  const [playing, setPlaying] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const swipeRef = useRef<{ x: number; y: number; active: boolean; moved: boolean } | null>(null);
  const swipeMoved = useRef(false);
  const { open } = useLightbox();
  const deck = decks[active];
  const deckTitle = deck ? zhTitle(deck.title) : "";
  const total = deck?.slides.length ?? 0;
  const safe = total ? Math.min(slide, total - 1) : 0;
  const videoPage = deck ? deckVideoPage(deck.key, safe) : undefined;
  const videoCount = deck ? deckVideoCount(deck.key) : 0;

  const go = useCallback((index: number) => {
    if (!total) return;
    setSlide(((index % total) + total) % total);
  }, [total]);

  const step = useCallback((direction: number) => {
    if (!total) return;
    setSlide((value) => (((value + direction) % total) + total) % total);
  }, [total]);

  const chooseDeck = useCallback((index: number) => {
    setActive(index);
    if (window.innerWidth <= 900) {
      window.setTimeout(() => stageRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 90);
    }
  }, []);

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
    if (videoPage && playing) setPlaying(false);
  }, [playing, videoPage]);

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

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let lock = 0;
    const onWheel = (event: WheelEvent) => {
      const horizontal = Math.abs(event.deltaX) > Math.abs(event.deltaY);
      const focused = document.activeElement === stage || stage.contains(document.activeElement);
      if (!horizontal && !focused) return;
      const delta = horizontal ? event.deltaX : event.deltaY;
      if (Math.abs(delta) < 10) return;
      if ((safe === 0 && delta < 0) || (safe === total - 1 && delta > 0)) return;
      event.preventDefault();
      const now = performance.now();
      if (now < lock) return;
      lock = now + 340;
      step(delta > 0 ? 1 : -1);
    };
    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => stage.removeEventListener("wheel", onWheel);
  }, [safe, step, total]);

  if (!deck) return null;

  const gallery = deck.slides.map((item, index) => ({
    src: item.src,
    alt: `${deckTitle} 第 ${index + 1} 页`,
    caption: `${deckTitle} · 第 ${index + 1} 页 / ${deck.slideCount}`,
  }));

  const setTilt = (event: React.PointerEvent<HTMLButtonElement>) => {
    const element = event.currentTarget;
    const rect = element.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    element.style.setProperty("--mx", `${(x * 100).toFixed(1)}%`);
    element.style.setProperty("--my", `${(y * 100).toFixed(1)}%`);
    element.style.setProperty("--ry", `${((x - 0.5) * 8).toFixed(2)}deg`);
    element.style.setProperty("--rx", `${((0.5 - y) * 6).toFixed(2)}deg`);
  };

  const resetTilt = (event: React.PointerEvent<HTMLButtonElement>) => {
    const element = event.currentTarget;
    element.style.setProperty("--mx", "50%");
    element.style.setProperty("--my", "42%");
    element.style.setProperty("--ry", "0deg");
    element.style.setProperty("--rx", "0deg");
  };

  const onStageKey = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest("video, input, a")) return;
    if (event.key === "ArrowLeft" || event.key === "ArrowUp" || event.key === "PageUp") {
      event.preventDefault();
      step(-1);
    }
    if (event.key === "ArrowRight" || event.key === "ArrowDown" || event.key === "PageDown" || event.key === " ") {
      event.preventDefault();
      step(1);
    }
  };

  return (
    <div className="deck-viewer">
      <div className="deck-shelf" role="tablist" aria-label="演示文稿">
        {decks.map((item, index) => {
          const clips = deckVideoCount(item.key);
          const isActive = index === active;
          return (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-pressed={isActive}
              className={`deck-card${isActive ? " is-active" : ""}`}
              style={{ "--i": index } as CSSProperties}
              onClick={() => chooseDeck(index)}
              onPointerMove={setTilt}
              onPointerLeave={resetTilt}
            >
              <span className="deck-card__art">
                <img src={item.slides[0].src} alt="" loading="eager" decoding="async" fetchPriority="high" />
                <span className="deck-card__scan" aria-hidden="true" />
                <span className="deck-card__no mono">{String(index + 1).padStart(2, "0")}</span>
                {clips ? <span className="deck-card__video mono"><Play size={10} /> {clips}</span> : null}
                <span className="deck-card__open mono">打开</span>
              </span>
              <span className="deck-card__copy">
                <b className="serif">{zhTitle(item.title)}</b>
                <em className="mono">{item.slides.length} 页</em>
              </span>
            </button>
          );
        })}
      </div>

      <div
        ref={stageRef}
        className="deck-stage"
        data-deck={deck.key}
        tabIndex={0}
        onKeyDown={onStageKey}
        aria-label="演示预览，方向键翻页"
        onPointerDown={(event) => {
          if ((event.target as Element).closest("button, a, video")) return;
          swipeMoved.current = false;
          swipeRef.current = { x: event.clientX, y: event.clientY, active: true, moved: false };
        }}
        onPointerMove={(event) => {
          const swipe = swipeRef.current;
          if (!swipe?.active) return;
          if (Math.abs(event.clientX - swipe.x) > 6) swipe.moved = true;
        }}
        onPointerUp={(event) => {
          const swipe = swipeRef.current;
          swipeRef.current = null;
          if (!swipe?.active) return;
          swipeMoved.current = swipe.moved;
          if (swipe.moved) window.setTimeout(() => { swipeMoved.current = false; }, 160);
          const dx = event.clientX - swipe.x;
          const dy = event.clientY - swipe.y;
          if (Math.abs(dx) > 54 && Math.abs(dx) > Math.abs(dy) * 1.15) step(dx < 0 ? 1 : -1);
        }}
        onPointerCancel={() => { swipeRef.current = null; }}
        onClickCapture={(event) => {
          if (!swipeMoved.current) return;
          event.preventDefault();
          event.stopPropagation();
        }}
      >
        <div className="deck-stage__bar">
          <div className="deck-stage__id">
            <span className="mono">第 {String(active + 1).padStart(2, "0")} / {String(decks.length).padStart(2, "0")} 份</span>
            <b className="serif">{deckTitle}</b>
            {videoCount ? <em className="mono">{videoCount} 段视频</em> : null}
          </div>
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
          {videoPage ? (
            <DeckVideoStage key={`${deck.key}-${safe}`} deckKey={deck.key} page={videoPage} title={deckTitle} />
          ) : (
            <button
              type="button"
              className="deck-stage__image"
              onClick={() => open(gallery, safe)}
              aria-label={`放大查看第 ${safe + 1} 页`}
            >
              <img key={`${deck.key}-${safe}`} src={deck.slides[safe].src} alt={`${deckTitle} 第 ${safe + 1} 页`} />
            </button>
          )}
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
          {deck.slides.map((item, index) => {
            const hasVideo = Boolean(deckVideoPage(deck.key, index));
            return (
              <button
                type="button"
                key={item.src}
                className={`deck-thumb${index === safe ? " is-active" : ""}${hasVideo ? " has-video" : ""}`}
                onClick={() => go(index)}
                aria-label={`跳到第 ${index + 1} 页${hasVideo ? "，含视频" : ""}`}
                aria-pressed={index === safe}
              >
                <img src={item.src} alt="" loading="lazy" />
                <span className="mono">{String(index + 1).padStart(2, "0")}</span>
                {hasVideo ? <i className="deck-thumb__video mono"><Play size={9} /> 视频</i> : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

