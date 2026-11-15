import type { CSSProperties } from "react";

/** Deterministic bar pattern (same pattern the app's stub draws). */
const BAR = [3, 1, 2, 1, 3, 1, 1, 2, 1, 3, 2, 1, 1, 2, 3, 1, 2, 1, 1, 3, 1, 2, 1, 2, 1, 1, 3, 2, 1, 2, 3, 1, 1, 2, 1, 3, 1, 2];
const GAP = [1, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 1, 1, 2, 1, 1];

const BARS: { x: number; w: number }[] = [];
let _x = 0;
for (let i = 0; i < BAR.length; i++) {
  BARS.push({ x: _x, w: BAR[i] });
  _x += BAR[i] + GAP[i];
}
const TOTAL = _x;

interface BarcodeProps {
  width?: number | string;
  height?: number | string;
  color?: string;
  opacity?: number;
  /** Rotate 90° so the bars run top-to-bottom (as on the app's stub). */
  vertical?: boolean;
  className?: string;
  style?: CSSProperties;
}

export default function Barcode({
  width = 120,
  height = 24,
  color = "currentColor",
  opacity = 1,
  vertical = false,
  className = "",
  style,
}: BarcodeProps) {
  return (
    <svg
      className={className}
      viewBox={vertical ? `0 0 1 ${TOTAL}` : `0 0 ${TOTAL} 1`}
      preserveAspectRatio="none"
      style={{ width, height, opacity, display: "block", ...style }}
      aria-hidden="true"
    >
      {BARS.map(({ x, w }, i) =>
        vertical ? (
          <rect key={i} x="0" y={x} width="1" height={w} fill={color} />
        ) : (
          <rect key={i} x={x} y="0" width={w} height="1" fill={color} />
        )
      )}
    </svg>
  );
}
