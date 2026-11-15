import type { CSSProperties } from "react";

export interface AvatarSpec {
  /** One or two letters. */
  initial: string;
  /** Gold avatar, as the app uses for the signed-in user. */
  gold?: boolean;
}

interface AvatarStackProps {
  people: AvatarSpec[];
  size?: number;
  /** Colour of the ring separating overlapping avatars (match the row bg). */
  ring?: string;
  className?: string;
  style?: CSSProperties;
  /** Per-avatar class (e.g. "seq-item seq-pop") and delay base in ms. */
  itemClassName?: string;
  delayStart?: number;
  delayStep?: number;
}

const FILLS = ["#3a3a3c", "#48484a", "#5a5a5e", "#2c2c2e", "#6e6e73"];

export default function AvatarStack({
  people,
  size = 22,
  ring = "#1c1c1e",
  className = "",
  style,
  itemClassName = "",
  delayStart = 0,
  delayStep = 90,
}: AvatarStackProps) {
  return (
    <span className={`inline-flex items-center ${className}`} style={style} aria-hidden="true">
      {people.map((p, i) => (
        <span
          key={i}
          className={itemClassName}
          style={{
            width: size,
            height: size,
            marginLeft: i === 0 ? 0 : -Math.round(size * 0.32),
            borderRadius: 999,
            background: p.gold ? "#ffd300" : FILLS[i % FILLS.length],
            color: p.gold ? "#0a0a0a" : "#fff",
            boxShadow: `0 0 0 2px ${ring}`,
            fontSize: Math.round(size * 0.45),
            fontWeight: 700,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 1,
            position: "relative",
            zIndex: people.length - i,
            ["--d" as string]: `${delayStart + i * delayStep}ms`,
          }}
        >
          {p.initial}
        </span>
      ))}
    </span>
  );
}
