import { slugSchema } from "@/components/common/schema/query";
import { getSSGProxy } from "@/lib/ssg-helper";
import { api } from "@/utils/api";
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import Link from "next/link";

type ChallengeListProps = InferGetServerSidePropsType<
  typeof getServerSideProps
>;
const ChallengeList = ({ slug = "" }: ChallengeListProps) => {
  const { data: challengeList } = api.challenge.getAll.useQuery({ slug });
  return (
    <div>
      {challengeList?.map((challenge) => (
        <Link key={challenge.id} href={`/admin/challenge/edit/${challenge.id}`}>
          {challenge.name}
        </Link>
      ))}
    </div>
  );
};

export default ChallengeList;
export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const query = ctx.query;
  const ssg = await getSSGProxy(ctx);
  const data = slugSchema.safeParse(query);

  if (!data.success) {
    return { props: {} };
  }
  const slug = data.data.slug;
  await ssg.challenge.getAll.prefetch({ slug });
  return {
    props: {
      trpcState: ssg.dehydrate(),
      slug,
    },
  };
};
