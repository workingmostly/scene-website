"use client";

import { useRef } from "react";
import PaperTicket from "@/components/kit/PaperTicket";
import { gig } from "@/lib/demo-gigs";
import { useInViewOnce } from "@/lib/motion";

/**
 * The final card's object: paper goes in, app comes out. One real screenshot
 * of the app (the only one on the page) standing on the card's bottom edge
 * with its whole screen visible, and two tickets tucked behind it that slide
 * out once the card scrolls into view.
 */
export default function CtaObject() {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInViewOnce(ref, 0.3);
  const left = gig("drugchurch");
  const right = gig("toothache");

  return (
    <div
      ref={ref}
      className="cta-object group relative mx-auto mt-14 w-[220px] sm:mt-16 sm:w-[270px]"
      data-seen={seen ? "" : undefined}
      style={{ marginBottom: -22 }}
      aria-hidden="true"
    >
      {/* Tickets, behind the phone */}
      <div
        className="cta-ticket absolute hidden sm:block"
        style={{ top: "42%", right: "58%", filter: "drop-shadow(0 18px 30px rgba(0,0,0,0.6))", ["--r" as string]: "-12deg", ["--tx" as string]: "-1px" }}
      >
        <PaperTicket artist={left.artist} venue={left.venue} city={left.city} date={left.date} doors={left.doors} provider={left.provider} serial={left.serial} width={300} />
      </div>
      <div
        className="cta-ticket absolute hidden sm:block"
        style={{ top: "46%", left: "58%", filter: "drop-shadow(0 18px 30px rgba(0,0,0,0.6))", ["--r" as string]: "10deg", ["--tx" as string]: "1px" }}
      >
        <PaperTicket artist={right.artist} venue={right.venue} city={right.city} date={right.date} doors={right.doors} provider={right.provider} serial={right.serial} width={300} />
      </div>
      {/* Mobile: smaller tickets */}
      <div className="cta-ticket absolute sm:hidden" style={{ top: "46%", right: "50%", filter: "drop-shadow(0 18px 30px rgba(0,0,0,0.6))", ["--r" as string]: "-12deg", ["--tx" as string]: "-1px" }}>
        <PaperTicket artist={left.artist} venue={left.venue} city={left.city} date={left.date} doors={left.doors} provider={left.provider} serial={left.serial} width={160} />
      </div>
      <div className="cta-ticket absolute sm:hidden" style={{ top: "50%", left: "50%", filter: "drop-shadow(0 18px 30px rgba(0,0,0,0.6))", ["--r" as string]: "10deg", ["--tx" as string]: "1px" }}>
        <PaperTicket artist={right.artist} venue={right.venue} city={right.city} date={right.date} doors={right.doors} provider={right.provider} serial={right.serial} width={160} />
      </div>

      {/* The phone */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/screenshots/home.png"
        alt=""
        draggable={false}
        className="cta-phone relative block w-full"
        style={{ filter: "drop-shadow(0 30px 50px rgba(0,0,0,0.7))" }}
      />

      <style>{`
        .cta-ticket { z-index: 0; transform: translateX(0) rotate(0deg); opacity: 0; }
        .cta-phone { z-index: 1; }
        .js .cta-object .cta-phone { opacity: 0; transform: translateY(24px); }
        .js .cta-object[data-seen] .cta-phone { animation: row-in 600ms var(--ease-out) both; }
        .js .cta-object[data-seen] .cta-ticket { animation: cta-ticket-out 600ms var(--ease-out) both; }
        .js .cta-object[data-seen] .cta-ticket + .cta-ticket { animation-delay: 80ms; }
        html:not(.js) .cta-ticket, .cta-object[data-seen] .cta-ticket { opacity: 1; transform: rotate(var(--r)); }
        @keyframes cta-ticket-out {
          from { opacity: 0; transform: translateX(calc(var(--tx) * 40)) rotate(calc(var(--r) * 0.3)); }
          to   { opacity: 1; transform: translateX(0) rotate(var(--r)); }
        }
        @media (hover: hover) {
          .cta-object[data-seen] .cta-ticket { transition: transform 320ms var(--ease-out); }
          .cta-object[data-seen]:hover .cta-ticket { transform: translateX(calc(var(--tx) * 6)) rotate(var(--r)); }
        }
        @media (prefers-reduced-motion: reduce) {
          .js .cta-object .cta-phone, .js .cta-object .cta-ticket { animation: none !important; opacity: 1; transform: none; }
          .js .cta-object .cta-ticket { transform: rotate(var(--r)); }
        }
      `}</style>
    </div>
  );
}
