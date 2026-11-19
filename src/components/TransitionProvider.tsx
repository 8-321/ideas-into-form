"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useMotion } from "./MotionProvider";

type Go = (href: string, event?: { clientX: number; clientY: number } | React.MouseEvent) => void;
const Ctx = createContext<Go>(() => {});

const colorFor = (href: string) => {
  if (href.startsWith("/sound")) return "#b89a66";
  if (href.startsWith("/experience")) return "#9aabb2";
  if (href.startsWith("/work/audio")) return "#b89a66";
  if (href.startsWith("/work/film")) return "#9aabb2";
  if (href.startsWith("/work/")) return "#d8d1c2";
  if (href.startsWith("/image")) return "#cbbfa8";
  return "#f0ece3";
};

export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { reduced } = useMotion();
  const [on, setOn] = useState(false);
  const [color, setColor] = useState("#f4f2ec");
  const [point, setPoint] = useState({ x: "50%", y: "50%" });
  const pending = useRef<string | null>(null);
  const timer = useRef<number | null>(null);

  const go = useCallback<Go>(
    (href, event) => {
      if (!href || href === pathname) return;
      if (reduced) {
        router.push(href);
        return;
      }
      const e = event as MouseEvent | undefined;
      const x = e?.clientX ?? window.innerWidth / 2;
      const y = e?.clientY ?? window.innerHeight / 2;
      setPoint({ x: `${x}px`, y: `${y}px` });
      setColor(colorFor(href));
      setOn(true);
      pending.current = href;
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => router.push(href), 520);
    },
    [pathname, reduced, router]
  );

  useEffect(() => {
    if (!on || !pending.current) return;
    if (pathname === pending.current || pathname === pending.current.replace(/\/$/, "")) {
      const t = window.setTimeout(() => {
        setOn(false);
        pending.current = null;
      }, 120);
      return () => window.clearTimeout(t);
    }
  }, [pathname, on]);

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  return (
    <Ctx.Provider value={go}>
      {children}
      <div
        className={`page-transition${on ? " is-on" : ""}`}
        style={{ "--tx": point.x, "--ty": point.y, "--tr-color": color } as React.CSSProperties}
        aria-hidden="true"
      >
        <span className="page-transition__mark">由意成形</span>
      </div>
    </Ctx.Provider>
  );
}

export const useTransition = () => useContext(Ctx);
