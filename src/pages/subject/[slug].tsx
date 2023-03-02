import ConfettiWrapper from "@/components/common/confetti/confetty-wrapper";
import useSlug from "@/components/common/hooks/use-slug";
import Pagination from "@/components/common/pagination/pagination";
import MonacoWrapper from "@/components/monaco-wrapper";
import { useSubject } from "@/components/subject/hooks/use-subject";
import { getSSGProxy } from "@/lib/ssg-helper";
import { getSubjectSchema } from "@/server/api/routers/subject/get-subject";
import { handleVoidPromise } from "@/utils/handle-void-promises";
import { getIndexBatch } from "@/utils/pagination-helper";
import clsx from "clsx";
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { useEffect, useRef, useState } from "react";

type MonacoRef = {
  getWidth: () => number;
  getHeight: () => number;
} | null;
type SubjectProps = Required<
  InferGetServerSidePropsType<typeof getServerSideProps>
>;

export default function Subject({ page, skip, take, slug }: SubjectProps) {
  const { addQuery } = useSlug(getSubjectSchema);
  const subject = useSubject({ skip, take, slug, page });
  const monacoRef = useRef<MonacoRef>(null);
  const [text, setText] = useState(subject?.currentChallenge?.problem);

  useEffect(
    () => {
      setText(
        subject?.data.challenges[subject?.currentChallengeIndex || 0]?.problem
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [subject?.currentChallengeIndex]
  );
  if (!subject) return null;

  const handleValidate = (errors: number) => {
    if (errors > 0) return;
    if (subject.isChallengeStatus("UNSOLVED")) {
      subject.updateStatus("CHEERING");
    }
  };
  const handlePageChange = async (page: number) => {
    if (!subject.isChallengeStatus("UNSOLVED")) {
      subject.updateStatus("SOLVED");
    }
    await addQuery("page", `${page}`);
    await subject.setCurrentChallengeIndex(page);
  };

  return (
    <div className="flex h-full w-full flex-1 flex-col justify-start  bg-slate-300 px-2 text-center  font-extrabold leading-none tracking-tight md:p-8">
      <h1 className="inline-block py-3 text-4xl text-gray-800 underline [text-shadow:_0_3px_0_rgb(0_0_0_/_15%)] md:text-5xl lg:text-6xl">
        {subject.data.name} + {subject?.currentChallenge?.status}
      </h1>
      <div className="flex flex-1 justify-center md:items-center">
        <div
          className={clsx(
            `relative h-full w-full max-w-screen-xl rounded-xl p-7 transition-all duration-300`,
            {
              "animate-border bg-gradient-to-tr from-neutral-800 to-slate-800 bg-[length:400%_400%]":
                subject.isChallengeStatus("GREEN"),
              "bg-slate-800": subject.isChallengeStatus("SOLVED"),
              "bg-neutral-800": !subject.isChallengeStatus("SOLVED"),
            }
          )}
        >
          <MonacoWrapper
            ref={monacoRef}
            value={text}
            restrictions={subject?.mapRestrictions()}
            onTextChanged={(text) =>
              setTimeout(() => subject.updateText(text), 200)
            }
            onValidate={handleValidate}
          >
            {subject.isChallengeStatus("CHEERING") && (
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
              numberOfPages={subject.data._count.challenges + 1}
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
  const ssg = await getSSGProxy(ctx);
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
