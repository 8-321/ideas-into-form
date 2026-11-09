"use client";

import { useEffect, useRef } from "react";
import { useMotion } from "./MotionProvider";

type Hit = { label: string; scale: number; hover: boolean };

function hitFor(target: Element | null): Hit {
  if (!target) return { label: "", scale: 1, hover: false };

  const explicit = target.closest<HTMLElement>("[data-cursor-label]");
  if (explicit) {
    return {
      label: explicit.dataset.cursorLabel || "OPEN",
      scale: 2.05,
      hover: true,
    };
  }

  const play = target.closest(".screening__screen, .film-frame, .screening__play, .player__play, .cine-modal__stage, video");
  if (play) return { label: "PLAY", scale: 2.1, hover: true };

  const drag = target.closest(".rail__viewport, .book-reader__stage");
  if (drag) return { label: "DRAG", scale: 1.85, hover: true };

  const media = target.closest(".media-btn, .work-card__img, .image-hero__collage figure, .mbti-card__frame, .issue__visual, .deck-stage__slide, .art-piece, .cover-card, .story-card__stack");
  if (media) return { label: "VIEW", scale: 2, hover: true };

  const link = target.closest("a[href]");
  if (link) return { label: "OPEN", scale: 1.7, hover: true };

  const control = target.closest("button, [role='button'], input, select, textarea, label");
  if (control) return { label: control.tagName === "INPUT" || control.tagName === "TEXTAREA" ? "TYPE" : "PRESS", scale: 1.55, hover: true };

  return { label: "", scale: 1, hover: false };
}

export function Cursor() {
  const rootRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLSpanElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);
  const auraRef = useRef<HTMLSpanElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const { reduced } = useMotion();

  useEffect(() => {
    const root = rootRef.current;
    const ring = ringRef.current;
    const dot = dotRef.current;
    const aura = auraRef.current;
    const label = labelRef.current;
    if (!root || !ring || !dot || !aura || !label) return;
    if (reduced || document.documentElement.dataset.reduce === "true") return;
    if (!window.matchMedia("(pointer: fine)").matches || !window.matchMedia("(hover: hover)").matches) return;

    document.documentElement.dataset.cursor = "on";
    let raf = 0;
    let visible = false;
    let hovering = false;
    const state = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      rx: window.innerWidth / 2,
      ry: window.innerHeight / 2,
      scale: 1,
      targetScale: 1,
    };

    const loop = () => {
      state.rx += (state.x - state.rx) * 0.16;
      state.ry += (state.y - state.ry) * 0.16;
      state.scale += (state.targetScale - state.scale) * 0.18;
      ring.style.transform = `translate3d(${state.rx.toFixed(2)}px, ${state.ry.toFixed(2)}px, 0) translate(-50%, -50%) scale(${state.scale.toFixed(3)})`;
      dot.style.transform = `translate3d(${state.x.toFixed(2)}px, ${state.y.toFixed(2)}px, 0) translate(-50%, -50%)`;
      aura.style.transform = `translate3d(${state.rx.toFixed(2)}px, ${state.ry.toFixed(2)}px, 0) translate(-50%, -50%) scale(${(0.8 + state.scale * 0.12).toFixed(3)})`;
      label.style.transform = `translate3d(${(state.x + 21).toFixed(2)}px, ${(state.y + 16).toFixed(2)}px, 0) scale(${hovering ? 1 : 0.92})`;
      raf = requestAnimationFrame(loop);
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      if (!visible) {
        state.x = event.clientX;
        state.y = event.clientY;
        state.rx = event.clientX;
        state.ry = event.clientY;
        visible = true;
        root.classList.add("is-visible");
      }
      state.x = event.clientX;
      state.y = event.clientY;
      const hit = hitFor(event.target instanceof Element ? event.target : null);
      hovering = hit.hover;
      state.targetScale = hit.scale;
      root.classList.toggle("is-hover", hit.hover);
      document.documentElement.dataset.cursorKind = hit.hover ? "action" : "idle";
      if (label.textContent !== hit.label) label.textContent = hit.label;
    };

    const onDown = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      root.classList.add("is-down");
      root.classList.remove("is-hover");
      hovering = false;
      state.targetScale = 1.18;
      label.textContent = "";
      const ripple = document.createElement("span");
      ripple.className = "cursor__ripple";
      ripple.style.left = `${event.clientX}px`;
      ripple.style.top = `${event.clientY}px`;
      root.appendChild(ripple);
      window.setTimeout(() => ripple.remove(), 760);

      for (let index = 0; index < 5; index += 1) {
        const fleck = document.createElement("span");
        fleck.className = "cursor__fleck";
        fleck.style.left = `${event.clientX}px`;
        fleck.style.top = `${event.clientY}px`;
        fleck.style.setProperty("--a", `${index * 72 + 14}deg`);
        fleck.style.setProperty("--d", `${13 + (index % 3) * 4}px`);
        root.appendChild(fleck);
        window.setTimeout(() => fleck.remove(), 720);
      }
    };

    const onUp = () => root.classList.remove("is-down");
    const onLeave = () => {
      visible = false;
      root.classList.remove("is-visible", "is-hover", "is-down");
    };
    const onEnter = () => {
      if (!visible) return;
      root.classList.add("is-visible");
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("pointerup", onUp, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    document.documentElement.addEventListener("pointerenter", onEnter);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      delete document.documentElement.dataset.cursor;
      delete document.documentElement.dataset.cursorKind;
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerup", onUp);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.documentElement.removeEventListener("pointerenter", onEnter);
      root.classList.remove("is-visible", "is-hover", "is-down");
    };
  }, [reduced]);

  return (
    <div className="cursor" ref={rootRef} aria-hidden="true">
      <span className="cursor__aura" ref={auraRef} />
      <span className="cursor__ring" ref={ringRef} />
      <span className="cursor__dot" ref={dotRef} />
      <span className="cursor__label" ref={labelRef} />
    </div>
  );
}
