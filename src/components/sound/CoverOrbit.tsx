"use client";

import type { CSSProperties } from "react";
import { useLightbox, type LightboxItem } from "@/components/Lightbox";
import type { ImageAsset } from "@/content/works";

type Cover = Pick<ImageAsset, "key" | "src" | "thumb" | "width" | "height">;

export function CoverOrbit({
  covers,
  captions,
  gallery,
}: {
  covers: Cover[];
  captions: string[];
  gallery: LightboxItem[];
}) {
  const { open } = useLightbox();

  return (
    <div className="sound-orbit" data-cursor-label="COVERS">
      <div className="sound-statement__rings" aria-hidden="true">
        <span /><span /><span />
      </div>

      <div className="sound-orbit__ring">
        {covers.map((cover, index) => {
          const label = captions[index] ?? `封面 ${index + 1}`;
          return (
            <button
              type="button"
              className="sound-orbit__item"
              key={cover.key}
              style={{ "--a": `${index * (360 / covers.length)}deg` } as CSSProperties}
              onClick={() => open(gallery, index)}
              aria-label={`打开封面 ${index + 1}：${label}`}
            >
              <span className="sound-orbit__upright">
                <span className="sound-orbit__spin">
                  <img src={cover.thumb} alt="" loading="lazy" decoding="async" />
                  <span className="sound-orbit__no mono">{String(index + 1).padStart(2, "0")}</span>
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <span className="sound-orbit__core mono" aria-hidden="true">SOUND<br />02</span>
    </div>
  );
}