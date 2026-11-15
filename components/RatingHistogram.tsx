import type { SceneStats } from "@/lib/types";

type Distribution = NonNullable<SceneStats["ratingDistribution"]>;
type Star = 1 | 2 | 3 | 4 | 5;

interface RatingHistogramProps {
  distribution: Distribution;
  /**
   * Mockup mode: each bar is a full-height inner div scaled with
   * `transform: scaleY()` from the bottom, and its count sits absolutely
   * above it, so a changing distribution animates on transform and opacity
   * only and nothing reflows. The transitions switch off under
   * prefers-reduced-motion.
   */
  animate?: boolean;
  /** Column to pick out: its ★ label turns white. */
  highlight?: Star;
  /** Replaces the surface classes (default: the profile page's card). */
  className?: string;
}

const STARS = [1, 2, 3, 4, 5] as const;
const AREA_H = 56; // height of the bar area
const COUNT_H = 10; // the count's line box (text-[10px] leading-none)
const COUNT_GAP = 4; // gap-1 between the count and its bar
const TRACK_H = AREA_H - COUNT_H - COUNT_GAP; // the room a bar can fill

const DEFAULT_SURFACE = "bg-scene-surface border border-scene-border rounded-2xl p-3 mb-3";

export default function RatingHistogram({
  distribution,
  animate = false,
  highlight,
  className = DEFAULT_SURFACE,
}: RatingHistogramProps) {
  const stars = STARS;
  const maxCount = Math.max(...stars.map((s) => distribution[s]), 1);

  return (
    <div className={className}>
      <div className="flex items-end gap-1.5" style={{ height: AREA_H }}>
        {stars.map((star) => {
          const count = distribution[star];
          const barHeightPct = count > 0 ? Math.max((count / maxCount) * 100, 8) : 0;

          if (animate) {
            // Same geometry as the static branch (count, 4px gap, bar in the
            // remaining 42px), expressed as transforms.
            const barPx = (barHeightPct / 100) * TRACK_H;
            return (
              <div key={star} className="relative flex-1 h-full">
                <div
                  className="absolute inset-0 rounded-sm bg-white origin-bottom transition-transform duration-[450ms] ease-[var(--ease-out)] motion-reduce:transition-none"
                  style={{ transform: `scaleY(${barPx / AREA_H})` }}
                />
                <span
                  className="absolute inset-x-0 bottom-0 text-center text-white text-[10px] font-semibold leading-none transition-[transform,opacity] duration-[450ms,320ms] ease-[var(--ease-out)] motion-reduce:transition-none"
                  style={{
                    transform: `translateY(${-(barPx + COUNT_GAP)}px)`,
                    opacity: count > 0 ? 1 : 0,
                  }}
                  aria-hidden={count === 0 || undefined}
                >
                  {count}
                </span>
              </div>
            );
          }

          return (
            <div key={star} className="flex-1 flex flex-col items-center justify-end gap-1 h-full">
              {count > 0 && (
                <span className="text-white text-[10px] font-semibold leading-none">
                  {count}
                </span>
              )}
              <div className="w-full flex items-end" style={{ flex: 1 }}>
                {count > 0 ? (
                  <div
                    className="w-full rounded-sm bg-white"
                    style={{ height: `${barHeightPct}%` }}
                  />
                ) : (
                  <div className="w-full" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Star labels */}
      <div className="flex gap-1.5 mt-1.5">
        {stars.map((star) => (
          <div key={star} className="flex-1 text-center">
            <span
              className={`${star === highlight ? "text-white" : "text-scene-muted"} text-[10px]${
                animate ? " transition-colors duration-[160ms] motion-reduce:transition-none" : ""
              }`}
            >
              ★{star}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
