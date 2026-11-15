"use client";

import { useState, type CSSProperties } from "react";

interface StarsProps {
  value: number;
  onChange?: (v: number) => void;
  size?: number;
  gap?: number;
  /** Class applied to each star (e.g. "seq-item seq-stamp"), with --d delays. */
  itemClassName?: string;
  delayStart?: number;
  delayStep?: number;
  className?: string;
  style?: CSSProperties;
  label?: string;
}

const PATH = "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z";

/** Five stars, gold when filled. Interactive when `onChange` is given. */
export default function Stars({
  value,
  onChange,
  size = 14,
  gap = 2,
  itemClassName = "",
  delayStart = 0,
  delayStep = 90,
  className = "",
  style,
  label = "Rate this show",
}: StarsProps) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  const interactive = Boolean(onChange);

  return (
    <span
      className={`inline-flex items-center ${className}`}
      style={{ gap, ...style }}
      role={interactive ? "radiogroup" : undefined}
      aria-label={interactive ? label : `${value} out of 5 stars`}
      onMouseLeave={() => setHover(0)}
    >
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = i <= shown;
        const preview = interactive && hover > 0 && i <= hover && i > value;
        const star = (
          <svg
            viewBox="0 0 24 24"
            width={size}
            height={size}
            className={i <= value ? itemClassName : undefined}
            style={{
              display: "block",
              fill: filled ? (preview ? "#8e8e93" : "#ffd300") : "#2c2c2e",
              transition: "fill 120ms, transform 160ms var(--ease-pop)",
              transform: interactive && hover === i ? "scale(1.25)" : undefined,
              ["--d" as string]: `${delayStart + (i - 1) * delayStep}ms`,
            }}
            aria-hidden="true"
          >
            <path d={PATH} />
          </svg>
        );
        if (!interactive) return <span key={i}>{star}</span>;
        return (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={value === i}
            aria-label={`${i} star${i === 1 ? "" : "s"}`}
            onMouseEnter={() => setHover(i)}
            onFocus={() => setHover(i)}
            onBlur={() => setHover(0)}
            onClick={() => onChange?.(i)}
            style={{ background: "none", border: 0, padding: 0, cursor: "pointer", lineHeight: 0 }}
          >
            {star}
          </button>
        );
      })}
    </span>
  );
}
