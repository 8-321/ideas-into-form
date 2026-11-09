"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Close, Expand } from "./Icons";
import { useMotion } from "./MotionProvider";

type LeafMeta = {
  id: string;
  label: string;
  type: string;
  index: string;
};

const pad = (value: number) => String(value).padStart(2, "0");
const clampIndex = (value: number, max: number) => Math.max(0, Math.min(max, value));

const TYPE_LABEL: Record<string, string> = {
  text: "文本",
  steps: "过程",
  gallery: "图像",
  note: "说明",
  placeholder: "待补",
  audio: "声音",
  film: "影像",
};

export function WorkBook({
  children,
  title,
  no,
}: {
  children: ReactNode;
  title: string;
  no: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const readerRef = useRef<HTMLDivElement>(null);
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);
  const busyRef = useRef(false);
  const activeRef = useRef(0);
  const previousRef = useRef(-1);
  const directionRef = useRef(1);
  const [leaves, setLeaves] = useState<LeafMeta[]>([]);
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const [tocOpen, setTocOpen] = useState(false);
  const { reduced } = useMotion();

  const getLeaves = useCallback(() => {
    const root = rootRef.current;
    if (!root) return [];
    return Array.from(root.querySelectorAll<HTMLElement>("[data-leaf]"));
  }, []);

  useEffect(() => {
    const nodes = getLeaves();
    const meta = nodes.map((node, index) => {
      if (!node.id) node.id = `book-leaf-${index + 1}`;
      const leaf = {
        id: node.id,
        label: node.dataset.leafLabel || "Untitled",
        type: node.dataset.leafType || "text",
        index: node.dataset.leafIndex || pad(index + 1),
      };
      node.setAttribute("aria-label", `第 ${index + 1} 页：${leaf.label}`);
      return leaf;
    });
    setLeaves(meta);
  }, [getLeaves]);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    const nodes = getLeaves();
    if (!nodes.length) return;
    if (reduced) {
      nodes.forEach((node) => node.classList.add("is-leaf-in"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-leaf-in");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "-10% 0px -10% 0px", threshold: 0.06 }
    );
    nodes.forEach((node) => {
      const rect = node.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.94) node.classList.add("is-leaf-in");
      else observer.observe(node);
    });
    return () => observer.disconnect();
  }, [getLeaves, leaves.length, reduced]);

  useEffect(() => {
    if (open) return;
    const onScroll = () => {
      const nodes = getLeaves();
      if (!nodes.length) return;
      let current = 0;
      nodes.forEach((node, index) => {
        if (node.getBoundingClientRect().top <= window.innerHeight * 0.42) current = index;
      });
      setActive((value) => (value === current ? value : current));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [getLeaves, leaves.length, open]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    root.classList.toggle("is-reader", open);
    document.body.classList.toggle("reader-open", open);
    const aux = Array.from(document.querySelectorAll<HTMLElement>(".work-hero, .work-cover, .work-end, .footer, .book-intro, .book-toolbar"));
    aux.forEach((element) => {
      if (open) {
        element.setAttribute("inert", "");
        element.setAttribute("aria-hidden", "true");
      } else {
        element.removeAttribute("inert");
        element.removeAttribute("aria-hidden");
      }
    });
    if (open) {
      root.querySelectorAll<HTMLElement>("[data-reveal]").forEach((element) => element.classList.add("is-in"));
      window.setTimeout(() => readerRef.current?.focus({ preventScroll: true }), 60);
    } else {
      previousRef.current = -1;
      const trigger = lastTriggerRef.current;
      if (trigger) window.setTimeout(() => trigger.focus({ preventScroll: true }), 50);
    }
    return () => {
      document.body.classList.remove("reader-open");
      root.classList.remove("is-reader");
      aux.forEach((element) => {
        element.removeAttribute("inert");
        element.removeAttribute("aria-hidden");
      });
    };
  }, [open]);

  useEffect(() => {
    const nodes = getLeaves();
    if (!open) {
      nodes.forEach((node) => {
        node.classList.remove("is-reader-active", "is-reader-in", "is-reader-out");
        node.removeAttribute("inert");
        node.removeAttribute("aria-hidden");
      });
      previousRef.current = -1;
      return;
    }
    const previous = previousRef.current;
    const directionClass = directionRef.current >= 0 ? "is-reader-next" : "is-reader-prev";
    nodes.forEach((node, index) => {
      const current = index === active;
      node.classList.toggle("is-reader-active", current);
      node.classList.remove("is-reader-in", "is-reader-out", "is-reader-next", "is-reader-prev");
      node.querySelectorAll<HTMLMediaElement>("audio, video").forEach((media) => {
        if (!current) media.pause();
      });
      if (current) {
        node.removeAttribute("inert");
        node.removeAttribute("aria-hidden");
        node.classList.add(directionClass);
        node.scrollTop = 0;
        node.querySelectorAll<HTMLElement>(
          ".work-gallery__item, .work-strip__item, .work-steps__list li, .tracklist li, .issue, .work-placeholder__slot, .work-note__inner > *, .work-audio .work-section__head > *"
        ).forEach((item, itemIndex) => {
          item.style.setProperty("--leaf-order", String(itemIndex));
        });
      } else {
        node.setAttribute("inert", "");
        node.setAttribute("aria-hidden", "true");
      }
      if (index === previous && !current) {
        node.classList.add("is-reader-out", directionClass);
        window.setTimeout(() => node.classList.remove("is-reader-out", "is-reader-next", "is-reader-prev"), 860);
      }
    });
    const next = nodes[active];
    if (next) {
      void next.offsetWidth;
      next.classList.add("is-reader-in");
    }
    previousRef.current = active;
  }, [active, getLeaves, open]);

  const turn = useCallback(
    (direction: number) => {
      if (!open || busyRef.current) return;
      const next = clampIndex(activeRef.current + direction, leaves.length - 1);
      if (next === activeRef.current) return;
      directionRef.current = direction >= 0 ? 1 : -1;
      busyRef.current = true;
      setActive(next);
      window.setTimeout(() => {
        busyRef.current = false;
      }, 900);
    },
    [leaves.length, open]
  );

  const goTo = useCallback(
    (index: number) => {
      const next = clampIndex(index, Math.max(0, leaves.length - 1));
      setTocOpen(false);
      if (!open) {
        setActive(next);
        getLeaves()[next]?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
        return;
      }
      if (busyRef.current) return;
      if (next === activeRef.current) return;
      directionRef.current = next >= activeRef.current ? 1 : -1;
      busyRef.current = true;
      setActive(next);
      window.setTimeout(() => {
        busyRef.current = false;
      }, 900);
    },
    [getLeaves, leaves.length, open, reduced]
  );

  const openReader = (index: number, trigger: HTMLButtonElement) => {
    lastTriggerRef.current = trigger;
    previousRef.current = -1;
    directionRef.current = 1;
    setTocOpen(false);
    setActive(clampIndex(index, Math.max(0, leaves.length - 1)));
    setOpen(true);
  };

  const closeReader = () => {
    setTocOpen(false);
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (event.key === "Escape") {
        event.preventDefault();
        if (tocOpen) setTocOpen(false);
        else closeReader();
        return;
      }
      if (event.key === "ArrowRight" || event.key === "PageDown") {
        event.preventDefault();
        turn(1);
      }
      if (event.key === "ArrowLeft" || event.key === "PageUp") {
        event.preventDefault();
        turn(-1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, tocOpen, turn]);

  useEffect(() => {
    if (!open) return;
    const node = getLeaves()[active];
    if (!node) return;
    let wheelLock = false;
    const atBottom = () => node.scrollHeight - node.scrollTop - node.clientHeight <= 4;
    const atTop = () => node.scrollTop <= 4;
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) < 8) return;
      if (event.deltaY > 0 && atBottom()) {
        event.preventDefault();
        if (wheelLock) return;
        wheelLock = true;
        turn(1);
        window.setTimeout(() => { wheelLock = false; }, 520);
      } else if (event.deltaY < 0 && atTop()) {
        event.preventDefault();
        if (wheelLock) return;
        wheelLock = true;
        turn(-1);
        window.setTimeout(() => { wheelLock = false; }, 520);
      }
    };
    let startX = 0;
    let startY = 0;
    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) return;
      startX = event.touches[0].clientX;
      startY = event.touches[0].clientY;
    };
    const onTouchEnd = (event: TouchEvent) => {
      const touch = event.changedTouches[0];
      if (!touch) return;
      const deltaX = startX - touch.clientX;
      const deltaY = startY - touch.clientY;
      if (Math.abs(deltaY) < 54 || Math.abs(deltaX) > Math.abs(deltaY)) return;
      if (deltaY > 0 && atBottom()) turn(1);
      if (deltaY < 0 && atTop()) turn(-1);
    };
    node.addEventListener("wheel", onWheel, { passive: false });
    node.addEventListener("touchstart", onTouchStart, { passive: true });
    node.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      node.removeEventListener("wheel", onWheel);
      node.removeEventListener("touchstart", onTouchStart);
      node.removeEventListener("touchend", onTouchEnd);
    };
  }, [active, getLeaves, open, turn]);

  const current = leaves[active];
  const progress = leaves.length ? (active + 1) / leaves.length : 0;

  return (
    <div className={`work-book${open ? " is-reader" : ""}`} ref={rootRef}>
      <section className="book-intro" aria-label="翻页阅读入口">
        <div className="book-intro__copy">
          <span className="mono">READING EDITION / 阅读版</span>
          <p className="serif">
            把项目当作一本书来读。
            <em>全书 {pad(leaves.length)} 页，滚轮、方向键或按钮都可以翻页。</em>
          </p>
        </div>
        <button
          type="button"
          className="book-intro__launch"
          onClick={(event) => openReader(0, event.currentTarget)}
          data-cursor-label="READ"
        >
          <span className="mono">BOOK MODE</span>
          <b className="serif">开始翻页</b>
          <ArrowRight size={18} />
        </button>
      </section>

      <div className="book-toolbar">
        <div className="book-toolbar__id">
          <span className="mono">READING COPY / 阅读版</span>
          <b className="serif">{no} / {title}</b>
        </div>
        <div className="book-toolbar__count mono" aria-live="polite">
          <span>{pad(active + 1)}</span>
          <i aria-hidden="true" />
          <span>{pad(leaves.length)}</span>
        </div>
        <div className="book-toolbar__actions">
          <button
            type="button"
            className="book-toolbar__toc"
            aria-expanded={tocOpen}
            onClick={() => setTocOpen((value) => !value)}
            data-cursor-label="INDEX"
          >
            全书目录
          </button>
          <button
            type="button"
            className="book-launch"
            onClick={(event) => openReader(active, event.currentTarget)}
            data-cursor-label="READ"
          >
            <span>从当前页继续</span>
            <Expand size={15} />
          </button>
        </div>
      </div>

      <div className="work-book__pages">{children}</div>

      {tocOpen ? (
        <div className="book-toc" role="dialog" aria-label="全书目录">
          <div className="book-toc__head">
            <span className="mono">CONTENTS / 全书目录</span>
            <button type="button" onClick={() => setTocOpen(false)} aria-label="关闭全书目录" data-cursor-label="CLOSE">
              <Close size={14} />
            </button>
          </div>
          <div className="book-toc__list">
            {leaves.map((leaf, index) => (
              <button
                type="button"
                key={leaf.id}
                className={index === active ? "is-active" : ""}
                onClick={() => goTo(index)}
                data-cursor-label="GO"
              >
                <span className="book-toc__no mono">{leaf.index}</span>
                <b className="serif">{leaf.label}</b>
                <em className="mono">{TYPE_LABEL[leaf.type] || leaf.type}</em>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {open ? (
        <div className="book-reader__layer" ref={readerRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label={`${title} 翻页阅读`}>
          <div className="book-reader__scrim" aria-hidden="true" />
          <header className="book-reader__bar">
            <div className="book-reader__id">
              <span className="mono">BOOK MODE / 翻页阅读</span>
              <b className="serif">{no} / {title}</b>
            </div>
            <div className="book-reader__meta" aria-live="polite">
              <span className="mono">{current?.index || "01"} / {pad(leaves.length)}</span>
              <b className="serif">{current?.label || title}</b>
            </div>
            <div className="book-reader__actions">
              <button
                type="button"
                className="book-reader__toc"
                aria-expanded={tocOpen}
                onClick={() => setTocOpen((value) => !value)}
                data-cursor-label="INDEX"
              >
                目录
              </button>
              <button type="button" className="book-reader__close" onClick={closeReader} aria-label="关闭翻页阅读" data-cursor-label="CLOSE">
                <Close size={17} />
              </button>
            </div>
          </header>

          <footer className="book-reader__foot">
            <button type="button" onClick={() => turn(-1)} disabled={active <= 0} data-cursor-label="PREV">
              <ChevronLeft size={16} />
              <span>上一页</span>
            </button>
            <div className="book-reader__progress" aria-hidden="true">
              <span className="mono">{pad(active + 1)}</span>
              <i><b style={{ transform: `scaleX(${progress})` }} /></i>
              <span className="mono">{pad(leaves.length)}</span>
            </div>
            <button type="button" onClick={() => turn(1)} disabled={active >= leaves.length - 1} data-cursor-label="NEXT">
              <span>下一页</span>
              <ChevronRight size={16} />
            </button>
          </footer>
        </div>
      ) : null}
    </div>
  );
}
