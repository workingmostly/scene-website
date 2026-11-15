"use client";

import { useRef, useEffect, useState } from "react";

const VENUES = [
  "The Fleece",
  "Trinity",
  "Exchange",
  "The Croft",
  "SWX",
  "Marble Factory",
  "The Prospect Building",
  "Shredenhams",
  "Thekla",
  "Rough Trade Bristol",
  "The Louisiana",
  "Roundhouse",
  "Brudenell Social Club",
  "O2 Academy Brixton",
  "Gorilla",
  "The Lexington",
  "Scala",
  "Underworld",
  "MOTH Club",
  "KOKO",
  "The Cab",
  "New Cross Inn",
  "Electric Ballroom",
];

const AUTO_SPEED = 0.5; // px per frame baseline
const FRICTION = 0.975; // high value = long, gradual coast
const SCROLL_COUPLING = 0.12; // how much a page scroll nudges the strip
const SCROLL_CLAMP = 40; // px of scroll delta considered per frame

/**
 * The venue strip. Looks exactly as it always has (small muted names, dot
 * separators, bordered band) but now: names fade out at the edges, the strip
 * brightens while held, a brisk page scroll nudges it, a `scene:impulse`
 * event (dispatched by the hero demo) shakes it, and its animation loop only
 * runs while it is on screen, the tab is visible and motion is allowed.
 */
export default function Ticker() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const [grabbing, setGrabbing] = useState(false);

  // All mutable physics state lives in a single ref to avoid re-renders
  const s = useRef({
    offset: 0,
    vel: 0,
    dragging: false,
    lastX: 0,
    samples: [] as { x: number; t: number }[],
    pendingScroll: 0,
    lastScrollY: 0,
    onScreen: true,
    visible: true,
    reduced: false,
    running: false,
  });

  useEffect(() => {
    const track = trackRef.current;
    const wrap = wrapRef.current;
    if (!track || !wrap) return;
    const st = s.current;

    function halfWidth() {
      return track!.scrollWidth / 2;
    }

    function wrap_(offset: number) {
      const h = halfWidth();
      if (h <= 0) return offset;
      return ((offset % h) + h) % h;
    }

    function render() {
      st.offset = wrap_(st.offset);
      track!.style.transform = `translateX(${-st.offset}px)`;
    }

    function tick() {
      if (!st.dragging) {
        // Page-scroll coupling: a brisk scroll adds a little coast.
        const nudge = Math.max(-SCROLL_CLAMP, Math.min(SCROLL_CLAMP, st.pendingScroll)) * SCROLL_COUPLING;
        st.pendingScroll = 0;
        st.vel = st.vel * FRICTION + nudge;
        st.offset += (st.reduced ? 0 : AUTO_SPEED) + st.vel;
      }
      render();

      // Keep looping only while there is something to animate.
      const idle = !st.dragging && st.reduced && Math.abs(st.vel) < 0.02;
      if (idle || !st.onScreen || !st.visible) {
        st.running = false;
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    }

    function start() {
      if (st.running) return;
      st.running = true;
      rafRef.current = requestAnimationFrame(tick);
    }

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMq = () => {
      st.reduced = mq.matches;
      start();
    };
    onMq();
    mq.addEventListener("change", onMq);

    const io = new IntersectionObserver(
      ([e]) => {
        st.onScreen = e.isIntersecting;
        if (st.onScreen) start();
      },
      { rootMargin: "20% 0px" }
    );
    io.observe(wrap);

    const onVisibility = () => {
      st.visible = !document.hidden;
      if (st.visible) start();
    };
    document.addEventListener("visibilitychange", onVisibility);

    st.lastScrollY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      st.pendingScroll += y - st.lastScrollY;
      st.lastScrollY = y;
      start();
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // The hero demo dispatches this when a ticket is scanned in.
    const onImpulse = (e: Event) => {
      const amount = (e as CustomEvent<number>).detail ?? 6;
      if (st.reduced) return;
      st.vel += amount;
      start();
    };
    window.addEventListener("scene:impulse", onImpulse);

    return () => {
      cancelAnimationFrame(rafRef.current);
      st.running = false;
      mq.removeEventListener("change", onMq);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("scene:impulse", onImpulse);
    };
  }, []);

  useEffect(() => {
    const st = s.current;
    function onMove(e: MouseEvent | TouchEvent) {
      if (!st.dragging) return;
      const x = "touches" in e ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
      const dx = x - st.lastX;
      st.offset -= dx;
      st.lastX = x;
      const t = performance.now();
      st.samples.push({ x, t });
      // Keep only the last 80ms of samples for velocity calculation
      const cutoff = t - 80;
      st.samples = st.samples.filter((p) => p.t >= cutoff);
    }

    function onUp() {
      if (!st.dragging) return;
      st.dragging = false;
      setGrabbing(false);

      // Derive release velocity from recent pointer samples
      if (st.samples.length >= 2) {
        const first = st.samples[0];
        const last = st.samples[st.samples.length - 1];
        const dt = last.t - first.t;
        if (dt > 0) {
          const dx = last.x - first.x;
          // Convert px/ms → px/frame (≈16.67ms at 60fps), negate for direction
          st.vel = -(dx / dt) * 16.67;
        }
      }
      st.samples = [];
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, []);

  function onPointerDown(e: React.MouseEvent | React.TouchEvent) {
    const x = "touches" in e ? e.touches[0].clientX : e.clientX;
    const st = s.current;
    st.dragging = true;
    st.vel = 0;
    st.lastX = x;
    st.samples = [{ x, t: performance.now() }];
    setGrabbing(true);
    // Make sure the loop renders while dragging even under reduced motion.
    if (!st.running) {
      st.running = true;
      const loop = () => {
        if (!st.dragging) {
          st.running = false;
          return;
        }
        st.offset = ((st.offset % (trackRef.current!.scrollWidth / 2)) + trackRef.current!.scrollWidth / 2) % (trackRef.current!.scrollWidth / 2);
        trackRef.current!.style.transform = `translateX(${-st.offset}px)`;
        rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);
    }
  }

  const items = [...VENUES, ...VENUES];

  return (
    <div
      ref={wrapRef}
      className="ticker my-10 border-y border-scene-border py-4 overflow-hidden select-none sm:my-14"
      data-held={grabbing ? "" : undefined}
      style={{
        background: "#080808",
        cursor: grabbing ? "grabbing" : "grab",
        WebkitMaskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)",
        maskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)",
        // Borders are painted inside the mask, so they fade with the names.
      }}
      onMouseDown={onPointerDown}
      onTouchStart={onPointerDown}
      aria-label="Venues"
    >
      <div
        ref={trackRef}
        className="flex whitespace-nowrap"
        style={{ width: "max-content", willChange: "transform" }}
      >
        {items.map((venue, i) => (
          <span key={i} className="inline-flex items-center flex-shrink-0">
            <span className="ticker-name text-sm font-medium px-6">{venue}</span>
            <span className="text-scene-separator select-none">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
