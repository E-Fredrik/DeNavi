const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Add-ons...");

  const addons = [
    {
      id: "angpao_tracking",
      name: "Angpao & Gift Tracker",
      description: "Lacak hadiah fisik dan angpao yang diterima tamu, termasuk integrasi pencatatan otomatis di buku tamu.",
      tokenCost: 2,
    },
    {
      id: "custom_email",
      name: "Custom Email Builder",
      description: "Buat email undangan yang dapat dikustomisasi (HTML) dan gunakan SMTP Anda sendiri untuk mengirim email konfirmasi.",
      tokenCost: 3,
    },
    {
      id: "advanced_seating",
      name: "Venue Builder & Seating",
      description: "Buat denah lokasi acara dan kelola tempat duduk (assigned seating atau self-select) layaknya bioskop.",
      tokenCost: 5,
    },
    {
      id: "whatsapp_blast",
      name: "WhatsApp Blast",
      description: "Kirim pesan broadcast WhatsApp ke tamu yang belum RSVP atau untuk mengirimkan pengingat H-1.",
      tokenCost: 4,
    },
    {
      id: "custom_domain",
      name: "Custom Domain & Branding",
      description: "Gunakan nama domain khusus untuk halaman RSVP dan hapus watermark branding 'Powered by Navi'.",
      tokenCost: 10,
    }
  ];

  for (const addon of addons) {
    await prisma.addon.upsert({
      where: { id: addon.id },
      update: {
        name: addon.name,
        description: addon.description,
        tokenCost: addon.tokenCost,
      },
      create: addon,
    });
  }

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
