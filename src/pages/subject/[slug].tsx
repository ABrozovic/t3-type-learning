import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import clsx from "clsx";
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { useEffect, useRef, useState } from "react";
import superjson from "superjson";
import ConfettiWrapper from "../../components/common/confetty-wrapper";
import useSlug from "../../components/common/hooks/use-slug";
import MonacoWrapper from "../../components/monaco-wrapper";
import Pagination from "../../components/pagination/pagination";
import { useSubject } from "../../components/subject/hooks/use-subject";
import { appRouter } from "../../server/api/root";
import { getSubjectSchema } from "../../server/api/routers/subjects/get-subject";
import { createTRPCContext } from "../../server/api/trpc";
import { handleVoidPromise } from "../../utils/handle-void-promises";
import { getIndexBatch } from "../../utils/pagination-helper";

type MonacoRef = {
  getWidth: () => number;
  getHeight: () => number;
} | null;
export default function Subject({
  page = 1,
  skip = 0,
  take = 5,
  slug = "",
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { addQuery } = useSlug(getSubjectSchema);
  const subject = useSubject({ skip, take, slug, page });
  const monacoRef = useRef<MonacoRef>(null);
  const [text, setText] = useState(subject?.currentChallenge?.problem);
  useEffect(
    () =>
      setText(
        subject?.data.challenges[subject?.currentChallengeIndex || 0]?.problem
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [subject?.currentChallengeIndex]
  );
  if (!subject) return null;

  const handleValidate = (errors: number) => {
    if (errors > 0) return;
    if (subject.currentChallenge?.status === "UNSOLVED") {
      subject.updateStatus("CHEERING");
    }
  };
  const handlePageChange = async (page: number) => {
    if (subject.currentChallenge?.status !== "UNSOLVED") {
      subject.updateStatus("SOLVED");
    }
    await addQuery("page", `${page}`);
    await subject.setCurrentChallengeIndex(page);
  };

  return (
    <div className="h-full w-full bg-slate-300 p-24 ">
      <p>{subject.currentChallenge?.status}</p>
      <div className="mx-auto max-w-screen-xl">
        <div
          className={clsx(
            `relative rounded-xl p-7 transition-all duration-300`,
            {
              "animate-border bg-gradient-to-tr from-neutral-800  to-slate-800 bg-[length:400%_400%]":
                subject.currentChallenge?.status === "GREEN",
              "bg-slate-800": subject.currentChallenge?.status === "SOLVED",
              "bg-neutral-800": subject.currentChallenge?.status !== "SOLVED",
            }
          )}
        >
          <MonacoWrapper
            ref={monacoRef}
            value={text}
            onTextChanged={(text) =>
              setTimeout(() => subject.updateText(text), 200)
            }
            onValidate={handleValidate}
          >
            {subject.currentChallenge?.status === "CHEERING" && (
              <ConfettiWrapper
                height={monacoRef.current?.getHeight()}
                width={monacoRef.current?.getWidth()}
                onConfettiComplete={() => subject.updateStatus("GREEN")}
              />
            )}

            <Pagination
              defaultPage={
                subject.currentChallengeIndex === 0
                  ? 1
                  : subject.currentChallengeIndex
              }
              numberOfPages={subject.data._count.challenges}
              onPageChange={handleVoidPromise(handlePageChange)}
            />
          </MonacoWrapper>
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const query = ctx.query;
  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: await createTRPCContext(ctx),
    transformer: superjson,
  });
  const data = getSubjectSchema.safeParse(query);
  if (!data.success) return { props: {} };

  const { slug = "", take = 5, page = 1 } = data.data;

  const skip = getIndexBatch(page, take) * take;

  await ssg.subject.get.prefetch({
    slug: slug,
    skip: `${skip}`,
    take: `${take}`,
  });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      slug,
      page,
      take,
      skip,
    },
  };
};
