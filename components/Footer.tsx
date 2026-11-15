import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 py-12 text-sm text-scene-muted sm:flex-row">
      <div className="flex items-center gap-3">
        <span className="flex size-7 items-center justify-center rounded-[7px] bg-scene-surface-2 ring-1 ring-white/10">
          <Image src="/scene-logo.svg" alt="" width={13} height={15} />
        </span>
        <span>
          © 2026 Scene, a{" "}
          <a
            href="https://mostlywork.ing"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:underline"
          >
            mostlywork.ing
          </a>{" "}
          product.
        </span>
      </div>
      <nav className="flex gap-7" aria-label="Footer">
        <Link href="/privacy" className="hover:text-white transition-colors">
          Privacy Policy
        </Link>
        <a href="mailto:hello@ourscene.uk" className="hover:text-white transition-colors">
          Contact
        </a>
        <a
          href="/beta"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-white transition-colors"
        >
          TestFlight
        </a>
      </nav>
    </footer>
  );
}
