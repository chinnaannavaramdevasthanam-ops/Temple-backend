const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@temple.com";

  // ✅ ENSURE SINGLE ADMIN
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        name: "Temple Admin",
        phone: "9441013499",
        email: adminEmail,
        password: await bcrypt.hash("Suresh@944101", 10),
        role: "ADMIN"
      }
    });
    console.log("✅ Admin created");
  } else {
    console.log("ℹ️ Admin already exists");
  }

  // ✅ SEED SEVAS ONCE
  const sevaCount = await prisma.seva.count();

  if (sevaCount === 0) {
    await prisma.seva.createMany({
      data: [
        {
          name: "Suprabhata Seva",
          description: "Early morning seva",
          price: 120,
          totalSlots: 50
        },
        {
          name: "Archana",
          description: "Special archana",
          price: 80,
          totalSlots: 100
        },
        {
          name: "Abhishekam",
          description: "Holy abhishekam",
          price: 150,
          totalSlots: 30
        }
      ]
    });

    console.log("✅ Sevas seeded");
  } else {
    console.log("ℹ️ Sevas already exist");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
