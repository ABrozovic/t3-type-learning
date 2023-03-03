import { idSchema, slugSchema } from "@/components/common/schema/query";
import { createTRPCRouter, publicProcedure } from "../../trpc";
import { createChallenge, createChallengeSchema } from "./create-challenge";
import { updateChallenge, updateChallengeSchema } from "./update-challenge";

export const challengeRouter = createTRPCRouter({
  create: publicProcedure
    .input(createChallengeSchema)
    .mutation(async ({ input, ctx }) => {
      return await createChallenge({ input, prisma: ctx.prisma });
    }),
  update: publicProcedure
    .input(updateChallengeSchema)
    .mutation(async ({ input, ctx }) => {
      return await updateChallenge({ input, prisma: ctx.prisma });
    }),
  get: publicProcedure.input(idSchema).query(async ({ input, ctx }) => {
    return await ctx.prisma.challenge.findFirst({
      where: {
        id: input.id,
      },
      include: {
        Subject: true,
      },
    });
  }),
  getAll: publicProcedure.input(slugSchema).query(async ({ input, ctx }) => {
    return await ctx.prisma.challenge.findMany({
      where: {
        Subject: {
          slug: input.slug,
        },
      },
    });
  }),
});
