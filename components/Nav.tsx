"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import JoinBetaButton from "./JoinBetaButton";

/**
 * Floating pill navigation. Sits transparently over the hero at the top of the
 * page and "lifts" into a frosted pill as the page scrolls. Its own CTA is
 * hidden while a page-level CTA (marked with `data-hero-cta`) is on screen.
 */
export default function Nav() {
  const ref = useRef<HTMLElement>(null);
  const [showCta, setShowCta] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let last = -1;
    function onScroll() {
      const t = Math.min(Math.max(window.scrollY / 64, 0), 1);
      const lift = Math.round((1 - (1 - t) ** 2) * 100) / 100;
      if (lift !== last) {
        last = lift;
        el!.style.setProperty("--lift", String(lift));
      }
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const targets = document.querySelectorAll("[data-hero-cta]");
    let io: IntersectionObserver | null = null;
    if (targets.length === 0) {
      setShowCta(true);
    } else {
      const visible = new Set<Element>();
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) visible.add(e.target);
            else visible.delete(e.target);
          }
          setShowCta(visible.size === 0);
        },
        { rootMargin: "-80px 0px 0px 0px" }
      );
      targets.forEach((t) => io!.observe(t));
    }
    // Enable transitions only after the first layout so nothing animates on load.
    const raf = requestAnimationFrame(() => setReady(true));

    return () => {
      window.removeEventListener("scroll", onScroll);
      io?.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <header
      ref={ref}
      className="nav fixed inset-x-0 top-3 z-50 px-3 sm:top-4 sm:px-4"
      data-show-cta={showCta ? "" : undefined}
      data-ready={ready ? "" : undefined}
    >
      <div className="mx-auto max-w-6xl lg:px-[26px]">
        <nav className="nav-bar relative z-0" aria-label="Main">
          <div className="nav-clip flex h-16 items-center pl-3.5 pr-2">
            {/* Logo */}
            <div className="nav-start flex">
              <Link
                href="/"
                className="flex items-center gap-2.5 rounded-full pr-2 hover:opacity-80 transition-opacity"
                aria-label="Scene home"
              >
                <span className="flex size-9 items-center justify-center rounded-[10px] bg-scene-surface-2 ring-1 ring-white/10">
                  <Image src="/scene-logo.svg" alt="" width={18} height={20} />
                </span>
                <span className="font-display text-[22px] font-semibold tracking-[-0.035em] text-white">
                  Scene
                </span>
                <span className="ml-0.5 rounded-full bg-white/[0.08] px-2 py-0.5 text-[10px] font-semibold tracking-wide text-scene-muted ring-1 ring-white/10">
                  Beta
                </span>
              </Link>
            </div>

            {/* Links */}
            <div className="nav-links hidden shrink-0 items-center gap-6 whitespace-nowrap text-[15px] text-white/70 md:flex lg:gap-9">
              <a href="/#features" className="transition-colors hover:text-white">
                What is it?
              </a>
              <a href="/privacy" className="transition-colors hover:text-white">
                Privacy
              </a>
            </div>

            {/* CTA */}
            <div className="nav-end flex justify-end">
              <div className="nav-cta-slot">
                <JoinBetaButton className="nav-cta btn btn-primary ml-[18px] h-12 px-6 text-[15px]" />
              </div>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
