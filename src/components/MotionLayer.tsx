"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function MotionLayer() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const reduce = () => root.dataset.reduce === "true";
    let io: IntersectionObserver | null = null;
    let raf = 0;

    const attachReveal = () => {
      io?.disconnect();
      const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal], .stagger"));
      if (reduce()) {
        nodes.forEach((node) => node.classList.add("is-in"));
        return;
      }
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-in");
              io?.unobserve(entry.target);
            }
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
      );
      nodes.forEach((node) => {
        const rect = node.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.92) node.classList.add("is-in");
        else io?.observe(node);
      });
    };

    const parallax = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        if (reduce()) {
          document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => el.style.removeProperty("--py"));
          return;
        }
        const vh = window.innerHeight;
        document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
          const rect = el.getBoundingClientRect();
          if (rect.bottom < -160 || rect.top > vh + 160) return;
          const speed = Number(el.dataset.parallax || 0.07);
          const offset = (rect.top + rect.height / 2 - vh / 2) * speed;
          el.style.setProperty("--py", `${offset.toFixed(1)}px`);
        });
      });
    };

    const onScroll = () => {
      const nav = document.querySelector(".nav");
      nav?.classList.toggle("is-scrolled", window.scrollY > 24);
      parallax();
    };

    const refresh = () => {
      attachReveal();
      parallax();
    };

    refresh();
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", refresh);
    window.addEventListener("iif-motion", refresh);
    const timer = window.setTimeout(refresh, 450);

    return () => {
      io?.disconnect();
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", refresh);
      window.removeEventListener("iif-motion", refresh);
    };
  }, [pathname]);

  return null;
}