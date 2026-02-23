import { PrismaClient, BookStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const bookCount = await prisma.book.count();
  if (bookCount > 0) return;

  await prisma.book.createMany({
    data: [
      {
        title: "The Pragmatic Programmer",
        author: "Andrew Hunt, David Thomas",
        year: 1999,
        tags: "software,programming",
        description: "Classic advice on pragmatic software development.",
        status: BookStatus.AVAILABLE
      },
      {
        title: "Clean Code",
        author: "Robert C. Martin",
        year: 2008,
        tags: "software,programming",
        description: "A handbook of agile software craftsmanship.",
        status: BookStatus.AVAILABLE
      }
    ]
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
