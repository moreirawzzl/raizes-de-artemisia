import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "gui9451aa@gmail.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "12345678";

  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await prisma.user.create({
      data: {
        username: "admin",
        email: adminEmail,
        passwordHash,
        hasPassword: true,
        provider: "credentials",
        role: "ADMIN"
      }
    });
    console.log(`✅ Admin criado: ${adminEmail}`);
  } else {
    console.log("Admin já existe, pulando criação.");
  }

  const categoryNames = ["Banhos de Ervas", "Sabonetes", "Óleos", "Incensos"];
  for (const name of categoryNames) {
    const slug = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-");
    await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { name, slug }
    });
  }

  console.log("✅ Seed finalizado.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
