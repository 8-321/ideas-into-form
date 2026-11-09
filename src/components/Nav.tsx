"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useMotion } from "./MotionProvider";
import { TransitionLink } from "./TransitionLink";

const links = [
  { href: "/image/", no: "01", zh: "成象", en: "IMAGE" },
  { href: "/sound/", no: "02", zh: "成声", en: "SOUND" },
  { href: "/experience/", no: "03", zh: "成境", en: "EXPERIENCE" },
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
          <span>IDEAS INTO FORM.</span>
          <em>由意成形</em>
        </Link>
        <nav className="nav__links" aria-label="章节导航">
          {links.map((link) => (
            <TransitionLink key={link.href} href={link.href} className="nav__link" ariaLabel={`${link.no} ${link.zh} ${link.en}`}>
              <span>{link.no}</span>
              {link.zh}
            </TransitionLink>
          ))}
        </nav>
        <div className="nav__right">
          <button
            type="button"
            className="switch"
            aria-pressed={!reduced}
            onClick={() => setReduced(!reduced)}
            title={reduced ? "开启动效" : "减少动态效果"}
          >
            <span className="switch__track" aria-hidden="true" />
            <span className="switch__label">{reduced ? "MOTION OFF" : "MOTION ON"}</span>
          </button>
          <button type="button" className="menu-btn" aria-expanded={menuOpen} aria-controls="site-menu" onClick={() => setMenuOpen((value) => !value)}>
            {menuOpen ? "CLOSE" : "MENU"}<i aria-hidden="true" />
          </button>
        </div>
      </header>

      <div id="site-menu" className={`menu${menuOpen ? " is-open" : ""}`} aria-hidden={!menuOpen}>
        <div className="menu__list">
          <TransitionLink href="/" className="menu__item" ariaLabel="返回首页">
            <small>00</small>由意成形<em>Home</em>
          </TransitionLink>
          {links.map((link) => (
            <TransitionLink key={link.href} href={link.href} className="menu__item" ariaLabel={`${link.zh} ${link.en}`}>
              <small>{link.no}</small>{link.zh}<em>{link.en}</em>
            </TransitionLink>
          ))}
        </div>
        <div className="menu__foot mono">
          <span>PERSONAL PORTFOLIO / 2026</span>
          <span>IDEAS INTO FORM.</span>
        </div>
      </div>
    </>
  );
}