import type { NextPage } from "next";
import Link from "next/link";

const Home: NextPage = () => {
  return <Link href="/subject/basic-types?page=1">Basic Types</Link>;
};

export default Home;
