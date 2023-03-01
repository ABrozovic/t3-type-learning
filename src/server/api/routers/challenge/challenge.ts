import { createTRPCRouter, publicProcedure } from "../../trpc";
import { createChallenge, createChallengeSchema } from "./create-challenge";

export const challengeRouter = createTRPCRouter({
  create: publicProcedure
    .input(createChallengeSchema)
    .mutation(async ({ input, ctx }) => {
      return await createChallenge({ input, prisma: ctx.prisma });
    }),
});
