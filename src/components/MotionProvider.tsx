"use client";

import { createContext, useContext, useEffect, useState } from "react";

type MotionCtx = { reduced: boolean; setReduced: (value: boolean) => void };
const Ctx = createContext<MotionCtx>({ reduced: false, setReduced: () => {} });

export function MotionProvider({ children }: { children: React.ReactNode }) {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("iif-motion");
    const prefers = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduced(stored === "off" || (stored === null && prefers));
  }, []);

  useEffect(() => {
    document.documentElement.dataset.reduce = reduced ? "true" : "false";
    window.localStorage.setItem("iif-motion", reduced ? "off" : "on");
    window.dispatchEvent(new Event("iif-motion"));
  }, [reduced]);

  return <Ctx.Provider value={{ reduced, setReduced }}>{children}</Ctx.Provider>;
}

export const useMotion = () => useContext(Ctx);