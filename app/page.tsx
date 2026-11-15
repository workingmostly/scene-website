import Image from "next/image";
import dynamic from "next/dynamic";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import FeatureGrid from "@/components/FeatureGrid";
import Ticker from "@/components/Ticker";
import Footer from "@/components/Footer";
import JoinBetaButton from "@/components/JoinBetaButton";

const BristolMap = dynamic(() => import("@/components/BristolMap"), { ssr: false });

function Phone({
  src,
  alt,
  width,
  rotate = 0,
}: {
  src: string;
  alt: string;
  width: number;
  rotate?: number;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      draggable={false}
      style={{
        width,
        height: "auto",
        display: "block",
        transform: rotate ? `rotate(${rotate}deg)` : undefined,
        filter: "drop-shadow(0 30px 50px rgba(0,0,0,0.7))",
      }}
    />
  );
}

export default function HomePage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Ticker />
        <FeatureGrid />

        {/* ── Final download CTA ── */}
        <section className="px-3 pt-28 sm:px-4 sm:pt-40">
          <div className="reveal relative overflow-hidden rounded-card bg-scene-surface ring-1 ring-white/5">
            <BristolMap />
            {/* Fade the map out towards the top so the copy stays legible */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                zIndex: 1,
                background:
                  "linear-gradient(to bottom, #121214 0%, rgba(18,18,20,0.75) 45%, rgba(18,18,20,0.35) 100%)",
              }}
            />

            <div className="relative flex flex-col items-center px-6 pt-16 text-center sm:pt-24" style={{ zIndex: 2 }}>
              <span className="flex size-20 items-center justify-center rounded-[22px] bg-scene-surface-2 ring-1 ring-white/10 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.8)]">
                <Image src="/scene-logo.svg" alt="" width={38} height={42} />
              </span>

              <h2 className="display mt-8 text-[clamp(2.6rem,6.4vw,4.75rem)] text-white">
                Download free.
              </h2>
              <p className="mx-auto mt-6 max-w-lg text-lg text-white/60 sm:text-xl">
                Available now on TestFlight for iOS.
              </p>

              <JoinBetaButton
                heroCta
                className="btn btn-primary mt-9 h-14 px-8 text-[17px]"
              />

              {/* Three phones fanned out and cropped at the bottom edge */}
              <div
                className="relative mt-14 flex w-full items-start justify-center sm:mt-20"
                style={{ height: 470, overflow: "hidden" }}
                aria-hidden="true"
              >
                <div className="relative" style={{ width: 760, maxWidth: "140vw" }}>
                  <div className="absolute left-1/2" style={{ top: 60, marginLeft: -340, transform: "rotate(-8deg)", opacity: 0.85 }}>
                    <Phone src="/screenshots/profile.png" alt="" width={230} />
                  </div>
                  <div className="absolute left-1/2" style={{ top: 60, marginLeft: 110, transform: "rotate(8deg)", opacity: 0.85 }}>
                    <Phone src="/screenshots/add-gig.png" alt="" width={230} />
                  </div>
                  <div className="absolute left-1/2" style={{ top: 0, marginLeft: -135, zIndex: 1 }}>
                    <Phone src="/screenshots/home.png" alt="" width={270} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
