import type { CSSProperties, ReactNode } from "react";

interface PhoneFrameProps {
  /** Outer width in px; height follows the iPhone 15 Pro ratio. */
  width?: number;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Status-bar clock text. */
  time?: string;
  /** Show the animated now-playing waveform in the Dynamic Island. */
  nowPlaying?: boolean;
}

/**
 * Hand-built iPhone frame. Everything inside `children` is positioned within
 * the screen (which is `position: relative`, black, clipped with rounded
 * corners). Sizes scale from `width`, so a 290px frame is ~600px tall.
 */
export default function PhoneFrame({
  width = 290,
  children,
  className = "",
  style,
  time = "13:43",
  nowPlaying = true,
}: PhoneFrameProps) {
  const s = width / 290; // scale factor relative to the design size
  const height = Math.round(600 * s);
  const radius = Math.round(48 * s);
  const bezel = Math.round(10 * s);

  return (
    <div
      className={`relative select-none ${className}`}
      style={{
        width,
        height,
        borderRadius: radius,
        background: "#141416",
        padding: bezel,
        boxShadow:
          "inset 0 0 0 1px rgba(255,255,255,0.14), inset 0 0 0 3px #0a0a0b, 0 40px 80px -30px rgba(0,0,0,0.85)",
        ...style,
      }}
      aria-hidden="true"
    >
      {/* Side buttons */}
      <span style={{ position: "absolute", left: -2 * s, top: 112 * s, width: 2.5 * s, height: 22 * s, background: "#2c2c2e", borderRadius: "2px 0 0 2px" }} />
      <span style={{ position: "absolute", left: -2 * s, top: 152 * s, width: 2.5 * s, height: 40 * s, background: "#2c2c2e", borderRadius: "2px 0 0 2px" }} />
      <span style={{ position: "absolute", left: -2 * s, top: 202 * s, width: 2.5 * s, height: 40 * s, background: "#2c2c2e", borderRadius: "2px 0 0 2px" }} />
      <span style={{ position: "absolute", right: -2 * s, top: 170 * s, width: 2.5 * s, height: 64 * s, background: "#2c2c2e", borderRadius: "0 2px 2px 0" }} />

      {/* Screen */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          borderRadius: radius - bezel,
          background: "#000",
          overflow: "hidden",
          fontSize: 14 * s,
        }}
      >
        {/* Status bar */}
        <div
          style={{
            position: "absolute",
            top: 15 * s,
            left: 24 * s,
            fontSize: 14 * s,
            fontWeight: 600,
            letterSpacing: "-0.01em",
            color: "#fff",
            lineHeight: 1,
          }}
        >
          {time}
        </div>
        <div style={{ position: "absolute", top: 15 * s, right: 22 * s, display: "flex", alignItems: "center", gap: 5 * s }}>
          {/* Signal */}
          <svg width={16 * s} height={11 * s} viewBox="0 0 16 11" fill="#fff">
            <rect x="0" y="7" width="3" height="4" rx="0.7" />
            <rect x="4.3" y="5" width="3" height="6" rx="0.7" />
            <rect x="8.6" y="2.5" width="3" height="8.5" rx="0.7" />
            <rect x="12.9" y="0" width="3" height="11" rx="0.7" />
          </svg>
          {/* Wi-Fi */}
          <svg width={15 * s} height={11 * s} viewBox="0 0 15 11" fill="#fff">
            <path d="M7.5 10.6a1.3 1.3 0 1 1 0-2.6 1.3 1.3 0 0 1 0 2.6Zm-2.9-3.1a4.2 4.2 0 0 1 5.8 0l-1 1a2.8 2.8 0 0 0-3.8 0l-1-1Zm-2.3-2.3a7.4 7.4 0 0 1 10.4 0l-1 1a6 6 0 0 0-8.4 0l-1-1ZM0 2.9a10.6 10.6 0 0 1 15 0l-1 1a9.2 9.2 0 0 0-13 0l-1-1Z" />
          </svg>
          {/* Battery */}
          <svg width={25 * s} height={12 * s} viewBox="0 0 25 12">
            <rect x="0.5" y="0.5" width="21" height="11" rx="3" fill="none" stroke="rgba(255,255,255,0.45)" />
            <rect x="2" y="2" width="12" height="8" rx="1.5" fill="#fff" />
            <rect x="22.5" y="4" width="1.8" height="4" rx="0.9" fill="rgba(255,255,255,0.45)" />
          </svg>
        </div>

        {/* Dynamic Island */}
        <div
          style={{
            position: "absolute",
            top: 10 * s,
            left: "50%",
            transform: "translateX(-50%)",
            width: 100 * s,
            height: 29 * s,
            borderRadius: 999,
            background: "#000",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.07)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: `0 ${9 * s}px`,
          }}
        >
          {/* Album thumb */}
          <span
            style={{
              width: 15 * s,
              height: 15 * s,
              borderRadius: 4 * s,
              background: "linear-gradient(135deg, #5b5b60, #2c2c2e)",
              opacity: nowPlaying ? 1 : 0,
            }}
          />
          {/* Waveform */}
          <span style={{ display: "flex", alignItems: "center", gap: 2 * s, height: 12 * s, opacity: nowPlaying ? 1 : 0 }}>
            {[0.9, 0.6, 1, 0.5].map((h, i) => (
              <span
                key={i}
                className="motion-loop"
                style={{
                  display: "block",
                  width: 2 * s,
                  height: 12 * s * h,
                  borderRadius: 1,
                  background: "rgba(255,255,255,0.85)",
                  transformOrigin: "center",
                  animation: `waveform ${0.9 + i * 0.17}s ease-in-out infinite`,
                  animationDelay: `${-i * 0.23}s`,
                }}
              />
            ))}
          </span>
        </div>

        {children}

        {/* Home indicator */}
        <div
          style={{
            position: "absolute",
            bottom: 8 * s,
            left: "50%",
            transform: "translateX(-50%)",
            width: 110 * s,
            height: 4 * s,
            borderRadius: 999,
            background: "rgba(255,255,255,0.4)",
          }}
        />
      </div>
    </div>
  );
}
