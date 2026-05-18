const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const emailAddon = await prisma.addon.findFirst({ where: { name: { contains: "Email Builder" } } });
  if (emailAddon) {
    // We can't easily change PK in prisma, but we can recreate or just leave it. Since I updated the UI, let's just make sure Angpao tracking is there.
    const angpaoExists = await prisma.addon.findFirst({ where: { name: { contains: "Angpao" } } });
    if (!angpaoExists) {
      await prisma.addon.create({
        data: {
          id: "angpao_tracking",
          name: "Angpao & Gift Tracking",
          description: "Enable logging of angpaos and gifts during check-in",
          tokenCost: 5
        }
      });
    }
  }
}
main().catch(console.error).finally(() => prisma.$disconnect())
