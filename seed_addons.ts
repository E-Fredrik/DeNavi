import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.addon.createMany({
    data: [
      { id: "custom_email", name: "Custom Email Template", description: "Design your own check-in email invitation", tokenCost: 2 },
      { id: "premium_qr", name: "Premium QR Design", description: "Sleek, customizable QR code with logo", tokenCost: 1 },
      { id: "angpao_tracking", name: "Angpao Tracker", description: "Live tracking of gift money and presents", tokenCost: 1 },
    ],
    skipDuplicates: true,
  });
  console.log("Addons seeded");
}

main().catch(console.error).finally(() => prisma.$disconnect());
