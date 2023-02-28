import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import superjson from "superjson";
import useSlug from "../../components/common/hooks/use-slug";
import MonacoWrapper from "../../components/monaco-wrapper";
import { useSubject } from "../../components/subject/hooks/use-subject";
import { appRouter } from "../../server/api/root";
import { getSubjectSchema } from "../../server/api/routers/subjects/get-subject";
import { createTRPCContext } from "../../server/api/trpc";
import { handleVoidPromise } from "../../utils/handle-void-promises";
type SubjectQuery = {
  slug: string;
  skip: string;
  take: string;
  page: string;
};

const Subject = ({
  defaultPage = 1,
  defaultSkip = 0,
  defaultTake = 20,
  slug = "",
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { isReady, addQuery } = useSlug(getSubjectSchema);

  const {
    challengeData,
    data,
    fetchChallenge,
    updateStatus,
    updateText,
    setCurrentChallenge,
    currentChallenge,
  } = useSubject({
    skip: defaultSkip,
    take: defaultTake,
    slug,
    defaultPage,
  });

  if (!isReady || !data) return null;

  const handlePageChange = async (page: number) => {
    await addQuery("page", `${page}`);
    await fetchChallenge(page);
    setCurrentChallenge(page);
  };
  const handleValidate = (errors: number) => {
    if (errors > 0 || !data) return;
    const { challengeToUpdate } = challengeData();
    if (challengeToUpdate?.status === "UNSOLVED") {
      updateStatus("CHEERING");
    }
  };

  const handleConfetiComplete = () => {
    updateStatus("GREEN");
  };

  const handleTextUpdate = (text: string) => {
    updateText(text);
  };

  return (
    <>
      <MonacoWrapper
        key={currentChallenge}
        onTextChanged={handleTextUpdate}
        onValidate={handleValidate}
        subject={data}
        currentChallenge={currentChallenge}
        onPageChanged={handleVoidPromise(handlePageChange)}
        onConfettiComplete={handleConfetiComplete}
      />
      <p>{data.challenges[0]?.status}</p>
    </>
  );
};
export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const query = ctx.query as unknown as SubjectQuery;
  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: await createTRPCContext(ctx),
    transformer: superjson,
  });
  const data = getSubjectSchema.safeParse(query);
  if (!data.success) return { props: {} };

  const { slug = "", skip = 0, take = 5, page = 1 } = data.data;
  const defaultTake = take > page ? take : page;
  await ssg.subject.get.prefetch({
    slug: slug,
    skip: `${skip}`,
    take: `${defaultTake}`,
  });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      slug,
      defaultPage: page,
      defaultTake: defaultTake,
      defaultSkip: skip,
    },
  };
};

export default Subject;
