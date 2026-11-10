"use client";

import { useState, type PointerEvent as ReactPointerEvent } from "react";
import { ArrowUpRight } from "@/components/Icons";
import { useLightbox, type LightboxItem } from "@/components/Lightbox";
import { MediaImage } from "@/components/MediaImage";
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
  const [active, setActive] = useState(0);
  const { open } = useLightbox();
  const activeCaption = captions[active] ?? captions[0] ?? "";
  const activeTitle = activeCaption.split(" / ")[0];

  return (
    <>
      <div className="cover-atlas">
        <div className="cover-atlas__stage" data-tilt="0.6" data-glare>
          <div className="cover-atlas__frame">
            {covers.map((cover, index) => (
              <div
                className={`cover-atlas__layer${index === active ? " is-active" : ""}`}
                key={cover.key}
                aria-hidden={index !== active}
              >
                <MediaImage
                  asset={{ ...cover, thumb: cover.src }}
                  alt={`${captions[index]} 封面`}
                  caption={`${String(index + 1).padStart(2, "0")} / ${captions[index]} · 1:1`}
                  gallery={gallery}
                  index={index}
                  priority={index === 0}
                />
              </div>
            ))}
            <span className="cover-atlas__big display" aria-hidden="true">
              {String(active + 1).padStart(2, "0")}
            </span>
            <span className="cover-atlas__stamp mono">{active === 0 ? "LONG FORM" : "RED DUST NOTE"}</span>
          </div>
          <div className="cover-atlas__read mono">
            <span>COVER / {String(active + 1).padStart(2, "0")}</span>
            <span>{activeTitle}</span>
          </div>
        </div>

        <div className="cover-atlas__rail">
          <div className="cover-atlas__rail-head mono">
            <span>COVER SYSTEM / 05</span>
            <span>1:1</span>
          </div>
          {covers.map((cover, index) => (
            <button
              type="button"
              className={`cover-atlas__row${index === active ? " is-active" : ""}`}
              key={cover.key}
              onPointerEnter={() => setActive(index)}
              onFocus={() => setActive(index)}
              onClick={() => open(gallery, index)}
              aria-label={`打开封面 ${index + 1}：${captions[index]}`}
            >
              <span className="cover-atlas__no mono">{String(index + 1).padStart(2, "0")}</span>
              <span className="cover-atlas__thumb">
                <img src={cover.thumb} alt="" loading="lazy" decoding="async" />
              </span>
              <span className="cover-atlas__name serif">{captions[index].split(" / ")[0]}</span>
              <span className="cover-atlas__kind mono">{index === 0 ? "LONG FORM" : "NOTE"}</span>
              <ArrowUpRight size={12} />
            </button>
          ))}
          <p className="cover-atlas__foot mono">
            <span>ORIGINAL JPG</span>
            <span>NO CROP / NO FILTER</span>
          </p>
        </div>
      </div>

      <CoverStrip covers={covers} captions={captions} gallery={gallery} />
    </>
  );
}

function CoverStrip({
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
    <div className="cover-strip" aria-label="五张封面索引">
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