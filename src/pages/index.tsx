import type { NextPage } from "next";
import Link from "next/link";

const Home: NextPage = () => {
  return (
    <div className="flex flex-1 items-center justify-center">
      <Link
        href="/subject/utility-types?page=1"
        className="cursor-pointer text-3xl"
      >
        Utility Types
      </Link>
    </div>
  );
};

export default Home;
