"use client";

import JoinBetaButton from "./JoinBetaButton";

interface AppStoreButtonProps {
  className?: string;
}

/** Secondary (ghost) "Join the beta" button. */
export default function AppStoreButton({ className = "" }: AppStoreButtonProps) {
  return (
    <JoinBetaButton className={`btn btn-ghost h-12 px-6 text-[15px] ${className}`} />
  );
}
