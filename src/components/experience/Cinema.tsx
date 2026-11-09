"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Close, Expand, Play } from "@/components/Icons";
import { Rail } from "@/components/Rail";
import type { ImageAsset, VideoAsset } from "@/content/works";

export type CinemaGroup = {
  key: string;
  label: string;
  en: string;
  note: string;
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
    () => groups.flatMap((group) => group.videos.map((video) => ({ ...video, group: group.key, groupLabel: group.label, en: group.en }))),
    [groups]
  );
  const [filter, setFilter] = useState("all");
  const [activeKey, setActiveKey] = useState(all[0]?.key ?? "");
  const [open, setOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const visible = useMemo(() => (filter === "all" ? all : all.filter((video) => video.group === filter)), [all, filter]);
  const active = visible.find((video) => video.key === activeKey) ?? visible[0];
  const activeGroup = groups.find((group) => group.key === active?.group);
  const isGroupLead = activeGroup?.videos[0]?.key === active?.key;
  const screenCover = isGroupLead ? activeGroup?.cover : undefined;

  useEffect(() => {
    if (visible.length && !visible.some((video) => video.key === activeKey)) {
      setActiveKey(visible[0].key);
    }
  }, [visible, activeKey]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
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
        <p className="cinema__hint mono">
          <span>SELECT A FRAME / 选择画面</span>
          <span>CLICK TO SCREEN / 点击播放</span>
        </p>
      </div>

      <div className="screening">
        <div className="screening__frame">
          <button type="button" className="screening__screen" onClick={() => setOpen(true)} aria-label={`播放：${active.label}`}>
            <img key={`${active.key}-${screenCover ? "cover" : "frame"}`} src={screenCover?.src ?? active.poster} alt={screenCover ? `${active.groupLabel}封面` : `${active.label} 视频画面`} />
            <span className="screening__shade" aria-hidden="true" />
            <span className="screening__play"><Play size={20} /></span>
            <span className="screening__corner screening__corner--tl mono">REEL {String(visible.findIndex((v) => v.key === active.key) + 1).padStart(2, "0")} / {String(visible.length).padStart(2, "0")}</span>
            <span className="screening__corner screening__corner--br mono">{screenCover ? "COVER" : ratioLabel(active)} / {fmt(active.duration)}</span>
            <span className="screening__scan" aria-hidden="true" />
          </button>
          <div className="screening__bars" aria-hidden="true">
            <span /><span /><span /><span /><span /><span /><span /><span />
          </div>
        </div>

        <aside className="screening__meta">
          <span className="mono screening__kicker">NOW SCREENING</span>
          <h3 className="serif">{active.label}</h3>
          <p className="screening__group mono">{active.en} / {active.groupLabel}</p>
          <dl>
            <div><dt className="mono">DURATION</dt><dd>{fmt(active.duration)}</dd></div>
            <div><dt className="mono">FORMAT</dt><dd>{ratioLabel(active)} · ORIGINAL FRAME</dd></div>
            <div><dt className="mono">FILE</dt><dd>{active.sizeMB.toFixed(1)} MB</dd></div>
            <div><dt className="mono">AUDIO</dt><dd>ORIGINAL</dd></div>
          </dl>
          <p className="screening__note">{groups.find((group) => group.key === active.group)?.note}</p>
          <button type="button" className="btn" onClick={() => setOpen(true)}><Play size={12} /> 全屏观看</button>
        </aside>
      </div>

      <div className="cinema__strip">
        <Rail label="影像选择">
          {visible.map((video, index) => {
            const isActive = video.key === active.key;
            const portrait = video.height > video.width;
            return (
              <button
                type="button"
                key={video.key}
                className={`film-frame${isActive ? " is-active" : ""}${portrait ? " film-frame--tall" : ""}`}
                onClick={() => setActiveKey(video.key)}
                onDoubleClick={() => { setActiveKey(video.key); setOpen(true); }}
                aria-label={`选择影像：${video.label}`}
                aria-pressed={isActive}
              >
                <span className="film-frame__holes" aria-hidden="true" />
                <span className="film-frame__img">
                  <img src={video.poster} alt="" loading="lazy" />
                  <span className="film-frame__play"><Play size={13} /></span>
                  <span className="film-frame__dur mono">{fmt(video.duration)}</span>
                </span>
                <span className="film-frame__copy">
                  <span className="mono">{String(index + 1).padStart(2, "0")} / {video.en}</span>
                  <b className="serif">{video.label}</b>
                </span>
              </button>
            );
          })}
        </Rail>
      </div>

      {open ? (
        <div className="cine-modal" role="dialog" aria-modal="true" aria-label={`播放：${active.label}`}>
          <div className="cine-modal__bar">
            <div>
              <span className="mono">NOW SCREENING / {active.en}</span>
              <b className="serif">{active.label}</b>
            </div>
            <div className="cine-modal__actions">
              <button type="button" onClick={goFull} aria-label="全屏"><Expand size={15} /></button>
              <button type="button" onClick={() => setOpen(false)} aria-label="关闭"><Close size={16} /></button>
            </div>
          </div>

          <div className="cine-modal__stage">
            <video
              key={active.key}
              ref={videoRef}
              src={active.src}
              poster={active.poster}
              controls
              autoPlay
              playsInline
              preload="metadata"
            >
              你的浏览器不支持视频播放。
            </video>
          </div>

          <div className="cine-modal__foot">
            <button type="button" className="cine-modal__step" onClick={() => step(-1)}><ChevronLeft size={14} /> 上一段</button>
            <span className="mono cine-modal__count">
              {String(Math.max(0, visible.findIndex((v) => v.key === active.key)) + 1).padStart(2, "0")} / {String(visible.length).padStart(2, "0")}
            </span>
            <button type="button" className="cine-modal__step" onClick={() => step(1)}>下一段 <ChevronRight size={14} /></button>
          </div>
          <p className="cine-modal__tip mono">ESC 关闭 · ← → 切换 · 空格暂停（原生控件）</p>
        </div>
      ) : null}
    </div>
  );
}