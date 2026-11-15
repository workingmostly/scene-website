"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { QRCodeSVG } from "qrcode.react";

const TESTFLIGHT_URL = "https://testflight.apple.com/join/jKXRVhSz";

function isMobileDevice() {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod|Android|Mobile/i.test(navigator.userAgent);
}

interface JoinBetaButtonProps {
  className?: string;
  /** Show a trailing arrow, as on the hero CTA. */
  arrow?: boolean;
  /** Marks this as a primary page CTA so the floating nav can hide its own
   *  button while this one is on screen. */
  heroCta?: boolean;
}

export default function JoinBetaButton({
  className,
  arrow = false,
  heroCta = false,
}: JoinBetaButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    setMobile(isMobileDevice());
  }, []);

  const handleClick = useCallback(() => {
    if (mobile) {
      window.open(TESTFLIGHT_URL, "_blank", "noopener,noreferrer");
    } else {
      setShowModal(true);
    }
  }, [mobile]);

  const closeModal = useCallback(() => setShowModal(false), []);

  useEffect(() => {
    if (!showModal) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeModal();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showModal, closeModal]);

  return (
    <>
      <button
        onClick={handleClick}
        className={className}
        type="button"
        data-hero-cta={heroCta ? "" : undefined}
      >
        Join the beta
        {arrow && (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M3 8h10M9 4l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      {showModal && createPortal(
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          onClick={closeModal}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* Card */}
          <div
            className="relative z-10 flex flex-col items-center gap-5 rounded-[28px] p-7 max-w-xs w-full bg-scene-surface-2 ring-1 ring-white/10 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.8)]"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Join the Scene beta"
          >
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center text-scene-muted hover:text-white bg-white/5 ring-1 ring-white/10 transition-colors"
              aria-label="Close"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>

            {/* QR code */}
            <div className="rounded-2xl p-3 mt-2 bg-white">
              <QRCodeSVG
                value={TESTFLIGHT_URL}
                size={160}
                bgColor="#ffffff"
                fgColor="#000000"
                level="M"
              />
            </div>

            <p className="text-white text-sm font-medium text-center leading-relaxed">
              Scan the QR code to sign up,<br />or visit{" "}
              <a
                href="/beta"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:opacity-70 transition-opacity"
              >
                ourscene.uk/beta
              </a>
              .
            </p>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
