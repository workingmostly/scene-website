"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import PhoneFrame from "@/components/kit/PhoneFrame";
import GigRow from "@/components/kit/GigRow";
import PaperTicket from "@/components/kit/PaperTicket";
import { GIGS, type DemoGig } from "@/lib/demo-gigs";
import { useInViewOnce, useReducedMotion } from "@/lib/motion";

const INITIAL = [GIGS[0], GIGS[1]]; // toothache, foe
const QUEUE = [GIGS[2], GIGS[3], GIGS[4]]; // drugchurch, hotmulligan, bodysnatcher

/** Rest pose of the k-th ticket from the top of the stack. */
const STACK = [
  { x: 0, y: 0, r: -9 },
  { x: 8, y: -6, r: -4 },
  { x: 16, y: -12, r: 3 },
];

/* ── Screen furniture ─────────────────────────────────────────────────── */

function TabBar({ s }: { s: number }) {
  const item = (icon: JSX.Element, label: string, active = false) => (
    <span style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 * s, color: active ? "#fff" : "#8e8e93", width: 58 * s }}>
      <span style={{ width: 30 * s, height: 30 * s, borderRadius: 999, background: active ? "#2c2c2e" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</span>
      <span style={{ fontSize: 8.5 * s, fontWeight: 500 }}>{label}</span>
    </span>
  );
  const sz = 15 * s;
  return (
    <div style={{ position: "absolute", left: 14 * s, right: 14 * s, bottom: 22 * s, display: "flex", alignItems: "center", gap: 8 * s }}>
      <div style={{ flex: 1, height: 56 * s, borderRadius: 999, background: "rgba(28,28,30,0.96)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-around", padding: `0 ${6 * s}px` }}>
        {item(
          <svg width={sz} height={sz} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="2" y="3" width="12" height="11" rx="2" /><path d="M2 6.5h12M5 1.5v3M11 1.5v3" /></svg>,
          "Calendar",
          true
        )}
        {item(
          <svg width={sz} height={sz} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="8" cy="8" r="6.3" /><path d="M10.5 5.5 9 9l-3.5 1.5L7 7z" fill="currentColor" stroke="none" /></svg>,
          "Discover"
        )}
        {item(
          <svg width={sz} height={sz} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="8" cy="5.5" r="3" /><path d="M2.5 14a5.5 5.5 0 0 1 11 0" /></svg>,
          "Profile"
        )}
      </div>
      <div style={{ width: 56 * s, height: 56 * s, borderRadius: 999, background: "rgba(28,28,30,0.96)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
        <svg width={17 * s} height={17 * s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="4.5" /><path d="M10.5 10.5 14 14" strokeLinecap="round" /></svg>
      </div>
    </div>
  );
}

function ScanFrame({ s, show }: { s: number; show: boolean }) {
  const arm = 18 * s;
  const inset = 14 * s;
  const corner = (x: "left" | "right", y: "top" | "bottom") => (
    <span
      key={x + y}
      style={{
        position: "absolute",
        [x]: inset,
        [y]: y === "top" ? inset + 96 * s : inset + 84 * s,
        width: arm,
        height: arm,
        borderTop: y === "top" ? "2px solid rgba(255,255,255,0.8)" : undefined,
        borderBottom: y === "bottom" ? "2px solid rgba(255,255,255,0.8)" : undefined,
        borderLeft: x === "left" ? "2px solid rgba(255,255,255,0.8)" : undefined,
        borderRight: x === "right" ? "2px solid rgba(255,255,255,0.8)" : undefined,
        borderRadius: 4,
      }}
    />
  );
  return (
    <div aria-hidden="true" style={{ position: "absolute", inset: 0, opacity: show ? 1 : 0, transition: "opacity 200ms", pointerEvents: "none" }}>
      {corner("left", "top")}
      {corner("right", "top")}
      {corner("left", "bottom")}
      {corner("right", "bottom")}
    </div>
  );
}

/* ── The demo ─────────────────────────────────────────────────────────── */

type Phase = "rest" | "dragging" | "flying" | "scanning" | "settling" | "resetting";

export default function HeroDemo({ className = "" }: { className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const ticketRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const inView = useInViewOnce(rootRef, 0.6);

  const [stageW, setStageW] = useState(520);
  const [rows, setRows] = useState<DemoGig[]>(INITIAL);
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const [collapsing, setCollapsing] = useState(false);
  const [ticketIndex, setTicketIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("rest");
  const [overScreen, setOverScreen] = useState(false);
  const [brackets, setBrackets] = useState(false);
  const [sweepKey, setSweepKey] = useState(0);
  const [nudge, setNudge] = useState(false);
  const [touched, setTouched] = useState(false);
  const [coarse, setCoarse] = useState(false);
  const [stackHidden, setStackHidden] = useState(false);
  const [announce, setAnnounce] = useState("");

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setStageW(e.contentRect.width));
    ro.observe(el);
    setCoarse(window.matchMedia("(hover: none)").matches);
    return () => ro.disconnect();
  }, []);

  // One idle nudge, once, 2.5s after the hero is well in view and untouched.
  useEffect(() => {
    if (!inView || touched || reduced) return;
    const t = setTimeout(() => setNudge(true), 2500);
    const t2 = setTimeout(() => setNudge(false), 2500 + 1000);
    return () => {
      clearTimeout(t);
      clearTimeout(t2);
    };
  }, [inView, touched, reduced]);

  /* Geometry */
  const narrow = stageW < 440;
  const phoneW = narrow ? 236 : 290;
  const s = phoneW / 290;
  const phoneH = Math.round(phoneW * 600 / 290);
  const ticketW = narrow ? 190 : 250;
  const ticketH = Math.round(ticketW * 200 / 480);
  const stageH = narrow ? phoneH + 90 : phoneH + 44;
  const phoneLeft = narrow ? Math.round((stageW - phoneW) / 2) : Math.max(0, stageW - phoneW);
  const stackLeft = narrow ? Math.max(0, Math.round(stageW / 2) - 170) : Math.max(0, phoneLeft - ticketW + 96);
  const stackTop = narrow ? phoneH - ticketH + 36 : phoneH - ticketH - 12;

  const remaining = QUEUE.slice(ticketIndex);
  const ticket = remaining[0] as DemoGig | undefined;
  const done = remaining.length === 0;

  /* Drag state lives in a ref; React state only changes on phase changes. */
  const d = useRef({
    active: false,
    moved: false,
    startX: 0,
    startY: 0,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    lastX: 0,
    lastY: 0,
    lastT: 0,
    raf: 0,
    screen: null as DOMRect | null,
    over: false,
  });

  const restTransform = `translate(0px, 0px) rotate(${STACK[0].r}deg)`;

  const applyTransform = useCallback(() => {
    const el = ticketRef.current;
    if (!el) return;
    const st = d.current;
    const tilt = Math.max(-14, Math.min(14, st.vx * 28));
    el.style.transform = `translate(${st.x}px, ${st.y}px) rotate(${STACK[0].r + tilt}deg) scale(1.04)`;
    // Hot zone check (no layout reads: the screen rect was measured at drag start).
    if (st.screen) {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const pad = 24;
      const over = cx > st.screen.left - pad && cx < st.screen.right + pad && cy > st.screen.top - pad && cy < st.screen.bottom + pad;
      if (over !== st.over) {
        st.over = over;
        setOverScreen(over);
      }
    }
    st.raf = 0;
  }, []);

  /** Fly the ticket into the screen, scan it, file it, bring the next one. */
  const scanIn = useCallback(() => {
    const el = ticketRef.current;
    const screen = screenRef.current;
    if (!ticket || !el || !screen) return;
    setTouched(true);
    setOverScreen(false);

    const tr = el.getBoundingClientRect();
    const sr = screen.getBoundingClientRect();
    const dx = sr.left + sr.width / 2 - (tr.left + tr.width / 2);
    const dy = sr.top + sr.height / 2 - (tr.top + tr.height / 2) + 40 * s;
    const st = d.current;

    setPhase("flying");
    const flyMs = reduced ? 150 : 420;
    el.style.transition = `transform ${flyMs}ms var(--ease-out), opacity 160ms ${Math.max(0, flyMs - 160)}ms`;
    el.style.transform = `translate(${st.x + dx}px, ${st.y + dy}px) rotate(0deg) scale(0.55)`;
    el.style.opacity = "0";

    const tScan = flyMs; // brackets + hairline
    const tRow = tScan + (reduced ? 0 : 480); // row mounts
    const tBracketsOut = tRow + 300;
    const tNext = tRow + 700;

    setTimeout(() => {
      if (!reduced) {
        setBrackets(true);
        setSweepKey((k) => k + 1);
      }
      setPhase("scanning");
    }, tScan);
    setTimeout(() => {
      setRows((prev) => [...prev, ticket].sort((a, b) => a.sort - b.sort));
      setJustAdded(ticket.id);
      setAnnounce(`${ticket.artist} added to My Gigs.`);
      window.dispatchEvent(new CustomEvent("scene:impulse", { detail: 4 }));
    }, tRow);
    setTimeout(() => setBrackets(false), tBracketsOut);
    setTimeout(() => {
      st.x = 0;
      st.y = 0;
      st.vx = 0;
      st.vy = 0;
      el.style.transition = "none";
      el.style.transform = restTransform;
      el.style.opacity = "";
      setTicketIndex((i) => i + 1);
      setPhase("settling");
      setTimeout(() => setPhase("rest"), 340);
    }, tNext);
  }, [ticket, reduced, s, restTransform]);

  // After the third drop: 3.5s later, put the demo back the way it was.
  useEffect(() => {
    if (!done || phase !== "rest") return;
    const t = setTimeout(() => {
      setPhase("resetting");
      setCollapsing(true);
      setTimeout(() => {
        setRows(INITIAL);
        setJustAdded(null);
        setCollapsing(false);
        setStackHidden(true);
        setTicketIndex(0);
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            setStackHidden(false);
            setPhase("rest");
          })
        );
      }, reduced ? 150 : 520);
    }, 3500);
    return () => clearTimeout(t);
  }, [done, phase, reduced]);

  const springBack = useCallback(() => {
    const el = ticketRef.current;
    const st = d.current;
    st.active = false;
    st.over = false;
    setOverScreen(false);
    if (!el) return;
    st.x = 0;
    st.y = 0;
    st.vx = 0;
    st.vy = 0;
    el.style.transition = `transform ${reduced ? 150 : 520}ms var(--ease-spring)`;
    el.style.transform = restTransform;
    setTimeout(() => {
      el.style.transition = "";
    }, 540);
    setPhase("rest");
  }, [reduced, restTransform]);

  /* Pointer handlers (top ticket only) */
  const onPointerDown = (e: React.PointerEvent) => {
    if (phase !== "rest" || !ticket) return;
    const st = d.current;
    st.active = true;
    st.moved = false;
    st.startX = e.clientX;
    st.startY = e.clientY;
    st.lastX = e.clientX;
    st.lastY = e.clientY;
    st.lastT = performance.now();
    st.vx = 0;
    st.vy = 0;
    st.screen = screenRef.current?.getBoundingClientRect() ?? null;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setTouched(true);
    setNudge(false);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const st = d.current;
    if (!st.active) return;
    const dx = e.clientX - st.startX;
    const dy = e.clientY - st.startY;
    if (!st.moved) {
      if (Math.hypot(dx, dy) < 6) return;
      st.moved = true;
      setPhase("dragging");
      const el = ticketRef.current;
      if (el) el.style.transition = "none";
    }
    const now = performance.now();
    const dt = Math.max(1, now - st.lastT);
    st.vx = st.vx * 0.5 + ((e.clientX - st.lastX) / dt) * 0.5;
    st.vy = st.vy * 0.5 + ((e.clientY - st.lastY) / dt) * 0.5;
    st.lastX = e.clientX;
    st.lastY = e.clientY;
    st.lastT = now;
    st.x = dx;
    st.y = dy;
    if (!st.raf) st.raf = requestAnimationFrame(applyTransform);
  };

  const onPointerUp = () => {
    const st = d.current;
    if (!st.active) return;
    st.active = false;
    if (st.raf) {
      cancelAnimationFrame(st.raf);
      st.raf = 0;
    }
    if (!st.moved) {
      scanIn(); // tap or click
      return;
    }
    const el = ticketRef.current;
    const sr = st.screen;
    if (!el || !sr) return springBack();
    const tr = el.getBoundingClientRect();
    const cx = tr.left + tr.width / 2;
    const cy = tr.top + tr.height / 2;
    const pad = 24;
    const inside = (x: number, y: number) => x > sr.left - pad && x < sr.right + pad && y > sr.top - pad && y < sr.bottom + pad;
    const speed = Math.hypot(st.vx, st.vy);
    // A flick counts when the velocity ray passes near the screen centre.
    const scx = sr.left + sr.width / 2;
    const scy = sr.top + sr.height / 2;
    let flick = false;
    if (speed >= 0.5) {
      const ux = st.vx / speed;
      const uy = st.vy / speed;
      const t = (scx - cx) * ux + (scy - cy) * uy; // projection along the ray
      if (t > 0) {
        const px = cx + ux * t;
        const py = cy + uy * t;
        flick = Math.hypot(px - scx, py - scy) < 120;
      }
    }
    if (inside(cx, cy) || flick) scanIn();
    else springBack();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (phase === "rest") scanIn();
    }
  };

  const caption = done
    ? "All in."
    : overScreen
      ? "Let go."
      : touched && ticketIndex > 0
        ? "That's in. Try another."
        : coarse
          ? "Go on. Drag a ticket in."
          : "Go on. Flick a ticket in.";

  const listTop = 112 * s;
  const listBottom = 100 * s;

  return (
    <div ref={rootRef} className={`relative select-none ${className}`} style={{ width: "100%" }}>
      <div ref={stageRef} style={{ position: "relative", height: stageH, width: "100%" }}>
        {/* Phone */}
        <PhoneFrame width={phoneW} style={{ position: "absolute", left: phoneLeft, top: 0 }}>
          <div ref={screenRef} style={{ position: "absolute", inset: 0 }}>
            {/* Title row */}
            <div style={{ position: "absolute", top: 58 * s, left: 20 * s, right: 18 * s, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
              <span className="font-display" style={{ fontSize: 30 * s, fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1 }}>My Gigs</span>
              <span style={{ width: 36 * s, height: 36 * s, borderRadius: 999, background: "#1c1c1e", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 2 * s }}>
                <svg width={15 * s} height={15 * s} viewBox="0 0 14 14" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"><path d="M7 1.5v11M1.5 7h11" /></svg>
              </span>
            </div>

            {/* Rows */}
            <div
              style={{
                position: "absolute",
                top: listTop,
                left: 16 * s,
                right: 16 * s,
                display: "flex",
                flexDirection: "column",
                opacity: overScreen ? 0.6 : 1,
                transition: "opacity 200ms",
              }}
            >
              {rows.map((g, i) => {
                const fresh = g.id === justAdded;
                const extra = i >= INITIAL.length;
                return (
                  <div
                    key={g.id}
                    className={collapsing && extra ? "hero-collapse" : fresh && !reduced ? "hero-slot" : undefined}
                    style={{ display: "grid", gridTemplateRows: "1fr" }}
                  >
                    <div style={{ minHeight: 0, overflow: "hidden" }}>
                      {i > 0 && (
                        <div style={{ height: 10 * s, paddingLeft: 36 * s }}>
                          <span style={{ display: "block", width: 1, height: "100%", borderLeft: "1.5px dotted rgba(255,255,255,0.22)" }} />
                        </div>
                      )}
                      <div className={fresh && !reduced ? "hero-row-fresh" : undefined}>
                        <GigRow
                          day={g.day}
                          month={g.month}
                          artist={g.artist}
                          venue={g.venue}
                          time={g.doors}
                          friends={g.friends}
                          scale={0.86 * s}
                          active={fresh}
                          avatarItemClassName={fresh && !reduced ? "hero-avatar" : undefined}
                          avatarDelayStart={300}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* One hairline sweep, once per drop */}
            {sweepKey > 0 && !reduced && (
              <span
                key={sweepKey}
                aria-hidden="true"
                className="hero-sweep"
                style={{
                  position: "absolute",
                  left: 16 * s,
                  right: 16 * s,
                  top: listTop,
                  height: 1,
                  background: "rgba(255,255,255,0.7)",
                  boxShadow: "0 0 12px 1px rgba(255,255,255,0.25)",
                  ["--sweep" as string]: `${phoneH - listTop - listBottom}px`,
                }}
              />
            )}

            <ScanFrame s={s} show={brackets || overScreen} />
            <TabBar s={s} />
          </div>
        </PhoneFrame>

        {/* The ticket stack: static tickets behind, the top one you can throw */}
        <div
          style={{
            position: "absolute",
            left: stackLeft,
            top: stackTop,
            width: ticketW,
            height: ticketH,
            opacity: stackHidden ? 0 : 1,
            transition: stackHidden ? "none" : "opacity 300ms",
          }}
        >
          {remaining
            .slice(1)
            .map((t, k) => {
              const pose = STACK[Math.min(k + 1, STACK.length - 1)];
              return (
                <div
                  key={t.id}
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    inset: 0,
                    transform: `translate(${pose.x}px, ${pose.y}px) rotate(${pose.r}deg)`,
                    transition: "transform 320ms var(--ease-out)",
                    filter: "drop-shadow(0 18px 30px rgba(0,0,0,0.6))",
                    zIndex: 2 - k,
                  }}
                >
                  <PaperTicket artist={t.artist} venue={t.venue} city={t.city} date={t.date} doors={t.doors} provider={t.provider} serial={t.serial} width={ticketW} />
                </div>
              );
            })
            .reverse()}

          {ticket && (
            <div
              key={ticket.id}
              ref={ticketRef}
              role="button"
              tabIndex={0}
              aria-label={`Add the ${ticket.artist} ticket to My Gigs (demo)`}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={springBack}
              onKeyDown={onKeyDown}
              className={nudge ? "hero-nudge" : undefined}
              style={{
                position: "absolute",
                inset: 0,
                transform: restTransform,
                cursor: phase === "dragging" ? "grabbing" : "grab",
                touchAction: "none",
                zIndex: 5,
                filter: "drop-shadow(0 18px 30px rgba(0,0,0,0.6))",
                outline: "none",
                willChange: phase === "dragging" || phase === "flying" ? "transform" : undefined,
              }}
            >
              <PaperTicket artist={ticket.artist} venue={ticket.venue} city={ticket.city} date={ticket.date} doors={ticket.doors} provider={ticket.provider} serial={ticket.serial} width={ticketW} />
            </div>
          )}
        </div>
      </div>

      <p className="mt-4 text-center text-[13px] text-scene-muted" style={{ minHeight: 20 }}>
        {caption}
      </p>
      <span className="sr-only" aria-live="polite">
        {announce}
      </span>

      <style>{`
        .hero-slot { animation: hero-slot 320ms var(--ease-out) both; }
        @keyframes hero-slot { from { grid-template-rows: 0fr; } to { grid-template-rows: 1fr; } }
        .hero-collapse { animation: hero-collapse 320ms var(--ease-out) 200ms both; }
        @keyframes hero-collapse { from { grid-template-rows: 1fr; opacity: 1; } to { grid-template-rows: 0fr; opacity: 0; } }
        .hero-row-fresh { animation: row-in 450ms var(--ease-out) 120ms both; }
        .hero-avatar { animation: pop-in 260ms var(--ease-spring) both; animation-delay: calc(var(--d, 0ms) + 240ms); }
        .hero-sweep { animation: scan-sweep 480ms linear both; }
        .hero-nudge { animation: hero-nudge 1000ms ease-in-out; }
        @keyframes hero-nudge { 0%, 100% { translate: 0 0; } 50% { translate: 10px -8px; } }
        @media (prefers-reduced-motion: reduce) {
          .hero-nudge, .hero-sweep, .hero-row-fresh, .hero-avatar, .hero-slot { animation: none; }
        }
      `}</style>
    </div>
  );
}
