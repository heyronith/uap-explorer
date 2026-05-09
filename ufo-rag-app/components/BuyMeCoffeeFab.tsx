"use client";

import { BUY_ME_A_COFFEE_URL } from "@/lib/site";
import { CoffeeIcon } from "@/components/CoffeeIcon";
import { motion } from "framer-motion";

export function BuyMeCoffeeFab() {
  return (
    <motion.a
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      href={BUY_ME_A_COFFEE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-[100] flex h-14 w-14 items-center justify-center rounded-full bg-[#ffdd00] shadow-lg shadow-black/40 transition hover:brightness-110 sm:h-16 sm:w-16 overflow-hidden"
      aria-label="Buy me a coffee"
    >
      <img 
        src="/brand/kofi-bean.gif" 
        alt="Support on Ko-fi" 
        className="h-10 w-10 object-contain sm:h-12 sm:w-12" 
      />
    </motion.a>
  );
}
