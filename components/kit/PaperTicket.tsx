import type { CSSProperties } from "react";
import Barcode from "./Barcode";

export interface PaperTicketProps {
  artist: string;
  venue: string;
  city?: string;
  date: string; // e.g. "THU 10 SEP 2026"
  doors?: string; // e.g. "19:00"
  provider?: string;
  serial?: string; // e.g. "Nº 0233"
  /** Width in px; the ticket keeps a 480×200 proportion. */
  width?: number;
  className?: string;
  style?: CSSProperties;
  /** Hide the stub (after it has been torn off). */
  bodyOnly?: boolean;
}

/**
 * The one light object on the page: a paper ticket with a perforated
 * ADMIT ONE stub. Notches are punched with a CSS mask so they work over any
 * background. Designed at 480×200; everything scales from `width`.
 */
export default function PaperTicket({
  artist,
  venue,
  city = "Bristol",
  date,
  doors = "19:00",
  provider,
  serial = "Nº 0233",
  width = 480,
  className = "",
  style,
  bodyOnly = false,
}: PaperTicketProps) {
  const s = width / 480;
  const H = 200 * s;
  const stubW = 112 * s;
  const bodyW = width - stubW;
  const notchR = 14 * s;
  const perfX = bodyW; // x of the perforation

  // Punch two notches at the perforation (top and bottom edges).
  const mask = `radial-gradient(circle at ${perfX}px 0px, transparent ${notchR}px, #000 ${notchR + 0.6}px), radial-gradient(circle at ${perfX}px ${H}px, transparent ${notchR}px, #000 ${notchR + 0.6}px)`;

  return (
    <div
      className={`relative ${className}`}
      style={{
        width: bodyOnly ? bodyW : width,
        height: H,
        borderRadius: 18 * s,
        background: "var(--paper)",
        color: "var(--paper-ink)",
        WebkitMaskImage: mask,
        maskImage: mask,
        WebkitMaskComposite: "source-in",
        maskComposite: "intersect",
        display: "flex",
        overflow: "hidden",
        ...style,
      }}
      aria-hidden="true"
    >
      {/* Paper texture: a faint diagonal sheen */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(135deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 40%, rgba(0,0,0,0.035) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Body */}
      <div style={{ width: bodyW, height: "100%", padding: `${22 * s}px ${26 * s}px ${20 * s}px`, display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10 * s, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(10,10,10,0.55)" }}>
          <span>{venue} · {city}</span>
          <span>{date}</span>
        </div>
        <div className="font-display" style={{ fontSize: 32 * s, fontWeight: 600, letterSpacing: "-0.035em", lineHeight: 1.02, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
          {artist}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 10 * s, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(10,10,10,0.55)" }}>
          <span>Doors {doors}</span>
          {provider && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 * s, letterSpacing: "0.08em", textTransform: "none", fontSize: 11 * s, color: "rgba(10,10,10,0.7)" }}>
              <span style={{ width: 14 * s, height: 14 * s, borderRadius: 999, background: "rgba(10,10,10,0.85)", color: "var(--paper)", fontSize: 8 * s, fontWeight: 800, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                {provider.charAt(0)}
              </span>
              {provider}
            </span>
          )}
        </div>
      </div>

      {/* Perforation + stub */}
      {!bodyOnly && (
        <div
          style={{
            width: stubW,
            height: "100%",
            position: "relative",
            borderLeft: `${Math.max(1, 1.2 * s)}px dashed rgba(10,10,10,0.3)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-evenly",
            padding: `${22 * s}px 0`,
          }}
        >
          <span
            style={{
              writingMode: "vertical-rl",
              transform: "rotate(180deg)",
              fontSize: 9 * s,
              fontWeight: 700,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "rgba(10,10,10,0.6)",
            }}
          >
            Admit one
          </span>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 * s }}>
            <Barcode vertical width={16 * s} height={120 * s} color="#0a0a0a" opacity={0.8} />
          </div>
          <span
            style={{
              writingMode: "vertical-rl",
              transform: "rotate(180deg)",
              fontSize: 8 * s,
              letterSpacing: "0.12em",
              color: "rgba(10,10,10,0.5)",
              fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
            }}
          >
            {serial}
          </span>
        </div>
      )}
    </div>
  );
}
