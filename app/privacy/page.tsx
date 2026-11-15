import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy — Scene",
  description: "How Scene handles your data.",
};

export default function PrivacyPage() {
  return (
    <>
      <Nav />
      <main className="min-h-screen px-3 pt-28 sm:px-4 sm:pt-32">
        <div className="rounded-card bg-scene-surface px-6 py-14 sm:px-10 sm:py-20">
          <div className="mx-auto max-w-2xl">
            <p className="eyebrow text-scene-accent">Privacy</p>
            <h1 className="display mt-4 text-[clamp(2.4rem,5vw,3.5rem)] text-white">
              Privacy Policy
            </h1>
            <p className="mt-4 text-sm text-scene-muted">Last updated: February 2026</p>

            {/* TODO: Replace this placeholder with a real privacy policy before launch.
                Recommended resource: https://termly.io or consult a legal professional.
                Key areas to cover: data collection, storage, third-party services (Supabase),
                user rights (GDPR / UK GDPR), contact details. */}
            <div className="mt-10 space-y-4 rounded-card-sm bg-scene-surface-2 p-8 text-[15px] leading-relaxed text-scene-muted ring-1 ring-white/5">
              <p className="text-base font-semibold text-white">🚧 Coming soon</p>
              <p>
                This page is a placeholder. A full privacy policy will be published
                here before Scene launches publicly.
              </p>
              <p>
                Scene is a Bristol-based project. We take privacy seriously and will
                comply fully with UK GDPR. If you have any questions in the
                meantime, please contact us at{" "}
                <a
                  href="mailto:hello@ourscene.uk"
                  className="text-white underline underline-offset-4 hover:opacity-70 transition-opacity"
                >
                  hello@ourscene.uk
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
