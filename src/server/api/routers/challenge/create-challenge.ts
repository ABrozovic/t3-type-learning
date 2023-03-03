import type { PrismaClient } from "@prisma/client";
import { z } from "zod";

export const challengeSchema = z.object({
  subjectId: z
    .string({ required_error: "Subject is Required" })
    .min(1, { message: "Subject is Required" }),
  name: z.string().min(1, { message: "Name is Required" }),
  problem: z.string().min(1, { message: "Problem is Required" }),
  solution: z.string().min(1, { message: "Solution is Required" }),
});

export const restrictionSchema = z.object({
  label: z.string(),
  allowMultiline: z.boolean().default(false),
  initialRow: z.number(),
  initialColumn: z.number(),
  finalRow: z.number(),
  finalColumn: z.number(),
  challengeId: z.string(),
});
export const createChallengeSchema = challengeSchema.extend({
  restrictions: z
    .array(restrictionSchema.omit({ challengeId: true }))
    .optional(),
});
export type CreateChallenge = z.infer<typeof createChallengeSchema>;
export type Restriction = z.infer<typeof restrictionSchema>;
export const createChallenge = ({
  input,
  prisma,
}: {
  input: CreateChallenge;
  prisma: PrismaClient;
}) => {
  const { restrictions, ...data } = input;
  return prisma.challenge.create({
    data: {
      Subject: {
        connect: {
          id: data.subjectId,
        },
      },
      name: data.name,
      problem: data.problem,
      solution: data.solution,
      restrictions: {
        createMany: {
          data: restrictions?.map(({ ...restriction }) => restriction) ?? [],
        },
      },
    },
  });
};
