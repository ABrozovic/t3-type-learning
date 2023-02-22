import { useState } from "react";
import { api } from "../utils/api";

export default function Rainbow() {
  const [hovered, setHovered] = useState(false);
  const test = api.subject.test.useInfiniteQuery({ slug: "basic-types" });

  return (
    <div
      className={`inline-block h-64 w-64 bg-slate-900 from-slate-900 via-slate-800 to-green-500 bg-[length:600%_600%] p-0.5 transition-all duration-300 hover:animate-border hover:bg-gradient-to-tr`}
      onMouseEnter={() => {
        setHovered(true);
        console.log("shoudl rainbow");
      }}
    >
      zzz
    </div>
  );
}
