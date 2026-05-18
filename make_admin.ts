import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Replace this with the email you used to sign up
  const emailToPromote = "admin@navi.com";

  try {
    const user = await prisma.user.findUnique({
      where: { email: emailToPromote },
    });

    if (!user) {
      console.error(`❌ User with email ${emailToPromote} not found.`);
      console.log("Please sign up through the /sign-up page first!");
      process.exit(1);
    }

    const updatedUser = await prisma.user.update({
      where: { email: emailToPromote },
      data: { role: "ADMIN" },
    });

    console.log(`✅ Success! ${updatedUser.email} is now an ADMIN.`);
    console.log("You can now log in and access the /super-admin/dashboard");
  } catch (error) {
    console.error("❌ Error promoting user:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();