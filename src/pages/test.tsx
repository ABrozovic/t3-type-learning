import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { useEffect, useRef, useState } from "react";
import superjson from "superjson";
import ConfettiWrapper from "../components/common/confetty-wrapper";
import MonacoWrapper from "../components/monaco-wrapper";
import { useSubject } from "../components/subject/hooks/use-subject";
import { appRouter } from "../server/api/root";
import { createTRPCContext } from "../server/api/trpc";
type MonacoRef = {
  getWidth: () => number;
  getHeight: () => number;
} | null;
export default function Subject({
  page = 1,
  skip = 0,
  take = 20,
  slug = "",
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const subject = useSubject({
    skip,
    take,
    slug,
    page,
  });
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

  return (
    <div>
      <div>
        <MonacoWrapper
          ref={monacoRef}
          value={text}
          onTextChanged={(text) => {
            setTimeout(() => subject?.updateText(text), 200);
            console.log(subject?.currentChallengeIndex);
          }}
        >
          <ConfettiWrapper
            height={monacoRef.current?.getHeight()}
            width={monacoRef.current?.getWidth()}
          />
        </MonacoWrapper>
      </div>
      <div className="flex flex-col space-y-3">
        <button onClick={() => subject?.updateText("pen")}>set</button>
        <button
          onClick={() => subject?.setCurrentChallengeIndex((old) => old + 1)}
        >
          up
        </button>
        <button
          onClick={() => subject?.setCurrentChallengeIndex((old) => old - 1)}
        >
          down
        </button>
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
  // const data = getSubjectSchema.safeParse(query);
  // if (!data.success) return { props: {} };

  const {
    slug = "basic-types",
    skip = 0,
    take: defaultTake = 5,
    page = 1,
  } = {};
  const take = defaultTake > page ? defaultTake : page;
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
