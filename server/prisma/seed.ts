import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@demo.local";
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: Role.ADMIN, name: "Demo Admin" },
    create: { email: adminEmail, role: Role.ADMIN, name: "Demo Admin" }
  });

  const staffEmail = "staff@demo.local";
  await prisma.user.upsert({
    where: { email: staffEmail },
    update: { role: Role.STAFF, name: "Demo Staff" },
    create: { email: staffEmail, role: Role.STAFF, name: "Demo Staff" }
  });

  const memberEmail = "member@demo.local";
  await prisma.user.upsert({
    where: { email: memberEmail },
    update: { role: Role.MEMBER, name: "Demo Member" },
    create: { email: memberEmail, role: Role.MEMBER, name: "Demo Member" }
  });

  const existingBooks = await prisma.book.count();
  if (existingBooks === 0) {
    await prisma.book.createMany({
      data: [
        {
          title: "The Hobbit",
          author: "J.R.R. Tolkien",
          publishedYear: 1937,
          language: "English",
          tags: "fantasy,classic"
        },
        {
          title: "Clean Code",
          author: "Robert C. Martin",
          publishedYear: 2008,
          language: "English",
          tags: "software,engineering,best-practices"
        },
        {
          title: "Pride and Prejudice",
          author: "Jane Austen",
          publishedYear: 1813,
          language: "English",
          tags: "classic,romance"
        }
      ]
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });

