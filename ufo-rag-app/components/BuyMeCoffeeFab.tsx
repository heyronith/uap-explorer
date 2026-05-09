"use client";

import { BUY_ME_A_COFFEE_URL } from "@/lib/site";
import { CoffeeIcon } from "@/components/CoffeeIcon";

export function BuyMeCoffeeFab() {
  return (
    <a
      href={BUY_ME_A_COFFEE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 right-4 z-[80] flex h-12 w-12 items-center justify-center rounded-full bg-[#ffdd00] text-[#0f0f0f] shadow-lg shadow-black/40 ring-2 ring-black/10 transition hover:scale-105 hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 focus:ring-offset-[#09090f] sm:bottom-6 sm:right-6"
      title="Buy me a coffee"
      aria-label="Buy me a coffee (opens in new tab)"
    >
      <CoffeeIcon className="h-6 w-6" />
    </a>
  );
}
