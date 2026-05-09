"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { BUY_ME_A_COFFEE_URL, OFFICIAL_UFO_RELEASE_URL } from "@/lib/site";
import { CoffeeIcon } from "@/components/CoffeeIcon";

const STORAGE_KEY = "uap-explorer-disclaimer-dismissed";

export function DisclaimerModal() {
  const id = useId();
  const titleId = `${id}-title`;
  const descId = `${id}-desc`;
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  /** Avoid SSR/hydration mismatch; read session only after mount */
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      setOpen(sessionStorage.getItem(STORAGE_KEY) !== "1");
    } catch {
      setOpen(true);
    }
  }, []);

  const dismiss = useCallback(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        dismiss();
        return;
      }

      if (e.key !== "Tab") return;
      const root = dialogRef.current;
      if (!root) return;

      const focusable = root.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (e.shiftKey) {
        if (!active || active === first || !root.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else if (!active || active === last || !root.contains(active)) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, dismiss]);

  if (!mounted || !open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center bg-black/65 p-4 backdrop-blur-sm sm:items-center"
      role="presentation"
      onClick={dismiss}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        ref={dialogRef}
        className="relative w-full max-w-lg cursor-default rounded-2xl border border-violet-500/25 bg-[#12121a] p-6 shadow-2xl shadow-violet-950/40 sm:max-w-xl sm:rounded-[1.25rem] sm:p-8"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <h2 id={titleId} className="font-sans text-xl font-bold text-slate-100 sm:text-2xl">
          Hey Explorer
        </h2>
        <div
          id={descId}
          className="mt-4 space-y-3 text-[16px] leading-relaxed text-slate-300 sm:mt-5 sm:space-y-4 sm:text-[17px]"
        >
          <p>
            I created this space for those of us who look at the sky and wonder what’s really out there. 
            This interface is a portal into the official records, designed to make it easy for all of us 
            to explore the data for ourselves.
          </p>
          <p>
            Just a quick heads-up: while this system is powerful and accurate most time, it can occasionally 
            hallucinate facts. Always treat the answers as a guide and cross-reference with the 
            actual documents cited in the chat—they are the ultimate source of truth.
          </p>
          <p className="pt-2 font-medium text-violet-400">
            Stay curious.
          </p>
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <a
            href={BUY_ME_A_COFFEE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#ffdd00] px-5 py-3 font-sans text-[15px] font-bold text-[#0f0f0f] shadow-md transition hover:brightness-105 sm:text-base"
            onClick={(e) => e.stopPropagation()}
          >
            <img src="/brand/kofi-bean.gif" alt="" className="h-6 w-6 object-contain" />
            Buy me a coffee
          </a>
          <button
            ref={closeRef}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              dismiss();
            }}
            className="rounded-xl border border-violet-500/35 bg-violet-950/50 px-5 py-3 font-sans text-[15px] font-semibold text-violet-200 transition hover:bg-violet-900/60 sm:text-base"
          >
            Got it, let me in
          </button>
        </div>
      </div>
    </div>
  );
}
