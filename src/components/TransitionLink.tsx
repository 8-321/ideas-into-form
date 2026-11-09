"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { useTransition } from "./TransitionProvider";

export function TransitionLink({
  href,
  children,
  className,
  ariaLabel,
  style,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
  style?: CSSProperties;
}) {
  const go = useTransition();
  return (
    <Link
      href={href}
      className={className}
      aria-label={ariaLabel}
      style={style}
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
        event.preventDefault();
        go(href, event);
      }}
    >
      {children}
    </Link>
  );
}