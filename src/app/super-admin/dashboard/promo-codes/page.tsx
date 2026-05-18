import { prisma } from "@/lib/prisma";
import PromoCodesClient from "./PromoCodesClient";

export default async function PromoCodesPage() {
  const codes = await prisma.promoCode.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-5xl">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-[#0c123b] dark:text-[#e8eeff] uppercase tracking-tight mb-2">
          Promo & Referral Codes
        </h1>
        <p className="text-[#3c58a7] dark:text-[#b3c2ff] text-sm">
          Manage promo codes, their rewards, limits, and expiry dates.
        </p>
      </header>

      <PromoCodesClient initialCodes={codes} />
    </div>
  );
}