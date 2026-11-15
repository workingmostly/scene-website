import type { CSSProperties, ReactNode } from "react";
import AvatarStack, { type AvatarSpec } from "./AvatarStack";

export interface GigRowProps {
  day: string | number;
  month: string;
  artist: string;
  venue: string;
  time?: string;
  provider?: string;
  friends?: AvatarSpec[];
  /** Ticket count chip, e.g. 1 → "1×". */
  tickets?: number;
  /** Visual scale: 1 = app size (72px tall). */
  scale?: number;
  className?: string;
  style?: CSSProperties;
  /** Extra node on the right, after avatars. */
  trailing?: ReactNode;
  /** Highlight state (hover / just-added). */
  active?: boolean;
  /** Per-avatar class and delay base, for pop-in sequences. */
  avatarItemClassName?: string;
  avatarDelayStart?: number;
}

function VenueIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round">
      <rect x="1.5" y="1" width="9" height="10" rx="1.2" />
      <path d="M4 3.5h1.2M6.8 3.5H8M4 6h1.2M6.8 6H8M5 11V8.5h2V11" />
    </svg>
  );
}
function TicketIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round">
      <path d="M1.5 4.5V2.5h9v2a1.5 1.5 0 0 0 0 3v2h-9v-2a1.5 1.5 0 0 0 0-3Z" />
      <path d="M7 3v6" strokeDasharray="1.2 1.2" />
    </svg>
  );
}

/**
 * One "My Gigs" row, as drawn by the app: date block, artist, venue · time ·
 * provider, and (optionally) friends who are going.
 */
export default function GigRow({
  day,
  month,
  artist,
  venue,
  time,
  provider,
  friends,
  tickets,
  scale = 1,
  className = "",
  style,
  trailing,
  active = false,
  avatarItemClassName,
  avatarDelayStart = 0,
}: GigRowProps) {
  const s = scale;
  return (
    <div
      className={className}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14 * s,
        height: 72 * s,
        padding: `0 ${16 * s}px`,
        borderRadius: 18 * s,
        background: active ? "#232326" : "#1c1c1e",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.05)",
        color: "#fff",
        transition: "background-color 160ms",
        ...style,
      }}
    >
      {/* Date block */}
      <div style={{ width: 40 * s, flexShrink: 0, textAlign: "center", lineHeight: 1 }}>
        <div className="font-display" style={{ fontSize: 22 * s, fontWeight: 600, letterSpacing: "-0.02em" }}>{day}</div>
        <div style={{ fontSize: 9 * s, fontWeight: 600, letterSpacing: "0.14em", color: "#8e8e93", marginTop: 4 * s, textTransform: "uppercase" }}>{month}</div>
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15 * s, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", letterSpacing: "-0.01em" }}>{artist}</div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8 * s,
            marginTop: 5 * s,
            fontSize: 11.5 * s,
            color: "#8e8e93",
            whiteSpace: "nowrap",
            overflow: "hidden",
            WebkitMaskImage: "linear-gradient(to right, #000 calc(100% - 18px), transparent)",
            maskImage: "linear-gradient(to right, #000 calc(100% - 18px), transparent)",
          }}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 * s }}>
            <VenueIcon size={11 * s} />
            {venue}
          </span>
          {time && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 * s }}>
              <TicketIcon size={11 * s} />
              {time}
            </span>
          )}
          {provider && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 * s }}>
              <span
                style={{
                  width: 11 * s,
                  height: 11 * s,
                  borderRadius: 999,
                  background: "#8e8e93",
                  color: "#1c1c1e",
                  fontSize: 7 * s,
                  fontWeight: 800,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  lineHeight: 1,
                }}
              >
                {provider.charAt(0).toUpperCase()}
              </span>
              {provider}
            </span>
          )}
        </div>
      </div>

      {/* Trailing */}
      {tickets !== undefined && (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 3 * s, fontSize: 11 * s, fontWeight: 600, color: "#fff" }}>
          {tickets}×<TicketIcon size={11 * s} />
        </span>
      )}
      {friends && friends.length > 0 && (
        <AvatarStack
          people={friends}
          size={22 * s}
          ring={active ? "#232326" : "#1c1c1e"}
          itemClassName={avatarItemClassName}
          delayStart={avatarDelayStart}
        />
      )}
      {trailing}
    </div>
  );
}
