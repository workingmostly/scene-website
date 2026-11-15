import Image from "next/image";
import JoinBetaButton from "./JoinBetaButton";

function PhoneShot({
  src,
  alt,
  width = 210,
}: {
  src: string;
  alt: string;
  width?: number;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      style={{ width, height: "auto", display: "block", flexShrink: 0 }}
      draggable={false}
    />
  );
}

export default function Hero() {
  return (
    <section className="px-3 pt-24 sm:px-4 sm:pt-4">
      <div className="relative overflow-hidden rounded-card bg-scene-surface">
        {/* Warm glow behind the phones */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 45% 55% at 78% 55%, rgba(255,211,0,0.10) 0%, rgba(255,255,255,0.03) 45%, transparent 75%)",
          }}
        />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 pt-12 pb-14 sm:px-10 sm:pt-32 lg:grid-cols-[1.2fr_1fr] lg:gap-4 lg:pt-36 lg:pb-16">
          {/* ── Copy ── */}
          <div className="text-center lg:text-left">
            <h1 className="display text-[clamp(2.9rem,6.6vw,5.25rem)] text-white">
              The home of{" "}
              <span className="text-white/60">live music.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-[34rem] text-lg leading-relaxed text-scene-muted sm:text-xl lg:mx-0">
              The shared calendar for all of your gigs. Import or scan tickets
              automatically, collect stubs and review shows.
            </p>

            <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
              <JoinBetaButton
                arrow
                heroCta
                className="btn btn-primary h-14 px-8 text-[17px]"
              />
              <span className="inline-flex items-center gap-2 text-sm text-scene-muted">
                <Image
                  src="/testflight.png"
                  alt=""
                  width={20}
                  height={20}
                  className="rounded-[5px]"
                />
                Available on TestFlight
              </span>
            </div>
          </div>

          {/* ── Two staggered phones (desktop) ── */}
          <div className="relative hidden lg:block" style={{ height: 560 }}>
            <div
              style={{
                position: "absolute",
                top: 40,
                left: 0,
                transform: "rotate(-7deg)",
                zIndex: 0,
                opacity: 0.7,
              }}
            >
              <PhoneShot src="/screenshots/profile.png" alt="Scene — gig passport" width={230} />
            </div>
            <div
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                transform: "rotate(3deg)",
                zIndex: 1,
                filter: "drop-shadow(0 30px 50px rgba(0,0,0,0.6))",
              }}
            >
              <PhoneShot src="/screenshots/home.png" alt="Scene — my gigs" width={260} />
            </div>
          </div>

          {/* ── Mobile / tablet: two phones side by side ── */}
          <div className="relative flex items-end justify-center lg:hidden">
            <div style={{ transform: "rotate(-6deg)", zIndex: 0, opacity: 0.7, marginRight: -24 }}>
              <PhoneShot src="/screenshots/profile.png" alt="Scene — gig passport" width={150} />
            </div>
            <div
              style={{
                transform: "rotate(3deg)",
                zIndex: 1,
                filter: "drop-shadow(0 24px 40px rgba(0,0,0,0.6))",
              }}
            >
              <PhoneShot src="/screenshots/home.png" alt="Scene — my gigs" width={170} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
