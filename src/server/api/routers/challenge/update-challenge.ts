import type { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { challengeSchema, restrictionSchema } from "./create-challenge";

export const updateChallengeSchema = challengeSchema.partial().extend({
  id: z.string(),
  restrictions: z
    .array(restrictionSchema.omit({ challengeId: true }))
    .optional(),
});
export type UpdateChallenge = z.infer<typeof updateChallengeSchema>;
export type Restriction = z.infer<typeof restrictionSchema>;
export const updateChallenge = ({
  input,
  prisma,
}: {
  input: UpdateChallenge;
  prisma: PrismaClient;
}) => {
  const { restrictions, ...data } = input;
  return prisma.challenge.update({
    where: {
      id: input.id,
    },
    data: {
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
