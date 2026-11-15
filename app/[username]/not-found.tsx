import Image from "next/image";
import Link from "next/link";

export default function ProfileNotFound() {
  return (
    <div className="min-h-screen bg-scene-bg px-3 py-3 sm:px-4 sm:py-4">
      <div className="flex min-h-[calc(100vh-2rem)] flex-col items-center justify-center rounded-card bg-scene-surface px-6 text-center">
        <div className="max-w-sm">
          <span className="mx-auto flex size-16 items-center justify-center rounded-[18px] bg-scene-surface-2 ring-1 ring-white/10">
            <Image src="/scene-logo.svg" alt="Scene" width={30} height={34} />
          </span>

          <h1 className="display mt-8 text-3xl text-white">Profile not found</h1>
          <p className="mt-4 text-[15px] leading-relaxed text-scene-muted">
            We couldn&apos;t find that profile. The username might be wrong, or
            the account may no longer exist.
          </p>

          <Link href="/" className="btn btn-ghost mt-8 h-12 px-6 text-[15px]">
            ← Back to Scene
          </Link>
        </div>
      </div>
    </div>
  );
}
