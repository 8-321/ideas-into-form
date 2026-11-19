"use client";

import type { PointerEvent as ReactPointerEvent } from "react";
import { useLightbox, type LightboxItem } from "@/components/Lightbox";
import type { ImageAsset } from "@/content/works";

type Cover = Pick<ImageAsset, "key" | "src" | "thumb" | "width" | "height">;

export function CoverAtlas({
  covers,
  captions,
  gallery,
}: {
  covers: Cover[];
  captions: string[];
  gallery: LightboxItem[];
}) {
  const { open } = useLightbox();

  const setSpot = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--my", `${event.clientY - rect.top}px`);
    event.currentTarget.style.setProperty("--on", "1");
  };

  return (
    <div className="cover-strip" aria-label="五张封面">
      {covers.map((cover, index) => (
        <button
          type="button"
          className="cover-strip__tile"
          key={cover.key}
          onPointerMove={setSpot}
          onPointerEnter={setSpot}
          onPointerLeave={(event) => event.currentTarget.style.setProperty("--on", "0")}
          onFocus={(event) => event.currentTarget.style.setProperty("--on", "1")}
          onBlur={(event) => event.currentTarget.style.setProperty("--on", "0")}
          onClick={() => open(gallery, index)}
          aria-label={`打开封面 ${index + 1}：${captions[index]}`}
        >
          <img className="cover-strip__mono" src={cover.thumb} alt="" loading="lazy" decoding="async" />
          <img className="cover-strip__color" src={cover.thumb} alt="" loading="lazy" decoding="async" />
          <span className="cover-strip__no mono">{String(index + 1).padStart(2, "0")}</span>
          <span className="cover-strip__edge" aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}
