import Image from "next/image";
import dynamic from "next/dynamic";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import FeatureGrid from "@/components/FeatureGrid";
import Ticker from "@/components/Ticker";
import Footer from "@/components/Footer";
import JoinBetaButton from "@/components/JoinBetaButton";
import Barcode from "@/components/kit/Barcode";
import CtaObject from "@/components/mock/CtaObject";

const BristolMap = dynamic(() => import("@/components/BristolMap"), { ssr: false });

export default function HomePage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Ticker />
        <FeatureGrid />

        {/* ── Final download CTA: the stub you keep ── */}
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
                  "linear-gradient(to bottom, #121214 0%, rgba(18,18,20,0.85) 38%, rgba(18,18,20,0.45) 70%, rgba(18,18,20,0.25) 100%)",
              }}
            />

            {/* Tear line: two notches bitten out of the card edges and a perforation between them */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-[84px] sm:top-[96px]" style={{ zIndex: 2 }}>
              <span className="absolute -left-[18px] -top-[18px] size-9 rounded-full bg-black" />
              <span className="absolute -right-[18px] -top-[18px] size-9 rounded-full bg-black" />
              <span
                className="absolute left-[26px] right-[26px] top-0 h-px"
                style={{
                  background:
                    "repeating-linear-gradient(90deg, rgba(255,255,255,0.16) 0 4px, transparent 4px 9px)",
                }}
              />
            </div>

            {/* Stub header: quiet, like the print on a ticket */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 flex h-[84px] items-center justify-between px-8 sm:h-[96px] sm:px-11"
              style={{ zIndex: 2 }}
            >
              <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#3a3a3c]">Admit one</span>
              <span className="flex flex-col items-end gap-1 text-[#3a3a3c]">
                <Barcode width={120} height={22} color="currentColor" opacity={0.9} />
                <span className="font-mono text-[9px] tracking-[0.12em]">Nº 0001</span>
              </span>
            </div>

            <div className="relative flex flex-col items-center px-6 pb-0 pt-32 text-center sm:pt-44" style={{ zIndex: 2 }}>
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

              <CtaObject />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
