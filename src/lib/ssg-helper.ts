import { appRouter } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";
import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import type { GetServerSidePropsContext } from "next";
import superjson from "superjson";

export const getSSGProxy = async (ctx: GetServerSidePropsContext) =>
  createProxySSGHelpers({
    router: appRouter,
    ctx: await createTRPCContext(ctx),
    transformer: superjson,
  });
