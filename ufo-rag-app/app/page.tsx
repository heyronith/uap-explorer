import { ArchiveChat } from "@/components/ArchiveChat";
import { BuyMeCoffeeFab } from "@/components/BuyMeCoffeeFab";
import { DisclaimerModal } from "@/components/DisclaimerModal";

export default function Home() {
  return (
    <>
      <DisclaimerModal />
      <ArchiveChat />
      <BuyMeCoffeeFab />
    </>
  );
}
