"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import GigStub from "@/components/GigStub";
import RatingHistogram from "@/components/RatingHistogram";
import Stars from "@/components/kit/Stars";
import { gig, type DemoGig } from "@/lib/demo-gigs";
import { useInViewOnce, useReducedMotion } from "@/lib/motion";
import type { SceneGig } from "@/lib/types";

/**
 * Feature 3 illustration: the public gig passport in miniature.
 *
 * ourscene.uk/will's URL pill and share button, the rating histogram, a pile
 * of three ticket stubs (the newest, Drug Church at Trinity, on top and not
 * yet rated) and a nudge. Once the column is ≥35% in view, four gold stars
 * stamp themselves onto the top stub, the stub presses down under them, and
 * the histogram's ★4 column grows to count it. The stars are a real
 * radiogroup: hover previews, a click re-rates, and the histogram follows.
 *
 * Timeline (ms after the column is ≥35% in view; the CSS `seq` reveal of the
 * pill, the histogram card, the stubs and the caption starts a beat earlier,
 * when 5% is in view, as every `.seq` does):
 *   +350   histogram bars grow from the baseline (★3: 1, ★5: 5)
 *   1400   stars 1–4 stamp in 40ms apart (220ms each); "How was it?" fades out
 *   1490   the stub presses down 1px for 120ms
 *   1650   star 4 lands: the ★4 bar grows 0→1 and its count fades in
 *   1840   done: stagger off, the stars are the visitor's
 * Rating before 1400ms skips the script; it never runs twice.
 */

type Star = 1 | 2 | 3 | 4 | 5;
type Distribution = Record<Star, number>;

/** The example profile's ratings before the top stub is rated (the app's own numbers). */
const BASE: Distribution = { 1: 0, 2: 0, 3: 1, 4: 0, 5: 5 };
const EMPTY: Distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

const CARD = "#121214"; // the section card the illustration sits on

/** The card colour as it must be painted under a brightness() filter to still read as the card. */
function notchFor(brightness: number): string {
  if (brightness >= 1) return CARD;
  return `#${[0x12, 0x12, 0x14].map((v) => Math.min(255, Math.round(v / brightness)).toString(16).padStart(2, "0")).join("")}`;
}
const SCRIPT_RATING: Star = 4;
const T_BARS = 350;
const T_STAMP = 1400;
const STAR_STEP = 40;
const STAR_LAND = 130; // stamp-in meets the paper at 60% of its 220ms
const STAR_DUR = 220;
const PRESS_AT = 90;
const PRESS_FOR = 120;

/** The pile, back to front. */
const PILE: {
  id: string;
  rating?: number;
  transform?: string;
  brightness: number;
  delay: number;
}[] = [
  { id: "foe", rating: 4, transform: "translate(6px, -22px) rotate(3deg)", brightness: 0.86, delay: 280 },
  { id: "toothache", rating: 5, transform: "translate(-4px, -11px) rotate(-2deg)", brightness: 0.93, delay: 370 },
  { id: "drugchurch", brightness: 1, delay: 460 },
];
const TOP = "drugchurch";

/** GigStub formats an ISO date itself; the demo gigs carry yyyymmdd. */
function toSceneGig(g: DemoGig, rating?: number): SceneGig {
  const s = String(g.sort);
  return { id: g.id, artist: g.artist, venue: g.venue, date: `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`, rating };
}

const CSS = `
.stubs-root { width: 100%; max-width: 360px; margin: 0 auto; container-type: inline-size; }
.stubs-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
.stubs-url {
  display: inline-flex; align-items: center; gap: 6px; height: 28px; padding: 0 12px 0 10px;
  border-radius: 999px; background: #121214; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.08);
  font-size: 12px; line-height: 1; color: #8e8e93; white-space: nowrap;
}
.stubs-share {
  width: 28px; height: 28px; border-radius: 999px; background: #1c1c1e; color: #fff;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.08);
  display: inline-flex; align-items: center; justify-content: center;
}
.stubs-histo { background: #1c1c1e; border-radius: 16px; padding: 12px; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.08); }

/* The pile: three stubs on top of each other, the back two peeking out. */
.stubs-pile { position: relative; width: 100%; height: 136px; margin: 56px auto 0; }
.stubs-slot { position: absolute; left: 0; right: 0; top: 0; }
.stubs-lift { transition: transform 160ms var(--ease-out); }
@media (hover: hover) {
  .stubs-slot:hover .stubs-lift { transform: translateY(-2px); }
}
.stubs-top { border-radius: 16px; box-shadow: 0 24px 48px -16px rgba(0,0,0,0.7); transition: transform 60ms var(--ease-out); }

/* The rating cluster at the end of the date row: the nudge, then the stars. */
.stubs-rate { position: relative; display: inline-flex; align-items: center; margin-left: auto; }
.stubs-ask {
  font-size: 9px; line-height: 1; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: #636366;
  margin-right: 6px; white-space: nowrap; transition: opacity 320ms var(--ease-out);
}
/* Narrow columns (mobile): the date line has no room for the nudge, so it sits above the stars. */
@container (max-width: 340px) {
  .stubs-pile { height: 128px; }
  .stubs-ask { position: absolute; right: 0; bottom: calc(100% + 6px); margin-right: 0; }
}
.stubs-star-in { animation: stamp-in ${STAR_DUR}ms var(--ease-pop) backwards; animation-delay: var(--d, 0ms); }

.stubs-caption { margin: 0; text-align: center; font-size: 12px; line-height: 1; color: #8e8e93; }

@media (prefers-reduced-motion: reduce) {
  .stubs-root .stubs-star-in { animation: none; }
  .stubs-root .stubs-lift, .stubs-root .stubs-top, .stubs-root .stubs-ask { transition: none; }
}
`;

function LinkGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

/** The app's share arrow: a box open at the top with the arrow leaving it. */
function ShareGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 14V2.5" />
      <path d="M8.5 6 12 2.5 15.5 6" />
      <path d="M9 10H7a2 2 0 0 0-2 2v7.5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V12a2 2 0 0 0-2-2h-2" />
    </svg>
  );
}

const delay = (ms: number): CSSProperties => ({ ["--d" as string]: `${ms}ms` });

interface StubCollectionProps {
  className?: string;
  style?: CSSProperties;
}

export default function StubCollection({ className = "", style }: StubCollectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  // Same threshold and margin as RevealObserver, so the bars grow with the CSS reveal.
  const revealed = useInViewOnce(ref, 0.05);
  const seen = useInViewOnce(ref, 0.35);
  const reduced = useReducedMotion();

  const [barsIn, setBarsIn] = useState(false);
  const [rating, setRating] = useState(0); // stars on the top stub
  const [tallied, setTallied] = useState(0); // what the histogram counts
  const [scripted, setScripted] = useState(false); // stagger on while the script stamps
  const [pressed, setPressed] = useState(false);
  const done = useRef(false); // the script ran, or was skipped: never again
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    timers.current.forEach((t) => clearTimeout(t));
    timers.current = [];
  };

  // The histogram's bars grow once its card has landed.
  useEffect(() => {
    if (!revealed) return;
    if (reduced) {
      setBarsIn(true);
      return;
    }
    const t = window.setTimeout(() => setBarsIn(true), T_BARS);
    return () => clearTimeout(t);
  }, [revealed, reduced]);

  // Reduced motion: the end state, still interactive.
  useEffect(() => {
    if (!reduced || done.current) return;
    clearTimers();
    done.current = true;
    setRating(SCRIPT_RATING);
    setTallied(SCRIPT_RATING);
  }, [reduced]);

  // The scripted stamp, once.
  useEffect(() => {
    if (!seen || reduced || done.current) return;
    const at = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));
    const landed = T_STAMP + (SCRIPT_RATING - 1) * STAR_STEP;
    at(T_STAMP, () => {
      done.current = true;
      setScripted(true);
      setRating(SCRIPT_RATING);
    });
    at(T_STAMP + PRESS_AT, () => setPressed(true));
    at(T_STAMP + PRESS_AT + PRESS_FOR, () => setPressed(false));
    at(landed + STAR_LAND, () => setTallied(SCRIPT_RATING));
    at(landed + STAR_DUR, () => setScripted(false));
    return clearTimers;
  }, [seen, reduced]);

  const rate = (v: number) => {
    clearTimers();
    done.current = true;
    setScripted(false);
    setPressed(false);
    setRating(v);
    setTallied(v);
  };

  const dist = useMemo<Distribution>(() => {
    const d = { ...(barsIn ? BASE : EMPTY) };
    if (barsIn && tallied) d[tallied as Star] += 1;
    return d;
  }, [barsIn, tallied]);

  const ratingSlot = (
    <span className="stubs-rate">
      <span className="stubs-ask" style={{ opacity: rating ? 0 : 1 }} aria-hidden="true">
        How was it?
      </span>
      <Stars
        value={rating}
        onChange={rate}
        size={12}
        gap={2}
        itemClassName="stubs-star-in"
        delayStep={scripted ? STAR_STEP : 0}
        label="Rate Drug Church at Trinity"
      />
    </span>
  );

  return (
    <div ref={ref} className={`stubs-root seq ${className}`} style={style}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="stubs-head">
        <span className="seq-item stubs-url" style={delay(0)}>
          <LinkGlyph />
          ourscene.uk/will
        </span>
        <span className="seq-item seq-pop stubs-share" style={delay(160)} aria-hidden="true">
          <ShareGlyph />
        </span>
      </div>

      <div className="seq-item" style={delay(90)}>
        <RatingHistogram
          distribution={dist}
          animate
          highlight={rating ? (rating as Star) : undefined}
          className="stubs-histo"
        />
      </div>

      <div className="stubs-pile">
        {PILE.map((p, i) => {
          const top = p.id === TOP;
          return (
            <div
              key={p.id}
              className="stubs-slot"
              style={{
                zIndex: i + 1,
                transform: p.transform,
                filter: p.brightness < 1 ? `brightness(${p.brightness})` : undefined,
              }}
              aria-hidden={top ? undefined : true}
            >
              <div className="seq-item" style={delay(p.delay)}>
                <div className="stubs-lift">
                  <div className={top ? "stubs-top" : undefined} style={top && pressed ? { transform: "translateY(1px)" } : undefined}>
                    <GigStub
                      gig={toSceneGig(gig(p.id), top ? undefined : p.rating)}
                      notchColor={notchFor(p.brightness)}
                      starsSlot={top ? ratingSlot : undefined}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="seq-item seq-fade stubs-caption" style={delay(700)}>
        Go on, rate it.
      </p>
    </div>
  );
}
