"use client";

import type { CSSProperties } from "react";
import { useLightbox, type LightboxItem } from "./Lightbox";
import type { ImageAsset } from "@/content/works";

export function MediaImage({
  asset,
  alt,
  caption,
  className = "",
  priority = false,
  badge,
  gallery,
  index = 0,
  ratio,
  contain = false,
}: {
  asset: Pick<ImageAsset, "src" | "thumb" | "width" | "height">;
  alt: string;
  caption?: string;
  className?: string;
  priority?: boolean;
  badge?: string;
  gallery?: LightboxItem[];
  index?: number;
  ratio?: number;
  contain?: boolean;
}) {
  const { open } = useLightbox();
  const item: LightboxItem = { src: asset.src, alt, caption: caption || alt };
  const aspect = ratio ?? asset.width / asset.height;
  return (
    <button
      type="button"
      className={`media-btn ${className}`}
      onClick={() => open(gallery?.length ? gallery : [item], gallery?.length ? index : 0)}
      aria-label={`放大查看：${alt}`}
    >
      <figure className={`media${contain ? " media--contain" : ""}`} style={{ aspectRatio: `${aspect}` } as CSSProperties}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={asset.thumb || asset.src}
          alt={alt}
          width={asset.width}
          height={asset.height}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
        />
        {badge ? <span className="media__badge">{badge}</span> : null}
      </figure>
    </button>
  );
}