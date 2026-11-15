"use client";

import { useRef } from "react";
import BristolMap from "@/components/BristolMap";
import { useInViewOnce } from "@/lib/motion";

/**
 * Mounts the Bristol map behind the final card and switches its venue pins
 * on once the card has scrolled into view. Fills the card at z-index 0.
 */
export default function CtaMap() {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInViewOnce(ref, 0.3);
  return (
    <div ref={ref} className="absolute inset-0" style={{ zIndex: 0 }} aria-hidden="true">
      <BristolMap active={seen} cornerMark={false} />
    </div>
  );
}
