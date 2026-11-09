"use client";

import { useEffect, useState } from "react";

export function ChapterNav({ items }: { items: { id: string; no: string; label: string }[] }) {
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const sections = items.map((item) => document.getElementById(item.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-28% 0px -58% 0px", threshold: [0, 0.1, 0.4] }
    );
    sections.forEach((section) => io.observe(section));
    return () => io.disconnect();
  }, [items]);

  return (
    <nav className="chapter-nav" aria-label="章节目录">
      <div className="wrap chapter-nav__inner">
        {items.map((item) => (
          <a key={item.id} href={`#${item.id}`} className={active === item.id ? "is-active" : ""} aria-current={active === item.id ? "true" : undefined}>
            {item.no} {item.label}
          </a>
        ))}
      </div>
    </nav>
  );
}