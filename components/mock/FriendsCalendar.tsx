"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import GigRow from "@/components/kit/GigRow";
import AvatarStack from "@/components/kit/AvatarStack";
import { gig, type DemoGig } from "@/lib/demo-gigs";
import { useInViewOnce } from "@/lib/motion";

/**
 * Feature 1 — "Bring your friends".
 *
 * A hand-built illustration of the copy: one chat bubble asking the copy's own
 * question, three "My Gigs" rows landing one by one with the friends who are
 * going, and a miniature Google Calendar week strip that the Drug Church gig
 * syncs into. Plays once when it scrolls into view (`.seq` / RevealObserver);
 * reduced motion and no-JS render the end state.
 */

/* ── Data: the shared demo gigs, in date order ───────────────────────── */
const ROWS: DemoGig[] = [gig("toothache"), gig("foe"), gig("drugchurch")];
const SYNCED_ID = "drugchurch";
const DAYS = ["M", "T", "W", "T", "F", "S", "S"];
const THURSDAY = 3;

/* ── Timeline (ms). Everything plays once; ≈2s end to end. ───────────── */
const T = {
  bubble: 0,
  rows: [300, 390, 480],
  linkLag: 120, // each row's dotted connector grows 120ms after the row
  avatarsFrom: 700, // avatars pop in reading order from here…
  avatarStep: 90, // …90ms apart
  dim: 800, // the bubble dims to 30%
  strip: 1300,
  event: 1450,
  synced: 1650,
};
const AVATAR_START = ROWS.reduce<number[]>((acc, g, i) => {
  acc.push(i === 0 ? T.avatarsFrom : acc[i - 1] + ROWS[i - 1].friends.length * T.avatarStep);
  return acc;
}, []);

/* ── Geometry ────────────────────────────────────────────────────────── */
const MAX_W = 430; // the rows' width on desktop
const STRIP_W = 300;
const GAP = 12; // between rows
const STRIP_GAP = 18; // rows → strip; the dotted link spans it
const SPREAD = 3; // avatar margin when a row is hovered / pressed
const AVATAR = 22; // GigRow's avatar size at scale 1
const MASK = 18; // GigRow fades the last 18px of its meta line

const delay = (ms: number): CSSProperties => ({ ["--d" as string]: `${ms}ms` });

/** GigRow scale: 1 from ~400px up, 0.92 in a 318px mobile column. */
const scaleFor = (w: number) => Math.min(1, Math.max(0.9, 0.92 + (w - 318) / 1025));

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

let ctx: CanvasRenderingContext2D | null | undefined;
function textWidth(font: string, text: string): number {
  if (ctx === undefined) ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) return text.length * 6.2;
  ctx.font = font;
  return ctx.measureText(text).width;
}

/** Width of a stack held open at its spread (hovered) state. */
const spreadWidth = (n: number, s: number) => n * AVATAR * s + (n - 1) * SPREAD;
/** Width of a stack as AvatarStack draws it, overlapping. */
const stackedWidth = (n: number, s: number) => {
  const size = AVATAR * s;
  return size + (n - 1) * (size - Math.round(size * 0.32));
};

interface RowFit {
  /** Show `· provider` after venue · time. */
  provider: boolean;
  /** Hold the stack at its spread width so hovering never shifts the text. */
  reserve: boolean;
}

/**
 * What fits on this row at this width, next to the avatars (and the tickets
 * chip), without running under GigRow's 18px fade mask. Measured with the real
 * font so it holds at any column width: the provider goes first, then the
 * reserved spread width.
 */
function fitRow(g: DemoGig, w: number, s: number, family: string): RowFit {
  const meta = `400 ${11.5 * s}px ${family}`;
  const part = (t: string) => 11 * s + 4 * s + textWidth(meta, t); // icon + gap + text
  const chip = g.id === SYNCED_ID ? textWidth(`600 ${11 * s}px ${family}`, "1×") + 14 * s + 14 * s : 0;
  const column = w - 2 * 16 * s - 40 * s - 2 * 14 * s - chip; // text column before the avatars
  const n = g.friends.length;
  const short = part(g.venue) + part(g.doors) + 8 * s;
  const full = short + part(g.provider) + 8 * s;
  const reserve = short <= column - spreadWidth(n, s) - MASK - 2;
  const avatars = reserve ? spreadWidth(n, s) : stackedWidth(n, s);
  return { provider: full <= column - avatars - MASK - 2, reserve };
}

const CSS = `
.fc-bubble{position:relative;display:inline-block;max-width:240px;padding:10px 14px;border-radius:18px 18px 4px 18px;background:#2c2c2e;color:rgba(255,255,255,.85);font-size:13px;line-height:1.3;letter-spacing:-.005em}
.fc-tail{position:absolute;right:-5px;bottom:0;display:block}
html:not(.js) .fc-dim{opacity:.3}
.js .seq.is-visible .seq-item.fc-link{animation-name:grow-y;animation-duration:250ms;transform-origin:top;opacity:1}
.fc-link{position:absolute;width:1px;background:repeating-linear-gradient(to bottom,rgba(255,255,255,.18) 0 2px,transparent 2px 5px);pointer-events:none}
.fc-row{display:block;width:100%;margin:0;padding:0;border:0;background:#1c1c1e;color:inherit;font:inherit;text-align:left;cursor:pointer;-webkit-tap-highlight-color:transparent}
.fc-row:focus-visible{outline:2px solid rgba(255,255,255,.35);outline-offset:2px}
.fc-av{transition:margin-left 220ms var(--ease-out)}
.fc-row[aria-pressed="true"] .fc-av+.fc-av{margin-left:${SPREAD}px!important}
@media (hover:hover){
  .fc-row:hover .fc-av+.fc-av{margin-left:${SPREAD}px!important}
  .fc-row:hover .fc-av{box-shadow:0 0 0 2px #232326!important}
}
.fc-strip{background:#1c1c1e;border-radius:16px;box-shadow:0 0 0 1px rgba(255,255,255,.08),0 24px 48px -16px rgba(0,0,0,.7);padding:12px}
.fc-col+.fc-col{border-left:1px solid rgba(255,255,255,.06)}
.fc-event{margin:6px 1px 0;padding:4px 2px 5px;border-radius:6px;background:#fff;color:#0a0a0a;font-size:10px;font-weight:600;line-height:1.2;letter-spacing:-.02em;text-align:center}
@media (prefers-reduced-motion:reduce){
  .js .seq .seq-item.seq-dim.fc-dim,.js .seq.is-visible .seq-item.seq-dim.fc-dim{opacity:.3}
  .fc-av{transition:none}
}
`;

function CalendarGlyph() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" strokeLinecap="round" aria-hidden="true">
      <rect x="1" y="2" width="10" height="9" rx="1.8" />
      <path d="M1 5h10M3.6 .9v2.2M8.4 .9v2.2" />
    </svg>
  );
}

function Tick() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1.5 5.5l2.4 2.4L8.5 2.8" />
    </svg>
  );
}

export interface FriendsCalendarProps {
  className?: string;
  style?: CSSProperties;
}

export default function FriendsCalendar({ className = "", style }: FriendsCalendarProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const seen = useInViewOnce(rootRef, 0.25);
  const [layout, setLayout] = useState<{ w: number; fits: RowFit[] } | null>(null);
  const [pressed, setPressed] = useState<boolean[]>(() => ROWS.map(() => false));

  // Start the sequence ourselves too, in case RevealObserver ran before we mounted.
  // The root's className never changes, so the class survives re-renders.
  useEffect(() => {
    if (seen) rootRef.current?.classList.add("is-visible");
  }, [seen]);

  // Measure the column once before paint, then on resize and once fonts are in.
  useIsoLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const apply = () => {
      const w = el.clientWidth;
      if (!w) return;
      const s = scaleFor(w);
      const family = getComputedStyle(el).fontFamily;
      const fits = ROWS.map((g) => fitRow(g, w, s, family));
      setLayout((prev) =>
        prev && prev.w === w && prev.fits.every((f, i) => f.provider === fits[i].provider && f.reserve === fits[i].reserve)
          ? prev
          : { w, fits }
      );
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    if (typeof document !== "undefined" && document.fonts?.ready) document.fonts.ready.then(apply);
    return () => ro.disconnect();
  }, []);

  const w = layout?.w ?? MAX_W;
  const fits = layout?.fits ?? ROWS.map((): RowFit => ({ provider: true, reserve: true }));
  const s = scaleFor(w);
  const rowH = 72 * s;
  const stripW = Math.min(STRIP_W, w);
  const stripLeft = w - stripW;

  return (
    <div
      ref={rootRef}
      className={`seq fc ${className}`}
      style={{ position: "relative", width: "100%", maxWidth: MAX_W, ...style }}
    >
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* 0 · the copy's own question, as a sent message. Lands first, dims once the answer arrives. */}
      <div className="seq-item" style={{ ...delay(T.bubble), display: "flex", justifyContent: "flex-end" }}>
        <div className="seq-item seq-dim fc-dim" style={{ ...delay(T.dim), display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
          <span className="fc-bubble">
            where did that ticket go??
            <svg className="fc-tail" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
              <path d="M0 0H7V5.5C7.4 9.5 9.2 11.6 12 12H0Z" fill="#2c2c2e" />
            </svg>
          </span>
          <span style={{ marginTop: 4, paddingRight: 4, fontSize: 10, color: "#636366", fontVariantNumeric: "tabular-nums" }}>09:12</span>
        </div>
      </div>

      {/* 1–3 · My Gigs rows, with the app's dotted connectors between date blocks. */}
      <div style={{ position: "relative", marginTop: 14 }}>
        {ROWS.map((g, i) => {
          const n = g.friends.length;
          return (
            <div key={g.id} className="seq-item" style={{ ...delay(T.rows[i]), marginTop: i ? GAP : 0 }}>
              <button
                type="button"
                className="fc-row inner-card"
                aria-pressed={pressed[i]}
                onClick={() => setPressed((p) => p.map((v, j) => (j === i ? !v : v)))}
                style={{ borderRadius: 18 * s }}
              >
                <GigRow
                  day={g.day}
                  month={g.month}
                  artist={g.artist}
                  venue={g.venue}
                  time={g.doors}
                  provider={fits[i].provider ? g.provider : undefined}
                  tickets={g.id === SYNCED_ID ? 1 : undefined}
                  scale={s}
                  style={{ background: "transparent" }}
                  trailing={
                    <AvatarStack
                      people={g.friends}
                      size={AVATAR * s}
                      ring="#1c1c1e"
                      style={{ width: fits[i].reserve ? spreadWidth(n, s) : undefined, justifyContent: "flex-end" }}
                      itemClassName="seq-item seq-pop fc-av"
                      delayStart={AVATAR_START[i]}
                      delayStep={T.avatarStep}
                    />
                  }
                />
                <span className="sr-only">, show who&apos;s going</span>
              </button>
            </div>
          );
        })}

        {/* Dotted connectors: between date blocks, then from the last row to the strip. */}
        {[0, 1].map((i) => (
          <span
            key={i}
            aria-hidden="true"
            className="seq-item fc-link"
            style={{ ...delay(T.rows[i] + T.linkLag), left: Math.round(36 * s) - 0.5, top: rowH * (i + 1) + GAP * i + 1, height: GAP - 2 }}
          />
        ))}
        {/* This one reaches down just before the strip rises to meet it, so it never dangles. */}
        <span
          aria-hidden="true"
          className="seq-item fc-link"
          style={{ ...delay(T.strip - T.linkLag), left: stripLeft + 18 - 0.5, top: "100%", height: STRIP_GAP }}
        />
      </div>

      {/* 4 · the Google Calendar week it syncs into — a plain glyph and the words, no brand colours. */}
      <div
        className="seq-item fc-strip"
        style={{ ...delay(T.strip), width: "100%", maxWidth: STRIP_W, marginTop: STRIP_GAP, marginLeft: "auto", position: "relative" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, lineHeight: "14px" }}>
          <CalendarGlyph />
          <span style={{ fontWeight: 600, color: "#fff", letterSpacing: "-0.01em" }}>Google Calendar</span>
          <span style={{ marginLeft: "auto", color: "#8e8e93", fontVariantNumeric: "tabular-nums" }}>Sep 7 – 13</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", height: 64, marginTop: 8 }}>
          {DAYS.map((d, i) => (
            <div key={i} className="fc-col" style={{ minWidth: 0 }}>
              <div style={{ textAlign: "center", fontSize: 10, fontWeight: 600, lineHeight: "12px", color: "#636366" }}>{d}</div>
              {i === THURSDAY && (
                <div className="seq-item seq-pop fc-event" style={{ ...delay(T.event), ["--dur" as string]: "320ms" }}>
                  <div>Drug Church</div>
                  <div style={{ marginTop: 1, fontWeight: 500, fontVariantNumeric: "tabular-nums", opacity: 0.7 }}>19:00</div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div
          className="seq-item seq-fade"
          style={{ ...delay(T.synced), ["--dur" as string]: "320ms", display: "flex", alignItems: "center", gap: 5, marginTop: 8, fontSize: 12, lineHeight: "14px", color: "#8e8e93" }}
        >
          <Tick />
          Synced · just now
        </div>
      </div>
    </div>
  );
}
