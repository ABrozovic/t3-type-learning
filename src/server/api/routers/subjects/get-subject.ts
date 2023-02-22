import type { PrismaClient } from "@prisma/client";

export const getSubject = async ({
  slug,
  prisma,
}: {
  slug: string;
  prisma: PrismaClient;
}) => {
  return await prisma.subject.findFirst({
    where: { slug },
    include: { challenges: { include: { restrictions: true } } },
  });
};
