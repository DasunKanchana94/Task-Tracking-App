import bcrypt from "bcryptjs";

import { prisma } from "../src/lib/prisma";

async function main() {
  const email = "demo@flowline.app";
  const passwordHash = await bcrypt.hash("Password123", 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: "Demo User",
      passwordHash,
      timezone: "UTC",
    },
  });

  console.warn(`Seeded demo user: ${user.email}`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
