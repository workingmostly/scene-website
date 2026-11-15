"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import GigRow from "@/components/kit/GigRow";
import Barcode from "@/components/kit/Barcode";
import ProviderChip from "@/components/kit/ProviderChip";
import { gig } from "@/lib/demo-gigs";
import { useInViewOnce } from "@/lib/motion";

/**
 * Feature 2 illustration: "the email reads itself", once, quietly.
 *
 * Top to bottom: the provider chips, a confirmation email as a dark inner
 * card, a dotted connector, the "My Gigs" row it becomes, and a plain
 * "Added to My Gigs" line. It is a CSS `.seq` sequence (RevealObserver adds
 * `.is-visible`; `useInViewOnce` is the fallback), so every beat is a `--d`
 * delay and reduced motion renders the end state with no JavaScript.
 *
 * Timeline (ms):
 *   0     chips fade in
 *   150   email rows in
 *   600 · 860 · 1120 · 1380   the four fields highlight in reading order
 *   1700  connector grows (240ms); chevron at 1880
 *   1950  row rows in; its fields land in the same order from 2050, 70ms apart
 *   2400  provider initial + name pop in
 *   2500  friends pop in, 90ms apart
 *   2650  "Added to My Gigs" fades up
 *
 * Hover/tap on a chip swaps the sender (initial + name crossfade) and the
 * row's provider. Nothing else changes and nothing replays.
 */

const PROVIDERS = ["DICE", "Ticketmaster", "SeeTickets", "Headfirst"] as const;
type Provider = (typeof PROVIDERS)[number];
const isProvider = (s: string): s is Provider => (PROVIDERS as readonly string[]).includes(s);

const DEMO = gig("drugchurch");
const ROW_SCALE = 0.86;

// Timeline, ms from the start of the sequence.
const T = {
  chips: 0,
  email: 150,
  hl: [600, 860, 1120, 1380],
  link: 1700,
  chevron: 1880,
  row: 1950,
  fields: 2050,
  fieldStep: 70,
  provider: 2400,
  friends: 2500,
  added: 2650,
};

// GigRow's fields, addressed structurally (GigRow has no per-field hooks).
const F = {
  date: ".scn-row > :nth-child(1)",
  artist: ".scn-row > :nth-child(2) > :nth-child(1)",
  venue: ".scn-row > :nth-child(2) > :nth-child(2) > :nth-child(1)",
  time: ".scn-row > :nth-child(2) > :nth-child(2) > :nth-child(2)",
  provider: ".scn-row > :nth-child(2) > :nth-child(2) > :nth-child(3)",
  tickets: ".scn-row > :nth-child(3)",
};
const FIELDS = Object.values(F);
const each = (prefix: string) => FIELDS.map((s) => `${prefix} ${s}`).join(",\n");

const CSS = `
.scn { position: relative; width: 100%; }
.scn-col { width: 100%; max-width: 380px; margin: 0 auto; }

/* ── Providers ──────────────────────────────────────────────────────── */
.scn-chips { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; }
.scn-chip { display: inline-flex; }
.scn-more { font-size: 12px; color: #636366; line-height: 28px; padding: 0 4px; white-space: nowrap; }

/* ── Email card ─────────────────────────────────────────────────────── */
.scn-mail {
  position: relative; margin-top: 18px; padding: 14px; border-radius: 16px;
  background: #1c1c1e; color: #8e8e93;
  box-shadow: 0 0 0 1px rgba(255,255,255,0.08), 0 24px 48px -16px rgba(0,0,0,0.7);
}
/* Sender swap: the incoming initial/name fade in (160ms). */
.scn-in { animation: fade-in 160ms var(--ease-out) both; }

/* ── Connector ──────────────────────────────────────────────────────── */
.scn-join { position: relative; height: 28px; }
.scn-line {
  position: absolute; top: 0; left: 50%; width: 0; height: 19px;
  border-left: 1px dotted rgba(255,255,255,0.18); transform-origin: top;
}
.js .seq.is-visible .seq-item.scn-line { opacity: 1; }
.scn-chev { position: absolute; top: 18px; left: calc(50% - 5px); width: 10px; height: 10px; color: rgba(255,255,255,0.3); }

/* ── Row ────────────────────────────────────────────────────────────── */
${each(".js .seq")} { opacity: 0; }
${each(".js .seq.is-visible")} { animation: scn-drop 240ms var(--ease-out) both; }
.js .seq.is-visible ${F.artist} { animation-delay: ${T.fields}ms; }
.js .seq.is-visible ${F.venue} { animation-delay: ${T.fields + T.fieldStep}ms; }
.js .seq.is-visible ${F.date} { animation-delay: ${T.fields + 2 * T.fieldStep}ms; }
.js .seq.is-visible ${F.time} { animation-delay: ${T.fields + 3 * T.fieldStep}ms; }
.js .seq.is-visible ${F.tickets} { animation-delay: ${T.fields + 4 * T.fieldStep}ms; }
.js .seq.is-visible ${F.provider} {
  animation: pop-in 260ms var(--ease-spring) both; animation-delay: ${T.provider}ms; transform-origin: left center;
}
@keyframes scn-drop { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
@keyframes scn-up { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }

/* Provider swap once the sequence has settled: nothing re-lands, only the provider fades. */
${each(".js .seq.is-visible .scn-swapped")},
.js .seq.is-visible .scn-swapped .seq-item,
.js .seq.is-visible .scn-swapped .seq-item.seq-pop { animation: none; opacity: 1; transform: none; }
.js .seq.is-visible .scn-swapped ${F.provider} { animation: fade-in 160ms var(--ease-out) both; }

/* ── Added line ─────────────────────────────────────────────────────── */
.scn-added {
  margin-top: 12px; display: flex; align-items: center; justify-content: center; gap: 5px;
  font-size: 12px; color: #636366;
}

/* ── Reduced motion: the end state, highlights static ───────────────── */
@media (prefers-reduced-motion: reduce) {
  .scn .seq-hl { background-color: rgba(255,255,255,0.08); color: #fff; }
  ${each(".js .seq")},
  ${each(".js .seq.is-visible")} { animation: none; opacity: 1; transform: none; }
  .scn .scn-in { animation: none; }
}
`;

interface TicketScannerProps {
  className?: string;
  style?: CSSProperties;
}

const d = (ms: number, extra?: Record<string, string>): CSSProperties =>
  ({ "--d": `${ms}ms`, ...extra }) as CSSProperties;

export default function TicketScanner({ className = "", style }: TicketScannerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const chipsRef = useRef<HTMLDivElement>(null);
  const seen = useInViewOnce(ref, 0.35);

  const [provider, setProvider] = useState<Provider>(isProvider(DEMO.provider) ? DEMO.provider : "SeeTickets");
  const [swaps, setSwaps] = useState(0); // re-keys the sender so it crossfades
  const [rowSwaps, setRowSwaps] = useState(0); // re-keys the row's provider, only once settled
  const [settled, setSettled] = useState(false);

  // ProviderChip renders a plain <button>; mark the shown provider as pressed.
  useEffect(() => {
    chipsRef.current?.querySelectorAll("button").forEach((b, i) => {
      b.setAttribute("aria-pressed", String(PROVIDERS[i] === provider));
    });
  }, [provider]);

  const pick = (p: Provider) => {
    if (p === provider) return;
    setProvider(p);
    setSwaps((s) => s + 1);
    if (settled) setRowSwaps((r) => r + 1);
  };

  const classes = ["scn", "seq", seen && "is-visible", className].filter(Boolean).join(" ");

  return (
    <div ref={ref} className={classes} style={style}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* Providers */}
      <div ref={chipsRef} className="seq-item seq-fade scn-chips" style={d(T.chips, { "--dur": "320ms" })} role="group" aria-label="Ticket providers">
        {PROVIDERS.map((p) => (
          <span
            key={p}
            className="scn-chip"
            onPointerEnter={(e) => {
              if (e.pointerType === "mouse") pick(p);
            }}
          >
            <ProviderChip name={p} active={provider === p} onClick={() => pick(p)} />
          </span>
        ))}
        <span className="scn-more">and more</span>
      </div>

      <div className="scn-col" aria-hidden="true">
        {/* The confirmation email */}
        <div className="seq-item scn-mail" style={d(T.email)}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              key={`a${swaps}`}
              className={swaps ? "scn-in" : undefined}
              style={{
                width: 28,
                height: 28,
                flexShrink: 0,
                borderRadius: 999,
                background: "#2c2c2e",
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)",
                color: "#fff",
                fontSize: 12,
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                lineHeight: 1,
              }}
            >
              {provider.charAt(0)}
            </span>
            <span
              key={`n${swaps}`}
              className={swaps ? "scn-in" : undefined}
              style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
            >
              {provider}
            </span>
            <span className="font-mono" style={{ fontSize: 11, color: "#8e8e93", flexShrink: 0 }}>
              09:12
            </span>
          </div>

          <div style={{ marginTop: 12, fontSize: 13, lineHeight: "18px", fontWeight: 500, color: "#fff", whiteSpace: "nowrap" }}>
            Your tickets for{" "}
            <span className="seq-item seq-hl" style={d(T.hl[0])}>
              {DEMO.artist}
            </span>
          </div>

          <div style={{ marginTop: 6, fontSize: 12, lineHeight: "17px", color: "#8e8e93", whiteSpace: "nowrap" }}>
            <div>
              <span className="seq-item seq-hl" style={d(T.hl[1])}>
                {DEMO.venue}
              </span>
              , {DEMO.city}
            </div>
            <div>
              Thursday{" "}
              <span className="seq-item seq-hl" style={d(T.hl[2])}>
                10 September
              </span>{" "}
              2026 · Doors{" "}
              <span className="seq-item seq-hl" style={d(T.hl[3])}>
                {DEMO.doors}
              </span>
            </div>
            <div>1 × General Admission</div>
          </div>

          <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <Barcode width={110} height={14} color="#fff" opacity={0.2} />
            <span className="font-mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: "#636366", whiteSpace: "nowrap" }}>
              SEE-4471-0932
            </span>
          </div>
        </div>

        {/* Connector */}
        <div className="scn-join">
          <span className="seq-item scn-line" style={d(T.link, { "--anim": "grow-y", "--dur": "240ms" })} />
          <svg className="seq-item seq-fade scn-chev" style={d(T.chevron, { "--dur": "160ms" })} viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1.5 3.5 5 7l3.5-3.5" />
          </svg>
        </div>

        {/* The row it becomes */}
        <div className="seq-item" style={d(T.row)}>
          <div key={rowSwaps} className={rowSwaps ? "scn-swapped" : undefined}>
            <GigRow
              className="scn-row"
              day={DEMO.day}
              month={DEMO.month}
              artist={DEMO.artist}
              venue={DEMO.venue}
              time={DEMO.doors}
              provider={provider}
              tickets={1}
              friends={DEMO.friends}
              scale={ROW_SCALE}
              avatarItemClassName="seq-item seq-pop"
              avatarDelayStart={T.friends}
            />
          </div>
        </div>

        <div className="seq-item scn-added" style={d(T.added, { "--anim": "scn-up", "--dur": "320ms" })} onAnimationEnd={() => setSettled(true)}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M2 5.2 4.2 7.4 8 3" />
          </svg>
          Added to My Gigs
        </div>
      </div>
    </div>
  );
}
