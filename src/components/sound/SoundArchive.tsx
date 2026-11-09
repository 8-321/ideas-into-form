"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, Sound } from "@/components/Icons";
import type { AudioAsset } from "@/content/works";

const fmt = (value: number) => {
  if (!Number.isFinite(value)) return "0:00";
  const m = Math.floor(value / 60);
  const s = Math.floor(value % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
};

export function SoundArchive({ tracks }: { tracks: AudioAsset[] }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const rafRef = useRef(0);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(tracks[0]?.duration ?? 0);
  const [ready, setReady] = useState(false);

  const track = tracks[current];

  const ensureAudio = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return null;
    if (!ctxRef.current) {
      const AudioCtor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtor) {
        const ctx = new AudioCtor();
        const source = ctx.createMediaElementSource(audio);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 128;
        analyser.smoothingTimeConstant = 0.82;
        source.connect(analyser);
        analyser.connect(ctx.destination);
        ctxRef.current = ctx;
        analyserRef.current = analyser;
        dataRef.current = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount));
        setReady(true);
      }
    }
    if (ctxRef.current?.state === "suspended") await ctxRef.current.resume();
    return audio;
  }, []);

  const playIndex = useCallback(async (index: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const next = ((index % tracks.length) + tracks.length) % tracks.length;
    if (next !== current) {
      setCurrent(next);
      setTime(0);
      setDuration(tracks[next].duration);
      audio.src = tracks[next].src;
      audio.load();
    }
    await ensureAudio();
    try {
      await audio.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  }, [current, ensureAudio, tracks]);

  const toggle = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    await ensureAudio();
    if (audio.paused) {
      try { await audio.play(); setPlaying(true); } catch { setPlaying(false); }
    } else {
      audio.pause();
      setPlaying(false);
    }
  }, [ensureAudio]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const desired = new URL(tracks[current].src, window.location.href).href;
    if (audio.src !== desired) {
      audio.src = tracks[current].src;
      audio.load();
    }
    setDuration(tracks[current].duration);
  }, [current, tracks]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let w = 0, h = 0, dpr = 1;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width; h = rect.height;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const bars = 56;
    const levels = new Array(bars).fill(0.06);
    const draw = () => {
      rafRef.current = requestAnimationFrame(draw);
      if (!w || !h) return;
      ctx.clearRect(0, 0, w, h);
      const analyser = analyserRef.current;
      const data = dataRef.current;
      if (analyser && data && playing) analyser.getByteFrequencyData(data);
      const mid = h / 2;
      const bw = w / bars;
      for (let i = 0; i < bars; i++) {
        const index = Math.floor((i / bars) * (data?.length ?? 64) * 0.7);
        const seed = Math.sin(i * 0.63 + (track?.title.charCodeAt(0) ?? 1)) * 0.5 + 0.5;
        const target = playing && data ? Math.max(0.06, data[index] / 255) : 0.05 + seed * 0.1;
        levels[i] += (target - levels[i]) * (playing ? 0.28 : 0.05);
        const bar = Math.max(1.4, levels[i] * h * 0.9);
        const x = i * bw + bw * 0.28;
        const wd = bw * 0.44;
        ctx.fillStyle = playing ? "rgba(201,169,106,.9)" : "rgba(201,169,106,.24)";
        ctx.fillRect(x, mid - bar / 2, wd, bar);
      }
    };
    draw();
    return () => { cancelAnimationFrame(rafRef.current); ro.disconnect(); };
  }, [playing, track?.title]);

  useEffect(() => {
    return () => {
      ctxRef.current?.close().catch(() => {});
    };
  }, []);

  if (!track) return null;

  return (
    <>
      <audio
        ref={audioRef}
        preload="metadata"
        onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || track.duration)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          if (current < tracks.length - 1) playIndex(current + 1);
          else setPlaying(false);
        }}
      />

      {tracks.length > 1 ? (
      <div className="issues">
        <div className="issue issue--one">
          <div className="issue__visual">
            <img src={tracks[0].cover} alt={`${tracks[0].title} 封面`} loading="lazy" />
            <span className="issue__badge mono">ISSUE 01 / LONG FORM</span>
          </div>
          <div className="issue__copy">
            <span className="mono">01 / 万丈红尘</span>
            <h3 className="serif">把「经历」放回生活现场。</h3>
            <p>7 分 42 秒的长音频，是整组作品的主轴。窗外的城市、桌上的纸页与耳机，构成一个适合在夜里进入的空间。</p>
            <button type="button" className="btn" onClick={() => playIndex(0)}>
              {current === 0 && playing ? <Pause size={12} /> : <Play size={12} />}
              {current === 0 && playing ? "暂停本期" : "播放本期"}
            </button>
            <div className="issue__meta mono"><span>{fmt(tracks[0].duration)}</span><span>RED DUST / 2026</span></div>
          </div>
        </div>

        <div className="issue issue--two">
          <div className="issue__visual">
            <img src={tracks[2]?.cover ?? tracks[1].cover} alt={`${tracks[2]?.title ?? tracks[1].title} 封面`} loading="lazy" />
            <span className="issue__badge mono">ISSUE 02 / 4 TRACKS</span>
          </div>
          <div className="issue__copy">
            <span className="mono">02 / 体验为王</span>
            <h3 className="serif">四段手记，继续拆解「体验」。</h3>
            <p>从复盘、筛选、普通与结果四个角度，把「经历」拆成可以被重新理解的部分。四张封面共享同一扇窗，只是光线不同。</p>
            <button type="button" className="btn" onClick={() => playIndex(1)}>
              {current >= 1 && playing ? <Pause size={12} /> : <Play size={12} />}
              {current >= 1 && playing ? "暂停本期" : "播放本期"}
            </button>
            <div className="issue__meta mono">
              <span>{tracks.slice(1).reduce((sum, item) => sum + item.duration, 0) > 0 ? fmt(tracks.slice(1).reduce((sum, item) => sum + item.duration, 0)) : "—"}</span>
              <span>RED DUST NOTES / 2026</span>
            </div>
          </div>
        </div>
      </div>
      ) : null}

      <div className="tracklist">
        <div className="tracklist__head mono">
          <span>NO.</span><span>TITLE / 音频</span><span>COVER</span><span>DURATION</span><span />
        </div>
        {tracks.map((item, index) => {
          const active = index === current;
          return (
            <button
              type="button"
              key={item.key}
              className={`track${active ? " is-active" : ""}`}
              onClick={() => (active ? toggle() : playIndex(index))}
              aria-label={`${active && playing ? "暂停" : "播放"}：${item.title}`}
            >
              <span className="track__no mono">{String(index + 1).padStart(2, "0")}</span>
              <span className="track__title">
                <b className="serif">{item.title}</b>
                <em className="mono">{index === 0 ? "长音频 / LONG FORM" : "红尘手记 / NOTE"}</em>
              </span>
              <span className="track__cover"><img src={item.coverThumb} alt="" loading="lazy" /></span>
              <span className="track__dur mono">{fmt(item.duration)}</span>
              <span className="track__action">{active && playing ? <Pause size={13} /> : <Play size={13} />}</span>
            </button>
          );
        })}
      </div>

      <div className={`player${playing ? " is-playing" : ""}`}>
        <div className="player__cover">
          <img src={track.coverThumb} alt="" />
          <span className={`player__cover-shade${playing ? " is-playing" : ""}`} />
        </div>
        <div className="player__meta">
          <span className="mono">NOW PLAYING / {String(current + 1).padStart(2, "0")}</span>
          <b className="serif">{track.title}</b>
        </div>
        <button type="button" className="player__play" onClick={toggle} aria-label={playing ? "暂停" : "播放"}>
          {playing ? <Pause size={17} /> : <Play size={17} />}
        </button>
        <div className="player__timeline">
          <input
            type="range"
            min={0}
            max={duration || track.duration}
            step={0.1}
            value={Math.min(time, duration || track.duration)}
            style={{ "--p": `${Math.min(100, (Math.min(time, duration || track.duration) / (duration || track.duration)) * 100)}%` } as React.CSSProperties}
            onChange={(event) => {
              const value = Number(event.currentTarget.value);
              if (audioRef.current) audioRef.current.currentTime = value;
              setTime(value);
            }}
            aria-label="播放进度"
          />
          <div className="player__times mono"><span>{fmt(time)}</span><span>{fmt(duration || track.duration)}</span></div>
        </div>
        <canvas ref={canvasRef} className="player__wave" aria-hidden="true" />
        <div className="player__status mono">
          <Sound size={12} />
          <span>{ready && playing ? "LIVE SPECTRUM" : "REAL AUDIO / READY"}</span>
        </div>
        <button type="button" className="player__step" onClick={() => playIndex(current - 1)} aria-label="上一段">
          <ChevronLeft size={12} />
        </button>
        <button type="button" className="player__step player__step--next" onClick={() => playIndex(current + 1)} aria-label="下一段">
          <ChevronRight size={12} />
        </button>
      </div>
    </>
  );
}