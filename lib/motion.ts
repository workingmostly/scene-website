"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

/** True when the visitor prefers reduced motion. Safe during SSR (false). */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

/**
 * Becomes true the first time the element is at least `threshold` visible,
 * and stays true. Use it to start a one-shot JS-driven sequence.
 */
export function useInViewOnce<T extends Element>(
  ref: RefObject<T>,
  threshold = 0.35,
  rootMargin = "0px 0px -10% 0px"
): boolean {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    if (!("IntersectionObserver" in window)) {
      setSeen(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setSeen(true);
            io.disconnect();
          }
        }
      },
      { threshold, rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, threshold, rootMargin, seen]);
  return seen;
}

/** True while the element intersects the viewport (for pausing loops). */
export function useOnScreen<T extends Element>(ref: RefObject<T>, rootMargin = "25% 0px"): boolean {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      setOn(true);
      return;
    }
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin]);
  return on;
}

/** Stable ref to the latest value (handy inside rAF loops). */
export function useLatest<T>(value: T): RefObject<T> {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}
