import { getSSGProxy } from "@/lib/ssg-helper";
import { api } from "@/utils/api";
import type { GetServerSidePropsContext } from "next";
import Link from "next/link";

const ChallengeList = () => {
  const { data: subjectList } = api.subject.getAll.useQuery();
  return (
    <div className="flex flex-1 items-center justify-center">
      {subjectList?.map((subject) => (
        <Link key={subject.id} href={`/admin/challenge/${subject.slug}`} className="text-3xl cursor-pointer">
          {subject.name}
        </Link>
      ))}
    </div>
  );
};

export default ChallengeList;
export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const ssg = await getSSGProxy(ctx);
  await ssg.subject.getAll.prefetch();
  return {
    props: {
      trpcState: ssg.dehydrate(),
    },
  };
};
