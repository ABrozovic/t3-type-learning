import type { PrismaClient } from "@prisma/client";
import { z } from "zod";

export const subjectSchema = z.object({
  slug: z.string().min(1, {
    message: "Slug is required",
  }),
  name: z.string().min(1, {
    message: "Name is required",
  }),
});
export type CreateSubject = z.infer<typeof subjectSchema>;
export const createSubject = async ({
  input,
  prisma,
}: {
  input: CreateSubject;
  prisma: PrismaClient;
}) => {
  return await prisma.subject.create({
    data: {
      slug: input.slug,
      name: input.name,
    },
  });
};
