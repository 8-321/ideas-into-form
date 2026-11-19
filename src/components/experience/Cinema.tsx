"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { ChevronLeft, ChevronRight, Close, Expand, Play } from "@/components/Icons";
import { Rail } from "@/components/Rail";
import { FilmArtwork } from "@/components/experience/FilmArtwork";
import type { ImageAsset, VideoAsset } from "@/content/works";

export type CinemaGroup = {
  key: string;
  label: string;
  note?: string;
  cover?: ImageAsset;
  videos: VideoAsset[];
};

const fmt = (value: number) => {
  const m = Math.floor(value / 60);
  const s = Math.floor(value % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
};

const ratioLabel = (video: VideoAsset) => {
  const ratio = video.width / video.height;
  if (ratio > 1.5) return "16:9";
  if (ratio > 1.1) return "4:3";
  if (ratio > 0.9) return "1:1";
  return "9:16";
};

export function Cinema({ groups }: { groups: CinemaGroup[] }) {
  const all = useMemo(
    () => groups.flatMap((group) => group.videos.map((video) => ({ ...video, group: group.key, groupLabel: group.label }))),
    [groups]
  );
  const [filter, setFilter] = useState("all");
  const [activeKey, setActiveKey] = useState(all[0]?.key ?? "");
  const [open, setOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const returnRef = useRef<HTMLButtonElement>(null);

  const visible = useMemo(() => (filter === "all" ? all : all.filter((video) => video.group === filter)), [all, filter]);
  const active = visible.find((video) => video.key === activeKey) ?? visible[0];
  const activeGroup = groups.find((group) => group.key === active?.group);
  const screenCover = activeGroup?.cover;
  const stagePortrait = Boolean(active && active.height > active.width);
  const screenSrc = stagePortrait ? active?.poster ?? screenCover?.src : screenCover?.src ?? activeGroup?.videos[0]?.poster ?? active?.poster;

  useEffect(() => {
    if (visible.length && !visible.some((video) => video.key === activeKey)) {
      setActiveKey(visible[0].key);
    }
  }, [visible, activeKey]);

  const jumpToGroup = useCallback((key: string) => {
    if (!groups.some((group) => group.key === key)) return;
    setFilter(key);
    const first = all.find((video) => video.group === key);
    if (first) setActiveKey(first.key);
  }, [all, groups]);

  useEffect(() => {
    const onJump = (event: Event) => jumpToGroup((event as CustomEvent<string>).detail);
    window.addEventListener("iif:cinema-group", onJump);
    return () => window.removeEventListener("iif:cinema-group", onJump);
  }, [jumpToGroup]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const trigger = (event.target as Element).closest<HTMLElement>("[data-cinema-group]");
      if (!trigger) return;
      const key = trigger.dataset.cinemaGroup;
      if (key) jumpToGroup(key);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [jumpToGroup]);

  useEffect(() => {
    if (!active?.key) return;
    const frame = document.querySelector<HTMLElement>(`.film-frame[data-key="${active.key}"]`);
    const viewport = frame?.closest<HTMLElement>(".rail__viewport");
    if (!frame || !viewport) return;
    const left = frame.offsetLeft - viewport.clientWidth / 2 + frame.clientWidth / 2;
    viewport.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
  }, [active?.key]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = open ? "hidden" : previous;
    return () => { document.body.style.overflow = previous; };
  }, [open]);

  const step = useCallback(
    (direction: number) => {
      if (!visible.length) return;
      const index = Math.max(0, visible.findIndex((video) => video.key === active?.key));
      const next = visible[(index + direction + visible.length) % visible.length];
      setActiveKey(next.key);
    },
    [visible, active?.key]
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
      if (event.key === "ArrowLeft") step(-1);
      if (event.key === "ArrowRight") step(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, step]);

  const close = useCallback(() => {
    setOpen(false);
    window.setTimeout(() => returnRef.current?.focus({ preventScroll: true }), 40);
  }, []);

  const goFull = async () => {
    const el = videoRef.current;
    if (!el) return;
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (el.requestFullscreen) await el.requestFullscreen();
      else (el as HTMLVideoElement & { webkitEnterFullscreen?: () => void }).webkitEnterFullscreen?.();
    } catch {
      /* 浏览器拒绝全屏时保留原生控件 */
    }
  };

  if (!active) return null;

  return (
    <div className="cinema">
      <div className="cinema__head">
        <div className="cinema__tabs" role="tablist" aria-label="影像分类">
          <button type="button" role="tab" aria-selected={filter === "all"} className={filter === "all" ? "is-active" : ""} onClick={() => setFilter("all")}>
            全部 <span className="mono">{all.length}</span>
          </button>
          {groups.map((group) => (
            <button
              key={group.key}
              type="button"
              role="tab"
              aria-selected={filter === group.key}
              className={filter === group.key ? "is-active" : ""}
              onClick={() => setFilter(group.key)}
            >
              {group.label} <span className="mono">{group.videos.length}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={`screening${stagePortrait ? " is-portrait" : ""}`}>
        <div className="screening__frame">
          <button
            ref={returnRef}
            type="button"
            className={`screening__screen${stagePortrait ? " is-portrait" : ""}`}
            onClick={() => setOpen(true)}
            aria-label={`播放：${active.label}`}
            data-group={active.group}
            data-artwork={screenSrc}
          >
            <FilmArtwork
              key={`${active.group}-${screenSrc}`}
              src={screenSrc}
              alt={screenCover ? `${active.groupLabel}封面` : `${active.label} 视频画面`}
              portrait={stagePortrait}
              loading="eager"
            />
            <span className="screening__shade" aria-hidden="true" />
            <span className="screening__play"><Play size={22} /></span>
            <span className="screening__corner screening__corner--tl mono">第 {visible.findIndex((v) => v.key === active.key) + 1} / {visible.length} 段</span>
            <span className="screening__corner screening__corner--br mono">{ratioLabel(active)} / {fmt(active.duration)}</span>
            <span className="screening__scan" aria-hidden="true" />
          </button>
          <div className="screening__bars" aria-hidden="true">
            <span /><span /><span /><span /><span /><span /><span /><span />
          </div>
        </div>

        <aside className="screening__meta">
          <span className="mono screening__kicker">正在放映</span>
          <h3 className="serif">{active.label}</h3>
          <p className="screening__group mono">{active.groupLabel}</p>
          <dl>
            <div><dt className="mono">时长</dt><dd>{fmt(active.duration)}</dd></div>
            <div><dt className="mono">画幅</dt><dd>{ratioLabel(active)}</dd></div>
            <div><dt className="mono">文件</dt><dd>{active.sizeMB.toFixed(1)} 兆</dd></div>
            <div><dt className="mono">声音</dt><dd>原声</dd></div>
          </dl>
          <button type="button" className="btn" onClick={() => setOpen(true)}><Play size={14} /> 播放</button>
        </aside>
      </div>

      <div className="cinema__strip">
        <Rail label="影像选择">
          {visible.map((video, index) => {
            const isActive = video.key === active.key;
            const videoGroup = groups.find((group) => group.key === video.group);
            const coverSrc = videoGroup?.cover?.thumb ?? videoGroup?.cover?.src ?? videoGroup?.videos[0]?.poster ?? video.poster;
            return (
              <button
                type="button"
                key={video.key}
                className={`film-frame${isActive ? " is-active" : ""}`}
                onClick={() => setActiveKey(video.key)}
                onDoubleClick={() => { setActiveKey(video.key); setOpen(true); }}
                aria-label={`选择影像：${video.label}`}
                aria-pressed={isActive}
                data-key={video.key}
                data-group={video.group}
                data-orientation={video.height > video.width ? "portrait" : "landscape"}
                data-artwork={coverSrc}
              >
                <span className="film-frame__holes" aria-hidden="true" />
                <span className="film-frame__img" style={{ "--frame-ratio": `${video.width} / ${video.height}` } as CSSProperties}>
                  <FilmArtwork src={coverSrc} alt="" portrait={video.height > video.width} loading={index < 6 ? "eager" : "lazy"} />
                  <span className="film-frame__play"><Play size={14} /></span>
                  <span className="film-frame__dur mono">{fmt(video.duration)}</span>
                </span>
                <span className="film-frame__copy">
                  <span className="mono">第 {String(index + 1).padStart(2, "0")} 段</span>
                  <b className="serif">{video.label}</b>
                </span>
              </button>
            );
          })}
        </Rail>
      </div>

      {open ? (
        <div className="cine-modal" role="dialog" aria-modal="true" aria-label={`播放：${active.label}`} onClick={(event) => { if (event.target === event.currentTarget) close(); }}>
          <div className="cine-modal__bar">
            <button type="button" className="cine-modal__back" onClick={close}>
              <ChevronLeft size={18} /> 返回
            </button>
            <div className="cine-modal__title">
              <span className="mono">正在放映</span>
              <b className="serif">{active.label}</b>
            </div>
            <div className="cine-modal__actions">
              <button type="button" onClick={goFull} aria-label="全屏"><Expand size={17} /></button>
              <button type="button" onClick={close} aria-label="关闭"><Close size={18} /></button>
            </div>
          </div>

          <div className="cine-modal__stage">
            <video
              key={active.key}
              ref={videoRef}
              src={active.src}
              poster={screenSrc}
              controls
              autoPlay
              playsInline
              preload="metadata"
            >
              你的浏览器不支持视频播放。
            </video>
          </div>

          <div className="cine-modal__foot">
            <button type="button" className="cine-modal__step" onClick={() => step(-1)}><ChevronLeft size={16} /> 上一段</button>
            <span className="mono cine-modal__count">
              {String(Math.max(0, visible.findIndex((v) => v.key === active.key)) + 1).padStart(2, "0")} / {String(visible.length).padStart(2, "0")}
            </span>
            <button type="button" className="cine-modal__step" onClick={() => step(1)}>下一段 <ChevronRight size={16} /></button>
          </div>
        </div>
      ) : null}
    </div>
  );
}



