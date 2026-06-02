import { prisma } from "@/lib/prisma";
import { seedUserData } from "@/lib/user-seed";

async function main() {
  console.log("Starting seed...");

  const user = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      email: "demo@example.com",
      name: "Demo User",
      image: "https://via.placeholder.com/150",
    },
  });

  await seedUserData(user.id);

  console.log("Seed completed.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
