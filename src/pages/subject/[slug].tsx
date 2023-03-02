import ConfettiWrapper from "@/components/common/confetti/confetty-wrapper";
import useSlug from "@/components/common/hooks/use-slug";
import Pagination from "@/components/common/pagination/pagination";
import type { RangeRestriction } from "@/components/monaco-wrapper";
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
import { useRef, useState } from "react";

type MonacoRef = {
  getWidth: () => number;
  getHeight: () => number;
  setText: (text: string | undefined) => void;
  getText: () => string;
  updateConstraints: (restrictions: RangeRestriction[]) => void;
  setReadOnly: (value: boolean) => void;
} | null;
type SubjectProps = Required<
  InferGetServerSidePropsType<typeof getServerSideProps>
>;
type tabs = "Solution" | "Problem";

export default function Subject({ page, skip, take, slug }: SubjectProps) {
  const { addQuery } = useSlug(getSubjectSchema);
  const subject = useSubject({ skip, take, slug, page });
  const monacoRef = useRef<MonacoRef>(null);
  const [currentTab, setCurrentTab] = useState<tabs>("Problem");

  if (!subject) return null;

  const handleValidate = (errors: number) => {
    if (errors > 0) return;
    if (subject.isChallengeStatus("UNSOLVED") && currentTab === "Problem") {
      subject.updateChallenge("CHEERING", getText());
    }
  };
  const handlePageChange = async (page: number) => {
    if (currentTab === "Problem") {
      subject.updateChallenge(undefined, getText());
    } else {
      handleTabChange("Problem");
    }
    if (!subject.isChallengeStatus("UNSOLVED")) {
      subject.updateChallenge("SOLVED", getText());
    } else {
      subject.updateChallenge(undefined, getText());
    }
    await addQuery("page", `${page}`);
    await subject.setCurrentChallengeIndex(page);
    monacoRef.current?.setText(subject.data?.challenges[page]?.problem);
    monacoRef.current?.updateConstraints(
      subject.data?.challenges[page]?.restrictions.map((r) => ({
        label: r.label,
        allowMultiline: r.allowMultiline,
        range: [r.initialRow, r.initialColumn, r.finalRow, r.finalColumn],
      })) as RangeRestriction[]
    );
  };

  const handleTabChange = (tab: tabs) => {
    if (currentTab === tab) return;
    if (tab === "Solution") {
      subject.updateChallenge(undefined, getText());
      monacoRef.current?.setText(subject.currentChallenge?.solution);
      monacoRef.current?.setReadOnly(true);
    }
    if (tab === "Problem") {
      monacoRef.current?.setText(subject.currentChallenge?.problem);
      monacoRef.current?.setReadOnly(false);
    }
    setCurrentTab(tab);
  };

  const getText = () => {
    const text = monacoRef.current?.getText();
    if (!text) return;
    return text;
  };

  return (
    <div className="flex h-full w-full flex-1 flex-col justify-start  bg-slate-300 px-2 text-center  font-extrabold leading-none tracking-tight md:p-8">
      <h1 className="inline-block py-3 text-4xl text-gray-800 underline [text-shadow:_0_3px_0_rgb(0_0_0_/_15%)] md:text-5xl lg:text-6xl">
        {subject.data.name}
      </h1>
      <div className="flex flex-1 justify-center md:items-center">
        <div
          className={clsx(
            `relative h-full w-full max-w-screen-xl rounded-xl px-7 pb-4 transition-all duration-300`,
            {
              "animate-border bg-gradient-to-tr from-neutral-800 to-slate-800 bg-[length:400%_400%]":
                subject.isChallengeStatus("GREEN"),
              "bg-slate-800": subject.isChallengeStatus("SOLVED"),
              "bg-neutral-800": !subject.isChallengeStatus("SOLVED"),
            }
          )}
        >
          <div className="flex h-9 justify-end gap-1">
            <button
              onClick={() => handleTabChange("Problem")}
              className={clsx(
                `text-md relative inline-flex min-w-[1.5rem]  cursor-pointer items-center justify-center  border-b-2 px-4  font-medium transition-all duration-200`,
                {
                  "border-lime-500 pt-4  text-lime-600":
                    currentTab === "Problem",
                  " border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-300":
                    currentTab !== "Problem",
                }
              )}
            >
              Problem
            </button>
            <button
              onClick={() => handleTabChange("Solution")}
              className={clsx(
                `text-md relative inline-flex min-w-[1.5rem]  cursor-pointer items-center justify-center border-b-2 px-4 pb-2 font-medium transition-all duration-200`,
                {
                  "border-lime-500 pt-4 text-lime-600":
                    currentTab === "Solution",
                  " border-transparent pt-2 text-gray-500  hover:border-gray-300 hover:text-gray-300":
                    currentTab !== "Solution",
                }
              )}
            >
              Solution
            </button>
          </div>
          <MonacoWrapper
            ref={monacoRef}
            defaultValue={subject.currentChallenge?.problem}
            restrictions={subject?.mapRestrictions()}
            onValidate={handleValidate}
          >
            {subject.isChallengeStatus("CHEERING") && (
              <ConfettiWrapper
                height={monacoRef.current?.getHeight()}
                width={monacoRef.current?.getWidth()}
                onConfettiComplete={() =>
                  subject.updateChallenge("GREEN", getText())
                }
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
