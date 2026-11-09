"use client";

import Link from "next/link";
import type { AnchorHTMLAttributes, CSSProperties, ReactNode } from "react";
import { useTransition } from "./TransitionProvider";

type TransitionLinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "href" | "className" | "style" | "aria-label" | "children"
> & {
  href: string;
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
  style?: CSSProperties;
};

export function TransitionLink({
  href,
  children,
  className,
  ariaLabel,
  style,
  onClick,
  ...rest
}: TransitionLinkProps) {
  const go = useTransition();
  return (
    <Link
      {...rest}
      href={href}
      className={className}
      aria-label={ariaLabel}
      style={style}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
        event.preventDefault();
        go(href, event);
      }}
    >
      {children}
    </Link>
  );
}
