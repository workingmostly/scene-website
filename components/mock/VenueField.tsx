"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { layoutVenues, type PlacedVenue } from "@/lib/venues";

/*
 * Venue pins: a 6px white dot at 70% with a 2px ring, and a caption to the
 * right. The live map (BristolMap) portals <PinBody> into mapbox Marker
 * elements that carry the `vp` class; the no-token fallback below positions
 * <VenuePin> itself. Both share this stylesheet, so they switch on the same way:
 *   - `[data-active]` on an ancestor starts the sequence, once;
 *   - each pin's `--d` is its stagger (centre-outwards, 40ms apart);
 *   - dots pop 0→1 over 400ms (ease-spring), captions fade in 160ms later,
 *     and the five labelled venues get one 900ms 1px ring expansion;
 *   - unlabelled pins show their name on hover (desktop pointers only);
 *   - reduced motion renders everything in its end state, no ring.
 */
export const VENUE_PIN_CSS = `
.vp{position:absolute;width:20px;height:20px;pointer-events:auto}
.vp--abs{margin:-10px 0 0 -10px}
.vp-dot{position:absolute;left:7px;top:7px;width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.7);box-shadow:0 0 0 2px rgba(255,255,255,.08);opacity:0;transform:scale(0)}
.vp-name{position:absolute;left:21px;top:4px;white-space:nowrap;font:500 11px/12px var(--font-inter),ui-sans-serif,system-ui,sans-serif;color:rgba(255,255,255,.75);text-shadow:0 1px 2px #000;opacity:0;pointer-events:none;transition:opacity 160ms var(--ease-out)}
.vp[data-label]::after{content:"";position:absolute;left:50%;top:50%;width:32px;height:32px;margin:-16px 0 0 -16px;border-radius:50%;border:1px solid #fff;opacity:0;transform:scale(.4);pointer-events:none}
[data-active] .vp-dot{animation:vp-on 400ms var(--ease-spring) var(--d,0ms) forwards}
[data-active] .vp[data-label] .vp-name{animation:vp-fade 400ms var(--ease-out) calc(var(--d,0ms) + 160ms) forwards}
[data-active] .vp[data-label]::after{animation:vp-ping 900ms var(--ease-out) calc(var(--d,0ms) + 200ms) forwards}
@media (hover:hover) and (pointer:fine){.vp:not([data-label]):hover .vp-name{opacity:1}}
@media (max-width:639px){.vp-name{display:none}}
@keyframes vp-on{from{opacity:0;transform:scale(0)}to{opacity:1;transform:none}}
@keyframes vp-fade{from{opacity:0}to{opacity:1}}
@keyframes vp-ping{from{opacity:.5;transform:scale(.4)}to{opacity:0;transform:scale(1)}}
@media (prefers-reduced-motion:reduce){
.vp-dot,.vp[data-label] .vp-name{opacity:1;transform:none;animation:none!important}
.vp[data-label]::after{display:none}
.vp-name{transition:none}
}
`;

/** The shared pin stylesheet. Render once per map/fallback layer. */
export function VenuePinStyle() {
  return <style dangerouslySetInnerHTML={{ __html: VENUE_PIN_CSS }} />;
}

/** Dot + caption. Lives inside an element with the `vp` class (and `data-label` for captioned venues). */
export function PinBody({ name }: { name: string }) {
  return (
    <>
      <span className="vp-dot" />
      <span className="vp-name">{name}</span>
    </>
  );
}

/** A pin positioned absolutely at (x, y) px inside the fallback field. */
export function VenuePin({ venue, x, y, delay }: PlacedVenue) {
  const style = { left: x, top: y, "--d": `${delay}ms` } as CSSProperties;
  return (
    <div className="vp vp--abs" data-label={venue.label ? "" : undefined} style={style}>
      <PinBody name={venue.name} />
    </div>
  );
}

/**
 * Tiny print in the card's bottom-left corner. Positioned for the CTA card:
 * 40px / 28px from the edges on desktop, 24px / 20px on mobile.
 */
export function VenueCornerMark({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute bottom-5 left-6 select-none sm:bottom-7 sm:left-10 ${className}`}
    >
      <div style={{ fontSize: 10, lineHeight: "12px", fontWeight: 600, letterSpacing: "0.18em", color: "#636366" }}>
        BRISTOL
      </div>
      <div className="font-mono" style={{ fontSize: 10, lineHeight: "12px", color: "#48484A", marginTop: 3 }}>
        51.45° N · 2.59° W
      </div>
    </div>
  );
}

export type VenueFieldProps = {
  /** Switch the pins on (once). Defaults to true. */
  active?: boolean;
  /** Draw the pins. Default true. */
  showPins?: boolean;
  /** Render the corner mark. Default true. */
  cornerMark?: boolean;
  className?: string;
};

/**
 * The venues without a map: the same pins, projected equirectangularly into
 * this layer's box with `fitPadding` margins, so the CTA card never looks
 * empty when there is no Mapbox token (or the map fails to load).
 * Absolutely positioned to fill its parent; put it behind the card content.
 */
export default function VenueField({ active = true, showPins = true, cornerMark = true, className = "" }: VenueFieldProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [lit, setLit] = useState(false);

  // Once on, stays on.
  useEffect(() => {
    if (active) setLit(true);
  }, [active]);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      setSize((s) => (s.w === w && s.h === h ? s : { w, h }));
    };
    measure();
    if (!("ResizeObserver" in window)) return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const placed = showPins && size.w > 0 && size.h > 0 ? layoutVenues(size.w, size.h) : [];

  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-active={lit ? "" : undefined}
      className={className}
      style={{ position: "absolute", inset: 0, zIndex: 0, overflow: "hidden" }}
    >
      <VenuePinStyle />
      {placed.map((p) => (
        <VenuePin key={p.venue.name} {...p} />
      ))}
      {cornerMark && <VenueCornerMark />}
    </div>
  );
}
