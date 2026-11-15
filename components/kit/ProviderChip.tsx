import type { CSSProperties } from "react";

interface ProviderChipProps {
  name: string;
  active?: boolean;
  /** Toggle-button semantics: rendered as aria-pressed when clickable. */
  pressed?: boolean;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
}

/** Plain-text provider pill with a circled initial (never a logo). */
export default function ProviderChip({ name, active = false, pressed, className = "", style, onClick }: ProviderChipProps) {
  const Tag = onClick ? "button" : "span";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      aria-pressed={onClick && pressed !== undefined ? pressed : undefined}
      onClick={onClick}
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        height: 28,
        padding: "0 10px 0 6px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 500,
        color: active ? "#fff" : "#8e8e93",
        background: active ? "#2c2c2e" : "transparent",
        boxShadow: active ? "inset 0 0 0 1px rgba(255,255,255,0.18)" : "inset 0 0 0 1px rgba(255,255,255,0.1)",
        transition: "background-color 160ms, color 160ms, box-shadow 160ms",
        cursor: onClick ? "pointer" : undefined,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      <span
        style={{
          width: 16,
          height: 16,
          borderRadius: 999,
          background: active ? "#fff" : "#8e8e93",
          color: "#1c1c1e",
          fontSize: 9,
          fontWeight: 800,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          lineHeight: 1,
        }}
      >
        {name.charAt(0).toUpperCase()}
      </span>
      {name}
    </Tag>
  );
}
