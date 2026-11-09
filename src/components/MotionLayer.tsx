"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const easeOut = (value: number) => 1 - Math.pow(1 - value, 3);

export function MotionLayer() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const reduce = () => root.dataset.reduce === "true";
    let revealObserver: IntersectionObserver | null = null;
    let countObserver: IntersectionObserver | null = null;
    let raf = 0;
    let tiltElement: HTMLElement | null = null;
    let magnetElement: HTMLElement | null = null;
    let glareElement: HTMLElement | null = null;
    const countFrames = new Set<number>();

    const setCountValue = (element: HTMLElement, value: number, match: RegExpMatchArray) => {
      const decimals = (match[2].split(".")[1] || "").length;
      const formatted = value.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
      element.textContent = `${match[1]}${formatted}${match[3]}`;
    };

    const animateCount = (element: HTMLElement) => {
      if (element.dataset.countDone === "1") return;
      element.dataset.countDone = "1";
      const original = element.textContent || "";
      const match = original.match(/^(\D*)([\d,.]+)(.*)$/);
      if (!match) return;
      const explicitCount = Number(element.dataset.count);
      const target = Number.isFinite(explicitCount) ? explicitCount : Number(match[2].replace(/,/g, ""));
      if (!Number.isFinite(target)) return;
      if (reduce()) {
        setCountValue(element, target, match);
        return;
      }
      let started = 0;
      const duration = Number(element.dataset.countDuration || 1180);
      const tick = (now: number) => {
        if (!started) started = now;
        const progress = Math.min(1, Math.max(0, (now - started) / duration));
        setCountValue(element, target * easeOut(progress), match);
        if (progress < 1) {
          const frame = requestAnimationFrame(tick);
          countFrames.add(frame);
        }
      };
      setCountValue(element, 0, match);
      const frame = requestAnimationFrame(tick);
      countFrames.add(frame);
    };

    const attachCounts = () => {
      countObserver?.disconnect();
      const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-count]"));
      if (reduce()) {
        countFrames.forEach((frame) => cancelAnimationFrame(frame));
        countFrames.clear();
        nodes.forEach((node) => {
          const match = (node.textContent || "").match(/^(\D*)([\d,.]+)(.*)$/);
          if (match) {
            const explicitCount = Number(node.dataset.count);
            setCountValue(node, Number.isFinite(explicitCount) ? explicitCount : Number(match[2].replace(/,/g, "")), match);
          }
          node.dataset.countDone = "1";
        });
        return;
      }
      countObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            animateCount(entry.target as HTMLElement);
            countObserver?.unobserve(entry.target);
          });
        },
        { rootMargin: "0px 0px -6% 0px", threshold: 0.3 }
      );
      nodes.forEach((node) => {
        if (node.dataset.countDone === "1") return;
        const rect = node.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) animateCount(node);
        else countObserver?.observe(node);
      });
    };

    const prepareMotionTargets = () => {
      document.querySelectorAll<HTMLElement>(".site a.btn, .site button.btn, .site a.link-line, .book-launch, .book-intro__launch").forEach((element) => {
        if (!element.hasAttribute("data-magnet")) element.setAttribute("data-magnet", "");
      });

      document.querySelectorAll<HTMLElement>(".work-card__img, .cover-card .media, .art-piece .media, .deck-stage__image, .image-hero__collage figure, .work-cover__frame").forEach((element) => {
        if (!element.hasAttribute("data-glare")) element.setAttribute("data-glare", "");
      });

      document.querySelectorAll<HTMLElement>(".site .section-head h2").forEach((element) => {
        if (element.dataset.fold === "1") return;
        const source = element.innerHTML.trim();
        if (!source) return;
        const lines = source.split(/<br\s*\/?>/i).map((line) => line.trim()).filter(Boolean);
        if (!lines.length) return;
        element.innerHTML = lines
          .map((line, index) => `<span class="fold-line" style="--i:${index}"><span>${line}</span></span>`)
          .join("");
        element.dataset.fold = "1";
        if (!element.hasAttribute("data-reveal")) element.setAttribute("data-reveal", "");
        void element.offsetWidth;
      });
    };

    const attachReveal = () => {
      revealObserver?.disconnect();
      const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal], .stagger"));
      if (reduce()) {
        nodes.forEach((node) => node.classList.add("is-in"));
        return;
      }
      revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-in");
            revealObserver?.unobserve(entry.target);
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
      );
      nodes.forEach((node) => {
        const rect = node.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.92) node.classList.add("is-in");
        else revealObserver?.observe(node);
      });
    };

    const resetTilt = () => {
      if (!tiltElement) return;
      tiltElement.classList.remove("is-tilting");
      tiltElement.style.removeProperty("--tilt-x");
      tiltElement.style.removeProperty("--tilt-y");
      tiltElement.style.removeProperty("--tilt-lift");
      tiltElement = null;
    };

    const resetMagnet = () => {
      if (!magnetElement) return;
      magnetElement.classList.remove("is-magnet");
      magnetElement.style.removeProperty("--mx");
      magnetElement.style.removeProperty("--my");
      magnetElement = null;
    };

    const onMagnetMove = (event: PointerEvent) => {
      if (event.pointerType === "touch" || reduce()) return;
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-magnet]") : null;
      if (target !== magnetElement) {
        resetMagnet();
        magnetElement = target;
      }
      if (!target) return;
      const rect = target.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const nx = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width) * 2 - 1));
      const ny = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height) * 2 - 1));
      const pull = target.classList.contains("book-intro__launch") ? 3.4 : 4.6;
      target.style.setProperty("--mx", `${(nx * pull).toFixed(2)}px`);
      target.style.setProperty("--my", `${(ny * pull).toFixed(2)}px`);
      target.classList.add("is-magnet");
    };

    const resetGlare = () => {
      if (!glareElement) return;
      glareElement.classList.remove("is-glaring");
      glareElement.style.removeProperty("--glare-x");
      glareElement = null;
    };

    const onGlareMove = (event: PointerEvent) => {
      if (event.pointerType === "touch" || reduce()) return;
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-glare]") : null;
      if (target !== glareElement) {
        resetGlare();
        glareElement = target;
      }
      if (!target) return;
      const rect = target.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
      target.style.setProperty("--glare-x", `${(x * 100).toFixed(2)}%`);
      target.classList.add("is-glaring");
    };

    const onTiltMove = (event: PointerEvent) => {
      if (event.pointerType === "touch" || reduce()) return;
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-tilt]") : null;
      if (target !== tiltElement) {
        resetTilt();
        tiltElement = target;
      }
      if (!target) return;
      const rect = target.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const explicitStrength = Number(target.dataset.tilt);
      const strength = Number.isFinite(explicitStrength) ? explicitStrength : 1;
      const nx = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width) * 2 - 1));
      const ny = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height) * 2 - 1));
      target.style.setProperty("--tilt-x", `${(-ny * 3.2 * strength).toFixed(2)}deg`);
      target.style.setProperty("--tilt-y", `${(nx * 4.4 * strength).toFixed(2)}deg`);
      target.style.setProperty("--tilt-lift", `${(-2.5 * strength).toFixed(2)}px`);
      target.classList.add("is-tilting");
    };

    const onPointerOut = (event: PointerEvent) => {
      const next = event.relatedTarget instanceof Element ? event.relatedTarget : null;
      if (tiltElement && (!next || !tiltElement.contains(next))) resetTilt();
      if (magnetElement && (!next || !magnetElement.contains(next))) resetMagnet();
      if (glareElement && (!next || !glareElement.contains(next))) resetGlare();
    };

    const parallax = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        if (reduce()) {
          document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((element) => element.style.removeProperty("--py"));
          resetTilt();
          resetMagnet();
          resetGlare();
          return;
        }
        const vh = window.innerHeight;
        document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((element) => {
          const rect = element.getBoundingClientRect();
          if (rect.bottom < -160 || rect.top > vh + 160) return;
          const speed = Number(element.dataset.parallax || 0.07);
          const offset = (rect.top + rect.height / 2 - vh / 2) * speed;
          element.style.setProperty("--py", `${offset.toFixed(1)}px`);
        });
      });
    };

    const onScroll = () => {
      const nav = document.querySelector(".nav");
      nav?.classList.toggle("is-scrolled", window.scrollY > 24);
      const bar = document.querySelector<HTMLElement>(".scroll-progress i");
      if (bar) {
        const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        bar.style.transform = `scaleX(${Math.max(0, Math.min(1, window.scrollY / max)).toFixed(4)})`;
      }
      parallax();
    };

    const refresh = () => {
      prepareMotionTargets();
      attachReveal();
      attachCounts();
      parallax();
      if (reduce()) {
        resetTilt();
        resetMagnet();
        resetGlare();
      }
    };

    refresh();
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", refresh);
    window.addEventListener("iif-motion", refresh);
    const onPointerMove = (event: PointerEvent) => {
      onTiltMove(event);
      onMagnetMove(event);
      onGlareMove(event);
    };
    const onBlur = () => {
      resetTilt();
      resetMagnet();
      resetGlare();
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerout", onPointerOut, { passive: true });
    window.addEventListener("blur", onBlur);
    const timer = window.setTimeout(refresh, 520);

    return () => {
      revealObserver?.disconnect();
      countObserver?.disconnect();
      cancelAnimationFrame(raf);
      countFrames.forEach((frame) => cancelAnimationFrame(frame));
      countFrames.clear();
      resetTilt();
      resetMagnet();
      resetGlare();
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", refresh);
      window.removeEventListener("iif-motion", refresh);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerout", onPointerOut);
      window.removeEventListener("blur", onBlur);
    };
  }, [pathname]);

  return null;
}
