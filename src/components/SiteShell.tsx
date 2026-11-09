"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Footer } from "./Footer";
import { Nav } from "./Nav";

function themeFor(pathname: string) {
  if (pathname.startsWith("/sound") || pathname.startsWith("/work/audio")) return "sound";
  if (pathname.startsWith("/experience") || pathname.startsWith("/work/film")) return "experience";
  if (pathname.startsWith("/image") || pathname.startsWith("/work/")) return "image";
  return "home";
}

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const theme = themeFor(pathname);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <div className="site" data-theme={theme}>
      <a className="skip mono" href="#main">跳到主要内容</a>
      <Nav />
      <main id="main">{children}</main>
      <Footer />
    </div>
  );
}