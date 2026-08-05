import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("medi1234", 10);

  await prisma.user.upsert({
    where: { email: "demo@medi.app" },
    update: {},
    create: { email: "demo@medi.app", name: "Demo Mê Đi", passwordHash: password },
  });
  await prisma.user.upsert({
    where: { email: "ban@medi.app" },
    update: {},
    create: { email: "ban@medi.app", name: "Bạn Đồng Hành", passwordHash: password },
  });
  console.log("Seeded demo users:");
  console.log("  demo@medi.app / medi1234");
  console.log("  ban@medi.app  / medi1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
