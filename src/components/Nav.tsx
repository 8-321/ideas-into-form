"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useMotion } from "./MotionProvider";
import { TransitionLink } from "./TransitionLink";

const links = [
  { href: "/image/", zh: "成象" },
  { href: "/sound/", zh: "成声" },
  { href: "/experience/", zh: "成境" },
];

export function Nav() {
  const pathname = usePathname();
  const { reduced, setReduced } = useMotion();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => { setMenuOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isActive = (href: string) => {
    if (href === "/image/") return pathname.startsWith("/image") || (pathname.startsWith("/work/") && !pathname.startsWith("/work/audio") && !pathname.startsWith("/work/film"));
    if (href === "/sound/") return pathname.startsWith("/sound") || pathname.startsWith("/work/audio");
    if (href === "/experience/") return pathname.startsWith("/experience") || pathname.startsWith("/work/film");
    return false;
  };

  return (
    <>
      <header className="nav">
        <Link href="/" className="nav__brand" aria-label="由意成形 首页">
          <span className="mark" aria-hidden="true" />
          <span>由意成形</span>
        </Link>
        <nav className="nav__links" aria-label="章节导航">
          {links.map((link) => (
            <TransitionLink
              key={link.href}
              href={link.href}
              className="nav__link"
              ariaLabel={link.zh}
              aria-current={isActive(link.href) ? "page" : undefined}
            >
              {link.zh}
            </TransitionLink>
          ))}
        </nav>
        <div className="nav__right">
          <button
            type="button"
            className="switch"
            aria-pressed={!reduced}
            aria-label={reduced ? "开启动效" : "关闭动效"}
            onClick={() => setReduced(!reduced)}
            title={reduced ? "开启动效" : "关闭动效"}
          >
            <span className="switch__track" aria-hidden="true" />
            <span className="switch__label">动效 · {reduced ? "关" : "开"}</span>
          </button>
          <button type="button" className="menu-btn" aria-expanded={menuOpen} aria-controls="site-menu" onClick={() => setMenuOpen((value) => !value)}>
            {menuOpen ? "关闭" : "目录"}<i aria-hidden="true" />
          </button>
        </div>
      </header>

      <div id="site-menu" className={`menu${menuOpen ? " is-open" : ""}`} aria-hidden={!menuOpen}>
        <div className="menu__list">
          <TransitionLink href="/" className="menu__item" ariaLabel="返回首页">首页</TransitionLink>
          {links.map((link) => (
            <TransitionLink key={link.href} href={link.href} className="menu__item" ariaLabel={link.zh}>
              {link.zh}
            </TransitionLink>
          ))}
        </div>
        <div className="menu__foot mono">
          <span>个人作品集 · 2026</span>
          <span>由意成形</span>
        </div>
      </div>
    </>
  );
}
