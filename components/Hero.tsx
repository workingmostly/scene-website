import Image from "next/image";
import JoinBetaButton from "./JoinBetaButton";
import HeroDemo from "./mock/HeroDemo";

export default function Hero() {
  return (
    <section className="px-3 pt-24 sm:px-4 sm:pt-4">
      <div className="relative overflow-hidden rounded-card bg-scene-surface">
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 pt-12 pb-12 sm:px-10 sm:pt-32 lg:grid-cols-[1.1fr_1fr] lg:gap-10 lg:pt-36 lg:pb-14">
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

          {/* ── The demo: a ticket you flick into the app ── */}
          <div className="mx-auto w-full max-w-[520px] lg:mx-0 lg:justify-self-end">
            <HeroDemo />
          </div>
        </div>
      </div>
    </section>
  );
}
