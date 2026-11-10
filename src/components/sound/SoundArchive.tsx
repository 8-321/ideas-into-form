"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, Sound } from "@/components/Icons";
import { useMotion } from "@/components/MotionProvider";
import type { AudioAsset } from "@/content/works";

const fmt = (value: number) => {
  if (!Number.isFinite(value)) return "0:00";
  const m = Math.floor(value / 60);
  const s = Math.floor(value % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
};

function Equalizer() {
  return (
    <span className="eq" aria-hidden="true">
      <i /><i /><i /><i />
    </span>
  );
}

export function SoundArchive({ tracks }: { tracks: AudioAsset[] }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const waveRef = useRef<HTMLCanvasElement>(null);
  const orbRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(tracks[0]?.duration ?? 0);
  const [ready, setReady] = useState(false);
  const { reduced } = useMotion();

  const track = tracks[current];
  const indexLabel = String(current + 1).padStart(2, "0");
  const isLongForm = current === 0;

  const ensureAudio = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return null;
    if (!ctxRef.current) {
      const AudioCtor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtor) {
        const ctx = new AudioCtor();
        const source = ctx.createMediaElementSource(audio);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
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
    const wave = waveRef.current;
    const orb = orbRef.current;
    if (!wave || !orb) return;
    const wctx = wave.getContext("2d");
    const octx = orb.getContext("2d");
    if (!wctx || !octx) return;

    let ww = 0;
    let wh = 0;
    let ow = 0;
    let oh = 0;
    let dpr = 1;
    const animate = !reduced;
    let drawRef: ((now: number) => void) | null = null;
    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      const wrect = wave.getBoundingClientRect();
      ww = wrect.width;
      wh = wrect.height;
      wave.width = Math.max(1, Math.floor(ww * dpr));
      wave.height = Math.max(1, Math.floor(wh * dpr));
      wctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const orect = orb.getBoundingClientRect();
      ow = orect.width;
      oh = orect.height;
      orb.width = Math.max(1, Math.floor(ow * dpr));
      orb.height = Math.max(1, Math.floor(oh * dpr));
      octx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!animate && drawRef) requestAnimationFrame(() => drawRef?.(performance.now()));
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wave);
    ro.observe(orb);

    const bars = 64;
    const levels = new Array(bars).fill(0.06);
    const seedBase = track?.title.charCodeAt(0) ?? 1;
    let raf = 0;

    const draw = (now: number) => {
      if (animate) raf = requestAnimationFrame(draw);
      const analyser = analyserRef.current;
      const data = dataRef.current;
      if (analyser && data && playing) analyser.getByteFrequencyData(data);

      for (let i = 0; i < bars; i += 1) {
        const index = Math.floor((i / bars) * (data?.length ?? 128) * 0.76);
        const seed = Math.sin(i * 0.63 + seedBase) * 0.5 + 0.5;
        const target = playing && data
          ? Math.max(0.05, data[Math.min(index, data.length - 1)] / 255)
          : 0.035 + seed * 0.075;
        levels[i] += (target - levels[i]) * (playing ? 0.26 : 0.045);
      }

      if (ww && wh) {
        wctx.clearRect(0, 0, ww, wh);
        const mid = wh / 2;
        const bw = ww / 56;
        for (let i = 0; i < 56; i += 1) {
          const level = levels[Math.floor((i / 56) * bars)];
          const bar = Math.max(1.5, level * wh * 0.86);
          const alpha = playing ? 0.45 + level * 0.48 : 0.16 + level * 0.4;
          wctx.fillStyle = `rgba(201,169,106,${alpha.toFixed(3)})`;
          wctx.fillRect(i * bw + bw * 0.28, mid - bar / 2, Math.max(1, bw * 0.42), bar);
        }
        wctx.fillStyle = "rgba(239,233,220,.16)";
        wctx.fillRect(0, mid, ww, 1);
      }

      if (ow && oh) {
        octx.clearRect(0, 0, ow, oh);
        const cx = ow / 2;
        const cy = oh / 2;
        const size = Math.min(ow, oh);
        const base = size * 0.295;
        const reach = size * 0.165;
        const rotation = playing ? now * 0.00006 : now * 0.000018;
        octx.save();
        octx.translate(cx, cy);
        octx.rotate(rotation);
        octx.lineCap = "round";

        octx.beginPath();
        octx.arc(0, 0, base * 0.94, 0, Math.PI * 2);
        octx.strokeStyle = "rgba(201,169,106,.16)";
        octx.lineWidth = 1;
        octx.stroke();

        for (let i = 0; i < bars; i += 1) {
          const angle = (i / bars) * Math.PI * 2 - Math.PI / 2;
          const level = levels[i];
          const inner = base + Math.sin(now * 0.0012 + i * 0.5) * 1.2;
          const outer = inner + 3 + level * reach;
          const x1 = Math.cos(angle) * inner;
          const y1 = Math.sin(angle) * inner;
          const x2 = Math.cos(angle) * outer;
          const y2 = Math.sin(angle) * outer;
          octx.beginPath();
          octx.moveTo(x1, y1);
          octx.lineTo(x2, y2);
          octx.strokeStyle = `rgba(201,169,106,${(playing ? 0.16 + level * 0.5 : 0.08 + level * 0.3).toFixed(3)})`;
          octx.lineWidth = 5;
          octx.stroke();
          octx.beginPath();
          octx.moveTo(x1, y1);
          octx.lineTo(x2, y2);
          octx.strokeStyle = `rgba(239,233,220,${(playing ? 0.12 + level * 0.32 : 0.06 + level * 0.18).toFixed(3)})`;
          octx.lineWidth = 1;
          octx.stroke();
          if (i % 8 === 0) {
            octx.beginPath();
            octx.arc(x2, y2, 1.4 + level * 1.8, 0, Math.PI * 2);
            octx.fillStyle = `rgba(201,169,106,${(0.24 + level * 0.56).toFixed(3)})`;
            octx.fill();
          }
        }

        const sweep = octx.createLinearGradient(-base, -base, base, base);
        sweep.addColorStop(0, "rgba(201,169,106,0)");
        sweep.addColorStop(0.5, `rgba(201,169,106,${playing ? 0.24 : 0.1})`);
        sweep.addColorStop(1, "rgba(201,169,106,0)");
        octx.beginPath();
        octx.arc(0, 0, base * 0.94, -0.7, 1.2);
        octx.strokeStyle = sweep;
        octx.lineWidth = 2;
        octx.stroke();
        octx.restore();
      }
    };
    drawRef = draw;
    draw(performance.now());
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [playing, track?.title, reduced]);

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

      <div className="sound-console" data-reveal>
        <div className="sound-deck-zone">
          <div className={`sound-deck${playing ? " is-playing" : ""}`} data-tilt="0.55" data-glare>
            <span className="sound-deck__rail mono" aria-hidden="true">SIDE A · IIF–SND–001</span>
            <canvas ref={orbRef} className="sound-deck__orb" aria-hidden="true" />
            <div className="sound-deck__vinyl" aria-hidden="true">
              <div className="sound-deck__disc">
                <span className="sound-deck__label">
                  <img src={track.coverThumb} alt="" />
                </span>
                <span className="sound-deck__spindle" />
              </div>
            </div>
            <figure className="sound-deck__sleeve" key={track.key}>
              <img src={track.cover} alt={`${track.title} 封面`} />
              <span className="sound-deck__badge mono">
                {isLongForm ? "ISSUE 01 / LONG FORM" : `ISSUE 02 / NOTE ${indexLabel}`}
              </span>
              <span className="sound-deck__index display" aria-hidden="true">{indexLabel}</span>
              <span className="sound-deck__sheen" aria-hidden="true" />
            </figure>
            <button
              type="button"
              className="sound-deck__play"
              onClick={toggle}
              data-magnet
              aria-label={playing ? "暂停" : "播放"}
            >
              {playing ? <Pause size={18} /> : <Play size={18} />}
            </button>
          </div>
          <div className="sound-deck__caption mono">
            <span>{isLongForm ? "长音频 / LONG FORM" : "红尘手记 / RED DUST NOTE"}</span>
            <span>{fmt(track.duration)}</span>
          </div>
        </div>

        <div className="sound-console__side">
          <div className="sound-now" aria-live="polite">
            <div className="sound-now__top mono">
              <span>NOW PLAYING / {indexLabel}</span>
              <span className={playing ? "is-live" : ""}>{playing ? "PLAYING" : "READY"}</span>
            </div>
            <h3 className="serif" key={`${track.key}-title`}>{track.title}</h3>
            <div className="sound-now__meta mono">
              <span>{isLongForm ? "LONG FORM / 07:42" : "RED DUST NOTES"}</span>
              <span>{indexLabel} / 05</span>
            </div>
            <canvas ref={waveRef} className="sound-now__wave" aria-hidden="true" />
          </div>

          <div className="sound-tracklist">
            <div className="sound-tracklist__head mono">
              <span>NO.</span><span>TITLE / 音频</span><span>COVER</span><span>DURATION</span><span />
            </div>
            {tracks.map((item, index) => {
              const active = index === current;
              return (
                <button
                  type="button"
                  key={item.key}
                  className={`sound-track${active ? " is-active" : ""}`}
                  onClick={() => (active ? toggle() : playIndex(index))}
                  aria-label={`${active && playing ? "暂停" : "播放"}：${item.title}`}
                >
                  <span className="sound-track__no mono">{String(index + 1).padStart(2, "0")}</span>
                  <span className="sound-track__title">
                    <b className="serif">{item.title}</b>
                    <em className="mono">{index === 0 ? "长音频 / LONG FORM" : "红尘手记 / NOTE"}</em>
                  </span>
                  <span className="sound-track__cover"><img src={item.coverThumb} alt="" loading="eager" decoding="async" /></span>
                  <span className="sound-track__dur mono">{fmt(item.duration)}</span>
                  <span className="sound-track__act">{active && playing ? <Equalizer /> : <Play size={12} />}</span>
                </button>
              );
            })}
          </div>

          <div className={`sound-transport${playing ? " is-playing" : ""}`}>
            <button type="button" className="player__play sound-transport__play" onClick={toggle} aria-label={playing ? "暂停" : "播放"}>
              {playing ? <Pause size={17} /> : <Play size={17} />}
            </button>
            <div className="sound-transport__timeline">
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
              <div className="sound-transport__times mono"><span>{fmt(time)}</span><span>{fmt(duration || track.duration)}</span></div>
            </div>
            <div className="sound-transport__status mono">
              <span className="sound-transport__dot" aria-hidden="true" />
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
        </div>
      </div>
    </>
  );
}
