"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";

import type { ReservationResult } from "@/lib/registry/types";

const COPY_RESET_MS = 2000;

function XLogo() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function ReservationSuccess({
  reservation,
}: {
  reservation: ReservationResult;
}) {
  const [copied, setCopied] = useState(false);
  const { username, url } = reservation;

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), COPY_RESET_MS);
    return () => clearTimeout(timer);
  }, [copied]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(`https://${url}`);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  const shareUrl = `https://twitter.com/intent/tweet?${new URLSearchParams({
    text: `I claimed @${username} on Stroop — my identity on Stellar.`,
    url: `https://${url}`,
  })}`;

  return (
    <div className="flex flex-col items-center">
      <h1 className="headline">@{username} is yours.</h1>

      <p className="mt-5 max-w-[44ch] text-balance text-[0.9375rem] leading-relaxed text-ink-dim sm:text-base">
        Your Stroop ID is reserved. It stays held for you until Stroop opens on
        Stellar.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
        <button type="button" onClick={handleCopy} className="ghost-button">
          {copied ? (
            <Check className="h-3.5 w-3.5 text-stellar" aria-hidden="true" />
          ) : (
            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          <span className="font-mono text-[0.8125rem] tracking-tight">
            {url}
          </span>
          <span className="sr-only">
            {copied ? "Link copied" : "Copy your Stroop ID link"}
          </span>
        </button>

        <a
          href={shareUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="ghost-button"
        >
          <XLogo />
          Share
        </a>
      </div>

      <p aria-live="polite" className="sr-only">
        {copied ? "Link copied to clipboard" : ""}
      </p>
    </div>
  );
}
