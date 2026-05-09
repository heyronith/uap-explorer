import { Suspense } from "react";
import { ArchiveChat } from "@/components/ArchiveChat";
import { BuyMeCoffeeFab } from "@/components/BuyMeCoffeeFab";
import { DisclaimerModal } from "@/components/DisclaimerModal";

export default function Home() {
  return (
    <>
      <DisclaimerModal />
      <Suspense fallback={<div className="h-full w-full bg-[#02040a]" />}>
        <ArchiveChat />
      </Suspense>
      <BuyMeCoffeeFab />
    </>
  );
}
